// Serveur unique Railway : sert le front Vite construit ET les dix fonctions de `api/`.
//
// Pourquoi ce fichier existe
// --------------------------
// Vercel route `api/*.js` implicitement, une fonction isolée par fichier, et sert le
// statique de son côté. Railway fait tourner UN conteneur : il faut donc un serveur
// explicite qui porte les deux. Les dix handlers ne sont pas réécrits — ils gardent leur
// signature `(req, res)` et leur `export default`, donc la version Vercel reste
// déployable à l'identique pendant toute la coexistence.
//
// NE PAS RENOMMER en `server.js` / `server.mjs`, ni déplacer dans `src/`.
// Vercel détecte ces noms, à la racine et dans `src/`, comme point d'entrée serveur et
// changerait sa façon de construire le projet. Tant que Vercel est la production, ce
// fichier doit lui rester invisible. C'est la seule raison de son nom.
//
// L'ordre de montage ci-dessous n'est pas cosmétique : chaque position corrige un défaut
// précis. Il est verrouillé par tests/server.test.mjs.

import express from 'express'
import compression from 'compression'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { existsSync, statSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
// Import statique volontaire, contrairement aux handlers de `api/` : ce module ne lève
// jamais au chargement (APP_URL a un repli, requireEnv n'est qu'une fonction), il ne peut
// donc pas emporter le processus.
import { APP_URL } from './api/_lib/env.js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

// Les dix fonctions portées. Sert aussi d'inventaire vérifiable : un test compare cette
// liste au contenu réel de `api/`, pour qu'une onzième fonction ajoutée plus tard ne
// puisse pas être oubliée ici en silence.
export const API_ROUTES = [
  'admin-create-user',
  'admin-delete-user',
  'admin-list-users',
  'admin-update-subscription',
  'admin-user-actions',
  'create-checkout-session',
  'create-credit-checkout-session',
  'create-portal-session',
  'invoice-webhook',
  'webhook',
]

// Ces deux routes lisent elles-mêmes le corps BRUT : `webhook` vérifie la signature
// Stripe dessus (toute transformation invalide la signature), `invoice-webhook` archive
// exactement l'octet envoyé par Make. Elles sont montées AVANT tout parseur de corps.
export const RAW_BODY_ROUTES = new Set(['webhook', 'invoice-webhook'])

// Variables sans lesquelles le service ne peut pas répondre correctement. Absentes, on
// refuse de démarrer : sur Railway le healthcheck échoue, le déploiement est marqué en
// échec et L'ANCIEN CONTENEUR RESTE EN LIGNE. Bien meilleur qu'un démarrage réussi suivi
// d'erreurs à la première requête d'un vrai utilisateur.
export const REQUIRED_SERVER_ENV = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_SUBSCRIPTION_PRODUCT_ID',
  'STRIPE_SUBSCRIPTION_PRICE_ID',
  'INVOICE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'APP_URL',
]

// Hôte apex à rediriger vers l'hôte canonique, DÉDUIT de APP_URL plutôt qu'écrit en dur.
//
// Conséquence voulue : la redirection ne s'installe que là où l'URL canonique est un
// `www.<domaine>`. Le staging Railway (`…up.railway.app`) et le développement local
// (`localhost`) n'ont pas de `www.`, donc aucune redirection n'y est montée — ils ne
// peuvent pas être touchés par accident, par construction plutôt que par une liste
// d'exclusions à tenir à jour.
//
// Renvoie null quand il n'y a rien à rediriger.
export function canonicalHostRedirect(appUrl = APP_URL) {
  let canonical
  try {
    canonical = new URL(appUrl)
  } catch {
    return null // APP_URL illisible : on ne redirige rien plutôt que de deviner
  }
  if (!canonical.hostname.startsWith('www.')) return null
  return {
    apex: canonical.hostname.slice('www.'.length),
    origin: canonical.origin,
  }
}

