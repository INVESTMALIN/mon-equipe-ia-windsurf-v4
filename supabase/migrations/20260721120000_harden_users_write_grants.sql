-- Bordage de la surface d'écriture cliente sur public.users (escalade de privilège).
--
-- FAILLE (prouvée par le comportement, JWT user via l'API REST) : les rôles PostgREST
-- `authenticated` et `anon` héritaient du GRANT ALL par défaut de Supabase sur
-- public.users, dont UPDATE et INSERT au NIVEAU TABLE. La seule policy RLS d'UPDATE
-- (`Users can update their own basic info`) n'a pour with_check que `auth.uid() = id`,
-- sans aucune restriction de colonne. Conséquence : n'importe quel utilisateur connecté
-- pouvait s'auto-attribuer les droits en une requête —
--   UPDATE public.users SET role = 'admin', subscription_status = 'premium' WHERE id = <soi>
-- → 1 ligne affectée, aucun refus. Avec un espace admin qui donne de vrais pouvoirs à
-- `role = 'admin'`, ce trou devient critique.
--
-- Pourquoi un REVOKE au niveau COLONNE ne suffit pas : tant que le privilège UPDATE
-- existe au niveau TABLE, il prime sur toute révocation de colonne (vérifié : l'escalade
-- passait encore après un simple REVOKE de colonnes). Il faut donc couper le privilège
-- table, puis re-donner UPDATE sur les seules colonnes légitimes.
--
-- CE QUI RESTE AUTORISÉ CÔTÉ CLIENT (vérifié, aucune régression) : les 3 seuls chemins
-- front qui écrivent dans users (EditProfileModal, Inscription, InscriptionFicheLite)
-- n'écrivent QUE `prenom` et `nom` → on les re-GRANT explicitement.
--
-- INSERT : durci aussi. L'insertion à id arbitraire est déjà bloquée par RLS
-- (with_check `auth.uid() = id`), et l'insert sur son propre id tombe sur le conflit de
-- clé primaire (la ligne existe déjà via le trigger). Reste UN résidu : le with_check ne
-- contraint pas `role`, donc si la ligne de profil d'un user était absente (ex. un
-- admin-delete-user qui supprime le profil puis échoue sur la suppression auth), ce user
-- pourrait se ré-insérer en `admin`. On révoque donc INSERT sur les colonnes sensibles.
-- L'inscription n'est PAS impactée : le trigger `handle_new_user` est SECURITY DEFINER
-- (propriétaire postgres) et pose `role`/`subscription_status` en bypassant ces grants
-- (vérifié : insert definer OK après révocation). Aucun code front n'insère dans users,
-- et le serveur écrit en service_role (bypass également).
--
-- DELETE : déjà entièrement bloqué par RLS (aucune policy DELETE sur users → refus par
-- défaut, 0 ligne pour un authenticated, sur sa ligne comme sur celle d'autrui). On n'y
-- touche pas.
--
-- Migration RESTRICTIVE : à appliquer en live UNIQUEMENT au merge, après vérification du
-- déploiement, conformément à la discipline migrations du projet.

-- 1) UPDATE : couper le privilège table, ne re-donner que prenom + nom.
revoke update on public.users from authenticated, anon;
grant  update (prenom, nom) on public.users to authenticated;

-- 2) INSERT : retirer les colonnes qui permettent de choisir droits/statut/facturation.
--    (id, email, prenom, nom, created_at restent insérables — sans intérêt d'escalade,
--     et l'insert self reste de toute façon borné par la PK + le with_check RLS.)
revoke insert (
  role,
  subscription_status,
  subscription_current_period_end,
  subscription_trial_end,
  subscription_cancel_at_period_end,
  has_used_trial,
  stripe_customer_id,
  stripe_subscription_id
) on public.users from authenticated, anon;
