// Tests du serveur Railway.
//
// NOTE POUR LA RELECTURE — deux choses sortent de l'ordinaire, volontairement :
//
// 1. Aucun test n'appelle les vrais handlers de `api/`. Ils sont remplacés par des
//    doublures via le paramètre `loadHandler` de createApp(). C'est ce qui garantit
//    qu'aucun test ne produit d'écriture en base, d'appel Stripe ou d'envoi d'email :
//    les tests vérifient le SERVEUR (routage, corps brut, cache, replis), pas la logique
//    métier des fonctions, qui n'est pas modifiée par ce portage.
//
// 2. Les doublures des deux webhooks n'inventent pas leur façon de lire le corps : elles
//    réutilisent exactement les primitives des vrais handlers — `buffer` de `micro` pour
//    api/webhook.js, la boucle `for await (const chunk of req)` pour
//    api/invoice-webhook.js. Sans cela le test prouverait que ma doublure fonctionne,
//    pas que le corps brut survit réellement à la pile Express.

import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync, readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buffer } from 'micro'

import { createApp, API_ROUTES, RAW_BODY_ROUTES, REQUIRED_SERVER_ENV, missingServerEnv } from '../railway-server.mjs'

const sha256 = (value) => createHash('sha256').update(value).digest('hex')

// Corps de test choisi pour piéger toute normalisation : indentation irrégulière,
// accents, emoji hors BMP, et une clé numérique dont un aller-retour JSON.parse →
// JSON.stringify modifierait la représentation.
const RAW_PAYLOAD = '{\n  "id":   "evt_test_123",\n  "montant": 1.50,\n  "libellé": "Café ☕ — açaí",\n  "nested": {"a":[1,2,3]}\n}'

let distDir
let server
let baseUrl

// Doublures. `webhook` et `invoice-webhook` lisent le flux comme les vrais handlers et
// renvoient l'empreinte de ce qu'ils ont reçu ; les autres renvoient ce qu'Express a
// parsé, pour prouver que le parseur JSON est bien actif là où il doit l'être.
function stubLoader(overrides = {}) {
  return async function loadHandler(name) {
    if (overrides[name]) return overrides[name]

    if (name === 'webhook') {
      return async (req, res) => {
        const buf = await buffer(req) // primitive réelle de api/webhook.js
        const raw = Buffer.isBuffer(buf) ? buf.toString('utf8') : buf
        res.status(200).json({ sha256: sha256(raw), length: Buffer.byteLength(raw) })
      }
    }

    if (name === 'invoice-webhook') {
      return async (req, res) => {
        const chunks = [] // primitive réelle de api/invoice-webhook.js
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
        }
        const raw = Buffer.concat(chunks).toString('utf8')
        res.status(200).json({ sha256: sha256(raw), length: Buffer.byteLength(raw) })
      }
    }

    return async (req, res) => {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
      }
      res.status(200).json({ route: name, body: req.body ?? null, bodyType: typeof req.body })
    }
  }
}

function startServer(app) {
  return new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
}

