# PROCESS COMPLET - Ajout d'une nouvelle section

## 📋 CHECKLIST AVANT DE COMMENCER

- [ ] Identifier le nom exact de la section (ex: "FicheLogement")
- [ ] Consulter la version existante du code de la nouvelle fiche dans le codebase de 'Fiche logement' (non-lite)
- [ ] Définir les champs nécessaires et leurs types
- [ ] Vérifier que la section existe dans le tableau `sections` du FormContext
- [ ] S'assurer que l'ordre est correct dans le wizard

## 🗄️ ÉTAPE 1 : CONFIGURATION SUPABASE

### 1.1 Identifier la colonne JSONB
La section doit correspondre à une colonne JSONB dans la table `fiche_lite`.

**Convention de nommage :**
- Section "Logement" → colonne `section_logement`
- Section "Avis" → colonne `section_avis` 
- Section "Clefs" → colonne `section_clefs`

### 1.2 Vérifier que la colonne existe
```sql
-- Vérifier les colonnes existantes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fiche_lite' 
AND column_name LIKE 'section_%';
```

### 1.3 Si la colonne n'existe pas, la créer
```sql
-- Exemple pour section logement
ALTER TABLE fiche_lite 
ADD COLUMN section_logement JSONB DEFAULT '{}';
```

## 🧠 ÉTAPE 2 : MISE À JOUR FORMCONTEXT

### 2.1 Ajouter dans initialFormData
```javascript
// Dans src/components/FormContext.jsx
const initialFormData = {
  // ... autres sections
  section_logement: {
    // Définir la structure par défaut basée sur le composant
    type_propriete: "",
    surface: "",
    numero_bien: "",
    typologie: "",
    nombre_personnes_max: "",
    nombre_lits: "",
    appartement: {
      nom_residence: "",
      batiment: "",
      acces: "",
      etage: "",
      numero_porte: ""
    }
  },
  // ... autres sections
}
```

### 2.2 Vérifier l'ordre dans le tableau sections
```javascript
// Dans src/components/FormContext.jsx
const sections = [
  "Propriétaire",
  "Logement",     // ← Vérifier que c'est à la bonne position
  "Avis",
  // ... autres
]
```

## 🔧 ÉTAPE 3 : MISE À JOUR SUPABASEHELPERS

### 3.1 Mapping FormData → Supabase
```javascript
// Dans src/lib/supabaseHelpers.js
export const mapFormDataToSupabase = (formData) => {
  return {
    // ... autres mappings
    section_logement: formData.section_logement || {},
    // ... autres mappings
  }
}
```

### 3.2 Mapping Supabase → FormData
```javascript
// Dans src/lib/supabaseHelpers.js
export const mapSupabaseToFormData = (supabaseData) => {
  return {
    // ... autres mappings
    section_logement: supabaseData.section_logement || {},
    // ... autres mappings
  }
}
```

## 🎨 ÉTAPE 4 : CRÉATION DU COMPOSANT

### 4.1 Template obligatoire avec NavigationButtons
```javascript
// src/components/fiche/sections/FicheLogement.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import { useForm } from '../../FormContext'
import NavigationButtons from '../NavigationButtons'
import { Home } from 'lucide-react' // Icône appropriée

export default function FicheLogement() {
  const { 
    getField,
    updateField
  } = useForm()

  const handleInputChange = (fieldPath, value) => {
    updateField(fieldPath, value)
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Titre de la section</h1>
            
            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Titre section</h2>
                    <p className="text-gray-600">Description de la section</p>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="space-y-6">
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Champ exemple *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Placeholder" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={getField('section_logement.champ_exemple')}
                    onChange={(e) => handleInputChange('section_logement.champ_exemple', e.target.value)}
                  />
                </div>
                
                {/* Grilles responsive pour plusieurs champs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Autres champs... */}
                </div>
              </div>

              {/* Information sur la navigation - OPTIONNEL */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Navigation Wizard</h3>
                  <p className="text-blue-700 text-sm">
                    Utilisez le menu latéral pour naviguer entre les 23 sections du formulaire. 
                    Vos données sont sauvegardées automatiquement.
                  </p>
                </div>
              </div>

              {/* Boutons navigation standardisés - OBLIGATOIRE */}
              <NavigationButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 4.2 ⚠️ IMPORTS CRITIQUES - Arborescence des fichiers

**ATTENTION** : Les chemins d'import sont cruciaux depuis `src/components/fiche/sections/` :

```javascript
// ✅ CORRECTS
import SidebarMenu from '../SidebarMenu'           // fiche/SidebarMenu.jsx
import ProgressBar from '../ProgressBar'           // fiche/ProgressBar.jsx
import NavigationButtons from '../NavigationButtons' // fiche/NavigationButtons.jsx
import { useForm } from '../../FormContext'         // components/FormContext.jsx

