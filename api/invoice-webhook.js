// Récepteur webhook TEMPORAIRE de diagnostic — chantier factures (phase 1).
//
// Unique but AUJOURD'HUI : rendre l'URL vivante, VOIR le payload que Kevin nous enverra
// (sa forme exacte, et surtout s'il inclut un identifiant Stripe `pi_...` ou `cs_...`),
// et NE PAS le rater. Aucun traitement métier, aucune validation, aucun secret partagé :
// tout ça viendra DEMAIN avec le vrai endpoint, à la MÊME URL (elle ne changera pas).
// Coquille jetable — ne pas étoffer.
//
// Public à dessein : Kevin poste depuis un système externe sans JWT, donc pas de
// verifyAdmin. Le durcissement (secret partagé) est pour le vrai endpoint.
//
// Deux captures, à dessein redondantes :
//   1. console.log → logs Vercel. MAIS rétention ~1h sur le plan Hobby : hors fenêtre,
//      le log est perdu et irrécupérable (ni CLI, ni API). Insuffisant pour un émetteur
//      externe non planifié.
//   2. email via Resend → capture DURABLE (reste dans la boîte mail). C'est le filet qui
//      garantit qu'on ne rate pas l'envoi de Kevin quelle que soit l'heure. Best-effort :
//      un échec d'email ne doit JAMAIS empêcher la réponse 200 (le système de Kevin en a
//      besoin). Destinataire dans INVOICE_WEBHOOK_CAPTURE_TO (le repo est public → pas
//      d'email en dur) ; non défini → capture email désactivée (on garde les logs).
//
// ⚠️ TEMPORAIRE : on logge/envoie le payload EN CLAIR (il contiendra des données client —
// email, nom). Acceptable uniquement pour cette phase de diagnostic ; ce dispositif
// verbeux sera retiré demain avec le vrai traitement (stockage en base + matching Stripe).

import { sendEmail } from './_lib/sendEmail.js'

// On lit le corps BRUT (pas req.body) pour capturer exactement ce que Kevin envoie,
// quel que soit le content-type.
export const config = { api: { bodyParser: false } }

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const raw = await readRawBody(req)
  const contentType = req.headers['content-type'] || '(absent)'

  // 1. Logs Vercel (éphémères ~1h).
  console.log('[invoice-webhook] content-type:', contentType)
  console.log('[invoice-webhook] raw body:', raw)
  try {
    console.log('[invoice-webhook] parsed JSON:', JSON.stringify(JSON.parse(raw)))
  } catch {
    // pas du JSON : le raw body ci-dessus suffit au diagnostic
  }

  // 2. Capture durable par email (best-effort — n'affecte jamais le 200). On AWAIT pour
  //    garantir l'envoi dans la durée de vie de la fonction serverless, mais tout échec
  //    est avalé.
  const captureTo = process.env.INVOICE_WEBHOOK_CAPTURE_TO
  if (captureTo) {
    try {
      await sendEmail({
        to: captureTo,
        subject: '[invoice-webhook] payload reçu',
        html: `<p><strong>content-type :</strong> ${escapeHtml(contentType)}</p>
<pre style="white-space:pre-wrap;word-break:break-all;background:#f5f5f5;padding:12px;border-radius:6px">${escapeHtml(raw)}</pre>`,
        text: `content-type: ${contentType}\n\n${raw}`
      })
      console.log('[invoice-webhook] capture email envoyée à', captureTo)
    } catch (mailErr) {
      console.error('[invoice-webhook] capture email échouée:', mailErr.message)
    }
  } else {
    console.log('[invoice-webhook] capture email désactivée (INVOICE_WEBHOOK_CAPTURE_TO non défini)')
  }

  return res.status(200).json({ received: true })
}
