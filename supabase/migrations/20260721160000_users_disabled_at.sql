-- Désactivation d'un compte (soft) — colonne d'affichage pour l'espace admin.
--
-- Le blocage de l'accès se fait côté Supabase Auth (ban : banned_until dans auth.users),
-- qui rejette le login ET le refresh de token. Nuance : le token d'accès DÉJÀ émis est
-- stateless et reste valide jusqu'à son expiration (non révocable instantanément) — le
-- front (ProtectedRoute) lit disabled_at pour fermer l'accès UI immédiatement pendant
-- cette fenêtre résiduelle. Cette colonne sert à cet affichage/gating et à l'admin
-- (badge « désactivé », date). Désactiver = ban + poser disabled_at ; réactiver = unban
-- + remettre à NULL. Les deux via un endpoint admin en service_role.
--
-- Migration ADDITIVE : simple colonne nullable, aucun impact sur l'existant.
alter table public.users
  add column if not exists disabled_at timestamptz;

comment on column public.users.disabled_at is
  'Horodatage de désactivation admin (affichage). NULL = actif. Le blocage effectif de l''accès est le ban Supabase Auth (auth.users.banned_until), pas cette colonne.';
