-- Idempotence des achats de crédits Stripe — garantie atomique au niveau DB.
--
-- Contexte : le webhook Stripe crédite le ledger sur `checkout.session.completed`.
-- Stripe rejoue ses webhooks (retries, `stripe events resend`), et deux livraisons du
-- même événement peuvent arriver EN PARALLÈLE. Le garde-fou applicatif existant
-- (SELECT stripe_events puis, si absent, INSERT) est un check-then-act en deux temps
-- NON atomiques : deux exécutions concurrentes passent toutes deux le SELECT, puis
-- créditent toutes deux. Sur un flux d'argent, c'est un double-crédit silencieux.
--
-- Correctif : déplacer la garantie là où le double-write fait mal — sur le ledger
-- lui-même — et la faire porter par Postgres. Une session de Checkout ne peut être
-- payée qu'une fois ; on impose donc AU PLUS une ligne de crédit par session Stripe.
-- L'INSERT du crédit DEVIENT la barrière : la seconde livraison viole l'index unique
-- (SQLSTATE 23505) et le webhook traite ce conflit comme un no-op idempotent. Aucune
-- fenêtre de course : c'est le moteur qui sérialise, pas l'application.
--
-- Clé d'idempotence = l'id de session Checkout (`cs_...`), stocké par le webhook dans
-- `metadata->>'stripe_session_id'`. Le rejeu d'un événement porte la même session, donc
-- le rejeu est couvert aussi.
--
-- Index PARTIEL (where metadata ? 'stripe_session_id') : seules les lignes d'achat
-- portent cette clé. Les débits de fiche, bonus et autres mouvements ne sont pas
-- indexés — l'index reste petit et ne contraint que ce qu'il doit contraindre.
--
-- NB : ne touche à AUCUNE migration existante du ledger. Nouvelle migration additive.

create unique index credit_ledger_stripe_session_id_uniq
  on public.credit_ledger ((metadata->>'stripe_session_id'))
  where metadata ? 'stripe_session_id';
