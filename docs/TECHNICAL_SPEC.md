# Spécifications Techniques - Mon Équipe IA

## Vue d'ensemble
Documentation technique complète de l'application Mon Équipe IA, plateforme d'assistants IA pour la gestion de conciergerie immobilière Invest Malin.

## Architecture Générale

### Stack Technique

#### Frontend
- **Framework** : React 18.2.0
- **Bundler** : Vite 6.3.5
- **Styling** : Tailwind CSS 3.4.1 + @tailwindcss/forms
- **Routing** : React Router DOM 6.21.3
- **Icons** : Lucide React 0.511.0
- **État** : React Hooks (useState, useEffect) + localStorage
- **Build** : ES Modules + Hot Module Replacement

#### Backend et Infrastructure
- **BaaS** : Supabase (PostgreSQL + Auth + Storage)
- **Authentication** : Supabase Auth (@supabase/supabase-js 2.49.8)
- **Assistant IA** : Webhooks n8n (hub.cardin.cloud)
- **Déploiement** : Vercel
- **Gestion de versions** : Git + GitHub

#### Outils de Développement
- **Linting** : ESLint 9.25.0
- **CSS Processing** : PostCSS + Autoprefixer
- **Utils** : UUID 11.1.0 pour génération d'identifiants
- **Types** : JSDoc + PropTypes (à implémenter)

## Structure de l'Application

### Architecture des Fichiers (Réelle)
```
mon-equipe-ia-windsurf-v4/
├── public/
│   ├── images/                     # Assets statiques
│   │   ├── invest-malin-logo.png   # Logo principal
│   │   ├── assistant-formation*.png # Images assistants
│   │   ├── fiscaliste-ia.png       # Images assistants spécialisés
│   │   ├── legalbnb-ia.png
│   │   ├── negociateur-ia.png
│   │   └── hero-*.png              # Images d'interface
│   └── vite.svg
├── src/
│   ├── components/                 # Tous les composants React
│   │   ├── Home.jsx               # Landing page
│   │   ├── Login.jsx              # Authentification
│   │   ├── Inscription.jsx
│   │   ├── MotDePasseOublie.jsx
│   │   ├── MonCompte.jsx          # Dashboard v1
│   │   ├── MonCompte-v2.jsx       # Dashboard v2 amélioré
│   │   ├── AssistantFormation.jsx # Chat basique
│   │   ├── AssistantFormationWithHistory.jsx  # Chat avec historique
│   │   ├── AssistantFormationWithHistory-v3.jsx # Version avancée
│   │   ├── SidebarConversations.jsx # Navigation conversations
│   │   ├── AccountCreated.jsx     # Confirmations
│   │   ├── EmailConfirmation.jsx
│   │   ├── FAQ.jsx                # Pages légales
│   │   ├── MentionsLegales.jsx
│   │   ├── PolitiqueConfidentialite.jsx
│   │   ├── ConditionsUtilisation.jsx
│   │   ├── Navbar.jsx             # Navigation (non utilisé)
│   │   └── NotFound.jsx           # 404
│   ├── App.jsx                    # Configuration routes
│   ├── main.jsx                   # Point d'entrée
│   ├── supabaseClient.js          # Configuration Supabase
│   ├── App.css                    # Styles globaux
│   └── index.css                  # Tailwind imports
├── docs/                          # Documentation
│   ├── DESIGN_SYSTEM.md
│   ├── DEVELOPMENT_NOTES.md
│   ├── FEATURE_SPEC.md
│   └── TECHNICAL_SPEC.md
├── package.json                   # Dépendances
├── tailwind.config.js             # Config Tailwind
├── vite.config.js                 # Config Vite
├── vercel.json                    # Config déploiement
└── README.md
```

