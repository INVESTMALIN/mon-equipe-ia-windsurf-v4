-- ============================================================
-- Nettoyage : valeurs conditionnelles orphelines (données existantes)
-- Date     : 2026-07-31
-- Branche  : fix/nettoyage-branches-conditionnelles
-- ============================================================
-- À exécuter dans le SQL Editor du dashboard Supabase, PAR JULIEN.
-- ⚠️ Ce script MODIFIE des fiches de production. Il n'est PAS une migration
--    de schéma : aucune colonne n'est ajoutée, seules des clés JSONB sont
--    remises à leur valeur « non renseigné » (cf. formDefaults).
--
-- Contexte : décocher un appareil de Cuisine 1 ne vidait pas ses champs
-- conditionnels. Le PDF étant générique, il décrivait ensuite un appareil que
-- le logement n'a pas. Le correctif de code empêche les NOUVEAUX orphelins ;
-- ce script traite ceux déjà écrits.
--
-- Le balayage est DÉRIVÉ DES MAPPINGS DE BRANCHES, pas du relevé du 31/07 :
-- un concierge encore servi par l'ancien build peut créer un orphelin sur
-- n'importe quel appareil entre la mesure et le déploiement. Le script reste
-- donc correct quel que soit l'état de la base au moment de son exécution,
-- et il est ré-exécutable sans effet de bord.
--
-- Relevé du 31/07/2026 sur les 52 fiches, à titre indicatif :
--   - 3 fiches : détails `cuisiniere_*` alors que equipements_cuisiniere ≠ true
--   - 1 fiche  : rappel photo `seche_linge_video_taken` sans branche cochée
--   - 0 ailleurs (Cuisine 1 rappels photo, Extérieur)
--
-- ORDRE : appliquer APRÈS le merge et le déploiement du correctif de code.
-- ============================================================


-- ── 1. CONTRÔLE AVANT ────────────────────────────────────────
-- Nombre de fiches porteuses d'au moins un orphelin, par catégorie.
WITH details AS (
  SELECT * FROM (VALUES
    ('equipements_refrigerateur','refrigerateur_marque'),('equipements_refrigerateur','refrigerateur_instructions'),
    ('equipements_congelateur','congelateur_instructions'),
    ('equipements_mini_refrigerateur','mini_refrigerateur_instructions'),
    ('equipements_cuisiniere','cuisiniere_marque'),('equipements_cuisiniere','cuisiniere_type'),
    ('equipements_cuisiniere','cuisiniere_nombre_feux'),('equipements_cuisiniere','cuisiniere_instructions'),
    ('equipements_plaque_cuisson','plaque_cuisson_marque'),('equipements_plaque_cuisson','plaque_cuisson_type'),
    ('equipements_plaque_cuisson','plaque_cuisson_nombre_feux'),('equipements_plaque_cuisson','plaque_cuisson_instructions'),
    ('equipements_four','four_marque'),('equipements_four','four_type'),('equipements_four','four_instructions'),
    ('equipements_micro_ondes','micro_ondes_instructions'),
    ('equipements_lave_vaisselle','lave_vaisselle_instructions'),
    ('equipements_cafetiere','cafetiere_marque'),('equipements_cafetiere','cafetiere_instructions'),
    ('equipements_cafetiere','cafetiere_cafe_fourni'),('equipements_cafetiere','cafetiere_marque_cafe'),
    ('equipements_cafetiere','cafetiere_type_filtre'),('equipements_cafetiere','cafetiere_type_expresso'),
    ('equipements_cafetiere','cafetiere_type_piston'),('equipements_cafetiere','cafetiere_type_keurig'),
    ('equipements_cafetiere','cafetiere_type_nespresso'),('equipements_cafetiere','cafetiere_type_manuelle'),
    ('equipements_cafetiere','cafetiere_type_bar_grain'),('equipements_cafetiere','cafetiere_type_bar_moulu'),
    ('equipements_bouilloire','bouilloire_instructions'),
    ('equipements_grille_pain','grille_pain_instructions'),
    ('equipements_hotte','hotte_instructions'),
    ('equipements_blender','blender_instructions'),
    ('equipements_cuiseur_riz','cuiseur_riz_instructions'),
    ('equipements_machine_pain','machine_pain_instructions'),
    ('equipements_autre','equipements_autre_details')
  ) AS t(flag, champ)
), rappels_c1 AS (
  SELECT * FROM (VALUES
    ('equipements_refrigerateur','refrigerateur_taken'),('equipements_congelateur','congelateur_taken'),
    ('equipements_mini_refrigerateur','mini_refrigerateur_taken'),('equipements_cuisiniere','cuisiniere_taken'),
    ('equipements_plaque_cuisson','plaque_cuisson_taken'),('equipements_four','four_taken'),
    ('equipements_micro_ondes','micro_ondes_taken'),('equipements_lave_vaisselle','lave_vaisselle_taken'),
    ('equipements_cafetiere','cafetiere_taken'),('equipements_bouilloire','bouilloire_taken'),
    ('equipements_grille_pain','grille_pain_taken'),('equipements_hotte','hotte_taken'),
    ('equipements_blender','blender_taken'),('equipements_cuiseur_riz','cuiseur_riz_taken'),
    ('equipements_machine_pain','machine_pain_taken')
  ) AS t(flag, taken)
), rappels_eq AS (
  SELECT * FROM (VALUES
    ('tv','tv_video_taken'),('tv','tv_consoles_video_taken'),
    ('climatisation','climatisation_video_taken'),('chauffage','chauffage_video_taken'),
    ('ventilateur','ventilateur_taken'),
    ('lave_linge','lave_linge_video_taken'),('seche_linge','seche_linge_video_taken')
  ) AS t(flag, taken)
)
SELECT
  (SELECT count(DISTINCT f.id) FROM fiche_lite f JOIN details d ON TRUE
     WHERE coalesce(f.section_cuisine_1->>d.flag,'') <> 'true'
       AND coalesce(f.section_cuisine_1->>d.champ,'') NOT IN ('', 'false')) AS fiches_details_cuisine1,
  (SELECT count(DISTINCT f.id) FROM fiche_lite f JOIN rappels_c1 r ON TRUE
     WHERE coalesce(f.section_cuisine_1->>r.flag,'') <> 'true'
       AND (f.section_cuisine_1->'photos_rappels'->>r.taken) = 'true') AS fiches_rappels_cuisine1,
  (SELECT count(DISTINCT f.id) FROM fiche_lite f JOIN rappels_eq r ON TRUE
     WHERE coalesce(f.section_equipements->>r.flag,'') <> 'true'
       AND (f.section_equipements->'photos_rappels'->>r.taken) = 'true') AS fiches_rappels_equipements;


