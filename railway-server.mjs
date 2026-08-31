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
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

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

  app.use(compression())

  // 2. Routes à corps brut — AVANT tout parseur. En Express la première pile qui
  //    correspond gagne, donc express.json() plus bas ne les verra jamais. Ne JAMAIS
  //    ajouter express.raw() ici : cela consommerait le flux et `micro.buffer()` du
  //    webhook Stripe resterait suspendu jusqu'au timeout au lieu d'échouer.
  for (const name of API_ROUTES.filter((n) => RAW_BODY_ROUTES.has(n))) {
    mountApiRoute(app, name, loadHandler)
  }

  // 3. Parseur JSON. Sans lui `req.body` vaut undefined et les huit handlers restants
  //    répondent « ... requis » — une panne qui ressemble à un bug applicatif. Limite
  //    alignée sur celle que Vercel appliquait.
  app.use(express.json({ limit: '1mb' }))

  // 4. Les huit autres routes.
  for (const name of API_ROUTES.filter((n) => !RAW_BODY_ROUTES.has(n))) {
    mountApiRoute(app, name, loadHandler)
  }

  // 5. Garde-fou /api. Sans lui, `/api/inconnu` traverserait jusqu'au repli SPA et
  //    renverrait 200 + du HTML : le front ferait `.json()` dessus et casserait sur
  //    « Unexpected token '<' » au lieu de voir un 404. Le passthrough `/api/(.*)` de
  //    vercel.json jouait ce rôle.
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found', path: req.originalUrl })
  })

  // 6. Statique. `index: false` : la page d'accueil doit passer par le repli SPA
  //    ci-dessous, qui pose les bons en-têtes de cache.
  app.use(express.static(distDir, {
    index: false,
    etag: true,
    // L'ETag d'express.static dérive de mtime + taille. Chaque déploiement recrée les
    // fichiers, donc tous les ETag changeraient à contenu identique — et `public/images`
    // (7,4 Mo de PNG non hashés) serait retéléchargé à chaque mise en ligne. On
    // neutralise lastModified et on s'appuie sur les noms hashés.
    lastModified: false,
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-store')
      } else if (isHashedAsset(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600')
      }
    },
  }))

  // 7. Repli SPA. React Router gère les routes profondes côté client : un accès direct à
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

  // 8. Erreurs. Le gestionnaire par défaut d'Express répond en HTML ; sous /api on veut
  //    du JSON, sinon le front casse au parsing au lieu de lire le message.
  app.use((err, req, res, next) => {
    console.error('[server] erreur non gérée :', err)
    if (res.headersSent) return next(err)
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ error: 'Erreur serveur' })
    }
    res.status(500).type('text/plain').send('Erreur serveur')
  })

  return app
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
