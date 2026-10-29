// Assistant Transcription, étape 2 : le fichier est dans R2, on lance la transcription.
// POST { job, cle, filename } (jeton Supabase) → { job }
// Enregistre la ligne d'historique (« en cours ») puis demande la transcription à
// AssemblyAI, qui rappellera /api/transcript-webhook.

import { utilisateur, tailleObjet, urlLecture, lancerTranscription, db, WEBHOOK_SECRET, effacerObjet } from './_lib/transcriptionService.js'
import { estCleDe, estUuid, etatSigne, MAX_BYTES, MESSAGE_EN_COURS } from './_lib/transcription.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await utilisateur(req, res)
  if (!user) return

  const { job, cle, filename } = req.body || {}
  if (!estUuid(job) || !estCleDe(user.id, cle)) {
    return res.status(400).json({ error: 'Demande invalide' })
  }
  const nom = String(filename || 'fichier').slice(0, 200)

  try {
    if (await db.lire(job)) return res.status(409).json({ error: 'Transcription déjà lancée' })

    const taille = await tailleObjet(cle)
    if (taille === null) return res.status(400).json({ error: 'Fichier introuvable : l\'envoi n\'est pas allé au bout, réessayez.' })
    if (taille > MAX_BYTES) {
      await effacerObjet(cle).catch(() => {})
      return res.status(400).json({ error: 'Le fichier est trop volumineux (1 Go maximum).' })
    }

    const aai = await lancerTranscription({ audioUrl: await urlLecture(cle), job })
    await db.creer({
      user_id: user.id,
      conversation_id: job,
      question: `[Fichier envoyé : ${nom}]`,
      answer: MESSAGE_EN_COURS,
      title: etatSigne(WEBHOOK_SECRET, { etat: 'en_cours', aai, cle, job }),
    })
    return res.status(200).json({ job })
  } catch (err) {
    console.error('[transcript-start]', err?.message)
    return res.status(500).json({ error: 'La transcription n\'a pas pu être lancée, réessayez.' })
  }
}
