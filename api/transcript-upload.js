// Assistant Transcription, étape 1 : adresse de dépôt signée dans R2.
// POST { filename, size } (jeton Supabase) → { cle, uploadUrl, contentType }
// Le navigateur envoie ensuite le fichier par un PUT direct sur uploadUrl, avec le
// même Content-Type et la même taille (tous deux signés). Voir api/_lib/transcription.js.

import { utilisateur, urlDepot, profilAcces, fichiersEnCours } from './_lib/transcriptionService.js'
import { validerDepot, cleObjet, accesAutorise, MAX_EN_COURS } from './_lib/transcription.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await utilisateur(req, res)
  if (!user) return

  const { filename, size } = req.body || {}
  const v = validerDepot({ filename, size })
  if (!v.ok) return res.status(400).json({ error: v.error })

  try {
    if (!accesAutorise(await profilAcces(user.id))) {
      return res.status(403).json({ error: 'L\'Assistant Transcription est réservé aux abonnés.' })
    }
    if ((await fichiersEnCours(user.id)) >= MAX_EN_COURS) {
      return res.status(429).json({ error: `Vous avez déjà ${MAX_EN_COURS} transcriptions en cours : attendez qu'elles se terminent.` })
    }
    const cle = cleObjet(user.id, v.ext)
    const uploadUrl = await urlDepot(cle, v.contentType, Number(size))
    return res.status(200).json({ cle, uploadUrl, contentType: v.contentType })
  } catch (err) {
    console.error('[transcript-upload]', err?.message)
    return res.status(500).json({ error: 'Impossible de préparer l\'envoi, réessayez.' })
  }
}
