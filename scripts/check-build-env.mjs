// Vérifie, AVANT `vite build`, que les variables du front sont présentes.
//
// Pourquoi au build et pas au démarrage : les variables `VITE_*` sont inlinées dans le
// bundle au moment de la construction. Absente, une variable ne produit aucune erreur —
// le build réussit, le déploiement passe au vert, et l'application est cassée en silence
// chez l'utilisateur (client Supabase construit sur `undefined`). C'est exactement le
// scénario « build vert, application inutilisable » qu'on veut rendre impossible.
//
// On lit l'environnement avec `loadEnv` de Vite, et pas `process.env` : c'est ce que Vite
// lui-même utilise. Il agrège le fichier `.env` (développement local) ET les variables du
// process (Railway, Vercel). Sans cela, le contrôle échouerait en local alors que le
// build fonctionne.

import { loadEnv } from 'vite'

// Les quatre variables réellement lues par `src/`. Vérifié par grep, et par le test
// tests/build-env.test.mjs qui relit les sources : une cinquième variable ajoutée au
// front sans être déclarée ici fait échouer les tests.
const REQUIRED = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_ACCESS_CODE',
  'VITE_WEBHOOK_VOICE_INVENTORY',
]

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production'
const env = loadEnv(mode, process.cwd(), '')

const missing = REQUIRED.filter((name) => !env[name])

if (missing.length > 0) {
  console.error(
    "\n[build] Construction refusée : variable(s) de front manquante(s) :\n" +
    missing.map((name) => `  - ${name}`).join('\n') +
    "\n\nCes variables sont inlinées dans le bundle : sans elles le build réussirait mais" +
    "\nl'application serait cassée à l'exécution. Les définir dans l'environnement de" +
    "\nconstruction (ou dans `.env` en local — voir `.env.example`).\n" +
    "\nSeuls des NOMS sont affichés ci-dessus, jamais de valeur.\n"
  )
  process.exit(1)
}

console.log(`[build] ${REQUIRED.length} variables de front présentes.`)
