// src/components/fiche/sections/FicheForm.jsx - ADAPTER AU LAYOUT WIZARD
import { ArrowLeft, Save, ArrowRight, FileText, User, MapPin, Mail, Phone } from 'lucide-react'
import { useForm } from '../../FormContext'
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'

export default function FicheForm() {
  const { formData, updateField, handleSave, saveStatus, next, back, currentStep, totalSteps } = useForm()

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

  return (
    <div className="flex min-h-screen">
      {/* 🔥 AJOUT : SidebarMenu */}
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        {/* 🔥 AJOUT : ProgressBar */}
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          
          {/* Contenu principal - garde le design existant mais dans le bon container */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Informations Propriétaire</h1>
            
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
                    Adresse du bien
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

              </div>
            </div>
            {/* Boutons navigation standardisés */}
            <NavigationButtons />
          </div>
        </div>
      </div>
    </div>
  )
}