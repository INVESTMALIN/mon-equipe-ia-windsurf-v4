# Notes de Développement - Mon Équipe IA

## Vue d'ensemble
Application React moderne pour Mon Équipe IA, plateforme d'assistants IA pour la gestion de conciergerie immobilière Invest Malin.

## Installation

### Prérequis
- **Node.js** v18 ou supérieur
- **npm** v9 ou supérieur  
- **Git**

### Installation Locale
```bash
# Cloner le repository
git clone [URL_DU_REPOSITORY]

# Accéder au dossier
cd mon-equipe-ia-windsurf-v4

# Installer les dépendances
npm install
```

## Configuration

### Variables d'Environnement
Créez un fichier `.env` à la racine du projet :

```env
# Supabase (obligatoire)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application
VITE_APP_URL=http://localhost:5173

# Webhooks n8n (pour les assistants payants) - En attente
VITE_FISCALISTE_WEBHOOK_URL=your_n8n_fiscaliste_webhook
VITE_LEGALBNB_WEBHOOK_URL=your_n8n_legalbnb_webhook  
VITE_NEGOCIATEUR_WEBHOOK_URL=your_n8n_negociateur_webhook

# Stripe - SANDBOX PERSONNEL DE JULIEN ⚠️
# Configuration de test uniquement, à remplacer en production
STRIPE_SECRET_KEY=sk_test_51RpjzBH8DRxW0tWai2z...     # Secret key côté serveur
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RpjzBH8DRxW0tWa93d3l8hLLdN1X7VFAU...  # Public key côté client
```

**⚠️ IMPORTANT STRIPE :**
- Actuellement configuré avec le **Sandbox personnel de Julien** sur son compte Stripe personnel
- **Environnement de test uniquement** - toutes les transactions sont factices
- À migrer vers le compte Stripe d'Invest Malin en production
- Customer Portal configuré en mode test

