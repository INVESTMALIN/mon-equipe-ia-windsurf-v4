-- Verrouillage anti-recyclage des fiches — Fiche Logement Lite.
--
-- Contexte : un user `fiche_lite` achète 1 crédit, crée UNE fiche, génère UN PDF
-- (le débit se fait à la création, cf. create_fiche_lite_with_debit — INDÉPENDANT de
-- ce chantier). Rien ne l'empêchait ensuite de rééditer la MÊME fiche (changer le
-- propriétaire + l'adresse), régénérer un PDF, et obtenir un 2e PDF sur un AUTRE bien
-- sans redépenser un crédit. On ferme ce trou : après la 1re génération de PDF, les
-- champs qui IDENTIFIENT le bien (propriétaire, adresse, nature physique) sont figés.
-- Les détails opérationnels (email, tél, capacité, checklists…) restent modifiables.
--
-- Le verrou suit la FICHE (flag `fields_locked`), pas le rôle du user : une fiche
-- verrouillée le reste même si le user passe premium (un PDF a été émis avec ces
-- valeurs, elles engagent). Les fiches premium ne sont jamais verrouillées (leur flux
-- ne pose jamais le flag) → régression zéro côté premium.
--
-- Choix RLS vs trigger : la policy UPDATE de fiche_lite est
--   USING (auth.uid() = user_id)  (sans WITH CHECK).
-- RLS ne peut PAS comparer OLD vs NEW sur des sous-clés JSONB (WITH CHECK ne voit que
-- NEW). Un TRIGGER BEFORE UPDATE, lui, a OLD et NEW → c'est le seul outil pour figer
-- CERTAINES sous-clés sans figer toute la section. D'où le choix du trigger.
--
-- Migration : la colonne est ADDITIVE (default false → aucun rétroactif, aucune fiche
-- existante verrouillée). Le trigger est inerte tant qu'aucune fiche n'a fields_locked
-- = true (donc sans effet sur le front actuel), il faut néanmoins l'appliquer AVANT le
-- déploiement du front qui pose/lit le flag. Tout est idempotent (ré-appliquable).

-- 1) Flag de verrouillage. -----------------------------------------------------------
alter table public.fiche_lite
  add column if not exists fields_locked boolean not null default false;

comment on column public.fiche_lite.fields_locked is
  'true = identité du bien figée après la 1re génération de PDF (parcours fiche_lite). '
  'Le trigger trg_fiche_lite_enforce_lock rejette toute modif des sous-champs d''identité '
  'tant que true. Déverrouillage manuel admin : UPDATE ... SET fields_locked=false en '
  'service_role (bypass du trigger).';

-- 2) Projection des SEULES sous-clés verrouillées. -----------------------------------
-- Identité du propriétaire + adresse du bien + nature physique du logement. Comparer
-- cette projection OLD vs NEW permet de bloquer UNIQUEMENT ces champs, en laissant le
-- reste de section_proprietaire / section_logement librement modifiable.
create or replace function public.fiche_lite_locked_projection(prop jsonb, log jsonb)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    -- Section 1 — Propriétaire
    'prenom',     prop->>'prenom',
    'nom',        prop->>'nom',
    'adr_rue',    prop->'adresse'->>'rue',
    'adr_comp',   prop->'adresse'->>'complement',
    'adr_ville',  prop->'adresse'->>'ville',
    'adr_cp',     prop->'adresse'->>'codePostal',
    -- Section 2 — Logement (nature physique)
    'type',       log->>'type_propriete',
    'type_autre', log->>'type_autre_precision',
    'surface',    log->>'surface',
    'typologie',  log->>'typologie',
    'niveau',     log->>'maison_niveau',
    -- Section 2 conditionnels — Appartement
    'app_res',    log->'appartement'->>'nom_residence',
    'app_bat',    log->'appartement'->>'batiment',
    'app_etage',  log->'appartement'->>'etage',
    'app_porte',  log->'appartement'->>'numero_porte',
    -- Section 2 conditionnels — Studio
    'stu_res',    log->'studio'->>'nom_residence',
    'stu_bat',    log->'studio'->>'batiment',
    'stu_etage',  log->'studio'->>'etage',
    'stu_porte',  log->'studio'->>'numero_porte'
  );
$$;

-- 3) Trigger d'application du verrou. ------------------------------------------------
create or replace function public.fiche_lite_enforce_lock()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- On n'applique le verrou qu'aux utilisateurs de l'app (JWT role 'authenticated').
  -- service_role (serveur, admin) et SQL direct / superuser (Studio, migrations) ont
  -- auth.role() != 'authenticated' → bypass : l'admin peut toujours déverrouiller la
  -- fiche ou corriger n'importe quel champ.
  if coalesce(auth.role(), '') <> 'authenticated' then
    return new;
  end if;

  -- Fiche non verrouillée — y compris l'UPDATE qui POSE le verrou (OLD.fields_locked
  -- encore false) : aucune restriction.
  if coalesce(old.fields_locked, false) = false then
    return new;
  end if;

  -- Fiche verrouillée : les sous-clés d'identité du bien ne doivent pas changer. Les
  -- autres champs (email, tél, capacité, checklists…) restent libres.
  if public.fiche_lite_locked_projection(new.section_proprietaire, new.section_logement)
     is distinct from
     public.fiche_lite_locked_projection(old.section_proprietaire, old.section_logement)
  then
    raise exception
      'Fiche verrouillée : les informations qui identifient le bien ne peuvent plus être modifiées après génération du PDF.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_fiche_lite_enforce_lock on public.fiche_lite;
create trigger trg_fiche_lite_enforce_lock
  before update on public.fiche_lite
  for each row
  execute function public.fiche_lite_enforce_lock();
