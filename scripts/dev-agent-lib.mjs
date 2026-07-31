// scripts/dev-agent-lib.mjs
//
// Socle commun des scripts d'outillage agent (dev-auth / dev-shot). Factorisé pour que
// les deux commandes ne puissent pas diverger sur le chemin de session, le viewport ou
// la lecture du .env.
//
// ⚠️ OUTILLAGE DE DEV UNIQUEMENT. Ces scripts ne touchent PAS à l'application.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

// Route de connexion de Lite : `/connexion` — et NON `/login` comme dans le repo
// Fiche Logement. Une transposition aveugle échoue ici.
export const LOGIN_PATH = '/connexion'

// La fiche du wizard se cible par query param (`/fiche?id=<uuid>`) : la route est
// déclarée sans segment `:id`.
export const FICHE_PATH = '/fiche'

// ⚠️ CE DÉPÔT EST PUBLIC. Aucune valeur permettant d'identifier un compte ne doit
// figurer ici : ni email, ni mot de passe. L'email du compte de test et son mot de
// passe viennent EXCLUSIVEMENT du .env (non suivi par git), cf. .env.example.
export const DEFAULTS = {
  baseUrl: 'http://localhost:5173',
  // Fiche de démo dédiée aux agents (« AGENTS - NE PAS TOUCHER », statut Brouillon).
  // Identifiant opaque, sans valeur hors session authentifiée (protégé par RLS).
  ficheId: 'd8f4a185-8fa0-4520-9edf-06a563224e7d',
}

// Session mise en cache HORS du repo : aucun token ne peut partir dans un commit.
// Nom de fichier distinct de celui du repo Fiche Logement pour éviter tout écrasement.
export const STATE_PATH = join(homedir(), '.agent-auth', 'mon-equipe-ia-lite.json')

// Viewport DESKTOP obligatoire : la sidebar des sections est `hidden lg:block`
// (seuil 1024px). En largeur mobile elle est masquée et tout clic de section part en
// timeout. L'usage réel du terrain est mobile, l'outillage reste desktop.
export const VIEWPORT = { width: 1440, height: 900 }

// Lecture minimale du .env (pas de dépendance dotenv à ajouter pour deux variables).
// Gère les guillemets et ignore les commentaires.
export function readEnv(repoRoot) {
  let raw = ''
  try {
    raw = readFileSync(join(repoRoot, '.env'), 'utf8')
  } catch {
    return {}
  }
  const env = {}
  for (const line of raw.split(/\r?\n/)) {
    if (/^\s*#/.test(line)) continue
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
  return env
}

// Normalisation pour comparer des libellés de section : les noms portent des accents
// (« Sécurité », « Équip. Extérieur », « Télétravail »…) et une recherche sans accent
// ne matcherait rien. On retire les diacritiques et on aplatit la ponctuation, pour
// qu'un agent puisse écrire « equip exterieur » aussi bien que « Équip. Extérieur ».
export function normalizeLabel(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
}

// Résout un nom saisi vers UN libellé réel lu dans la page.
// Renvoie { index, label } ou { erreur, disponibles }.
export function resolveSection(saisi, labels) {
  const cible = normalizeLabel(saisi)
  const norms = labels.map(normalizeLabel)

  const exact = norms.findIndex((n) => n === cible)
  if (exact !== -1) return { index: exact, label: labels[exact] }

  // Sinon : préfixe, puis sous-chaîne — mais uniquement si la réponse est UNIQUE.
  // « equip » matche « Équipements » ET « Équip. Extérieur » : on refuse plutôt que
  // de cliquer au hasard.
  for (const test of [
    (n) => n.startsWith(cible),
    (n) => n.includes(cible),
  ]) {
    const hits = norms.map((n, i) => (test(n) ? i : -1)).filter((i) => i !== -1)
    if (hits.length === 1) return { index: hits[0], label: labels[hits[0]] }
    if (hits.length > 1) {
      return {
        erreur: `Nom de section ambigu : "${saisi}" matche ${hits.length} sections`,
        ambigus: hits.map((i) => labels[i]),
        disponibles: labels,
      }
    }
  }
  return { erreur: `Section introuvable : "${saisi}"`, disponibles: labels }
}

// Collecte les erreurs de la page (erreurs JS non catchées + console.error).
export function collectPageErrors(page) {
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  return errors
}
