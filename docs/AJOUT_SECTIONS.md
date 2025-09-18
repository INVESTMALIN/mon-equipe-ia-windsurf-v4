# PROCESS OPTIMISÉ - Ajout d'une nouvelle section

## 📋 CHECKLIST AVANT DE COMMENCER (terminé)

- [x] Identifier le nom exact de la section (ex: "FicheClefs")
- [x] Consulter la version existante du code de la nouvelle fiche dans le codebase de 'Fiche logement' (non-lite)
- [x] Définir les champs nécessaires et leurs types
- [x] Vérifier que la section existe dans le tableau `sections` du FormContext
- [x] S'assurer que l'ordre est correct dans le wizard

## 🎯 CONTEXTE INFRASTRUCTURE (DÉJÀ EN PLACE)

### Base de données Supabase
- ✅ **Table `fiche_lite` existe** avec toutes les colonnes `section_*` JSONB
- ✅ **RLS Policies configurées** pour isolation utilisateurs
- ✅ **Triggers et index** en place pour performance

### Mapping Supabase
- ✅ **supabaseHelpers.js** mappe déjà toutes les sections avec `|| {}`
- ✅ **FormContext** contient le tableau `sections` avec les 23 sections
- ✅ **Navigation wizard** opérationnelle avec SidebarMenu + ProgressBar

**Convention de nommage (CRITIQUE) :**
- Section "Avis" → colonne `section_avis` → `FicheAvis.jsx`
- Section "Clefs" → colonne `section_clefs` → `FicheClefs.jsx` 
- Champs toujours en snake_case : `type_propriete` (pas `typePropriete`)

## 🔧 ÉTAPE 1 : MISE À JOUR FORMCONTEXT

### 1.1 Remplacer la structure vide
Dans `src/components/FormContext.jsx`, remplacer :
```javascript
section_clefs: {},
```

Par la structure complète basée sur l'analyse du code source original.

### 1.2 Vérifier l'ordre dans le tableau sections
```javascript
// Vérifier que l'ordre est correct
const sections = [
  "Propriétaire",   // 1
  "Logement",       // 2
  "Avis",           // 3
  "Clefs",          // 4 ← Position correcte
  // ... autres
]
```

## 🎨 ÉTAPE 2 : CRÉATION DU COMPOSANT

### 2.1 Template obligatoire standardisé
```javascript
// src/components/fiche/sections/FicheClefs.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Key } from 'lucide-react' // Icône appropriée

export default function FicheClefs() {
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
                    <Key className="w-5 h-5 text-white" />
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
                    value={getField('section_clefs.champ_exemple') || ''}
                    onChange={(e) => handleInputChange('section_clefs.champ_exemple', e.target.value)}
                  />
                </div>
                
                {/* Grilles responsive pour plusieurs champs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Autres champs... */}
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

### 2.2 IMPORTS CRITIQUES - Arborescence des fichiers

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

### 🔥 2.3 RAPPELS PHOTOS (VERSION LITE) - ERREUR FRÉQUENTE

**ATTENTION CRITIQUE** : Les rappels photos doivent OBLIGATOIREMENT être connectés au FormContext !

#### ✅ BONNE MÉTHODE (testée et validée)
```javascript
// 1. Dans FormContext.jsx, ajouter la structure photos_rappels :
section_clefs: {
  // ... autres champs
  photos_rappels: {
    clefs_taken: false,
    emplacement_taken: false
  }
}

// 2. Dans le composant, connecter CORRECTEMENT :
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id="clefs_taken"
      className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
      checked={getField('section_clefs.photos_rappels.clefs_taken') || false}
      onChange={(e) => handleInputChange('section_clefs.photos_rappels.clefs_taken', e.target.checked)}
    />
    <label htmlFor="clefs_taken" className="text-sm text-yellow-800">
      📸 Pensez à prendre une photo des clefs
    </label>
  </div>
</div>
```

#### ❌ ERREUR TYPIQUE (NE PAS FAIRE)
```javascript
// ERREUR : Checkbox non connectée au FormContext
<input
  type="checkbox"
  id="photo_taken"
  className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
  // MANQUE : checked={...}
  // MANQUE : onChange={...}
