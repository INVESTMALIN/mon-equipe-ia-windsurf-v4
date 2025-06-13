# Spécifications Techniques

## Pile Technique

### Frontend
- **Framework**: React 18
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **État**: React Hooks + Context API
- **UI Components**: Composants personnalisés

### Backend
- **Base de données**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Supabase REST API
- **Stockage**: Supabase Storage

### Infrastructure
- **Hébergement**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics

## Architecture

### Structure des Composants
```
src/
├── components/
│   ├── auth/           # Composants d'authentification
│   ├── assistants/     # Composants des assistants IA
│   ├── layout/         # Composants de mise en page
│   └── shared/         # Composants partagés
├── hooks/              # Hooks personnalisés
├── context/            # Contextes React
├── utils/              # Utilitaires
└── services/           # Services (API, etc.)
```

## Modèles de Données

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  role TEXT DEFAULT 'concierge',
  subscription_status TEXT DEFAULT 'free'
);
```

### Conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  assistant_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT,
  status TEXT DEFAULT 'active'
);
```

### Messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Points d'Extrémité API

### Authentication
- `POST /auth/signup` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `POST /auth/reset-password` - Réinitialisation mot de passe

### Conversations
- `GET /conversations` - Liste des conversations
- `POST /conversations` - Créer une conversation
- `GET /conversations/:id` - Détails d'une conversation
- `POST /conversations/:id/messages` - Ajouter un message

### Assistants
- `GET /assistants` - Liste des assistants disponibles
- `POST /assistants/:id/chat` - Interagir avec un assistant

## Services Externes

### Supabase
- Authentication
- Base de données PostgreSQL
- Stockage de fichiers
- Fonctions Edge

### OpenAI
- GPT-4 pour les assistants IA
- Embeddings pour la recherche sémantique

### Vercel
- Hébergement
- CDN
- Analytics

## Sécurité

### Authentification
- JWT via Supabase
- Sessions sécurisées
- Protection CSRF

### Données
- Chiffrement en transit (HTTPS)
- Validation des entrées
- Sanitization des sorties

## Performance

### Optimisations
- Code splitting
- Lazy loading des composants
- Mise en cache des requêtes
- Optimisation des images

### Monitoring
- Métriques de performance
- Logs d'erreurs
- Analytics utilisateur 