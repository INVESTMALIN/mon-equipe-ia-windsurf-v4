import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// ⚠️ ATTENTION : à récupérer dans le Dashboard Stripe → Webhooks → Signing secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

// Supabase service key (pas la anon key !)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('❌ Signature webhook invalide:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerId = session.customer
        const subscriptionId = session.subscription

        await supabase
          .from('users')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'premium'
          })
          .eq('id', session.client_reference_id) // auth.uid() passé dans Payment Link
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const customerId = invoice.customer
        const periodEnd = invoice.lines.data[0].period.end

        await supabase
          .from('users')
          .update({
            subscription_status: 'premium',
            subscription_current_period_end: new Date(periodEnd * 1000)
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const subscription = event.data.object
        const customerId = subscription.customer

        await supabase
          .from('users')
          .update({
            subscription_status: 'expired',
            stripe_subscription_id: null,
            subscription_current_period_end: null
          })
          .eq('stripe_customer_id', customerId)
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

// ⚠️ Important : dans Vercel, ajouter
// STRIPE_SECRET_KEY=sk_live_xxx
// STRIPE_WEBHOOK_SECRET=whsec_xxx
// SUPABASE_SERVICE_ROLE_KEY=xxx
