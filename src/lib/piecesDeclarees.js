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
// Le nombre n'a de sens que si le type de pièce est COCHÉ en Visite : décocher
// « Chambre » masque le sélecteur de nombre sans le vider, et ce nombre retenu ne
// désigne plus rien. Non coché → aucune pièce active.
//
// Cas studio : une typologie « Studio » sans chambre active affiche UN espace nuit
// (même règle que FicheChambre), que « Chambre » soit coché ou non.
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
  const nombre = sectionVisite?.pieces_chambre === true ? entier(sectionVisite?.nombre_chambres) : 0
  const espaceNuit = sectionLogement?.typologie === 'Studio' && nombre === 0
  return { nombre: espaceNuit ? 1 : nombre, espaceNuit }
}

/** @returns {number} enregistrements salle_de_bain_1..salle_de_bain_N à considérer. */
export function sallesDeBainsDeclarees(sectionVisite) {
  return sectionVisite?.pieces_salle_bains === true ? entier(sectionVisite?.nombre_salles_bains) : 0
}
