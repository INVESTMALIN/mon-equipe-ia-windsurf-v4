import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper pour les requêtes sécurisées
export const safeSupabaseQuery = async (query) => {
  try {
    return await query
  } catch (error) {
    console.error('Erreur Supabase:', error)
    return { data: null, error }
  }
}