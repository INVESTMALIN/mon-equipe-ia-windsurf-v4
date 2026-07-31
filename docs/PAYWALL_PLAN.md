# 🎯 Plan d'Action Complet - Paywall + Gestion Abonnements

## Vue d'ensemble
Système complet d'abonnement Stripe avec Customer Portal pour débloquer les 3 assistants premium, gestion des abonnements récurrents, et interface client enrichie pour la facturation.

---

## ⚠️ CONFIGURATION ACTUELLE - SANDBOX STRIPE

**IMPORTANT :** Actuellement en mode test avec compte Stripe personnel de Julien.

### Configuration Sandbox Stripe
- **Compte** : Sandbox personnel de Julien
- **Mode** : Test uniquement - aucune transaction réelle
- **Secret Key** : `sk_test_VOTRE_CLE_TEST...`
- **Publishable Key** : `pk_test_51RpjzBH8DRxW0tWa93d3l8hLLdN1X7VFAU...`
- **Customer Portal** : Activé et configuré
- **Produit créé** : "Plan Premium Mon Équipe IA - 4,90€/mois"

### Variables Vercel Configurées
```env
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_TEST... (côté serveur uniquement)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RpjzBH8DRxW0tWa93d3l8hLLdN1X7VFAU... (côté client)
```

---

## 📋 PHASE 1 : Paywall Initial - ÉTAT ACTUEL

### ✅ **Étape 1 : Extension Base de Données** - TERMINÉ
```sql
-- Colonnes ajoutées dans Supabase ✅ FAIT
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN subscription_current_period_end TIMESTAMP;

-- Index pour performance ✅ FAIT
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_subscription_end ON users(subscription_current_period_end);
```

**États `subscription_status` :**
- `free` : Utilisateur gratuit (défaut)
- `premium` : Abonnement actif et payé
- `expired` : Abonnement annulé ou paiement échoué

**Status :** ✅ **TERMINÉ et TESTÉ** - L'affichage conditionnel fonctionne

### ✅ **Étape 2 : Produit Stripe** - TERMINÉ
**Dans Stripe Dashboard Sandbox :**
- ✅ Produit "Plan Premium Mon Équipe IA - 4,90€/mois" créé
- ✅ Customer Portal activé avec toutes options
- ✅ Configuration test complète

**Status :** ✅ **FAIT** - Sandbox opérationnel

