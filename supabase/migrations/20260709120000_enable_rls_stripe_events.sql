-- Fermer la table d'idempotence du webhook Stripe (retour sécurité avant l'achat de crédits).
--
-- `public.stripe_events` avait la Row Level Security DÉSACTIVÉE : Supabase la remontait
-- en UNRESTRICTED, donc n'importe qui muni de la clé anon (publique par nature, embarquée
-- dans le bundle front) pouvait lire son contenu — identifiants d'événements et données de
-- facturation Stripe. Aucune raison qu'elle soit lisible côté front.
--
-- On active la RLS SANS créer la moindre policy : c'est volontaire. Zéro policy = zéro accès
-- pour les rôles anon/authenticated. Le webhook Stripe écrit en service_role, qui bypasse la
-- RLS, donc son fonctionnement est inchangé (aucune modification côté code webhook).

alter table public.stripe_events enable row level security;
