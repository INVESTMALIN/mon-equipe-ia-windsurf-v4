// États de la génération d'un PDF, partagés par FormContext (qui les porte),
// GenerationPdfOverlay (qui les affiche) et l'écran de finalisation (qui les fait
// avancer). Dans un module à part pour qu'aucun de ces trois n'ait à importer les
// deux autres.
//
// Deux phases bien distinctes, et c'est volontaire : le RENDU du PDF et
// l'ENREGISTREMENT de sa preuve échouent pour des raisons différentes, appellent des
// messages différents et se rattrapent différemment. Un « réessayer » sur la seconde
// ne doit surtout pas relancer la première : le fichier est déjà chez l'utilisateur.
//
//   INACTIF                aucune génération en cours.
//
//   ── phase 1 : rendu ──
//   EN_COURS               du lancement jusqu'à la remise du fichier. Navigation et
//                          saisie bloquées : le verrou d'identité n'est posé qu'après
//                          la remise, et une modification faite entre-temps serait
//                          figée par un PDF sans elle.
//   PROLONGE               le délai de garde du rendu a expiré, mais celui-ci peut
//                          ENCORE aboutir. Ce n'est donc pas un échec : on le dit, et
//                          on offre une sortie sûre (recharger, sans rien écrire).
//
//   ── phase 2 : enregistrement de la preuve ──
//   ENREGISTREMENT         le fichier est remis, on écrit `pdf_generated_at` (et le
//                          verrou Lite). Le voile reste, sinon l'utilisateur croirait
//                          l'opération finie alors que la preuve manque encore.
//   ENREGISTREMENT_ECHOUE  écriture échouée ou expirée. Le PDF est bien téléchargé,
//                          mais son enregistrement n'est pas confirmé : sans badge, et
//                          sans verrou côté Lite. On le dit explicitement et on propose
//                          de réessayer l'ENREGISTREMENT SEUL.
export const GENERATION_PDF = {
  INACTIF: 'inactif',
  EN_COURS: 'en_cours',
  PROLONGE: 'prolonge',
  ENREGISTREMENT: 'enregistrement',
  ENREGISTREMENT_ECHOUE: 'enregistrement_echoue',
}

// États pendant lesquels l'identité du bien doit rester gelée : tant que la preuve
// n'est pas confirmée, le verrou peut encore tomber, et il ne doit pas figer une
// identité que le PDF déjà téléchargé ne contient pas.
export const GENERATION_PDF_BLOQUANTS = [
  GENERATION_PDF.EN_COURS,
  GENERATION_PDF.PROLONGE,
  GENERATION_PDF.ENREGISTREMENT,
  GENERATION_PDF.ENREGISTREMENT_ECHOUE,
]