export function missingServerEnv(env = process.env) {
  const missing = REQUIRED_SERVER_ENV.filter((name) => !env[name])
  // Repli historique conservé (confirmé fonctionnel) : l'une OU l'autre suffit.
  if (!env.NEXT_PUBLIC_SUPABASE_URL && !env.VITE_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL (ou VITE_SUPABASE_URL)')
  }
  return missing
}

// Chargement paresseux, par route, avec mise en cache.
//
// Raison : plusieurs modules de `api/` lèvent une exception AU CHARGEMENT quand une
// variable manque (api/_lib/verifyAdmin.js, api/_lib/env.js). Sur Vercel cela ne tuait
// qu'une fonction. Ici tout vit dans un seul processus : un `import` statique en tête de
// fichier ferait tomber le front ET les neuf autres routes. Un import paresseux confine
// la panne à la route concernée, qui répond alors 503.
function createDefaultLoader() {
  const cache = new Map()
  return function loadHandler(name) {
    if (!cache.has(name)) {
      const pending = import(pathToFileURL(path.join(ROOT, 'api', `${name}.js`)).href)
        .then((mod) => {
          if (typeof mod.default !== 'function') {
            throw new Error(`api/${name}.js n'exporte pas de handler par défaut`)
          }
          return mod.default
        })
      // L'échec est relu par chaque `await` plus bas ; ce catch ne sert qu'à éviter un
      // unhandledRejection au moment de la mise en cache.
      pending.catch(() => {})
      cache.set(name, pending)
    }
    return cache.get(name)
  }
}

