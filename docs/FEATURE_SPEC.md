# Spécifications des Fonctionnalités - Mon Équipe IA

## Vue d'ensemble
Application web pour Mon Équipe IA, plateforme d'assistants IA dédiée aux clients Invest Malin pour la gestion de conciergerie immobilière locative.

## Histoires d'Utilisateurs

### 1. Authentification et Gestion de Compte
- **En tant que nouveau concierge**, je veux créer un compte pour accéder à la plateforme d'assistants IA
- **En tant qu'utilisateur existant**, je veux me connecter à mon compte rapidement
- **En tant qu'utilisateur**, je veux réinitialiser mon mot de passe si je l'oublie
- **En tant qu'utilisateur connecté**, je veux accéder à mon tableau de bord personnalisé

### 2. Assistant de Formation (Public/Gratuit)
- **En tant que concierge**, je veux poser des questions sur la formation Invest Malin
- **En tant que concierge**, je veux accéder à l'historique de mes conversations précédentes
- **En tant que concierge**, je veux recevoir des réponses personnalisées basées sur la documentation
- **En tant que concierge**, je veux pouvoir créer de nouvelles conversations facilement

### 3. Assistants Thématiques Payants
- **En tant que concierge Premium**, je veux accéder à l'assistant Fiscaliste IA pour mes questions fiscales
- **En tant que concierge Premium**, je veux accéder à LegalBNB pour les aspects légaux
- **En tant que concierge Premium**, je veux accéder au Négociateur IA pour l'aide à la négociation
- **En tant que concierge freemium**, je veux voir un aperçu des assistants payants avec option d'upgrade

### 4. Expérience Landing Page
- **En tant que visiteur**, je veux comprendre rapidement la valeur des assistants IA
- **En tant que prospect**, je veux voir les différents assistants disponibles
- **En tant que client Invest Malin**, je veux accéder facilement à la connexion

## Statut des Fonctionnalités

### ✅ Implémenté et Fonctionnel

#### 1. Système d'Authentification
- [x] **Inscription** (`Inscription.jsx`) - Création de compte avec email/mot de passe
- [x] **Connexion** (`Login.jsx`) - Authentification via Supabase
- [x] **Réinitialisation de mot de passe** (`MotDePasseOublie.jsx`) - Reset par email
- [x] **Confirmation d'email** (`EmailConfirmation.jsx`) - Validation des comptes
- [x] **Gestion de sessions** - Persistance via Supabase Auth

#### 2. Landing Page et Navigation
- [x] **Page d'accueil publique** (`Home.jsx`) - Présentation des 4 assistants
- [x] **Design responsive** - Mobile-first avec Tailwind CSS
- [x] **Navigation fluide** - React Router v6 pour toutes les routes
- [x] **Pages légales** - CGU, politique de confidentialité, mentions légales

#### 3. Assistant de Formation Opérationnel
- [x] **Interface de chat** (`AssistantFormation.jsx`)
- [x] **Historique des conversations** - Stockage et récupération Supabase
- [x] **Sidebar de conversations** (`SidebarConversations.jsx`) - Navigation entre discussions
- [x] **Nouvelle conversation** - Bouton pour créer une session fraîche
- [x] **Webhook n8n** - Intégration fonctionnelle pour les réponses IA
- [x] **Persistance** - Sauvegarde automatique en base de données

#### 4. Tableau de Bord Utilisateur
- [x] **Mon Compte** (`MonCompte.jsx`) - Espace utilisateur
- [x] **Assistants** (`Assistants.jsx`) - Accueil des assistants
- [x] **Accès direct Assistant Formation** - Lien vers l'assistant fonctionnel

### ⏳ En Attente d'Intégration

#### 1. Assistants Thématiques Payants
- [ ] **Fiscaliste IA** - Webhook n8n à recevoir
- [ ] **LegalBNB** - Webhook n8n à recevoir  
- [ ] **Négociateur IA** - Webhook n8n à recevoir
- [ ] **Pages individuelles** - Interface de chat pour chaque assistant (à créer)

#### 2. Système de Paiement
- [ ] **Intégration Stripe** - Paywall pour assistants premium
- [ ] **Gestion des abonnements** - Statuts gratuit/premium
- [ ] **Interface de facturation** - Historique et gestion des paiements

### 🚧 À Développer

#### 1. Fonctionnalités Avancées
- [ ] **Export des conversations** - PDF ou texte
- [ ] **Recherche dans l'historique** - Filtres et mots-clés
- [ ] **Favoris/Bookmarks** - Marquer des réponses importantes
- [ ] **Partage de conversations** - Liens temporaires

#### 2. Administration et Analytics
- [ ] **Dashboard admin** - Gestion des utilisateurs
- [ ] **Métriques d'usage** - Statistiques par assistant
- [ ] **Modération** - Contrôle des conversations

## Architecture Technique Actuelle

### Frontend (React + Vite)
```jsx
// Structure simplifiée réelle - AUCUN dossier Context/ ou Hooks/
src/
├── components/                     // TOUS les composants React
│   ├── Home.jsx                    // Landing page
│   ├── Login.jsx                   // Authentification
│   ├── Inscription.jsx
│   ├── MonCompte.jsx               // GEstion abonnements
│   ├── Assistants.jsx              // Accueil assistants
│   ├── AssistantFormation.jsx      // Chat avec historique (V3)
│   └── SidebarConversations.jsx    // Navigation conversations
├── App.jsx                         // Router principal
├── supabaseClient.js               // Config BDD
└── main.jsx                        // Point d'entrée
```

