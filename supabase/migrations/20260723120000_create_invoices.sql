-- Chantier factures — table d'archivage des factures comptables émises par Kevin (Make).
--
-- Contexte : à chaque paiement encaissé côté Invest Malin, le système Make de Kevin
-- génère LA facture comptable qui fait foi (numérotée, mention TVA), la dépose dans un
-- Drive partagé, et POSTe un payload sur /api/invoice-webhook. On ne génère aucune
-- facture nous-mêmes : on archive le lien Drive et on rattache la facture au bon achat.
-- Objectif final (PR séparée) : un admin retrouve et retélécharge la facture d'un
-- concierge depuis l'espace admin.
--
-- Principes de conception :
--   - Ne JAMAIS perdre une facture. Les champs à plat sont extraits défensivement
--     (un champ illisible devient null), et le payload brut complet est conservé en
--     jsonb : si Kevin ajoute ou corrige un champ, rien n'est perdu.
--   - `numero_facture` nullable : il arrive vide aujourd'hui (bug de mappage côté
--     Kevin, en cours de correction) et ne doit jamais bloquer un enregistrement.
--   - `montant` en ENTIER DE CENTIMES (le payload le transmet en centimes, en chaîne).
--   - `user_id` nullable, résolu à la réception via credit_ledger
--     (metadata->>'stripe_payment_intent' = payment_intent_id). Deux cas légitimes ne
--     matchent pas et sont stockés quand même : une facture sans achat de crédits
--     (ex. un acompte), et une facture arrivée avant l'écriture de notre ligne ledger.
--   - SET NULL sur la FK : une archive comptable survit à la suppression du compte.
--
-- Modèle de sécurité (miroir de credit_ledger) :
--   - écriture réservée au service role (aucune policy INSERT/UPDATE/DELETE, et
--     revoke des privilèges table par défaut, défense en profondeur) ;
--   - lecture : le propriétaire voit ses propres factures, les admins voient tout.
--
-- Migration ADDITIVE (table neuve) : applicable en dev sans séquence en deux temps.

create table public.invoices (
  id                 uuid primary key default gen_random_uuid(),
  -- Rattachement à l'achat résolu à la réception (nullable : voir en-tête).
  user_id            uuid references public.users(id) on delete set null,
  -- Numéro de la facture comptable de Kevin. Nullable tant que son mappage est buggé.
  numero_facture     text,
  -- Centimes (le payload transmet "20000" pour 200 €).
  montant            integer,
  -- Date portée par la facture (champ `date` du payload ; renommé : mot réservé peu maniable).
  date_facture       date,
  nom_client         text,
  email              text,
  stripe_customer_id text,
  -- Identifiant d'événement Stripe transmis par Kevin. Sert d'idempotence (rejeu d'un
  -- POST). IMPÉRATIF côté récepteur : normaliser '' → null AVANT insertion, sinon deux
  -- factures sans identifiant entreraient en collision sur la chaîne vide.
  event_id_stripe    text,
  -- Clé de matching vers credit_ledger.metadata->>'stripe_payment_intent'.
  payment_intent_id  text,
  -- Lien vers le PDF déposé dans le Drive partagé — le document qui fait foi.
  lien_drive         text,
  -- Payload brut complet tel que reçu (filet : rien n'est perdu si le format évolue).
  -- Le secret partagé voyage dans un header précisément pour ne JAMAIS finir ici.
  payload            jsonb not null,
  received_at        timestamptz not null default now()
);

-- Idempotence : au plus une facture par événement Stripe. Index PARTIEL : les factures
-- sans identifiant (null après normalisation) ne se bloquent pas entre elles.
create unique index invoices_event_id_stripe_key
  on public.invoices (event_id_stripe)
  where event_id_stripe is not null;

-- Lectures à venir (espace admin, "mes factures") : par utilisateur.
create index invoices_user_id_idx on public.invoices (user_id);

-- ───────────────────── RLS ─────────────────────

alter table public.invoices enable row level security;

-- Lecture : le propriétaire voit ses propres factures.
create policy invoices_select_own on public.invoices
  for select
  using (auth.uid() = user_id);

-- Oversight admin (miroir des policies admin de credit_ledger).
create policy invoices_select_admin on public.invoices
  for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- Pas de policy INSERT/UPDATE/DELETE : écritures réservées au service role.
-- Défense en profondeur (leçon du hardening de public.users) : on coupe aussi les
-- privilèges table hérités du GRANT ALL par défaut de Supabase, pour que la protection
-- ne repose pas uniquement sur l'absence de policy.
revoke insert, update, delete on public.invoices from authenticated, anon;
