import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { APP_URL, requireEnv } from './_lib/env.js'

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Supabase avec service key pour écrire en DB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 🔥 IDs Mon Équipe IA (pour metadata)
const MON_EQUIPE_IA_PRODUCT_ID = requireEnv('STRIPE_SUBSCRIPTION_PRODUCT_ID')
const MON_EQUIPE_IA_PRICE_ID = requireEnv('STRIPE_SUBSCRIPTION_PRICE_ID')

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

    // Vérifier si l'utilisateur a déjà un customer Stripe ou une subscription
    const { data: existingUser } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id, subscription_status, has_used_trial')
      .eq('id', user.id)
      .single()

    // Empêcher de créer plusieurs trials
    if (existingUser?.subscription_status === 'trial' || existingUser?.subscription_status === 'premium') {
      return res.status(400).json({ 
        error: 'Vous avez déjà un abonnement actif',
        current_status: existingUser.subscription_status 
      })
    }

    // ⚡️ Si pas de customer Stripe → on le crée
    let customerId = existingUser?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || 'Utilisateur'
      })

      customerId = customer.id

      // Sauvegarder en DB pour usage futur
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)

      console.log('👤 Nouveau customer Stripe créé:', customerId)
    }

    // 🔥 NOUVEAU : Conditionner le trial selon has_used_trial
    const subscription_data = {}
    if (!existingUser?.has_used_trial) {
      subscription_data.trial_period_days = 30
      console.log('✨ Trial de 30 jours appliqué (premier abonnement)')
    } else {
      console.log('⚠️ Pas de trial (utilisateur a déjà consommé son trial)')
    }

    // Créer la Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      
      line_items: [{
        price: MON_EQUIPE_IA_PRICE_ID, // 19,99€/mois
        quantity: 1,
      }],

      // 🔥 MODIFIÉ : Trial conditionnel
      subscription_data: subscription_data,

      // 🔥 Métadonnées pour le webhook (AVEC product/price IDs)
      client_reference_id: user.id, // Pour identifier l'user dans le webhook
      metadata: {
        user_id: user.id,
        user_email: user.email,
        product: MON_EQUIPE_IA_PRODUCT_ID, // 🔥 AJOUTÉ pour filtrage
        price: MON_EQUIPE_IA_PRICE_ID       // 🔥 AJOUTÉ pour filtrage
      },

      // URLs de redirection
      success_url: `${req.headers.origin || APP_URL}/mon-compte?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || APP_URL}/upgrade`,

      // Paramètres pour un meilleur UX
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    console.log('✅ Checkout session créée:', session.id)
    return res.status(200).json({ 
      url: session.url,
      session_id: session.id 
    })

  } catch (error) {
    console.error('❌ Erreur création checkout session:', error)
    return res.status(500).json({
      error: 'Erreur serveur',
      details: error.message,
      type: error.type
    })
  }
}