### Configuration de Supabase
1. Créer un projet sur [Supabase](https://supabase.com)
2. Configurer l'authentification (email/password)
3. Créer les tables nécessaires (voir section Base de données)
4. Configurer les Row Level Security (RLS) policies
5. Récupérer URL et clé anonyme du projet

### Base de données - Extension pour Stripe
Tables créées et extensions ajoutées :

```sql
-- Table users étendue pour Stripe
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN subscription_current_period_end TIMESTAMP;

-- Index pour performance
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_subscription_end ON users(subscription_current_period_end);
```

États `subscription_status` possibles :
- `free` : Utilisateur gratuit (défaut)
- `premium` : Abonnement actif et payé
- `expired` : Abonnement annulé ou paiement échoué

## Développement

### Scripts disponibles
```bash
# Lancer le serveur de développement
npm run dev

# Linting du code
npm run lint

# Build de production
npm run build

# Aperçu du build
npm run preview

# Préparer le déploiement
npm run predeploy

# Déployer sur GitHub Pages
npm run deploy
```

### Structure du projet actuelle
```
mon-equipe-ia-windsurf-v4/
│
├── api/
│   ├── create-checkout-session.js
│   ├── create-portal-session.js
│   └── webhook.js
│
├── docs/
│   ├── AJOUT_SECTIONS.md
│   ├── CLAUDE.md
│   ├── DESIGN_SYSTEM.md
│   ├── DEVELOPMENT_NOTES.md
│   ├── FEATURE_SPEC.md
│   ├── FICHE_LOGEMENT_LITE.md
│   ├── PAYWALL_PLAN.md
│   ├── PROJET_VUE_DENSEMBLE.md
│   └── TECHNICAL_SPEC.md
│
├── public/
│   ├── 404.html
│   └── images/
│       └── ... (plusieurs images)
│   ├── sparkles-icon.svg
│   └── vite.svg
│
├── src/
│   ├── App.jsx
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── AccountCreated.jsx
│   │   ├── AssistantAnnonce.jsx
│   │   ├── AssistantFormation.jsx
│   │   ├── AssistantJuridique.jsx
│   │   ├── AssistantNegociateur.jsx
│   │   ├── Assistants.jsx
│   │   ├── AssistantsBackup.jsx
│   │   ├── ChangePasswordModal.jsx
│   │   ├── ComingSoon.jsx
│   │   ├── ConditionsUtilisation.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EmailConfirmation.jsx
│   │   ├── FAQ.jsx
│   │   ├── fiche/
│   │   │   ├── FicheWizard.jsx
│   │   │   ├── MiniDashboard.jsx
│   │   │   ├── NavigationButtons.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── SidebarMenu.jsx
│   │   │   └── sections/
│   │   │       ├── FicheAirbnb.jsx
│   │   │       ├── FicheAvis.jsx
│   │   │       ├── FicheBebe.jsx
│   │   │       ├── FicheBooking.jsx
│   │   │       ├── FicheChambre.jsx
│   │   │       ├── FicheClefs.jsx
│   │   │       ├── FicheCommuns.jsx
│   │   │       ├── FicheConsommables.jsx
│   │   │       ├── FicheCuisine1.jsx
│   │   │       ├── FicheCuisine2.jsx
│   │   │       ├── FicheEquipements.jsx
│   │   │       ├── FicheEquipExterieur.jsx
│   │   │       ├── FicheExigences.jsx
│   │   │       ├── FicheFinalisation.jsx
│   │   │       ├── FicheForm.jsx
│   │   │       ├── FicheGestionLinge.jsx
│   │   │       ├── FicheGuideAcces.jsx
│   │   │       ├── FicheLogement.jsx
│   │   │       ├── FicheReglementation.jsx
│   │   │       ├── FicheSalleDeBains.jsx
│   │   │       ├── FicheSalonSam.jsx
│   │   │       ├── FicheSécurité.jsx
│   │   │       ├── FicheTeletravail.jsx
│   │   │       └── FicheVisite.jsx
│   │   ├── FormContext.jsx
│   │   ├── Home.jsx
│   │   ├── Inscription.jsx
│   │   ├── Login.jsx
│   │   ├── MentionsLegales.jsx
│   │   ├── MonCompte.jsx
│   │   ├── MotDePasseOublie.jsx
│   │   ├── NotFound.jsx
│   │   ├── NouveauMotDePasse.jsx
│   │   ├── PolitiqueConfidentialite.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SidebarConversations.jsx
│   │   ├── TestStripe.jsx
│   │   └── UpgradeRequired.jsx
│   ├── hooks/
│   │   └── useProgressiveLoading.js
│   ├── index.css
│   ├── lib/
│   │   ├── AlerteDetector.js
│   │   ├── DataProcessor.js
│   │   ├── PdfBuilder.js
│   │   ├── PdfFormatter.js
│   │   └── supabaseHelpers.js
│   ├── main.jsx
│   └── supabaseClient.js
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

## Technologies et dépendances

### Dépendances principales
```json
{
  "@supabase/auth-helpers-react": "^0.5.0",
  "@supabase/supabase-js": "^2.49.8",
  "@tailwindcss/forms": "^0.5.7",
  "lucide-react": "^0.511.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.3",
  "stripe": "^18.0.0",             // ✅ NOUVEAU - API Stripe côté serveur
  "tailwindcss": "^3.4.1",
  "uuid": "^11.1.0"
}
```

### Dépendances de développement
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "eslint": "^9.25.0",
  "vite": "^6.3.5",
  "gh-pages": "^6.0.0"
}
```

## Déploiement

### Vercel (recommandé)
1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement dans l'interface Vercel :
   - Variables Supabase
   - Variables Stripe (Sandbox de Julien pour le moment)
   - Cocher "All Environments" pour chaque variable
3. Déploiement automatique à chaque push sur `main`

**⚠️ Variables Vercel critiques :**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
STRIPE_SECRET_KEY=sk_test_...                    # NE PAS préfixer VITE_
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...          # Préfixer VITE_
```

### GitHub Pages (alternatif)
```bash
npm run deploy
```

### Build de production
```bash
npm run build
# Génère le dossier dist/ optimisé pour la production
```

## Architecture technique

### Frontend
- **React 18** : Interface utilisateur
- **React Router v6** : Navigation et routing
- **Tailwind CSS** : Styling et responsive design
- **Lucide React** : Bibliothèque d'icônes
- **Vite** : Bundler et serveur de développement

### Backend
- **Supabase** : 
  - Authentification (email/password, sessions)
  - Base de données PostgreSQL
  - Policies de sécurité (Row Level Security)
  - API auto-générée

### Intégrations externes
- **n8n webhooks** : Assistants IA spécialisés (en attente)
- **Stripe Customer Portal** : Gestion abonnements ✅ OPÉRATIONNEL
- **API Vercel** : Endpoint `/api/create-portal-session` ✅ OPÉRATIONNEL

### Stripe - Configuration actuelle
- **Mode** : Test/Sandbox sur compte personnel Julien
- **Customer Portal** : Activé avec gestion factures, paiements, annulations
- **Produit** : "Plan Premium Mon Équipe IA - 4,90€/mois" créé
- **Payment Link** : Configuré pour les upgrades
- **API** : Intégration complète pour sessions portal

## Conventions de nommage

### Fichiers et composants
- **Composants React** : PascalCase (`AssistantFormation.jsx`)
- **API Routes** : kebab-case (`create-portal-session.js`)
- **Assets** : kebab-case (`assistant-formation.png`, `invest-malin-logo.png`)

### Routes
- Pages principales : `/`, `/connexion`
- Espace utilisateur : `/mon-compte`, `/assistants`, `/inscription`
- Assistants : `/assistant-formation`, `/fiscaliste`, `/legalbnb`, `/negociateur`
- Paywall : `/upgrade`
- Pages légales : `/mentions-legales`, `/politique-confidentialite`

### CSS et Styling
- Classes Tailwind directes : `bg-[#dbae61]`, `hover:bg-[#c49a4f]`
- Couleurs hex complètes plutôt que raccourcis
- Mobile-first : classes sans préfixe pour mobile, `md:` pour desktop

## Fonctionnalités implémentées ✅

### 1. Authentification Supabase
- Inscription/connexion avec email/password
- Gestion des sessions
- Reset de mot de passe
- Redirections automatiques

### 2. Assistant Formation
- Chat conversationnel avec n8n webhook
- Historique des conversations
- Sidebar de navigation
- Sauvegarde en base Supabase

### 3. Stripe Customer Portal
- API endpoint `/api/create-portal-session` fonctionnel
- Intégration complète dans `MonCompte.jsx`
- Gestion des statuts d'abonnement (`free`, `premium`, `expired`)
- Interface utilisateur adaptative selon le statut
- Redirection vers portal Stripe pour gestion factures/paiements

### 4. Interface utilisateur
- Page d'accueil avec présentation des assistants
- Dashboard utilisateur (`Assistants.jsx`)
- Page compte enrichie avec statistiques et accès rapide
- Design system cohérent (couleur dorée #dbae61)
- Responsive mobile-first

## Problèmes connus et limitations

### 1. Stripe (Sandbox)
- [ ] **Migration nécessaire** vers compte Stripe Invest Malin en production
- [ ] **Webhooks manquants** pour automatiser les changements de statut
- [ ] **Tests complets** du cycle de vie abonnement

### 2. Assistants IA
- [ ] **Webhooks n8n manquants** pour les 3 assistants payants
- [ ] **Pages de chat individuelles** à créer (Fiscaliste, LegalBNB, Négociateur)
- [ ] **Gestion des erreurs** webhook (timeout, indisponibilité)

### 3. API et Performance
- [ ] **Rate limiting** des requêtes vers assistants
- [ ] **Optimisation** des requêtes Supabase
- [ ] **Tests automatisés** pour les APIs

### 4. UX/UI
- [ ] **Amélioration responsive** sur certains composants
- [ ] **Animations** et transitions plus fluides
- [ ] **États de chargement** plus visuels

## Tests et qualité

### Linting
```bash
npm run lint
# Utilise ESLint avec la configuration React
```

### Tests (à implémenter)
- [ ] Tests unitaires avec Vitest
- [ ] Tests d'intégration React Testing Library
- [ ] Tests E2E avec Playwright
- [ ] Tests spécifiques Stripe (webhook simulation)

## Bonnes pratiques

### Code React
- Utiliser les hooks React (`useState`, `useEffect`)
- Composants fonctionnels uniquement
- Props validation avec PropTypes (à ajouter)
- Gestion d'erreurs avec Error Boundaries (à implémenter)

### Gestion d'état
- État local avec `useState` pour les composants
- Pas de Context API complexe (simplicité préférée)
- Communication directe avec Supabase

### Supabase
- Toujours utiliser Row Level Security (RLS)
- Requêtes optimisées avec `.select()` spécifique
- Gestion des erreurs Supabase dans try/catch

### Stripe
- **Séparer les clés** : STRIPE_SECRET_KEY (serveur) vs VITE_STRIPE_PUBLISHABLE_KEY (client)
- **Tester en production** : Les APIs Vercel ne fonctionnent qu'en déploiement
- **Sécurité** : Valider les webhooks avec signatures Stripe

### Git
- Commits atomiques et descriptifs
- Branches feature pour nouvelles fonctionnalités
- Pull requests avec review

## Ressources et documentation

### Documentation technique
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://docs.stripe.com/)
- [Stripe Customer Portal](https://docs.stripe.com/customer-management/integrate-customer-portal)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Router Documentation](https://reactrouter.com/)

### Outils de développement recommandés
- **VS Code** avec extensions :
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier
- **React Developer Tools** (extension navigateur)
- **Supabase Studio** pour gestion BDD
- **Stripe Dashboard** pour gestion paiements

### Assets et design
- **Lucide Icons** : [lucide.dev](https://lucide.dev/)
- **Tailwind UI** : Composants d'inspiration
- **Invest Malin Branding** : Respecter la charte graphique dorée (#dbae61)

## Environnements

### Développement
- URL : `http://localhost:5173`
- Hot reload activé
- Source maps disponibles
- Console de debug Supabase
- **APIs Stripe** : Ne fonctionnent qu'en production Vercel

### Production
- URL : Déployé sur Vercel
- Build optimisé et minifié
- Variables d'environnement sécurisées
- Monitoring des erreurs (à implémenter)
- **APIs Stripe** : Fonctionnelles

### Stripe Sandbox (Actuel)
- **Compte** : Personnel de Julien
- **Mode** : Test uniquement
- **Customer Portal** : https://billing.stripe.com/p/login/test_...
- **Dashboard** : Mode Sandbox activé

## Migration Production

### Checklist Stripe
- [ ] **Créer compte Stripe Invest Malin** ou obtenir accès
- [ ] **Recréer produit 4,90€/mois** en mode live
- [ ] **Configurer Customer Portal** en mode live
- [ ] **Mettre à jour variables** Vercel avec nouvelles clés
- [ ] **Configurer webhooks** pour automation abonnements
- [ ] **Tests complets** cycle de paiement

## Support et contact

### Issues et bugs
- Utiliser les GitHub Issues du repository
- Template de rapport de bug à créer

### Contribution
1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

### Roadmap technique
- [ ] Migration vers TypeScript
- [ ] Ajout de tests automatisés
- [ ] Intégration CI/CD
- [ ] Monitoring et analytics
- [ ] PWA (Progressive Web App)

---

**Dernière mise à jour** : 28 juillet 2025  
**Version du projet** : v4  
**Maintenu par** : Julien - Équipe Invest Malin  
**Status Stripe** : Sandbox personnel - Migration production à prévoir