-- Durcissement du verrou anti-recyclage : interdire l'auto-déverrouillage.
--
-- Faille (Codex P1) dans la 1re version du trigger (migration 20260713170000) : il ne
-- comparait que la PROJECTION des champs d'identité. Un user `authenticated` (owner)
-- pouvait donc contourner le verrou en DEUX requêtes via l'API :
--   1) UPDATE fiche_lite SET fields_locked = false      (projection inchangée → accepté)
--   2) UPDATE fiche_lite SET section_logement = ...      (fiche « non verrouillée » → accepté)
-- Le verrou était trivialement annulable.
--
-- Correctif : le trigger REJETTE désormais toute tentative d'un user `authenticated` de
-- repasser fields_locked de true à false. Seul le service_role (admin / Supabase Studio,
-- bypassé en tête de fonction) peut déverrouiller. Migration ADDITIVE : on remplace la
-- fonction du trigger (CREATE OR REPLACE) ; la 1re migration n'est PAS modifiée, et le
-- trigger lui-même (qui référence la fonction par son nom) n'a pas besoin d'être recréé.
--
-- Rappel : aucun chemin front ne passe fields_locked à false (mapFormDataToSupabase /
-- saveFiche ne l'écrivent pas ; lockFiche ne le met qu'à true). Ce correctif ferme la
-- porte EN BASE, indépendamment du front, comme il se doit pour une garantie de sécurité.

create or replace function public.fiche_lite_enforce_lock()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  -- service_role (serveur, admin) et SQL direct / superuser (Studio, migrations) :
  -- auth.role() != 'authenticated' → bypass total (l'admin peut déverrouiller / corriger).
  if coalesce(auth.role(), '') <> 'authenticated' then
    return new;
  end if;

  -- DÉVERROUILLAGE INTERDIT aux utilisateurs : seul l'admin (bypassé ci-dessus) peut
  -- repasser fields_locked à false. Sans ce garde, un owner déverrouillerait puis
  -- modifierait l'identité en 2 requêtes (cf. faille ci-dessus).
  if coalesce(old.fields_locked, false) = true and coalesce(new.fields_locked, false) = false then
    raise exception
      'Fiche verrouillée : le déverrouillage est réservé à l''administration.'
      using errcode = 'P0001';
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
$fn$;
