# CLAUDE.md - Cerveau du Projet Mon Équipe IA

## 🎯 Vue d'Ensemble Rapide

### Mission Principale
**Mon Équipe IA** - Plateforme d'assistants IA pour conciergerie immobilière (Invest Malin)
- 1 assistant gratuit (Formation) ✅ OPÉRATIONNEL
- 3 assistants premium (Fiscaliste, Annonce, Négociateur) ⏳ EN ATTENTE
- **NOUVEAU : Fiche Logement Lite** 🚀 DÉVELOPPEMENT EN COURS

### Projet Actuel Prioritaire
**Fiche Logement Lite** - Intégration d'un système de fiches d'inspection immobilière
- Source : Adaptation de l'app Letahost (23 sections, 800+ champs)
- Cible : Fonctionnalité premium Mon Équipe IA (version allégée)
- État : **Système wizard complet opérationnel** ✅
- Phase : Développement des 22 sections restantes

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
conversations (user_id, source, question, answer, conversation_id)
users (id, subscription_status, stripe_customer_id, etc.)

-- 🆕 Tables Fiche Logement Lite  
fiche_lite (id, user_id, nom, statut, section_* JSONB, photos_prises)
```

## 🚀 État Actuel - Septembre 2025

### ✅ Fiche Logement Lite - Réalisé
- **Système wizard complet** avec navigation 23 sections
- **FicheWizard.jsx** + SidebarMenu + ProgressBar fonctionnels
- **Section 1 (Propriétaire)** complètement opérationnelle
- **Base de données** table `fiche_lite` avec colonnes JSONB
- **Protection premium** intégrée (subscription_status)
- **Isolation utilisateurs** validée (RLS policies)
- **Sauvegarde/chargement** automatique des données
- **Route `/fiche`** avec gestion ID et FormContext

### ⏳ Fiche Logement Lite - En Cours  
- **Sections 2-23** : Développement des composants restants
- **Process standardisé** défini pour ajout sécurisé de sections
- **Validation** des workflows d'inspection complets

### ✅ Mon Équipe IA - Opérationnel
- Landing page + système auth complet
- Assistant Formation avec webhook n8n
- Stripe Customer Portal + gestion abonnements
- Paywall fonctionnel (free vs premium)
- Historique conversations + sidebar navigation

### ⏳ Mon Équipe IA - En Attente
- Webhooks n8n pour les 3 assistants payants
- Pages chat individuelles pour assistants premium
- Webhooks Stripe pour automation abonnements

## 🧭 Hiérarchie Priorités

### 1. PRIORITÉ ABSOLUE - Fiche Logement 
- **Développement sections** : FicheLogement, FicheAvis, FicheClefs...
- **Suivre process défini** : Colonne JSONB → FormContext → Composant → Tests
- **Objectif** : 23 sections opérationnelles avant fin septembre

### 2. Assistants Premium
- Attente webhooks n8n de Julien pour intégration
- Pages individuelles + protection paywall

### 3. Optimisations
- Webhooks Stripe automation
- Performance + UX improvements

## 🔧 Conventions Techniques

### Nommage Strict
- Sections : `section_logement`, `section_avis` (snake_case)
- Composants : `FicheLogement.jsx`, `FicheAvis.jsx` (PascalCase)
- Routes : `/fiche`, `/dashboard` (kebab-case)

### Template Obligatoire Sections
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

### Process Ajout Section (CRITIQUE)
1. Vérifier colonne JSONB dans Supabase
2. Ajouter dans initialFormData (FormContext)
3. Mapper dans supabaseHelpers
4. Créer composant avec template obligatoire
5. Intégrer dans FicheWizard steps[]
6. Tests complets (navigation, sauvegarde, chargement)

## 💡 Contexte Julien

### Profil
- Transition linguiste → spécialiste IA/no-code
- Approche step-by-step (ne pas faire d'outline complet)
- Ton direct, humain, tutoiement
- Contester les suppositions si nécessaire

### Projets Parallèles
- **Letahost** : Conciergerie immobilière (source Fiche Logement)
- **Invest Malin** : Formation conciergerie (cible Mon Équipe IA)

## 🚨 Points Critiques

### Ne PAS Oublier
- Couleur dorée #dbae61 dans tous les CTA
- Protection premium sur routes sensibles
- RLS policies pour isolation utilisateurs
- Mobile-first avec classes `md:`
- Validation données avec `|| ""` ou `|| {}`

### Pièges Évités
- Pas de sous-dossiers dans `src/components/`
- Pas d'inventions de tables inexistantes
- Pas de Context API inutile
- Pas de hardcode URLs/credentials
- Process section incomplet = bugs garantis

## ⚡ Action Immédiate Chaque Session

```
1. Demander objectif session + état webhooks n8n
2. Projet Fiche Logement → Quelle section créer ?
3. Autres projets → Préciser priorité vs Fiche Logement  
4. Suivre process défini sans shortcuts
5. Tests validation à chaque étape
6. Consulter le doc du AJOUT_SECTIONS.md (process d'ajout de nouvelles sections)
```

---

**🎯 FOCUS ACTUEL** : Développement sections Fiche Logement Lite  
**📋 PROCHAINE ÉTAPE** : Créer FicheLogement.jsx (Section 2) selon process  
**🔥 MILESTONE** : 23 sections opérationnelles fin septembre 2025