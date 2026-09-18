// src/lib/piecesDeclarees.js
//
// Règle UNIQUE du nombre de chambres et de salles de bains ACTIVES d'une fiche.
//
// Les écrans Chambres et Salle de bains n'affichent que les N premiers enregistrements,
// N venant de la section Visite (`nombre_chambres`, `nombre_salles_bains`). Quand ce
// nombre baisse, les enregistrements en surplus ne sont PAS effacés : ils restent en
// mémoire et en base, invisibles à l'écran. Tout lecteur qui parcourrait les six
// enregistrements sans cette règle ressortirait donc des lits et des équipements que
// le concierge croit avoir retirés.
//
// Cas studio : une typologie « Studio » sans chambre déclarée affiche UN espace nuit
// (même règle que FicheChambre).
//
// ⚠️ Deux lecteurs, une seule règle : FicheChambre / FicheSalleDeBains (écran) et
// ficheMenageContenu (Fiche Ménage). Même précédent que lib/instructionsMenageLegacy.

const entier = (v) => parseInt(v) || 0

/**
 * @param {Object} sectionVisite   — formData.section_visite
 * @param {Object} sectionLogement — formData.section_logement
 * @returns {{ nombre: number, espaceNuit: boolean }}
 *   `nombre` = enregistrements chambre_1..chambre_N à considérer ;
 *   `espaceNuit` = true quand ce seul enregistrement est l'espace nuit d'un studio.
 */
export function chambresDeclarees(sectionVisite, sectionLogement) {
  const nombre = entier(sectionVisite?.nombre_chambres)
  const espaceNuit = sectionLogement?.typologie === 'Studio' && nombre === 0
  return { nombre: espaceNuit ? 1 : nombre, espaceNuit }
}

/** @returns {number} enregistrements salle_de_bain_1..salle_de_bain_N à considérer. */
export function sallesDeBainsDeclarees(sectionVisite) {
  return entier(sectionVisite?.nombre_salles_bains)
}
