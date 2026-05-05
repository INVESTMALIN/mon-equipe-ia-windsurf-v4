import { verifyAdmin, supabaseAdmin } from './_lib/verifyAdmin.js'

function addMonths(date, months) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req, res)
  if (!auth) return

  try {
    const {
      email,
      password,
      prenom,
      nom,
      subscription_status,
      months,
      custom_end_date
    } = req.body || {}

    // Basic validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email requis' })
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Mot de passe requis (6 caractères minimum)' })
    }
    if (!['free', 'premium'].includes(subscription_status)) {
      return res.status(400).json({ error: 'Statut invalide' })
    }

    // Compute period_end if premium
    let period_end = null
    if (subscription_status === 'premium') {
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
    }

    // 1. Create the auth user (no welcome email — email_confirm: true bypasses verification)
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true
    })

    if (authErr) {
      console.error('admin-create-user: createUser failed:', authErr)
      // Most common case: email already in use
      return res.status(400).json({ error: authErr.message || 'Erreur création compte auth' })
    }

    const newUserId = authData.user.id

    // 2. Upsert profile. Don't presume a trigger created the row — covers both
    //    "trigger exists" and "trigger missing" deployments idempotently.
    const profileData = {
      id: newUserId,
      prenom: prenom?.trim() || null,
      nom: nom?.trim() || null,
      role: 'user',
      subscription_status,
      subscription_current_period_end: period_end,
      subscription_trial_end: null,
      subscription_cancel_at_period_end: false,
      has_used_trial: false
    }

    const { error: upsertErr } = await supabaseAdmin
      .from('users')
      .upsert(profileData, { onConflict: 'id' })

    if (upsertErr) {
      // Rollback the auth user so we don't leave a half-created account
      console.error('admin-create-user: profile upsert failed, rolling back auth user:', upsertErr)
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      return res.status(500).json({ error: 'Erreur création profil', details: upsertErr.message })
    }

    return res.status(200).json({
      user: {
        id: newUserId,
        email: authData.user.email,
        created_at: authData.user.created_at,
        ...profileData
      }
    })
  } catch (err) {
    console.error('admin-create-user: unexpected error:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