### Routing React Router
```jsx
// App.jsx - Configuration des routes
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/connexion" element={<Login />} />
  <Route path="/inscription" element={<Inscription />} />
  <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
  <Route path="/compte-cree" element={<AccountCreated />} />
  <Route path="/email-confirmation" element={<EmailConfirmation />} />
  
  <Route path="/mon-compte" element={<MonCompte />} />
  <Route path="/mon-compte-v2" element={<MonCompteV2 />} />
  
  <Route path="/mon-compte/assistant-formation" element={<AssistantFormation />} />
  <Route path="/mon-compte/assistant-formation-v2" element={<AssistantFormationWithHistory />} />
  <Route path="/mon-compte/assistant-formation-v3" element={<AssistantFormationWithHistoryV3 />} />
  
  {/* Pages légales */}
  <Route path="/faq" element={<FAQ />} />
  <Route path="/mentions-legales" element={<MentionsLegales />} />
  <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
  <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
  
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Base de Données (Supabase)

### Schéma Réel de la Base de Données

#### Table `users` (Personnalisée - Complément auth.users)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,             -- Même ID que auth.users
  prenom TEXT,                     -- Prénom utilisateur
  nom TEXT,                        -- Nom utilisateur  
  email TEXT,                      -- Email (dupliqué de auth.users)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Table `conversations` (Principale - Créée manuellement)
```sql
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                    -- Référence vers auth.users(id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT,                     -- 'assistant-formation', 'fiscaliste', etc.
  question TEXT,                   -- Message utilisateur
  answer TEXT,                     -- Réponse IA
  conversation_id UUID,            -- Identifiant de regroupement
  title TEXT                       -- Titre personnalisé (optionnel)
);

-- Index de performance (confirmés en production)
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_user_source ON conversations(user_id, source);
CREATE INDEX idx_conversations_conversation_id ON conversations(conversation_id);
```

#### Colonnes de la table `conversations`

| Colonne | Type | Description | Utilisation |
|---------|------|-------------|-------------|
| `id` | UUID | Clé primaire unique (gen_random_uuid()) | Identifiant de chaque entrée |
| `user_id` | UUID | Référence vers auth.users | Utilisateur propriétaire |
| `created_at` | TIMESTAMP | Horodatage (DEFAULT NOW()) | Tri chronologique |
| `source` | TEXT | Type d'assistant | 'assistant-formation', 'fiscaliste', 'legalbnb', 'negociateur' |
| `question` | TEXT | Message utilisateur | Stockage des questions posées |
| `answer` | TEXT | Réponse IA | Stockage des réponses générées |
| `conversation_id` | UUID | Identifiant de regroupement | Groupe les échanges d'une session |
| `title` | TEXT | Titre personnalisé | Renommage des conversations (optionnel) |

#### Colonnes de la table `users`

| Colonne | Type | Description | Utilisation |
|---------|------|-------------|-------------|
| `id` | UUID | Clé primaire (même que auth.users) | Lien avec authentification |
| `prenom` | TEXT | Prénom utilisateur | Données personnelles |
| `nom` | TEXT | Nom utilisateur | Données personnelles |
| `email` | TEXT | Email (dupliqué) | Backup/recherche |
| `created_at` | TIMESTAMP | Date création (DEFAULT NOW()) | Suivi temporel |

### Politiques de Sécurité (RLS) - Configuration Actuelle
```sql
-- RLS activé sur les deux tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politiques conversations (confirmées)
CREATE POLICY "Allow insert for all" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can access their own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Politique users (confirmée)  
CREATE POLICY "Users can access their own record" ON users
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

### Requêtes SQL Utilisées dans l'Application

#### Insertion d'un nouveau message
```sql
-- Code : supabase.from('conversations').insert({...})
INSERT INTO conversations (user_id, source, question, answer, conversation_id)
VALUES ($1, 'assistant-formation', $2, $3, $4);
```

#### Récupération de l'historique d'une conversation
```sql
-- Code : .select('question, answer, created_at').eq('conversation_id', id)
SELECT question, answer, created_at 
FROM conversations 
WHERE conversation_id = $1 AND user_id = $2
ORDER BY created_at ASC;
```

#### Liste des conversations pour la sidebar
```sql
-- Code : .select('conversation_id, question, created_at, title')
SELECT DISTINCT conversation_id, question, created_at, title
FROM conversations 
WHERE source = 'assistant-formation' AND user_id = $1
ORDER BY created_at DESC;
```

