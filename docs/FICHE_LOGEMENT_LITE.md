# FICHE LOGEMENT LITE - Documentation Technique Complète

## 📋 Vue d'Ensemble du Projet

### Mission
Intégrer une version allégée de l'application "Fiche Logement" (outil interne Letahost) dans la plateforme "Mon Équipe IA" (produit Invest Malin) comme fonctionnalité premium payante pour les concierges externes.

### Contexte Stratégique
- **Fiche Logement** : App React complexe, 23 sections, 750+ colonnes DB, uploads médias, PDF, intégrations Make/Monday
- **Mon Équipe IA** : Plateforme d'assistants IA, modèle freemium, utilisateurs formation Invest Malin
- **Objectif** : Offrir l'outil pro Letahost aux clients externes via plan premium

## 🏗️ Architecture Retenue

### Choix d'Architecture : "Fork Optimisé"
- **Option retenue** : Créer composants allégés dans Mon Équipe IA
- **Alternative écartée** : Lien externe (UX fragmentée, double auth)
- **Alternative écartée** : Micro-service (trop complexe, 1 seul dev)

### Stack Technique
- **Frontend** : React + Vite + Tailwind (cohérent Mon Équipe IA)
- **Backend** : Instance Supabase séparée Mon Équipe IA 
- **Auth** : Auth Supabase Mon Équipe IA (unifiée)
- **Protection** : Routes protégées par statut premium
- **Données** : Isolation complète des données Letahost

## 📊 Architecture des Données

### Structure Actuelle Fiche Logement
```sql
-- Table principale (750+ colonnes)
fiches (
  id UUID PRIMARY KEY,
  user_id UUID,
  nom TEXT,
  statut TEXT, -- 'Brouillon', 'Complété', 'Archivé'
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  -- Section Propriétaire
  section_proprietaire JSONB,
  -- Section Logement  
  section_logement JSONB,
  -- Section Clefs
  section_clefs JSONB,
  -- ... 20 autres sections
  -- Colonnes médias (À SUPPRIMER en version lite)
  photos_urls TEXT[],
  videos_urls TEXT[],
  documents_urls TEXT[]
)
```

### Structure Proposée Fiche Logement Lite
```sql
-- Table simplifiée (même structure, colonnes médias adaptées)
fiche_lite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  nom TEXT NOT NULL,
  statut TEXT DEFAULT 'Brouillon', -- 'Brouillon', 'Complété'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Sections identiques (structure JSON conservée)
  section_proprietaire JSONB,
  section_logement JSONB,
  section_clefs JSONB,
  -- ... autres sections
  
  -- Remplacement colonnes médias
  photos_prises JSONB, -- {section: boolean} ex: {"cuisine": true, "sdb": false}
  rappels_photos TEXT[] -- ["Pensez à photographier la cuisine", "..."]
)

-- RLS Policies (proposition initiale — voir plus bas la version RÉELLE en base :
-- 4 policies séparées fiche_lite_*_policy, PAS de policy FOR ALL. L'INSERT est en outre
-- role-aware + protégé par une policy restrictive depuis le système de crédits.)
ALTER TABLE fiche_lite ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fiche_lite_all_policy" ON fiche_lite
  FOR ALL USING (auth.uid() = user_id); -- ⚠️ non appliqué tel quel ; remplacé par 4 policies par commande
```

## 🔧 Configuration Backend Critique

### Variables d'Environnement
```env
# Supabase Mon Équipe IA (existant)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Pas de nouvelles variables nécessaires
# (même instance Supabase, pas d'intégrations externes)
```

