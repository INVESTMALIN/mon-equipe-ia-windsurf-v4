// Assistant Transcription : l'appli demande où en est une transcription.
// POST { job } (jeton Supabase) → { etat: 'en_cours'|'termine'|'erreur', answer }
// Filet de sécurité du rappel AssemblyAI : si la ligne est encore « en cours », on
// interroge AssemblyAI et on termine nous-mêmes (même fonction, idempotente).

import { utilisateur, db, depsFinaliser, WEBHOOK_SECRET } from './_lib/transcriptionService.js'
import { finaliser, estUuid, lireEtat } from './_lib/transcription.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await utilisateur(req, res)
  if (!user) return

  const { job } = req.body || {}
  if (!estUuid(job)) return res.status(400).json({ error: 'Demande invalide' })

  try {
    let ligne = await db.lire(job)
    if (!ligne || ligne.user_id !== user.id) return res.status(404).json({ error: 'Introuvable' })
    let etat = lireEtat(WEBHOOK_SECRET, job, ligne.title)
    if (etat?.etat === 'en_cours') {
      await finaliser(job, depsFinaliser)
      ligne = await db.lire(job)
      etat = lireEtat(WEBHOOK_SECRET, job, ligne?.title)
    }
    return res.status(200).json({ etat: etat?.etat || 'erreur', answer: ligne?.answer || '' })
  } catch (err) {
    console.error('[transcript-status]', job, err?.message)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}
