// Récepteur DÉFINITIF des factures comptables de Kevin (Make) — remplace le mouchard
// de diagnostic (qui loggait le payload en clair et l'envoyait par email via Resend).
//
// Flux : à chaque paiement encaissé côté Invest Malin, Make génère LA facture qui fait
// foi (numérotée, TVA), la dépose dans un Drive partagé, et POSTe ici un payload
// contenant le lien Drive + les identifiants Stripe. On archive tout dans la table
// `invoices` et on rattache la facture à l'achat de crédits correspondant
// (credit_ledger, matching par payment_intent). L'affichage admin viendra en PR séparée.
//
// URL contractuelle communiquée à Kevin (ne JAMAIS changer) :
//   https://www.mon-equipe-ia.com/api/invoice-webhook
//
// Auth : header `X-Invoice-Secret` comparé (en temps constant) à INVOICE_WEBHOOK_SECRET.
// Refus 401 dès le premier jour, sans tolérance : répondre 200 à un POST mal configuré
// ferait croire à Kevin que sa configuration est bonne. Le secret voyage dans un HEADER
// précisément pour ne jamais se retrouver dans le payload brut stocké en base — et il
// n'est jamais loggé non plus.
//
// Principe directeur : ne JAMAIS perdre une facture. Les champs à plat sont extraits
// défensivement (illisible → null, sans jamais bloquer l'enregistrement — `numero_facture`
// arrive vide aujourd'hui, bug de mappage côté Kevin), et le payload brut complet est
// stocké en jsonb. En revanche un échec d'INSERT répond non-2xx : l'échec doit être
// visible côté Make pour être rejoué, jamais avalé par un 200.

import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Corps lu en brut (pas req.body) : on stocke exactement ce que Kevin envoie et on
// reste tolérant sur le content-type de Make.
export const config = { api: { bodyParser: false } }

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

// Comparaison en temps constant (timingSafeEqual exige des longueurs égales : la
// comparaison de longueur préalable est inévitable et n'expose que la longueur).
function secretMatches(provided, expected) {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

// '' → null. Piège d'idempotence : sans cette normalisation, deux factures sans
// event_id_stripe entreraient en collision sur la chaîne vide dans l'index unique.
// Appliquée à TOUS les champs texte par cohérence (un champ vide n'est pas une valeur).
function textOrNull(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

// Montant en centimes, transmis en chaîne ("20000" = 200 €). Illisible → null,
// le payload brut conserve la valeur d'origine.
function centsOrNull(value) {
  if (typeof value === 'number' && Number.isInteger(value)) return value
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) {
    return parseInt(value.trim(), 10)
  }
  return null
}

// Date ISO (YYYY-MM-DD) attendue ; tout autre format → null (préservé dans le brut).
function isoDateOrNull(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
    ? value.trim()
    : null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Secret absent de l'environnement = endpoint fermé (jamais ouvert par défaut).
  const expectedSecret = process.env.INVOICE_WEBHOOK_SECRET
  if (!expectedSecret) {
    console.error('[invoice-webhook] INVOICE_WEBHOOK_SECRET non configuré — endpoint fermé')
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const providedSecret = req.headers['x-invoice-secret']
  if (typeof providedSecret !== 'string' || !secretMatches(providedSecret, expectedSecret)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Parsing JSON. On ne logge JAMAIS le corps (données client : nom, email).
  let payload
  try {
    payload = JSON.parse(await readRawBody(req))
  } catch {
    console.error('[invoice-webhook] corps non-JSON refusé')
    return res.status(400).json({ error: 'Invalid JSON body' })
  }
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    console.error('[invoice-webhook] corps JSON non-objet refusé')
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const paymentIntentId = textOrNull(payload.payment_intent_id)

  // Rattachement à l'achat : la ligne de credit_ledger qui porte le même payment
  // intent. Best-effort STRICT — deux cas légitimes ne matchent pas (facture sans
  // achat de crédits, ex. un acompte ; facture arrivée avant notre ligne de ledger)
  // et un échec de lecture ne doit jamais faire perdre la facture : user_id reste null.
  let userId = null
  if (paymentIntentId) {
    const { data: ledgerRow, error: ledgerError } = await supabase
      .from('credit_ledger')
      .select('user_id')
      .eq('metadata->>stripe_payment_intent', paymentIntentId)
      .limit(1)
      .maybeSingle()

    if (ledgerError) {
      console.error('[invoice-webhook] résolution user_id échouée (facture stockée sans rattachement):', ledgerError.message)
    } else {
      userId = ledgerRow?.user_id || null
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      numero_facture: textOrNull(payload.numero_facture),
      montant: centsOrNull(payload.montant),
      date_facture: isoDateOrNull(payload.date),
      nom_client: textOrNull(payload.nom_client),
      email: textOrNull(payload.email),
      stripe_customer_id: textOrNull(payload.customer_id),
      event_id_stripe: textOrNull(payload.event_id_stripe),
      payment_intent_id: paymentIntentId,
      lien_drive: textOrNull(payload.lien_drive),
      payload
    })
    .select('id')
    .single()

  if (insertError) {
    // 23505 = unique_violation sur event_id_stripe : POST rejoué par Kevin.
    // No-op idempotent = succès (200), la facture est déjà archivée.
    if (insertError.code === '23505') {
      console.log('[invoice-webhook] facture déjà archivée (rejeu), no-op')
      return res.status(200).json({ received: true, duplicate: true })
    }
    // Tout autre échec : non-2xx pour que l'erreur soit VISIBLE côté Make (et
    // rejouable) — jamais un 200 sur une facture non stockée.
    console.error('[invoice-webhook] insertion invoices échouée:', insertError.message)
    return res.status(500).json({ error: 'Storage failed' })
  }

  console.log(`[invoice-webhook] facture archivée: ${inserted.id}${userId ? ` (user ${userId})` : ' (sans rattachement)'}`)
  return res.status(200).json({ received: true })
}
