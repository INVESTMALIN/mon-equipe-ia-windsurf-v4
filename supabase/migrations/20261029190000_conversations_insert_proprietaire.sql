-- Sécurité : retrait de la politique « Allow insert for all » sur public.conversations.
--
-- Constat (29/10/2026) : cette politique (INSERT, with_check = true) permettait à
-- n'importe quel compte connecté — et même à un visiteur anonyme — d'ajouter une ligne
-- d'historique au nom de N'IMPORTE QUEL utilisateur (user_id arbitraire).
--
-- La politique « Users can access their own conversations » (ALL, auth.uid() = user_id)
-- couvre déjà tous les usages réels : chaque assistant insère avec l'id de l'utilisateur
-- connecté. Vérifié avant application : 100 % des lignes des 60 derniers jours ont un
-- user_id ; essai à blanc en transaction annulée : insertion pour soi acceptée, au nom
-- d'un autre refusée. Les écritures serveur (service_role) ne sont pas concernées.
--
-- Accord de Loïc : 29/10/2026.
--
-- RETOUR ARRIÈRE (down) :
--   create policy "Allow insert for all" on public.conversations
--     for insert to public with check (true);

drop policy if exists "Allow insert for all" on public.conversations;
