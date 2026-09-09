// Règles de preuve des livrables affichés sur les cartes du dashboard.
//
// Le module testé est pur : pas de Supabase, pas de réseau, rien à simuler.
// Ces tests verrouillent surtout les deux règles faciles à casser par mégarde :
// le badge PDF ne se déduit PAS de `fields_locked`, et une absence de preuve
// n'affiche rien plutôt qu'un badge optimiste.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  aGuideGenere,
  aPdfGenere,
  livrablesDeFiche,
  livrablesPresents,
} from '../src/lib/ficheLivrables.js'

const ID = 'f-1'

test('aucune preuve : aucun livrable, donc aucun badge', () => {
  const fiche = { id: ID, fields_locked: false }
  assert.deepEqual(livrablesDeFiche(fiche, new Set()), {
    pdf: false,
    annonce: false,
    guide: false,
  })
  assert.equal(livrablesPresents(fiche, new Set()).length, 0)
})

test('fields_locked ne vaut PAS preuve de PDF', () => {
  // Le verrou est réversible (déverrouillage admin en service_role) et ne concerne
  // que le parcours fiche_lite. En déduire le badge le ferait DISPARAÎTRE après un
  // déverrouillage alors que le PDF existe toujours, et n'en donnerait jamais aux
  // fiches premium. La preuve dédiée est pdf_generated_at.
  const fiche = { id: ID, fields_locked: true }
  assert.equal(aPdfGenere(fiche), false)
  assert.equal(livrablesPresents(fiche, new Set()).length, 0)
})

test('le PDF est prouvé par la seule présence de pdf_generated_at', () => {
  assert.equal(aPdfGenere({ pdf_generated_at: '2026-09-09T10:00:00Z' }), true)
  // Fiche jamais passée par une génération : pas de badge, sans planter.
  assert.equal(aPdfGenere({}), false)
  assert.equal(aPdfGenere({ pdf_generated_at: '' }), false)
  assert.equal(aPdfGenere({ pdf_generated_at: '   ' }), false)
})

test('le guide est prouvé par l’horodatage projeté ou par la section complète', () => {
  // Ce que projette le dashboard : l'horodatage seul, sans le texte du guide.
  assert.equal(aGuideGenere({ guide_genere_at: '2026-09-09T10:00:00Z' }), true)
  // Ce dont disposent les appelants qui ont l'objet entier.
  assert.equal(aGuideGenere({ section_guide_acces: { guide_genere_at: '2026-01-01' } }), true)
  assert.equal(aGuideGenere({ section_guide_acces: { guide_genere: 'Bonjour,' } }), true)
  // Section présente mais vide : pas de guide.
  assert.equal(aGuideGenere({ section_guide_acces: { guide_genere: '', guide_genere_at: '' } }), false)
  assert.equal(aGuideGenere({}), false)
  assert.equal(aGuideGenere(null), false)
})

test('l’annonce vient de l’ensemble d’ids, calculé en une requête pour toute la liste', () => {
  const fiche = { id: ID }
  assert.equal(livrablesDeFiche(fiche, new Set([ID])).annonce, true)
  assert.equal(livrablesDeFiche(fiche, new Set(['autre'])).annonce, false)
  // L'ensemble peut manquer si la requête annexe a échoué : absence, pas de plantage.
  assert.equal(livrablesDeFiche(fiche, undefined).annonce, false)
})

test('les badges présents sortent dans un ordre stable', () => {
  const fiche = {
    id: ID,
    pdf_generated_at: '2026-09-09T10:00:00Z',
    guide_genere_at: '2026-09-09T10:00:00Z',
  }
  assert.deepEqual(
    livrablesPresents(fiche, new Set([ID])).map((l) => l.cle),
    ['pdf', 'annonce', 'guide']
  )
  // Un seul livrable : une seule entrée, pas de trou à combler côté rendu.
  assert.deepEqual(
    livrablesPresents({ id: ID, guide_genere_at: '2026-01-01' }, new Set()).map((l) => l.cle),
    ['guide']
  )
})