### ✅ **Étape 3 : Page "Upgrade Required"** - TERMINÉ
**Composant `UpgradeRequired.jsx` :**
- ✅ Design avec prix (4,90€), fonctionnalités
- ✅ Style cohérent avec design system (#dbae61)
- ⏳ TODO: Remplacer URL Stripe placeholder par vraie (Payment Link)

**Status :** ✅ **Interface prête** - Manque juste URL Payment Link finale

### ✅ **Étape 4 : Protection des Routes** - TERMINÉ
**Routes dans `App.jsx` :**
- ✅ Routes ajoutées : `/fiscaliste`, `/legalbnb`, `/negociateur`
- ✅ Dirigent vers `ComingSoon` temporairement
- ✅ Route `/upgrade` vers `UpgradeRequired`

**Status :** ✅ **FAIT** - Sera remplacé par vrais assistants quand webhooks n8n reçus

### ✅ **Étape 5 : Interface MonCompte** - TERMINÉ
**`MonCompte.jsx` enrichi :**
- ✅ Affichage conditionnel basé sur `subscription_status`
- ✅ Badges colorés (Gratuit/Premium Actif/Expiré)
- ✅ Bouton "Gérer mon abonnement" → Customer Portal
- ✅ Statistiques d'activité et accès rapide
- ✅ Design moderne et engageant

**Status :** ✅ **TERMINÉ et TESTÉ** - Interface complète et fonctionnelle

### ✅ **Étape 6 : API Customer Portal** - TERMINÉ
**Endpoint Vercel `api/create-portal-session.js` :**
- ✅ Code fonctionnel avec gestion d'erreurs
- ✅ Intégration dans MonCompte.jsx
- ✅ Testé en production avec succès
- ✅ Redirections Stripe opérationnelles

**Pattern d'utilisation :**
```javascript
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

**Status :** ✅ **OPÉRATIONNEL** - API testée et fonctionnelle

### ⏳ **Étape 7 : Webhooks Stripe → Supabase** - À FAIRE
**Automatisation nécessaire :**
- Webhook `invoice.payment_succeeded` → `subscription_status = 'premium'`
- Webhook `customer.subscription.deleted` → `subscription_status = 'expired'`
- Webhook `invoice.payment_failed` → `subscription_status = 'expired'`
- Sync automatique des données Stripe vers Supabase

**Status :** ⏳ **PROCHAINE PRIORITÉ**

### ❌ **Étape 8 : RLS Policy Sécurité** - À FAIRE
```sql
-- RLS Policy pour protéger assistants premium
CREATE POLICY "Premium assistants access" ON conversations
FOR ALL USING (
  source = 'assistant-formation' OR 
  (source IN ('fiscaliste', 'legalbnb', 'negociateur') AND 
   auth.uid() IN (
     SELECT id FROM users 
     WHERE subscription_status = 'premium' 
     AND (subscription_current_period_end IS NULL OR subscription_current_period_end > NOW())
   ))
);
```

**Status :** ❌ **À créer en base pour sécuriser l'accès**

---

## 🎯 RÉSULTAT ACTUEL - CE QUI FONCTIONNE

### **✅ Utilisateur Gratuit (subscription_status = 'free') :**
- Accès complet à l'Assistant Formation
- Interface MonCompte avec badge "Gratuit"
- Bouton "Passer Premium" → page `/upgrade`
- Assistants premium affichés avec cadenas

### **✅ Utilisateur Premium (subscription_status = 'premium') :**
- Interface MonCompte avec badge "Premium Actif"
- Date de prochaine facturation affichée
- Bouton "Gérer mon abonnement" → Customer Portal Stripe
- Accès théorique aux assistants premium (en attente webhooks n8n)

### **✅ Customer Portal Stripe :**
- Redirection fonctionnelle vers portal Stripe
- Gestion factures, moyens de paiement, annulation
- Retour automatique vers l'app après actions

### **⚠️ Points manuels actuels :**
- Changement de statut `subscription_status` en base manuel
- Création `stripe_customer_id` manuelle pour tests
- Pas encore de Payment Link intégré

---

## 📋 PHASE 2 : Automatisation Complète (Prochaines étapes)

### **2.1 Webhooks Stripe Essentiels**

#### **Webhook 1 : invoice.payment_succeeded**
```javascript
// Supabase Edge Function ou Vercel API
export default async function handler(req, res) {
  const sig = req.headers['stripe-signature']
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object
    const customerId = invoice.customer
    
    // Mettre à jour Supabase
    await supabase
      .from('users')
      .update({
        subscription_status: 'premium',
        stripe_customer_id: customerId,
        subscription_current_period_end: new Date(invoice.lines.data[0].period.end * 1000)
      })
      .eq('stripe_customer_id', customerId)
  }
  
  res.status(200).json({ received: true })
}
```

#### **Webhook 2 : customer.subscription.deleted**
```javascript
// Annulation d'abonnement
if (event.type === 'customer.subscription.deleted') {
  const subscription = event.data.object
  const customerId = subscription.customer
  
  await supabase
    .from('users')
    .update({
      subscription_status: 'expired',
      stripe_subscription_id: null,
      subscription_current_period_end: null
    })
    .eq('stripe_customer_id', customerId)
}
```

#### **Webhook 3 : invoice.payment_failed**
```javascript
// Échec de paiement
if (event.type === 'invoice.payment_failed') {
  const invoice = event.data.object
  const customerId = invoice.customer
  
  await supabase
    .from('users')
    .update({ subscription_status: 'expired' })
    .eq('stripe_customer_id', customerId)
}
```

### **2.2 Payment Links Integration**
- Créer Payment Link Stripe avec `client_reference_id`
- Intégrer URL dans `UpgradeRequired.jsx`
- Webhook `checkout.session.completed` pour création initiale customer

### **2.3 Sécurité Base de Données**
- Implémenter RLS Policy pour protéger assistants premium
- Tests de sécurité complets
- Validation côté serveur des accès

---

## 🔄 FLUX UTILISATEUR COMPLETS

### **Nouveau Client (Futur) :**
```
1. S'inscrit (subscription_status = 'free')
2. Explore Assistant Formation gratuitement
3. Clique "Passer Premium" → Stripe Payment Link
4. Paye → webhook payment_succeeded → subscription_status = 'premium'
5. Accès automatique aux assistants premium
6. Facturation automatique mensuelle
```

### **Gestion Abonnement (Actuel) :**
```
1. Va sur /mon-compte
2. Voit statut + prochaine facturation
3. Clique "Gérer mon abonnement" → Customer Portal Stripe
4. Peut voir factures, changer CB, annuler
5. Retour automatique vers l'app
6. Statut mis à jour automatiquement (via webhooks)
```

### **Annulation/Réactivation :**
```
1. Client annule via Customer Portal
2. webhook subscription_deleted → subscription_status = 'expired'
3. Perte d'accès assistants premium immédiate
4. Interface "Réactiver Premium" disponible
5. Nouveau paiement → retour en premium
```

---

## 🔧 CONFIGURATION TECHNIQUE DÉTAILLÉE

### **API Stripe Customer Portal**
```javascript
// api/create-portal-session.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customer_id, return_url } = req.body

    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: return_url
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Erreur création session portal:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}
```

### **Pattern d'Intégration React**
```javascript
// Dans MonCompte.jsx
const [userProfile, setUserProfile] = useState(null)

