import { verifyAdmin, supabaseAdmin } from './_lib/verifyAdmin.js'

function addMonths(date, months) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

const VALID_ACTIONS = ['set_free', 'set_premium', 'renew']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req, res)
  if (!auth) return

  try {
    const { user_id, action, months, custom_end_date } = req.body || {}

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'user_id requis' })
    }
    if (!VALID_ACTIONS.includes(action)) {
      return res.status(400).json({ error: 'Action invalide' })
    }

    // Block self-target — admins shouldn't be able to demote/lock themselves out
    // through the UI. Doubled with a frontend disabled state.
    if (auth.user.id === user_id) {
      return res.status(400).json({ error: 'Tu ne peux pas modifier ton propre statut' })
    }

    // Build the update payload based on action.
    // Note: stripe_customer_id and stripe_subscription_id are deliberately NEVER
    // touched here — preserving them keeps future Stripe webhooks consistent.
    let update

    if (action === 'set_free') {
      update = {
        subscription_status: 'free',
        subscription_current_period_end: null,
        subscription_trial_end: null,
        subscription_cancel_at_period_end: false
      }
    } else {
      // set_premium and renew share the same write logic — both compute
      // period_end from "today + months" (per the V1 product decision).
      let period_end
      if (custom_end_date) {
        const d = new Date(custom_end_date)
        if (Number.isNaN(d.getTime()) || d <= new Date()) {
          return res.status(400).json({ error: "Date d'expiration invalide (doit être dans le futur)" })
        }
        period_end = d.toISOString()
      } else {
        const m = parseInt(months, 10)
        if (!m || m <= 0) {
          return res.status(400).json({ error: 'Durée invalide' })
        }
        period_end = addMonths(new Date(), m).toISOString()
      }
      update = {
        subscription_status: 'premium',
        subscription_current_period_end: period_end,
        subscription_trial_end: null,
        subscription_cancel_at_period_end: false
      }
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(update)
      .eq('id', user_id)
      .select()
      .single()

    if (error) {
      console.error('admin-update-subscription: UPDATE failed:', error)
      return res.status(500).json({ error: 'Erreur mise à jour', details: error.message })
    }

    return res.status(200).json({ user: data })
  } catch (err) {
    console.error('admin-update-subscription: unexpected error:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
