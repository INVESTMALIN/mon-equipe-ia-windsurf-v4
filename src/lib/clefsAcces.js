// src/lib/clefsAcces.js
//
// Interphone, tempo-gâche, digicode (section Clés). Module PUR, sans import :
// testable tel quel (tests/clefsAcces.test.mjs).
//
// Chaque équipement est une question oui/non qui ouvre une branche : un texte
// d'instructions et un rappel photo booléen dans `photos_rappels` (Lite ne
// stocke pas de média). Au passage à « non » (ou réponse retirée), la branche
// est vidée, rappel photo compris : convention BRANCH_SCHEMAS + PHOTOS_SCHEMAS
// de Lite, même règle que la boîte de secours (src/lib/clefsSecours.js).

export const ACCES_BRANCHES = Object.freeze({
  interphone: Object.freeze({ details: 'interphoneDetails', photo: 'interphone_taken' }),
  tempoGache: Object.freeze({ details: 'tempoGacheDetails', photo: 'tempo_gache_taken' }),
  digicode: Object.freeze({ details: 'digicodeDetails', photo: 'digicode_taken' })
})

/**
 * Nouvelle section après la réponse à « équipé d'un <champ> ? ».
 * `non` ou réponse retirée → instructions et rappel photo de la branche remis
 * à vide. `oui` → rien n'est touché. Jamais de mutation.
 */
export function appliquerReponseAcces(section, champ, reponse) {
  const branche = ACCES_BRANCHES[champ]
  if (!branche) throw new Error(`Équipement d'accès inconnu : ${champ}`)
  const base = { ...(section || {}), [champ]: reponse }
  if (reponse === true) return base
  return {
    ...base,
    [branche.details]: '',
    photos_rappels: { ...(base.photos_rappels || {}), [branche.photo]: false }
  }
}
