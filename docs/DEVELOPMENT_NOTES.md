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

# Webhooks n8n (pour les assistants payants)
VITE_FISCALISTE_WEBHOOK_URL=your_n8n_fiscaliste_webhook
VITE_LEGALBNB_WEBHOOK_URL=your_n8n_legalbnb_webhook  
VITE_NEGOCIATEUR_WEBHOOK_URL=your_n8n_negociateur_webhook

# Stripe (pour le paywall)
VITE_STRIPE_PUBLISHABLE_KEY=k_test_51Rq1ETRI...
STRIPE_SECRET_KEY=sk_test_51Rq1ETRIbFu...
```

### Configuration de Supabase
1. Créer un projet sur [Supabase](https://supabase.com)
2. Configurer l'authentification (email/password)
3. Créer la table nécessaire :
   - `conversations` (stockage des questions/réponses et historique)
4. Configurer les Row Level Security (RLS) policies
5. Récupérer URL et clé anonyme du projet

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
├── public/
│   ├── images/           # Assets statiques
│   └── vite.svg
├── src/
│   ├── components/       # Composants React uniquement
│   ├── App.jsx          # Configuration des routes
│   ├── main.jsx         # Point d'entrée
│   ├── supabaseClient.js # Configuration Supabase
│   ├── App.css
│   └── index.css
├── docs/                # Documentation
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json          # Configuration Vercel
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
2. Configurer les variables d'environnement dans l'interface Vercel
3. Déploiement automatique à chaque push sur `main`

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
- **n8n webhooks** : Assistants IA spécialisés
- **Stripe** : Système de paiement (à intégrer)

## Conventions de nommage

### Fichiers et composants
- **Composants React** : PascalCase (`AssistantFormation.jsx`)
- **Versions multiples** : Suffixe explicite (`Assistants.jsx`, `AssistantFormation.jsx`)
- **Assets** : kebab-case (`assistant-formation.png`, `invest-malin-logo.png`)

### Routes
- Pages principales : `/`, `/connexion`
- Espace utilisateur : `/mon-compte`,  `/inscription`
- Assistants : `/assistant-formation`, `/fiscaliste`
- Pages légales : `/mentions-legales`, `/politique-confidentialite`

### CSS et Styling
- Classes Tailwind directes : `bg-[#dbae61]`, `hover:bg-[#c49a4f]`
- Couleurs hex complètes plutôt que raccourcis
- Mobile-first : classes sans préfixe pour mobile, `md:` pour desktop

## Problèmes connus et limitations

### 1. Authentification
- [ ] Gestion de l'expiration des sessions Supabase
- [ ] Refresh automatique des tokens
- [ ] Validation robuste des emails

### 2. Assistants IA
- [ ] Intégration des webhooks n8n pour les 3 assistants payants
- [ ] Gestion des erreurs de webhook (timeout, indisponibilité)
- [ ] Rate limiting des requêtes vers les assistants

### 3. Paywall Stripe
- [ ] Intégration complète du système de paiement
- [ ] Gestion des abonnements et renouvellements
- [ ] Interface d'administration des paiements

### 4. Performance
- [ ] Optimisation du chargement des images (lazy loading)
- [ ] Mise en cache des conversations
- [ ] Optimisation des requêtes Supabase

### 5. UX/UI
- [ ] Amélioration du responsive sur certains composants
- [ ] Animations et transitions plus fluides
- [ ] États de chargement plus visuels

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

## Bonnes pratiques

### Code React
- Utiliser les hooks React (`useState`, `useEffect`)
- Composants fonctionnels uniquement
- Props validation avec PropTypes (à ajouter)
- Gestion d'erreurs avec Error Boundaries (à implémenter)

### Gestion d'état
- État local avec `useState` pour les composants
- Contexte React pour l'authentification (à implémenter)
- Pas de Redux nécessaire pour cette taille d'app

### Supabase
- Toujours utiliser Row Level Security (RLS)
- Requêtes optimisées avec `.select()` spécifique
- Gestion des erreurs Supabase dans try/catch

### Git
- Commits atomiques et descriptifs
- Branches feature pour nouvelles fonctionnalités
- Pull requests avec review

## Ressources et documentation

### Documentation technique
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
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

### Production
- URL : [À définir selon déploiement]
- Build optimisé et minifié
- Variables d'environnement sécurisées
- Monitoring des erreurs (à implémenter)

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

**Dernière mise à jour** : 21 juillet 2025 
**Version du projet** : v4
**Mainteneur** : Équipe Invest Malin