// Assistant Transcription : rappel d'AssemblyAI quand une transcription est terminée.
// POST /api/transcript-webhook?job=<uuid>, en-tête X-Transcript-Webhook-Secret.
// Le résultat n'est PAS pris dans le corps reçu : on le relit chez AssemblyAI avec
// l'identifiant signé stocké en base (voir finaliser()).
// 200 quand la ligne est traitée (ou l'était déjà). 503 quand elle n'est pas encore
// prête (ligne absente ou lancement pas fini) ou en cas de panne : AssemblyAI réessaie.
// Filets : l'appli (transcript-status) et le balayage périodique du serveur.

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
    if (r === 'inconnu' || r === 'en_cours') return res.status(503).json({ ok: false, resultat: r })
    return res.status(200).json({ ok: true, resultat: r })
  } catch (err) {
    console.error('[transcript-webhook]', job, err?.message)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}