// Charger profil utilisateur avec colonnes Stripe
const loadUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('subscription_status, stripe_customer_id, subscription_current_period_end')
    .eq('id', userId)
    .single()
  
  setUserProfile(data)
}

// Affichage conditionnel selon statut
const renderSubscriptionStatus = () => {
  switch(userProfile?.subscription_status) {
    case 'premium':
      return <PremiumInterface />
    case 'expired':
      return <ExpiredInterface />
    default:
      return <FreeInterface />
  }
}
```

### **Variables d'Environnement Critiques**
```env
# Vercel - Configuration actuelle Sandbox
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_TEST...     # SANS VITE_ !
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RpjzBH8DRxW0tWa93d3l8hLLdN1X7VFAU...  # AVEC VITE_ !

# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**⚠️ RÈGLE CRITIQUE :** 
- `STRIPE_SECRET_KEY` = côté serveur UNIQUEMENT (pas de préfixe VITE_)
- `VITE_STRIPE_PUBLISHABLE_KEY` = côté client (préfixe VITE_ obligatoire)

---

## 🚨 MIGRATION PRODUCTION - CHECKLIST

### **Étapes Migration Compte Stripe Invest Malin :**

1. **✅ Obtenir accès compte Stripe Invest Malin**
2. **✅ Recréer produit 4,90€/mois en mode live**
3. **✅ Configurer Customer Portal en mode live**
4. **✅ Créer Payment Link avec bon pricing**
5. **✅ Configurer webhooks essentiels**
6. **✅ Mettre à jour variables Vercel avec clés live**
7. **✅ Tests complets cycle de paiement**
8. **✅ Tests annulation/réactivation**
9. **✅ Validation sécurité et RLS policies**

### **Points d'Attention Migration :**
- **Signatures webhooks** : Valider toutes les signatures Stripe
- **Idempotence** : Éviter les doublons de traitement
- **Logs détaillés** : Monitoring complet des événements
- **Rollback plan** : Possibilité de revenir en arrière rapidement

---

## 🔍 TESTS ET VALIDATION

### **Tests Manuels Réalisés ✅**
- Interface MonCompte avec différents statuts
- Création session Customer Portal
- Navigation complète vers Stripe et retour
- Affichage conditionnel selon subscription_status

### **Tests Automatisés À Implémenter ❌**
- Simulation webhooks Stripe (stripe-cli)
- Tests de sécurité RLS policies
- Tests de performance API endpoints
- Tests E2E cycle complet d'abonnement

### **Monitoring Production À Ajouter ❌**
- Alerts échecs de paiement
- Suivi conversion upgrade
- Métriques d'usage assistants premium
- Dashboard admin pour gestion abonnements

---

## 📈 MÉTRIQUES ET KPI À SUIVRE

### **Business :**
- Taux de conversion free → premium
- Churn rate mensuel
- Valeur moyenne par utilisateur (ARPU)
- Temps avant premier upgrade

### **Technique :**
- Latence API Customer Portal
- Taux de succès webhooks Stripe
- Erreurs d'authentification
- Performance base de données

---

**Dernière mise à jour :** 28 juillet 2025  
**Maintenu par :** Julien - Équipe Invest Malin  
**Status :** Customer Portal opérationnel - Webhooks automation à implémenter  
**Environnement :** Sandbox Stripe personnel - Migration production planifiée