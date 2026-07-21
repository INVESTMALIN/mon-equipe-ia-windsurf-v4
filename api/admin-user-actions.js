import { verifyAdmin, supabaseAdmin } from './_lib/verifyAdmin.js'

// Routeur unique des opérations admin sur un concierge (lecture détail + écritures),
// dispatché sur `action`. Regroupé en UN endpoint à dessein : le plan Vercel Hobby
// plafonne à 12 fonctions serverless par déploiement. Chaque nouvelle opération admin
// s'ajoute ici comme un `case`, sans créer de fonction supplémentaire.
//
// Toute action vérifie d'abord l'admin via verifyAdmin ; toutes les écritures passent
// en service_role. Aucune écriture directe depuis le front sur ces données sensibles.

async function handleGet(req, res) {
  const { user_id } = req.body || {}
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'user_id requis' })
  }

  const { data: profile, error: profErr } = await supabaseAdmin
    .from('users')
    .select('id, prenom, nom, email, role, subscription_status, subscription_current_period_end, subscription_trial_end, subscription_cancel_at_period_end, has_used_trial, stripe_subscription_id, created_at')
    .eq('id', user_id)
    .single()

  if (profErr || !profile) {
    return res.status(404).json({ error: 'Utilisateur introuvable' })
  }

  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.getUserById(user_id)
  if (authErr) {
    console.error('admin-user-actions/get: getUserById failed:', authErr)
  }
  const authUser = authData?.user || null

  const result = {
    user: {
      id: profile.id,
      email: authUser?.email || profile.email || null,
      email_confirmed_at: authUser?.email_confirmed_at || null,
      created_at: authUser?.created_at || profile.created_at || null,
      prenom: profile.prenom,
      nom: profile.nom,
      role: profile.role,
      subscription_status: profile.subscription_status,
      subscription_current_period_end: profile.subscription_current_period_end,
      subscription_trial_end: profile.subscription_trial_end,
      subscription_cancel_at_period_end: profile.subscription_cancel_at_period_end,
      // Nécessaire au front (AdminUpdateSubscriptionModal) pour afficher l'avertissement
      // « set_free n'annule pas la facturation Stripe » quand un abo Stripe existe.
      stripe_subscription_id: profile.stripe_subscription_id ?? null,
      has_used_trial: profile.has_used_trial
    },
    credits: null,
    fiches: null
  }

  if (profile.role === 'fiche_lite') {
    const { data: balanceData, error: balErr } = await supabaseAdmin
      .rpc('get_credit_balance', { p_user_id: user_id })
    if (balErr) console.error('admin-user-actions/get: get_credit_balance failed:', balErr)

    const { data: ledger, error: ledgerErr } = await supabaseAdmin
      .from('credit_ledger')
      .select('id, amount, type, description, metadata, created_at, fiche_id')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(100)
    if (ledgerErr) console.error('admin-user-actions/get: ledger SELECT failed:', ledgerErr)

    const { data: fiches, error: fichesErr } = await supabaseAdmin
      .from('fiche_lite')
      .select('id, nom, statut, fields_locked, created_at, archived_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
    if (fichesErr) console.error('admin-user-actions/get: fiches SELECT failed:', fichesErr)

    result.credits = {
      balance: typeof balanceData === 'number' ? balanceData : 0,
      ledger: ledger || []
    }
    result.fiches = fiches || []
  }

  return res.status(200).json(result)
}

async function handleAdjustCredits(req, res, auth) {
  const { user_id, direction, amount, reason } = req.body || {}

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'user_id requis' })
  }
  if (!['add', 'remove'].includes(direction)) {
    return res.status(400).json({ error: 'Direction invalide (add | remove)' })
  }
  const n = parseInt(amount, 10)
  if (!Number.isInteger(n) || n <= 0) {
    return res.status(400).json({ error: 'Montant invalide (entier positif requis)' })
  }
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return res.status(400).json({ error: 'Raison obligatoire' })
  }

  const signedAmount = direction === 'add' ? n : -n
  const type = direction === 'add' ? 'offert' : 'correction'

  const { data, error } = await supabaseAdmin.rpc('admin_adjust_credits', {
    p_user_id: user_id,
    p_amount: signedAmount,
    p_type: type,
    p_reason: reason.trim(),
    p_admin_id: auth.user.id
  })

  if (error) {
    // Gardes métier (solde insuffisant, mauvaise cible, signe…) remontent en P0001.
    console.error('admin-user-actions/adjust_credits: RPC failed:', error)
    const isBusiness = error.code === 'P0001'
    return res.status(isBusiness ? 400 : 500).json({
      error: isBusiness ? error.message : 'Erreur ajustement crédits',
      details: isBusiness ? undefined : error.message
    })
  }

  return res.status(200).json({ balance: data })
}

async function handleUnlockFiche(req, res) {
  const { fiche_id } = req.body || {}
  if (!fiche_id || typeof fiche_id !== 'string') {
    return res.status(400).json({ error: 'fiche_id requis' })
  }

  // Le trigger trg_fiche_lite_enforce_lock réserve le déverrouillage à l'administration :
  // en service_role (auth.role() <> 'authenticated'), il bypasse en tête de fonction.
  const { data, error } = await supabaseAdmin
    .from('fiche_lite')
    .update({ fields_locked: false })
    .eq('id', fiche_id)
    .select('id, fields_locked')
    .single()

  if (error) {
    console.error('admin-user-actions/unlock_fiche: UPDATE failed:', error)
    return res.status(500).json({ error: 'Erreur déverrouillage', details: error.message })
  }
  if (!data) {
    return res.status(404).json({ error: 'Fiche introuvable' })
  }
  return res.status(200).json({ fiche: data })
}

async function handlePromoteAdmin(req, res) {
  const { user_id } = req.body || {}
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'user_id requis' })
  }

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
  // Étanchéité des mondes : seul un `user` (monde Mon Équipe IA) peut être promu admin.
  if (target.role !== 'user') {
    return res.status(400).json({ error: `Seul un compte « user » peut être promu admin (rôle actuel : ${target.role})` })
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ role: 'admin' })
    .eq('id', user_id)
    .select('id, role')
    .single()

  if (error) {
    console.error('admin-user-actions/promote_admin: UPDATE failed:', error)
    return res.status(500).json({ error: 'Erreur promotion', details: error.message })
  }
  return res.status(200).json({ user: data })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req, res)
  if (!auth) return

  try {
    const { action } = req.body || {}
    switch (action) {
      case 'get':            return await handleGet(req, res)
      case 'adjust_credits': return await handleAdjustCredits(req, res, auth)
      case 'unlock_fiche':   return await handleUnlockFiche(req, res)
      case 'promote_admin':  return await handlePromoteAdmin(req, res)
      default:
        return res.status(400).json({ error: 'Action invalide' })
    }
  } catch (err) {
    console.error('admin-user-actions: unexpected error:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
