// Livraison d'un PDF : les quatre issues du rendu, et la forme de l'écriture.
//
// Le rendu est SIMULÉ (`demarrerRendu` est injecté) : aucun PDF n'est produit,
// aucune fiche n'est touchée. C'est tout l'intérêt d'avoir sorti cette enveloppe de
// PdfBuilder — les cas qui comptent sont ceux qu'on ne peut pas provoquer à la main.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  livrerPdf,
  construirePatchPdf,
  enregistrerAvecDelai,
  persisterPreuvePdf,
  PDF_RENDU_TIMEOUT_MS,
  PDF_ENREGISTREMENT_TIMEOUT_MS,
} from '../src/lib/pdfLivraison.js'

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

// ─────────────────────────────────────────────────────────────────────────────
// Enregistrement de la preuve : borné, explicite, rejouable à l'identique.
// Supabase est SIMULÉ (`ecrire` est injecté) : aucune écriture réelle.
// ─────────────────────────────────────────────────────────────────────────────

test('écriture réussie : résultat rendu tel quel', async () => {
  const r = await enregistrerAvecDelai({ ecrire: async () => ({ success: true }), timeoutMs: 50 })
  assert.deepEqual(r, { success: true })
})

test('écriture en échec : rendue en résultat, jamais en exception', async () => {
  // L'appelant n'a qu'un seul chemin à traiter, et un échec d'écriture est un état
  // à afficher, pas une exception à rattraper.
  const r = await enregistrerAvecDelai({ ecrire: async () => ({ success: false, error: 'RLS' }), timeoutMs: 50 })
  assert.deepEqual(r, { success: false, error: 'RLS' })
})

test('écriture qui lève : convertie en résultat d’échec', async () => {
  const r = await enregistrerAvecDelai({ ecrire: async () => { throw new Error('réseau') }, timeoutMs: 50 })
  assert.equal(r.success, false)
  assert.equal(r.error, 'réseau')
})

test('écriture qui ne répond JAMAIS : bornée, et le signal est avorté', async () => {
  // C'est le cas qui bloquait l'utilisateur derrière le voile, PDF déjà téléchargé :
  // supabase-js n'impose aucun délai à ses requêtes.
  let signalVu = null
  const r = await enregistrerAvecDelai({
    ecrire: (signal) => { signalVu = signal; return new Promise(() => {}) }, // ne se règle jamais
    timeoutMs: 20,
  })
  assert.equal(r.success, false)
  assert.equal(r.expire, true)
  assert.equal(signalVu.aborted, true, 'la requête doit être avortée, pas seulement abandonnée')
})

test('écriture qui IGNORE le signal : la promesse se règle quand même', async () => {
  // Ceinture et bretelles : la course est faite ici, on ne dépend pas du fait que
  // la couche réseau honore l'abort.
  const r = await enregistrerAvecDelai({
    ecrire: () => new Promise((res) => setTimeout(() => res({ success: true }), 200)),
    timeoutMs: 20,
  })
  assert.equal(r.expire, true)
})

test('persistance réussie : enregistrement puis inactif, le voile tombe', async () => {
  const etats = []
  const r = await persisterPreuvePdf({
    ecrire: async () => ({ success: true }),
    onEtat: (e) => etats.push(e),
    timeoutMs: 50,
  })
  assert.equal(r.success, true)
  assert.deepEqual(etats, ['enregistrement', 'inactif'])
})

test('persistance échouée : le voile reste, sur un état d’échec explicite', async () => {
  // Le point du finding : sans cet état, le voile disparaissait et l'utilisateur
  // croyait tout enregistré alors que le badge et le verrou manquaient.
  const etats = []
  const r = await persisterPreuvePdf({
    ecrire: async () => ({ success: false, error: 'RLS' }),
    onEtat: (e) => etats.push(e),
    timeoutMs: 50,
  })
  assert.equal(r.success, false)
  assert.deepEqual(etats, ['enregistrement', 'enregistrement_echoue'])
})

test('persistance qui n’aboutit jamais : ne reste PAS bloquée', async () => {
  const etats = []
  await persisterPreuvePdf({
    ecrire: () => new Promise(() => {}),
    onEtat: (e) => etats.push(e),
    timeoutMs: 20,
  })
  assert.deepEqual(etats, ['enregistrement', 'enregistrement_echoue'])
})

