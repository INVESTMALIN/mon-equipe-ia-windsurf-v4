// Boîte à clés de secours (section Clés) — parité avec Fiche Logement.
//
// Ce qui est verrouillé :
//   - nettoyage de la branche abandonnée (« non », changement de type), rappels
//     photo compris, sans mutation ;
//   - PDF Fiche Logement (vrai pipeline formatForPdf → buildDocDefinition) : le
//     bloc sort sur « oui », rien sur « non », et ce qui sortait avant sort encore ;
//   - Fiche Ménage : seul le code ménage de la boîte de secours sort, jamais le
//     masterpin ni le code propriétaire.
// Fiches synthétiques, aucune donnée réelle, aucun réseau.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  SECOURS_TYPES,
  appliquerReponseSecours,
  appliquerTypeSecours,
  boiteSecoursMenage
} from '../src/lib/clefsSecours.js'
import { initialFormData } from '../src/lib/formDefaults.js'
import { buildDocDefinition } from '../src/lib/PdfBuilder.js'
import { construireContenuMenage, texteIntegral } from '../src/lib/ficheMenageContenu.js'

const C = {
  emplacement: 'CANARI-EMPLACEMENT-SECOURS',
  emballage: 'CANARI-EMBALLAGE-SECOURS',
  masterpin: 'CANARI-MASTERPIN-S',
  proprio: 'CANARI-PROPRIO-S',
  menage: 'CANARI-MENAGE-S',
  masterlock: 'CANARI-MASTERLOCK-S',
  principal: 'CANARI-EMPLACEMENT-PRINCIPAL'
}

const sectionOui = () => ({
  ...structuredClone(initialFormData.section_clefs),
  boiteType: 'Masterlock',
  emplacementBoite: C.principal,
  masterlock: { code: '1111' },
  secours: true,
  secoursType: 'TTlock',
  secoursEmplacement: C.emplacement,
  secoursEmplacementEmballage: C.emballage,
  secoursTtlock: { masterpinConciergerie: C.masterpin, codeProprietaire: C.proprio, codeMenage: C.menage },
  secoursMasterlock: { code: C.masterlock },
  photos_rappels: {
    ...initialFormData.section_clefs.photos_rappels,
    emballage_taken: true,
    secours_emplacement_taken: true,
    secours_emballage_taken: true
  }
})

const fiche = (sectionClefs) => ({ ...structuredClone(initialFormData), nom: 'Fiche test', section_clefs: sectionClefs })

// Tout le texte d'un docDefinition, quel que soit le nœud qui le porte.
const textes = (noeud, acc = []) => {
  if (noeud === null || noeud === undefined) return acc
  if (typeof noeud === 'string') acc.push(noeud)
  else if (Array.isArray(noeud)) noeud.forEach((n) => textes(n, acc))
  else if (typeof noeud === 'object') {
    if (typeof noeud.text === 'string') acc.push(noeud.text)
    for (const [k, v] of Object.entries(noeud)) if (k !== 'text' && k !== 'svg') textes(v, acc)
  }
  return acc
}
const textePdf = (sectionClefs) => textes(buildDocDefinition(fiche(sectionClefs)).content).join('\n')

// ── Nettoyage ────────────────────────────────────────────────────────────────

test('« non » : type, emplacements, codes ET rappels photo de secours vidés ; boîte principale intacte', () => {
  const s = appliquerReponseSecours(sectionOui(), false)
  assert.equal(s.secours, false)
  assert.equal(s.secoursType, '')
  assert.equal(s.secoursEmplacement, '')
  assert.equal(s.secoursEmplacementEmballage, '')
  assert.deepEqual(s.secoursTtlock, { masterpinConciergerie: '', codeProprietaire: '', codeMenage: '' })
  assert.deepEqual(s.secoursMasterlock, { code: '' })
  assert.equal(s.photos_rappels.secours_emplacement_taken, false)
  assert.equal(s.photos_rappels.secours_emballage_taken, false)
  // Les autres rappels et la boîte principale ne bougent pas
  assert.equal(s.photos_rappels.emballage_taken, true)
  assert.equal(s.emplacementBoite, C.principal)
  assert.deepEqual(s.masterlock, { code: '1111' })
})

test('réponse retirée (null) : même nettoyage ; « oui » : rien d\'effacé', () => {
  assert.equal(appliquerReponseSecours(sectionOui(), null).secoursTtlock.codeMenage, '')
  const oui = appliquerReponseSecours({ ...sectionOui(), secours: false }, true)
  assert.equal(oui.secoursEmplacement, C.emplacement)
  assert.equal(oui.photos_rappels.secours_emplacement_taken, true)
})

test('changement de type : codes de l\'autre type vidés, ceux du type choisi conservés', () => {
  const versMasterlock = appliquerTypeSecours(sectionOui(), 'Masterlock')
  assert.deepEqual(versMasterlock.secoursTtlock, { masterpinConciergerie: '', codeProprietaire: '', codeMenage: '' })
  assert.deepEqual(versMasterlock.secoursMasterlock, { code: C.masterlock })
  const versTtlock = appliquerTypeSecours(sectionOui(), 'TTlock')
  assert.deepEqual(versTtlock.secoursMasterlock, { code: '' })
  assert.equal(versTtlock.secoursTtlock.codeMenage, C.menage)
})

