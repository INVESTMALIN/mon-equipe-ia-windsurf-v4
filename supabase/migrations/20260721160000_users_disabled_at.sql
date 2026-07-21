-- Désactivation d'un compte (soft) — colonne d'affichage pour l'espace admin.
--
-- Le blocage RÉEL de l'accès se fait côté Supabase Auth (ban : banned_until dans
-- auth.users), qui rejette nativement le login ET le refresh de token — c'est le
-- « check à la connexion » gratuit et incontournable, sans dépendre du front. Cette
-- colonne applicative ne sert qu'à l'affichage admin (badge « désactivé », date), la
-- source de vérité de l'accès restant le ban Auth. Désactiver = ban + poser disabled_at ;
-- réactiver = unban + remettre à NULL. Les deux via un endpoint admin en service_role.
--
-- Migration ADDITIVE : simple colonne nullable, aucun impact sur l'existant.
alter table public.users
  add column if not exists disabled_at timestamptz;

comment on column public.users.disabled_at is
  'Horodatage de désactivation admin (affichage). NULL = actif. Le blocage effectif de l''accès est le ban Supabase Auth (auth.users.banned_until), pas cette colonne.';
