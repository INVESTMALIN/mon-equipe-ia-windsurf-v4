-- Brique 3 — Cache des faits de localisation enrichie (Fiche Logement Lite).
--
-- Miroir EXACT de la table `fiche_localisation_faits` de FL : une ligne par fiche,
-- cache invalidé par `adresse_key` + `schema_version` (cf. _shared/localisation/
-- orchestrator.ts). L'orchestrateur upsert ici (service role) après géocodage
-- Geoapify ; la réutilisation lit cette ligne sans rappeler Geoapify.
--
-- Seules différences Lite, imposées par le schéma cible (mêmes que agent_outputs) :
--   - `fiche_id` référence `fiche_lite(id)` (au lieu de `fiches(id)`).
--   - la policy d'oversight admin lit `public.users.role = 'admin'` (Lite n'a pas
--     de table `profiles` ni de rôle `super_admin`).

create table public.fiche_localisation_faits (
  fiche_id uuid not null references public.fiche_lite(id) on delete cascade,
  adresse_used jsonb not null,
  adresse_key text not null,
  lat double precision,
  lon double precision,
  geocode_confidence double precision,
  geocode_result_type text,
  faits jsonb not null,
  schema_version integer not null default 1,
  source text not null default 'geoapify',
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (fiche_id)
);

alter table public.fiche_localisation_faits enable row level security;

-- Lecture : le propriétaire de la fiche. Écritures via service role (bypass RLS).
create policy loc_faits_select_own on public.fiche_localisation_faits
  for select
  using (
    exists (
      select 1 from public.fiche_lite f
      where f.id = fiche_localisation_faits.fiche_id and f.user_id = auth.uid()
    )
  );

-- Oversight admin (miroir de la policy `super_admin` de FL, adaptée à Lite).
create policy loc_faits_select_admin on public.fiche_localisation_faits
  for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );
