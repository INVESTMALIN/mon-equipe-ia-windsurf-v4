import { verifyAdmin, supabaseAdmin } from './_lib/verifyAdmin.js'

// Ajustement manuel des crédits d'un concierge fiche_lite (ajout offert / retrait
// correction), via la fonction SQL atomique admin_adjust_credits (advisory lock +
// recalcul du solde sous verrou + refus de passer sous zéro + ledger append-only).
// Toute la logique sensible est en base ; ce endpoint se contente d'authentifier
// l'admin, de normaliser l'entrée, et de tracer l'auteur.
const VALID_ACTIONS = ['add', 'remove']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req, res)
  if (!auth) return

  try {
    const { user_id, action, amount, reason } = req.body || {}

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'user_id requis' })
    }
    if (!VALID_ACTIONS.includes(action)) {
      return res.status(400).json({ error: 'Action invalide (add | remove)' })
    }
    // Le front envoie un montant POSITIF ; le sens vient de `action`.
    const n = parseInt(amount, 10)
    if (!Number.isInteger(n) || n <= 0) {
      return res.status(400).json({ error: 'Montant invalide (entier positif requis)' })
    }
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return res.status(400).json({ error: 'Raison obligatoire' })
    }

    const signedAmount = action === 'add' ? n : -n
    const type = action === 'add' ? 'offert' : 'correction'

    const { data, error } = await supabaseAdmin.rpc('admin_adjust_credits', {
      p_user_id: user_id,
      p_amount: signedAmount,
      p_type: type,
      p_reason: reason.trim(),
      p_admin_id: auth.user.id
    })

    if (error) {
      // Les gardes métier (solde insuffisant, mauvaise cible, etc.) remontent en P0001.
      console.error('admin-adjust-credits: RPC failed:', error)
      const isBusiness = error.code === 'P0001'
      return res.status(isBusiness ? 400 : 500).json({
        error: isBusiness ? error.message : 'Erreur ajustement crédits',
        details: isBusiness ? undefined : error.message
      })
    }

    return res.status(200).json({ balance: data })
  } catch (err) {
    console.error('admin-adjust-credits: unexpected error:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
