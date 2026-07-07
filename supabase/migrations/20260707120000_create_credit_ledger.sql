-- Brique fondation — Système de crédits Fiche Logement Lite : ledger de mouvements.
--
-- Principe directeur : le solde n'est JAMAIS stocké. Il est TOUJOURS recalculé
-- comme la somme des mouvements du ledger (source unique de vérité). Un achat = une
-- ligne positive, un débit = une ligne négative, le solde = la somme. On obtient
-- l'historique complet gratuitement et zéro risque de désynchronisation.
--
-- Périmètre de cette brique : la table + la fonction de solde + les policies RLS.
-- PAS de Stripe, PAS de front, PAS de débit branché sur la création de fiche.
--
-- Modèle de sécurité (miroir d'agent_outputs / fiche_localisation_faits) :
--   - lecture propriétaire (auth.uid() = user_id) + oversight admin (users.role = 'admin') ;
--   - AUCUNE policy d'écriture → le client ne peut jamais s'auto-créditer. Les
--     écritures passent exclusivement par le service role (Edge Functions à venir),
--     qui bypass la RLS.
--   - append-only : un trigger interdit UPDATE et DELETE, même au service role. Une
--     correction se fait par une ligne compensatoire (pratique comptable normale),
--     jamais par mutation d'une ligne existante — l'historique est immuable.

-- ───────────────────── Type de mouvement ─────────────────────

-- Enum : intégrité forte (le serveur ne peut pas écrire un type inconnu) et
-- auto-documentation. Extensible par une migration d'une ligne :
--   ALTER TYPE public.credit_movement_type ADD VALUE 'bonus';
-- Valeurs de départ ; d'autres viendront (bonus, remboursement, autres débits).
create type public.credit_movement_type as enum ('achat', 'debit_fiche');

-- ───────────────────── Table ledger ─────────────────────

create table public.credit_ledger (
  id          uuid primary key default gen_random_uuid(),
  -- Rattachement à l'utilisateur applicatif (public.users, toujours peuplé par
  -- handle_new_user). CASCADE : si l'utilisateur est supprimé (RGPD), son historique
  -- de crédits part avec lui.
  user_id     uuid not null references public.users(id) on delete cascade,
  -- Montant entier signé : positif = ajout (achat, bonus, remboursement),
  -- négatif = débit. Un mouvement nul n'a aucun sens → interdit.
  amount      integer not null check (amount <> 0),
  type        public.credit_movement_type not null,
  -- Référence typée vers la cause quand c'est une fiche (débit). SET NULL : on ne
  -- perd JAMAIS une ligne d'argent même si la fiche débitée est supprimée.
  fiche_id    uuid references public.fiche_lite(id) on delete set null,
  -- Référence souple pour tout le reste sans nouvelle migration : id de la
  -- transaction / payment intent Stripe pour un achat, refs d'add-ons futurs, etc.
  metadata    jsonb not null default '{}'::jsonb,
  -- Libellé lisible optionnel (traçabilité humaine).
  description text,
  created_at  timestamptz not null default now()
);

-- Index couvrant : le calcul de solde (somme des amounts filtrés par user_id) se
-- fait en index-only scan, sans accès à la heap.
create index credit_ledger_user_id_idx on public.credit_ledger (user_id) include (amount);

-- ───────────────────── Append-only (immutabilité) ─────────────────────

-- Bloque toute mutation d'une ligne existante, y compris pour le service role.
-- Les corrections se font par une ligne compensatoire, jamais par UPDATE/DELETE.
create or replace function public.credit_ledger_prevent_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'credit_ledger est append-only : UPDATE/DELETE interdits (utilisez une ligne compensatoire)';
end;
$$;

create trigger credit_ledger_no_mutation
  before update or delete on public.credit_ledger
  for each row execute function public.credit_ledger_prevent_mutation();

-- ───────────────────── RLS ─────────────────────

alter table public.credit_ledger enable row level security;

-- Lecture : le propriétaire voit ses propres mouvements.
create policy credit_ledger_select_own on public.credit_ledger
  for select
  using (auth.uid() = user_id);

-- Oversight admin (miroir des policies admin d'agent_outputs / localisation).
create policy credit_ledger_select_admin on public.credit_ledger
  for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- Pas de policy INSERT/UPDATE/DELETE : écritures réservées au service role.

-- ───────────────────── Fonction de solde ─────────────────────

-- Solde courant = somme des mouvements de l'utilisateur (0 si aucun mouvement).
--
-- Le paramètre est préfixé `p_user_id` À DESSEIN : un paramètre nommé `user_id`
-- entrerait en collision avec la colonne `user_id`, rendant `where user_id = user_id`
-- toujours vrai (= solde global de tous les utilisateurs). Le préfixe lève toute
-- ambiguïté.
--
-- SECURITY INVOKER (défaut) : la RLS de credit_ledger s'applique à l'intérieur de la
-- fonction. Un utilisateur ne somme donc QUE ses propres lignes ; l'admin et le
-- service role voient au-delà via leurs droits. Défaut `auth.uid()` → le front
-- appelle `supabase.rpc('get_credit_balance')` sans argument pour son propre solde.
create or replace function public.get_credit_balance(p_user_id uuid default auth.uid())
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(sum(amount), 0)::integer
  from public.credit_ledger
  where user_id = p_user_id;
$$;

grant execute on function public.get_credit_balance(uuid) to authenticated;
