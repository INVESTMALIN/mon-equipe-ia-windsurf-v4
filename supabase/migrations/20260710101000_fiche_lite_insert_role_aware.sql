-- Anti-fiche-gratuite pour les utilisateurs à crédits — INSERT de fiche_lite role-aware.
--
-- Contexte : aujourd'hui une fiche est créée par un INSERT direct depuis le front
-- (auto-save du wizard). Pour un utilisateur `fiche_lite`, la création DOIT passer par
-- la fonction atomique `create_fiche_lite_with_debit()` (qui débite 1 crédit dans la même
-- transaction). Si on laissait l'INSERT direct ouvert, un `fiche_lite` pourrait créer une
-- fiche gratuite en tapant /fiche à la main puis en éditant (l'auto-save insérerait sans
-- débit). On ferme ce contournement EN BASE.
--
-- On rend donc la policy INSERT role-aware :
--   - `fiche_lite`         → INSERT direct REFUSÉ (passe forcément par la RPC, qui est
--                            SECURITY DEFINER et bypasse la RLS pour écrire la fiche + le débit) ;
--   - tout autre rôle      → INSERT direct AUTORISÉ comme avant (concierges premium/trial/
--                            admin : flux de création inchangé, création gratuite).
--
-- `is distinct from 'fiche_lite'` : un rôle absent (null) est traité comme non-fiche_lite
-- → autorisé, comportement permissif identique à l'existant pour tout le monde sauf Lite.

drop policy if exists fiche_lite_insert_policy on public.fiche_lite;

create policy fiche_lite_insert_policy on public.fiche_lite
  for insert
  with check (
    auth.uid() = user_id
    and (select u.role from public.users u where u.id = auth.uid()) is distinct from 'fiche_lite'
  );