test('reprise idempotente : même preuve, même horodatage entre tentatives', async () => {
  // L'horodatage date la GÉNÉRATION, pas la réussite de l'écriture : il ne doit pas
  // bouger d'une tentative à l'autre.
  const reprise = { withLock: true, horodatage: '2026-09-09T10:00:00.000Z' }
  const patchs = []
  const ecrire = async () => { patchs.push(construirePatchPdf(reprise)); return { success: patchs.length > 1 } }

  const premier = await persisterPreuvePdf({ ecrire, timeoutMs: 50 })
  assert.equal(premier.success, false)
  const second = await persisterPreuvePdf({ ecrire, timeoutMs: 50 })
  assert.equal(second.success, true, 'la reprise doit pouvoir aboutir')

  assert.deepEqual(patchs[0], patchs[1], 'les deux tentatives écrivent exactement la même preuve')
  assert.equal(patchs[1].pdf_generated_at, '2026-09-09T10:00:00.000Z')
  assert.equal(patchs[1].fields_locked, true)
})

test('chaîne complète : remise tardive PUIS persistance, le voile suit', async () => {
  // Le scénario le plus retors : le rendu dépasse le délai, l'interface reprend la
  // main, le fichier arrive quand même, et la preuve doit alors s'écrire.
  const etats = []
  const promesse = livrerPdf({
    demarrerRendu: (fini) => setTimeout(fini, 40),
    onDelivered: () => persisterPreuvePdf({
      ecrire: async () => ({ success: true }),
      onEtat: (e) => etats.push(e),
      timeoutMs: 50,
    }),
    timeoutMs: 10,
  })
  await assert.rejects(promesse, (e) => e.renduEnCours === true)
  assert.deepEqual(etats, [], 'rien n’est enregistré tant que rien n’est remis')
  await attendreUnPeu(80)
  assert.deepEqual(etats, ['enregistrement', 'inactif'])
})

test('chaîne complète : remise normale mais écriture bloquée, sortie garantie', async () => {
  const etats = []
  await livrerPdf({
    demarrerRendu: (fini) => fini(),
    onDelivered: () => persisterPreuvePdf({
      ecrire: () => new Promise(() => {}),
      onEtat: (e) => etats.push(e),
      timeoutMs: 20,
    }),
  })
  assert.deepEqual(etats, ['enregistrement', 'enregistrement_echoue'])
})

test('le délai d’enregistrement est distinct de celui du rendu', () => {
  // Écrire deux colonnes est une requête courte, pas un calcul : borner l'écriture
  // sur 120 s laisserait l'utilisateur bloqué deux minutes pour rien.
  assert.equal(PDF_ENREGISTREMENT_TIMEOUT_MS, 15000)
  assert.ok(PDF_ENREGISTREMENT_TIMEOUT_MS < PDF_RENDU_TIMEOUT_MS)
})

// ─────────────────────────────────────────────────────────────────────────────
// Concurrence entre onglets : l'écriture est conditionnée à l'identité qui a servi
// au PDF. La fonction SQL est SIMULÉE ici ; son comportement réel est prouvé côté
// base (UPDATE conditionnel en une seule instruction).
// ─────────────────────────────────────────────────────────────────────────────

test('identité inchangée : preuve et verrou enregistrés, le voile tombe', async () => {
  const etats = []
  const ecrit = []
  const r = await persisterPreuvePdf({
    // Équivalent d'un `fiche_lite_enregistrer_pdf` renvoyant true.
    ecrire: async () => { ecrit.push(construirePatchPdf({ withLock: true, horodatage: 'H' })); return { success: true } },
    onEtat: (e) => etats.push(e),
    timeoutMs: 50,
  })
  assert.equal(r.success, true)
  assert.deepEqual(etats, ['enregistrement', 'inactif'])
  assert.deepEqual(ecrit, [{ pdf_generated_at: 'H', fields_locked: true }])
})

test('identité modifiée ailleurs : aucun verrou, état dédié et visible', async () => {
  // La fonction SQL renvoie false quand l'identité en base ne correspond plus : rien
  // n'est écrit, donc surtout aucun verrou posé sur la version de l'autre onglet.
  const etats = []
  const r = await persisterPreuvePdf({
    ecrire: async () => ({ success: false, identiteModifiee: true, error: 'modifiée ailleurs' }),
    onEtat: (e) => etats.push(e),
    timeoutMs: 50,
  })
  assert.equal(r.success, false)
  assert.equal(r.identiteModifiee, true)
  // Surtout PAS 'enregistrement_echoue' : réessayer n'aurait aucun sens, l'écriture
  // échouerait toujours. Le message et l'action à proposer sont différents.
  assert.deepEqual(etats, ['enregistrement', 'identite_modifiee'])
})

test('identité modifiée : distinguée d’un échec technique', async () => {
  const technique = []
  await persisterPreuvePdf({
    ecrire: async () => ({ success: false, error: 'réseau' }),
    onEtat: (e) => technique.push(e),
    timeoutMs: 50,
  })
  assert.deepEqual(technique, ['enregistrement', 'enregistrement_echoue'],
    'un échec technique reste réessayable, lui')
})
