## 🎯 Plan d'Action Complet - Paywall Simple

### **Vue d'ensemble**
Ajouter un système d'abonnement Stripe avec Payment Links pour débloquer les 3 assistants premium, tout en gardant l'Assistant Formation gratuit.

---

## 📋 Étapes Détaillées

### **Étape 1 : Modification Base de Données**
```sql
-- Ajouter colonne subscription dans Supabase
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';
-- Valeurs possibles: 'free', 'premium', 'expired'
```

### **Étape 2 : Création Produit Stripe**
**Dans Stripe Dashboard :**
1. Créer produit "Plan Premium Mon Équipe IA - 19€/mois"
2. Générer Payment Link avec option `client_reference_id={CUSTOMER_ID}`
3. Récupérer l'URL du Payment Link

### **Étape 3 : Page "Upgrade Required"**
**Créer composant `UpgradeRequired.jsx` :**
- Design avec prix, fonctionnalités
- Bouton vers Stripe Payment Link avec `user.id` en paramètre
- Style cohérent avec le design system (#dbae61)

### **Étape 4 : Protection des Routes**
**Modifier `App.jsx` :**
- Ajouter routes pour assistants premium : `/fiscaliste`, `/legalbnb`, `/negociateur`
- Créer composant `ProtectedRoute` qui check `subscription_status`
- Si gratuit → UpgradeRequired, si premium → Assistant

### **Étape 5 : Mise à Jour Interface MonCompte**
**Modifier `MonCompte-v2.jsx` :**
- Afficher cadenas + "Premium requis" pour utilisateurs gratuits
- Liens directs vers assistants pour utilisateurs premium
- Visual feedback du statut d'abonnement

### **Étape 6 : Webhook Stripe → Supabase**
**Configuration automatique :**
- Webhook Stripe vers Supabase Edge Function
- Mise à jour `subscription_status = 'premium'` après paiement
- Gestion renouvellements et expirations

### **Étape 7 : Sécurité Base de Données**
```sql
-- RLS Policy pour protéger assistants premium
CREATE POLICY "Premium assistants access" ON conversations
FOR ALL USING (
  source = 'assistant-formation' OR 
  (source IN ('fiscaliste', 'legalbnb', 'negociateur') AND 
   auth.uid() IN (SELECT id FROM users WHERE subscription_status = 'premium'))
);
```

---

## 🎯 Résultat Final

**Utilisateur Gratuit :**
- Accès Assistant Formation ✅
- Clic assistant premium → Page upgrade avec prix → Stripe

**Utilisateur Premium :**
- Accès tous les assistants ✅
- Interface normale sans restrictions

**Sécurité :**
- Frontend, routes ET base de données protégés
- Impossible d'accéder aux assistants premium sans payer
