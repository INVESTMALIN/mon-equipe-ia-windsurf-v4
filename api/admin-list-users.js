import { verifyAdmin, supabaseAdmin } from './_lib/verifyAdmin.js'

// V1 strategy: fetch all auth users (up to 1000), join in-memory with public.users,
// then filter/search/paginate server-side. Acceptable up to ~500 users.
// If volume grows, migrate to a Postgres view + RPC that joins auth.users with users
// in a single query (V2).
const MAX_AUTH_USERS = 1000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req, res)
  if (!auth) return

  try {
    const {
      page = 1,
      perPage = 25,
      search = '',
      status = 'all'
    } = req.body || {}

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const perPageNum = Math.min(100, Math.max(1, parseInt(perPage, 10) || 25))

    // 1. Fetch auth users (source of truth for email + created_at)
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: MAX_AUTH_USERS
    })

    if (authErr) {
      console.error('admin-list-users: auth.admin.listUsers failed:', authErr)
      return res.status(500).json({ error: 'Erreur récupération utilisateurs', details: authErr.message })
    }

    const authUsers = authData?.users || []
    if (authUsers.length === 0) {
      return res.status(200).json({ users: [], total: 0, page: pageNum, perPage: perPageNum })
    }

    // 2. Fetch matching profiles from public.users
    const ids = authUsers.map(u => u.id)
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('users')
      .select('id, prenom, nom, role, subscription_status, subscription_current_period_end, subscription_trial_end, subscription_cancel_at_period_end, stripe_subscription_id')
      .in('id', ids)

    if (profErr) {
      console.error('admin-list-users: SELECT users failed:', profErr)
      return res.status(500).json({ error: 'Erreur récupération profils', details: profErr.message })
    }

    const profilesById = new Map((profiles || []).map(p => [p.id, p]))

    // 3. Merge auth + profile. Defaults handle the case where an auth user has
    //    no matching profile row yet (shouldn't happen normally, but possible
    //    if a trigger/race left a gap — surface it with a 'free' fallback).
    let merged = authUsers.map(u => {
      const p = profilesById.get(u.id) || {}
      return {
        id: u.id,
        email: u.email || null,
        created_at: u.created_at,
        prenom: p.prenom ?? null,
        nom: p.nom ?? null,
        role: p.role ?? 'user',
        subscription_status: p.subscription_status ?? 'free',
        subscription_current_period_end: p.subscription_current_period_end ?? null,
        subscription_trial_end: p.subscription_trial_end ?? null,
        subscription_cancel_at_period_end: p.subscription_cancel_at_period_end ?? false,
        stripe_subscription_id: p.stripe_subscription_id ?? null
      }
    })

    // 4. Status filter (client passes 'all' for no filter)
    if (status && status !== 'all') {
      merged = merged.filter(u => u.subscription_status === status)
    }

    // 5. Email search (case-insensitive substring)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase()
      merged = merged.filter(u => (u.email || '').toLowerCase().includes(q))
    }

    // 6. Sort by created_at DESC (newest first)
    merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    // 7. Paginate
    const total = merged.length
    const start = (pageNum - 1) * perPageNum
    const end = start + perPageNum
    const pageUsers = merged.slice(start, end)

    return res.status(200).json({
      users: pageUsers,
      total,
      page: pageNum,
      perPage: perPageNum
    })
  } catch (err) {
    console.error('admin-list-users: unexpected error:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