test('aucune mutation de la section d\'origine (photos_rappels compris)', () => {
  const origine = sectionOui()
  appliquerReponseSecours(origine, false)
  appliquerTypeSecours(origine, 'Masterlock')
  assert.equal(origine.photos_rappels.secours_emplacement_taken, true)
  assert.equal(origine.secoursTtlock.codeMenage, C.menage)
})

test('types proposés : TTlock et Masterlock uniquement ; clés alignées sur les coordinateurs', () => {
  assert.deepEqual([...SECOURS_TYPES], ['TTlock', 'Masterlock'])
  for (const cle of ['secours', 'secoursType', 'secoursEmplacement', 'secoursEmplacementEmballage', 'secoursTtlock', 'secoursMasterlock']) {
    assert.ok(cle in initialFormData.section_clefs, `défaut manquant : ${cle}`)
  }
  // Défauts neutres : une fiche créée avant le champ ne reçoit aucune valeur
  assert.equal(initialFormData.section_clefs.secours, null)
  assert.equal(initialFormData.section_clefs.secoursType, '')
})

// ── PDF Fiche Logement ───────────────────────────────────────────────────────

test('PDF logement « oui » : le bloc de secours sort, libellés lisibles, rappels photo nommés', () => {
  const t = textePdf(sectionOui())
  for (const v of [C.emplacement, C.emballage, C.masterpin, C.proprio, C.menage]) assert.ok(t.includes(v), `absent du PDF : ${v}`)
  for (const libelle of ['Boîte à clés de secours', 'Type de la boîte de secours', 'Emplacement de la boîte de secours', 'Codes TTlock (boîte de secours)']) {
    assert.ok(t.includes(libelle), `libellé absent : ${libelle}`)
  }
  assert.ok(t.includes('emplacement de la boîte de secours'), 'rappel photo emplacement secours')
  assert.ok(t.includes('emballage de la boîte de secours'), 'rappel photo emballage secours')
})

test('PDF logement après « non » : plus rien du bloc de secours, la réponse « Non » reste', () => {
  const t = textePdf(appliquerReponseSecours(sectionOui(), false))
  for (const v of [C.emplacement, C.emballage, C.masterpin, C.proprio, C.menage, C.masterlock]) assert.ok(!t.includes(v), `fuite dans le PDF : ${v}`)
  assert.ok(!t.includes('emballage de la boîte de secours'))
  assert.match(t, /Boîte à clés de secours/)
})

test('PDF logement : ce qui sortait avant sort encore (boîte principale), et une fiche sans réponse ne montre rien de nouveau', () => {
  const avecSecours = textePdf(sectionOui())
  assert.ok(avecSecours.includes(C.principal))
  assert.ok(avecSecours.includes('1111'))
  const sansReponse = textePdf({ ...structuredClone(initialFormData.section_clefs), boiteType: 'Masterlock', emplacementBoite: C.principal, masterlock: { code: '1111' } })
  assert.ok(sansReponse.includes(C.principal))
  assert.ok(!/secours/i.test(sansReponse), 'une fiche sans réponse ne doit rien afficher de la boîte de secours')
})

// ── Fiche Ménage ─────────────────────────────────────────────────────────────

test('Fiche Ménage « oui » + TTlock : type, emplacement et code ménage de secours ; jamais masterpin ni code propriétaire', () => {
  const t = texteIntegral(construireContenuMenage(fiche(sectionOui())))
  assert.ok(t.includes(C.menage))
  assert.ok(t.includes(C.emplacement))
  assert.ok(t.includes('Code ménage (boîte de secours)'))
  assert.ok(!t.includes(C.masterpin), 'masterpin de secours dans la Fiche Ménage')
  assert.ok(!t.includes(C.proprio), 'code propriétaire de secours dans la Fiche Ménage')
  // Le code Masterlock orphelin (type non déclaré) ne sort pas
  assert.ok(!t.includes(C.masterlock))
})

test('Fiche Ménage « oui » + Masterlock : le code Masterlock de secours sort', () => {
  const t = texteIntegral(construireContenuMenage(fiche(appliquerTypeSecours(sectionOui(), 'Masterlock'))))
  assert.ok(t.includes(C.masterlock))
  assert.ok(!t.includes(C.menage))
})

test('Fiche Ménage « non » ou sans réponse : rien de la boîte de secours', () => {
  for (const s of [appliquerReponseSecours(sectionOui(), false), { ...sectionOui(), secours: null }]) {
    const t = texteIntegral(construireContenuMenage(fiche(s)))
    assert.ok(!t.includes('secours'), t)
  }
  assert.deepEqual(boiteSecoursMenage({ secours: true, secoursType: 'Igloohome' }), { type: null, code: null })
})
