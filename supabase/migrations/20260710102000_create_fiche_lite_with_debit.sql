-- Création atomique d'une fiche + débit du crédit — l'invariant du système de crédits.
--
-- INVARIANT non négociable : une fiche créée ⇔ un crédit débité. Jamais l'un sans l'autre.
-- Trois scénarios rendus impossibles :
--   1. débité sans fiche  → payé pour rien ;
--   2. fiche sans débit   → fiche gratuite ;
--   3. 1 crédit, 2 clics concurrents → 2 fiches pour 1 débit, ou solde négatif.
--
-- Le point dur est (3) : une logique « lire le solde, décider, écrire » laisse une
-- fenêtre entre lecture et écriture où deux transactions concurrentes lisent toutes deux
-- « solde = 1 » et passent. La garantie doit être posée EN BASE, pas dans le code JS.
--
-- Mécanisme :
--   - `pg_advisory_xact_lock(user_id)` : sérialise les créations concurrentes du MÊME
--     utilisateur. Le 2e appel attend que le 1er ait COMMITé (donc débité) avant de lire.
--     Verrou transactionnel → relâché automatiquement au commit/rollback. Deux users
--     différents = deux clés de verrou différentes = aucune contention entre eux.
--   - le solde est recalculé SOUS le verrou, AU MOMENT de l'écriture (jamais en amont).
--   - fiche + débit dans la MÊME transaction (la fonction) : si un morceau échoue, tout
--     est annulé en bloc. Atomicité garantie par la transaction.
--
-- Débit CONDITIONNEL au rôle `fiche_lite` : les concierges premium/trial/admin créent
-- gratuitement (aucun crédit, flux inchangé). Décidé avec Julien.
--
-- SECURITY DEFINER : la fonction écrit dans fiche_lite ET credit_ledger en bypassant la
-- RLS (credit_ledger n'a aucune policy d'écriture ; fiche_lite refuse l'INSERT direct aux
-- fiche_lite). C'est le SEUL chemin de création pour un utilisateur à crédits. Appelée
-- depuis le front avec le JWT du user → `auth.uid()` = l'utilisateur courant.

create or replace function public.create_fiche_lite_with_debit(p_nom text default 'Nouvelle fiche')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid := auth.uid();
  v_role     text;
  v_balance  integer;
  v_fiche_id uuid;
begin
  if v_user_id is null then
    raise exception 'Non authentifié' using errcode = '28000';
  end if;

  select u.role into v_role from public.users u where u.id = v_user_id;

  -- Sérialise les créations concurrentes de CE user (relâché au commit).
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  -- fiche_lite : création payante. Recalcul du solde SOUS le verrou, au moment de l'écriture.
  if v_role = 'fiche_lite' then
    select coalesce(sum(cl.amount), 0) into v_balance
    from public.credit_ledger cl
    where cl.user_id = v_user_id;

    if v_balance < 1 then
      raise exception 'Solde de crédits insuffisant' using errcode = 'P0001';
    end if;
  end if;

  -- Création de la fiche (vide, reprenable ; nom par défaut si absent).
  insert into public.fiche_lite (user_id, nom, statut)
  values (v_user_id, coalesce(nullif(btrim(p_nom), ''), 'Nouvelle fiche'), 'Brouillon')
  returning id into v_fiche_id;

  -- Débit lié à la fiche, uniquement pour les utilisateurs à crédits. L'index unique
  -- credit_ledger_one_debit_per_fiche garantit au plus un débit par fiche.
  if v_role = 'fiche_lite' then
    insert into public.credit_ledger (user_id, amount, type, fiche_id, description)
    values (v_user_id, -1, 'debit_fiche', v_fiche_id, 'Création fiche logement');
  end if;

  return v_fiche_id;
end;
$$;

-- Réservé aux utilisateurs authentifiés.
revoke all on function public.create_fiche_lite_with_debit(text) from public;
grant execute on function public.create_fiche_lite_with_debit(text) to authenticated;
