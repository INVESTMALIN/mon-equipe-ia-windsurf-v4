import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Supabase avec service key (vérif JWT + lecture du customer côté serveur)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Liste les factures Stripe de l'utilisateur connecté. Sert les DEUX surfaces :
//   - /mes-credits : liens "Facture" par ligne d'achat (packs, factures créées via
//     invoice_creation), matchés par invoice_id côté front.
//   - /mon-compte  : section "Mes factures" des abonnements Premium.
//
// 🔒 Sécurité : le customer est TOUJOURS déduit du JWT (jamais fourni par le front).
// On ne liste QUE les factures de ce customer → aucune URL ne peut fuiter vers un
// autre utilisateur. Aucun paramètre d'entrée exploitable.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1️⃣ Auth : user_id déduit du JWT Supabase.
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized, missing token' })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized, invalid user' })
    }

    // 2️⃣ Customer Stripe de CET utilisateur.
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    // Pas de customer = aucun paiement (Premium offert, ou fiche_lite jamais crédité).
    // Réponse propre : liste vide, jamais une erreur.
    if (!profile?.stripe_customer_id) {
      return res.status(200).json({ invoices: [] })
    }

    // 3️⃣ Factures du customer, les plus récentes d'abord (ordre Stripe par défaut).
    const list = await stripe.invoices.list({
      customer: profile.stripe_customer_id,
      limit: 100,
    })

    // 4️⃣ On ne renvoie que des champs stables et non sensibles. `is_subscription` est
    //     dérivé de `billing_reason` (stable across API versions) plutôt que du champ
    //     `subscription` (retiré/déplacé dans les versions Stripe récentes).
    const invoices = list.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      created: inv.created,                 // epoch (secondes)
      total: inv.total,                     // centimes
      amount_paid: inv.amount_paid,         // centimes
      currency: inv.currency,
      status: inv.status,                   // draft | open | paid | uncollectible | void
      hosted_invoice_url: inv.hosted_invoice_url || null,
      invoice_pdf: inv.invoice_pdf || null,
      billing_reason: inv.billing_reason,
      is_subscription: (inv.billing_reason || '').startsWith('subscription'),
    }))

    return res.status(200).json({ invoices })
  } catch (error) {
    console.error('❌ Erreur list-invoices:', error)
    return res.status(500).json({ error: 'Erreur serveur', details: error.message })
  }
}
