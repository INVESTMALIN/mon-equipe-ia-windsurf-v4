// Branchements réels de l'Assistant Transcription : Cloudflare R2, AssemblyAI,
// Supabase (service role) et Resend. La logique, elle, est dans ./transcription.js.
//
// Variables (lues au chargement : une variable absente rend les routes transcript-*
// indisponibles en 503, sans toucher au reste du site — chargement paresseux par route
// dans railway-server.mjs) :
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
//   ASSEMBLYAI_API_KEY
//   TRANSCRIPT_WEBHOOK_SECRET   (secret partagé avec AssemblyAI pour le rappel, et clé
//                                des signatures d'état)
//
// Le fichier commence par `_` → ignoré par Vercel comme fonction serverless (helper).

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireEnv, APP_URL } from './env.js'
import { supabaseAdmin } from './verifyAdmin.js'
import { sendEmail } from './sendEmail.js'
import { SOURCE } from './transcription.js'

const R2_ACCOUNT_ID = requireEnv('R2_ACCOUNT_ID')
const R2_BUCKET = requireEnv('R2_BUCKET')
const ASSEMBLYAI_API_KEY = requireEnv('ASSEMBLYAI_API_KEY')
export const WEBHOOK_SECRET = requireEnv('TRANSCRIPT_WEBHOOK_SECRET')
export const WEBHOOK_HEADER = 'X-Transcript-Webhook-Secret'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
  },
})

export function urlDepot(cle, contentType) {
  return getSignedUrl(r2, new PutObjectCommand({ Bucket: R2_BUCKET, Key: cle, ContentType: contentType }), { expiresIn: 60 * 60 })
}

export function urlLecture(cle) {
  // 12 h : AssemblyAI télécharge le fichier peu après la demande, mais une file
  // d'attente chargée ne doit pas faire expirer l'adresse.
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: cle }), { expiresIn: 12 * 60 * 60 })
}

/** Taille de l'objet déposé, ou null s'il n'existe pas. */
export async function tailleObjet(cle) {
  try {
    const r = await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: cle }))
    return Number(r.ContentLength)
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === 'NotFound') return null
    throw err
  }
}

export async function effacerObjet(cle) {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: cle }))
}

async function assembly(chemin, options = {}) {
  const res = await fetch(`https://api.assemblyai.com/v2${chemin}`, {
    ...options,
    headers: { Authorization: ASSEMBLYAI_API_KEY, 'Content-Type': 'application/json', ...(options.headers || {}) },
    signal: AbortSignal.timeout(30_000),
  })
  const corps = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`AssemblyAI ${res.status} : ${String(corps?.error || '').slice(0, 200)}`)
  return corps
}

/** Lance la transcription (français, comme le scénario n8n) avec rappel vers l'appli. */
export async function lancerTranscription({ audioUrl, job }) {
  const t = await assembly('/transcript', {
    method: 'POST',
    body: JSON.stringify({
      audio_url: audioUrl,
      language_code: 'fr',
      webhook_url: `${APP_URL}/api/transcript-webhook?job=${encodeURIComponent(job)}`,
      webhook_auth_header_name: WEBHOOK_HEADER,
      webhook_auth_header_value: WEBHOOK_SECRET,
    }),
  })
  return t.id
}

export function lireTranscription(id) {
  return assembly(`/transcript/${encodeURIComponent(id)}`)
}

export const db = {
  async lire(job) {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('user_id, title, answer, created_at')
      .eq('conversation_id', job)
      .eq('source', SOURCE)
      .maybeSingle()
    if (error) throw new Error(`lecture conversations : ${error.message}`)
    return data
  },
  async creer(ligne) {
    const { error } = await supabaseAdmin.from('conversations').insert({ ...ligne, source: SOURCE })
    if (error) throw new Error(`écriture conversations : ${error.message}`)
  },
  /** Mise à jour conditionnelle : n'écrit que si `title` vaut encore `ancienTitre`. */
  async majSiInchangee(job, ancienTitre, champs) {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .update(champs)
      .eq('conversation_id', job)
      .eq('source', SOURCE)
      .eq('title', ancienTitre)
      .select('conversation_id')
    if (error) throw new Error(`mise à jour conversations : ${error.message}`)
    return Array.isArray(data) && data.length === 1
  },
}

export async function emailDe(userId) {
  const { data } = await supabaseAdmin.from('users').select('email').eq('id', userId).maybeSingle()
  return data?.email || null
}

/** Utilisateur connecté (jeton Supabase) ou null après avoir répondu 401. */
export async function utilisateur(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    res.status(401).json({ error: 'Non connecté' })
    return null
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) {
    res.status(401).json({ error: 'Session expirée, reconnectez-vous' })
    return null
  }
  return user
}

export const depsFinaliser = {
  db,
  secret: WEBHOOK_SECRET,
  lireTranscription,
  envoyerMail: sendEmail,
  effacerObjet,
  emailDe,
}
