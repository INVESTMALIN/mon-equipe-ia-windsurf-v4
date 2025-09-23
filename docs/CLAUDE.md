# CLAUDE.md - Cerveau du Projet Mon Équipe IA

## 🎯 Vue d'Ensemble Rapide

### Mission Principale
**Mon Équipe IA** - Plateforme d'assistants IA pour conciergerie immobilière (Invest Malin)
- 1 assistant gratuit (Formation) ✅ OPÉRATIONNEL
- 3 assistants premium (Annonce, Juridique, Négociateur) ✅ **COMPLÈTEMENT OPÉRATIONNELS**
- **Fiche Logement Lite** ✅ **SYSTÈME COMPLET 24/24 SECTIONS**

### État Projet Septembre 2025
**SUCCÈS MAJEUR** - Tous les objectifs principaux atteints :
- **Assistants Premium** : 3/3 complètement upgradés avec toutes fonctionnalités
- **Fiche Logement Lite** : 24/24 sections opérationnelles (23 formulaire + finalisation)
- **Sidebar Temps Réel** : Système universel responsive avec live updates
- **Mémoire IA** : SessionId stable fixé pour Kevin (n8n)
- **Architecture Robuste** : Error handling, file validation, auto-scroll intelligent

## 🏗️ Architecture & Stack

### Technologies
- **Frontend** : React 18 + Vite + Tailwind CSS + React Router
- **Backend** : Supabase (Auth + PostgreSQL + RLS)
- **IA** : Webhooks n8n (hub.cardin.cloud)
- **Paiements** : Stripe Customer Portal ✅
- **Déploiement** : Vercel
- **Design** : Mobile-first, couleur dorée #dbae61

### Structure BDD Critique
```sql
-- Tables Mon Équipe IA
conversations (user_id, source, question, answer, conversation_id, title)
users (id, subscription_status, stripe_customer_id, etc.)

-- ✅ Tables Fiche Logement Lite COMPLÈTES
fiche_lite (id, user_id, nom, statut, section_* JSONB x24, photos_prises)
```

## 🚀 État Actuel - Septembre 2025

### ✅ Assistants IA - TOUS OPÉRATIONNELS

#### Assistant Formation (Gratuit)
- **Statut** : Opérationnel depuis longtemps
- **Fonctionnalités** : Chat + historique + contexte 10 messages
- **Webhook** : https://hub.cardin.cloud/webhook/3bab9cc1-054f-4f06-b192-3baac53aa367

#### Assistant Annonce (Premium) 
- **Statut** : ✅ FULLY UPGRADED - Implémentation de référence
- **Webhook** : https://hub.cardin.cloud/webhook/00297790-8d18-44ff-b1ce-61b8980d9a46/chat
- **Fonctionnalités** : Chat + historique temps réel + PDF/DocX + sessionId stable + auto-scroll + error handling robuste

#### Assistant Juridique (Premium)
- **Statut** : ✅ FULLY UPGRADED - Feature parity avec Annonce
- **Webhook** : https://hub.cardin.cloud/webhook/350f827a-6a1e-44ec-ad67-e8c46f84fa70/chat
- **Fonctionnalités** : Identique Annonce + disclaimer légal professionnel

#### Assistant Négociateur (Premium)
- **Statut** : ✅ FULLY UPGRADED - Feature parity avec Annonce  
- **Webhook** : https://hub.cardin.cloud/webhook/1c662402-e9f8-431e-9418-ec3122575872/chat
- **Fonctionnalités** : Identique Annonce, interface standard

### ✅ Fiche Logement Lite - SYSTÈME COMPLET

#### Architecture Technique Finalisée
- **BDD** : Table `fiche_lite` avec 24 colonnes JSONB (toutes sections)
- **Frontend** : FicheWizard + SidebarMenu + ProgressBar + 24 sections
- **État** : FormContext global avec auto-save parfaitement fonctionnel
- **Sécurité** : RLS policies Supabase (isolation utilisateurs validée)

#### Sections Implémentées : 24/24 ✅
1-23. **Sections formulaire** : Propriétaire → Sécurité (toutes opérationnelles)
24. **FicheFinalisation** : MiniDashboard + AlerteDetector + PDF + Assistant Annonce intégré

#### Fonctionnalités Intelligentes
- **MiniDashboard** : Aperçu inspection temps réel avec détection alertes
- **AlerteDetector** : Système d'alertes critiques/modérées/dégâts automatique
- **PdfFormatter** : Génération PDF prête pour webhook Kevin
- **Assistant Annonce intégré** : Dans finalisation avec sessionId stable

### ✅ Sidebar Conversations - SYSTÈME UNIVERSEL
- **Temps réel** : Channel Supabase avec live updates (plus de refresh manuel)
- **Responsive** : Hamburger menu mobile + sidebar desktop
- **Features** : Création, suppression, renommage conversations
- **Performance** : Debounce 120ms + guards userId + filtrage source
- **UX** : Labels intelligents (titre > question preview) + animations smooth

## 🧭 Priorités Actuelles Post-Succès

