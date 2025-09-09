import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, ArrowRight, FileText, User, MapPin, Mail, Phone } from 'lucide-react'

export default function FicheForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nom: '',
    proprietaire: {
      prenom: '',
      nom: '',
      email: '',
      telephone: ''
    },
    adresse: {
      rue: '',
      complement: '',
      ville: '',
      codePostal: ''
    }
  })

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const handleSave = () => {
    console.log('Sauvegarde:', formData)
    // TODO: Intégration avec Supabase
  }

  const handleNext = () => {
    console.log('Page suivante - TODO: Navigation vers section Logement')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nouvelle Fiche Logement</h1>
                <p className="text-sm text-gray-600">Étape 1 sur 23 - Propriétaire</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Progression</span>
            <span className="font-medium">1 / 23</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#dbae61] h-2 rounded-full transition-all duration-300" 
              style={{ width: '4.3%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Icon et titre de section */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-[#dbae61] bg-opacity-20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[#dbae61]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Informations Propriétaire</h2>
              <p className="text-gray-600 text-sm">Renseignez les coordonnées du propriétaire</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Nom de la fiche */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Nom de la fiche *
              </label>
              <input 
                type="text" 
                placeholder="Le nom se génère automatiquement..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
              />
            </div>

            {/* Nom du propriétaire */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nom du propriétaire *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Prénom" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  value={formData.proprietaire.prenom}
                  onChange={(e) => handleInputChange('proprietaire.prenom', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Nom de famille" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  value={formData.proprietaire.nom}
                  onChange={(e) => handleInputChange('proprietaire.nom', e.target.value)}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </label>
                <input 
                  type="email" 
                  placeholder="exemple@exemple.com" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  value={formData.proprietaire.email}
                  onChange={(e) => handleInputChange('proprietaire.email', e.target.value)}
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone
                </label>
                <input 
                  type="tel" 
                  placeholder="06 12 34 56 78" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  value={formData.proprietaire.telephone}
                  onChange={(e) => handleInputChange('proprietaire.telephone', e.target.value)}
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Adresse *
              </label>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Numéro et rue" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  value={formData.adresse.rue}
                  onChange={(e) => handleInputChange('adresse.rue', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Complément d'adresse (optionnel)" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  value={formData.adresse.complement}
                  onChange={(e) => handleInputChange('adresse.complement', e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Ville" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={formData.adresse.ville}
                    onChange={(e) => handleInputChange('adresse.ville', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Code Postal" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={formData.adresse.codePostal}
                    onChange={(e) => handleInputChange('adresse.codePostal', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Note explicative pour la démo */}
            <div className="bg-[#dbae61] bg-opacity-10 border border-[#dbae61] border-opacity-20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#dbae61] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Version démo - Fiche Logement Light</h3>
                  <p className="text-sm text-gray-700">
                    Ceci est la première section d'un formulaire complet de 23 pages. 
                    Les autres sections incluront : logement, équipements, sécurité, état des lieux, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Enregistrer brouillon
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Section suivante
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}