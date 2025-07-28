# CLAUDE.md - Cerveau du Projet Mon Équipe IA

## 🧠 Instructions de Remise en Contexte

### Première Action à Chaque Session
```
1. Lire ce fichier CLAUDE.md en entier
2. Examiner project_knowledge_search pour l'état actuel du code
3. Demander confirmation de l'objectif de la session
4. Vérifier s'il y a des nouveaux webhooks n8n reçus
5. Proposer les prochaines étapes prioritaires
```

## 🎯 Vue d'Ensemble du Projet

### Qui & Quoi
- **Client** : Invest Malin (marque immobilière locative)
- **Produit** : Mon Équipe IA - Plateforme d'assistants IA pour conciergerie
- **Utilisateurs** : Clients ayant acheté la formation "conciergerie clé en main"
- **Développeur** : Julien (linguiste → spécialiste automation IA/no-code)

### Mission
Créer une app web avec 4 assistants IA :
1. **Assistant Formation** (gratuit/public) ✅ OPÉRATIONNEL
2. **Fiscaliste IA** (payant) ⏳ WEBHOOK EN ATTENTE
3. **LegalBNB** (payant) ⏳ WEBHOOK EN ATTENTE  
4. **Négociateur IA** (payant) ⏳ WEBHOOK EN ATTENTE

## 🏗️ Architecture Technique - Points Clés

### Stack Confirmé
- **Frontend** : React 18 + Vite + Tailwind CSS + React Router
- **Backend** : Supabase (Auth + PostgreSQL)
- **IA** : Webhooks n8n (hub.cardin.cloud)
- **Paiements** : Stripe + Customer Portal ✅ OPÉRATIONNEL
- **Déploiement** : Vercel
- **Design** : Mobile-first, couleur dorée #dbae61

### Structure Critique à Retenir
```
src/components/ (TOUT est ici, pas de sous-dossiers)
├── Home.jsx (Landing page)
├── Login.jsx, Inscription.jsx (Auth)
├── Assistants.jsx (Accueil des assistants)
├── AssistantFormation.jsx (Chat opérationnel)
├── MonCompte.jsx (Gestion abonnement + Customer Portal) ✅ NOUVEAU
├── SidebarConversations.jsx (Navigation historique)
└── [Composants pages légales, 404, etc.]
```

### Base de Données Supabase - STRUCTURE RÉELLE
```sql
-- Table principale (confirmée via audit SQL)
conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                    -- Référence auth.users
  created_at TIMESTAMP DEFAULT NOW(),
  source TEXT,                     -- 'assistant-formation', 'fiscaliste', etc.
  question TEXT,                   -- Message utilisateur
  answer TEXT,                     -- Réponse IA
  conversation_id UUID,            -- Regroupement session
  title TEXT                       -- Renommage optionnel
);

-- Table utilisateurs personnalisée (confirmée)
users (
  id UUID PRIMARY KEY,             -- Même ID que auth.users
  prenom TEXT,
  nom TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'free',         -- ✅ NOUVEAU
  stripe_customer_id TEXT,                         -- ✅ NOUVEAU
  stripe_subscription_id TEXT,                     -- ✅ NOUVEAU
  subscription_current_period_end TIMESTAMP        -- ✅ NOUVEAU
);
```

### RLS Policies (confirmées)
- `conversations` : "Allow insert for all" + "Users can access their own conversations"
- `users` : "Users can access their own record"

## 🚀 État Actuel du Projet (Dernière Mise à Jour)

### ✅ Ce Qui Fonctionne
- Landing page complète avec présentation des 4 assistants
- Système d'authentification Supabase (inscription, connexion, reset)
- Assistant Formation avec webhook n8n opérationnel
- Historique des conversations avec sidebar
- Accueil utilisateur (Assistants.jsx)
- **Stripe Customer Portal intégré** ✅ NOUVEAU
- **Page MonCompte enrichie avec gestion abonnement** ✅ NOUVEAU
- **API /api/create-portal-session fonctionnelle** ✅ NOUVEAU
- Design system cohérent (couleur dorée, Tailwind, responsive)
- Déploiement Vercel configuré

