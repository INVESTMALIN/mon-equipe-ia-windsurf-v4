// scripts/dev-auth.mjs
//
// Authentifie le compte de test des agents sur Mon Équipe IA / Fiche Logement Lite
// et met la session en cache, pour que dev-shot.mjs n'ait plus à repasser par le
// formulaire de connexion.
//
// Usage :
//   node scripts/dev-auth.mjs                          -> http://localhost:5173
//   node scripts/dev-auth.mjs https://xxx.vercel.app    -> une preview
//
// La session est écrite HORS du repo (profil utilisateur) : aucun token ne peut
// finir dans un commit, même par accident.
//
// Le mot de passe vient EXCLUSIVEMENT du .env (jamais de valeur par défaut, jamais
// affiché en sortie, jamais écrit dans un fichier du repo).
//
// ⚠️ Les variables de ce script ne portent JAMAIS le préfixe VITE_ : tout ce qui
// commence par VITE_ est inliné dans le bundle et servi en clair à tous les visiteurs.

import { chromium } from 'playwright-core'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import {
  readEnv, DEFAULTS, STATE_PATH, VIEWPORT, collectPageErrors, LOGIN_PATH,
} from './dev-agent-lib.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const baseUrl = (process.argv[2] || DEFAULTS.baseUrl).replace(/\/+$/, '')

const env = readEnv(repoRoot)
const email = env.DEV_AGENT_EMAIL || DEFAULTS.email
const password = env.DEV_AGENT_PASSWORD

if (!password) {
  console.error('ECHEC : DEV_AGENT_PASSWORD absent du .env.')
  console.error('Ajoute la ligne DEV_AGENT_PASSWORD=... dans .env (sans préfixe VITE_).')
  process.exit(1)
}

const browser = await chromium.launch({ headless: true })
// Viewport DESKTOP obligatoire : en largeur mobile la sidebar des sections est
// masquée (`hidden lg:block`, seuil 1024px) et tout clic de section part en timeout.
const context = await browser.newContext({ viewport: VIEWPORT })
const page = await context.newPage()
const errors = collectPageErrors(page)

try {
  await page.goto(`${baseUrl}${LOGIN_PATH}`, { waitUntil: 'domcontentloaded', timeout: 30000 })

  await page.waitForSelector('form input[type="email"]', { timeout: 15000 })
  await page.fill('form input[type="email"]', email)
  await page.fill('form input[type="password"]', password)
  await page.click('form button[type="submit"]')

  // Succès = on ne se trouve plus sur /connexion.
  await page.waitForURL((u) => !u.pathname.startsWith(LOGIN_PATH), { timeout: 25000 })

  mkdirSync(dirname(STATE_PATH), { recursive: true })
  await context.storageState({ path: STATE_PATH })

  console.log(JSON.stringify({
    ok: true,
    compte: email,                 // le mot de passe n'apparaît jamais ici
    baseUrl,
    urlApresLogin: page.url(),
    sessionEcriteDans: STATE_PATH.replace(homedir(), '~'),
    erreursConsole: errors,
  }, null, 2))
} catch (e) {
  console.error('ECHEC connexion :', e.message)
  console.error('URL courante :', page.url())
  if (errors.length) console.error('Erreurs page :', errors.join(' | '))
  process.exitCode = 1
} finally {
  await browser.close()
}
