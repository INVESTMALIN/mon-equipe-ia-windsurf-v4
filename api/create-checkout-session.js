import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Supabase (⚠️ service key, pas anon)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Récupérer le token Supabase envoyé depuis le front
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized, missing token' })
    }

    // Vérifier l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized, invalid user' })
    }

    // Chercher le stripe_customer_id dans ta table users
    const { data, error } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (error || !data?.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found for this user' })
    }

    const actualCustomerId = data.stripe_customer_id

    // Créer la session du Customer Portal
    const session = await stripe.billingPortal.sessions.create({
      customer: actualCustomerId,
      return_url: req.body.return_url || 'https://mon-equipe-ia.vercel.app/mon-compte'
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('❌ Erreur création session portal:', error)
    return res.status(500).json({
      error: 'Erreur serveur',
      details: error.message,
      type: error.type
    })
  }
}