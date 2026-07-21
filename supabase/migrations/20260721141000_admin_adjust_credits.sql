-- Fonction d'ajustement manuel des crédits par un admin (ajout offert / retrait correction).
--
-- Reprend le patron éprouvé de create_fiche_lite_with_debit (advisory lock par user +
-- recalcul du solde SOUS verrou), pour que deux écritures concurrentes sur le même
-- concierge (un ajustement admin et une création de fiche) ne puissent pas se marcher
-- dessus et faire passer le solde sous zéro. Le ledger reste append-only : on n'écrit
-- qu'une nouvelle ligne, on ne mute jamais l'existant.
--
-- SECURITY DEFINER : la fonction est appelée par le endpoint serveur en service_role,
-- où auth.uid() est NULL. L'identité de l'admin (déjà vérifiée par verifyAdmin côté
-- endpoint) est passée en paramètre p_admin_id et tracée dans metadata.admin_id, avec
-- la raison (obligatoire) dans metadata.reason.
--
-- Invariants portés ici (le seul writer de ces types) :
--   - type ∈ {offert, correction} uniquement ;
--   - offert     → montant strictement POSITIF ;
--   - correction → montant strictement NÉGATIF ;
--   - raison non vide obligatoire ;
--   - cible = un concierge de rôle fiche_lite (les crédits n'ont de sens que là :
--     les deux mondes restent étanches) ;
--   - un retrait ne peut JAMAIS faire passer le solde sous zéro (refus sinon).
--
-- Retourne le nouveau solde après écriture.
--
-- Migration ADDITIVE (create or replace + nouvelle fonction). Aucun type de mouvement
-- existant ni get_credit_balance ne sont touchés.

create or replace function public.admin_adjust_credits(
  p_user_id  uuid,
  p_amount   integer,
  p_type     public.credit_movement_type,
  p_reason   text,
  p_admin_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_role text;
  v_balance     integer;
  v_new_balance integer;
begin
  if p_admin_id is null then
    raise exception 'Auteur (admin) manquant' using errcode = 'P0001';
  end if;
  if p_type not in ('offert', 'correction') then
    raise exception 'Type d''ajustement interdit : %', p_type using errcode = 'P0001';
  end if;
  if p_amount = 0 then
    raise exception 'Montant nul interdit' using errcode = 'P0001';
  end if;
  if p_type = 'offert' and p_amount <= 0 then
    raise exception 'Un ajout (offert) doit être strictement positif' using errcode = 'P0001';
  end if;
  if p_type = 'correction' and p_amount >= 0 then
    raise exception 'Un retrait (correction) doit être strictement négatif' using errcode = 'P0001';
  end if;
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'Une raison est obligatoire' using errcode = 'P0001';
  end if;

  -- Cible : uniquement un concierge fiche_lite (étanchéité des deux mondes).
  select u.role into v_target_role from public.users u where u.id = p_user_id;
  if v_target_role is null then
    raise exception 'Utilisateur introuvable' using errcode = 'P0001';
  end if;
  if v_target_role <> 'fiche_lite' then
    raise exception 'Les crédits ne concernent que les comptes fiche_lite (rôle cible : %)', v_target_role
      using errcode = 'P0001';
  end if;

  -- Sérialise avec create_fiche_lite_with_debit (même domaine de verrou).
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  select coalesce(sum(cl.amount), 0) into v_balance
  from public.credit_ledger cl
  where cl.user_id = p_user_id;

  v_new_balance := v_balance + p_amount;
  if v_new_balance < 0 then
    raise exception 'Retrait refusé : solde insuffisant (solde actuel = %, retrait demandé = %)',
      v_balance, p_amount using errcode = 'P0001';
  end if;

  insert into public.credit_ledger (user_id, amount, type, metadata, description)
  values (
    p_user_id,
    p_amount,
    p_type,
    jsonb_build_object('admin_id', p_admin_id, 'reason', btrim(p_reason)),
    case when p_type = 'offert' then 'Crédits offerts (admin)' else 'Correction de crédits (admin)' end
  );

  return v_new_balance;
end;
$$;

-- Exécutable uniquement par le service_role (endpoint admin). Pas de grant à
-- authenticated : aucun client ne doit pouvoir s'auto-créditer.
revoke all on function public.admin_adjust_credits(uuid, integer, public.credit_movement_type, text, uuid) from public, authenticated, anon;