before(async () => {
  // Faux répertoire de build : les tests ne dépendent pas d'un `npm run build` préalable.
  distDir = mkdtempSync(path.join(os.tmpdir(), 'meia-dist-'))
  mkdirSync(path.join(distDir, 'assets'))
  mkdirSync(path.join(distDir, 'images'))
  writeFileSync(path.join(distDir, 'index.html'), '<!doctype html><html><body><div id="root"></div></body></html>')
  // Au-dessus du seuil de compression (1 Ko), sinon `compression` laisse passer en clair.
  writeFileSync(path.join(distDir, 'assets', 'index-DZ56lhXT.js'), 'console.log("x");'.repeat(400))
  writeFileSync(path.join(distDir, 'images', 'logo.png'), 'fake-png')

  server = await startServer(createApp({ distDir, loadHandler: stubLoader() }))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => {
  server?.close()
  rmSync(distDir, { recursive: true, force: true })
})

// ─────────────────────────── Inventaire des routes ───────────────────────────

test('les dix fonctions de api/ sont toutes portées, ni plus ni moins', () => {
  const onDisk = readdirSync('api')
    .filter((f) => f.endsWith('.js'))
    .map((f) => f.replace(/\.js$/, ''))
    .sort()
  assert.deepEqual([...API_ROUTES].sort(), onDisk, 'API_ROUTES doit refléter exactement api/*.js')
  assert.equal(API_ROUTES.length, 10)
})

test('les deux routes à corps brut sont bien celles qui lisent le flux', () => {
  assert.deepEqual([...RAW_BODY_ROUTES].sort(), ['invoice-webhook', 'webhook'])
})

test('le contrat d\'export Vercel des dix fonctions est intact', () => {
  // Contrôle statique volontaire : charger les modules exigerait la configuration
  // complète (plusieurs lèvent au chargement quand une variable manque). On vérifie donc
  // la forme du source. Objectif : garantir que la version Vercel reste déployable à
  // l'identique pendant toute la coexistence des deux hébergeurs.
  for (const name of API_ROUTES) {
    const src = readFileSync(path.join('api', `${name}.js`), 'utf8')
    assert.match(src, /export default async function handler\s*\(req, res\)/,
      `api/${name}.js doit garder son export default (req, res) pour rester déployable sur Vercel`)
  }
})

test('les deux webhooks conservent la désactivation du parseur de Vercel', () => {
  // `export const config = { api: { bodyParser: false } }` est inerte côté Railway (c'est
  // l'ordre de montage qui joue ce rôle) mais reste INDISPENSABLE côté Vercel : sans lui,
  // Vercel parse le corps et la signature Stripe devient invérifiable.
  for (const name of RAW_BODY_ROUTES) {
    const src = readFileSync(path.join('api', `${name}.js`), 'utf8')
    assert.match(src, /bodyParser:\s*false/,
      `api/${name}.js doit conserver bodyParser: false tant que Vercel sert la production`)
  }
})

// ──────────────────────────────── Corps brut ─────────────────────────────────

test('webhook Stripe : le corps brut arrive intact, octet pour octet', async () => {
  const res = await fetch(`${baseUrl}/api/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'stripe-signature': 't=1,v1=fake' },
    body: RAW_PAYLOAD,
  })
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.sha256, sha256(RAW_PAYLOAD), 'le corps reçu diffère du corps envoyé')
  assert.equal(body.length, Buffer.byteLength(RAW_PAYLOAD))
})

test('invoice-webhook : le corps brut arrive intact, octet pour octet', async () => {
  const res = await fetch(`${baseUrl}/api/invoice-webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-invoice-secret': 'peu-importe' },
    body: RAW_PAYLOAD,
  })
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.sha256, sha256(RAW_PAYLOAD))
  assert.equal(body.length, Buffer.byteLength(RAW_PAYLOAD))
})

test('corps brut préservé même avec un content-type inattendu de Make', async () => {
  const res = await fetch(`${baseUrl}/api/invoice-webhook`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body: RAW_PAYLOAD,
  })
  assert.equal((await res.json()).sha256, sha256(RAW_PAYLOAD))
})

// ────────────────────── Parseur JSON sur les autres routes ───────────────────

