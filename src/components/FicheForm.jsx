// src/components/FicheForm.jsx
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, ArrowRight, FileText, User, MapPin, Mail, Phone } from 'lucide-react'
import { useForm } from './FormContext'

export default function FicheForm() {
  const navigate = useNavigate()
  const { formData, updateField, handleSave, saveStatus } = useForm()

  const handleInputChange = (path, value) => {
    updateField(path, value)
  }

  const handleSaveClick = async () => {
    const result = await handleSave()
    if (result.success) {
      console.log('Fiche sauvegardée:', result.data)
    } else {
      console.error('Erreur sauvegarde:', result.error)
    }
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
                onClick={handleSaveClick}
                disabled={saveStatus.saving}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saveStatus.saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#dbae61] h-2 rounded-full" style={{ width: '4%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Propriétaire</span>
            <span>1/23</span>
          </div>
        </div>
      </div>

      {/* Messages de statut */}
      <div className="max-w-4xl mx-auto px-6 py-4">
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
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Informations Propriétaire</h2>
                <p className="text-gray-600">Renseignez les coordonnées du propriétaire du logement</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Nom de la fiche */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Nom de la fiche *
              </label>
              <input 
                type="text" 
                placeholder="Ex: Appartement Centre-ville" 
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
                  value={formData.section_proprietaire.prenom}
                  onChange={(e) => handleInputChange('section_proprietaire.prenom', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Nom de famille" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  value={formData.section_proprietaire.nom}
                  onChange={(e) => handleInputChange('section_proprietaire.nom', e.target.value)}
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
                  value={formData.section_proprietaire.email}
                  onChange={(e) => handleInputChange('section_proprietaire.email', e.target.value)}
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
                  value={formData.section_proprietaire.telephone}
                  onChange={(e) => handleInputChange('section_proprietaire.telephone', e.target.value)}
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Adresse du propriétaire
              </label>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Numéro et nom de rue" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  value={formData.section_proprietaire.adresse.rue}
                  onChange={(e) => handleInputChange('section_proprietaire.adresse.rue', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Complément d'adresse (optionnel)" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  value={formData.section_proprietaire.adresse.complement}
                  onChange={(e) => handleInputChange('section_proprietaire.adresse.complement', e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Ville" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={formData.section_proprietaire.adresse.ville}
                    onChange={(e) => handleInputChange('section_proprietaire.adresse.ville', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Code postal" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={formData.section_proprietaire.adresse.codePostal}
                    onChange={(e) => handleInputChange('section_proprietaire.adresse.codePostal', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">À venir</h3>
              <p className="text-blue-700 text-sm">
                Les autres sections incluront : logement, équipements, sécurité, état des lieux, etc.
              </p>
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
              onClick={handleSaveClick}
              disabled={saveStatus.saving}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saveStatus.saving ? 'Sauvegarde...' : 'Enregistrer brouillon'}
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