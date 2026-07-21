import { verifyAdmin, supabaseAdmin } from './_lib/verifyAdmin.js'

// Déverrouille une fiche verrouillée (fields_locked → false). Le verrou anti-recyclage
// (trigger trg_fiche_lite_enforce_lock) interdit l'auto-déverrouillage aux users
// `authenticated` ; le déverrouillage est réservé à l'administration. En service_role
// (auth.role() = 'service_role'), le trigger bypasse en tête de fonction, donc l'UPDATE
// passe. C'est le chemin d'admin explicitement prévu par la migration du verrou.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req, res)
  if (!auth) return

  try {
    const { fiche_id } = req.body || {}
    if (!fiche_id || typeof fiche_id !== 'string') {
      return res.status(400).json({ error: 'fiche_id requis' })
    }

    const { data, error } = await supabaseAdmin
      .from('fiche_lite')
      .update({ fields_locked: false })
      .eq('id', fiche_id)
      .select('id, fields_locked')
      .single()

    if (error) {
      console.error('admin-unlock-fiche: UPDATE failed:', error)
      return res.status(500).json({ error: 'Erreur déverrouillage', details: error.message })
    }
    if (!data) {
      return res.status(404).json({ error: 'Fiche introuvable' })
    }

    return res.status(200).json({ fiche: data })
  } catch (err) {
    console.error('admin-unlock-fiche: unexpected error:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
