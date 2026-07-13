import { supabase } from '../supabaseClient'
import { saveFiche, loadFiche } from '../lib/supabaseHelpers'
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { initialFormData } from '../lib/formDefaults'

const FormContext = createContext()

// 🔥 SECTIONS DE FICHE LOGEMENT LITE (23 sections)
const sections = [
  "Propriétaire",
  "Logement",
  "Avis",
  "Clefs",
  "Airbnb",
  "Booking",
  "Réglementation",
  "Exigences",
  "Gestion Linge",
  "Équipements",
  "Consommables",
  "Visite",
  "Chambres",
  "Salle de Bains",
  "Cuisine 1",
  "Cuisine 2",
  "Salon SAM",
  "Équip. Extérieur",
  "Communs",
  "Télétravail",
  "Bébé",
  "Guide Accès",
  "Sécurité",
  "Finalisation"
]


// Fusionne les données chargées PAR-DESSUS `initialFormData`. Les valeurs présentes dans
// la fiche gagnent ; les clés/sous-structures absentes ou vides sont remplies depuis le
// modèle par défaut. But : une fiche à sections vides (ou à qui manque un champ ajouté
// depuis sa création) se rouvre sans planter — les composants de section supposent la
// structure imbriquée complète (ex. section_proprietaire.adresse.rue). Toujours des objets
// frais, aucune référence partagée avec `initialFormData`. Pour une fiche déjà complète,
// c'est un no-op (les valeurs chargées priment) → aucune régression.
function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function mergeWithDefaults(defaults, loaded) {
  if (Array.isArray(defaults)) {
    return loaded === undefined ? [...defaults] : loaded
  }
  if (!isPlainObject(defaults)) {
    // Défaut scalaire ou null : la valeur chargée gagne si elle existe.
    return loaded === undefined ? defaults : loaded
  }
  if (!isPlainObject(loaded)) {
    // Un objet est attendu ici : si le chargé est absent/null, on reconstruit la structure
    // par défaut (copie fraîche) ; sinon (valeur incompatible) on respecte le chargé.
    return (loaded === undefined || loaded === null) ? mergeWithDefaults(defaults, {}) : loaded
  }
  const out = {}
  for (const key of Object.keys(defaults)) {
    out[key] = mergeWithDefaults(defaults[key], loaded[key])
  }
  // Clés présentes uniquement dans la fiche chargée (données historiques) : on les conserve.
  for (const key of Object.keys(loaded)) {
    if (!(key in defaults)) out[key] = loaded[key]
  }
  return out
}

