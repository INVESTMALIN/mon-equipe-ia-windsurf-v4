-- ============================================================
-- Nettoyage : valeurs conditionnelles orphelines (données existantes)
-- Date     : 2026-07-31
-- Branche  : fix/nettoyage-branches-conditionnelles
-- ============================================================
-- À exécuter dans le SQL Editor du dashboard Supabase, PAR JULIEN.
-- ⚠️ Ce script MODIFIE des fiches de production. Il n'est PAS une migration
--    de schéma : aucune colonne n'est ajoutée, seules des clés JSONB sont
--    remises à leur valeur « non renseigné ».
--
-- Contexte : décocher un appareil de Cuisine 1 ne vidait pas ses champs
-- conditionnels. Le PDF étant générique, il décrivait ensuite un appareil que
-- le logement n'a pas. Le correctif de code empêche les NOUVEAUX orphelins ;
-- ce script traite ceux déjà écrits.
--
-- Périmètre mesuré le 31/07/2026 sur les 52 fiches :
--   - 3 fiches : détails `cuisiniere_*` alors que equipements_cuisiniere = null
--   - 1 fiche  : rappel photo d'une branche Équipements décochée
--   Aucun autre orphelin (Cuisine 1 rappels photo : 0, Extérieur : 0).
--
-- ORDRE : appliquer APRÈS le merge et le déploiement du correctif de code.
-- Sinon un concierge encore servi par l'ancien build peut réécrire un orphelin
-- entre le nettoyage et la mise en ligne.
-- ============================================================

-- ── 1. CONTRÔLE AVANT ────────────────────────────────────────
-- Doit renvoyer 3 lignes (détails cuisinière orphelins).
SELECT id, nom
FROM fiche_lite
WHERE coalesce(section_cuisine_1->>'equipements_cuisiniere', '') <> 'true'
  AND coalesce(section_cuisine_1->>'cuisiniere_marque', '')
   || coalesce(section_cuisine_1->>'cuisiniere_type', '')
   || coalesce(section_cuisine_1->>'cuisiniere_nombre_feux', '')
   || coalesce(section_cuisine_1->>'cuisiniere_instructions', '') <> '';

-- ── 2. NETTOYAGE des détails cuisinière orphelins ────────────
-- Remet les 4 champs à "" (leur défaut dans formDefaults), sans toucher au
-- reste de la section ni aux autres appareils.
UPDATE fiche_lite
SET section_cuisine_1 = section_cuisine_1 || jsonb_build_object(
      'cuisiniere_marque', '',
      'cuisiniere_type', '',
      'cuisiniere_nombre_feux', '',
      'cuisiniere_instructions', ''
    )
WHERE coalesce(section_cuisine_1->>'equipements_cuisiniere', '') <> 'true'
  AND coalesce(section_cuisine_1->>'cuisiniere_marque', '')
   || coalesce(section_cuisine_1->>'cuisiniere_type', '')
   || coalesce(section_cuisine_1->>'cuisiniere_nombre_feux', '')
   || coalesce(section_cuisine_1->>'cuisiniere_instructions', '') <> '';

-- ── 3. NETTOYAGE des rappels photo orphelins (section Équipements) ──
-- Décoche les rappels photo dont la branche parente n'est pas cochée.
--
-- ⚠️ Les paires (branche, rappel) sont AGRÉGÉES par fiche avant l'UPDATE.
-- Un `UPDATE ... FROM (VALUES ...)` qui produit plusieurs lignes source pour la
-- même ligne cible ne met à jour cette ligne QU'UNE FOIS, avec une seule des
-- lignes source : une fiche portant deux rappels orphelins n'en verrait nettoyer
-- qu'un. Le GROUP BY garantit une seule ligne source par fiche, et le patch
-- applique toutes ses clés d'un coup.
UPDATE fiche_lite f
SET section_equipements = jsonb_set(
      f.section_equipements,
      '{photos_rappels}',
      coalesce(f.section_equipements->'photos_rappels', '{}'::jsonb) || o.patch
    )
FROM (
  SELECT f2.id, jsonb_object_agg(m.taken, 'false'::jsonb) AS patch
  FROM fiche_lite f2
  JOIN (VALUES
    ('tv','tv_video_taken'), ('tv','tv_consoles_video_taken'),
    ('climatisation','climatisation_video_taken'), ('chauffage','chauffage_video_taken'),
    ('ventilateur','ventilateur_taken'),
    ('lave_linge','lave_linge_video_taken'), ('seche_linge','seche_linge_video_taken')
  ) AS m(flag, taken) ON TRUE
  WHERE (f2.section_equipements->'photos_rappels'->>m.taken) = 'true'
    AND coalesce(f2.section_equipements->>m.flag, '') <> 'true'
  GROUP BY f2.id
) AS o
WHERE f.id = o.id;

-- ── 4. CONTRÔLE APRÈS ────────────────────────────────────────
-- Les deux compteurs doivent être à 0.
SELECT
  (SELECT count(*) FROM fiche_lite
     WHERE coalesce(section_cuisine_1->>'equipements_cuisiniere','') <> 'true'
       AND coalesce(section_cuisine_1->>'cuisiniere_marque','')
        || coalesce(section_cuisine_1->>'cuisiniere_type','')
        || coalesce(section_cuisine_1->>'cuisiniere_nombre_feux','')
        || coalesce(section_cuisine_1->>'cuisiniere_instructions','') <> '') AS reste_details_cuisiniere,
  (SELECT count(DISTINCT f.id) FROM fiche_lite f
     JOIN (VALUES
       ('tv','tv_video_taken'), ('tv','tv_consoles_video_taken'),
       ('climatisation','climatisation_video_taken'), ('chauffage','chauffage_video_taken'),
       ('ventilateur','ventilateur_taken'),
       ('lave_linge','lave_linge_video_taken'), ('seche_linge','seche_linge_video_taken')
     ) AS m(flag, taken) ON TRUE
     WHERE (f.section_equipements->'photos_rappels'->>m.taken) = 'true'
       AND coalesce(f.section_equipements->>m.flag,'') <> 'true') AS reste_rappels_photo;
