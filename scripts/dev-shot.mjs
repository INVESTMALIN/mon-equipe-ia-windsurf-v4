// scripts/dev-shot.mjs
//
// Ouvre la fiche de démo avec la session du compte de test, atteint une section du
// formulaire désignée par son nom, produit une capture lisible par un agent, et
// retourne les erreurs console de la page.
//
// Usage :
//   node scripts/dev-shot.mjs                                   -> fiche, section courante
//   node scripts/dev-shot.mjs "Sécurité"                        -> section Sécurité
//   node scripts/dev-shot.mjs "securite"                        -> idem (accents optionnels)
//   node scripts/dev-shot.mjs "Clefs" --check "Boîte à clés"    -> + vérification de texte
//   node scripts/dev-shot.mjs "Avis" --base https://xxx.vercel.app
//   node scripts/dev-shot.mjs --sections                        -> liste les sections
//
// Options : --section/-s, --check/-c, --base/-b, --fiche/-f, --sections, --dashboard
// Les deux premiers arguments positionnels valent --section puis --check.
//
// Se reconnecte tout seul si la session en cache a expiré ou n'existe pas.
//
// ─── INVARIANTS DE SÛRETÉ (la base est celle de PRODUCTION) ───
//  1. Ce script ne SAISIT JAMAIS rien dans un champ. L'auto-save du wizard est
//     conditionné à `isUserChangeRef` (posé par la saisie utilisateur uniquement) :
//     naviguer entre sections et capturer n'écrit donc RIEN en base.
//  2. Il ne clique QUE des entrées de la sidebar des sections, résolues depuis la
//     liste réellement lue dans la page. Aucun autre bouton n'est actionné.
//  3. Il ne génère JAMAIS de PDF. Le premier PDF poserait `fields_locked` sur la
//     fiche de démo et gèlerait ses champs d'identification.

import { chromium } from 'playwright-core'
import { mkdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  readEnv, DEFAULTS, STATE_PATH, VIEWPORT, collectPageErrors,
  LOGIN_PATH, FICHE_PATH, resolveSection,
} from './dev-agent-lib.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

// ─── Arguments : options nommées + deux positionnels de commodité ───
const argv = process.argv.slice(2)
const opts = { section: null, check: null, base: null, fiche: null, sections: false, dashboard: false }
const positionnels = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--sections') opts.sections = true
  else if (a === '--dashboard') opts.dashboard = true
  else if (a === '--section' || a === '-s') opts.section = argv[++i]
  else if (a === '--check' || a === '-c') opts.check = argv[++i]
  else if (a === '--base' || a === '-b') opts.base = argv[++i]
  else if (a === '--fiche' || a === '-f') opts.fiche = argv[++i]
  else if (a.startsWith('http')) opts.base = a          // tolère une URL nue
  else positionnels.push(a)
}
if (!opts.section && positionnels[0]) opts.section = positionnels[0]
if (!opts.check && positionnels[1]) opts.check = positionnels[1]

const env = readEnv(repoRoot)
const baseUrl = (opts.base || env.DEV_AGENT_BASE_URL || DEFAULTS.baseUrl).replace(/\/+$/, '')
const ficheId = opts.fiche || env.DEV_AGENT_FICHE_ID || DEFAULTS.ficheId
const email = env.DEV_AGENT_EMAIL || DEFAULTS.email
const password = env.DEV_AGENT_PASSWORD

const cible = opts.dashboard
  ? `${baseUrl}/dashboard`
  : `${baseUrl}${FICHE_PATH}?id=${encodeURIComponent(ficheId)}`

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: VIEWPORT, // desktop obligatoire, cf. dev-agent-lib
  storageState: existsSync(STATE_PATH) ? STATE_PATH : undefined,
})
const page = await context.newPage()
const errors = collectPageErrors(page)