#### Suppression d'une conversation complète
```sql
-- Code : .delete().eq('conversation_id', conversationId)
DELETE FROM conversations 
WHERE conversation_id = $1 AND user_id = $2;
```

#### Renommage d'une conversation
```sql
-- Code : .update({ title: newTitle }).eq('conversation_id', id)
UPDATE conversations 
SET title = $1 
WHERE conversation_id = $2 AND user_id = $3;
```

## Intégrations Externes

### Webhook n8n (Assistant Formation)
```javascript
// URL actuelle : https://hub.cardin.cloud/webhook/3bab9cc1-054f-4f06-b192-3baac53aa367
// Méthode : POST
// Headers : Content-Type: application/json
// Body : { "message": "contexte des 10 derniers messages formatés" }
// Réponse : { "output": "réponse de l'IA" }

const res = await fetch('https://hub.cardin.cloud/webhook/3bab9cc1-054f-4f06-b192-3baac53aa367', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: fullPrompt })
})
```

### Supabase Configuration
```javascript
// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Variables d'Environnement
```env
# Supabase (Production)
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]

# Application
VITE_APP_URL=https://mon-equipe-ia.vercel.app

# Webhooks n8n (À venir)
VITE_FISCALISTE_WEBHOOK_URL=
VITE_LEGALBNB_WEBHOOK_URL=
VITE_NEGOCIATEUR_WEBHOOK_URL=

# Stripe (À implémenter)
VITE_STRIPE_PUBLISHABLE_KEY=
```

## Gestion d'État et Persistance

### État Local (React)
```javascript
// Chaque composant gère son état localement
const [messages, setMessages] = useState([])           // Messages du chat actuel
const [input, setInput] = useState('')                 // Champ de saisie
const [loading, setLoading] = useState(false)          // État chargement
const [userId, setUserId] = useState(null)             // ID utilisateur connecté
const [conversations, setConversations] = useState([]) // Liste conversations sidebar
```

### Persistance Données
```javascript
// localStorage : ID de conversation active
localStorage.setItem('conversation_id', uuidv4())

// Supabase : Persistance permanente
await supabase.from('conversations').insert({...})

// SessionStorage : Non utilisé
// Cookies : Gérés par Supabase Auth
```

### Flux de Données
```
1. Utilisateur tape message → useState local
2. Envoi vers webhook n8n → fetch API
3. Réponse IA reçue → useState + Supabase
4. Affichage temps réel → React re-render
5. Historique persisté → Base de données
6. Reload page → Récupération depuis Supabase
```

## Authentification et Sécurité

### Supabase Auth
```javascript
// Inscription
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password
})

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
})

// Récupération utilisateur actuel
const { data: { user } } = await supabase.auth.getUser()

// Déconnexion
const { error } = await supabase.auth.signOut()
```

### Sécurité Implémentée
- **HTTPS** : Chiffrement en transit (Vercel)
- **RLS** : Row Level Security sur table conversations
- **JWT** : Tokens gérés par Supabase Auth
- **CORS** : Configuration automatique Supabase
- **Validation** : Côté client (formulaires) + côté serveur (Supabase)

### Sécurité À Implémenter
- [ ] Rate limiting sur webhooks n8n
- [ ] Validation stricte des inputs (XSS)
- [ ] Logs de sécurité (tentatives connexion)
- [ ] Monitoring des erreurs
- [ ] Backup automatisé base de données

## Performance et Optimisation

### Frontend Optimisations Actuelles
```javascript
// Code splitting automatique (Vite)
// Lazy loading des composants (à implémenter)
// Cache navigateur (assets statiques)
// Minification CSS/JS en production
```

### Optimisations Base de Données
```sql
-- Index sur colonnes fréquemment requêtées
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_conversation_id ON conversations(conversation_id);

-- Limite de résultats pour éviter surcharge
SELECT * FROM conversations LIMIT 50;
```

### Métriques de Performance
- **First Contentful Paint** : < 1.5s (objectif)
- **Largest Contentful Paint** : < 2.5s (objectif)
- **Time to Interactive** : < 3s (objectif)
- **Bundle size** : ~500KB (actuel)

## Monitoring et Logs

### Logs Actuels
```javascript
// Console errors dans les catch blocks
console.error('Erreur Supabase:', error)

