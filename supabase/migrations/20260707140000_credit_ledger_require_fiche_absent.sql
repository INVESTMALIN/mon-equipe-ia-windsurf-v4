-- Durcissement append-only (retour Codex) — exiger l'ABSENCE réelle de la fiche
-- pour autoriser la neutralisation de fiche_id.
--
-- La version précédente n'autorisait le UPDATE `fiche_id → NULL` que sur la FORME de
-- la ligne (fiche_id passe de non-null à null, autres colonnes inchangées). Mais la
-- RLS ne protège pas le service role, et ce trigger est justement le garde-fou censé
-- garder le ledger append-only même face à une erreur service role. Un
-- `UPDATE credit_ledger SET fiche_id = NULL WHERE id = ...` exécuté alors que la
-- fiche existe ENCORE effacerait le lien d'audit hors cascade.
--
-- Correctif : aligner le cas fiche sur le cas user. On n'autorise le UPDATE que si la
-- ligne `public.fiche_lite` référencée (OLD.fiche_id) est réellement absente — ce qui
-- n'est vrai que pendant la cascade ON DELETE SET NULL (la fiche a déjà été supprimée
-- en amont dans la même transaction). Même critère de détection que pour le DELETE
-- de la cascade utilisateur.

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

  -- tg_op = 'UPDATE' : uniquement la neutralisation de fiche_id par la cascade
  -- ON DELETE SET NULL. On exige (comme pour le DELETE user) que la fiche référencée
  -- ait RÉELLEMENT disparu, pas seulement que la forme de la ligne corresponde.
  if old.fiche_id is not null
     and new.fiche_id is null
     and not exists (select 1 from public.fiche_lite f where f.id = old.fiche_id)
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
    'credit_ledger est append-only : seule la neutralisation de fiche_id par la cascade de suppression de fiche est permise en UPDATE';
end;
$$;
