import { supabase } from '../supabaseClient'
import { saveFiche, loadFiche } from '../lib/supabaseHelpers'
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { initialFormData, NOUVELLE_FICHE_PRESELECTIONS } from '../lib/formDefaults'
import { LOCKED_FIELD_PATHS, isLockedFieldPath } from '../lib/lockedFields'

const FormContext = createContext()

// 🔥 SECTIONS DE FICHE LOGEMENT LITE : 24 sections de saisie + l'écran de Finalisation,
// soit 25 étapes du wizard. Seules les 24 premières ont une colonne JSONB en base et
// comptent dans le taux de complétion (cf. SECTIONS_COMPTEES dans DataProcessor).
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
  // Placée juste APRÈS Consommables, comme côté coordinateurs : la section affiche un
  // rappel en lecture seule des consommables, elle n'a de sens qu'une fois ceux-ci saisis.
  "Instructions Ménage",
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

// Etat d'une fiche NEUVE : la structure par defaut, plus les valeurs pre-selectionnees
// a la creation. Distinct d'`initialFormData`, qui sert aussi de socle de fusion au
// chargement : y mettre "FR" injecterait silencieusement un pays dans toute fiche creee
// avant l'existence du champ (cf. review Codex). Ici le defaut n'atteint qu'une fiche
// vierge, ou il est affiche a l'ecran et modifiable.
function nouvelleFiche() {
  return mergeWithDefaults(initialFormData, NOUVELLE_FICHE_PRESELECTIONS)
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
  const [formData, setFormData] = useState(nouvelleFiche)
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

  // Miroir toujours à jour de formData. handleSave le lit AU MOMENT d'écrire, et non
  // via la fermeture de son useCallback : une sauvegarde déclenchée par un traitement
  // long (l'agent guide d'accès met plusieurs minutes) écrirait sinon l'état d'il y a
  // plusieurs minutes, et une sauvegarde mise en file écrirait un état d'avant celle
  // qui la précède — donc sans l'id que l'INSERT vient d'obtenir.
  const formDataRef = useRef(formData)
  useEffect(() => { formDataRef.current = formData }, [formData])

  // Chaîne de sauvegarde : UNE écriture à la fois, dans l'ordre d'appel. Deux
  // sauvegardes concurrentes (auto-save débounced + sauvegarde explicite) pouvaient
  // se croiser : la plus ancienne terminait en dernier et réécrasait la plus récente,
  // et sur une fiche encore sans id les deux prenaient la branche INSERT de saveFiche,
  // créant deux lignes pour la même fiche.
  const saveChainRef = useRef(Promise.resolve())

  // Miroir de formData.fields_locked pour garder updateField stable (deps []) tout en
  // pouvant refuser une écriture sur un champ verrouillé sans lire un formData périmé.
  const fieldsLockedRef = useRef(false)
  useEffect(() => {
    fieldsLockedRef.current = !!formData.fields_locked
  }, [formData.fields_locked])

  // Génération de PDF en cours. Le verrou définitif n'est posé qu'APRÈS la remise du
  // fichier au navigateur — on ne verrouille jamais un PDF qui n'a pas été délivré.
  // Entre la construction du document et cette pose, l'identité du bien doit malgré
  // tout être figée : sans cela l'utilisateur peut revenir en arrière, modifier le
  // propriétaire ou l'adresse, et l'auto-save (5 s) persiste ces valeurs avant que le
  // verrou n'arrive. La fiche se retrouverait verrouillée sur une identité que le PDF
  // déjà téléchargé ne contient pas, et l'écran de finalisation autoriserait un second
  // PDF sur cette nouvelle identité — exactement le recyclage que le verrou existe pour
  // empêcher. Une ref, et non un state : `updateField` doit rester stable (deps []).
  const generationPdfRef = useRef(false)
  const setGenerationPdfEnCours = useCallback((enCours) => {
    generationPdfRef.current = !!enCours
  }, [])

  // Récupération utilisateur
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const updateField = useCallback((fieldPath, value) => {
    // Garde défensive : si la fiche est verrouillée — ou si un PDF est en cours de
    // génération, cf. generationPdfRef — on ignore toute écriture sur un champ
    // d'identité du bien (en plus du `disabled` des inputs et du trigger DB).
    // `updateField` est le SEUL chemin d'écriture de ces champs : les sections
    // Propriétaire et Logement n'utilisent pas `updateSection`.
    if ((fieldsLockedRef.current || generationPdfRef.current) && isLockedFieldPath(fieldPath)) return

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
    const executer = async () => {
      if (!user?.id) {
        setSaveStatus({ saving: false, saved: false, error: 'Utilisateur non connecté' });
        return { success: false, error: 'Utilisateur non connecté' };
      }

      setSaveStatus({ saving: true, saved: false, error: null });

      try {
        // État lu MAINTENANT (cf. formDataRef), pas à la création de ce callback.
        const dataToSave = {
          ...formDataRef.current,
          user_id: user.id,
          updated_at: new Date().toISOString()
        };

        const result = await saveFiche(dataToSave, user.id);

        if (result.success) {
          // On ne REMPLACE PAS l'état par la réponse serveur : entre l'envoi et la
          // réponse, l'utilisateur a pu saisir, ou un agent poser son résultat. Écraser
          // ferait disparaître ces valeurs de l'écran ET de la sauvegarde suivante. On
          // ne reprend donc que les champs dont le serveur fait autorité.
          const champsServeur = {
            id: result.data.id,
            user_id: result.data.user_id,
            created_at: result.data.created_at,
            updated_at: result.data.updated_at,
            fields_locked: result.data.fields_locked
          }
          // Ref d'abord : une sauvegarde déjà en file doit voir l'id sans attendre le
          // rendu, sinon elle repart sur un INSERT et duplique la fiche.
          formDataRef.current = { ...formDataRef.current, ...champsServeur }
          setFormData(prev => ({ ...prev, ...champsServeur }));
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
    }

    // Sérialisation : on s'enchaîne à la sauvegarde en cours, succès ou échec.
    const enCours = saveChainRef.current.then(executer, executer)
    saveChainRef.current = enCours.then(() => {}, () => {})
    return enCours
  }, [user])

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
    setFormData(nouvelleFiche())
    setCurrentStep(0) // Reset de l'étape
    setSaveStatus({ saving: false, saved: false, error: null })
  }, [])

  // Même chaîne que handleSave : la finalisation écrit la ligne ENTIÈRE, statut compris.
  // Hors chaîne, une sauvegarde encore en vol (auto-save, ou persistance d'un agent) —
  // qui porte le statut « Brouillon » — pouvait terminer après elle et défaire le
  // passage en « Complété ».
  const finaliserFiche = useCallback(async () => {
    const executer = async () => {
      setSaveStatus({ saving: true, saved: false, error: null })

      try {
        const { data: { user: utilisateur } } = await supabase.auth.getUser()
        const updatedFormData = { ...formDataRef.current, statut: 'Complété' }
        const result = await saveFiche(updatedFormData, utilisateur.id)

        if (result.success) {
          // Même règle que handleSave : on fusionne, on ne remplace pas.
          const champsServeur = {
            statut: 'Complété',
            id: result.data.id,
            user_id: result.data.user_id,
            created_at: result.data.created_at,
            updated_at: result.data.updated_at,
            fields_locked: result.data.fields_locked
          }
          formDataRef.current = { ...formDataRef.current, ...champsServeur }
          setFormData(prev => ({ ...prev, ...champsServeur }))
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
    }

    const enCours = saveChainRef.current.then(executer, executer)
    saveChainRef.current = enCours.then(() => {}, () => {})
    return enCours
  }, [])

  // ── Verrou d'identité du bien (cf. lib/lockedFields + trigger DB) ──────────────
  const isFicheLocked = !!formData.fields_locked

  const isFieldLocked = useCallback(
    (path) => !!formData.fields_locked && isLockedFieldPath(path),
    [formData.fields_locked]
  )

  // Enregistre en base la trace d'une génération de PDF RÉUSSIE, et pose le verrou
  // d'identité quand le parcours l'exige (1re génération d'un fiche_lite).
  //
  // ⚠️ UN SEUL UPDATE pour les deux champs, et c'est le point important : écrire
  // `pdf_generated_at` puis `fields_locked` en deux requêtes ouvrirait une fenêtre où
  // l'une aurait abouti et pas l'autre — fiche verrouillée sans preuve de PDF, ou
  // l'inverse. Un update de ligne unique est atomique : les deux champs arrivent
  // ensemble ou aucun.
  //
  // Le trigger de verrou laisse passer : il n'inspecte que la projection d'identité
  // (section_proprietaire / section_logement), inchangée ici — et sur une fiche déjà
  // verrouillée, écrire `pdf_generated_at` reste donc autorisé.
  //
  // Aucun de ces deux champs n'est réécrit par saveFiche : `mapFormDataToSupabase` ne
  // les contient pas. Cet update dédié est leur seul chemin d'écriture côté app.
  //
  // ⚠️ `ficheId` est passé par l'appelant, qui vient de sauvegarder et détient l'id
  // renvoyé par l'INSERT. Se fier à `formData.id` de la fermeture échouerait sur une
  // fiche CRÉÉE pendant la même action : ce callback a été capturé au rendu précédent,
  // où l'id était encore null — le PDF serait délivré sans preuve, et sans verrou.
  // Repli sur le miroir `formDataRef` puis sur la fermeture, dans cet ordre.
  const enregistrerPdfGenere = useCallback(async ({ withLock = false, ficheId } = {}) => {
    const id = ficheId || formDataRef.current?.id || formData.id
    if (!id) return { success: false, error: 'Fiche non enregistrée' }

    const horodatage = new Date().toISOString()
    const patch = withLock
      ? { pdf_generated_at: horodatage, fields_locked: true }
      : { pdf_generated_at: horodatage }

    const { error } = await supabase
      .from('fiche_lite')
      .update(patch)
      .eq('id', id)
    if (error) return { success: false, error: error.message }

    // MàJ locale sans déclencher d'auto-save (ce n'est pas une saisie utilisateur).
    isUserChangeRef.current = false
    setFormData(prev => ({ ...prev, ...patch }))
    return { success: true }
  }, [formData.id])

  return (
    <FormContext.Provider value={{
      // Données
      formData,
      updateField,
      updateSection,
      getField,

      // Verrou d'identité du bien
      isFicheLocked,
      isFieldLocked,
      enregistrerPdfGenere,
      setGenerationPdfEnCours,
      LOCKED_FIELD_PATHS,

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