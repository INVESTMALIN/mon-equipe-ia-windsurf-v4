// Assistant Transcription : rappel d'AssemblyAI quand une transcription est terminée.
// POST /api/transcript-webhook?job=<uuid>, en-tête X-Transcript-Webhook-Secret.
// Le résultat n'est PAS pris dans le corps reçu : on le relit chez AssemblyAI avec
// l'identifiant signé stocké en base (voir finaliser()).
// Répond 200 dès que la ligne est traitée (ou l'était déjà) ; 5xx en cas de panne
// pour qu'AssemblyAI réessaie. L'appli vérifie aussi d'elle-même (transcript-status).

import { depsFinaliser, WEBHOOK_SECRET, WEBHOOK_HEADER } from './_lib/transcriptionService.js'
import { finaliser, estUuid, comparerSecret } from './_lib/transcription.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!comparerSecret(WEBHOOK_SECRET, req.headers[WEBHOOK_HEADER.toLowerCase()])) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const job = req.query?.job
  if (!estUuid(job)) return res.status(400).json({ error: 'job invalide' })

  try {
    const r = await finaliser(job, depsFinaliser)
    return res.status(200).json({ ok: true, resultat: r })
  } catch (err) {
    console.error('[transcript-webhook]', job, err?.message)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}