### 1. Finalisation Workflow
- **Test mémoire Kevin** : Validation sessionId stable sur tous assistants
- **Limitation historique** : GPT travaille sur solution affichage conversations
- **Polish FicheFinalisation** : Optimisation intégration Assistant Annonce
- **PDF final** : Tests webhook Kevin avec données réelles

### 2. Préparation Production
- **Validation UX** : Tests concierges utilisateurs finaux  
- **Performance** : Optimisations dernière minute si nécessaire
- **Documentation** : Guide utilisateur + onboarding

### 3. Évolutions Futures
- **API Stripe** : Abonnements, facturation
- **Features premium** : Export PDF, Agents Premium, Fiche Logement Lite, etc.

## 🔧 Conventions Techniques

### Nommage Strict
- Sections : `section_logement`, `section_avis` (snake_case)
- Composants : `FicheLogement.jsx`, `FicheAvis.jsx` (PascalCase)
- Routes : `/fiche`, `/dashboard` (kebab-case)

### Template Sections (Conservé pour maintenance future)
```jsx
// Structure fixe pour toutes les sections
<div className="flex min-h-screen">
  <SidebarMenu />
  <div className="flex-1 flex flex-col">
    <ProgressBar />
    <div className="flex-1 p-6 bg-gray-100">
      {/* Messages sauvegarde + Contenu + Navigation */}
    </div>
  </div>
</div>
```

### Process Ajout Section (Future maintenance)
1. Vérifier colonne JSONB dans Supabase
2. Ajouter dans initialFormData (FormContext)
3. Mapper dans supabaseHelpers
4. Créer composant avec template obligatoire
5. Intégrer dans FicheWizard steps[]
6. Tests complets (navigation, sauvegarde, chargement)

*Note : Process complet pour ajouts futurs, toutes sections actuelles implémentées*

## 💡 Contexte Julien

### Approche de Travail
- **Step-by-step** : Une étape à la fois, pas d'outline complet
- **Ton direct** : Humain, tutoiement, pas de jargon IA
- **Critique constructive** : Contester les suppositions si nécessaire
- **Pragmatique** : Solutions durables, pas de fix rapides

### Écosystème Projets
- **Letahost** : Conciergerie interne (source Fiche Logement lourde)
- **Invest Malin** : Formation concierges (cible Mon Équipe IA)
- **Transition** : Adaptation outils internes → usage externe

## 🚨 Points Critiques (Toujours Valides)

### Ne PAS Oublier
- Couleur dorée #dbae61 dans tous les CTA
- Protection premium sur routes sensibles  
- RLS policies pour isolation utilisateurs
- Mobile-first avec classes `md:`
- Validation données avec `|| ""` ou `|| {}`

### Pièges Évités (Leçons Apprises)
- Pas de sous-dossiers dans `src/components/`
- Pas d'inventions de tables inexistantes
- Pas de Context API inutile
- Pas de hardcode URLs/credentials
- SessionId dynamique = mémoire cassée (RÉSOLU)
- Process section incomplet = bugs garantis (RÉSOLU)

## ⚡ Action Immédiate Nouvelle Session

```
1. Lire Claude Brain (business_projects.json) pour contexte complet
2. Vérifier état Kevin memory system avec sessionId stable
3. Priorités : Limitation historique > FicheFinalisation > PDF final
4. Suivre méthodologie copy/modify pour modifications futures
5. Tests validation à chaque étape
```

### Ressources Disponibles  
- **AJOUT_SECTIONS.md** : Process détaillé step-by-step (maintenance future)
- **Claude Brain** : Contexte complet + historique session sept 2025
- **Artifacts disponibles** : SidebarConversations.jsx amélioré
- **Codebase repo** : Tous assistants uniformes et fonctionnels

## 🏆 Réussites Techniques Majeures (Sept 2025)

### Problèmes Résolus Définitivement
- ✅ **Mémoire IA brisée** : SessionId stable sur tous assistants
- ✅ **Sidebar manuelle** : Temps réel Supabase avec debounce intelligent  
- ✅ **Mix conversations** : Filtrage source + isolation parfaite
- ✅ **UX mobile pauvre** : Responsive hamburger + overlay
- ✅ **Upload fragile** : Validation PDF/DocX + error handling robuste
- ✅ **Messages fantômes** : Élimination placeholders + titre automatique
- ✅ **Auto-scroll cassé** : Système intelligent préservant contrôle utilisateur

### Architecture Scalable Établie
- **Sidebar universelle** : Un composant servant tous assistants
- **Error handling uniforme** : AbortController + timeouts + messages précis
- **File validation robuste** : Type + taille + vide avec feedback utilisateur
- **SessionId architecture** : Stable per-conversation pour mémoire IA
- **Database optimized** : RLS + indexation + isolation utilisateurs

---

**🎯 STATUT GLOBAL** : SYSTÈME PRODUCTION-READY  
**📋 PROCHAINES ÉTAPES** : Finitions + tests Kevin + préparation lancement  
**🔥 NEXT MILESTONE** : Déploiement concierges Invest Malin  
**📅 DERNIÈRE MÀJ** : 23 septembre 2025