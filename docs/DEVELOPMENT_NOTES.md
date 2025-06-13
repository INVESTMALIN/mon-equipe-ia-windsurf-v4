# Notes de Développement

## Installation

### Prérequis
- Node.js (v18 ou supérieur)
- npm (v9 ou supérieur)
- Git

### Installation Locale
```bash
# Cloner le repository
git clone https://github.com/votre-org/mon-equipe-ia-windsurf-v4.git

# Accéder au dossier
cd mon-equipe-ia-windsurf-v4

# Installer les dépendances
npm install
```

## Configuration

### Variables d'Environnement
Créez un fichier `.env` à la racine du projet :

```env
# Supabase
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase

# OpenAI
VITE_OPENAI_API_KEY=votre_clé_api_openai

# Autres
VITE_APP_URL=http://localhost:5173
```

### Configuration de Supabase
1. Créer un projet sur Supabase
2. Configurer l'authentification
3. Créer les tables nécessaires
4. Configurer les politiques de sécurité

## Développement

### Lancer le Serveur de Développement
```bash
npm run dev
```

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
```

## Déploiement

### Vercel
1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Build de Production
```bash
npm run build
```

## Structure du Projet

### Organisation des Fichiers
```
src/
├── components/     # Composants React
├── hooks/         # Hooks personnalisés
├── context/       # Contextes React
├── utils/         # Utilitaires
└── services/      # Services (API, etc.)
```

### Conventions de Nommage
- Composants : PascalCase (ex: `UserProfile.jsx`)
- Hooks : camelCase avec préfixe 'use' (ex: `useAuth.js`)
- Utilitaires : camelCase (ex: `formatDate.js`)
- Styles : kebab-case (ex: `user-profile.css`)

## Problèmes Connus

### 1. Authentification
- [ ] Gestion des sessions expirées
- [ ] Refresh token automatique
- [ ] Validation des emails

### 2. Performance
- [ ] Optimisation des requêtes API
- [ ] Mise en cache des réponses
- [ ] Chargement des images

### 3. UI/UX
- [ ] Responsive sur certains composants
- [ ] Animations sur mobile
- [ ] Accessibilité

## Bonnes Pratiques

### Code
- Utiliser les hooks React
- Éviter les props drilling
- Implémenter la gestion d'erreurs
- Documenter les composants

### Git
- Commits atomiques
- Messages de commit descriptifs
- Branches feature/fix
- Pull requests documentées

### Tests
- Tests unitaires pour les composants
- Tests d'intégration pour les flux
- Tests E2E pour les scénarios critiques

## Ressources

### Documentation
- [React Documentation](https://reactjs.org/)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

### Outils
- [VS Code](https://code.visualstudio.com/)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Supabase Studio](https://app.supabase.io)

## Support

### Contact
- Email : support@mon-equipe-ia.com
- Slack : #mon-equipe-ia-support

### Contribution
1. Fork le repository
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Créer une Pull Request 