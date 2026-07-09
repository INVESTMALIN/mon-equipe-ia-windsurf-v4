# Mission — Porter le moteur agent annonce dans Fiche Logement Lite (Goal de bout en bout)

Fichier de contexte pour Claude Code, lu par la commande `/goal`. La condition `/goal` (en bas) pointe ici. Objectif unique : un agent annonce qui tourne **de bout en bout** dans Mon Équipe IA, jusqu'au **PDF généré côté front**.

---

## Repos (tu as accès aux deux)

- **Fiche Logement (FL)** = repo de référence, le moteur agent annonce y est déjà construit et en prod. Source à transposer, tu n'y touches pas. `https://github.com/INVESTMALIN/fiche-logement_ia-githubcopilot-v1`
- **Mon Équipe IA** = repo cible, on bosse ici sur **Fiche Logement Lite**. `https://github.com/INVESTMALIN/mon-equipe-ia-windsurf-v4`

## Supabase (via le connecteur MCP, pas de manip manuelle)

- **Cible** : projet `gbdturqxlxyvdtezjwxa` (Mon Équipe IA, héberge Lite). Migrations et déploiements d'Edge Functions vont là.
- **Référence FL** : projet `qwjgkqxemnpvlhwxexht` (pour comparer un schéma ou un comportement si besoin).

## Pré-requis avant de lancer (clé Geoapify)

La localisation enrichie réutilise **la même clé Geoapify que FL** (quota 3000 requêtes/jour). Avant que le moteur tourne, le secret **`GEOAPIFY_API_KEY`** doit être posé dans les secrets du projet Supabase Lite (`gbdturqxlxyvdtezjwxa`), avec la même valeur que côté FL. Même nom de var qu'en FL, on ne change rien. Si la clé n'est pas encore posée, signale-le et demande-la avant d'attaquer la brique localisation.

---

## Ce qui a été fait hier (acquis, ne pas refaire)

Pilote de préparation, déjà mergé et déployé en prod côté Lite :

- Les 10 docs de cadrage de l'agent annonce portés dans `docs/agent-annonce/` du repo Lite, adaptés aux chemins JSONB de `fiche_lite`.
- La gap analysis Lite re-dérivée champ par champ (`docs/agent-annonce/gap-analysis-fiche.md`). C'est ta carte : elle dit où vit chaque donnée dans `fiche_lite`.
- Deux champs de saisie ajoutés au front Lite : la vue (`section_avis`) et le DPE (`section_reglementation`). PR #6 (docs) et #7 (champs) mergées, déploiement Vercel OK.

Tout le cadrage contenu est en place. Le travail du jour est la construction du moteur.

---

## Mission du jour

Construire le moteur agent annonce dans Lite, **de bout en bout**. Fin de mission = à partir d'une vraie `fiche_lite`, on génère l'annonce (Airbnb **et** Booking) et on obtient un **PDF téléchargeable**.

**Flow Lite simplifié vs FL.** On garde **génération + régénération + PDF**. On **retire** l'édition par consigne, la brique validation, et tout push Monday. Lite vise des conciergeries externes : pas de Monday, la sortie c'est un PDF direct.

**Modèle de données.** FL lit des colonnes plates (`fiches`). Lite lit du **JSONB par section** (`fiche_lite`, une colonne JSONB par section : `section_avis`, `section_reglementation`, `section_logement`, etc.). La logique métier est identique, seule la lecture des champs change. Carte des chemins : `gap-analysis-fiche.md`.

**Table de sortie `agent_outputs`.** Structure **identique à FL**, décision actée : upsert, une ligne par couple fiche × plateforme (la régénération écrase via l'upsert), on garde même la colonne `output_modele_origine` (inutilisée côté Lite faute d'édition, mais on préserve la parité des deux tables). Seule différence : `fiche_id` pointe vers `fiche_lite`. Migration via le connecteur Supabase MCP.

**n8n.** L'ancien assistant annonce n8n reste en parallèle. Pas de démantèlement dans ce goal.

### Briques (UN seul goal, PR séquentielles)

Tu mènes ces briques toi-même. **Une brique à la fois, une PR, mergée avant d'attaquer la suivante.** Pas de PR en parallèle, pas de PR géante. Les briques s'enchaînent par dépendances, le séquentiel est l'ordre naturel et garde les reviews lisibles.