export function FormProvider({ children }) {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saveStatus, setSaveStatus] = useState({
    saving: false,
    saved: false,
    error: null
  })

  // 🔥 État de navigation
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = sections.length

  // Flag pour distinguer changements utilisateur vs serveur
  const isUserChangeRef = useRef(false)
  const lastSaveRef = useRef(0)

  // Récupération utilisateur
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const updateField = useCallback((fieldPath, value) => {
    isUserChangeRef.current = true

    setFormData(prev => {
      const newData = { ...prev }
      const keys = fieldPath.split('.')
      let current = newData

      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined || current[keys[i]] === null) {
          current[keys[i]] = {}
        } else if (typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {}
        } else {
          current[keys[i]] = { ...current[keys[i]] }
        }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      newData.updated_at = new Date().toISOString()

      return newData
    })
  }, [])

  const updateSection = useCallback((sectionName, newData) => {
    isUserChangeRef.current = true

    setFormData(prev => ({
      ...prev,
      [sectionName]: {
        ...(prev[sectionName] || {}),
        ...newData
      },
      updated_at: new Date().toISOString()
    }))
  }, [])

  const getField = useCallback((fieldPath) => {
    const keys = fieldPath.split('.')
    let current = formData

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return ""
      }
    }

    return current !== null && current !== undefined ? current : ""
  }, [formData])

  // Fonctions de navigation
  const next = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps])

  const back = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goTo = useCallback((step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step)
    }
  }, [totalSteps])

  const getCurrentSection = useCallback(() => {
    return sections[currentStep]
  }, [currentStep])

  const handleSave = useCallback(async () => {
    if (!user?.id) {
      setSaveStatus({ saving: false, saved: false, error: 'Utilisateur non connecté' });
      return { success: false, error: 'Utilisateur non connecté' };
    }

    setSaveStatus({ saving: true, saved: false, error: null });

    try {
      const dataToSave = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const result = await saveFiche(dataToSave, user.id);

      if (result.success) {
        setFormData(result.data);
        setSaveStatus({ saving: false, saved: true, error: null });
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, saved: false }))
        }, 3000)
        return { success: true, data: result.data };
      } else {
        setSaveStatus({ saving: false, saved: false, error: result.message });
        return { success: false, error: result.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur de connexion';
      setSaveStatus({ saving: false, saved: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [formData, user])

  // Auto-save automatique avec debounce
  useEffect(() => {
    // Ne rien faire si pas d'utilisateur
    if (!user?.id) return

    // Ne rien faire si c'est une mise à jour interne (pas utilisateur)
    if (!isUserChangeRef.current) return

    // Ne rien faire si déjà en train de sauvegarder
    if (saveStatus.saving) return

    // Anti-spam : minimum 1.5s entre deux sauvegardes
    const now = Date.now()
    if (now - lastSaveRef.current < 1500) return

    // Debounce de 2 secondes
    const timeout = setTimeout(async () => {
      isUserChangeRef.current = false // Reset le flag avant de sauvegarder
      lastSaveRef.current = Date.now()
      await handleSave()
    }, 5000)

    return () => clearTimeout(timeout)
  }, [formData, user?.id, saveStatus.saving, handleSave])

  const handleLoad = useCallback(async (ficheId) => {
    setSaveStatus({ saving: true, saved: false, error: null });
    try {
      const result = await loadFiche(ficheId)

      if (result.success) {
        // Fusion par-dessus les valeurs par défaut : une fiche à sections vides ou à qui
        // manque un champ récent se rouvre sans planter, une fiche complète est inchangée.
        setFormData(mergeWithDefaults(initialFormData, result.data))
        setSaveStatus({ saving: false, saved: true, error: null });
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, saved: false }))
        }, 3000)
        return { success: true, data: result.data }
      } else {
        setSaveStatus({ saving: false, saved: false, error: result.message });
        return { success: false, error: result.message }
      }
    } catch (error) {
      setSaveStatus({ saving: false, saved: false, error: error.message || 'Erreur de connexion' });
      return { success: false, error: 'Erreur de connexion' }
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setCurrentStep(0) // Reset de l'étape
    setSaveStatus({ saving: false, saved: false, error: null })
  }, [])

  const finaliserFiche = useCallback(async () => {
    setSaveStatus({ saving: true, saved: false, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const updatedFormData = { ...formData, statut: 'Complété' }
      const result = await saveFiche(updatedFormData, user.id)

      if (result.success) {
        setFormData(result.data)
        setSaveStatus({ saving: false, saved: true, error: null })
        return { success: true }
      } else {
        setSaveStatus({ saving: false, saved: false, error: result.message })
        return { success: false, error: result.message }
      }
    } catch (error) {
      setSaveStatus({ saving: false, saved: false, error: error.message })
      return { success: false, error: error.message }
    }
  }, [formData])

  return (
    <FormContext.Provider value={{
      // Données
      formData,
      updateField,
      updateSection,
      getField,

      // Persistance
      handleSave,
      handleLoad,
      loadFicheData: handleLoad,
      saveStatus,
      resetForm,
      finaliserFiche,

      // Navigation
      currentStep,
      totalSteps,
      sections,
      next,
      back,
      goTo,
      getCurrentSection
    }}>
      {children}
    </FormContext.Provider>
  )
}

export function useForm() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return {
    ...context,
    loadFicheData: context.handleLoad // Alias pour compatibilité
  }
}