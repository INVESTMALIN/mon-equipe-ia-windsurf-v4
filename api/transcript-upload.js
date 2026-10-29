// Assistant Transcription, étape 1 : adresse de dépôt signée dans R2.
// POST { filename, size } (jeton Supabase) → { job, cle, uploadUrl, contentType }
// Le navigateur envoie ensuite le fichier par un PUT direct sur uploadUrl, avec le
// même Content-Type. Voir api/_lib/transcription.js pour le parcours complet.

import { randomUUID } from 'node:crypto'
import { utilisateur, urlDepot } from './_lib/transcriptionService.js'
import { validerDepot, cleObjet } from './_lib/transcription.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await utilisateur(req, res)
  if (!user) return

  const { filename, size } = req.body || {}
  const v = validerDepot({ filename, size })
  if (!v.ok) return res.status(400).json({ error: v.error })

  try {
    const cle = cleObjet(user.id, v.ext)
    const uploadUrl = await urlDepot(cle, v.contentType)
    return res.status(200).json({ job: randomUUID(), cle, uploadUrl, contentType: v.contentType })
  } catch (err) {
    console.error('[transcript-upload]', err?.message)
    return res.status(500).json({ error: 'Impossible de préparer l\'envoi, réessayez.' })
  }
}
