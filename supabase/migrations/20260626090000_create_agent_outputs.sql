-- Brique 2 — Table de sortie de l'agent annonce (Fiche Logement Lite).
--
-- Miroir EXACT de la table `agent_outputs` de Fiche Logement (FL) :
--   - PK (fiche_id, plateforme) : une seule ligne par couple fiche × plateforme.
--     La (re)génération écrase via upsert `onConflict: 'fiche_id,plateforme'`.
--   - `output_modele_origine` conservée : inutilisée côté Lite (pas d'édition par
--     consigne dans le flow Lite), mais préservée pour garder les deux tables
--     identiques.
--   - statut ∈ ('genere','valide','erreur') ; 'valide' inutilisé côté Lite (pas de
--     brique validation) mais conservé pour la parité du contrat de la table.
--   - écritures via service role (qui bypass RLS) ; lecture via RLS ci-dessous.
--
-- Seules différences Lite, imposées par le schéma cible :
--   - `fiche_id` référence `fiche_lite(id)` (au lieu de `fiches(id)` en FL).
--   - la policy d'oversight admin lit `public.users.role = 'admin'` : Lite n'a pas
--     de table `profiles` ni de rôle `super_admin` (FL) ; l'équivalent admin de
--     Lite est `users.role = 'admin'`.

create table public.agent_outputs (
  fiche_id uuid not null references public.fiche_lite(id) on delete cascade,
  plateforme text not null check (plateforme in ('airbnb', 'booking')),
  output_assemble jsonb,
  output_modele_brut jsonb,
  output_modele_origine jsonb,
  contrat_entree jsonb,
  modele text,
  prompt_version text,
  generation_meta jsonb,
  statut text not null default 'genere' check (statut in ('genere', 'valide', 'erreur')),
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (fiche_id, plateforme)
);

alter table public.agent_outputs enable row level security;

-- Lecture : le propriétaire de la fiche voit ses sorties. Les écritures passent
-- par le service role (Edge Function) qui bypass RLS — pas de policy write.
create policy agent_outputs_select_own on public.agent_outputs
  for select
  using (
    exists (
      select 1 from public.fiche_lite f
      where f.id = agent_outputs.fiche_id and f.user_id = auth.uid()
    )
  );

-- Oversight admin (miroir de la policy `super_admin` de FL, adaptée à Lite : table
-- `users`, rôle `admin`).
create policy agent_outputs_select_admin on public.agent_outputs
  for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );
