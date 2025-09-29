export const config = {
  api: {
    bodyParser: false
  },
  runtime: "nodejs"
}

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import getRawBody from 'raw-body'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 🔥 FILTRES MON ÉQUIPE IA
const MON_EQUIPE_IA_PRODUCT_ID = 'prod_T4pyi8D8gPloKU'
const MON_EQUIPE_IA_PRICE_ID = 'price_1S8gIcIvBgiHMciNIi9WtP8W'

/**
 * Vérifie si l'événement concerne Mon Équipe IA
 */
function isMonEquipeIAEvent(event) {
  const { type, data } = event
  
  // Pour checkout.session.completed
  if (type === 'checkout.session.completed') {
    const session = data.object
    // Vérifier si la session contient notre product_id dans metadata
    // (on va l'ajouter dans create-checkout-session.js)
    return session.metadata?.product === MON_EQUIPE_IA_PRODUCT_ID ||
           session.metadata?.price === MON_EQUIPE_IA_PRICE_ID
  }
  
  // Pour invoice.payment_succeeded et invoice.payment_failed
  if (type === 'invoice.payment_succeeded' || type === 'invoice.payment_failed') {
    const invoice = data.object
    // Vérifier les lignes de l'invoice
    if (invoice.lines && invoice.lines.data) {
      return invoice.lines.data.some(line => 
        line.price?.id === MON_EQUIPE_IA_PRICE_ID ||
        line.price?.product === MON_EQUIPE_IA_PRODUCT_ID
      )
    }
    return false
  }
  
  // Pour customer.subscription.deleted
  if (type === 'customer.subscription.deleted') {
    const subscription = data.object
    // Vérifier les items de la subscription
    if (subscription.items && subscription.items.data) {
      return subscription.items.data.some(item =>
        item.price?.id === MON_EQUIPE_IA_PRICE_ID ||
        item.price?.product === MON_EQUIPE_IA_PRODUCT_ID
      )
    }
    return false
  }
  
  return false
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    const buf = await getRawBody(req)
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret)
    console.log(`📨 Webhook reçu: ${event.type}`)
  } catch (err) {
    console.error('❌ Signature webhook invalide:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // 🔥 FILTRAGE : Ignorer si ce n'est pas Mon Équipe IA
  if (!isMonEquipeIAEvent(event)) {
    console.log(`⏭️ Événement ignoré (pas Mon Équipe IA): ${event.type}`)
    return res.json({ received: true, ignored: true, reason: 'not_mon_equipe_ia' })
  }

  console.log(`✅ Événement Mon Équipe IA confirmé: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('🛒 Checkout session completed:', session.id)

        // Récupérer les détails de la subscription depuis Stripe
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        console.log('📋 Subscription status:', subscription.status)
        console.log('⏰ Trial end:', subscription.trial_end)

        // Déterminer le statut selon si c'est un trial ou pas
        const isOnTrial = subscription.status === 'trialing'
        const subscriptionStatus = isOnTrial ? 'trial' : 'premium'

        // Préparer les données à mettre à jour
        const updateData = {
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_status: subscriptionStatus
        }

        // Si trial, ajouter la date de fin
        if (isOnTrial && subscription.trial_end) {
          updateData.subscription_trial_end = new Date(subscription.trial_end * 1000)
          console.log('📅 Trial end date:', updateData.subscription_trial_end)
        }

        // Si premium immédiat, ajouter la date de fin de période
        if (!isOnTrial && subscription.current_period_end) {
          updateData.subscription_current_period_end = new Date(subscription.current_period_end * 1000)
        }

        // Mettre à jour Supabase
        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', session.client_reference_id)

        if (error) {
          console.error('❌ Erreur Supabase:', error)
          throw error
        }

        console.log('✅ Utilisateur mis à jour:', {
          user_id: session.client_reference_id,
          status: subscriptionStatus,
          customer_id: session.customer
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log('💰 Paiement réussi pour customer:', invoice.customer)

        // Récupérer la subscription pour avoir les dates
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)

        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'premium',
            subscription_current_period_end: new Date(subscription.current_period_end * 1000),
            subscription_trial_end: null // Clear trial end quand on devient premium
          })
          .eq('stripe_customer_id', invoice.customer)

        if (error) {
          console.error('❌ Erreur Supabase payment succeeded:', error)
          throw error
        }

        console.log('✅ Utilisateur passé en premium:', invoice.customer)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('❌ Subscription cancelled:', subscription.customer)

        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'expired',
            stripe_subscription_id: null,
            subscription_current_period_end: null,
            subscription_trial_end: null
          })
          .eq('stripe_customer_id', subscription.customer)

        if (error) {
          console.error('❌ Erreur Supabase subscription deleted:', error)
          throw error
        }

        console.log('✅ Utilisateur passé en expired (sub deleted):', subscription.customer)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log('❌ Payment failed pour customer:', invoice.customer)

        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'expired',
            stripe_subscription_id: null,
            subscription_current_period_end: null,
            subscription_trial_end: null
          })
          .eq('stripe_customer_id', invoice.customer)

        if (error) {
          console.error('❌ Erreur Supabase payment failed:', error)
          throw error
        }

        console.log('✅ Utilisateur passé en expired (payment failed):', invoice.customer)
        break
      }

      default:
        console.log(`ℹ️ Event Stripe ignoré: ${event.type}`)
    }

    res.json({ received: true })
  } catch (err) {
    console.error('❌ Erreur traitement webhook:', err)
    res.status(500).send('Internal Server Error')
  }
}