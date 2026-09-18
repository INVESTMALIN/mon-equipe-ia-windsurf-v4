// src/lib/animauxLegacy.js
//
// Règle UNIQUE de reprise du champ « animaux acceptés », déplacé de
// `section_equipements` (case à cocher) vers `section_exigences` (radio oui/non),
// alignement coordinateurs. Aucune reprise en base : le repli est appliqué À LA
// LECTURE, tant que la nouvelle clé est vide.
//
// Seul l'ancien `true` est repris (→ 'oui') : l'ancien `false` est la valeur par défaut
// de la case à cocher, indiscernable d'une question jamais répondue — le reprendre en
// 'non' inventerait une réponse sur les fiches qui n'ont jamais traité le sujet.
//
// ⚠️ Deux lecteurs, une seule règle : FicheExigences (écran) et ficheMenageContenu
// (Fiche Ménage). Même précédent que lib/instructionsMenageLegacy.js — sans module
// partagé, l'écran et le document finiraient par diverger sur la même fiche.

/**
 * @param {Object} sectionExigences   — formData.section_exigences
 * @param {Object} sectionEquipements — formData.section_equipements
 * @returns {{ acceptes: 'oui'|'non'|'', commentaire: string }}
 */
export function resolveAnimauxLegacy(sectionExigences, sectionEquipements) {
  const exigences = (sectionExigences && typeof sectionExigences === 'object') ? sectionExigences : {}
  const equipements = (sectionEquipements && typeof sectionEquipements === 'object') ? sectionEquipements : {}

  const legacy = equipements.animaux_acceptes === true ? 'oui' : ''
  const acceptes = exigences.animaux_acceptes || legacy

  const commentaire = exigences.animaux_commentaire || equipements.animaux_commentaire || ''

  return { acceptes, commentaire }
}
