// Livraison d'un PDF : les quatre issues du rendu, et la forme de l'écriture.
//
// Le rendu est SIMULÉ (`demarrerRendu` est injecté) : aucun PDF n'est produit,
// aucune fiche n'est touchée. C'est tout l'intérêt d'avoir sorti cette enveloppe de
// PdfBuilder — les cas qui comptent sont ceux qu'on ne peut pas provoquer à la main.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { livrerPdf, construirePatchPdf, PDF_RENDU_TIMEOUT_MS } from '../src/lib/pdfLivraison.js'

const attendreUnPeu = (ms = 20) => new Promise((r) => setTimeout(r, ms))

test('remise normale : la preuve est écrite, la promesse aboutit', async () => {
  const ecritures = []
  await livrerPdf({
    // Rendu qui aboutit tout de suite.
    demarrerRendu: (fini) => fini(),
    onDelivered: () => { ecritures.push('preuve') },
  })
  assert.deepEqual(ecritures, ['preuve'])
})

test('la promesse n’aboutit qu’APRÈS l’écriture de la preuve', async () => {
  // Sans cela, l'appelant retirerait son voile bloquant avant que la preuve et le
  // verrou ne soient posés.
  const ordre = []
  await livrerPdf({
    demarrerRendu: (fini) => setTimeout(fini, 5),
    onDelivered: async () => { await attendreUnPeu(15); ordre.push('preuve') },
  }).then(() => ordre.push('promesse'))
  assert.deepEqual(ordre, ['preuve', 'promesse'])
})

test('échec immédiat : rejet définitif, aucune preuve écrite', async () => {
  const ecritures = []
  await assert.rejects(
    livrerPdf({
      demarrerRendu: () => { throw new Error('document invalide') },
      onDelivered: () => { ecritures.push('preuve') },
    }),
    (e) => {
      assert.equal(e.message, 'document invalide')
      // Pas de `renduEnCours` : le rendu ne rappellera jamais, l'appelant peut
      // retirer son voile et présenter une vraie erreur.
      assert.equal(e.renduEnCours, undefined)
      return true
    }
  )
  assert.deepEqual(ecritures, [])
})

test('délai dépassé sans aboutir : rejet marqué renduEnCours, aucune preuve', async () => {
  const ecritures = []
  await assert.rejects(
    livrerPdf({
      demarrerRendu: () => {},        // ne rappellera jamais
      onDelivered: () => { ecritures.push('preuve') },
      timeoutMs: 10,
    }),
    (e) => {
      // L'appelant doit pouvoir distinguer ce cas d'un échec définitif : il garde
      // son voile, affiche « plus long que prévu » et ne crie pas à l'erreur.
      assert.equal(e.renduEnCours, true)
      return true
    }
  )
  await attendreUnPeu(30)
  assert.deepEqual(ecritures, [], 'aucune preuve ne doit être écrite tant que rien n’est remis')
})

test('remise TARDIVE après le délai : la preuve est quand même écrite', async () => {
  // Le délai ne gouverne que l'affichage ; il n'annule pas pdfmake. Un fichier remis
  // en retard reste un fichier remis : sans cette écriture, le PDF partirait sans
  // preuve et la fiche resterait modifiable.
  const ecritures = []
  const promesse = livrerPdf({
    demarrerRendu: (fini) => setTimeout(fini, 40),
    onDelivered: () => { ecritures.push('preuve') },
    timeoutMs: 10,
  })
  await assert.rejects(promesse, (e) => e.renduEnCours === true)
  assert.deepEqual(ecritures, [], 'rien n’est encore écrit au moment du rejet')
  await attendreUnPeu(60)
  assert.deepEqual(ecritures, ['preuve'], 'la remise tardive doit écrire la preuve')
})

test('la preuve est écrite exactement UNE fois, même si le rendu rappelle', async () => {
  const ecritures = []
  await livrerPdf({
    demarrerRendu: (fini) => { fini(); fini(); setTimeout(fini, 5) },
    onDelivered: () => { ecritures.push('preuve') },
  })
  await attendreUnPeu(20)
  assert.equal(ecritures.length, 1)
})

test('le délai de garde ne se déclenche pas après une remise normale', async () => {
  // Sans le `clearTimeout`, une génération rapide finirait par afficher « plus long
  // que prévu » deux minutes plus tard, sur une fiche déjà livrée.
  let rejete = false
  await livrerPdf({
    demarrerRendu: (fini) => fini(),
    onDelivered: () => {},
    timeoutMs: 10,
  }).catch(() => { rejete = true })
  await attendreUnPeu(30)
  assert.equal(rejete, false)
})

test('le délai par défaut est celui annoncé', () => {
  assert.equal(PDF_RENDU_TIMEOUT_MS, 120000)
})

test('parcours Lite : la preuve ET le verrou partent dans le même patch', () => {
  const patch = construirePatchPdf({ withLock: true, horodatage: '2026-09-09T10:00:00.000Z' })
  assert.deepEqual(patch, {
    pdf_generated_at: '2026-09-09T10:00:00.000Z',
    fields_locked: true,
  })
})

test('parcours Premium : la preuve seule, jamais de verrou', () => {
  // Une fiche premium ne doit JAMAIS être verrouillée — mais elle doit bien recevoir
  // sa preuve de PDF, sinon son badge n'apparaîtrait jamais.
  const patch = construirePatchPdf({ withLock: false, horodatage: '2026-09-09T10:00:00.000Z' })
  assert.deepEqual(patch, { pdf_generated_at: '2026-09-09T10:00:00.000Z' })
  assert.equal('fields_locked' in patch, false)
  // Défaut sans argument : pas de verrou non plus.
  assert.equal('fields_locked' in construirePatchPdf(), false)
})

test('l’horodatage par défaut est une date ISO courante', () => {
  const avant = Date.now()
  const { pdf_generated_at: h } = construirePatchPdf()
  assert.match(h, /^\d{4}-\d{2}-\d{2}T/)
  const t = Date.parse(h)
  assert.ok(t >= avant - 1000 && t <= Date.now() + 1000)
})