export function createApp({ distDir = path.join(ROOT, 'dist'), loadHandler = createDefaultLoader() } = {}) {
  const app = express()

  // Railway termine TLS en amont : sans ceci, req.protocol et req.ip reflètent le proxy.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  // 1. Santé — en tout premier et sans la moindre E/S : c'est ce que Railway interroge
  //    pour décider si le nouveau conteneur remplace l'ancien. Doit rester trivialement
  //    vrai, sinon un incident Supabase empêcherait tout déploiement.
  app.get('/healthz', (req, res) => {
    res.set('Cache-Control', 'no-store').json({ status: 'ok' })
  })

  // 2. Domaine canonique. Une requête reçue sur l'apex nu part vers `www`, chemin et
  //    query préservés. Placé après /healthz pour que la sonde de Railway ne dépende
  //    jamais de cette logique, et avant tout le reste pour qu'aucune route ne réponde
  //    sur un hôte non canonique.
  //
  //    Le code diffère selon la méthode, et ce n'est pas un détail : un 301 sur un POST
  //    autorise les clients à le rejouer en GET, en perdant le corps. Une requête signée
  //    arrivant sur l'apex deviendrait alors un GET vide et une signature invalide.
  //    308 conserve méthode et corps ; 301, mieux compris des vieux clients et des
  //    moteurs de recherche, reste réservé aux lectures.
  const canonical = canonicalHostRedirect()
  if (canonical) {
    app.use((req, res, next) => {
      if (req.hostname !== canonical.apex) return next()
      const permanent = req.method === 'GET' || req.method === 'HEAD' ? 301 : 308
      return res.redirect(permanent, canonical.origin + req.originalUrl)
    })
  }

  app.use(compression())

  // 3. Routes à corps brut — AVANT tout parseur. En Express la première pile qui
  //    correspond gagne, donc express.json() plus bas ne les verra jamais. Ne JAMAIS
  //    ajouter express.raw() ici : cela consommerait le flux et `micro.buffer()` du
  //    webhook Stripe resterait suspendu jusqu'au timeout au lieu d'échouer.
  for (const name of API_ROUTES.filter((n) => RAW_BODY_ROUTES.has(n))) {
    mountApiRoute(app, name, loadHandler)
  }

  // 4. Parseur JSON. Sans lui `req.body` vaut undefined et les huit handlers restants
  //    répondent « ... requis » — une panne qui ressemble à un bug applicatif. Limite
  //    alignée sur celle que Vercel appliquait.
  app.use(express.json({ limit: '1mb' }))

  // 5. Les huit autres routes.
  for (const name of API_ROUTES.filter((n) => !RAW_BODY_ROUTES.has(n))) {
    mountApiRoute(app, name, loadHandler)
  }

  // 6. Garde-fou /api. Sans lui, `/api/inconnu` traverserait jusqu'au repli SPA et
  //    renverrait 200 + du HTML : le front ferait `.json()` dessus et casserait sur
  //    « Unexpected token '<' » au lieu de voir un 404. Le passthrough `/api/(.*)` de
  //    vercel.json jouait ce rôle.
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found', path: req.originalUrl })
  })

  // 7. Validateurs de cache calculés sur le CONTENU, avant le service du statique.
  //
  //    L'ETag d'express.static dérive de la taille et de la date de modification. Chaque
  //    déploiement recrée les fichiers : la date change, donc l'ETag change même à
  //    contenu identique, et `public/images` (7,4 Mo de PNG non hashés) est retéléchargé
  //    à chaque mise en ligne. `lastModified: false` ne corrige pas cela — il ne
  //    supprime qu'un en-tête séparé. Il faut un validateur basé sur le contenu.
  app.use(createContentEtag(distDir))

  // 8. Statique. `index: false` : la page d'accueil doit passer par le repli SPA
  //    ci-dessous, qui pose les bons en-têtes de cache. `etag: false` : le validateur
  //    est déjà posé par le middleware précédent, celui d'Express l'écraserait.
  app.use(express.static(distDir, {
    index: false,
    etag: false,
    lastModified: false,
    setHeaders(res, filePath) {
      res.setHeader('Cache-Control', cacheControlFor(filePath))
    },
  }))

  // 9. Repli SPA. React Router gère les routes profondes côté client : un accès direct à
  //    /admin/users/42 doit servir index.html.
  const indexHtml = path.join(distDir, 'index.html')
  app.use((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return res.status(404).json({ error: 'Not found' })
    }
    // Un fichier de build absent ne doit pas devenir une page HTML : le navigateur
    // essaierait de lire du HTML comme du JavaScript et afficherait une page blanche.
    // Un vrai 404 est diagnostiquable.
    if (/^\/(assets|images)\//.test(req.path)) {
      return res.status(404).type('text/plain').send('Not found')
    }
    if (!existsSync(indexHtml)) {
      return res.status(503).type('text/plain').send('Build absent : lancer `npm run build`.')
    }
    res.set('Cache-Control', 'no-store').sendFile(indexHtml)
  })

  // 10. Erreurs. Le gestionnaire par défaut d'Express répond en HTML ; sous /api on veut
  //    du JSON, sinon le front casse au parsing au lieu de lire le message.
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err)

    // express.json() signale un corps invalide (400) ou trop volumineux (413) via
    // `err.status`. Les écraser en 500 ferait passer une requête client fautive pour une
    // panne serveur : l'appelant croirait devoir réessayer, et la supervision compterait
    // des incidents qui n'en sont pas. On préserve donc les statuts 4xx.
    const declared = Number(err?.status ?? err?.statusCode)
    const isClientError = Number.isInteger(declared) && declared >= 400 && declared < 500
    const status = isClientError ? declared : 500

    // Une erreur client est attendue et journalisée sobrement ; seul un 5xx est un
    // incident méritant une trace complète.
    if (isClientError) {
      console.warn(`[server] requête invalide (${status}) sur ${req.originalUrl}`)
    } else {
      console.error('[server] erreur non gérée :', err)
    }

    if (req.path.startsWith('/api/')) {
      // Message générique : `err.message` peut contenir un fragment du corps reçu.
      return res.status(status).json({
        error: isClientError ? 'Requête invalide' : 'Erreur serveur',
      })
    }
    res.status(status).type('text/plain').send(isClientError ? 'Requête invalide' : 'Erreur serveur')
  })

  return app
}

// Politique de cache, définie une seule fois : elle sert au service du fichier ET aux
// réponses 304, qui ne passent pas par express.static.
function cacheControlFor(filePath) {
  if (filePath.endsWith('index.html')) return 'no-store'
  if (isHashedAsset(filePath)) return 'public, max-age=31536000, immutable'
  return 'public, max-age=3600'
}

