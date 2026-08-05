// src/lib/instructionsMenageLegacy.js
//
// Règle UNIQUE de reprise des trois champs déplacés de `section_avis` vers
// `section_instructions_menage` (alignement coordinateurs) :
//   - `type_premier_menage`
//   - `type_premiere_maintenance`
//   - `photos_rappels.etat_logement_video_taken`
//
// Aucune reprise de données en base : le repli est appliqué À LA LECTURE. Une fiche
// déjà remplie continue donc d'afficher ses valeurs, et la section Avis n'en garde
// aucune trace visible.
//
// ⚠️ Deux lecteurs, une seule règle. FicheInstructionsMenage l'utilise pour l'écran,
// PdfFormatter pour le document. Sans ce module partagé, l'écran montrerait la valeur
// sous « Instructions Ménage » pendant que le PDF la montrerait sous « Avis » : deux
// documents en désaccord sur la même fiche.

import { TYPES_MAINTENANCE } from './avisGrilleHelpers'

/**
 * Applique le repli et retire les clés héritées de la copie d'Avis.
 * Fonction PURE : n'écrit rien, ne mute pas ses entrées.
 *
 * @param {Object} sectionInstructions — formData.section_instructions_menage
 * @param {Object} sectionAvis         — formData.section_avis
 * @returns {{ instructions: Object, avis: Object }}
 */
export function resolveInstructionsMenageLegacy(sectionInstructions, sectionAvis) {
  const inst = (sectionInstructions && typeof sectionInstructions === 'object') ? sectionInstructions : {}
  const avis = (sectionAvis && typeof sectionAvis === 'object') ? sectionAvis : {}

  // Lite proposait ici les valeurs de MÉNAGE (TYPES_PASSAGE) alors que la liste métier
  // est TYPES_MAINTENANCE. Une ancienne valeur absente de la nouvelle liste n'est pas
  // reprise : elle s'afficherait sans bouton correspondant. Volume négligeable, aucun
  // script de reprise (décision produit).
  const legacyMaintenance = TYPES_MAINTENANCE.includes(avis.type_premiere_maintenance)
    ? avis.type_premiere_maintenance
    : null

  const legacyVideo = avis.photos_rappels?.etat_logement_video_taken

  const instructions = {
    ...inst,
    type_premier_menage: inst.type_premier_menage || avis.type_premier_menage || null,
    type_premiere_maintenance: inst.type_premiere_maintenance || legacyMaintenance,
    photos_rappels: {
      ...(inst.photos_rappels || {}),
      etat_logement_video_taken: inst.photos_rappels?.etat_logement_video_taken || legacyVideo || false,
    },
  }

  // Les clés héritées quittent la copie d'Avis. Deux raisons :
  //   - le PDF est générique (il rend toutes les clés de toutes les sections) : les
  //     laisser afficherait deux fois la même information, sous deux titres ;
  //   - un `false` hérité, n'étant plus un défaut connu de section_avis, sortirait en
  //     « État logement vidéo taken : Non » — une ligne fantôme.
  const {
    type_premier_menage: _menageHerite,
    type_premiere_maintenance: _maintenanceHeritee,
    photos_rappels: photosRappelsAvis,
    ...resteAvis
  } = avis

  const avisNettoye = { ...resteAvis }
  if (photosRappelsAvis && typeof photosRappelsAvis === 'object') {
    const { etat_logement_video_taken: _videoHeritee, ...restePhotos } = photosRappelsAvis
    avisNettoye.photos_rappels = restePhotos
  } else if (photosRappelsAvis !== undefined) {
    avisNettoye.photos_rappels = photosRappelsAvis
  }

  return { instructions, avis: avisNettoye }
}