-- ── 2. NETTOYAGE des détails d'appareils (Cuisine 1, 16 branches) ──
-- Les paires (branche, champ) sont AGRÉGÉES par fiche avant l'UPDATE : un
-- `UPDATE ... FROM` produisant plusieurs lignes source pour la même cible ne met
-- cette cible à jour QU'UNE FOIS, avec une seule des lignes source. Le GROUP BY
-- garantit une ligne source par fiche, et le patch applique toutes ses clés.
-- Valeur de remise à zéro : "" pour les champs texte, null pour les cases
-- `cafetiere_type_*` (défauts de formDefaults).
UPDATE fiche_lite f
SET section_cuisine_1 = f.section_cuisine_1 || o.patch
FROM (
  SELECT f2.id,
         jsonb_object_agg(
           d.champ,
           CASE WHEN d.champ LIKE 'cafetiere_type_%' THEN 'null'::jsonb ELSE '""'::jsonb END
         ) AS patch
  FROM fiche_lite f2
  JOIN (VALUES
    ('equipements_refrigerateur','refrigerateur_marque'),('equipements_refrigerateur','refrigerateur_instructions'),
    ('equipements_congelateur','congelateur_instructions'),
    ('equipements_mini_refrigerateur','mini_refrigerateur_instructions'),
    ('equipements_cuisiniere','cuisiniere_marque'),('equipements_cuisiniere','cuisiniere_type'),
    ('equipements_cuisiniere','cuisiniere_nombre_feux'),('equipements_cuisiniere','cuisiniere_instructions'),
    ('equipements_plaque_cuisson','plaque_cuisson_marque'),('equipements_plaque_cuisson','plaque_cuisson_type'),
    ('equipements_plaque_cuisson','plaque_cuisson_nombre_feux'),('equipements_plaque_cuisson','plaque_cuisson_instructions'),
    ('equipements_four','four_marque'),('equipements_four','four_type'),('equipements_four','four_instructions'),
    ('equipements_micro_ondes','micro_ondes_instructions'),
    ('equipements_lave_vaisselle','lave_vaisselle_instructions'),
    ('equipements_cafetiere','cafetiere_marque'),('equipements_cafetiere','cafetiere_instructions'),
    ('equipements_cafetiere','cafetiere_cafe_fourni'),('equipements_cafetiere','cafetiere_marque_cafe'),
    ('equipements_cafetiere','cafetiere_type_filtre'),('equipements_cafetiere','cafetiere_type_expresso'),
    ('equipements_cafetiere','cafetiere_type_piston'),('equipements_cafetiere','cafetiere_type_keurig'),
    ('equipements_cafetiere','cafetiere_type_nespresso'),('equipements_cafetiere','cafetiere_type_manuelle'),
    ('equipements_cafetiere','cafetiere_type_bar_grain'),('equipements_cafetiere','cafetiere_type_bar_moulu'),
    ('equipements_bouilloire','bouilloire_instructions'),
    ('equipements_grille_pain','grille_pain_instructions'),
    ('equipements_hotte','hotte_instructions'),
    ('equipements_blender','blender_instructions'),
    ('equipements_cuiseur_riz','cuiseur_riz_instructions'),
    ('equipements_machine_pain','machine_pain_instructions'),
    ('equipements_autre','equipements_autre_details')
  ) AS d(flag, champ) ON TRUE
  WHERE coalesce(f2.section_cuisine_1->>d.flag, '') <> 'true'
    AND coalesce(f2.section_cuisine_1->>d.champ, '') NOT IN ('', 'false')
  GROUP BY f2.id
) AS o
WHERE f.id = o.id;


