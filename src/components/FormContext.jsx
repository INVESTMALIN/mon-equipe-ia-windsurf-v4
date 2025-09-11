// src/components/FormContext.jsx
import { supabase } from '../supabaseClient'
import { saveFiche, loadFiche } from '../lib/supabaseHelpers'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'


const FormContext = createContext()

const initialFormData = {
  id: null,
  user_id: null,
  created_at: null,
  updated_at: null,
  nom: "Nouvelle fiche",
  statut: "Brouillon",
  
  section_proprietaire: {
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: {
      rue: "",
      complement: "",
      ville: "",
      codePostal: ""
    }
  },
  section_logement: {},
  section_avis: {},
  section_clefs: {},
  section_airbnb: {},
  section_booking: {},
  section_reglementation: {},
  section_exigences: {},
  section_gestion_linge: {},
  section_equipements: {},
  section_consommables: {},
  section_visite: {},
  section_chambres: {},
  section_salle_de_bains: {},
  section_cuisine_1: {},
  section_cuisine_2: {},
  section_salon_sam: {},
  section_equip_spe_exterieur: {},
  section_communs: {},
  section_teletravail: {},
  section_bebe: {},
  section_guide_acces: {},
  section_securite: {},
  
  photos_prises: {},
  rappels_photos: []
}

export function FormProvider({ children }) {
    const [user, setUser] = useState(null)

    useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
    })
    }, [])

    // Ajoute cet useEffect pour récupérer l'utilisateur
    useEffect(() => {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      }
      getUser()
    }, [])
  const [formData, setFormData] = useState(initialFormData)
  const [saveStatus, setSaveStatus] = useState({ 
    saving: false, 
    saved: false, 
    error: null 
  })

  const updateField = useCallback((fieldPath, value) => {
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

  const handleLoad = useCallback(async (ficheId) => {
    setSaveStatus({ saving: true, saved: false, error: null });
    try {
      const result = await loadFiche(ficheId)
      
      if (result.success) {
        setFormData(result.data)
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
    setSaveStatus({ saving: false, saved: false, error: null })
  }, [])

  return (
    <FormContext.Provider value={{ 
      formData,
      updateField,
      updateSection,
      getField,
      handleSave,
      handleLoad,
      saveStatus,
      resetForm
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
  return context
}