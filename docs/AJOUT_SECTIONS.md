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
    // Définir la structure par défaut
    type_propriete: "",
    surface: "",
    numero_bien: "",
    adresse: {
      rue: "",
      ville: "",
      code_postal: ""
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

### 4.1 Template de base obligatoire
```javascript
// src/components/fiche/sections/FicheLogement.jsx
import { useForm } from '../../FormContext'
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'

export default function FicheLogement() {
  const { 
    formData, 
    updateField, 
    handleSave, 
    saveStatus, 
    next, 
    back, 
    currentStep, 
    totalSteps 
  } = useForm()

  const handleInputChange = (field, value) => {
    updateField(`section_logement.${field}`, value)
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Messages sauvegarde - OBLIGATOIRE */}
          {saveStatus.saving && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              ⏳ Sauvegarde en cours...
            </div>
          )}
          {saveStatus.saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              ✅ Sauvegardé avec succès !
            </div>
          )}
          {saveStatus.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              ❌ {saveStatus.error}
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Informations Logement</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* CONTENU DE LA SECTION ICI */}
              
              <div className="space-y-6">
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Type de propriété *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Appartement, Maison, Studio..." 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={formData.section_logement?.type_propriete || ""}
                    onChange={(e) => handleInputChange('type_propriete', e.target.value)}
                  />
                </div>
                
                {/* Autres champs... */}
              </div>
            </div>

            {/* Navigation - OBLIGATOIRE */}
            <div className="mt-8 flex justify-between items-center">
              <button 
                onClick={back} 
                disabled={currentStep === 0}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Retour
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saveStatus.saving}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {saveStatus.saving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
                
                <button 
                  onClick={next}
                  disabled={currentStep === totalSteps - 1}
                  className="flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

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
- [ ] **Navigation** : Cliquer sur "Logement" dans la sidebar fonctionne
- [ ] **Saisie** : Les champs se remplissent et se sauvegardent
- [ ] **Persistence** : Naviguer vers une autre section puis revenir conserve les données
- [ ] **Chargement** : Ouvrir une fiche existante charge les données de la section
- [ ] **Boutons** : Retour/Suivant/Enregistrer fonctionnent

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

## 🎯 CHECKLIST FINALE

- [ ] Colonne JSONB créée dans Supabase
- [ ] initialFormData mis à jour
- [ ] supabaseHelpers mappings ajoutés
- [ ] Composant créé avec template obligatoire
- [ ] Import ajouté dans FicheWizard
- [ ] Placeholder remplacé dans steps[]
- [ ] Tests de navigation OK
- [ ] Tests de sauvegarde OK
- [ ] Tests de chargement OK
- [ ] Aucune erreur console
- [ ] Isolation utilisateurs OK

## 📝 CONVENTION DE COMMIT

```
feat: Ajouter section Logement

- Colonne section_logement ajoutée à fiche_lite
- Composant FicheLogement.jsx créé
- Navigation wizard mise à jour
- Tests validation passés
```

**IMPORTANT :** Suivre ce process étape par étape sans sauter d'étapes évitera tous les problèmes de configuration, nommage et intégration.