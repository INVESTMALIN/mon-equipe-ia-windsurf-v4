import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { buffer } from 'micro'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MON_EQUIPE_IA_PRODUCT_ID = 'prod_T4pyi8D8gPloKU'
const MON_EQUIPE_IA_PRICE_ID = 'price_1S8gIcIvBgiHMciNIi9WtP8W'

// Helper pour vérifier si une subscription contient notre price
function subscriptionHasOurPrice(subscription) {
  return subscription?.items?.data?.some(item => item?.price?.id === MON_EQUIPE_IA_PRICE_ID)
}

function isMonEquipeIAEvent(event) {
  const eventType = event.type
  
  if (eventType === 'checkout.session.completed') {
    const session = event.data.object
    const metadata = session.metadata || {}
    return metadata.product === MON_EQUIPE_IA_PRODUCT_ID && metadata.price === MON_EQUIPE_IA_PRICE_ID
  }
  
  if (eventType === 'invoice.payment_succeeded' || eventType === 'invoice.payment_failed') {
    const invoice = event.data.object
    const lineItem = invoice.lines?.data?.[0]
    if (!lineItem) return false
    
    const priceId = lineItem.price?.id
    return priceId === MON_EQUIPE_IA_PRICE_ID
  }
  
  if (eventType === 'customer.subscription.deleted' || eventType === 'customer.subscription.updated') {
    return true
  }
  
  return false
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
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

  // ✅ IDEMPOTENCE : Vérifier si event déjà traité
  const { data: existingEvent } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('id', event.id)
    .single()

  if (existingEvent) {
    console.log(`⏭️ Event ${event.id} déjà traité, ignoré`)
    return res.json({ received: true, ignored: true, reason: 'already_processed' })
  }

  // Helper pour enregistrer l'event comme traité après succès
  const markEventAsProcessed = async () => {
    const { error } = await supabase
      .from('stripe_events')
      .insert({
        id: event.id,
        type: event.type,
        data: event.data.object
      })
    
    if (error) {
      console.error('⚠️ Erreur insertion stripe_events (non bloquant):', error)
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('🛒 Checkout session completed:', session.id)
      
        // Récupérer user_id depuis metadata (priorité) ou client_reference_id (fallback)
        const userId = session.metadata?.user_id || session.client_reference_id
        
        if (!userId) {
          console.error('❌ Aucun user_id trouvé dans session metadata ou client_reference_id')
          throw new Error('Missing user_id in checkout session')
        }
      
        console.log('👤 User ID:', userId)
      
        // Récupérer les détails de la subscription depuis Stripe
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        console.log('📋 Subscription status:', subscription.status)
        console.log('⏰ Trial end:', subscription.trial_end)
        console.log('⏰ Current period end:', subscription.current_period_end)
      
        // Déterminer le statut selon si c'est un trial ou pas
        const isOnTrial = subscription.status === 'trialing'
        const subscriptionStatus = isOnTrial ? 'trial' : 'premium'
      
        // Préparer les données à mettre à jour
        const updateData = {
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_status: subscriptionStatus
        }
      
        // Ajouter les dates seulement si elles existent
        if (isOnTrial && subscription.trial_end) {
          updateData.subscription_trial_end = new Date(subscription.trial_end * 1000)
          console.log('📅 Trial end date:', updateData.subscription_trial_end)
        }
      
        if (!isOnTrial && subscription.current_period_end) {
          updateData.subscription_current_period_end = new Date(subscription.current_period_end * 1000)
          console.log('📅 Period end date:', updateData.subscription_current_period_end)
        }

        // 🔥 NOUVEAU : Marquer que l'utilisateur a consommé son trial
        if (isOnTrial) {
          updateData.has_used_trial = true
          console.log('✨ Utilisateur a maintenant consommé son trial')
        }
      
        console.log('💾 Update data:', JSON.stringify(updateData, null, 2))
      
        // Mettre à jour Supabase
        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)
      
        if (error) {
          console.error('❌ Erreur Supabase:', error)
          throw error
        }
      
        console.log('✅ Utilisateur mis à jour:', {
          user_id: userId,
          status: subscriptionStatus,
          customer_id: session.customer
        })
      
        // Marquer l'event comme traité APRÈS succès
        await markEventAsProcessed()
        break
      }


      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        
        // 🔥 NOUVEAU : Ignorer les invoices de trial (montant = 0€)
        if (invoice.billing_reason === 'subscription_create' && invoice.amount_paid === 0) {
          console.log('⏭️ Invoice ignorée (trial à 0€)')
          await markEventAsProcessed()
          break
        }
        
        console.log('💰 Paiement réussi pour customer:', invoice.customer)
      
        // Récupérer la subscription pour avoir les dates
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        console.log('📋 Subscription current_period_end:', subscription.current_period_end)
      
        const updateData = {
          subscription_status: 'premium',
          subscription_trial_end: null
        }
      
        // Sécuriser la date - ne l'ajouter que si elle existe
        if (subscription.current_period_end) {
          updateData.subscription_current_period_end = new Date(subscription.current_period_end * 1000)
          console.log('📅 Period end date:', updateData.subscription_current_period_end)
        } else {
          console.warn('⚠️ Pas de current_period_end dans la subscription')
          updateData.subscription_current_period_end = null
        }
      
        console.log('💾 Update data:', JSON.stringify(updateData, null, 2))
      
        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('stripe_customer_id', invoice.customer)
      
        if (error) {
          console.error('❌ Erreur Supabase payment succeeded:', error)
          throw error
        }
      
        console.log('✅ Utilisateur passé en premium:', invoice.customer)
      
        // Marquer l'event comme traité APRÈS succès
        await markEventAsProcessed()
        break
      }


      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        // 🔥 NOUVEAU : Filtrer par price pour éviter d'écraser d'autres abonnements Invest Malin
        if (!subscriptionHasOurPrice(subscription)) {
          console.log('⏭️ Subscription deleted ignorée (pas Mon Équipe IA)')
          await markEventAsProcessed()
          break
        }
        
        console.log('❌ Subscription cancelled:', subscription.customer)

        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'expired',
            stripe_subscription_id: null,
            subscription_current_period_end: null,
            subscription_trial_end: null,
            subscription_cancel_at_period_end: false  // 🔥 NOUVEAU : Reset flag annulation
          })
          .eq('stripe_customer_id', subscription.customer)

        if (error) {
          console.error('❌ Erreur Supabase subscription deleted:', error)
          throw error
        }

        console.log('✅ Utilisateur passé en expired (sub deleted):', subscription.customer)

        // Marquer l'event comme traité APRÈS succès
        await markEventAsProcessed()
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

        // Marquer l'event comme traité APRÈS succès
        await markEventAsProcessed()
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        // 🔥 NOUVEAU : Filtrer par price pour éviter d'écraser d'autres abonnements Invest Malin
        if (!subscriptionHasOurPrice(subscription)) {
          console.log('⏭️ Subscription updated ignorée (pas Mon Équipe IA)')
          await markEventAsProcessed()
          break
        }
        
        console.log('🔄 Subscription updated:', subscription.customer)

        // Récupérer le nouveau statut
        const subscriptionStatus = subscription.status === 'trialing' ? 'trial' : 
                                   subscription.status === 'active' ? 'premium' : 
                                   'expired'

        const updateData = {
          subscription_status: subscriptionStatus,
          stripe_subscription_id: subscription.id
        }

        if (subscription.status === 'trialing' && subscription.trial_end) {
          updateData.subscription_trial_end = new Date(subscription.trial_end * 1000)
          updateData.subscription_current_period_end = null
        } else if (subscription.status === 'active' && subscription.current_period_end) {
          updateData.subscription_current_period_end = new Date(subscription.current_period_end * 1000)
          updateData.subscription_trial_end = null
        } else {
          updateData.subscription_current_period_end = null
          updateData.subscription_trial_end = null
        }

        // 🔥 NOUVEAU : Capturer le flag d'annulation programmée
        updateData.subscription_cancel_at_period_end = !!subscription.cancel_at_period_end
        console.log('🚫 Cancel at period end:', updateData.subscription_cancel_at_period_end)

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('stripe_customer_id', subscription.customer)

        if (error) {
          console.error('❌ Erreur Supabase subscription updated:', error)
          throw error
        }

        console.log('✅ Subscription mise à jour:', subscription.customer, subscriptionStatus)

        // Marquer l'event comme traité APRÈS succès
        await markEventAsProcessed()
        break
      }

      default:
        console.log(`ℹ️ Event Stripe ignoré: ${event.type}`)
    }

    res.json({ received: true })
  } catch (err) {
    console.error('❌ Erreur traitement webhook:', err)
    console.error('Stack:', err.stack)
    
    // Toujours répondre 200 à Stripe pour éviter les retries infinis
    // L'idempotence empêche les doublons si Stripe retry quand même
    res.status(200).json({ 
      received: true, 
      error: true, 
      message: err.message 
    })
  }
}