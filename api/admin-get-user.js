import { verifyAdmin, supabaseAdmin } from './_lib/verifyAdmin.js'

// Détail complet d'un concierge pour la fiche admin (/admin/users/:id).
// Lecture seule, en service_role après vérification admin. Tronc commun (identité,
// email, état de confirmation, rôle, inscription) + bloc selon le monde du compte :
//   - fiche_lite → solde + historique du ledger + fiches du concierge ;
//   - user/admin → les champs d'abonnement suffisent (déjà dans le profil).
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

    // 1. Profil applicatif
    const { data: profile, error: profErr } = await supabaseAdmin
      .from('users')
      .select('id, prenom, nom, email, role, subscription_status, subscription_current_period_end, subscription_trial_end, subscription_cancel_at_period_end, has_used_trial, created_at')
      .eq('id', user_id)
      .single()

    if (profErr || !profile) {
      return res.status(404).json({ error: 'Utilisateur introuvable' })
    }

    // 2. Source de vérité auth (email, confirmation, date d'inscription)
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.getUserById(user_id)
    if (authErr) {
      console.error('admin-get-user: getUserById failed:', authErr)
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
        has_used_trial: profile.has_used_trial
      },
      credits: null,
      fiches: null
    }

    // 3. Bloc crédits + fiches — uniquement pour un concierge fiche_lite
    if (profile.role === 'fiche_lite') {
      const { data: balanceData, error: balErr } = await supabaseAdmin
        .rpc('get_credit_balance', { p_user_id: user_id })
      if (balErr) {
        console.error('admin-get-user: get_credit_balance failed:', balErr)
      }

      const { data: ledger, error: ledgerErr } = await supabaseAdmin
        .from('credit_ledger')
        .select('id, amount, type, description, metadata, created_at, fiche_id')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(100)
      if (ledgerErr) {
        console.error('admin-get-user: ledger SELECT failed:', ledgerErr)
      }

      const { data: fiches, error: fichesErr } = await supabaseAdmin
        .from('fiche_lite')
        .select('id, nom, statut, fields_locked, created_at, archived_at')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
      if (fichesErr) {
        console.error('admin-get-user: fiches SELECT failed:', fichesErr)
      }

      result.credits = {
        balance: typeof balanceData === 'number' ? balanceData : 0,
        ledger: ledger || []
      }
      result.fiches = fiches || []
    }

    return res.status(200).json(result)
  } catch (err) {
    console.error('admin-get-user: unexpected error:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