### Backend (Supabase)
```sql
-- Table principale actuelle
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  source TEXT NOT NULL,              -- 'assistant-formation', 'fiscaliste', etc.
  question TEXT,
  answer TEXT,
  conversation_id UUID NOT NULL,     -- Groupe les messages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Intégrations Externes
- **n8n Webhooks** : Assistant Formation opérationnel, 3 autres en attente
- **Supabase Auth** : Gestion complète des utilisateurs
- **Vercel** : Déploiement et hébergement

## Flux Utilisateur Détaillés

### 1. Parcours Nouveau Utilisateur
```
Visiteur anonyme
    ↓
Page d'accueil (découverte des 4 assistants)
    ↓
Clic "Accéder à mon compte" → Redirection /connexion
    ↓
Clic "Créer un compte" → Inscription
    ↓
Confirmation email → Connexion
    ↓
Mon Compte (accès Assistant Formation)
    ↓
Chat avec Assistant Formation
```

### 2. Parcours Utilisateur Existant
```
Page d'accueil
    ↓
Clic "Accéder à mon compte" → Connexion directe
    ↓
Accueuil des assistants (Assistants)
    ↓
Assistant Formation (chat + historique)
    ↓
Assistants payants (Coming Soon + upgrade)
```

### 3. Flux Assistant de Formation
```
Interface de chat
    ↓
Saisie question utilisateur
    ↓
Envoi vers webhook n8n
    ↓
Réponse IA contextuelle
    ↓
Sauvegarde en base Supabase
    ↓
Affichage + historique accessible
```

## Spécifications Techniques des Composants

### 1. Authentification (Supabase)
```jsx
// Login.jsx - Fonctionnalités
- Validation email/mot de passe
- Gestion erreurs de connexion
- Redirection après succès
- Lien vers récupération mot de passe
- Design cohérent avec la charte

// Inscription.jsx - Fonctionnalités  
- Validation côté client
- Confirmation mot de passe
- Envoi email de confirmation
- Gestion des erreurs Supabase
- Redirection vers confirmation
```

### 2. Assistant de Formation
```jsx
// AssistantFormation.jsx - Fonctionnalités complètes
- Interface chat en temps réel
- Historique persistant (localStorage + Supabase)
- Sidebar conversations avec chargement dynamique
- Nouvelle conversation (génération UUID)
- Scroll automatique et bouton scroll-to-bottom
- États de chargement avec animation points
- Gestion d'erreurs webhook
- Responsive mobile/desktop
- Header avec navigation
```

### 3. Accueil
```jsx
// Assistants.jsx - Version améliorée
- Présentation Assistant Formation avec CTA
- Grid des 3 assistants payants
- Design moderne avec images et descriptions
- Navigation fluide vers les différents assistants
- Statut Coming Soon pour assistants payants
```

## Gestion d'État Simplifiée

### État Local (useState uniquement)
```jsx
// Chaque composant gère son état localement - PAS de Context API
const [messages, setMessages] = useState([])
const [loading, setLoading] = useState(false)
const [userId, setUserId] = useState(null)

// Communication directe avec Supabase
// Pas de hooks personnalisés complexes
```

### Persistance (Supabase + localStorage)
```jsx
// Conversations : Table Supabase
// Sessions utilisateur : Supabase Auth
// ID conversation active : localStorage
// Cache UI temporaire : useState local
```

## Validation et Gestion des Erreurs

### 1. Authentification
- **Validation email** - Format + unicité côté Supabase
- **Mot de passe** - Minimum 6 caractères (configurable)
- **Messages d'erreur** - Français, utilisateur-friendly
- **États de chargement** - Boutons désactivés pendant traitement

### 2. Chat Assistant
- **Timeout webhook** - Gestion si n8n ne répond pas
- **Erreurs réseau** - Retry automatique ou message d'erreur
- **Messages vides** - Validation côté client
- **Historique** - Fallback si erreur de chargement Supabase

### 3. UX Responsive
- **Mobile first** - Design optimisé petit écran d'abord
- **Breakpoints** - md: pour desktop (768px+)
- **Navigation mobile** - Header compact avec retour
- **Scroll** - Auto-scroll messages + bouton manuel

## Roadmap Prioritaire

### Phase 1 : Assistants Payants (En cours)
1. **Réception webhooks n8n** pour les 3 assistants spécialisés
2. **Création des pages de chat** individuelles (copie de AssistantFormation)
3. **Update des routes** dans App.jsx

### Phase 2 : Paywall Stripe
1. **Intégration Stripe** - API + composants de paiement
2. **Gestion des statuts** - Gratuit vs Premium en base
3. **Protection des routes** - Middleware pour assistants payants

### Phase 3 : Fonctionnalités Avancées
1. **Export conversations** - Génération PDF
2. **Recherche globale** - Dans tout l'historique utilisateur
3. **Amélioration UX** - Animations, transitions

### Phase 4 : Analytics & Admin
1. **Dashboard admin** - Gestion utilisateurs et statistiques
2. **Monitoring** - Suivi usage et performance
3. **A/B Testing** - Optimisation conversion

---

**Maintenu par** : Équipe Invest Malin  
**Dernière mise à jour** : [Date du jour]  
**Version** : v4 (Windsurf)  
**Documentation liée** : DESIGN_SYSTEM.md, DEVELOPMENT_NOTES.md