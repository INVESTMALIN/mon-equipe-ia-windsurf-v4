import { useState } from 'react'
import { ChevronRight, ChevronLeft, Sparkles, Upload, X, Palette } from 'lucide-react'
import ColorThief from 'colorthief'
import { createBrandCharter, updateBrandCharter, getUserBrandCharter } from '../lib/supabaseHelpers'

// Palettes pré-définies par style
const COLOR_PALETTES = {
  chauds: [
    { name: 'Méditerranée', colors: ['#E8A87C', '#C38D5C', '#8B6F47', '#FFF8DC'] },
    { name: 'Terracotta', colors: ['#E07A5F', '#F2CC8F', '#81B29A', '#F4F1DE'] },
    { name: 'Doré', colors: ['#D4AF37', '#F4E4C1', '#8B7355', '#FFFFFF'] },
  ],
  froids: [
    { name: 'Océan', colors: ['#264653', '#2A9D8F', '#E9C46A', '#F4F4F4'] },
    { name: 'Nordique', colors: ['#4A5568', '#718096', '#CBD5E0', '#F7FAFC'] },
    { name: 'Minimaliste', colors: ['#2C3E50', '#34495E', '#ECF0F1', '#FFFFFF'] },
  ],
  naturels: [
    { name: 'Forêt', colors: ['#2D5016', '#6A994E', '#A7C957', '#F2E8CF'] },
    { name: 'Campagne', colors: ['#8B7355', '#A0826D', '#C9B79C', '#F5F5DC'] },
    { name: 'Jardin', colors: ['#52796F', '#84A98C', '#CAD2C5', '#F6FFF8'] },
  ],
  neutres: [
    { name: 'Élégant', colors: ['#000000', '#333333', '#CCCCCC', '#FFFFFF'] },
    { name: 'Doux', colors: ['#4A4A4A', '#8E8E8E', '#D9D9D9', '#F8F8F8'] },
    { name: 'Moderne', colors: ['#1A1A1A', '#666666', '#E0E0E0', '#FAFAFA'] },
  ],
  luxe: [
    { name: 'Royal', colors: ['#6A0572', '#AB83A1', '#D4AF37', '#FFFEF7'] },
    { name: 'Prestige', colors: ['#8B0000', '#C19A6B', '#2C2C2C', '#F5F5F5'] },
    { name: 'Raffiné', colors: ['#4B3832', '#854442', '#BE9B7B', '#FFF4E6'] },
  ],
}

