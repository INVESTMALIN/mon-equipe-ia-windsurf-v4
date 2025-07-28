import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customer_id, return_url } = req.body

    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: return_url
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Erreur création session portal:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}