### ⏳ En Attente
- **Webhooks n8n** pour Fiscaliste IA, LegalBNB, Négociateur IA
- **Pages de chat individuelles** pour les 3 assistants payants
- **Webhooks Stripe** pour automatiser subscription_status

### 📋 Prochaines Actions Prioritaires
1. **Webhooks Stripe** pour sync automatique des abonnements
2. **Intégration webhooks n8n** dès réception
3. **Tests paywall complet** en production
4. **Optimisations UX**

## 🎨 Design System - Règles Critiques

### Couleurs (RESPECTER ABSOLUMENT)
- **Primaire dorée** : `#dbae61` (CTA, liens actifs)
- **Hover dorée** : `#c49a4f` 
- **Noir** : `#000000` (texte, headers)
- **Blanc cassé** : `#f8f8f8` (arrière-plans)

### Composants Standards
```html
<!-- Bouton primaire -->
<button class="bg-[#dbae61] hover:bg-[#c49a4f] text-black font-semibold px-8 py-3 rounded-md transition-colors">

<!-- Section hero -->
<section class="bg-[#f8f8f8] px-6 md:px-20 py-20 text-center">

<!-- Input formulaire -->
<input class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors">
```

### Responsive (Mobile-First)
- Classes sans préfixe = mobile (< 768px)
- `md:` = desktop (768px+)
- Navigation hamburger sur mobile
- Grid split-screen : `flex flex-col md:grid md:grid-cols-[40%_60%]`

## 🔧 Configuration Technique

### Variables d'Environnement
```env
# Supabase (obligatoire)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Webhooks n8n (à recevoir)
VITE_FISCALISTE_WEBHOOK_URL=
VITE_LEGALBNB_WEBHOOK_URL=
VITE_NEGOCIATEUR_WEBHOOK_URL=

# Stripe (opérationnel) ✅
STRIPE_SECRET_KEY=sk_test_...                    # Côté serveur uniquement
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...          # Côté client
```

### Webhook n8n Format
```javascript
// URL actuelle Assistant Formation
const res = await fetch('https://hub.cardin.cloud/webhook/3bab9cc1-054f-4f06-b192-3baac53aa367', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: fullPrompt })
})
// Réponse : { "output": "réponse de l'IA" }
```

### API Stripe Customer Portal ✅ NOUVEAU
```javascript
// Endpoint Vercel opérationnel
POST /api/create-portal-session
Body: { customer_id, return_url }
Réponse: { url: "https://billing.stripe.com/p/session/..." }
```

### Scripts npm (package.json)
```bash
npm run dev      # Développement
npm run build    # Production  
npm run lint     # Vérification code
npm run preview  # Test build local
```

## 🧭 Patterns de Code à Suivre

### État Local (useState seulement)
```jsx
// PAS de Context API complexe
const [messages, setMessages] = useState([])
const [loading, setLoading] = useState(false)
const [userId, setUserId] = useState(null)

// Communication directe Supabase
const { data, error } = await supabase.from('conversations')...
```

### Authentification Pattern
```jsx
// Récupération utilisateur connecté
useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    if (data?.user) setUserId(data.user.id)
  })
}, [])
```

### Pattern Stripe Customer Portal ✅ NOUVEAU
```jsx
const handleManageSubscription = async () => {
  const response = await fetch('/api/create-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: userProfile.stripe_customer_id,
      return_url: window.location.origin + '/mon-compte'
    })
  })
  const data = await response.json()
  if (response.ok) window.location.href = data.url
}
```

### Insertion Conversation Pattern
```jsx
await supabase.from('conversations').insert({
  source: 'assistant-formation',
  question: input,
  answer: reply.text,
  conversation_id: conversationIdRef.current,
  user_id: userId
})
```

### Routing Pattern
```jsx
// App.jsx - Routes principales
<Route path="/" element={<Home />} />
<Route path="/connexion" element={<Login />} />
<Route path="/assistants" element={<Assistants />} />
<Route path="/assistant-formation" element={<AssistantFormation />} />
<Route path="/mon-compte" element={<MonCompte />} />        // ✅ NOUVEAU
```

