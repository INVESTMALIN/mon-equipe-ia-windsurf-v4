-- Section « Instructions Ménage » — nouvelle colonne JSONB de section.
--
-- Contexte : la section a été livrée le 04/08/2026 côté coordinateurs
-- (`fiche-logement_ia-githubcopilot-v1`, la source de vérité), et la règle du projet
-- veut que tout champ ajouté là-bas soit répercuté côté Lite. Elle rassemble ce qui est
-- destiné au prestataire de ménage : type de 1er passage, consignes, produits et
-- matériel, kit de bienvenue, points de vigilance.
--
-- Côté Lite, chaque section du formulaire est une colonne JSONB de `fiche_lite` :
-- la nouvelle section a donc besoin de la sienne.
--
-- Migration ADDITIVE : nouvelle colonne, même forme que les 23 autres sections
-- (jsonb, défaut '{}'). Aucune contrainte, aucune policy touchée — les policies RLS de
-- `fiche_lite` portent sur la ligne (user_id), pas sur les colonnes, et les GRANT sont
-- au niveau table : une colonne ajoutée en hérite. Rien de ce qui existe ne change.
--
-- ⚠️ Elle doit être appliquée AVANT le déploiement du front qui écrit dedans : sans la
-- colonne, `saveFiche` envoie un UPDATE qui échoue en entier (la sauvegarde de TOUTE la
-- fiche, pas seulement de cette section).
--
-- Trois champs déjà saisis par des concierges vivent encore dans `section_avis`
-- (`type_premier_menage`, `type_premiere_maintenance`, `photos_rappels.etat_logement_video_taken`).
-- Ils sont relus en repli par le front. Aucune reprise de données ici : c'est un
-- déplacement d'écran, pas une migration de contenu.

alter table public.fiche_lite
  add column section_instructions_menage jsonb not null default '{}'::jsonb;

comment on column public.fiche_lite.section_instructions_menage is
  'Section « Instructions Ménage » : informations destinées au prestataire de ménage '
  '(type de 1er passage ménage/maintenance, consignes générales, produits et matériel, '
  'kit de bienvenue, points de vigilance, rappels photo). Portée depuis la version '
  'coordinateurs. Le rappel des consommables affiché dans cette section n''est PAS '
  'stocké ici : il est dérivé au rendu depuis `section_consommables`.';