export default function BrandCharterWizard({ userId, onComplete, onCancel }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // États pour le logo
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [extractedColors, setExtractedColors] = useState([])
  const [extractingColors, setExtractingColors] = useState(false)
  
  // États pour le flow couleurs
  const [keepExtractedColors, setKeepExtractedColors] = useState(null) // true/false/null
  const [showColorWizard, setShowColorWizard] = useState(false)
  const [selectedPalette, setSelectedPalette] = useState(null)
  const [finalColors, setFinalColors] = useState([])
  
  const [formData, setFormData] = useState({
    // Étape 1 : Votre conciergerie
    conciergerie_name: '',
    years_experience: '',
    team_structure: '',
    
    // Étape 2 : Vos objectifs de communication
    communication_goals: [], // Array de strings
    communication_goals_other: '',
    communication_habits: '',
    
    // Étape 3 : Parlez-nous de votre activité
    business_description: '',
    
    // Étape 4 : Qui sont vos clients idéaux ?
    target_audience: '',
    
    // Étape 5 : Où se trouvent vos logements ?
    location: '',
    
    // Étape 6 : Votre style et ton de communication
    tone_of_voice: [], // Array de strings (multi-select)
    recurring_keywords: '',
    pronoun_tu_vous: '', // 'Tu' ou 'Vous'
    pronoun_je_neutral: '', // 'Je' ou 'Neutre'
    
    // Étape 7 : Votre palette de couleur
    visual_style: [], // Array de strings (multi-select)
    has_logo: '', // 'Oui', 'Oui mais à moderniser', 'Non'
    wants_color_charter: null, // true/false/null (pour le flow sans logo)
    
    // Legacy (conservés pour compatibilité mais pas utilisés dans le formulaire)
    brand_style: [],
    keywords: [],
    photos_urls: []
  })  

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field, value) => {
    setFormData(prev => {
      const currentArray = prev[field] || []
      if (currentArray.includes(value)) {
        // Retirer si déjà présent
        return { ...prev, [field]: currentArray.filter(v => v !== value) }
      } else {
        // Ajouter si pas encore là (max 3)
        if (currentArray.length >= 3) {
          return prev // Ne rien faire si déjà 3
        }
        return { ...prev, [field]: [...currentArray, value] }
      }
    })
  }

  // Fonction d'extraction de couleurs
  const extractColors = (file) => {
    setExtractingColors(true)
    
    const img = new Image()
    const reader = new FileReader()
    
    reader.onload = (e) => {
      img.src = e.target.result
      setLogoPreview(e.target.result)
      
      img.onload = () => {
        try {
          const colorThief = new ColorThief()
          const palette = colorThief.getPalette(img, 5)
          
          const hexColors = palette.map(rgb => {
            const r = rgb[0].toString(16).padStart(2, '0')
            const g = rgb[1].toString(16).padStart(2, '0')
            const b = rgb[2].toString(16).padStart(2, '0')
            return `#${r}${g}${b}`
          })
          
          setExtractedColors(hexColors)
          
          // Si "Oui" → auto-accepter les couleurs
          if (formData.has_logo === 'Oui') {
            setFinalColors(hexColors)
          }
          
          setExtractingColors(false)
        } catch (error) {
          console.error('Erreur extraction couleurs:', error)
          setExtractingColors(false)
          alert('Erreur lors de l\'extraction des couleurs')
        }
      }
      
      img.onerror = () => {
        setExtractingColors(false)
        alert('Erreur de chargement de l\'image')
      }
    }
    
    reader.readAsDataURL(file)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      alert('Format non supporté. Utilisez PNG ou JPG.')
      return
    }
    
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Fichier trop volumineux. Maximum 5MB.')
      return
    }
    
    setLogoFile(file)
    extractColors(file)
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setExtractedColors([])
    setKeepExtractedColors(null)
    setFinalColors([])
    document.querySelector('input[type="file"]').value = ''
  }

  const handleKeepColors = (keep) => {
    setKeepExtractedColors(keep)
    if (keep) {
      setFinalColors(extractedColors)
    } else {
      setShowColorWizard(true)
    }
  }

  const handlePaletteSelect = (palette) => {
    setSelectedPalette(palette)
    setFinalColors(palette.colors)
    setShowColorWizard(false)
  }

  const handleNext = () => {
    if (step < 7) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const charterData = {
        // Étape 1 : Votre conciergerie
        conciergerie_name: formData.conciergerie_name,
        years_experience: formData.years_experience,
        team_structure: formData.team_structure,
        
        // Étape 2 : Vos objectifs de communication
        communication_goals: formData.communication_goals,
        communication_goals_other: formData.communication_goals_other,
        communication_habits: formData.communication_habits,
        
        // Étape 3 : Parlez-nous de votre activité
        business_description: formData.business_description,
        
        // Étape 4 : Qui sont vos clients idéaux ?
        target_audience: formData.target_audience,
        
        // Étape 5 : Où se trouvent vos logements ?
        location: formData.location,
        
        // Étape 6 : Votre style et ton de communication
        tone_of_voice: formData.tone_of_voice,
        recurring_keywords: formData.recurring_keywords,
        pronoun_tu_vous: formData.pronoun_tu_vous,
        pronoun_je_neutral: formData.pronoun_je_neutral,
        
        // Étape 7 : Votre palette de couleur
        visual_style: formData.visual_style,
        has_logo: formData.has_logo,
        color_palette: finalColors.length > 0 ? { colors: finalColors } : null,
        
        // Legacy (conservés pour compatibilité)
        brand_style: formData.brand_style || [],
        keywords: [],
        photos_urls: []
      }
      
      // Vérifier si une charte existe déjà
      const existingCharter = await getUserBrandCharter(userId)
      
      if (existingCharter) {
        // Mettre à jour la charte existante
        await updateBrandCharter(userId, charterData)
      } else {
        // Créer une nouvelle charte
        await createBrandCharter(userId, charterData)
      }
      
      onComplete()
    } catch (error) {
      console.error('Erreur création charte:', error)
      alert('Erreur lors de la création de votre charte. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch(step) {
      case 1:
        // Étape 1 : tous les champs obligatoires
        return (
          formData.conciergerie_name.trim().length > 0 &&
          formData.years_experience.trim().length > 0 &&
          formData.team_structure.trim().length > 0
        )
      
      case 2:
        // Étape 2 : au moins 1 objectif sélectionné + habitudes renseignées
        const hasGoals = formData.communication_goals.length > 0
        const hasOtherFilled = formData.communication_goals.includes('Autre') 
          ? formData.communication_goals_other.trim().length > 0 
          : true
        const hasHabits = formData.communication_habits.trim().length > 0
        
        return hasGoals && hasOtherFilled && hasHabits
      
      case 3:
        // Étape 3 : description minimum 20 caractères
        return formData.business_description.trim().length >= 20

      case 4:
        // Étape 4 : audience minimum 10 caractères
        return formData.target_audience.trim().length >= 10

      case 5:
        // Étape 5 : localisation minimum 2 caractères
        return formData.location.trim().length >= 2

      case 6:
        // Étape 6 : au moins 1 ton + mots-clés min 20 chars + les 2 pronoms sélectionnés
        return (
          formData.tone_of_voice.length > 0 &&
          formData.recurring_keywords.trim().length >= 20 &&
          formData.pronoun_tu_vous.trim().length > 0 &&
          formData.pronoun_je_neutral.trim().length > 0
      )

      case 7:
      // Étape 7 : au moins 1 style visuel + validation des couleurs selon le cas
      if (formData.visual_style.length === 0 || !formData.has_logo) {
        return false
      }
      
      // Si "Oui" → besoin des couleurs extraites
      if (formData.has_logo === 'Oui') {
        return finalColors.length > 0
      }
      
      // Si "Moderniser" → besoin de réponse sur garder couleurs
      if (formData.has_logo === 'Oui mais il faudrait le moderniser') {
        return keepExtractedColors !== null && finalColors.length > 0
      }
      
      // Si "Non" → besoin de réponse sur vouloir charte
      if (formData.has_logo === 'Non') {
        if (formData.wants_color_charter === null) return false
        if (formData.wants_color_charter === true) {
          return finalColors.length > 0
        }
        return true // Si ne veut pas de charte, c'est OK
      }
      
      return true
      
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          {onCancel && (
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          )}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Créons votre identité de marque
          </h1>
          <p className="text-gray-600">
            Quelques questions pour personnaliser vos contenus
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Étape {step} sur 7</span>
            <span className="text-sm text-gray-500">{Math.round((step / 7) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* ÉTAPE 1 : VOTRE CONCIERGERIE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Votre conciergerie
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Commençons par mieux vous connaître
              </p>

              {/* Nom de la conciergerie */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de votre conciergerie
                </label>
                <input
                  type="text"
                  value={formData.conciergerie_name}
                  onChange={(e) => updateField('conciergerie_name', e.target.value)}
                  placeholder="Ex: Conciergerie Lyon Presqu'île"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Années d'expérience */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Depuis combien de temps exercez-vous ?
                </label>
                <div className="space-y-2">
                  {['Moins de 6 mois', '6 mois à 2 ans', '2 à 5 ans', 'Plus de 5 ans'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateField('years_experience', option)}
                      className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                        formData.years_experience === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Structure d'équipe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travaillez-vous seul(e) ou en équipe ?
                </label>
                <div className="space-y-2">
                  {['Seul(e)', 'En duo / couple', 'Petite équipe (3-5 personnes)'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateField('team_structure', option)}
                      className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                        formData.team_structure === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : VOS OBJECTIFS DE COMMUNICATION */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Vos objectifs de communication
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Qu'aimeriez-vous améliorer grâce à votre communication ?
              </p>

              {/* Objectifs (checkboxes multiples) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionnez un ou plusieurs objectifs
                </label>
                <div className="space-y-2">
                  {[
                    'Gagner en visibilité',
                    'Attirer plus de propriétaires',
                    'Fidéliser mes clients',
                    'Avoir une image plus professionnelle',
                    'Gagner du temps avec mes publications'
                  ].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleArrayField('communication_goals', goal)}
                      className={`w-full p-3 border-2 rounded-lg text-left transition-all flex items-center gap-3 ${
                        formData.communication_goals.includes(goal)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.communication_goals.includes(goal)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.communication_goals.includes(goal) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{goal}</span>
                    </button>
                  ))}
                  
                  {/* Option "Autre" */}
                  <button
                    onClick={() => {
                      const hasAutre = formData.communication_goals.includes('Autre')
                      if (hasAutre) {
                        // Retirer "Autre" et vider le champ texte
                        updateField('communication_goals', formData.communication_goals.filter(g => g !== 'Autre'))
                        updateField('communication_goals_other', '')
                      } else {
                        // Ajouter "Autre"
                        toggleArrayField('communication_goals', 'Autre')
                      }
                    }}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all flex items-center gap-3 ${
                      formData.communication_goals.includes('Autre')
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      formData.communication_goals.includes('Autre')
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.communication_goals.includes('Autre') && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">Autre</span>
                  </button>
                  
                  {/* Champ texte conditionnel pour "Autre" */}
                  {formData.communication_goals.includes('Autre') && (
                    <input
                      type="text"
                      value={formData.communication_goals_other}
                      onChange={(e) => updateField('communication_goals_other', e.target.value)}
                      placeholder="Précisez votre objectif"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ml-8"
                    />
                  )}
                </div>
              </div>

              {/* Habitudes de communication actuelles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment décririez-vous aujourd'hui votre communication ?
                </label>
                <div className="space-y-2">
                  {[
                    'Je publie rarement',
                    'Je publie souvent, mais sans vraie stratégie',
                    "Je n'aime pas m'en occuper",
                    "J'aimerais être plus régulier mais je manque d'idées"
                  ].map((habit) => (
                    <button
                      key={habit}
                      onClick={() => updateField('communication_habits', habit)}
                      className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                        formData.communication_habits === habit
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{habit}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : PARLEZ-NOUS DE VOTRE ACTIVITÉ */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Parlez-nous de votre activité
            </h2>
            <p className="text-sm text-gray-600">
              Décrivez votre conciergerie, vos logements, ce qui vous rend unique.
            </p>
            <textarea
              value={formData.business_description}
              onChange={(e) => updateField('business_description', e.target.value)}
              placeholder="Ex: Je gère 3 appartements de charme dans le centre historique de Lyon. Mes logements sont décorés avec goût, alliant modernité et authenticité..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500">
              {formData.business_description.length} caractères (minimum 20)
            </p>
          </div>
        )}

        {/* ÉTAPE 4 : QUI SONT VOS CLIENTS IDÉAUX ? */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Qui sont vos clients idéaux ?
            </h2>
            <p className="text-sm text-gray-600">
              Décrivez le type de voyageurs que vous ciblez.
            </p>
            <textarea
              value={formData.target_audience}
              onChange={(e) => updateField('target_audience', e.target.value)}
              placeholder="Ex: Couples en week-end romantique, familles avec enfants, professionnels en déplacement, voyageurs recherchant l'authenticité..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500">
              {formData.target_audience.length} caractères (minimum 10)
            </p>
          </div>
        )}

        {/* ÉTAPE 5 : OÙ SE TROUVENT VOS LOGEMENTS ? */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Où se trouvent vos logements ?
            </h2>
            <p className="text-sm text-gray-600">
              Ville, quartier, région... Ces informations enrichiront vos contenus.
            </p>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Ex: Lyon 2ème, Presqu'île"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Minimum 2 caractères
            </p>
          </div>
        )}

        {/* ÉTAPE 6 : VOTRE STYLE ET TON DE COMMUNICATION */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Votre style et ton de communication
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Définissons ensemble votre identité verbale
              </p>

              {/* Ton de communication (multi-select) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quel ton de communication ?
                </label>
                <p className="text-xs text-gray-500 mb-3">Sélectionnez 1 à 3 tons</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Professionnel',
                    'Chaleureux',
                    'Décontracté',
                    'Premium',
                    'Educatif',
                    'Convivial',
                    'Inspirant',
                    'Dynamique',
                    'Rassurant',
                    'Humoristique'
                  ].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => toggleArrayField('tone_of_voice', tone)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.tone_of_voice.includes(tone)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{tone}</span>
                    </button>
                  ))}
                </div>
                {formData.tone_of_voice.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ {formData.tone_of_voice.length}/3 sélectionné(s)
                  </p>
                )}
              </div>

              {/* Mots-clés récurrents */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avez-vous des mots-clés, slogans, ou expressions récurrentes ?
                </label>
                <textarea
                  value={formData.recurring_keywords}
                  onChange={(e) => updateField('recurring_keywords', e.target.value)}
                  placeholder="Ex: Je vis mes vacances"
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.recurring_keywords.length} caractères (minimum 20)
                </p>
              </div>

              {/* Pronom Tu/Vous */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilisez-vous le pronom personnel "Tu" ou plus formel "Vous" ?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Tu', 'Vous'].map((pronoun) => (
                    <button
                      key={pronoun}
                      onClick={() => updateField('pronoun_tu_vous', pronoun)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.pronoun_tu_vous === pronoun
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{pronoun}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pronom Je/Neutre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilisez-vous le point de vue personnel avec le pronom "Je" ou neutre pour parler de votre activité ?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Je', 'Neutre'].map((pronoun) => (
                    <button
                      key={pronoun}
                      onClick={() => updateField('pronoun_je_neutral', pronoun)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.pronoun_je_neutral === pronoun
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{pronoun}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 7 : VOTRE PALETTE DE COULEUR */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Votre palette de couleur
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Définissons ensemble votre identité visuelle
              </p>

              {/* Style visuel (multi-select) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quel est votre style visuel souhaité ?
                </label>
                <p className="text-xs text-gray-500 mb-3">Sélectionnez 1 à 3 styles</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Moderne',
                    'Cosy',
                    'Luxe',
                    'Nature',
                    'Urbain',
                    'Authentique',
                    'Minimaliste',
                    'Décalé',
                    'Décontracté',
                    'Institutionnel'
                  ].map((style) => (
                    <button
                      key={style}
                      onClick={() => toggleArrayField('visual_style', style)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.visual_style.includes(style)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{style}</span>
                    </button>
                  ))}
                </div>
                {formData.visual_style.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ {formData.visual_style.length}/3 sélectionné(s)
                  </p>
                )}
              </div>

              {/* Question logo - MODIFIÉ */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avez-vous un logo ?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      updateField('has_logo', 'Oui')
                      // Reset les états liés aux couleurs si changement
                      if ('Oui' !== formData.has_logo) {
                        setLogoFile(null)
                        setLogoPreview(null)
                        setExtractedColors([])
                        setKeepExtractedColors(null)
                        setFinalColors([])
                        setShowColorWizard(false)
                      }
                    }}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.has_logo === 'Oui'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">Oui</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      updateField('has_logo', 'Oui mais il faudrait le moderniser')
                      // Reset les états liés aux couleurs si changement
                      if ('Oui mais il faudrait le moderniser' !== formData.has_logo) {
                        setLogoFile(null)
                        setLogoPreview(null)
                        setExtractedColors([])
                        setKeepExtractedColors(null)
                        setFinalColors([])
                        setShowColorWizard(false)
                      }
                    }}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.has_logo === 'Oui mais il faudrait le moderniser'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900 text-sm">Oui, mais pas satisafait(e)</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      updateField('has_logo', 'Non')
                      // Reset les états liés aux couleurs si changement
                      if ('Non' !== formData.has_logo) {
                        setLogoFile(null)
                        setLogoPreview(null)
                        setExtractedColors([])
                        setKeepExtractedColors(null)
                        setFinalColors([])
                        setShowColorWizard(false)
                      }
                    }}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.has_logo === 'Non'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">Non</span>
                  </button>
                </div>
              </div>

              {/* CAS 1 & 2 : Upload logo si "Oui" ou "Moderniser" */}
              {(formData.has_logo === 'Oui' || formData.has_logo === 'Oui mais il faudrait le moderniser') && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Téléchargez votre logo
                  </label>
                  
                  {!logoPreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Cliquez pour télécharger votre logo
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG ou JPG, max 5MB
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="max-h-32 mx-auto rounded-lg"
                      />
                      <button
                        onClick={removeLogo}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      {extractingColors ? (
                        <div className="text-center py-4">
                          <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Analyse des couleurs...</p>
                        </div>
                      ) : extractedColors.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-3 text-center mt-4">
                            ✨ Couleurs détectées dans votre logo :
                          </p>
                          <div className="flex gap-2 justify-center flex-wrap mb-4">
                            {extractedColors.map((color, idx) => (
                              <div key={idx} className="text-center">
                                <div
                                  className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                                <p className="text-xs text-gray-600 mt-1">{color}</p>
                              </div>
                            ))}
                          </div>

                          {/* CAS 1 : "Oui" → Auto-accepter */}
                          {formData.has_logo === 'Oui' && (
                            <p className="text-xs text-green-700 text-center bg-green-50 border border-green-200 rounded p-2">
                              ⁺₊⋆˙⟡ Ces couleurs seront utilisées pour personnaliser vos contenus ✩₊˚.⋆⁺₊✧
                            </p>
                          )}

                          {/* CAS 2 : "Moderniser" → Demander confirmation */}
                          {formData.has_logo === 'Oui mais il faudrait le moderniser' && keepExtractedColors === null && (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-700 text-center">
                                Souhaitez-vous conserver ces couleurs ?
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => handleKeepColors(true)}
                                  className="p-3 border-2 border-green-500 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                  <span className="font-medium text-green-700">Oui, conserver</span>
                                </button>
                                <button
                                  onClick={() => handleKeepColors(false)}
                                  className="p-3 border-2 border-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                                >
                                  <span className="font-medium text-orange-700">Non, choisir d'autres</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Confirmation après choix */}
                          {formData.has_logo === 'Oui mais il faudrait le moderniser' && keepExtractedColors === true && (
                            <p className="text-xs text-green-700 text-center bg-green-50 border border-green-200 rounded p-2">
                              ⁺₊⋆˙⟡ Ces couleurs seront utilisées pour personnaliser vos contenus ✩₊˚.⋆⁺₊✧
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CAS 3 : Pas de logo → Demander s'ils veulent une charte */}
              {formData.has_logo === 'Non' && (
                <div className="mb-6 space-y-3">
                  <p className="text-sm text-gray-700">
                    Souhaitez-vous définir une charte de couleurs ?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        updateField('wants_color_charter', true)
                        setShowColorWizard(true)
                      }}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        formData.wants_color_charter === true
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">Oui</span>
                    </button>
                    <button
                      onClick={() => {
                        updateField('wants_color_charter', false)
                        setShowColorWizard(false)
                        setFinalColors([])
                      }}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        formData.wants_color_charter === false
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">Non</span>
                    </button>
                  </div>
                  
                  {formData.wants_color_charter === false && (
                    <p className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-2">
                      💡 L'IA proposera des couleurs adaptées à votre style visuel
                    </p>
                  )}
                </div>
              )}

              {/* MINI WIZARD COULEURS */}
              {showColorWizard && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                  
                  <button
                    onClick={() => {
                      setShowColorWizard(false)
                      setKeepExtractedColors(null)
                      setSelectedPalette(null)
                      setFinalColors([])
                    }}
                    className="mb-3 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                  >
                    ← Retour au choix précédent
                  </button>
                          
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Choisissez votre palette de couleurs
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(COLOR_PALETTES).map(([category, palettes]) => (
                      <div key={category}>
                        <p className="text-sm font-medium text-gray-700 mb-2 capitalize">
                          {category === 'chauds' && '🟠 Tons chauds'}
                          {category === 'froids' && '🔵 Tons froids'}
                          {category === 'naturels' && '🟢 Naturels'}
                          {category === 'neutres' && '⚪ Neutres'}
                          {category === 'luxe' && '💜 Luxe'}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {palettes.map((palette) => (
                            <button
                              key={palette.name}
                              onClick={() => handlePaletteSelect(palette)}
                              className={`p-3 border-2 rounded-lg transition-all ${
                                selectedPalette?.name === palette.name
                                  ? 'border-purple-500 bg-white shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              <p className="text-xs font-medium text-gray-900 mb-2">{palette.name}</p>
                              <div className="flex gap-1 justify-center">
                                {palette.colors.map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="w-6 h-6 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedPalette && (
                    <div className="mt-4 p-3 bg-white border border-purple-300 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Palette sélectionnée : {selectedPalette.name}
                      </p>
                      <div className="flex gap-2 justify-center">
                        {selectedPalette.colors.map((color, idx) => (
                          <div key={idx} className="text-center">
                            <div
                              className="w-10 h-10 rounded-full border-2 border-gray-200"
                              style={{ backgroundColor: color }}
                            />
                            <p className="text-xs text-gray-600 mt-1">{color}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Affichage couleurs finales sélectionnées */}
              {finalColors.length > 0 && !showColorWizard && formData.has_logo !== 'Oui' && keepExtractedColors !== true && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2 text-center">
                    Vos couleurs de marque
                  </p>
                  <div className="flex gap-2 justify-center">
                    {finalColors.map((color, idx) => (
                      <div key={idx} className="text-center">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-xs text-gray-600 mt-1">{color}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}



        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>

          {step < 7 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer ma charte
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}