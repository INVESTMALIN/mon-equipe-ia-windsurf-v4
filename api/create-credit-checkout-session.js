import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Supabase avec service key (écritures + vérif JWT côté serveur)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 🔒 Allowlist des packs de crédits. Le front n'envoie QUE cet identifiant ; le serveur
// refuse tout le reste. La source de vérité des prix ET des quantités reste Stripe
// (résolution par lookup_key ci-dessous) — ici on ne fait que borner les valeurs acceptées.
const ALLOWED_PACKS = ['pack_1', 'pack_10', 'pack_20', 'pack_50']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1️⃣ Auth : on déduit le user_id du JWT Supabase. JAMAIS lu depuis le corps de la requête.
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized, missing token' })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized, invalid user' })
    }

    // 2️⃣ Le front n'envoie qu'un identifiant de pack. Validé contre l'allowlist.
    const pack = req.body?.pack
    if (!pack || !ALLOWED_PACKS.includes(pack)) {
      return res.status(400).json({ error: 'Pack invalide' })
    }

    // 3️⃣ Résolution du Price par lookup_key. AUCUN price_id en dur → passage en live
    //    sans changer une ligne (il suffit que les mêmes lookup_keys existent en live).
    const prices = await stripe.prices.list({
      lookup_keys: [pack],
      expand: ['data.product'],
      active: true,
      limit: 1
    })

    const price = prices.data[0]
    if (!price) {
      console.error(`❌ Aucun Price actif pour lookup_key=${pack}`)
      return res.status(400).json({ error: 'Pack indisponible' })
    }

    // Défense en profondeur : le Price résolu doit bien être un pack de crédits de cette app.
    const product = price.product
    if (product?.metadata?.product_type !== 'credit_pack' ||
        product?.metadata?.app !== 'fiche_logement_lite') {
      console.error(`❌ Price ${price.id} n'est pas un credit_pack fiche_logement_lite`)
      return res.status(400).json({ error: 'Pack invalide' })
    }

    // 4️⃣ Le nombre de crédits est lu depuis metadata.credits du Price, CÔTÉ SERVEUR.
    //    Jamais transmis par le navigateur.
    const credits = parseInt(price.metadata?.credits, 10)
    if (!Number.isInteger(credits) || credits <= 0) {
      console.error(`❌ metadata.credits invalide sur Price ${price.id}: ${price.metadata?.credits}`)
      return res.status(500).json({ error: 'Configuration du pack invalide' })
    }

    // 5️⃣ Customer Stripe : réutiliser celui de l'utilisateur s'il existe, sinon le créer.
    //    (miroir de create-checkout-session.js — utile pour la traçabilité et les litiges)
    const { data: existingUser } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = existingUser?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || 'Utilisateur',
        metadata: { user_id: user.id }
      })
      customerId = customer.id

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)

      console.log('👤 Nouveau customer Stripe créé (crédits):', customerId)
    }

    // 6️⃣ Checkout Session en mode PAYMENT (paiement unique), surtout PAS subscription.
    //    Les metadata servent au webhook : `kind` = marqueur explicite d'achat de crédits,
    //    `credits`/`pack` = source de vérité posée par le serveur (jamais par le navigateur).
    const origin = req.headers.origin || 'https://www.mon-equipe-ia.com'
    const purchaseMetadata = {
      kind: 'credit_purchase',
      user_id: user.id,
      credits: String(credits),
      pack
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      payment_method_types: ['card'],

      line_items: [{
        price: price.id,
        quantity: 1
      }],

      client_reference_id: user.id,
      metadata: purchaseMetadata,
      // Reporter les metadata sur le PaymentIntent : retrouver l'achat depuis un litige.
      payment_intent_data: { metadata: purchaseMetadata },

      success_url: `${origin}/mes-credits?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/mes-credits?checkout=cancel`,

      billing_address_collection: 'auto'
    })

    console.log('✅ Checkout session crédits créée:', session.id, `(${pack}, ${credits} crédits)`)
    return res.status(200).json({ url: session.url, session_id: session.id })

  } catch (error) {
    console.error('❌ Erreur création checkout crédits:', error)
    return res.status(500).json({
      error: 'Erreur serveur',
      details: error.message,
      type: error.type
    })
  }
}
