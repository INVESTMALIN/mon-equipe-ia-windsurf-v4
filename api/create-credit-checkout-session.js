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

// 🔒 Rôles autorisés à acheter des crédits. SOURCE DE VÉRITÉ UNIQUE de l'éligibilité :
// l'achat de crédits est réservé à Fiche Logement Lite (miroir du gating front
// `allowRoles={['fiche_lite']}` sur /mes-credits). Pour ouvrir la feature à un autre
// rôle un jour, on modifie CETTE ligne, nulle part ailleurs.
const CREDIT_ELIGIBLE_ROLES = ['fiche_lite']

// Crée un customer Stripe neuf pour cet utilisateur et persiste son id en base.
// Appelé quand aucun customer n'est stocké, ET quand le customer stocké n'existe pas
// dans le compte Stripe courant : la preview (sandbox) et la prod (live) écrivent dans
// la même base, donc un id créé depuis un environnement est orphelin dans l'autre.
async function createFreshCustomer(user) {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.user_metadata?.full_name || 'Utilisateur',
    metadata: { user_id: user.id }
  })

  await supabase
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', user.id)

  console.log('👤 Nouveau customer Stripe créé (crédits):', customer.id)
  return customer.id
}

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

    // 3️⃣ Éligibilité : l'achat de crédits est réservé aux rôles autorisés. On lit le
    //    profil (rôle + customer Stripe) en UN seul SELECT, réutilisé plus bas. Rejet
    //    AVANT tout appel Stripe. Ligne users introuvable = refus (jamais un laisser-passer).
    const { data: existingUser } = await supabase
      .from('users')
      .select('stripe_customer_id, role')
      .eq('id', user.id)
      .single()

    if (!existingUser || !CREDIT_ELIGIBLE_ROLES.includes(existingUser.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' })
    }

    // 4️⃣ Résolution du Price par lookup_key. AUCUN price_id en dur → passage en live
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

    // 5️⃣ Le nombre de crédits est lu depuis metadata.credits du Price, CÔTÉ SERVEUR.
    //    Jamais transmis par le navigateur.
    const credits = parseInt(price.metadata?.credits, 10)
    if (!Number.isInteger(credits) || credits <= 0) {
      console.error(`❌ metadata.credits invalide sur Price ${price.id}: ${price.metadata?.credits}`)
      return res.status(500).json({ error: 'Configuration du pack invalide' })
    }

    // 6️⃣ Customer Stripe : réutiliser celui de l'utilisateur s'il existe, sinon le créer.
    //    (on réutilise le profil déjà chargé à l'étape 3 — un seul SELECT sur users)
    //    `|| null` : une chaîne vide en base vaut absence de customer.
    let customerId = existingUser.stripe_customer_id || null
    if (!customerId) {
      customerId = await createFreshCustomer(user)
    }

    // 7️⃣ Checkout Session en mode PAYMENT (paiement unique), surtout PAS subscription.
    //    Les metadata servent au webhook : `kind` = marqueur explicite d'achat de crédits,
    //    `credits`/`pack` = source de vérité posée par le serveur (jamais par le navigateur).
    const origin = req.headers.origin || 'https://www.mon-equipe-ia.com'
    const purchaseMetadata = {
      kind: 'credit_purchase',
      user_id: user.id,
      credits: String(credits),
      pack
    }

    const buildSessionParams = (cid) => ({
      mode: 'payment',
      customer: cid,
      payment_method_types: ['card'],

      line_items: [{
        price: price.id,
        quantity: 1
      }],

      client_reference_id: user.id,
      metadata: purchaseMetadata,
      // Reporter les metadata sur le PaymentIntent : retrouver l'achat depuis un litige.
      payment_intent_data: { metadata: purchaseMetadata },

      // En mode `payment`, Stripe ne génère qu'un reçu par défaut. On force la création
      // d'une vraie facture (numéro, TVA, PDF, hosted_invoice_url) pour que l'utilisateur
      // puisse la récupérer depuis /mes-credits. Les mêmes metadata sont reportées sur la
      // facture pour la traçabilité (litige). L'invoice_id est capté au webhook.
      invoice_creation: {
        enabled: true,
        invoice_data: { metadata: purchaseMetadata },
      },

      success_url: `${origin}/mes-credits?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/mes-credits?checkout=cancel`,

      billing_address_collection: 'auto'
    })

    let session
    try {
      session = await stripe.checkout.sessions.create(buildSessionParams(customerId))
    } catch (err) {
      // Customer orphelin : l'id stocké a été créé dans l'AUTRE compte Stripe
      // (preview sandbox ↔ prod live partagent la même base). On ne rattrape QUE
      // « ce customer n'existe pas » — toute autre erreur Stripe garde le
      // comportement actuel (remontée au catch global, 500).
      if (err?.code !== 'resource_missing' || err?.param !== 'customer') {
        throw err
      }
      console.warn(`⚠️ Customer ${customerId} introuvable dans ce compte Stripe — recréation`)
      customerId = await createFreshCustomer(user)
      session = await stripe.checkout.sessions.create(buildSessionParams(customerId))
    }

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
