# Pilote — Transfert de la doc agent annonce vers Fiche Logement Lite

Ce fichier est ton contexte de travail. Ta condition de complétion (`/goal`) pointe sur lui.

## Ce que tu fais

Tu transposes l'agent annonce de Fiche Logement (FL) vers Fiche Logement Lite, qui vit dans ce repo (le SaaS Mon Équipe IA). Ce pilote couvre seulement trois choses : transférer et adapter la documentation de cadrage, produire la gap analysis version Lite, et ajouter les deux seuls champs manquants dans le front de Lite. Pas de moteur, pas d'Edge Function, pas de table de sortie : ça viendra dans le chantier principal, pas ici.

## Coordonnées

- Repo source FL : `C:\dev-projects\fiche-logement_ia-githubcopilot-v1`. Docs source dans `docs/agent-annonce/` (10 fichiers).
- Repo cible Lite : `C:\dev-projects\mon-equipe-ia-windsurf-v4` (ce repo).
- Projet Supabase Lite : `gbdturqxlxyvdtezjwxa` (Mon Équipe IA). Ne le confonds pas avec celui de FL.
- Données Lite : table unique `fiche_lite`, une vingtaine de colonnes JSONB, une par section (`section_avis`, `section_reglementation`, `section_logement`, etc.). C'est la différence majeure avec FL, qui a une table `fiches` à colonnes plates.

## Tâche 1 — Transfert et adaptation des docs

Copie les 10 docs de `docs/agent-annonce/` (repo FL) vers `docs/agent-annonce/` de ce repo, et adapte-les. La majorité est transposable quasi telle quelle, c'est de la qualité de prose : référentiel, prompt v1, les deux cadrage, les deux schémas de sortie, phrases injectées, README. Les deux qui demandent un vrai travail d'adaptation parce qu'ils sont liés au schéma : `contrat-entree-agent-annonce-airbnb-v1.md` et `gap-analysis-fiche.md`. Adaptation clé pour ces deux-là : remplace les références aux colonnes plates de `fiches` par les chemins JSONB de `fiche_lite` (ex. `section_avis.vue_types`, `section_reglementation.classe_dpe`).

## Tâche 2 — Gap analysis version Lite

Re-dérive la gap analysis pour Lite : compare ce dont l'agent a besoin avec ce que `fiche_lite` collecte réellement, section par section. Ce n'est pas un copier-coller de celle de FL. Conclusion attendue, que tu confirmes contre le schéma réel : les deux seuls manques sont la vue (`section_avis`) et le DPE (`section_reglementation`), tout le reste est déjà collecté.

## Tâche 3 — Ajout des deux champs dans le front de Lite

En miroir de FL :
- La vue depuis le logement, comme FL PR #35 (section Avis). Référence d'implémentation : le repo FL.
- La classe DPE et les dépenses énergétiques, comme FL PR #36 (section Réglementation). Référence : le repo FL.

Ces champs s'écrivent dans les JSONB `section_avis` et `section_reglementation`, qui existent déjà. Donc aucune migration SQL. C'est du front : état du formulaire, composants des sections concernées, mapping de persistance.

## Les deux PR

- PR 1, docs : les 10 docs adaptés + la gap analysis Lite. Review Gemini. Mets le préfixe `MSYS_NO_PATHCONV=1` devant la commande `/gemini review` depuis Git Bash.
- PR 2, champs front : la vue et le DPE. Review Codex.

Pour chaque PR : branche dédiée avant de coder, commits conventionnels, attends le retour du reviewer (watcher), corrige les vrais problèmes, écarte le chipotage et les faux positifs en justifiant, ne merge pas sans review verte, squash and merge.

## Déroulé

Tu vas jusqu'au merge des deux PR et au déploiement Vercel de ce repo, puis tu vérifies. Pas de gate humaine sur le merge pour ce pilote.

## Contraintes

- Aucune migration SQL. Pas de ADD, DROP ou ALTER, pas de modif destructive. Les colonnes JSONB cibles existent déjà.
- Ne touche qu'aux sections Avis et Réglementation côté front. Ne modifie pas les autres sections ni le schéma.
- Si une section, un composant ou un champ attendu est introuvable dans ce repo ou dans `fiche_lite`, STOP et demande. N'invente pas de structure.
- Ne merge aucune PR sans review verte.
