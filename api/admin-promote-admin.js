import { verifyAdmin, supabaseAdmin } from './_lib/verifyAdmin.js'

// Promotion d'un compte `user` en `admin`, DANS LE MÊME MONDE (Mon Équipe IA).
// Les deux mondes restent étanches : on ne promeut JAMAIS un `fiche_lite` (monde
// crédits) en admin (monde abonnement). Un croisement exceptionnel se gère à la main
// en base, pas via l'UI. Écriture en service_role après vérification admin (le REVOKE
// des grants sur users.role côté client, PR précédente, rend cet endpoint le seul
// chemin possible).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req, res)
  if (!auth) return

  try {
    const { user_id } = req.body || {}
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'user_id requis' })
    }

    // Vérifie le rôle actuel de la cible.
    const { data: target, error: targetErr } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', user_id)
      .single()

    if (targetErr || !target) {
      return res.status(404).json({ error: 'Utilisateur introuvable' })
    }
    if (target.role === 'admin') {
      return res.status(400).json({ error: 'Ce compte est déjà admin' })
    }
    if (target.role !== 'user') {
      // fiche_lite (ou tout autre monde) → refus : étanchéité des mondes.
      return res.status(400).json({ error: `Seul un compte « user » peut être promu admin (rôle actuel : ${target.role})` })
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user_id)
      .select('id, role')
      .single()

    if (error) {
      console.error('admin-promote-admin: UPDATE failed:', error)
      return res.status(500).json({ error: 'Erreur promotion', details: error.message })
    }

    return res.status(200).json({ user: data })
  } catch (err) {
    console.error('admin-promote-admin: unexpected error:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