// ❌ INCORRECTS (erreurs de compilation)
import SidebarMenu from '../components/SidebarMenu'  // NON !
import { useForm } from '../FormContext'            // NON !
import Button from '../../Button'                   // N'existe pas !
```

### 4.3 Classes CSS obligatoires pour cohérence

**Container principal :**
- `max-w-4xl mx-auto` - Container centré
- `bg-white rounded-xl shadow-sm p-8` - Carte blanche principale

**Champs de formulaire :**
- `w-full px-4 py-3 border border-gray-300 rounded-lg` - Style de base
- `focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all` - Focus doré

**Grilles responsive :**
- `grid grid-cols-1 md:grid-cols-2 gap-4` - 1 col mobile, 2 desktop
- `grid grid-cols-1 md:grid-cols-3 gap-4` - 1 col mobile, 3 desktop

## 🔗 ÉTAPE 5 : INTÉGRATION AU WIZARD

### 5.1 Import dans FicheWizard
```javascript
// src/components/fiche/FicheWizard.jsx
import FicheLogement from './sections/FicheLogement'

// Dans le tableau steps, remplacer le placeholder
const steps = [
  <FicheForm key="proprietaire" />,
  <FicheLogement key="logement" />, // ← Remplacer le PlaceholderSection
  <PlaceholderSection key="avis" title="Avis" sectionNumber="3" />,
  // ... autres
]
```

## ✅ ÉTAPE 6 : TESTS DE VALIDATION

### 6.1 Tests obligatoires
- [ ] **Compilation** : Aucune erreur d'import ou de syntaxe
- [ ] **Navigation** : Cliquer sur "Logement" dans la sidebar fonctionne
- [ ] **Saisie** : Les champs se remplissent et se sauvegardent
- [ ] **Persistence** : Naviguer vers une autre section puis revenir conserve les données
- [ ] **Chargement** : Ouvrir une fiche existante charge les données de la section
- [ ] **Boutons** : Retour/Suivant/Enregistrer fonctionnent
- [ ] **Messages** : Indicateurs de sauvegarde s'affichent correctement
- [ ] **Responsive** : Design mobile-first fonctionne

### 6.2 Tests Supabase
```sql
-- Vérifier que les données sont bien sauvegardées
SELECT section_logement FROM fiche_lite WHERE id = 'TON_ID_TEST';
```

### 6.3 Tests d'isolation
- [ ] Chaque utilisateur voit seulement ses données
- [ ] Pas de croisement entre fiches d'utilisateurs différents

## 🚨 POINTS CRITIQUES À NE PAS OUBLIER

### ⚠️ Nommage strict
- Section "Logement" → `section_logement` (pas `section_Logement` ou autre)
- Champs en snake_case : `type_propriete` (pas `typePropriete`)

### ⚠️ Valeurs par défaut
- Toujours utiliser `|| ""` ou `|| {}` pour éviter les erreurs undefined
- Structure par défaut dans initialFormData obligatoire

### ⚠️ Types de données
- Texte simple : `string`
- Objets imbriqués : `object` (ex: adresse)
- Listes : `array`
- Booléens : `boolean` avec gestion `null`

### ⚠️ Sauvegarde
- Utiliser `updateField('section_logement.champ', value)` avec le point
- Pour objets imbriqués : `updateField('section_logement.adresse.rue', value)`

### ⚠️ Design et UX
- **OBLIGATOIRE** : Utiliser le composant `NavigationButtons` pour tous les formulaires
- **OBLIGATOIRE** : Respecter la structure de carte blanche avec header
- **OBLIGATOIRE** : Classes CSS cohérentes (focus doré, espacements)
- **INTERDIT** : Créer ses propres boutons de navigation

## 🎯 CHECKLIST FINALE

- [ ] Colonne JSONB créée dans Supabase
- [ ] initialFormData mis à jour avec structure complète
- [ ] supabaseHelpers mappings ajoutés
- [ ] Composant créé avec template obligatoire
- [ ] Import NavigationButtons ajouté
- [ ] Import ajouté dans FicheWizard
- [ ] Placeholder remplacé dans steps[]
- [ ] Tests de compilation OK
- [ ] Tests de navigation OK
- [ ] Tests de sauvegarde OK
- [ ] Tests de chargement OK
- [ ] Aucune erreur console
- [ ] Isolation utilisateurs OK
- [ ] Design cohérent avec autres sections

## 📝 CONVENTION DE COMMIT

```
feat: Ajouter section Logement

- Colonne section_logement ajoutée à fiche_lite
- Composant FicheLogement.jsx créé avec NavigationButtons
- Navigation wizard mise à jour
- Tests validation passés
- Design cohérent avec FicheForm
```

## 🔄 COMPOSANT NAVIGATIONBUTTONS

Le composant `NavigationButtons.jsx` centralise :
- Messages de sauvegarde (saving, saved, error)
- Boutons Retour/Enregistrer/Suivant
- Style uniforme entre toutes les sections
- Logique de navigation complète

**Emplacement :** `src/components/fiche/NavigationButtons.jsx`

**Usage dans toutes les sections :**
```javascript
import NavigationButtons from '../NavigationButtons'

// En fin de formulaire, après le contenu
<NavigationButtons />
```

## 🚫 ERREURS FRÉQUENTES À ÉVITER

1. **Mauvais imports** - Vérifier l'arborescence des dossiers
2. **Oublier NavigationButtons** - OBLIGATOIRE pour cohérence
3. **Structure CSS différente** - Suivre le template exact
4. **Validation custom** - Version lite = simplicité
5. **Process incomplet** - Suivre TOUTES les étapes
6. **Tests insuffisants** - Validation complète obligatoire

**IMPORTANT :** Suivre ce process étape par étape sans sauter d'étapes évitera tous les problèmes de configuration, nommage et intégration.