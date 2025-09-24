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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    const buf = await getRawBody(req)
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret)
  } catch (err) {
    console.error('❌ Signature webhook invalide:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await supabase.from('users').update({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_status: 'premium'
        }).eq('id', session.client_reference_id)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        await supabase.from('users').update({
          subscription_status: 'premium',
          subscription_current_period_end: new Date(invoice.lines.data[0].period.end * 1000)
        }).eq('stripe_customer_id', invoice.customer)
        break
      }

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const subscription = event.data.object
        await supabase.from('users').update({
          subscription_status: 'expired',
          stripe_subscription_id: null,
          subscription_current_period_end: null
        }).eq('stripe_customer_id', subscription.customer)
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