### Scripts SQL à Exécuter (Phase 1 post-validation)
```sql
-- 1. Création table principale
CREATE TABLE fiche_lite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  statut TEXT DEFAULT 'Brouillon' CHECK (statut IN ('Brouillon', 'Complété')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Toutes les sections JSONB (à détailler selon besoins)
  section_proprietaire JSONB DEFAULT '{}',
  section_logement JSONB DEFAULT '{}',
  section_clefs JSONB DEFAULT '{}',
  -- TODO: Ajouter les 20 autres sections
  
  -- Gestion des photos (version lite)
  photos_prises JSONB DEFAULT '{}',
  rappels_photos TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- 2. RLS Policies (noms réels en base : préfixe fiche_lite_)
ALTER TABLE fiche_lite ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fiche_lite_select_policy" ON fiche_lite
  FOR SELECT USING (auth.uid() = user_id);

-- ⚠️ Depuis le système de crédits (débit à la création), l'INSERT est role-aware :
-- un utilisateur `fiche_lite` ne peut PAS insérer en direct (il passe par la RPC
-- create_fiche_lite_with_debit qui débite 1 crédit) ; les autres rôles insèrent comme avant.
-- Version réelle : voir migration 20260710101000_fiche_lite_insert_role_aware.sql.
CREATE POLICY "fiche_lite_insert_policy" ON fiche_lite
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fiche_lite_update_policy" ON fiche_lite
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "fiche_lite_delete_policy" ON fiche_lite
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fiche_lite_updated_at 
  BEFORE UPDATE ON fiche_lite
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Index pour performance
CREATE INDEX idx_fiche_lite_user_id ON fiche_lite(user_id);
CREATE INDEX idx_fiche_lite_statut ON fiche_lite(statut);
CREATE INDEX idx_fiche_lite_created_at ON fiche_lite(created_at DESC);
```

## 📋 Mapping Fonctionnel - 23 Sections

### Sections Fiche Logement Existantes
1. **FicheForm** - Propriétaire
2. **FicheLogement** - Informations logement
3. **FicheClefs** - Gestion des clefs
4. **FicheEquipements** - Équipements disponibles
5. **FicheCuisine** - État cuisine
6. **FicheSalleDeBain** - État salle de bain
7. **FicheChambre1** - Chambre principale 
8. **FicheChambre2** - Chambre secondaire 
9. **FicheChambre3** - Chambre tertiaire 
10. **FicheSalon** - État salon 
... etc (13 autres sections)

