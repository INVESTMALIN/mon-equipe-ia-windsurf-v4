// Assistant Transcription — cœur commun aux routes api/transcript-*.js.
//
// Remplace le parcours historique (fichier envoyé au compresseur vidéo → n8n →
// AssemblyAI → mail Gmail) par un parcours interne :
//   1. le navigateur dépose le fichier dans Cloudflare R2 (URL PUT signée) ;
//   2. le serveur demande la transcription à AssemblyAI en lui donnant une URL de
//      lecture signée (AssemblyAI accepte l'audio ET la vidéo) ;
//   3. AssemblyAI rappelle /api/transcript-webhook quand c'est fini (et l'appli
//      vérifie aussi d'elle-même via /api/transcript-status) ;
//   4. la transcription est enregistrée dans `conversations` (visible dans l'appli),
//      envoyée par mail comme avant (même objet, même texte, même pièce jointe),
//      et le fichier déposé est effacé de R2.
// Pourquoi : derrière Cloudflare, un envoi direct est limité à 100 Mo et une
// requête est coupée à 100 s, alors que l'ancien parcours attendait n8n jusqu'à
// 10 minutes.
//
// L'état d'une transcription vit dans la colonne `title` de sa ligne
// `conversations` (JSON), sans migration : { etat, aai, cle, sig }. La ligne
// appartient à l'utilisateur (RLS), qui pourrait la modifier : `sig` (HMAC serveur)
// garantit que `aai` et `cle` n'ont pas été changés avant qu'on s'en serve.
//
// Le fichier commence par `_` → ignoré par Vercel comme fonction serverless (helper).
// Sans import réseau au chargement : les fonctions pures sont testées par `npm test`.

import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

export const SOURCE = 'assistant-transcript'
export const MAX_BYTES = 1024 * 1024 * 1024 // 1 Go
export const KEY_PREFIX = 'transcripts/'

const TYPES = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
}

export const MESSAGE_EN_COURS = 'Transcription en cours… Vous la recevrez aussi par email.'
export const MESSAGE_ERREUR = "Votre transcription n'a pas pu être exécutée jusqu'au bout à cause d'une erreur, veuillez réessayer et si l'erreur persiste, veuillez contacter le support"

/** Extension et type MIME acceptés pour un nom de fichier, ou null. */
export function typeFichier(filename) {
  const m = /\.[a-z0-9]+$/i.exec(String(filename || ''))
  const ext = m ? m[0].toLowerCase() : ''
  return TYPES[ext] ? { ext, contentType: TYPES[ext] } : null
}

/** Valide une demande de dépôt ; renvoie { ok, ext, contentType } ou { ok:false, error }. */
export function validerDepot({ filename, size }) {
  const t = typeFichier(filename)
  if (!t) return { ok: false, error: 'Format non pris en charge (MP3, WAV, M4A, WebM, MP4, MOV).' }
  const n = Number(size)
  if (!Number.isFinite(n) || n <= 0) return { ok: false, error: 'Le fichier est vide.' }
  if (n > MAX_BYTES) return { ok: false, error: 'Le fichier est trop volumineux (1 Go maximum).' }
  return { ok: true, ...t }
}

export function cleObjet(userId, ext) {
  return `${KEY_PREFIX}${userId}/${randomUUID()}${ext}`
}

/** La clé R2 appartient-elle bien à cet utilisateur (et à rien d'autre) ? */
export function estCleDe(userId, cle) {
  if (typeof cle !== 'string' || typeof userId !== 'string' || !userId) return false
  const prefix = `${KEY_PREFIX}${userId}/`
  if (!cle.startsWith(prefix)) return false
  const reste = cle.slice(prefix.length)
  return /^[0-9a-f-]{36}\.[a-z0-9]+$/.test(reste)
}

export function estUuid(v) {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}

function hmac(secret, texte) {
  return createHmac('sha256', secret).update(texte).digest('hex')
}

/** État stocké dans `title`, signé. */
export function etatSigne(secret, { etat, aai, cle, job }) {
  return JSON.stringify({ etat, aai, cle, sig: hmac(secret, `${job}|${aai}|${cle}`) })
}

/** Relit et vérifie l'état ; null s'il est illisible ou falsifié. */
export function lireEtat(secret, job, title) {
  let e
  try { e = JSON.parse(title) } catch { return null }
  if (!e || typeof e !== 'object' || typeof e.sig !== 'string') return null
  const attendu = Buffer.from(hmac(secret, `${job}|${e.aai}|${e.cle}`))
  const recu = Buffer.from(e.sig)
  if (attendu.length !== recu.length || !timingSafeEqual(attendu, recu)) return null
  return { etat: e.etat, aai: e.aai, cle: e.cle }
}

export function comparerSecret(attendu, recu) {
  const a = Buffer.from(String(attendu || ''))
  const b = Buffer.from(String(recu || ''))
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b)
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function dateParis(d, options) {
  return d.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', ...options })
}