1. **Mapper** `fiche_lite` → contrat d'entrée. Même contrat de sortie que le mapper FL (`_shared/annonce/mapper.ts`), lecture JSONB au lieu de colonnes plates. Transformation pure, tests Deno comme FL. *Preuve : tests verts (exit 0).*
2. **Table `agent_outputs`** dans le Supabase Lite. CREATE + RLS, miroir FL. *Preuve : migration appliquée, table listée via le connecteur.*
3. **Localisation enrichie**. **Miroir exact de FL**, pas un mécanisme différent. Reprends `_shared/localisation/` de FL tel quel : mêmes catégories de POI (commerces, boulangeries, restaurants, bars/cafés, sites touristiques, parcs, près de l'eau), mêmes requêtes transport (arrêt bus/tram, métro dédié, gare), mêmes ancres macro (ville notable, liste statique d'aéroports), même table `fiche_localisation_faits` (clé `fiche_id`, cache par `adresse_key` + `schema_version`), même secret `GEOAPIFY_API_KEY`, même dégradation gracieuse. **Seule adaptation Lite** : l'orchestrateur lit l'adresse depuis le JSONB de `fiche_lite` au lieu des colonnes plates `proprietaire_adresse_*` de FL. *Preuve : faits collectés sur une adresse réelle, ou dégradation tracée.*
4. **Edge Function `annonce-generate`**. Mapper + localisation + prompt + appel modèle OpenRouter + assemblage (prose modèle + blocs déterministes) + persistance dans `agent_outputs`. Routage `airbnb` et `booking`. Secrets posés côté Lite. Déploiement. *Preuve : déploiement Supabase en succès + une invocation live sur une vraie `fiche_lite` qui renvoie la sortie assemblée (Airbnb et Booking).*
5. **PDF + câblage UI**. **PDF généré côté front, simple et basique** (pas de serveur, pas de Puppeteer, pas de Monday). Brancher le déclenchement dans l'écran de finalisation Lite : générer / régénérer → sortie → téléchargement du PDF. *Preuve : le flux complet tourne depuis l'app et un PDF est produit.*

---

## Règles opérationnelles

- **Tu gères les PR, les migrations et les déploiements.**
- **Tu peux merger toi-même** une PR propre. Une PR par brique, séquentielles.
- **Reviews bornées.** Watcher / polling pour récupérer les retours Codex et enchaîner les corrections tout seul, **4 rounds max par PR**. Au **5e round** demandé (Codex ou Gemini), **tu t'arrêtes et tu me demandes**, sans relancer de tour de toi-même.
- **Routage review** : `@codex review` pour la logique, les migrations, les Edge Functions. `/gemini review` pour la doc / le trivial, avec le préfixe `MSYS_NO_PATHCONV=1` depuis Git Bash (sinon le `/` casse le commentaire). Sur la doc, écarte les nits cosmétiques, garde les findings qui impactent du code en aval.
- **Git** : branches `feat/...`, conventional commits, squash and merge, suppression de branche après merge. Vérifie `.gemini/config.yaml` à la racine du repo Lite, sinon ajoute-le (push direct).
- **DPE** : dépenses énergétiques sur les classes **F et G uniquement** (miroir FL, décision Olga). Question légale "toutes classes A-G vs F/G" parquée, ne la tranche pas ici.
- **Accès front pour vérifier le rendu** : la preview Lite est derrière le login. Un compte de test te sera fourni (identifiants dans le goal) pour te connecter et vérifier le rendu de la brique 5.
- **Porte de sortie** : si un point n'est pas clair ou si tu vois un meilleur chemin, **pose la question en cours de route**. Ça ne clôt pas le goal, tu reprends après ma réponse. Tu as la vue complète des deux codebases : si la gap analysis ou un doc ne suffit pas pour couvrir un champ, signale-le plutôt que de deviner.

---

## Condition /goal (à coller dans Claude Code)

```
/goal L'agent annonce de Fiche Logement Lite (repo mon-equipe-ia-windsurf-v4) fonctionne de bout en bout selon docs/agent-annonce/MISSION-moteur-annonce-lite.md. État de fin : à partir d'une vraie fiche_lite, l'Edge Function annonce-generate déployée sur le projet Supabase gbdturqxlxyvdtezjwxa génère l'annonce Airbnb ET Booking, la persiste dans agent_outputs, et un PDF est généré côté front (téléchargeable). Preuves dans la conversation : tests Deno verts (exit 0), build exit 0, logs de déploiement Supabase en succès, une invocation live de bout en bout montrant la sortie assemblée, et le flux front produisant le PDF, toutes les PR du chantier mergées. Contraintes : flow simplifié (génération + régénération + PDF, ni édition par consigne ni push Monday), localisation = miroir exact de FL, table agent_outputs identique à FL, PDF côté front simple, n8n laissé en parallèle. PR séquentielles, une à la fois. Reviews bornées à 4 rounds par PR via watcher ; au 5e round demandé, arrête-toi et demande-moi. Tu peux merger toi-même une PR propre. Tu peux me poser des questions en cours de route sans clore le goal. Ou arrête et fais le point après 50 tours.
```
