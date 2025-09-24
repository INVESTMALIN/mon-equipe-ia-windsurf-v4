import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Request body:', req.body)
    const { customer_id, return_url } = req.body

    // Si pas de customer ID valide, on crée un customer de test
    let actualCustomerId = customer_id
    
    if (customer_id === 'test_without_customer') {
      console.log('Creating test customer...')
      const customer = await stripe.customers.create({
        email: 'test@example.com',
        name: 'Test User'
      })
      actualCustomerId = customer.id
      console.log('Created customer:', actualCustomerId)
    }

    console.log('Creating portal session for customer:', actualCustomerId)
    const session = await stripe.billingPortal.sessions.create({
      customer: actualCustomerId,
      return_url: return_url
    })

    console.log('Portal session created successfully:', session.url)
    return res.status(200).json({ url: session.url, customer_id: actualCustomerId })
  } catch (error) {
    console.error('Erreur création session portal:', error)
    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message,
      type: error.type
    })
  }
}