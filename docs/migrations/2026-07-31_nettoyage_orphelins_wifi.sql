-- ============================================================
-- Nettoyage : identifiants WiFi orphelins (données existantes)
-- Date     : 2026-07-31
-- Branche  : fix/wifi-nettoyage-non-branche
-- ============================================================
-- Script de DONNÉES, pas de schéma (cf. CLAUDE.md § « Deux dossiers SQL »).
-- À exécuter dans le SQL Editor du dashboard Supabase, PAR JULIEN, une fois,
-- APRÈS le déploiement du correctif de code.
--
-- Contexte : `handleWifiStatutChange` implémentait le nettoyage des champs
-- conditionnels WiFi, mais n'était câblé sur aucun des 3 boutons radio — les
-- coordinateurs le câblent, Lite avait copié le handler sans le branchement.
-- Le nettoyage ne s'exécutait donc jamais. Changer le statut de « Oui » vers
-- « Non » ou « En cours » laissait le SSID et le mot de passe en base, et le
-- PDF (générique) les imprimait sur un logement déclaré sans WiFi.
--
-- Conditions dérivées de la règle du formulaire, pas d'un relevé :
--   - SSID / mot de passe / rappel photo routeur ne sont saisissables que sous
--     `wifi_statut = 'oui'`  → orphelins dès que le statut vaut autre chose.
--   - `wifi_details` n'est saisissable que sous `wifi_statut = 'en_cours'`.
-- Le nettoyage ne touche QUE les fiches dont le statut est explicitement
-- renseigné : une fiche sans réponse n'a jamais traité la question, on ne
-- présume rien (relevé du 31/07 : 14 fiches dans ce cas, aucune ne porte de
-- donnée WiFi — la condition est une précaution, pas un correctif).
--
-- ⚠️ Le statut non répondu vaut la chaîne VIDE, pas NULL : `wifi_statut: ""`
-- est le défaut de formDefaults.js, sérialisé tel quel en JSONB. Un garde-fou
-- `IS NOT NULL` ne filtrerait donc RIEN et effacerait les identifiants d'une
-- fiche jamais renseignée. D'où l'énumération explicite des statuts répondus
-- ci-dessous, qui exclut aussi toute valeur inattendue.
--
-- Relevé du 31/07/2026 sur les 52 fiches, à titre indicatif :
--   - 1 fiche : statut « en_cours » avec SSID + mot de passe renseignés
--   - 0 pour les détails d'installation, 0 pour le rappel photo
-- ============================================================


-- ── 1. CONTRÔLE AVANT ────────────────────────────────────────
-- Attendu : 1 / 0 / 0
SELECT
  count(*) FILTER (WHERE section_equipements->>'wifi_statut' IN ('en_cours','non')
                     AND coalesce(section_equipements->>'wifi_nom_reseau','')
                      || coalesce(section_equipements->>'wifi_mot_de_passe','') <> ''
                  ) AS orphelins_identifiants,
  count(*) FILTER (WHERE section_equipements->>'wifi_statut' IN ('oui','non')
                     AND coalesce(section_equipements->>'wifi_details','') <> ''
                  ) AS orphelins_details,
  count(*) FILTER (WHERE section_equipements->>'wifi_statut' IN ('en_cours','non')
                     AND (section_equipements->'photos_rappels'->>'wifi_routeur_photo_taken') = 'true'
                  ) AS orphelins_rappel_photo
FROM fiche_lite;


-- ── 2. Identifiants saisissables uniquement sous « Oui » ─────
UPDATE fiche_lite
SET section_equipements = section_equipements || jsonb_build_object(
      'wifi_nom_reseau', '',
      'wifi_mot_de_passe', ''
    )
WHERE section_equipements->>'wifi_statut' IN ('en_cours','non')
  AND coalesce(section_equipements->>'wifi_nom_reseau','')
   || coalesce(section_equipements->>'wifi_mot_de_passe','') <> '';


-- ── 3. Détails d'installation saisissables uniquement sous « En cours » ──
UPDATE fiche_lite
SET section_equipements = section_equipements || jsonb_build_object('wifi_details', '')
WHERE section_equipements->>'wifi_statut' IN ('oui','non')
  AND coalesce(section_equipements->>'wifi_details','') <> '';


-- ── 4. Rappel photo routeur, proposé uniquement sous « Oui » ─
UPDATE fiche_lite
SET section_equipements = jsonb_set(
      section_equipements,
      '{photos_rappels,wifi_routeur_photo_taken}',
      'false'::jsonb
    )
WHERE section_equipements->>'wifi_statut' IN ('en_cours','non')
  AND (section_equipements->'photos_rappels'->>'wifi_routeur_photo_taken') = 'true';


-- ── 5. CONTRÔLE APRÈS ────────────────────────────────────────
-- Ré-exécuter la requête de l'étape 1 : les trois compteurs doivent être à 0.
