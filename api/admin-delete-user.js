import { verifyAdmin, supabaseAdmin } from './_lib/verifyAdmin.js'

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

    // Block self-delete in addition to the frontend disabled state.
    if (auth.user.id === user_id) {
      return res.status(400).json({ error: 'Tu ne peux pas supprimer ton propre compte' })
    }

    // Belt and suspenders: explicit profile DELETE before auth.admin.deleteUser.
    // Works whether or not public.users.id has REFERENCES auth.users(id) ON DELETE CASCADE.
    // If CASCADE exists this is redundant but harmless; if it doesn't, this prevents
    // an orphan profile row.
    const { error: profileErr } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', user_id)

    if (profileErr) {
      console.error('admin-delete-user: profile delete failed:', profileErr)
      return res.status(500).json({ error: 'Erreur suppression profil', details: profileErr.message })
    }

    // Note: deleting the auth user is what actually revokes access. If this fails
    // after the profile delete succeeded, the admin can retry — auth.admin.deleteUser
    // is idempotent (re-deleting a missing user returns an error we ignore on retry).
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(user_id)

    if (authErr) {
      console.error('admin-delete-user: auth delete failed:', authErr)
      return res.status(500).json({ error: 'Erreur suppression auth', details: authErr.message })
    }

    return res.status(200).json({ success: true, deleted_id: user_id })
  } catch (err) {
    console.error('admin-delete-user: unexpected error:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