## 🚨 Pièges à Éviter - Leçons Apprises

### ❌ Ne JAMAIS Faire
- Inventer des tables qui n'existent pas (messages, profiles)
- Utiliser Context API sans raison (useState suffit)
- Oublier la couleur dorée #dbae61 dans les boutons CTA
- Créer des sous-dossiers dans src/components/
- Supposer qu'OpenAI est utilisé (c'est n8n !)
- Hardcoder des URLs ou politiques RLS sans vérifier
- **Mélanger STRIPE_SECRET_KEY et VITE_STRIPE_PUBLISHABLE_KEY** ✅ NOUVEAU

### ✅ Toujours Faire
- Vérifier la structure réelle via project_knowledge_search
- Respecter le mobile-first avec classes md:
- Utiliser gen_random_uuid() pour les UUIDs
- Implémenter les états de chargement (loading, dots)
- Tester l'auth Supabase avant toute requête BDD
- Maintenir la cohérence du design system
- **Tester APIs en production (Vercel) pas en local** ✅ NOUVEAU

## 📚 Documentation Critique

### Fichiers MD Maintenus
- `DESIGN_SYSTEM.md` - Couleurs, composants, responsive
- `DEVELOPMENT_NOTES.md` - Installation, config, structure
- `FEATURE_SPEC.md` - Fonctionnalités actuelles et roadmap
- `TECHNICAL_SPEC.md` - Architecture, BDD, déploiement
- `PAYWALL_PLAN.md` - Plan d'implémentation Stripe complet ✅ NOUVEAU
- `CLAUDE.md` - Ce fichier (instructions pour Claude)

### Composants Clés à Examiner
1. `AssistantFormation.jsx` - Modèle de chat avec historique
2. `Assistants.jsx` - Dashboard utilisateur principal
3. `SidebarConversations.jsx` - Navigation conversations
4. `Home.jsx` - Landing page avec grille assistants
5. `MonCompte.jsx` - Gestion abonnement + Customer Portal ✅ NOUVEAU
6. `supabaseClient.js` - Configuration BDD

## 🔄 Routine de Démarrage de Session

```
1. Saluer et demander l'objectif de la session
2. Vérifier l'état des webhooks n8n
3. Examiner les derniers commits si mentionnés
4. Proposer la prochaine étape logique :
   - Webhooks Stripe si on veut automatiser les abonnements
   - Pages individuelles assistants si webhooks n8n reçus
   - Tests paywall si tout fonctionne
   - Optimisations UX si tout est opérationnel
5. Confirmer avant de commencer le travail
```

## 💡 Aide-Mémoire Julien

### Ton Profil
- Transition linguiste → spécialiste IA/no-code
- Préfère approche step-by-step (IMPORTANT)
- Pas de outline complet à l'avance
- Ton humain, direct, tutoiement, blagues acceptées
- Analyse critique plutôt qu'affirmation, contradictions acceptées lorsque nécessaire

### Préférences
- Phrases courtes et humaines
- Éviter les termes IA-sounding
- Pas de tirets longs (—), virgules ou phrases
- Pas de over-formatting, écrire naturel
- Contester mes suppositions si erronées
- Ne te contente pas d'accepter les affirmations de Julien, tu dois pondérer et contredire, suggérer, affiner sa pensée

---

**⚡ RÉSUMÉ ULTRA-RAPIDE**
App React/Supabase avec 4 assistants IA. 1 opérationnel (Formation), 3 en attente de webhooks n8n. Stripe Customer Portal fonctionnel, page MonCompte enrichie. Couleur dorée #dbae61, mobile-first, table conversations + users avec colonnes Stripe. Prochaine étape : webhooks Stripe pour automatiser les abonnements.

**🔥 ACTION IMMÉDIATE À CHAQUE SESSION**
Demander : "Salut ! Quels webhooks n8n as-tu reçus ? On continue sur les webhooks Stripe pour automatiser les abonnements ou autre chose ?"