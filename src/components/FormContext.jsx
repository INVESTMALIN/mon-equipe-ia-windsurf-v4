import { supabase } from '../supabaseClient'
import { saveFiche, loadFiche } from '../lib/supabaseHelpers'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
  "Sécurité"
]

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
  
  section_logement: {
    type_propriete: "",
    type_autre_precision: "",
    surface: "",
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

  section_avis: {
    // Évaluation quartier
    quartier_types: [],
    quartier_securite: "",
    quartier_perturbations: "",
    quartier_perturbations_details: "",
    
    // Évaluation immeuble
    immeuble_etat_general: "",
    immeuble_proprete: "",
    immeuble_accessibilite: "",
    immeuble_niveau_sonore: "",
    
    // Évaluation logement
    logement_etat_general: "",
    logement_etat_details: "",
    logement_proprete: "",
    logement_proprete_details: "",
    logement_ambiance: [],
    logement_absence_decoration_details: "",
    logement_decoration_personnalisee_details: "",
    logement_vis_a_vis: "",
    
    // Atouts du logement
    atouts_logement: {
      lumineux: false,
      rustique: false,
      central: false,
      convivial: false,
      authentique: false,
      douillet: false,
      design_moderne: false,
      terrasse_balcon: false,
      proche_transports: false,
      piscine: false,
      jacuzzi: false,
      cheminee: false,
      charmant: false,
      elegant: false,
      atypique: false,
      renove: false,
      familial: false,
      cosy_confortable: false,
      decoration_traditionnelle: false,
      jardin: false,
      proche_commerces: false,
      sauna_spa: false,
      video_projecteur: false,
      station_recharge_electrique: false,
      romantique: false,
      paisible: false,
      chic: false,
      accueillant: false,
      tranquille: false,
      spacieux: false,
      vue_panoramique: false,
      parking_prive: false,
      equipements_haut_gamme: false,
      billard: false,
      jeux_arcade: false,
      table_ping_pong: false,
      autres_atouts: false
    },
    atouts_logement_autre: "",
    autres_caracteristiques: "",
    
    // Types de voyageurs
    types_voyageurs: {
      duo_amoureux: false,
      nomades_numeriques: false,
      aventuriers_independants: false,
      tribus_familiales: false,
      bandes_amis: false,
      voyageurs_experience: false,
      autres_voyageurs: false
    },
    types_voyageurs_autre: "",
    explication_adaptation: "",
    
    // Rappels photos (VERSION LITE)
    photos_rappels: {
      video_globale_taken: false,
      vis_a_vis_taken: false
    }
  },

section_clefs: {
    // Type de boîte à clés
    boiteType: "", // "TTlock", "Igloohome", "Masterlock"
    boiteType_autre_precision: "",
    emplacementBoite: "",
    
    // Configurations spécifiques par type
    ttlock: {
      masterpinConciergerie: "",
      codeProprietaire: "",
      codeMenage: ""
    },
    igloohome: {
      masterpinConciergerie: "",
      codeVoyageur: "",
      codeProprietaire: "",
      codeMenage: ""
    },
    masterlock: {
      code: ""
    },
    
    // Interphone
    interphone: null, // true/false/null
    interphoneDetails: "",
    
    // Tempo-gâche
    tempoGache: null, // true/false/null
    tempoGacheDetails: "",
    
    // Digicode
    digicode: null, // true/false/null
    digicodeDetails: "",
    
    // Clefs physiques
    clefs: {
      precision: "",
      prestataire: null, // true/false/null
      details: ""
    },
    
    // Rappels photos (VERSION LITE)
    photos_rappels: {
      emplacement_taken: false,
      interphone_taken: false,
      tempo_gache_taken: false,
      digicode_taken: false,
      clefs_taken: false
    }
  },
  
  section_airbnb: {
    annonce_active: null, // true/false/null
    url_annonce: "",
    identifiants_obtenus: null, // true/false/null
    email_compte: "",
    mot_passe: "",
    explication_refus: ""
  },
  
  section_booking: {
    annonce_active: null, // true/false/null
    url_annonce: "",
    identifiants_obtenus: null, // true/false/null
    email_compte: "",
    mot_passe: "",
    explication_refus: ""
  },

  section_reglementation: {
    // Villes et réglementation
    ville_changement_usage: "",
    ville_declaration_simple: "",
    date_expiration_changement: "",
    numero_declaration: "",
    details_reglementation: "",
    
    // Documents checklist
    documents: {
      carte_identite: false,
      rib: false,
      cerfa: false,
      assurance_pno: false,
      rcp: false,
      acte_propriete: false
    }
  },

  section_exigences: {
  nombre_nuits_minimum: "",
  tarif_minimum_nuit: "",
  dates_bloquees: "",
  precisions_exigences: ""
},

section_gestion_linge: {
  dispose_de_linge: null, // true/false/null
  
  // Inventaires par taille de lit
  inventaire_90x200: {
    couettes: "",
    oreillers: "",
    draps_housses: "",
    housses_couette: "",
    protections_matelas: "",
    taies_oreillers: ""
  },
  inventaire_140x200: {
    couettes: "",
    oreillers: "",
    draps_housses: "",
    housses_couette: "",
    protections_matelas: "",
    taies_oreillers: ""
  },
  inventaire_160x200: {
    couettes: "",
    oreillers: "",
    draps_housses: "",
    housses_couette: "",
    protections_matelas: "",
    taies_oreillers: ""
  },
  inventaire_180x200: {
    couettes: "",
    oreillers: "",
    draps_housses: "",
    housses_couette: "",
    protections_matelas: "",
    taies_oreillers: ""
  },
  inventaire_autres: {
    draps_bain: "",
    petites_serviettes: "",
    tapis_bain: "",
    torchons: "",
    plaids: "",
    oreillers_decoratifs: ""
  },
  
  // État du linge
  etat_neuf: false,
  etat_usage: false,
  etat_propre: false,
  etat_sale: false,
  etat_tache: false,
  etat_informations: "",
  
  // Emplacement du stock
  emplacement_description: "",
  emplacement_code_cadenas: "",
  
  // Rappels photos
  photos_rappels: {
    linge_taken: false,
    emplacement_taken: false
  }
},

section_equipements: {
  // Équipements techniques essentiels
  poubelle_emplacement: "",
  poubelle_ramassage: "",
  disjoncteur_emplacement: "",
  vanne_eau_emplacement: "",
  systeme_chauffage_eau: "", // "Chaudière" ou "Ballon d'eau chaude"
  chauffage_eau_emplacement: "",
  
  // Équipements et commodités (checklist)
  climatisation: false,
  lave_linge: false,
  seche_linge: false,
  parking_equipement: false,
  tourne_disque: false,
  coffre_fort: false,
  ascenseur: false,
  animaux_acceptes: false,
  fetes_autorisees: false,
  tv: false,
  chauffage: false,
  fer_repasser: false,
  etendoir: false,
  piano: false,
  cinema: false,
  compacteur_dechets: false,
  accessible_mobilite_reduite: false,
  fumeurs_acceptes: false,
  
  // Configuration Wi-Fi
  wifi_statut: "", // "oui", "en_cours", "non"
  wifi_details: "",
  
  // Parking
  parking_type: "", // "rue", "sur_place", "payant"
  parking_rue_details: "",
  parking_sur_place_types: [], // array de types multiples
  parking_sur_place_details: "",
  parking_payant_type: "", // radio unique
  parking_payant_details: "",
  
  // Photos rappels (VERSION LITE)
  photos_rappels: {
    video_acces_poubelle_taken: false,
    poubelle_taken: false,
    disjoncteur_taken: false,
    vanne_arret_taken: false,
    chauffage_eau_taken: false,
    video_systeme_chauffage_taken: false
  }
},

section_consommables: {
  fournis_par_prestataire: null, // true/false/null
  
  // Consommables recommandés (ex-obligatoires)
  papier_toilette: false,
  savon_mains: false,
  produit_vaisselle: false,
  eponge_cuisine: false,
  sel_poivre_sucre: false,
  cafe_the: false,
  essuie_tout: false,
  sac_poubelle: false,
  produit_vitres: false,
  produit_sol: false,
  produit_salle_bain: false,
  produit_wc_javel: false,
  consommables_recommandes_autre: false,
  consommables_recommandes_autre_details: "",
  
  // Consommables "Sur demande"
  gel_douche: false,
  shampoing: false,
  apres_shampoing: false,
  pastilles_lave_vaisselle: false,
  autre_consommable: false,
  autre_consommable_details: "",
  
  // Types de café
  cafe_nespresso: false,
  cafe_senseo: false,
  cafe_tassimo: false,
  cafe_soluble: false,
  cafe_moulu: false,
  cafe_grain: false,
  cafe_autre: false,
  cafe_autre_details: ""
},

section_visite: {
  // Types de pièces (checkboxes)
  pieces_chambre: false,
  pieces_salon: false,
  pieces_salle_bains: false,
  pieces_salon_prive: false,
  pieces_kitchenette: false,
  pieces_cuisine: false,
  pieces_salle_manger: false,
  pieces_bureau: false,
  pieces_salle_jeux: false,
  pieces_salle_sport: false,
  pieces_buanderie: false,
  pieces_terrasse: false,
  pieces_balcon: false,
  pieces_jardin: false,
  pieces_autre: false,
  pieces_autre_details: "",
  
  // Nombres conditionnels
  nombre_chambres: "", // si pieces_chambre = true
  nombre_salles_bains: "", // si pieces_salle_bains = true
  
  // Photos rappels (VERSION LITE)
  photos_rappels: {
    video_visite_taken: false
  }
},

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
  const [formData, setFormData] = useState(initialFormData)
  const [saveStatus, setSaveStatus] = useState({ 
    saving: false, 
    saved: false, 
    error: null 
  })
  
  // 🔥 État de navigation
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = sections.length

  // Récupération utilisateur
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

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
    setCurrentStep(0) // Reset de l'étape
    setSaveStatus({ saving: false, saved: false, error: null })
  }, [])

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
      loadFicheData: handleLoad, // Alias pour FicheForm
      saveStatus,
      resetForm,
      
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