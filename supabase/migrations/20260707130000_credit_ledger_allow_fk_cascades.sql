-- Correctif append-only — laisser passer les DEUX cascades FK légitimes vers
-- credit_ledger, tout en gardant l'immutabilité sur l'argent.
--
-- Contexte : le trigger append-only de la migration précédente bloquait aussi les
-- actions référentielles automatiques de Postgres (remontée Codex sur la PR) :
--   - suppression d'une fiche → `fiche_id` ON DELETE SET NULL → un UPDATE ;
--   - suppression d'un utilisateur → `user_id` ON DELETE CASCADE → un DELETE.
-- Ces deux mutations sont légitimes et doivent passer ; tout le reste reste bloqué.
--
-- Distinction cascade légitime vs mutation illégitime (sans flag Postgres dédié) :
--
--   • DELETE : le seul DELETE admis est la cascade de suppression d'un utilisateur
--     (credit_ledger.user_id → public.users ON DELETE CASCADE, elle-même en aval de
--     auth.users → public.users ON DELETE CASCADE). Quand la cascade supprime la
--     ligne de crédit, la ligne `public.users` du propriétaire a DÉJÀ été supprimée
--     en amont dans la même transaction : son absence signe la cascade. Un DELETE
--     direct alors que l'utilisateur existe encore est illégitime → bloqué.
--
--   • UPDATE : le seul UPDATE admis est la neutralisation de la référence de fiche
--     (fiche_id → fiche_lite ON DELETE SET NULL). On exige que SEULE `fiche_id`
--     passe de non-null à null, toutes les autres colonnes strictement identiques.
--     Toute autre modification (montant, type, user_id, metadata, …) → bloquée.

create or replace function public.credit_ledger_prevent_mutation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    -- Cascade de suppression d'utilisateur : la ligne public.users n'existe plus.
    if not exists (select 1 from public.users u where u.id = old.user_id) then
      return old;
    end if;
    raise exception
      'credit_ledger est append-only : DELETE direct interdit (utilisez une ligne compensatoire)';
  end if;

  -- tg_op = 'UPDATE' : uniquement la neutralisation de fiche_id, rien d'autre.
  if old.fiche_id is not null
     and new.fiche_id is null
     and new.id          =  old.id
     and new.user_id     =  old.user_id
     and new.amount      =  old.amount
     and new.type        =  old.type
     and new.metadata    is not distinct from old.metadata
     and new.description is not distinct from old.description
     and new.created_at  =  old.created_at
  then
    return new;
  end if;

  raise exception
    'credit_ledger est append-only : seule la neutralisation de fiche_id (fiche supprimée) est permise en UPDATE';
end;
$$;
