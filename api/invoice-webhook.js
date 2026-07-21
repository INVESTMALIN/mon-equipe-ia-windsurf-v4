// Récepteur webhook TEMPORAIRE de diagnostic — chantier factures (phase 1).
//
// Unique but AUJOURD'HUI : rendre l'URL vivante et LOGGER le payload brut que Kevin
// nous enverra, pour découvrir sa forme exacte (et surtout s'il inclut un identifiant
// Stripe `pi_...` ou `cs_...`). Aucun traitement métier, aucun stockage, aucune
// validation, aucun secret partagé : tout ça viendra DEMAIN avec le vrai endpoint, à la
// MÊME URL (elle ne changera pas). Coquille jetable — ne pas étoffer.
//
// Public à dessein : Kevin poste depuis un système externe sans JWT, donc pas de
// verifyAdmin. Le durcissement (secret partagé) est pour le vrai endpoint.
//
// ⚠️ TEMPORAIRE : on logge le payload EN CLAIR (il contiendra des données client — email,
// nom). Acceptable uniquement pour cette phase de diagnostic ; ce log verbeux sera retiré
// demain avec le vrai traitement.

// On lit le corps BRUT (pas req.body) pour capturer exactement ce que Kevin envoie,
// quel que soit le content-type.
export const config = { api: { bodyParser: false } }

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

  console.log('[invoice-webhook] content-type:', req.headers['content-type'] || '(absent)')
  console.log('[invoice-webhook] raw body:', raw)
  // Vue re-sérialisée si c'est du JSON (plus lisible dans les logs). Best-effort.
  try {
    console.log('[invoice-webhook] parsed JSON:', JSON.stringify(JSON.parse(raw)))
  } catch {
    // pas du JSON : le raw body ci-dessus suffit au diagnostic
  }

  return res.status(200).json({ received: true })
}
