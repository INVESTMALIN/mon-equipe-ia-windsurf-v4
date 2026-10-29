// Assistant Transcription (api/_lib/transcription.js) : validation des dépôts, clés R2
// par utilisateur, état signé, mails identiques au scénario n8n, et finaliser()
// (idempotence, concurrence, échec, effacement). Aucun réseau : dépendances simulées.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validerDepot, cleObjet, estCleDe, estUuid, etatSigne, lireEtat, comparerSecret,
  mailSucces, mailEchec, finaliser, MESSAGE_ERREUR, MESSAGE_EN_COURS, MAX_BYTES,
  jobDeCle, cleTraitement, accesAutorise, TRAITEMENT_PREFIX,
} from '../api/_lib/transcription.js'

const SECRET = 'secret-de-test'
const UID = '11111111-2222-3333-4444-555555555555'
const JOB = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'

test('validerDepot : formats, vide, taille', () => {
  assert.equal(validerDepot({ filename: 'reunion.MP4', size: 10 }).contentType, 'video/mp4')
  assert.equal(validerDepot({ filename: 'note.m4a', size: 10 }).contentType, 'audio/mp4')
  assert.equal(validerDepot({ filename: 'iphone.mov', size: 10 }).ok, true)
  assert.equal(validerDepot({ filename: 'doc.pdf', size: 10 }).ok, false)
  assert.equal(validerDepot({ filename: 'a.mp3', size: 0 }).ok, false)
  assert.equal(validerDepot({ filename: 'a.mp3', size: MAX_BYTES + 1 }).ok, false)
  assert.equal(validerDepot({ filename: 'a.mp3', size: MAX_BYTES }).ok, true)
})

test('clés R2 : propres à chaque utilisateur, sans échappatoire', () => {
  const cle = cleObjet(UID, '.mp4')
  assert.equal(estCleDe(UID, cle), true)
  assert.equal(estCleDe('99999999-2222-3333-4444-555555555555', cle), false)
  assert.equal(estCleDe(UID, `transcripts/${UID}/../autre/x.mp4`), false)
  assert.equal(estCleDe(UID, `transcripts/${UID}/sous/dossier.mp4`), false)
  assert.equal(estCleDe(UID, 'autre/chose.mp4'), false)
  assert.equal(estCleDe('', cle), false)
  assert.equal(estUuid(JOB), true)
  assert.equal(estUuid('pas-un-uuid'), false)
})

test('état signé : relu tel quel, refusé s\'il est modifié', () => {
  const cle = cleObjet(UID, '.mp3')
  const title = etatSigne(SECRET, { etat: 'en_cours', aai: 'tr_1', cle, job: JOB })
  assert.deepEqual(lireEtat(SECRET, JOB, title), { etat: 'en_cours', aai: 'tr_1', cle })
  const falsifie = JSON.stringify({ ...JSON.parse(title), aai: 'tr_autre' })
  assert.equal(lireEtat(SECRET, JOB, falsifie), null)
  const etatChange = JSON.stringify({ ...JSON.parse(title), etat: 'termine' })
  assert.equal(lireEtat(SECRET, JOB, etatChange), null)
  assert.equal(lireEtat(SECRET, 'autre-job', title), null)
  assert.equal(lireEtat('autre-secret', JOB, title), null)
  assert.equal(lireEtat(SECRET, JOB, null), null)
  assert.equal(lireEtat(SECRET, JOB, 'pas du json'), null)
})

test('comparerSecret : temps constant, vide refusé', () => {
  assert.equal(comparerSecret('abc', 'abc'), true)
  assert.equal(comparerSecret('abc', 'abd'), false)
  assert.equal(comparerSecret('abc', undefined), false)
  assert.equal(comparerSecret('', ''), false)
})

test('mail de succès : même objet que n8n, texte échappé, pièce jointe HTML datée', () => {
  const m = mailSucces('Bonjour <script>alert(1)</script> & merci', new Date('2026-10-30T09:15:00Z'))
  assert.equal(m.subject, 'Voici votre transcription')
  assert.match(m.html, /Votre Transcription :/)
  assert.match(m.html, /&lt;script&gt;/)
  assert.doesNotMatch(m.html, /<script>/)
  assert.equal(m.attachments.length, 1)
  assert.equal(m.attachments[0].filename, 'transcription_2026-10-30.html')
  const doc = Buffer.from(m.attachments[0].content, 'base64').toString('utf-8')
  assert.match(doc, /📄 Transcription/)
  assert.match(doc, /30\/10\/2026/)
  assert.match(doc, /&amp; merci/)
  assert.equal(mailEchec().subject, 'Une erreur a eu lieu lors de votre transcription')
})

