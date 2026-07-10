-- Archivage réversible des fiches — colonne dédiée, pas un statut.
--
-- Contexte : l'action « Archiver » du menu contextuel était un no-op côté front, et la
-- base ne pouvait de toute façon pas stocker l'état : `statut` porte la contrainte
-- CHECK (statut IN ('Brouillon','Complété')), et aucune colonne d'archivage n'existait.
--
-- Pourquoi une colonne `archived_at` plutôt qu'élargir `statut` à 'Archivé' :
-- désarchiver doit rendre à la fiche son statut d'origine (brouillon ou complété).
-- Écrire 'Archivé' dans `statut` écraserait cette information — il faudrait une seconde
-- colonne pour s'en souvenir. Avec `archived_at`, archiver = poser un horodatage, le
-- `statut` reste intact, et désarchiver = remettre la colonne à NULL : la fiche retrouve
-- mécaniquement son statut. Bonus : on sait QUAND la fiche a été rangée.
--
-- Migration ADDITIVE : colonne nullable, aucune valeur par défaut, aucune contrainte.
-- Le front déployé sélectionne des colonnes explicites, il l'ignore donc totalement.
-- NB : elle doit néanmoins être appliquée AVANT le déploiement du front qui la lit.
--
-- Sémantique : archived_at IS NULL  → fiche active (visible sous Tous/Brouillon/Complété)
--              archived_at NOT NULL → fiche archivée (visible uniquement sous « Archivé »)

alter table public.fiche_lite
  add column archived_at timestamptz;

comment on column public.fiche_lite.archived_at is
  'Horodatage d''archivage. NULL = fiche active. Non NULL = fiche rangée (masquée des '
  'filtres actifs, visible sous « Archivé »). Le statut d''origine est préservé dans '
  '`statut`, ce qui permet un désarchivage sans perte.';