### Adaptations Version Lite
- **Structure quasi-identique** : Même formulaire, mêmes champs (à quelques exception près)
- **Suppression uploads** : Remplacer `PhotoUpload.jsx` par checkboxes rappel
- **Suppression admin** : Pas de console, réaffectation, etc.
- **Design adapté** : Couleurs Mon Équipe IA (#dbae61)
- **Logique métier** : Adaptée à utilisation externe pour concierges (branding, wording, PDF, 'num de bien', etc.)

## 🚀 Roadmap de Développement

### ✅ Phase 0 - MVP Démo
- [x] Bannière Fiche Logement sur `/assistants`
- [x] Route `/dashboard` protégée premium
- [x] Dashboard avec 3 fiches de démo
- [x] Page formulaire démo (1 section)
- [x] Navigation Dashboard ↔ Formulaire

### ✅ Phase 1 - Backend Complet
- [x] Création table `fiche_lite` complète
- [x] Migration schéma des 23 sections
- [x] Tests CRUD complets
- [x] Sauvegarde progressive formulaire

### 🚧 Phase 2 - Formulaire Multi-Pages (EN COURS)
- [ ] Création des 22 autres composants de section
- [ ] FormContext adapté (sans hooks custom Letahost)
- [ ] Navigation entre sections (FormWizard simplifié)
- [ ] Gestion rappels photos (remplace PhotoUpload)

### ⏳ Phase 3 - PDF et Fonctionnalités Avancées
- [ ] Génération PDF (adapter système existant)
- [ ] Création d'annonces Airbnb/Booking
- [ ] Finalisation workflow complet
- [ ] Tests utilisateurs concierges externes

## 🔄 Composants à Créer/Adapter

### Composants Mon Équipe IA (Existants)
- ✅ `Dashboard.jsx` - Liste des fiches
- ✅ `FicheForm.jsx` - Formulaire section 1 (démo)
- ✅ Protection premium dans bannière

### Composants à Créer (Phase 2)
```
src/components/
│   ├── fiche/                        # "Fiche" (sheet/form) related components
│   │   ├── FicheWizard.jsx           # Main wizard for fiche forms
│   │   ├── MiniDashboard.jsx
│   │   ├── NavigationButtons.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── sections/                 # Subsections for fiche (modular form steps)
│   │   │   ├── FicheAirbnb.jsx
│   │   │   ├── FicheAvis.jsx
│   │   │   ├── FicheBebe.jsx
│   │   │   ├── FicheBooking.jsx
│   │   │   ├── FicheChambre.jsx
│   │   │   ├── FicheClefs.jsx
│   │   │   ├── FicheCommuns.jsx
│   │   │   ├── FicheConsommables.jsx
│   │   │   ├── FicheCuisine1.jsx
│   │   │   ├── FicheCuisine2.jsx
│   │   │   ├── FicheEquipements.jsx
│   │   │   ├── FicheEquipExterieur.jsx
│   │   │   ├── FicheExigences.jsx
│   │   │   ├── FicheFinalisation.jsx
│   │   │   ├── FicheForm.jsx
│   │   │   ├── FicheGestionLinge.jsx
│   │   │   ├── FicheGuideAcces.jsx
│   │   │   ├── FicheLogement.jsx
│   │   │   ├── FicheReglementation.jsx
│   │   │   ├── FicheSalleDeBains.jsx
│   │   │   ├── FicheSalonSam.jsx
│   │   │   ├── FicheSécurité.jsx
│   │   │   ├── FicheTeletravail.jsx
│   │   │   ├── FicheVisite.jsx
│   │   │   ├── FicheFinalisation.jsx (nouvelle section de finalisation du formulaire)
│   │   └── SidebarMenu.jsx
```

### Logique Métier à Adapter
- **FormContext** : État global formulaire (sans hooks custom Letahost)  
- **Sauvegarde auto** : Toutes les 30s + navigation
- **Validation** : Côté React (comme Fiche Logement original)
- **Navigation conditionnelle** : Pas de branches, 23 sections linéaires

## 🚫 Éléments À NE PAS Migrer

### Composants Letahost Exclus
- ❌ `ReassignModal.jsx` - Réaffectation fiches
- ❌ `UserRoleBadge.jsx` - Gestion rôles coordinateur/admin
- ❌ `DropdownMenu.jsx` - Actions admin complexes
- ❌ `PhotoUpload.jsx` - Upload médias (remplacé par rappels)
- ❌ Console admin complète
- ❌ Système d'archivage/restauration complexe

### Intégrations Externes Supprimées
- ❌ Webhooks Make (notifications, Google Drive)
- ❌ Intégration Monday CRM
- ❌ Triggers Supabase complexes (`notify_fiche_completed`)
- ❌ Edge Functions spécifiques Letahost
- ❌ Gestion utilisateurs coordinateurs/admins

### Fonctionnalités Médias
- ❌ Storage Supabase pour photos/vidéos
- ❌ Compression côté client
- ❌ Upload progressif
- ✅ Remplacé par : Checkboxes "Photo prise" + rappels visuels

## 📝 Notes Techniques Critiques

### Points d'Attention Backend
1. **Isolation données** : Aucun croisement avec tables Letahost
2. **Performance** : Index sur user_id, statut, dates critiques  
3. **Sécurité** : RLS policies strictes (user = propriétaire fiche)
4. **Évolutivité** : Structure JSON flexible pour ajouts futurs

### Points d'Attention Frontend  
1. **État global** : FormContext sans Redux (useState + useContext)
2. **Navigation** : Route paramétrisée `/fiche/:id?` pour nouveau/modifier
3. **Sauvegarde** : Debounce 500ms + indicateur visuel
4. **Design system** : Cohérence absolue avec Mon Équipe IA

### Considérations UX
1. **Premium wall** : Vérification statut à chaque route sensible
2. **Migration progressive** : Version lite → version complète possible
3. **Performance mobile** : Formulaire optimisé mobile-first
4. **Accessibilité** : Labels, contraste, navigation clavier


---

**Maintenu par** : Équipe Technique Invest Malin  
**Version** : 1.0 - Post-MVP Jeudi  
**Prochaine révision** : Post-réunion validation projet