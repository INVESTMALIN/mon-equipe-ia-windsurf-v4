// États de la génération d'un PDF, partagés par FormContext (qui les porte),
// GenerationPdfOverlay (qui les affiche) et l'écran de finalisation (qui les fait
// avancer). Dans un module à part pour qu'aucun de ces trois n'ait à importer les
// deux autres.
//
//   INACTIF   aucune génération en cours.
//   EN_COURS  du lancement jusqu'à la remise du fichier. Navigation et saisie
//             bloquées : le verrou d'identité n'est posé qu'après la remise, et une
//             modification faite entre-temps serait figée par un PDF sans elle.
//   PROLONGE  le délai de garde a expiré, mais le rendu peut ENCORE aboutir. Ce
//             n'est donc pas un échec : on le dit à l'utilisateur et on lui offre
//             une sortie sûre (recharger la fiche, sans écrire ni verrouiller).
export const GENERATION_PDF = {
  INACTIF: 'inactif',
  EN_COURS: 'en_cours',
  PROLONGE: 'prolonge',
}