// Base simulée : une ligne, mise à jour conditionnelle sur `title`.
function fausseBase(ligne) {
  return {
    ligne,
    async lire() { return this.ligne ? { ...this.ligne } : null },
    async majSiInchangee(job, ancien, champs) {
      if (!this.ligne || this.ligne.title !== ancien) return false
      this.ligne = { ...this.ligne, ...champs }
      return true
    },
  }
}

function deps(ligne, transcription) {
  const appels = { mails: [], effaces: [], aaiEfface: [] }
  const presents = new Set(ligne?.cle ? [ligne.cle] : [])
  return {
    appels,
    presents,
    d: {
      db: fausseBase(ligne),
      secret: SECRET,
      lireTranscription: async () => transcription,
      envoyerMail: async (m) => { appels.mails.push(m) },
      effacerObjet: async (c) => { appels.effaces.push(c); presents.delete(c) },
      objetExiste: async (c) => presents.has(c),
      effacerTranscription: async (id) => { appels.aaiEfface.push(id) },
      emailDe: async () => 'client@example.org',
      log: { error() {} },
    },
  }
}

function ligneEnCours() {
  const cle = cleTraitement(UID, cleObjet(UID, '.mp4'))
  return { user_id: UID, answer: MESSAGE_EN_COURS, created_at: new Date().toISOString(), title: etatSigne(SECRET, { etat: 'en_cours', aai: 'tr_1', cle, job: JOB }), cle }
}

test('finaliser : succès → texte enregistré, un seul mail, fichier effacé, puis idempotent', async () => {
  const l = ligneEnCours()
  const { d, appels } = deps(l, { status: 'completed', text: '  Bonjour à tous.  ' })
  assert.equal(await finaliser(JOB, d), 'termine')
  assert.equal(d.db.ligne.answer, 'Bonjour à tous.')
  assert.equal(lireEtat(SECRET, JOB, d.db.ligne.title).etat, 'termine')
  assert.equal(appels.mails.length, 1)
  assert.equal(appels.mails[0].to, 'client@example.org')
  assert.deepEqual(appels.effaces, [l.cle])
  assert.deepEqual(appels.aaiEfface, ['tr_1'])
  assert.equal(await finaliser(JOB, d), 'deja_fait')
  assert.equal(appels.mails.length, 1)
})

test('finaliser : rejeu d\'un ancien état « en cours » → aucun mail (fichier déjà effacé)', async () => {
  const l = ligneEnCours()
  const { d, appels } = deps(l, { status: 'completed', text: 'Bonjour.' })
  const ancienTitre = l.title
  assert.equal(await finaliser(JOB, d), 'termine')
  d.db.ligne = { ...d.db.ligne, title: ancienTitre } // l'utilisateur remet l'ancien état
  for (let i = 0; i < 3; i++) assert.equal(await finaliser(JOB, d), 'deja_fait')
  assert.equal(appels.mails.length, 1)
  assert.equal(d.db.ligne.answer, 'Bonjour.')
  assert.equal(lireEtat(SECRET, JOB, d.db.ligne.title).etat, 'termine')
})

test('finaliser : lancement interrompu → attend 15 min, puis échec sans mail', async () => {
  const cle = cleTraitement(UID, cleObjet(UID, '.mp3'))
  const recent = { user_id: UID, answer: MESSAGE_EN_COURS, created_at: new Date().toISOString(), title: etatSigne(SECRET, { etat: 'lancement', aai: '', cle, job: JOB }), cle }
  let x = deps(recent, { status: 'completed', text: 'x' })
  assert.equal(await finaliser(JOB, x.d), 'en_cours')
  const vieux = { ...recent, created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString() }
  x = deps(vieux, { status: 'completed', text: 'x' })
  assert.equal(await finaliser(JOB, x.d), 'erreur')
  assert.equal(x.d.db.ligne.answer, MESSAGE_ERREUR)
  assert.equal(x.appels.mails.length, 0)
})

