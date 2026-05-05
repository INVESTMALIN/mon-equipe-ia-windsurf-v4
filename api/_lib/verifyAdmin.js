import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fail loud at module load — admin routes are useless without the service role key.
// This catches misconfigured deployments at the first request rather than letting
// later .from()/.auth.admin calls fail silently with confusing errors.
if (!SUPABASE_URL) {
  throw new Error('Missing Supabase URL env var (NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL)')
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var')
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

/**
 * Verify the caller is an authenticated admin.
 *
 * Returns { user, profile } on success. On failure, writes the appropriate
 * HTTP response (401 for missing/invalid token, 403 for non-admin role) and
 * returns null. Callers must check the return value and bail early:
 *
 *   const auth = await verifyAdmin(req, res)
 *   if (!auth) return
 */
export async function verifyAdmin(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    res.status(401).json({ error: 'Unauthorized, missing token' })
    return null
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    res.status(401).json({ error: 'Unauthorized, invalid token' })
    return null
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden, admin role required' })
    return null
  }

  return { user, profile }
}