/>
```

**CONSÉQUENCE DE L'ERREUR** : La checkbox ne se sauvegarde pas et se remet à zéro à chaque navigation !

## 🔌 ÉTAPE 3 : INTÉGRATION DANS FICHETIWIZARD

### 3.1 Ajouter l'import
Dans `src/components/fiche/FicheWizard.jsx` :
```javascript
import FicheClefs from './sections/FicheClefs'
```

### 3.2 Remplacer dans le tableau steps
Remplacer :
```javascript
<PlaceholderSection key="clefs" title="Clefs" sectionNumber="4" />,
```

Par :
```javascript
<FicheClefs key="clefs" />,
```

## ✅ ÉTAPE 4 : TESTS DE VALIDATION

### 4.1 Tests obligatoires
- [ ] **Compilation** : Aucune erreur d'import ou de syntaxe
- [ ] **Navigation** : Cliquer sur "Clefs" dans la sidebar fonctionne
- [ ] **Saisie** : Les champs se remplissent et se sauvegardent
- [ ] **Persistence** : Naviguer vers une autre section puis revenir conserve les données
- [ ] **Chargement** : Ouvrir une fiche existante charge les données de la section
- [ ] **Boutons** : Retour/Suivant/Enregistrer fonctionnent
- [ ] **Messages** : Indicateurs de sauvegarde s'affichent correctement
- [ ] **Responsive** : Design mobile-first fonctionne
- [ ] **🔥 Rappels photos** : Checkboxes restent cochées après navigation

### 4.2 Tests Supabase
```sql
-- Vérifier que les données sont bien sauvegardées
SELECT section_clefs FROM fiche_lite WHERE id = 'TON_ID_TEST';
```

### 4.3 Tests d'isolation
- [ ] Chaque utilisateur voit seulement ses données
- [ ] Pas de croisement entre fiches d'utilisateurs différents

## 🚨 POINTS CRITIQUES À NE PAS OUBLIER

### ⚠️ Nommage strict
- Section "Clefs" → `section_clefs` (pas `section_Clefs` ou autre)
- Champs en snake_case : `type_clef` (pas `typeClef`)

### ⚠️ Valeurs par défaut
- Toujours utiliser `|| ""` ou `|| {}` pour éviter les erreurs undefined
- Structure par défaut dans initialFormData obligatoire

### ⚠️ Types de données
- Texte simple : `string`
- Objets imbriqués : `object` (ex: adresse)
- Listes : `array`
- Booléens : `boolean` avec gestion `null`

### ⚠️ Sauvegarde
- Utiliser `updateField('section_clefs.champ', value)` avec le point
- Pour objets imbriqués : `updateField('section_clefs.adresse.rue', value)`

### ⚠️ Design et UX
- **OBLIGATOIRE** : Utiliser le composant `NavigationButtons` pour tous les formulaires
- **OBLIGATOIRE** : Respecter la structure de carte blanche avec header
- **OBLIGATOIRE** : Classes CSS cohérentes (focus doré, espacements)

### 🔥 ⚠️ Rappels photos (SUPER CRITIQUE)
- **OBLIGATOIRE** : Toujours connecter les checkboxes au FormContext
- **OBLIGATOIRE** : Utiliser `getField()` et `handleInputChange()`
- **OBLIGATOIRE** : Tester la persistence après navigation
- **ERREUR FRÉQUENTE** : Oublier `checked` et `onChange` = checkbox inutile !

## 🎯 CHECKLIST FINALE

- [ ] initialFormData mis à jour avec structure complète
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
- [ ] **🔥 Rappels photos connectés et testés**


## 🚫 ERREURS FRÉQUENTES À ÉVITER

1. **Mauvais imports** - Vérifier l'arborescence des dossiers
2. **Oublier NavigationButtons** - OBLIGATOIRE pour cohérence
3. **Structure CSS différente** - Suivre le template exact
4. **Props inutiles** - Pas de `title`/`sectionNumber` sur vrais composants
5. **Process incomplet** - Suivre TOUTES les étapes
6. **Tests insuffisants** - Validation complète obligatoire
7. **🔥 RAPPELS PHOTOS NON CONNECTÉS** - Erreur récurrente qui rend les checkboxes inutiles !