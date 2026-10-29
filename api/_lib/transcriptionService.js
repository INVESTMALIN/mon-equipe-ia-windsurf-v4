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

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, CopyObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireEnv, APP_URL } from './env.js'
import { supabaseAdmin } from './verifyAdmin.js'
import { sendEmail } from './sendEmail.js'
import { SOURCE, finaliser, KEY_PREFIX, TRAITEMENT_PREFIX } from './transcription.js'

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
  // Sans ces deux réglages, le SDK (≥ 3.729) ajoute aux URL signées une somme de
  // contrôle CRC32 calculée sur un corps VIDE : R2 refuserait alors tout vrai fichier.
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

/** URL PUT signée : le type ET la taille annoncés sont signés, le navigateur ne peut pas en changer. */
export function urlDepot(cle, contentType, taille) {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: cle, ContentType: contentType, ContentLength: taille }),
    { expiresIn: 60 * 60, signableHeaders: new Set(['content-type', 'content-length']) }
  )
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

export async function objetExiste(cle) {
  return (await tailleObjet(cle)) !== null
}

export async function copierObjet(source, destination) {
  await r2.send(new CopyObjectCommand({ Bucket: R2_BUCKET, CopySource: `${R2_BUCKET}/${source}`, Key: destination }))
}

async function compter(prefixe) {
  let n = 0, jeton
  do {
    const r = await r2.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefixe, ContinuationToken: jeton, MaxKeys: 1000 }))
    n += r.KeyCount || 0
    jeton = r.IsTruncated ? r.NextContinuationToken : undefined
  } while (jeton)
  return n
}

/** Fichiers déposés ou en traitement pour cet utilisateur (effacés à la fin). */
export async function fichiersEnCours(userId) {
  return (await compter(`${KEY_PREFIX}${userId}/`)) + (await compter(`${TRAITEMENT_PREFIX}${userId}/`))
}

// Compteur journalier que l'utilisateur ne peut pas effacer : un petit objet par
// transcription lancée, sous quota/<userId>/<jour>/ (règle de cycle de vie du bucket
// sur le préfixe quota/ pour les supprimer après quelques jours).
function jourParis(d = new Date()) {
  return d.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' }) // AAAA-MM-JJ
}
export async function lancementsDuJour(userId) {
  return compter(`quota/${userId}/${jourParis()}/`)
}
export async function noterLancement(userId, job) {
  await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: `quota/${userId}/${jourParis()}/${job}`, Body: '' }))
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

export async function effacerTranscription(id) {
  await assembly(`/transcript/${encodeURIComponent(id)}`, { method: 'DELETE' })
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
  const { data, error } = await supabaseAdmin.from('users').select('email').eq('id', userId).maybeSingle()
  if (error) throw new Error(`lecture users : ${error.message}`)
  return data?.email || null
}

/** Profil d'accès (mêmes champs que ProtectedRoute). */
export async function profilAcces(userId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role, subscription_status, subscription_trial_end, subscription_current_period_end, disabled_at')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(`lecture users : ${error.message}`)
  return data
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
  objetExiste,
  effacerTranscription,
  emailDe,
}

/**
 * Balayage : termine les transcriptions restées « en cours » (rappel AssemblyAI perdu,
 * utilisateur parti). Lancé périodiquement par railway-server.mjs.
 */
export async function balayer({ ageMinMinutes = 10, maxLignes = 50 } = {}) {
  const avant = new Date(Date.now() - ageMinMinutes * 60 * 1000).toISOString()
  const depuis = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const jobs = []
  for (const etat of ['en_cours', 'lancement']) {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('conversation_id')
      .eq('source', SOURCE)
      .like('title', `%"etat":"${etat}"%`)
      .lt('created_at', avant)
      .gt('created_at', depuis)
      .limit(maxLignes)
    if (error) throw new Error(`balayage : ${error.message}`)
    jobs.push(...(data || []).map((d) => d.conversation_id))
  }
  const bilan = {}
  for (const job of jobs) {
    try {
      const r = await finaliser(job, depsFinaliser)
      bilan[r] = (bilan[r] || 0) + 1
    } catch (err) {
      console.error('[transcription] balayage', job, err?.message)
    }
  }
  return bilan
}
