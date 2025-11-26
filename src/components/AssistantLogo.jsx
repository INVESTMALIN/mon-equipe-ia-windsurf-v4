import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Wand2, Upload, X, Download, Info } from 'lucide-react'
import { supabase } from '../supabaseClient'
import HowItWorksDrawer from './HowItWorksDrawer'

export default function AssistantLogo() {
  const [userId, setUserId] = useState(null)
  const [mode, setMode] = useState(null) // 'create' ou 'modernize'
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  
  // États pour création
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [logoStyle, setLogoStyle] = useState([])
  const [colorPreference, setColorPreference] = useState('')
  
  // États pour modernisation
  const [uploadedLogo, setUploadedLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [modernizationInstructions, setModernizationInstructions] = useState('')
  
  // États génération
  const [loading, setLoading] = useState(false)
  const [generatedLogo, setGeneratedLogo] = useState(null)

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    initUser()
  }, [])

  const styleOptions = [
    'Moderne',
    'Minimaliste', 
    'Vintage',
    'Élégant',
    'Dynamique',
    'Créatif',
    'Professionnel',
    'Ludique'
  ]

  const toggleStyle = (style) => {
    if (logoStyle.includes(style)) {
      setLogoStyle(logoStyle.filter(s => s !== style))
    } else {
      if (logoStyle.length < 2) {
        setLogoStyle([...logoStyle, style])
      }
    }
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

    setUploadedLogo(file)
    
    const reader = new FileReader()
    reader.onload = (e) => setLogoPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setUploadedLogo(null)
    setLogoPreview(null)
    document.querySelector('input[type="file"]').value = ''
  }

  const handleGenerate = async () => {
    setLoading(true)
    
    try {
      const sessionId = `logo_${Date.now()}`
      let payload = {
        sessionId,
        mode
      }
  
      if (mode === 'create') {
        payload = {
          ...payload,
          company_name: companyName,
          company_description: companyDescription,
          logo_style: logoStyle,
          color_preference: colorPreference
        }
      } else {
        // Convertir logo en base64
        const base64Logo = logoPreview.split(',')[1]
        payload = {
          ...payload,
          existing_logo: base64Logo,
          modernization_instructions: modernizationInstructions
        }
      }
  
      // Timeout de 90 secondes pour génération d'image
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000)
  
      const response = await fetch('https://hub.cardin.cloud/webhook/c79b4713-2daa-4cf5-ad01-7814766a51ea/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
  
      clearTimeout(timeoutId)
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
  
      const result = await response.json()
      
      // SIMPLIFIÉ : Le webhook renvoie une URL directement
      const logoUrl = result.image_url || result.url || result.image || null
  
      if (!logoUrl) {
        console.error('Réponse webhook:', result)
        throw new Error('Aucune image reçue du webhook')
      }
  
      setGeneratedLogo(logoUrl)
  
    } catch (error) {
      if (error.name === 'AbortError') {
        alert('La génération prend trop de temps. Veuillez réessayer.')
      } else {
        console.error('❌ Erreur génération logo:', error)
        alert('Erreur lors de la génération du logo. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadLogo = async () => {
    if (!generatedLogo) return
  
    try {
      // Fetch l'image depuis l'URL
      const response = await fetch(generatedLogo)
      const blob = await response.blob()
  
      // Créer le lien de téléchargement
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `logo-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
  
    } catch (error) {
      console.error('Erreur téléchargement logo:', error)
      alert('Erreur lors du téléchargement du logo')
    }
  }

  const resetForm = () => {
    setMode(null)
    setCompanyName('')
    setCompanyDescription('')
    setLogoStyle([])
    setColorPreference('')
    setUploadedLogo(null)
    setLogoPreview(null)
    setModernizationInstructions('')
    setGeneratedLogo(null)
  }

  const canGenerate = () => {
    if (mode === 'create') {
      return companyName.trim().length > 0 && 
             companyDescription.trim().length > 10 &&
             logoStyle.length > 0
    } else {
      return uploadedLogo !== null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/assistants" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Assistant Logo</h1>
                  <p className="text-xs text-gray-500">Créez ou modernisez votre logo</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-[#dbae61]"
              title="Comment ça marche ?"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Mode Selection */}
        {!mode && !generatedLogo && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Que souhaitez-vous faire ?</h2>
              <p className="text-gray-600">Choisissez une option pour commencer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Créer un logo */}
              <button
                onClick={() => setMode('create')}
                className="group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-[#dbae61] rounded-xl p-8 transition-all duration-300 hover:shadow-lg text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] opacity-0 group-hover:opacity-5 transition-opacity" />
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Wand2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Créer un logo</h3>
                  <p className="text-gray-600">Générez un logo unique à partir de vos idées</p>
                </div>
              </button>

              {/* Moderniser un logo */}
              <button
                onClick={() => setMode('modernize')}
                className="group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-[#dbae61] rounded-xl p-8 transition-all duration-300 hover:shadow-lg text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] opacity-0 group-hover:opacity-5 transition-opacity" />
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Moderniser un logo</h3>
                  <p className="text-gray-600">Uploadez votre logo existant pour le moderniser</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Create Mode Form */}
        {mode === 'create' && !generatedLogo && (
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Création de logo</h2>
              <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700">
                Changer de mode
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de votre entreprise *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Conciergerie Lyon"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Décrivez votre activité *
              </label>
              <textarea
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                placeholder="Ex: Conciergerie haut de gamme spécialisée dans les locations courte durée à Lyon..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{companyDescription.length} caractères (minimum 10)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style de logo * (1-2 choix)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {styleOptions.map((style) => (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      logoStyle.includes(style)
                        ? 'border-[#dbae61] bg-[#dbae61] bg-opacity-10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-sm text-gray-900">{style}</span>
                  </button>
                ))}
              </div>
              {logoStyle.length > 0 && (
                <p className="text-xs text-green-600 mt-2">✓ {logoStyle.length}/2 sélectionné(s)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Préférences de couleurs (optionnel)
              </label>
              <input
                type="text"
                value={colorPreference}
                onChange={(e) => setColorPreference(e.target.value)}
                placeholder="Ex: Bleu et or, tons chauds, palette moderne..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61]"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate() || loading}
              className="w-full py-3 bg-gradient-to-r from-[#dbae61] to-[#c49a4f] hover:from-[#c49a4f] hover:to-[#b8944a] text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Générer mon logo
                </>
              )}
            </button>
          </div>
        )}

        {/* Modernize Mode Form */}
        {mode === 'modernize' && !generatedLogo && (
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Modernisation de logo</h2>
              <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700">
                Changer de mode
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Uploadez votre logo actuel *
              </label>
              
              {!logoPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#dbae61] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      Cliquez pour uploader votre logo
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG ou JPG, max 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative border-2 border-gray-200 rounded-lg p-4">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    onClick={removeLogo}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions de modernisation (optionnel)
              </label>
              <textarea
                value={modernizationInstructions}
                onChange={(e) => setModernizationInstructions(e.target.value)}
                placeholder="Ex: Rendre plus minimaliste, changer la police, ajuster les couleurs..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate() || loading}
              className="w-full py-3 bg-gradient-to-r from-[#dbae61] to-[#c49a4f] hover:from-[#c49a4f] hover:to-[#b8944a] text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Modernisation en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Moderniser mon logo
                </>
              )}
            </button>
          </div>
        )}

        {/* Result Display */}
        {generatedLogo && (
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">✨ Votre logo est prêt !</h2>
              <p className="text-gray-600">Téléchargez-le ou générez une nouvelle version</p>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50">
              <img 
                src={generatedLogo} 
                alt="Logo généré" 
                className="max-h-64 mx-auto"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDownloadLogo}
                className="flex-1 py-3 bg-gradient-to-r from-[#dbae61] to-[#c49a4f] hover:from-[#c49a4f] hover:to-[#b8944a] text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Télécharger le logo
              </button>
              <button
                onClick={resetForm}
                className="flex-1 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-all"
              >
                Générer un nouveau logo
              </button>
            </div>
          </div>
        )}

      </div>

      <HowItWorksDrawer
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        assistantName="Logo"
      />
    </div>
  )
}