test('les routes non-webhook reçoivent bien un corps parsé', async () => {
  const res = await fetch(`${baseUrl}/api/admin-list-users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ page: 2, search: 'dupont' }),
  })
  const body = await res.json()
  assert.equal(body.bodyType, 'object', 'req.body doit être parsé, sinon les 8 handlers répondent « ... requis »')
  assert.deepEqual(body.body, { page: 2, search: 'dupont' })
})

test('un corps JSON vide est parsé en objet vide', async () => {
  const res = await fetch(`${baseUrl}/api/admin-list-users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  assert.deepEqual((await res.json()).body, {})
})

test('sans content-type, req.body reste indéfini — d\'où le `|| {}` des handlers', async () => {
  // Comportement documenté, identique à Vercel : le parseur ne s'applique qu'au bon
  // content-type. Les handlers déstructurent donc `req.body || {}`. api/create-portal-
  // session.js était le seul à lire `req.body.return_url` sans ce garde : il aurait levé
  // un TypeError ici. Le garde a été ajouté dans cette PR.
  const res = await fetch(`${baseUrl}/api/admin-list-users`, { method: 'POST' })
  assert.equal(res.status, 200, 'un corps absent ne doit jamais faire tomber la route')
  assert.equal((await res.json()).bodyType, 'undefined')
})

// ───────────────────────────── Contrat des routes ────────────────────────────

test('une route /api inconnue répond 404 en JSON, jamais du HTML', async () => {
  const res = await fetch(`${baseUrl}/api/route-qui-nexiste-pas`)
  assert.equal(res.status, 404)
  assert.match(res.headers.get('content-type'), /application\/json/)
  assert.equal((await res.json()).error, 'Not found')
})

test('le 405 des handlers est préservé sur une mauvaise méthode', async () => {
  const res = await fetch(`${baseUrl}/api/admin-list-users`, { method: 'GET' })
  assert.equal(res.status, 405, 'monter les routes en POST seul transformerait ce 405 en 404')
})

test('healthz répond sans dépendance externe', async () => {
  const res = await fetch(`${baseUrl}/healthz`)
  assert.equal(res.status, 200)
  assert.equal((await res.json()).status, 'ok')
})

// ───────────────────────────── Front et repli SPA ────────────────────────────

test('la racine sert index.html', async () => {
  const res = await fetch(baseUrl)
  assert.equal(res.status, 200)
  assert.match(await res.text(), /<div id="root">/)
})

test('un accès direct à une route profonde sert index.html', async () => {
  const res = await fetch(`${baseUrl}/admin/users/42`)
  assert.equal(res.status, 200)
  assert.match(res.headers.get('content-type'), /text\/html/)
  assert.match(await res.text(), /<div id="root">/)
})

test('un asset de build absent répond 404, et surtout pas index.html', async () => {
  const res = await fetch(`${baseUrl}/assets/index-DISPARU.js`)
  assert.equal(res.status, 404, 'servir du HTML ici donnerait une page blanche inexplicable')
  assert.doesNotMatch(res.headers.get('content-type') ?? '', /text\/html/)
})

// ──────────────────────────── Cache et compression ───────────────────────────

test('un asset hashé est mis en cache indéfiniment', async () => {
  const res = await fetch(`${baseUrl}/assets/index-DZ56lhXT.js`)
  assert.equal(res.status, 200)
  assert.match(res.headers.get('cache-control'), /max-age=31536000/)
  assert.match(res.headers.get('cache-control'), /immutable/)
})

test('index.html n\'est jamais mis en cache', async () => {
  for (const url of [`${baseUrl}/`, `${baseUrl}/mon-compte`]) {
    const res = await fetch(url)
    assert.equal(res.headers.get('cache-control'), 'no-store', `${url} doit rester non caché`)
  }
})

test('un fichier non hashé a un cache court', async () => {
  const res = await fetch(`${baseUrl}/images/logo.png`)
  assert.match(res.headers.get('cache-control'), /max-age=3600/)
  assert.doesNotMatch(res.headers.get('cache-control'), /immutable/)
})

test('les réponses sont compressées quand le client l\'accepte', async () => {
  const res = await fetch(`${baseUrl}/assets/index-DZ56lhXT.js`, {
    headers: { 'accept-encoding': 'gzip' },
  })
  assert.equal(res.headers.get('content-encoding'), 'gzip')
})

test('aucune compression quand le client ne l\'accepte pas', async () => {
  const res = await fetch(`${baseUrl}/assets/index-DZ56lhXT.js`, {
    headers: { 'accept-encoding': 'identity' },
  })
  assert.equal(res.headers.get('content-encoding'), null)
})

// ──────────────── Isolation : une route cassée n'emporte pas le reste ────────

test('une fonction qui échoue au chargement répond 503 sans affecter les autres', async () => {
  const loader = stubLoader()
  const app = createApp({
    distDir,
    loadHandler: async (name) => {
      // Reproduit le cas réel : api/_lib/verifyAdmin.js lève au chargement quand une
      // variable manque. En import statique, cela ferait tomber tout le processus.
      if (name === 'admin-list-users') throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var')
      return loader(name)
    },
  })
  const s = await startServer(app)
  const url = `http://127.0.0.1:${s.address().port}`
  try {
    const cassee = await fetch(`${url}/api/admin-list-users`, { method: 'POST' })
    assert.equal(cassee.status, 503)
    assert.equal((await cassee.json()).endpoint, 'admin-list-users')

    // Le reste du service reste debout.
    assert.equal((await fetch(`${url}/healthz`)).status, 200)
    assert.equal((await fetch(`${url}/`)).status, 200)
    const saine = await fetch(`${url}/api/admin-delete-user`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    })
    assert.equal(saine.status, 200)
  } finally {
    s.close()
  }
})

