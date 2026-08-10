// src/lib/guideAccesAgent.js
//
// Appel de l'agent guide d'accès (workflow n8n de Kévin) : validation du fichier,
// conversion base64, POST, lecture de la réponse.
//
// Deux consommateurs :
//   - l'assistant autonome  (src/components/AssistantGuideAcces.jsx, route /assistant-guide-acces)
//   - le bloc inline        (src/components/fiche/AgentGuideAcces.jsx, section Guide d'Accès)
// Ce module est la SEULE définition de l'URL, du timeout, des formats acceptés et du
// parsing de la réponse : les deux écrans ne peuvent plus diverger.
//
// ⚠️ Le fichier n'est JAMAIS stocké (ni bucket, ni base) : il part en base64 au webhook
// et il est jeté. Régénérer implique donc de re-téléverser un média.

export const GUIDE_ACCES_WEBHOOK_URL =
  'https://hub.cardin.cloud/webhook/5ebcffdd-fee8-4525-85f1-33f57ce4d28d/chat'

// La transcription + la rédaction prennent plusieurs minutes sur une vidéo longue.
export const GUIDE_ACCES_TIMEOUT_MS = 240000

// Attribut `accept` de l'input fichier et libellés affichés, dérivés de la MÊME liste
// que la validation ci-dessous.
export const GUIDE_ACCES_ACCEPT = '.mp4,.webm,.mov,.mp3,.wav,.m4a,video/*,audio/*'
export const GUIDE_ACCES_FORMATS_LABEL = 'MP4, WebM, MOV, MP3, WAV, M4A'
export const GUIDE_ACCES_TAILLES_LABEL = '350MB vidéo / 10MB audio'

const MAX_VIDEO_BYTES = 350 * 1024 * 1024
const MAX_AUDIO_BYTES = 10 * 1024 * 1024

// Le type MIME renvoyé par le navigateur est parfois vide (fichier venu d'un partage
// mobile) : on croise toujours type ET extension.
function detecterFormat(file) {
  const nom = file.name.toLowerCase()
  const isMp4 = file.type === 'video/mp4' || nom.endsWith('.mp4')
  const isWebm = file.type === 'video/webm' || file.type === 'audio/webm' || nom.endsWith('.webm')
  const isMov = file.type === 'video/quicktime' || nom.endsWith('.mov')
  const isMp3 = file.type === 'audio/mpeg' || nom.endsWith('.mp3')
  const isWav = file.type === 'audio/wav' || file.type === 'audio/x-wav' || nom.endsWith('.wav')
  const isM4a = file.type === 'audio/mp4' || file.type === 'audio/x-m4a' || nom.endsWith('.m4a')

  const reconnu = isMp4 || isWebm || isMov || isMp3 || isWav || isM4a
  const isAudio = isMp3 || isWav || isM4a || (isWebm && file.type.startsWith('audio'))

  return { reconnu, isAudio }
}

/**
 * Valide un fichier sélectionné.
 * @returns {string|null} le message d'erreur à afficher, ou null si le fichier est bon.
 */
export function validateGuideAccesFile(file) {
  if (!file) return 'Aucun fichier sélectionné.'

  const { reconnu, isAudio } = detecterFormat(file)
  if (!reconnu) {
    return 'Veuillez sélectionner une vidéo (MP4, WebM, MOV) ou un audio (MP3, WAV, M4A, WebM).'
  }

  const maxSize = isAudio ? MAX_AUDIO_BYTES : MAX_VIDEO_BYTES
  if (file.size > maxSize) {
    return `Le fichier est trop volumineux. Taille maximum autorisée : ${isAudio ? '10MB' : '350MB'}.`
  }

  if (file.size === 0) return 'Le fichier sélectionné est vide.'

  return null
}

// Repli d'après l'extension quand le navigateur ne fournit pas de type MIME : le
// workflow n8n s'appuie dessus pour router vers le bon décodeur.
function resoudreMimeType(file) {
  if (file.type) return file.type
  const ext = file.name.toLowerCase().split('.').pop()
  if (ext === 'mp3') return 'audio/mpeg'
  if (ext === 'mp4') return 'video/mp4'
  if (ext === 'webm') return 'video/webm'
  if (ext === 'mov') return 'video/quicktime'
  if (ext === 'wav') return 'audio/wav'
  if (ext === 'm4a') return 'audio/mp4'
  return ''
}

/** Convertit un File en entrée `files[]` du webhook : { data, fileName, mimeType }. */
export async function fileToWebhookFile(file) {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  return { data: base64, fileName: file.name, mimeType: resoudreMimeType(file) }
}

/**
 * Appelle le webhook et renvoie le texte du guide.
 * Lève une Error en cas d'échec — passer l'erreur à `guideAccesErrorMessage` pour
 * obtenir un message affichable.
 */
export async function genererGuideAcces({
  sessionId,
  message,
  file = null,
  context = null,
  timeoutMs = GUIDE_ACCES_TIMEOUT_MS,
}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const fileData = file ? await fileToWebhookFile(file) : null

    const payload = {
      sessionId,
      message,
      ...(fileData && { files: [fileData] }),
      ...(context && { context }),
    }

    const res = await fetch(GUIDE_ACCES_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`)

    const responseText = await res.text()
    if (!responseText || responseText.trim() === '') {
      throw new Error("Le webhook n'a renvoyé aucune donnée")
    }

    const responseData = JSON.parse(responseText)
    const data = Array.isArray(responseData) ? responseData[0] : responseData
    return data.data?.output || data.output || data.response || 'Aucune réponse reçue.'
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Traduit une exception de `genererGuideAcces` en message destiné à l'utilisateur.
 * La durée annoncée est DÉRIVÉE du timeout réel : l'ancien message annonçait « 2 min »
 * pour un timeout de 4 minutes.
 */
export function guideAccesErrorMessage(error, timeoutMs = GUIDE_ACCES_TIMEOUT_MS) {
  if (error?.name === 'AbortError') {
    const minutes = Math.round(timeoutMs / 60000)
    return `La génération du guide a pris trop de temps (timeout ${minutes} min). Essayez avec une vidéo plus courte.`
  }
  if (error?.message?.includes('Failed to fetch')) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
  }
  return 'Une erreur est survenue. Veuillez réessayer.'
}
