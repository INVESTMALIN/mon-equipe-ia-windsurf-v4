# 🎯 Plan d'Action Complet - Paywall + Gestion Abonnements

## Vue d'ensemble
Système complet d'abonnement Stripe avec Payment Links pour débloquer les 3 assistants premium, gestion des abonnements récurrents, et interface client pour la facturation.

---

## 📋 PHASE 1 : Paywall Initial - État des Étapes

### ✅ **Étape 1 : Modification Base de Données** - TERMINÉ
```sql
-- Colonne subscription ajoutée dans Supabase ✅
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';
-- Valeurs possibles: 'free', 'premium', 'expired'
```
**Status :** ✅ **Fait et testé** - L'affichage conditionnel fonctionne

### ⏳ **Étape 2 : Création Produit Stripe** - EN ATTENTE ACCÈS
**Dans Stripe Dashboard :**
1. Créer produit "Plan Premium Mon Équipe IA - 4,90€/mois"
2. Générer Payment Link avec option `client_reference_id={CUSTOMER_ID}`
3. Récupérer l'URL du Payment Link

**Status :** ⏳ **En attente des accès Stripe**

### ✅ **Étape 3 : Page "Upgrade Required"** - TERMINÉ
**Composant `UpgradeRequired.jsx` :**
- ✅ Design avec prix (4,90€), fonctionnalités
- ✅ Style cohérent avec le design system (#dbae61)
- ⏳ TODO: Remplacer l'URL Stripe placeholder par la vraie (dépend étape 2)

**Status :** ✅ **Fait** (juste l'URL Stripe à ajouter)

### ✅ **Étape 4 : Protection des Routes** - TERMINÉ
**Routes dans `App.jsx` :**
- ✅ Routes ajoutées : `/fiscaliste`, `/legalbnb`, `/negociateur`
- ✅ Dirigent vers `ComingSoon` temporairement
- ✅ Route `/upgrade` vers `UpgradeRequired`

**Status :** ✅ **Fait** (ComingSoon sera remplacé par les vrais assistants quand webhooks n8n reçus)

### ✅ **Étape 5 : Interface MonCompte** - TERMINÉ
**`MonCompte-v2.jsx` modifié :**
- ✅ Affichage conditionnel basé sur `subscription_status`
- ✅ Utilisateurs gratuits → cadenas + "Passer Premium" → `/upgrade`
- ✅ Utilisateurs premium → "Accéder à l'assistant" → `/fiscaliste` etc.
- ✅ Visual feedback du statut d'abonnement

**Status :** ✅ **Fait et testé**

### ⏳ **Étape 6 : Webhook Stripe → Supabase** - À FAIRE
**Configuration automatique :**
- Webhook Stripe vers Supabase Edge Function
- Mise à jour `subscription_status = 'premium'` après paiement
- Gestion renouvellements et expirations

**Status :** ⏳ **Dépend de l'étape 2** (accès Stripe)

### ❌ **Étape 7 : Sécurité Base de Données** - À FAIRE
```sql
-- RLS Policy pour protéger assistants premium
CREATE POLICY "Premium assistants access" ON conversations
FOR ALL USING (
  source = 'assistant-formation' OR 
  (source IN ('fiscaliste', 'legalbnb', 'negociateur') AND 
   auth.uid() IN (SELECT id FROM users WHERE subscription_status = 'premium'))
);
```

**Status :** ❌ **À créer en base**

---

## 🎯 Résultat Actuel

### **Utilisateur Gratuit :**
- ✅ Accès Assistant Formation
- ✅ Clic assistant premium → Page upgrade avec prix → TODO: Stripe

### **Utilisateur Premium :**
- ✅ Interface sans cadenas
- ✅ Clic assistant → ComingSoon (temporaire, en attente webhooks n8n)

### **Sécurité :**
- ✅ Frontend protégé avec affichage conditionnel
- ❌ Base de données pas encore protégée (RLS Policy à créer)

---

## 🚀 Prochaines Actions

### **Immédiate (dès accès Stripe) :**
1. Créer produit Stripe 4,90€/mois
2. Remplacer l'URL placeholder dans `UpgradeRequired.jsx`
3. Configurer webhook Stripe → Supabase
4. Créer RLS Policy de sécurité

### **Dès réception webhooks n8n :**
1. Créer `FiscalisteIA.jsx`, `LegalBNB.jsx`, `NegociateurIA.jsx`
2. Remplacer `ComingSoon` par les vrais composants dans `App.jsx`

### **Résultat final :**
Paywall 100% fonctionnel avec paiement Stripe et accès sécurisé aux assistants premium.

---

---

## 📋 PHASE 2 : Gestion Abonnements Récurrents

### 🗃️ Extension Base de Données

#### Nouvelles colonnes table `users`
```sql
-- Colonnes pour tracking Stripe
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN subscription_current_period_end TIMESTAMP;

-- Index pour performance
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_subscription_end ON users(subscription_current_period_end);
```

#### États `subscription_status` (simplifiés)
- `free` : Utilisateur gratuit (défaut)
- `premium` : Abonnement actif et payé
- `expired` : Abonnement annulé ou paiement échoué

### 🎛️ Interface Client - Page Abonnement

#### **Nouveau composant : `MonAbonnement.jsx`**

**Route :** `/mon-compte/abonnement`

**Contenu selon statut :**

**Utilisateur FREE :**
- Badge "Gratuit"
- Liste fonctionnalités premium
- Bouton "Passer Premium" → UpgradeRequired

**Utilisateur PREMIUM :**
- Badge "Premium Actif"
- Prochaine facturation : {date}
- Prix : 4,90€/mois
- Bouton "Gérer mon abonnement" → Stripe Customer Portal

**Utilisateur EXPIRED :**
- Badge "Expiré"
- Message "Votre abonnement a été annulé"
- Bouton "Réactiver Premium" → UpgradeRequired

#### **Modification `MonCompte-v2.jsx`**
```jsx
// Ajouter lien vers page abonnement
<Link to="/mon-compte/abonnement" className="...">
  <CreditCard className="w-5 h-5" />
  Gérer mon abonnement
</Link>
```

### 🔗 Webhooks Stripe (Edge Functions Supabase)

#### **1. invoice.payment_succeeded**
```javascript
// Appelé à chaque paiement réussi (initial + renouvellements)
- Récupérer customer_id depuis Stripe
- Mettre à jour subscription_status = 'premium'
- Mettre à jour subscription_current_period_end
```

#### **2. invoice.payment_failed**
```javascript
// Appelé quand un paiement échoue
- Récupérer customer_id depuis Stripe
- Mettre à jour subscription_status = 'expired'
- Mettre à jour subscription_current_period_end = null
```

#### **3. customer.subscription.deleted**
```javascript
// Appelé quand un abonnement est annulé
- Récupérer customer_id depuis Stripe
- Mettre à jour subscription_status = 'expired'
- Nettoyer stripe_subscription_id
```

#### **4. customer.subscription.updated**
```javascript
// Appelé pour changements d'abonnement
- Sync des données Stripe vers Supabase
- Mise à jour des dates de renouvellement
```

### 💳 Stripe Customer Portal

#### **Configuration Stripe Dashboard**
```
1. Activer Customer Portal dans Stripe
2. Actions autorisées :
   ✅ Voir factures
   ✅ Télécharger factures
   ✅ Mettre à jour moyen de paiement
   ✅ Annuler abonnement
3. URL de retour : https://votre-app.com/mon-compte/abonnement
```

#### **Implémentation dans l'app**
```javascript
const handleManageSubscription = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Récupérer stripe_customer_id depuis users table
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()
  
  // Créer session Customer Portal via API
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    body: JSON.stringify({ 
      customer_id: profile.stripe_customer_id,
      return_url: window.location.origin + '/mon-compte/abonnement'
    })
  })
  
  const { url } = await response.json()
  window.location.href = url
}
```

### 🔐 Sécurité Renforcée

#### **RLS Policy mise à jour**
```sql
-- Protéger l'accès aux assistants premium avec vérification dates
DROP POLICY IF EXISTS "Premium assistants access" ON conversations;

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

---

## 📋 Flux Utilisateur Complets

### **Nouveau Client**
```
1. S'inscrit (free)
2. Clique "Passer Premium" → Stripe Checkout
3. Paye → webhook payment_succeeded
4. Status = 'premium' → accès assistants
5. Facturation automatique chaque mois
```

### **Gestion Abonnement**
```
1. Va sur /mon-compte/abonnement
2. Voit statut + prochaine facturation
3. Clique "Gérer" → Stripe Customer Portal
4. Peut changer CB, voir factures, annuler
5. Retour app avec statut mis à jour
```

### **Échec de Paiement**
```
1. Stripe essaie de facturer → échec
2. webhook payment_failed → status = 'expired'
3. Utilisateur perd accès assistants premium
4. Peut réactiver via "Réactiver Premium"
```

### **Annulation**
```
1. Client annule via Customer Portal
2. webhook subscription_deleted → status = 'expired'  
3. Accès premium coupé immédiatement
4. Peut se réabonner plus tard
```

---

## 🚀 Plan d'Implémentation Global

### **Phase 1 - Paywall Initial** ✅ **En cours**
1. ✅ Extension BDD (subscription_status)
2. ✅ Page UpgradeRequired
3. ✅ Affichage conditionnel MonCompte-v2
4. ⏳ Accès Stripe + Payment Link
5. ⏳ Webhook initial Stripe → Supabase

### **Phase 2 - Gestion Abonnements** ❌ **À faire**
1. Extension BDD (colonnes Stripe)
2. Composant MonAbonnement.jsx
3. 4 webhooks Stripe complets
4. Configuration Customer Portal
5. API create-portal-session

### **Phase 3 - Sécurité & Tests** ❌ **À faire**
1. RLS policy renforcée
2. Tests abonnements complets
3. Tests échecs de paiement
4. Tests annulations
5. Validation sécurité webhooks

### **Phase 4 - Webhooks n8n** ⏳ **En attente**
1. Réception des 3 webhooks n8n
2. Création FiscalisteIA.jsx, LegalBNB.jsx, NegociateurIA.jsx
3. Remplacement ComingSoon dans routes

---

## ⚠️ Points d'Attention

### **Webhooks Stripe**
- Vérifier signatures Stripe pour sécurité
- Gérer l'idempotence (éviter doublons)
- Logs détaillés pour debug

### **UX Abonnements**
- Messages clairs sur statuts d'abonnement
- Éviter confusion entre "expired" et "canceled"
- Redirection fluide depuis Customer Portal

### **Sécurité**
- Ne jamais faire confiance au frontend seul
- RLS policy robuste côté base
- Validation webhook signatures

---

**Dernière mise à jour :** 21 juillet 2025  
**Maintenu par :** Julien - Équipe Invest Malin