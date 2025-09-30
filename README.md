# Mon Équipe IA

**Plateforme d'assistants IA spécialisés pour concierges immobiliers**

Application web développée pour Invest Malin, offrant un écosystème complet d'outils IA et de gestion pour professionnels de la conciergerie immobilière.

## 🎯 Fonctionnalités principales

### Assistants IA Spécialisés
- **Assistant Formation** (gratuit) : Support sur la formation Invest Malin avec contexte des 10 derniers messages
- **Assistant Annonce** (premium) : Création d'annonces optimisées pour Airbnb/Booking avec analyse de documents
- **Assistant Juridique** (premium) : Conseils juridiques spécialisés en location courte durée
- **Assistant Négociateur** (premium) : Support pour négociations propriétaires et clients

Tous les assistants premium incluent :
- Upload et analyse de fichiers PDF/DOCX
- Historique temps réel des conversations avec sidebar
- SessionId stable pour mémoire contextuelle
- Feedback progressif pendant génération (jusqu'à 2 minutes)
- Auto-scroll intelligent et gestion d'erreurs robuste

### Fiche Logement Lite
Système d'inspection professionnelle intégré avec :
- 23 sections de formulaire détaillées (+ 1 finalisation)
- Sauvegarde automatique et navigation wizard
- Génération PDF client-side professionnelle
- Système d'alertes intelligent (critiques, modérées, dégâts)
- Intégration Assistant Annonce pour création annonces depuis inspection
- Mini-dashboard avec aperçu temps réel

### Gestion d'abonnement Stripe
- **Essai gratuit 30 jours** avec capture carte
- Abonnement **19.99€/mois** après trial
- Customer Portal Stripe intégré
- Webhooks automatisés avec idempotence
- Protection premium robuste avec vérification dates expiration

### Gestion de compte
- Profil utilisateur (nom, prénom, email)
- Changement mot de passe sécurisé
- Accès direct au Customer Portal Stripe
- FAQ et support intégrés

## 🏗️ Architecture technique

### Stack
- **Frontend** : React 18 + Vite 6 + Tailwind CSS 3
- **Backend** : Supabase (Auth + PostgreSQL + RLS)
- **Paiements** : Stripe Live avec webhooks
- **IA** : Webhooks n8n (hub.cardin.cloud)
- **Déploiement** : Vercel
- **Design** : Mobile-first avec thème doré (#dbae61)

### Base de données Supabase

**Table `users`**
- Authentification et profil (email, prenom, nom)
- Gestion abonnements (subscription_status, stripe_customer_id, dates expiration)
- RLS policies : lecture libre, écriture limitée aux colonnes non-Stripe

**Table `conversations`**
- Historique conversations par assistant (source, question, answer, conversation_id)
- Isolation par user_id avec RLS
- Temps réel via Supabase Channels

**Table `fiche_lite`**
- 24 colonnes JSONB pour sections inspection
- Auto-save et persistance complète
- Isolation stricte par user_id

**Table `stripe_events`**
- Idempotence webhooks (event.id unique)
- Events marqués après succès update DB

### Sécurité Stripe (Audit Sept 2025)

**Protections implémentées** :
- Webhook signature validation
- Product filtering (prod_T4pyi8D8gPloKU uniquement)
- Idempotence avec table `stripe_events`
- Vérification expiration dates côté frontend
- RLS policies empêchant auto-upgrade
- UNIQUE constraint sur stripe_customer_id
- Gestion 5 events : checkout.completed, payment_succeeded/failed, subscription.updated/deleted

**Architecture webhook** :
- Events marqués processed APRÈS succès DB (garantit cohérence)
- Toujours retourne 200 à Stripe (évite retry infinis)
- Metadata.user_id prioritaire sur client_reference_id
- Defensive date handling pour edge cases (coupons 100%, etc.)

## 🚀 Installation locale

```bash
# Cloner le repo
git clone https://github.com/Julinhio/mon-equipe-ia-windsurf-v4.git
cd mon-equipe-ia-windsurf-v4

# Installer dépendances
npm install

# Configurer .env (voir section Variables d'environnement)
cp .env.example .env

# Lancer dev server
npm run dev
```

## 🔐 Variables d'environnement

Créer `.env` à la racine :

```env
# Supabase
VITE_SUPABASE_URL=https://[votre-projet].supabase.co
VITE_SUPABASE_ANON_KEY=[votre-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[votre-service-role-key]

# Stripe (LIVE)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Application
NEXT_PUBLIC_SUPABASE_URL=https://[votre-projet].supabase.co
```

**Important** : Sur Vercel, définir ces variables dans Settings > Environment Variables

## 📦 Déploiement Vercel

1. Connecter repo GitHub à Vercel
2. Configurer variables d'environnement (voir ci-dessus)
3. Build automatique à chaque push sur `main`
4. Configurer webhook Stripe vers `https://[votre-domaine].vercel.app/api/webhook`

## 🧪 Tests

### Flow complet testé (Sept 2025)
- ✅ Création compte + confirmation email
- ✅ Checkout Stripe avec coupon 100%
- ✅ Activation trial 30 jours
- ✅ Webhooks (checkout.completed, payment_succeeded)
- ✅ Upgrade DB free → trial
- ✅ Accès features premium (assistants + fiche)
- ✅ Customer Portal (annulation, changement carte)

### Compte test
- Email : test@example.com
- Coupon : TEST-IA100 (100% réduction, usage illimité)

## 📝 Convention de code

- **Imports** : React hooks > lucide-react > composants locaux > utils
- **Nommage** : camelCase JS, kebab-case fichiers, UPPER_CASE constantes
- **Composants** : Un composant = un fichier, default export
- **État** : useState pour local, Supabase pour persistance
- **Erreurs** : Toujours logger + afficher message user-friendly
- **Premium checks** : `subscription_status === 'premium' || subscription_status === 'trial'`

## 🐛 Debugging

**Webhook Stripe échoue** :
- Vérifier logs Vercel Functions
- Confirmer signature secret correct
- Vérifier event dans stripe_events table

**User bloqué malgré paiement** :
- Vérifier subscription_status en DB
- Vérifier dates expiration (trial_end, current_period_end)
- Resend webhook depuis Stripe Dashboard

**Assistant IA ne répond pas** :
- Timeout 120s normal pour requêtes complexes
- Vérifier logs n8n (hub.cardin.cloud)
- SessionId doit être stable (format: `user_xxx_assistant`)

## 📚 Documentation

- [Audit Sécurité Stripe](./docs/stripe_security_audit_sept_30_2025.md)
- [Guide Fiche Logement](./docs/FICHE_LOGEMENT_LITE.md)
- [Spécifications Techniques](./docs/TECHNICAL_SPEC.md)
- [Design System](./docs/DESIGN_SYSTEM.md)

## 🎯 Roadmap

### Prêt pour production (Sept 2025)
- ✅ Stripe sécurisé et validé
- ✅ 4 assistants IA opérationnels
- ✅ Fiche Logement Lite complète
- ✅ Gestion profil utilisateur

### À venir
- [ ] Help Center / Centre d'aide avancé
- [ ] Système feedback beta testers (2 phases)
- [ ] Page Tarifs/Produit marketing
- [ ] Cron resync Stripe-Supabase (si besoin)
- [ ] Alertes échecs webhooks (Sentry)

## 👥 Équipe

- **Julien** : Product owner / Developer
- **Kévin** : n8n agent developer

## 📄 Licence

Propriété Invest Malin - Tous droits réservés

## 🔗 Liens

- **Production** : https://mon-equipe-ia.vercel.app
- **Repo** : https://github.com/Julinhio/mon-equipe-ia-windsurf-v4
- **Support** : contact@invest-malin.com

---

**Dernière mise à jour** : Septembre 2025  
**Version** : 1.0 Production Ready
