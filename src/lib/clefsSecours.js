// src/lib/clefsSecours.js
//
// Boîte à clés de SECOURS (section Clés, septembre 2026, demande Victoria).
// Module PUR, sans import : testable tel quel (tests/clefsSecours.test.mjs).
//
// Parité avec Fiche Logement (coordinateurs, même nom de fichier) : mêmes clés
// dans `section_clefs`, mêmes types proposés. Différences propres à Lite :
//   - pas de photos stockées : deux rappels booléens dans `photos_rappels`
//     (`secours_emplacement_taken`, `secours_emballage_taken`) ;
//   - donc, au passage à « non », les rappels photo sont remis à false comme
//     le reste de la branche (convention BRANCH_SCHEMAS + PHOTOS_SCHEMAS de
//     Lite) — côté coordinateurs les photos, elles, ne sont jamais effacées ;
//   - aucune synchronisation Monday (les biens des concierges ne sont pas des
//     lignes du board Clients Letahost).
//
//   section_clefs.secours                      true / false / null
//   section_clefs.secoursType                  'TTlock' | 'Masterlock' | ''
//   section_clefs.secoursEmplacement           texte
//   section_clefs.secoursEmplacementEmballage  texte
//   section_clefs.secoursTtlock.{masterpinConciergerie, codeProprietaire, codeMenage}
//   section_clefs.secoursMasterlock.code
//   section_clefs.photos_rappels.secours_emplacement_taken / secours_emballage_taken

export const SECOURS_TYPES = Object.freeze(['TTlock', 'Masterlock'])

export const SECOURS_RAPPELS_PHOTO = Object.freeze(['secours_emplacement_taken', 'secours_emballage_taken'])

const TTLOCK_VIDE = Object.freeze({ masterpinConciergerie: '', codeProprietaire: '', codeMenage: '' })
const MASTERLOCK_VIDE = Object.freeze({ code: '' })

/**
 * Nouvelle section après la réponse à « boîte à clés de secours ? ».
 * `non` ou réponse retirée → type, emplacements, codes et rappels photo de la
 * branche remis à vide. `oui` → rien n'est touché. Jamais de mutation.
 */
export function appliquerReponseSecours(section, reponse) {
  const base = { ...(section || {}), secours: reponse }
  if (reponse === true) return base
  const rappels = { ...(base.photos_rappels || {}) }
  for (const cle of SECOURS_RAPPELS_PHOTO) rappels[cle] = false
  return {
    ...base,
    secoursType: '',
    secoursEmplacement: '',
    secoursEmplacementEmballage: '',
    secoursTtlock: { ...TTLOCK_VIDE },
    secoursMasterlock: { ...MASTERLOCK_VIDE },
    photos_rappels: rappels
  }
}

/**
 * Nouvelle section après le choix du type : les codes de l'AUTRE type sont
 * vidés, ceux du type choisi conservés.
 */
export function appliquerTypeSecours(section, type) {
  const base = { ...(section || {}), secoursType: type }
  if (type !== 'TTlock') base.secoursTtlock = { ...TTLOCK_VIDE }
  if (type !== 'Masterlock') base.secoursMasterlock = { ...MASTERLOCK_VIDE }
  return base
}

/**
 * Pour la Fiche Ménage : type et code ménage de la boîte de secours, seulement
 * si la réponse est « oui » et le type reconnu. Comme pour la boîte principale,
 * seul le code destiné au ménage sort (jamais masterpin ni code propriétaire).
 */
export function boiteSecoursMenage(section) {
  if (section?.secours !== true || !SECOURS_TYPES.includes(section?.secoursType)) return { type: null, code: null }
  const brut = section.secoursType === 'TTlock' ? section.secoursTtlock?.codeMenage : section.secoursMasterlock?.code
  const code = typeof brut === 'string' && brut.trim() ? brut.trim() : null
  return { type: section.secoursType, code }
}