/** Corps du mail « Voici votre transcription » (repris du scénario n8n). */
export function mailTranscriptionHtml(texte) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #dbae61; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #dbae61; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { color: #dbae61; margin: 0; font-size: 28px; }
        .content { font-size: 16px; line-height: 1.8; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Votre Transcription :</h1>
        </div>
        <div class="content">
            <p>${esc(texte)}</p>
        </div>
    </div>
</body>
</html>`
}

/** Pièce jointe HTML mise en forme (reprise du scénario n8n). */
export function documentTranscriptionHtml(texte, maintenant = new Date()) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 2cm; size: A4; }
        body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.8; color: #2c3e50; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; margin: 0; }
        .page { background: white; padding: 60px; min-height: 100vh; box-sizing: border-box; }
        .header { text-align: center; border-bottom: 4px solid #667eea; padding-bottom: 30px; margin-bottom: 50px; position: relative; }
        .header::after { content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 100px; height: 4px; background: #764ba2; }
        h1 { color: #667eea; font-size: 42px; margin: 0 0 10px 0; font-weight: 700; letter-spacing: -1px; }
        .subtitle { color: #7f8c8d; font-size: 16px; font-style: italic; margin: 0; }
        .content { font-size: 16px; line-height: 2; text-align: justify; color: #34495e; margin: 40px 0; white-space: pre-wrap; word-wrap: break-word; }
        .metadata { display: flex; justify-content: space-between; margin-bottom: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; font-size: 14px; color: #7f8c8d; }
        .metadata-item { display: flex; flex-direction: column; }
        .metadata-label { font-weight: 600; color: #dbae61; margin-bottom: 5px; }
        .decorative-line { height: 3px; background: linear-gradient(90deg, #dbae61 0%, #764ba2 100%); margin: 40px 0; border-radius: 10px; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <h1>📄 Transcription</h1>
            <p class="subtitle">Document généré automatiquement</p>
        </div>
        <div class="metadata">
            <div class="metadata-item">
                <span class="metadata-label">Date</span>
                <span>${dateParis(maintenant, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Heure</span>
                <span>${dateParis(maintenant, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Type</span>
                <span>Transcription Audio</span>
            </div>
        </div>
        <div class="decorative-line"></div>
        <div class="content">${esc(texte)}</div>
        <div class="decorative-line"></div>
    </div>
</body>
</html>`
}

/** Mail de succès complet : objet, corps, pièce jointe (format Resend). */
export function mailSucces(texte, maintenant = new Date()) {
  const doc = documentTranscriptionHtml(texte, maintenant)
  return {
    subject: 'Voici votre transcription',
    html: mailTranscriptionHtml(texte),
    text: texte,
    attachments: [{
      filename: `transcription_${maintenant.toISOString().slice(0, 10)}.html`,
      content: Buffer.from(doc, 'utf-8').toString('base64'),
    }],
  }
}

/** Mail d'échec (le scénario n8n envoyait cet objet avec un corps vide). */
export function mailEchec() {
  return {
    subject: 'Une erreur a eu lieu lors de votre transcription',
    html: `<p>${esc(MESSAGE_ERREUR)}.</p>`,
    text: `${MESSAGE_ERREUR}.`,
  }
}

/**
 * Termine une transcription : lit le résultat chez AssemblyAI, l'enregistre, envoie
 * le mail, efface le fichier déposé. Idempotent et sûr en concurrence (webhook et
 * vérification de l'appli peuvent arriver en même temps) : la ligne n'est mise à jour
 * que si son `title` n'a pas changé depuis la lecture, et seul ce gagnant envoie le mail.
 *
 * deps : { db, secret, lireTranscription, envoyerMail, effacerObjet, emailDe, log }
 * @returns {'termine'|'erreur'|'en_cours'|'deja_fait'|'inconnu'|'invalide'}
 */
export async function finaliser(job, deps) {
  const { db, secret, lireTranscription, envoyerMail, effacerObjet, emailDe, log = console } = deps
  const ligne = await db.lire(job)
  if (!ligne) return 'inconnu'
  const etat = lireEtat(secret, job, ligne.title)
  if (!etat) return 'invalide'
  if (etat.etat !== 'en_cours') return 'deja_fait'
  if (!estCleDe(ligne.user_id, etat.cle)) return 'invalide'

  const t = await lireTranscription(etat.aai)
  if (t.status === 'queued' || t.status === 'processing') return 'en_cours'

  const texte = typeof t.text === 'string' ? t.text.trim() : ''
  const reussi = t.status === 'completed' && texte.length > 0
  const nouvelEtat = reussi ? 'termine' : 'erreur'
  const gagne = await db.majSiInchangee(job, ligne.title, {
    answer: reussi ? texte : MESSAGE_ERREUR,
    title: etatSigne(secret, { etat: nouvelEtat, aai: etat.aai, cle: etat.cle, job }),
  })
  if (!gagne) return 'deja_fait'

  if (!reussi) log.error(`[transcription] ${job} en échec chez AssemblyAI (${t.status}) : ${String(t.error || '').slice(0, 200)}`)

  const email = await emailDe(ligne.user_id)
  if (email) {
    try {
      await envoyerMail({ to: email, ...(reussi ? mailSucces(texte) : mailEchec()) })
    } catch (err) {
      // La transcription reste visible dans l'appli ; l'échec du mail est journalisé.
      log.error(`[transcription] ${job} : envoi du mail en échec : ${err?.message}`)
    }
  }
  try {
    await effacerObjet(etat.cle)
  } catch (err) {
    log.error(`[transcription] ${job} : effacement R2 en échec (cycle de vie du bucket en filet) : ${err?.message}`)
  }
  return nouvelEtat
}