// ─────────────────────── Garde-fou de configuration ──────────────────────────

test('missingServerEnv signale toutes les variables absentes', () => {
  const missing = missingServerEnv({})
  for (const name of REQUIRED_SERVER_ENV) {
    assert.ok(missing.includes(name), `${name} doit être signalée absente`)
  }
  assert.ok(missing.some((m) => m.startsWith('NEXT_PUBLIC_SUPABASE_URL')))
})

test('une configuration complète ne signale rien, et le repli Supabase est accepté', () => {
  const base = Object.fromEntries(REQUIRED_SERVER_ENV.map((name) => [name, 'valeur-factice']))
  assert.deepEqual(missingServerEnv({ ...base, NEXT_PUBLIC_SUPABASE_URL: 'x' }), [])
  assert.deepEqual(missingServerEnv({ ...base, VITE_SUPABASE_URL: 'x' }), [], 'le repli VITE_ doit suffire')
})

// ───────── Customer Stripe appartenant à l'autre compte (base partagée) ──────

test('le customer issu de l\'autre compte Stripe est reconnu, et lui seul', async () => {
  const { isCustomerFromOtherStripeAccount, OTHER_ACCOUNT_STATUS } =
    await import('../api/_lib/stripeCustomer.js')

  assert.equal(isCustomerFromOtherStripeAccount({ code: 'resource_missing', param: 'customer' }), true)
  // Un `resource_missing` sur un AUTRE paramètre (un prix supprimé, par exemple) ne doit
  // pas être confondu : il garde le comportement d'erreur existant.
  assert.equal(isCustomerFromOtherStripeAccount({ code: 'resource_missing', param: 'price' }), false)
  assert.equal(isCustomerFromOtherStripeAccount({ code: 'card_declined', param: 'customer' }), false)
  assert.equal(isCustomerFromOtherStripeAccount(undefined), false)
  assert.equal(OTHER_ACCOUNT_STATUS, 409, 'la requête est valide, c\'est l\'état stocké qui est incompatible')
})

test('les trois parcours Stripe partagent la même définition du cas', () => {
  // Fermeture de classe : une seule définition de la condition, sinon les parcours
  // divergent silencieusement le jour où Stripe change son code d'erreur.
  for (const name of ['create-checkout-session', 'create-portal-session', 'create-credit-checkout-session']) {
    const src = readFileSync(path.join('api', `${name}.js`), 'utf8')
    assert.match(src, /isCustomerFromOtherStripeAccount/, `api/${name}.js doit réutiliser le prédicat partagé`)
    assert.doesNotMatch(src, /code\s*!==\s*'resource_missing'/, `api/${name}.js ne doit pas redéfinir la condition`)
  }
})

test('abonnement et portail ne recréent JAMAIS le customer', () => {
  // Garde-fou métier : recréer écraserait le stripe_customer_id LIVE d'un utilisateur
  // réel par un id sandbox, la base étant partagée entre les deux comptes Stripe.
  for (const name of ['create-checkout-session', 'create-portal-session']) {
    const src = readFileSync(path.join('api', `${name}.js`), 'utf8')
    assert.doesNotMatch(src, /createFreshCustomer/,
      `api/${name}.js ne doit pas recréer de customer : la correspondance Stripe live serait perdue`)
  }
})

test('les identifiants Stripe d\'abonnement sont exigés au démarrage', () => {
  assert.ok(REQUIRED_SERVER_ENV.includes('STRIPE_SUBSCRIPTION_PRICE_ID'))
  assert.ok(REQUIRED_SERVER_ENV.includes('STRIPE_SUBSCRIPTION_PRODUCT_ID'))
})
