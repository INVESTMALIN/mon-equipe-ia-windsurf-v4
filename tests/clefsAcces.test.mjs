// Rappels photo de la section Clés : emplacement de la boîte, interphone,
// tempo-gâche, digicode.
//
// Ce qui est verrouillé :
//   - nettoyage de la branche interphone / tempo-gâche / digicode à « non »
//     (instructions + rappel photo), sans toucher aux autres branches ni muter ;
//   - PDF Fiche Logement (vrai pipeline formatForPdf → buildDocDefinition) :
//     chaque rappel coché sort sous son propre libellé, l'emplacement de la
//     boîte n'est plus confondu avec les clés physiques.
// Fiches synthétiques, aucune donnée réelle, aucun réseau.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { ACCES_BRANCHES, appliquerReponseAcces } from '../src/lib/clefsAcces.js'
import { initialFormData } from '../src/lib/formDefaults.js'
import { buildDocDefinition } from '../src/lib/PdfBuilder.js'

const sectionOui = () => ({
  ...structuredClone(initialFormData.section_clefs),
  boiteType: 'Masterlock',
  interphone: true,
  interphoneDetails: 'CANARI-INTERPHONE',
  tempoGache: true,
  tempoGacheDetails: 'CANARI-TEMPO',
  digicode: true,
  digicodeDetails: 'CANARI-DIGICODE',
  photos_rappels: {
    ...initialFormData.section_clefs.photos_rappels,
    emplacement_taken: true,
    interphone_taken: true,
    tempo_gache_taken: true,
    digicode_taken: true
  }
})

const fiche = (sectionClefs) => ({ ...structuredClone(initialFormData), nom: 'Fiche test', section_clefs: sectionClefs })

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
const lignesPdf = (sectionClefs) => textes(buildDocDefinition(fiche(sectionClefs)).content)

// Les lignes rendues APRÈS l'intitulé « Photos prises » de la section Clés.
const photosPrises = (sectionClefs) => {
  const l = lignesPdf(sectionClefs)
  const debut = l.indexOf('Photos prises')
  return debut === -1 ? [] : l.slice(debut + 1)
}

// ── Nettoyage ────────────────────────────────────────────────────────────────

for (const [champ, { details, photo }] of Object.entries(ACCES_BRANCHES)) {
  test(`« non » sur ${champ} : instructions et rappel photo vidés, le reste intact`, () => {
    const s = appliquerReponseAcces(sectionOui(), champ, false)
    assert.equal(s[champ], false)
    assert.equal(s[details], '')
    assert.equal(s.photos_rappels[photo], false)
    for (const [autre, b] of Object.entries(ACCES_BRANCHES)) {
      if (autre === champ) continue
      assert.equal(s[autre], true)
      assert.notEqual(s[b.details], '')
      assert.equal(s.photos_rappels[b.photo], true)
    }
    assert.equal(s.photos_rappels.emplacement_taken, true)
    assert.equal(s.boiteType, 'Masterlock')
  })
}

test('réponse retirée (null) : même nettoyage ; « oui » : rien d\'effacé', () => {
  const retire = appliquerReponseAcces(sectionOui(), 'digicode', null)
  assert.equal(retire.digicode, null)
  assert.equal(retire.photos_rappels.digicode_taken, false)
  const oui = appliquerReponseAcces({ ...sectionOui(), interphone: false }, 'interphone', true)
  assert.equal(oui.interphoneDetails, 'CANARI-INTERPHONE')
  assert.equal(oui.photos_rappels.interphone_taken, true)
})

test('aucune mutation de la section d\'origine (photos_rappels compris)', () => {
  const origine = sectionOui()
  appliquerReponseAcces(origine, 'tempoGache', false)
  assert.equal(origine.tempoGacheDetails, 'CANARI-TEMPO')
  assert.equal(origine.photos_rappels.tempo_gache_taken, true)
})

test('section sans photos_rappels (vieille fiche) : pas de plantage', () => {
  const s = appliquerReponseAcces({ interphone: true }, 'interphone', false)
  assert.deepEqual(s.photos_rappels, { interphone_taken: false })
})

test('clés d\'accès alignées sur formDefaults', () => {
  const defauts = initialFormData.section_clefs
  for (const [champ, { details, photo }] of Object.entries(ACCES_BRANCHES)) {
    assert.ok(champ in defauts, champ)
    assert.ok(details in defauts, details)
    assert.ok(photo in defauts.photos_rappels, photo)
  }
  assert.throws(() => appliquerReponseAcces({}, 'inconnu', false))
})

// ── PDF Fiche Logement ───────────────────────────────────────────────────────

test('PDF : chaque rappel coché sort sous son libellé ; emplacement distinct des clés', () => {
  const photos = photosPrises(sectionOui())
  for (const libelle of ['emplacement', 'Interphone', 'Tempo gâche', 'Digicode']) {
    assert.ok(photos.includes(libelle), `${libelle} absent de : ${photos.join(' | ')}`)
  }
  // Seul l'emplacement est coché : les clés physiques ne sortent pas.
  assert.ok(!photos.includes('clés'), photos.join(' | '))
})

test('PDF : clefs_taken seul → « clés » sans « emplacement »', () => {
  const s = structuredClone(initialFormData.section_clefs)
  s.photos_rappels.clefs_taken = true
  const photos = photosPrises(s)
  assert.ok(photos.includes('clés'))
  assert.ok(!photos.includes('emplacement'))
})

test('PDF après « non » partout : plus d\'instructions ni de rappel de ces branches', () => {
  let s = sectionOui()
  for (const champ of Object.keys(ACCES_BRANCHES)) s = appliquerReponseAcces(s, champ, false)
  const texte = lignesPdf(s).join('\n')
  for (const canari of ['CANARI-INTERPHONE', 'CANARI-TEMPO', 'CANARI-DIGICODE']) assert.ok(!texte.includes(canari), canari)
  const photos = photosPrises(s)
  for (const libelle of ['Interphone', 'Tempo gâche', 'Digicode']) assert.ok(!photos.includes(libelle), libelle)
  assert.ok(photos.includes('emplacement'))
})