// Logs de debug en développement
console.log('Message envoyé:', input)
console.log('Réponse n8n:', data)
```

### Monitoring À Implémenter
- [ ] Sentry pour tracking erreurs
- [ ] Analytics usage (Google Analytics)
- [ ] Métriques business (conversations par jour)
- [ ] Alertes uptime (webhook n8n)
- [ ] Dashboard admin temps réel

## Déploiement et Infrastructure

### Configuration Vercel
```json
// vercel.json (configuration réelle)
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Build Production
```bash
# Commandes de déploiement
npm run build        # Génère dist/ optimisé
npm run preview      # Test build local
npm run deploy       # Deploy GitHub Pages (alternatif)

# Variables d'environnement Vercel
VITE_SUPABASE_URL=production_url
VITE_SUPABASE_ANON_KEY=production_key
```

### CI/CD
- **Déploiement automatique** : Git push → Vercel rebuild
- **Preview deployments** : Branches feature → URLs temporaires
- **Tests** : À implémenter (npm run test)
- **Linting** : npm run lint (ESLint)

## API Endpoints et Intégrations

### Supabase Auto-générées
```
# Authentication
POST /auth/v1/signup
POST /auth/v1/token (login)
POST /auth/v1/logout
POST /auth/v1/recover (reset password)

# Database REST API
GET /rest/v1/conversations
POST /rest/v1/conversations
PATCH /rest/v1/conversations
DELETE /rest/v1/conversations
```

### Webhooks n8n
```
# Assistant Formation (Actuel)
POST https://hub.cardin.cloud/webhook/3bab9cc1-054f-4f06-b192-3baac53aa367

# Assistants Payants (À recevoir)
POST [URL_FISCALISTE]
POST [URL_LEGALBNB] 
POST [URL_NEGOCIATEUR]
```

### Future API Stripe
```
# Paiements (À implémenter)
POST /api/stripe/create-checkout-session
POST /api/stripe/webhook
GET /api/stripe/customer-portal
```

## Tests et Qualité

### Tests Actuels
- **Linting** : ESLint configuration React
- **Type checking** : JavaScript vanilla (TypeScript recommandé)
- **Tests unitaires** : Aucun (Vitest recommandé)
- **Tests E2E** : Aucun (Playwright recommandé)

### Tests À Implémenter
```javascript
// Tests unitaires composants
import { render, screen } from '@testing-library/react'
import Login from './Login'

test('renders login form', () => {
  render(<Login />)
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
})

// Tests intégration Supabase
test('user can create conversation', async () => {
  // Test flow complet inscription → chat → historique
})
```

## Roadmap Technique

### Phase 1 : Assistants Payants (En cours)
1. **Réception webhooks n8n** pour 3 assistants spécialisés
2. **Création composants** FiscalisteIA.jsx, LegalBNB.jsx, NegociateurIA.jsx
3. **Mise à jour table conversations** avec nouveaux types de source
4. **Routes protégées** selon statut utilisateur

### Phase 2 : Système de Paiement
1. **Intégration Stripe** - Checkout Sessions + Webhooks
2. **Extension schéma** - Ajout colonnes subscription dans auth.users
3. **Middleware protection** - Vérification abonnement avant accès assistants
4. **Interface billing** - Gestion abonnements utilisateur

### Phase 3 : Optimisations et Features
1. **Migration TypeScript** - Amélioration robustesse code
2. **Tests automatisés** - Vitest + Testing Library + Playwright  
3. **Performance** - Code splitting, lazy loading, caching
4. **Features avancées** - Export PDF, recherche, favoris

### Phase 4 : Scale et Analytics
1. **Monitoring complet** - Sentry, analytics, métriques business
2. **Dashboard admin** - Gestion utilisateurs, statistiques
3. **Optimisation BDD** - Partitioning, indexing avancé
4. **CDN assets** - Optimisation chargement images

---

**Maintenu par** : Équipe Technique Invest Malin  
**Dernière mise à jour** : [Date actuelle]  
**Version** : v4 (Windsurf)  
**Environnement** : Production Vercel + Supabase