// Pose un ETag fort dérivé du CONTENU, et répond 304 quand le client a déjà la bonne
// version. Le hachage est paresseux et mis en cache ; la clé de cache inclut taille et
// date de modification, de sorte qu'un fichier réécrit à l'identique par un déploiement
// soit rehaché mais produise le MÊME ETag — c'est tout l'objet de la manœuvre.
function createContentEtag(distDir) {
  const root = path.resolve(distDir)
  const cache = new Map()

  return function contentEtag(req, res, next) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()

    const filePath = resolveWithin(root, req.path)
    if (!filePath) return next()

    let stats
    try {
      stats = statSync(filePath)
    } catch {
      return next() // fichier absent : le repli SPA décide de la suite
    }
    if (!stats.isFile()) return next()

    const cached = cache.get(filePath)
    let etag
    if (cached && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size) {
      etag = cached.etag
    } else {
      etag = `"${createHash('sha1').update(readFileSync(filePath)).digest('base64')}"`
      cache.set(filePath, { mtimeMs: stats.mtimeMs, size: stats.size, etag })
    }

    res.setHeader('ETag', etag)
    res.setHeader('Cache-Control', cacheControlFor(filePath))

    const ifNoneMatch = req.headers['if-none-match']
    if (ifNoneMatch && ifNoneMatch.split(',').some((candidate) => candidate.trim() === etag)) {
      return res.status(304).end()
    }
    return next()
  }
}

// Empêche qu'un chemin d'URL sorte du répertoire servi (`../`, séquences encodées).
function resolveWithin(root, urlPath) {
  let decoded
  try {
    decoded = decodeURIComponent(urlPath)
  } catch {
    return null // séquence d'échappement invalide
  }
  if (decoded.includes('\0')) return null
  const resolved = path.resolve(root, `.${path.posix.normalize(decoded)}`)
  return resolved === root || resolved.startsWith(root + path.sep) ? resolved : null
}

// Les noms produits par Vite portent un hash de contenu (index-DZ56lhXT.js) : leur URL
// change dès que le contenu change, ils sont donc cachables indéfiniment.
function isHashedAsset(filePath) {
  return /[\\/]assets[\\/]/.test(filePath)
}

function mountApiRoute(app, name, loadHandler) {
  // `all` et non `post` : les dix handlers vérifient déjà eux-mêmes la méthode et
  // répondent 405. Les router en POST seul transformerait ce 405 en 404 et modifierait
  // un contrat existant.
  app.all(`/api/${name}`, async (req, res) => {
    let handler
    try {
      handler = await loadHandler(name)
    } catch (err) {
      // Confiné à cette route : les neuf autres et le front continuent de répondre.
      console.error(`[api/${name}] chargement impossible :`, err?.message)
      return res.status(503).json({ error: 'Endpoint indisponible', endpoint: name })
    }
    return handler(req, res)
  })
}

// Démarrage — uniquement quand ce fichier est le point d'entrée. Les tests importent
// createApp() sans ouvrir de port ni exiger la moindre configuration.
const isEntrypoint = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url
if (isEntrypoint) {
  const missing = missingServerEnv()
  if (missing.length > 0) {
    console.error(
      "[server] Démarrage refusé : variable(s) d'environnement manquante(s) :\n" +
      missing.map((n) => `  - ${n}`).join('\n') +
      '\nSeuls des NOMS sont affichés ci-dessus, jamais de valeur.'
    )
    process.exit(1)
  }

  const port = process.env.PORT || 3000
  const server = createApp().listen(port, () => {
    console.log(`[server] à l'écoute sur le port ${port}`)
  })

  // Railway envoie SIGTERM au remplacement du conteneur. Sans fermeture propre, une
  // requête en vol est coupée net — une session Stripe en cours de création, par exemple.
  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => {
      console.log(`[server] ${signal} reçu, arrêt en cours`)
      server.close(() => process.exit(0))
      setTimeout(() => process.exit(0), 10_000).unref()
    })
  }
}