// Reconnexion silencieuse si la session en cache est absente/expirée.
async function login() {
  if (!password) throw new Error('session absente ou expirée et DEV_AGENT_PASSWORD absent du .env')
  await page.goto(`${baseUrl}${LOGIN_PATH}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForSelector('form input[type="email"]', { timeout: 15000 })
  await page.fill('form input[type="email"]', email)
  await page.fill('form input[type="password"]', password)
  await page.click('form button[type="submit"]')
  await page.waitForURL((u) => !u.pathname.startsWith(LOGIN_PATH), { timeout: 25000 })
  mkdirSync(dirname(STATE_PATH), { recursive: true })
  await context.storageState({ path: STATE_PATH })
}

// Les entrées de section = les <li> de l'<ul> qui suit le titre « SECTIONS » dans la
// sidebar visible. On lit la liste DANS la page (source de vérité unique) au lieu de
// dupliquer les 24 libellés ici.
function sidebarItems() {
  return page.locator('h2:visible', { hasText: 'SECTIONS' })
    .first()
    .locator('xpath=following-sibling::ul[1]')
    .locator('li')
}

try {
  // `domcontentloaded` et non `networkidle` : l'app garde des connexions Supabase
  // ouvertes, `networkidle` peut ne jamais se produire.
  await page.goto(cible, { waitUntil: 'domcontentloaded', timeout: 30000 })

  let reconnecte = false
  if (new URL(page.url()).pathname.startsWith(LOGIN_PATH)) {
    await login()
    reconnecte = true
    await page.goto(cible, { waitUntil: 'domcontentloaded', timeout: 30000 })
  }

  let sectionsDisponibles = []
  let sectionAtteinte = null

  if (!opts.dashboard) {
    // Attendre que le wizard soit monté (la sidebar est rendue avec les sections).
    await sidebarItems().first().waitFor({ state: 'visible', timeout: 20000 })
    sectionsDisponibles = (await sidebarItems().allInnerTexts()).map((t) => t.trim()).filter(Boolean)

    if (opts.sections) {
      console.log(JSON.stringify({ ok: true, url: page.url(), sections: sectionsDisponibles }, null, 2))
      await browser.close()
      process.exit(0)
    }

    if (opts.section) {
      const r = resolveSection(opts.section, sectionsDisponibles)
      if (r.erreur) {
        console.error('ECHEC :', r.erreur)
        if (r.ambigus) console.error('Ambigu entre :', r.ambigus.join(' | '))
        console.error('Sections disponibles :', r.disponibles.join(' | '))
        await browser.close()
        process.exit(1)
      }
      await sidebarItems().nth(r.index).click()
      // Le wizard remplace le contenu de la zone principale. On attend que l'entrée
      // cliquée devienne l'entrée ACTIVE : le <li> courant reçoit un dégradé doré en
      // style inline. C'est la preuve que la navigation a pris, et non un simple sleep.
      await sidebarItems()
        .nth(r.index)
        .evaluate(
          (el) => new Promise((resolve, reject) => {
            const actif = () => (el.getAttribute('style') || '').includes('gradient')
            if (actif()) return resolve(true)
            const obs = new MutationObserver(() => { if (actif()) { obs.disconnect(); resolve(true) } })
            obs.observe(el, { attributes: true, attributeFilter: ['style'] })
            setTimeout(() => { obs.disconnect(); reject(new Error('section non activée')) }, 10000)
          })
        )
      sectionAtteinte = r.label
    }
  }

  // Repère indépendant de progression, rendu par la ProgressBar : « Étape N sur T ».
  // (Attention : « Section N sur T » existe aussi, mais UNIQUEMENT dans le placeholder
  // des sections non implémentées — ce n'est pas un indicateur fiable.)
  const progression = await page
    .getByText(/Étape\s+\d+\s+sur\s+\d+/)
    .first()
    .innerText()
    .catch(() => null)

  // ─── Vérification de texte : présent DANS LE DOM et réellement VISIBLE ───
  // Les deux sont distincts : un champ peut exister sans être affiché (section
  // repliée, `hidden`, largeur mobile). C'est précisément ce qu'on veut détecter.
  let verification = null
  if (opts.check) {
    const loc = page.getByText(opts.check, { exact: false })
    const occurrences = await loc.count()
    let visible = false
    for (let i = 0; i < occurrences; i++) {
      if (await loc.nth(i).isVisible()) {
        visible = true
        await loc.nth(i).scrollIntoViewIfNeeded().catch(() => {})
        await page.waitForTimeout(300)
        break
      }
    }
    verification = { texte: opts.check, presentDansLeDom: occurrences > 0, visible, occurrences }
  }

  // ─── Capture ───
  // Dossier DANS le repo (ignoré par git) : une capture écrite dans %TEMP% est
  // produite mais illisible par les outils fichiers des agents, restreints à
  // certains répertoires.
  const shotDir = join(repoRoot, '.shots')
  mkdirSync(shotDir, { recursive: true })
  const nom = (sectionAtteinte || (opts.dashboard ? 'dashboard' : 'fiche'))
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
  const shotPath = join(shotDir, `lite-${nom}-${Date.now()}.jpg`)

  // JPEG qualité modérée : un PNG pleine page dépasse 1 Mo et devient illisible par
  // un agent. Et au-delà d'une page très haute, on cadre la fenêtre plutôt que la
  // page entière, sinon l'image est refusée pour ses dimensions.
  const hauteur = await page.evaluate(() => document.body.scrollHeight)
  let pleinePage = hauteur <= 5000
  await page.screenshot({ path: shotPath, fullPage: pleinePage, type: 'jpeg', quality: 55 })

  // Garde-fou de taille : si malgré tout le fichier dépasse ~900 Ko, on reprend la
  // capture cadrée sur la fenêtre.
  let tailleKo = Math.round(statSync(shotPath).size / 1024)
  if (tailleKo > 900 && pleinePage) {
    pleinePage = false
    await page.screenshot({ path: shotPath, fullPage: false, type: 'jpeg', quality: 55 })
    tailleKo = Math.round(statSync(shotPath).size / 1024)
  }

  const pageVide = (await page.evaluate(() => document.body.innerText.trim().length)) === 0

  console.log(JSON.stringify({
    ok: true,
    url: page.url(),
    baseUrl,
    sectionDemandee: opts.section || '(aucune)',
    sectionAtteinte: sectionAtteinte || '(aucune)',
    progression,
    verification,
    capture: relative(repoRoot, shotPath).replace(/\\/g, '/'),
    captureTailleKo: tailleKo,
    capturePleinePage: pleinePage,
    hauteurPage: hauteur,
    sessionReconnectee: reconnecte,
    pageVide,
    erreursConsole: errors,
  }, null, 2))
} catch (e) {
  console.error('ECHEC :', e.message)
  console.error('URL courante :', page.url())
  if (errors.length) console.error('Erreurs page :', errors.join(' | '))
  process.exitCode = 1
} finally {
  await browser.close()
}