test('finaliser : encore en traitement → rien ne change', async () => {
  const { d, appels } = deps(ligneEnCours(), { status: 'processing' })
  assert.equal(await finaliser(JOB, d), 'en_cours')
  assert.equal(appels.mails.length, 0)
  assert.equal(appels.effaces.length, 0)
})

test('finaliser : échec AssemblyAI ou texte vide → message d\'erreur et mail d\'échec', async () => {
  for (const t of [{ status: 'error', error: 'audio illisible' }, { status: 'completed', text: '' }]) {
    const { d, appels } = deps(ligneEnCours(), t)
    assert.equal(await finaliser(JOB, d), 'erreur')
    assert.equal(d.db.ligne.answer, MESSAGE_ERREUR)
    assert.equal(appels.mails[0].subject, 'Une erreur a eu lieu lors de votre transcription')
    assert.equal(appels.effaces.length, 1)
  }
})

test('finaliser : deux appels simultanés → un seul mail', async () => {
  const { d, appels } = deps(ligneEnCours(), { status: 'completed', text: 'ok' })
  const r = await Promise.all([finaliser(JOB, d), finaliser(JOB, d)])
  assert.deepEqual(r.sort(), ['deja_fait', 'termine'])
  assert.equal(appels.mails.length, 1)
})

test('finaliser : état falsifié ou clé d\'un autre utilisateur → refusé sans rien faire', async () => {
  const l = ligneEnCours()
  const falsifie = { ...l, title: JSON.stringify({ ...JSON.parse(l.title), aai: 'tr_autre' }) }
  let x = deps(falsifie, { status: 'completed', text: 'secret' })
  assert.equal(await finaliser(JOB, x.d), 'invalide')
  assert.equal(x.appels.mails.length, 0)

  const autreUid = '99999999-2222-3333-4444-555555555555'
  const cleAutre = cleTraitement(autreUid, cleObjet(autreUid, '.mp4'))
  const autre = { user_id: UID, answer: '', title: etatSigne(SECRET, { etat: 'en_cours', aai: 'tr_1', cle: cleAutre, job: JOB }) }
  x = deps(autre, { status: 'completed', text: 'secret' })
  assert.equal(await finaliser(JOB, x.d), 'invalide')
  assert.equal(x.appels.effaces.length, 0)

  x = deps(null, { status: 'completed', text: 'x' })
  assert.equal(await finaliser(JOB, x.d), 'inconnu')
})

test('finaliser : un mail en échec n\'empêche ni l\'enregistrement ni l\'effacement', async () => {
  const { d, appels } = deps(ligneEnCours(), { status: 'completed', text: 'ok' })
  d.envoyerMail = async () => { throw new Error('Resend indisponible') }
  assert.equal(await finaliser(JOB, d), 'termine')
  assert.equal(d.db.ligne.answer, 'ok')
  assert.equal(appels.effaces.length, 1)
})

test('jobDeCle, cleTraitement, accesAutorise', () => {
  const cle = cleObjet(UID, '.wav')
  assert.ok(estUuid(jobDeCle(cle)))
  assert.equal(jobDeCle('pas/une/cle'), null)
  const tr = cleTraitement(UID, cle)
  assert.ok(tr.startsWith(`${TRAITEMENT_PREFIX}${UID}/`))
  assert.equal(estCleDe(UID, tr, TRAITEMENT_PREFIX), true)
  assert.equal(estCleDe(UID, tr), false)
  const demain = new Date(Date.now() + 86400000).toISOString()
  const hier = new Date(Date.now() - 86400000).toISOString()
  assert.equal(accesAutorise({ role: 'admin' }), true)
  assert.equal(accesAutorise({ role: 'admin', disabled_at: hier }), false)
  assert.equal(accesAutorise({ subscription_status: 'premium', subscription_current_period_end: demain }), true)
  assert.equal(accesAutorise({ subscription_status: 'premium', subscription_current_period_end: hier }), false)
  assert.equal(accesAutorise({ subscription_status: 'trial', subscription_trial_end: demain }), true)
  assert.equal(accesAutorise({ subscription_status: 'free' }), false)
  assert.equal(accesAutorise(null), false)
})
