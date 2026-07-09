# Architecture — Topologie des projets Supabase

> Note courte mais critique. À lire avant toute opération base de données (migration,
> RLS, requête via MCP), pour ne pas se tromper de projet.

## Il y a UN seul projet Supabase pour Mon Équipe IA

**Projet : `gbdturqxlxyvdtezjwxa`** — c'est la base de **Mon Équipe IA** (ce repo).

- Auth, PostgreSQL, tables `users` / `conversations`, tables crédits (`credit_ledger`),
  table d'idempotence Stripe (`stripe_events`), tables `fiche_lite`, etc. : **tout est ici**.
- **Fiche Logement Lite n'est PAS un projet séparé.** C'est un *produit* qui vit
  **à l'intérieur** de Mon Équipe IA : même repo, même base, même auth. Ce qui distingue
  un utilisateur Lite, c'est son **rôle** (`fiche_lite`), pas une infrastructure à part.
- Il n'y a donc pas de « projet Lite » ni de « projet Mon Équipe IA principal ». C'est
  le même et unique projet. Les mentions d'« instance Supabase séparée » dans les autres
  docs signifient « séparée de la base Letahost » (voir ci-dessous), pas un second projet.

## L'autre projet Supabase, c'est Fiche Logement (Letahost)

**Projet : `qwjgkqxemnpvlhwxexht`** — c'est la base de **Fiche Logement**, l'app
d'inspection utilisée par les coordinateurs Letahost.

- **Autre repo, autre produit, autre base.** Aucun lien de données avec Mon Équipe IA.
- **Aucune table Stripe dedans** (vérifié). Pas de paiement, pas de facturation.
- Fiche Logement Lite (dans Mon Équipe IA) est un *fork allégé* de cette app, mais tourne
  sur sa propre base `gbdturqxlxyvdtezjwxa` — pas sur celle de Letahost.

## Conséquence pratique

Toute la stack de facturation (Stripe, crédits, `stripe_events`) vit exclusivement sur
`gbdturqxlxyvdtezjwxa`. La table `stripe_events` de ce projet est la **seule** de toute
la stack : il n'y a pas de deuxième table à sécuriser ailleurs.

| Projet Supabase | Produit | Repo | Stripe ? |
|---|---|---|---|
| `gbdturqxlxyvdtezjwxa` | Mon Équipe IA (inclut Fiche Logement **Lite**) | ce repo | oui |
| `qwjgkqxemnpvlhwxexht` | Fiche Logement (Letahost) | autre repo | non |
