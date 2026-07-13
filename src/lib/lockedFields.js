// Chemins (dot-path, style updateField/getField) des champs qui IDENTIFIENT le bien.
// Verrouillés côté UI ET côté back après la 1re génération de PDF d'une fiche fiche_lite.
//
// ⚠️ Doit rester synchronisé avec la projection SQL `fiche_lite_locked_projection`
// (migration 20260713170000_fiche_lite_field_lock) : même liste de sous-clés.
export const LOCKED_FIELD_PATHS = [
  // Section 1 — Propriétaire : identité + adresse du bien
  'section_proprietaire.prenom',
  'section_proprietaire.nom',
  'section_proprietaire.adresse.rue',
  'section_proprietaire.adresse.complement',
  'section_proprietaire.adresse.ville',
  'section_proprietaire.adresse.codePostal',
  // Section 2 — Logement : nature physique du bien
  'section_logement.type_propriete',
  'section_logement.type_autre_precision',
  'section_logement.surface',
  'section_logement.typologie',
  'section_logement.maison_niveau',
  // Section 2 conditionnels (appartement / studio)
  'section_logement.appartement.nom_residence',
  'section_logement.appartement.batiment',
  'section_logement.appartement.etage',
  'section_logement.appartement.numero_porte',
  'section_logement.studio.nom_residence',
  'section_logement.studio.batiment',
  'section_logement.studio.etage',
  'section_logement.studio.numero_porte',
]

const LOCKED_SET = new Set(LOCKED_FIELD_PATHS)

// true si `path` est un champ d'identité du bien (verrouillable).
export const isLockedFieldPath = (path) => LOCKED_SET.has(path)
