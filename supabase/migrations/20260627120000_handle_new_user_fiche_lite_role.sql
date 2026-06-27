-- Partie 1 "Fiche Logement Lite standalone" : poser le rôle `fiche_lite` à l'inscription.
--
-- Le front (page d'inscription dédiée à la landing /fiche-logement) envoie une
-- métadonnée `role` au signup. Ce trigger la lit, mais ne l'honore QUE si elle
-- vaut exactement 'fiche_lite'. Toute autre valeur (y compris une tentative de
-- poser 'admin') retombe sur 'user'. La métadonnée étant contrôlée par le client,
-- ce whitelisting strict est la garantie anti-escalade de privilèges.
--
-- Backward-compatible : les inscriptions existantes (écosystème concierge) ne
-- passent aucune métadonnée `role` -> comportement identique à avant (role 'user',
-- subscription_status 'free').

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$
declare
  requested_role text := new.raw_user_meta_data->>'role';
begin
  insert into public.users (id, email, subscription_status, role)
  values (
    new.id,
    new.email,
    'free',
    case when requested_role = 'fiche_lite' then 'fiche_lite' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;
