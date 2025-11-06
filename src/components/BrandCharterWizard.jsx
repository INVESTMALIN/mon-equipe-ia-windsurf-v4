import { useState } from 'react'
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { createBrandCharter } from '../lib/supabaseHelpers'

export default function BrandCharterWizard({ userId, onComplete }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    business_description: '',
    target_audience: '',
    brand_style: '',
    tone_of_voice: '',
    location: ''
  })

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Préparer les données de la charte
      const charterData = {
        business_description: formData.business_description,
        target_audience: formData.target_audience,
        brand_style: formData.brand_style,
        tone_of_voice: formData.tone_of_voice,
        location: formData.location,
        color_palette: null, // On générera ça avec l'IA plus tard
        keywords: [], // On générera ça avec l'IA plus tard
        photos_urls: []
      }
      
      // Sauvegarder dans Supabase
      await createBrandCharter(userId, charterData)
      
      // Appeler le callback de succès
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
        return formData.business_description.trim().length > 20
      case 2:
        return formData.target_audience.trim().length > 10
      case 3:
        return formData.brand_style && formData.tone_of_voice
      case 4:
        return formData.location.trim().length > 2
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
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
            <span className="text-sm font-medium text-gray-700">Étape {step} sur 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Business Description */}
        {step === 1 && (
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

        {/* Step 2: Target Audience */}
        {step === 2 && (
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
              placeholder="Ex: Couples en week-end romantique, familles avec enfants, professionnels en déplacement, voyageurs cherchant l'authenticité..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500">
              {formData.target_audience.length} caractères (minimum 10)
            </p>
          </div>
        )}

        {/* Step 3: Style & Tone */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quel est votre style ?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {['Moderne', 'Cosy', 'Luxe', 'Nature', 'Urbain', 'Authentique'].map((style) => (
                  <button
                    key={style}
                    onClick={() => updateField('brand_style', style)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.brand_style === style
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{style}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quel ton de communication ?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {['Professionnel', 'Chaleureux', 'Décontracté', 'Premium', 'Local', 'Convivial'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => updateField('tone_of_voice', tone)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.tone_of_voice === tone
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{tone}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
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

          {step < 4 ? (
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