-- ── 3. NETTOYAGE des rappels photo orphelins (Cuisine 1) ─────
UPDATE fiche_lite f
SET section_cuisine_1 = jsonb_set(
      f.section_cuisine_1,
      '{photos_rappels}',
      coalesce(f.section_cuisine_1->'photos_rappels', '{}'::jsonb) || o.patch
    )
FROM (
  SELECT f2.id, jsonb_object_agg(r.taken, 'false'::jsonb) AS patch
  FROM fiche_lite f2
  JOIN (VALUES
    ('equipements_refrigerateur','refrigerateur_taken'),('equipements_congelateur','congelateur_taken'),
    ('equipements_mini_refrigerateur','mini_refrigerateur_taken'),('equipements_cuisiniere','cuisiniere_taken'),
    ('equipements_plaque_cuisson','plaque_cuisson_taken'),('equipements_four','four_taken'),
    ('equipements_micro_ondes','micro_ondes_taken'),('equipements_lave_vaisselle','lave_vaisselle_taken'),
    ('equipements_cafetiere','cafetiere_taken'),('equipements_bouilloire','bouilloire_taken'),
    ('equipements_grille_pain','grille_pain_taken'),('equipements_hotte','hotte_taken'),
    ('equipements_blender','blender_taken'),('equipements_cuiseur_riz','cuiseur_riz_taken'),
    ('equipements_machine_pain','machine_pain_taken')
  ) AS r(flag, taken) ON TRUE
  WHERE (f2.section_cuisine_1->'photos_rappels'->>r.taken) = 'true'
    AND coalesce(f2.section_cuisine_1->>r.flag, '') <> 'true'
  GROUP BY f2.id
) AS o
WHERE f.id = o.id;


-- ── 4. NETTOYAGE des rappels photo orphelins (Équipements) ───
UPDATE fiche_lite f
SET section_equipements = jsonb_set(
      f.section_equipements,
      '{photos_rappels}',
      coalesce(f.section_equipements->'photos_rappels', '{}'::jsonb) || o.patch
    )
FROM (
  SELECT f2.id, jsonb_object_agg(r.taken, 'false'::jsonb) AS patch
  FROM fiche_lite f2
  JOIN (VALUES
    ('tv','tv_video_taken'),('tv','tv_consoles_video_taken'),
    ('climatisation','climatisation_video_taken'),('chauffage','chauffage_video_taken'),
    ('ventilateur','ventilateur_taken'),
    ('lave_linge','lave_linge_video_taken'),('seche_linge','seche_linge_video_taken')
  ) AS r(flag, taken) ON TRUE
  WHERE (f2.section_equipements->'photos_rappels'->>r.taken) = 'true'
    AND coalesce(f2.section_equipements->>r.flag, '') <> 'true'
  GROUP BY f2.id
) AS o
WHERE f.id = o.id;


-- ── 5. CONTRÔLE APRÈS ────────────────────────────────────────
-- Ré-exécuter la requête de l'étape 1 : les trois compteurs doivent être à 0.
