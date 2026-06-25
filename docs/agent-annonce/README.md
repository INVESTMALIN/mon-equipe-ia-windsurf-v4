# Agent annonce — documentation de référence

Ce dossier regroupe les documents qui **cadrent et spécifient** la refonte de l'agent de génération d'annonces (titres + descriptions Airbnb, fiches Booking), déclenché depuis l'étape `FicheFinalisation`. Ce sont des documents produit / de conception : ils font foi pour le développement de l'agent (Edge Functions `annonce-localisation` et `annonce-generate`).

> **Version Fiche Logement Lite.** Ces documents sont transposés depuis le repo Fiche Logement (FL) vers Mon Équipe IA (Fiche Logement Lite). Différence structurante : Lite stocke chaque section dans une **colonne JSONB** de la table unique `fiche_lite` (`section_avis`, `section_reglementation`, `section_logement`…), là où FL utilise une table `fiches` à colonnes plates. Les chemins de champs cités dans ces docs (`section_avis.vue_types`, `section_reglementation.classe_dpe`…) se lisent donc comme des **chemins JSONB** dans `fiche_lite`. Les deux docs liés au schéma — [gap-analysis-fiche.md](./gap-analysis-fiche.md) et [contrat-entree-agent-annonce-airbnb-v1.md](./contrat-entree-agent-annonce-airbnb-v1.md) — sont adaptés en conséquence.

## Documents

### Cadrage & recherche (discovery)

| Fichier | Rôle |
|---|---|
| [referentiel-agent-annonce.md](./referentiel-agent-annonce.md) | Référentiel des patterns rédactionnels des top performers Airbnb France (analyse Inside Airbnb, sept. 2025) : longueurs cibles titre/description, structure, lexique par marché, hiérarchie des équipements, checklist de génération. |
| [cadrage-annonce-airbnb-2026.md](./cadrage-annonce-airbnb-2026.md) | Cadrage qualité **Airbnb** : règles plateforme (titre 50 car., description 500 car., sous-sections), réglementation française (numéro d'enregistrement, DPE), pièges à éviter, modèle d'annonce idéale. |
| [cadrage-annonce-booking-2026.md](./cadrage-annonce-booking-2026.md) | Cadrage qualité **Booking** : logique fiche structurée (description auto-générée), 3 champs profil, Property Page Score, règles de nommage, réglementation française, modèle de fiche idéale. |

### Conception de l'agent (specs de build)

| Fichier | Rôle |
|---|---|
| [gap-analysis-fiche.md](./gap-analysis-fiche.md) | Gap analysis **v3**, champ par champ : où vit chaque donnée dans la fiche, ce qui est collecté / manquant pour l'agent. Source de vérité du mapper. |
| [contrat-entree-agent-annonce-airbnb-v1.md](./contrat-entree-agent-annonce-airbnb-v1.md) | **Contrat d'entrée** : mapping fiche → contrat propre. Ce qui part au modèle (partie 2), ce que le code assemble (partie 3), réconciliations (partie 4), exclusions, bloc localisation enrichie (partie 6). |
| [schema-sortie-airbnb-agent-annonce.md](./schema-sortie-airbnb-agent-annonce.md) | **Schéma de sortie** Airbnb (objet complet après assemblage). Référence pour le prompt, la table `agent_outputs` et l'UI. Distingue champs **générés par le modèle** (prose) vs **assemblés par le code**. |
| [schema-sortie-booking-agent-annonce.md](./schema-sortie-booking-agent-annonce.md) | **Schéma de sortie** Booking (objet complet après assemblage). Référence pour le prompt, la table `agent_outputs` et l'UI. |
| [prompt-v1-agent-annonce-airbnb.md](./prompt-v1-agent-annonce-airbnb.md) | **Prompt système v1** (Claude Sonnet), versionné, appelé par `annonce-generate`. Le modèle ne produit que les champs de prose. |
| [phrases-code-injectees-airbnb.md](./phrases-code-injectees-airbnb.md) | **Phrases déterministes injectées par le code** (note_etat, note_quartier, caméras, échanges voyageurs, horaires de tranquillité, favoris), reprises du prompt n8n de prod. Injectées verbatim par l'Edge Function, jamais reformulées par le modèle. |

## Architecture cible (décidée)

Cible du chantier principal Lite — déjà éprouvée côté FL. Au clic « générer l'annonce » dans `FicheFinalisation`, l'Edge Function `annonce-generate` :

1. récupère la fiche brute + les faits de localisation ;
2. **mappe** la fiche en contrat d'entrée propre — deux zones nettes : ce que voit le modèle / ce que le code assemble ;
3. envoie le contrat au modèle (Claude Sonnet) → prose ;
4. **assemble** la sortie finale (prose + blocs code déterministes + phrases injectées) ;
5. stocke dans `agent_outputs` et affiche.

Approche **hybride** assumée : les faits (localisation, réglementation, état) viennent du code, la prose vient du modèle. Le modèle ne voit jamais la fiche brute, ni la rue, ni un signal négatif qu'il pourrait formuler de lui-même.

## Où on en est (Fiche Logement Lite)

**Transfert de la doc** : ✅ — les 10 documents de cadrage et de conception ci-dessus sont copiés depuis FL et adaptés à Lite. Les deux docs liés au schéma sont réécrits contre `fiche_lite` (colonnes JSONB), et la gap analysis est re-dérivée section par section contre le schéma réel de `fiche_lite`.

**Fiche enrichie en amont** (pour alimenter l'agent) : la section « Vue depuis le logement » (`section_avis.vue_types`) et les champs DPE (`section_reglementation.classe_dpe`, `dpe_depenses_min/max`) sont ajoutés au **front de Lite dans ce chantier**, en miroir de FL (références d'implémentation : FL PR #35 et #36). Aucune migration SQL : les colonnes JSONB cibles existent déjà.

**Build de l'agent** (moteur) : **à venir dans le chantier principal Lite**, hors de ce pilote. Les briques déjà construites côté FL servent de référence d'implémentation : Edge Function `annonce-localisation` (géocodage Geoapify + faits POI/transport, table dédiée `fiche_localisation_faits`, cache par adresse), table de sortie `agent_outputs`, mapper fiche → contrat d'entrée, puis Edge Function `annonce-generate` (assemblage + appel modèle) et câblage UI dans `FicheFinalisation`.

**Manques résiduels (données)** : le **nom de quartier** (toponyme) reste un trou de données OpenStreetMap confirmé, non sourçable de façon fiable sur le parc — le modèle nomme le secteur à partir des POI réels qu'on lui fournit. Les distances / POI à proximité relèvent de la brique localisation. L'**année de rénovation** reste volontairement non collectée (décision : « récemment », sans année).

> Documents internes Invest Malin. Transposition Fiche Logement Lite : 2026-06-25 (source FL, 2026-06-17).
