// src/components/fiche/sections/FicheCommuns.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Building } from 'lucide-react'

export default function FicheCommuns() {
  const { 
    getField,
    updateField
  } = useForm()

  const handleInputChange = (fieldPath, value) => {
    updateField(fieldPath, value)
  }

  const handleRadioChange = (fieldPath, value) => {
    updateField(fieldPath, value === 'true' ? true : (value === 'false' ? false : null))
  }

  const handleCheckboxChange = (fieldPath, checked) => {
    updateField(fieldPath, checked)
  }

  // Récupération des données
  const formData = getField('section_communs')

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Espaces Communs</h1>
            
            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Espace(s) Commun(s)</h2>
                    <p className="text-gray-600">Gestion et description des espaces partagés</p>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="space-y-8">
                
                {/* Question principale : Dispose d'espaces communs */}
                <div>
                  <label className="block font-medium text-gray-900 mb-4">
                    Le logement propose-t-il un ou plusieurs espace(s) commun(s) ? *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dispose_espaces_communs"
                        checked={formData.dispose_espaces_communs === true}
                        onChange={() => handleRadioChange('section_communs.dispose_espaces_communs', 'true')}
                        className="w-4 h-4 text-[#dbae61] border-gray-300 focus:ring-[#dbae61]"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dispose_espaces_communs"
                        checked={formData.dispose_espaces_communs === false}
                        onChange={() => handleRadioChange('section_communs.dispose_espaces_communs', 'false')}
                        className="w-4 h-4 text-[#dbae61] border-gray-300 focus:ring-[#dbae61]"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                </div>

                {/* BRANCHE CONDITIONNELLE : Si oui */}
                {formData.dispose_espaces_communs === true && (
                  <div className="border-l-4 border-[#dbae61] pl-6 space-y-8 bg-amber-50 p-6 rounded-r-lg">
                    
                    {/* Description générale */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Description générale des espaces communs *
                      </label>
                      <textarea
                        placeholder="Décrivez les espaces communs, l'agencement, la décoration, les équipements présents (par exemple, table, chaises, barbecue, etc.) et l'ambiance (vue, orientation, etc.)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                        rows={4}
                        value={formData.description_generale || ""}
                        onChange={(e) => handleInputChange('section_communs.description_generale', e.target.value)}
                      />
                    </div>

                    {/* Question entretien */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-4">
                        Le prestataire doit-il gérer l'entretien du/des espace(s) commun(s) ? *
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="entretien_prestataire"
                            checked={formData.entretien_prestataire === true}
                            onChange={() => handleRadioChange('section_communs.entretien_prestataire', 'true')}
                            className="w-4 h-4 text-[#dbae61] border-gray-300 focus:ring-[#dbae61]"
                          />
                          <span className="text-gray-700">Oui</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="entretien_prestataire"
                            checked={formData.entretien_prestataire === false}
                            onChange={() => handleRadioChange('section_communs.entretien_prestataire', 'false')}
                            className="w-4 h-4 text-[#dbae61] border-gray-300 focus:ring-[#dbae61]"
                          />
                          <span className="text-gray-700">Non</span>
                        </label>
                      </div>
                    </div>

                    {/* SOUS-BRANCHE : Si entretien = OUI */}
                    {formData.entretien_prestataire === true && (
                      <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <div>
                          <label className="block font-medium text-gray-900 mb-2">
                            Précisez la fréquence *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 2 fois par semaine (lundi et vendredi)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                            value={formData.entretien_frequence || ""}
                            onChange={(e) => handleInputChange('section_communs.entretien_frequence', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* SOUS-BRANCHE : Si entretien = NON */}
                    {formData.entretien_prestataire === false && (
                      <div className="p-6 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                        <div>
                          <label className="block font-medium text-gray-900 mb-2">
                            Qui s'occupe de l'entretien ? *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Une entreprise spécialisée"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                            value={formData.entretien_qui || ""}
                            onChange={(e) => handleInputChange('section_communs.entretien_qui', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Rappels photos - Version lite */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="photos_espaces_communs_taken"
                          checked={formData.photos_rappels?.photos_espaces_communs_taken || false}
                          onChange={(e) => handleInputChange('section_communs.photos_rappels.photos_espaces_communs_taken', e.target.checked)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <label htmlFor="photos_espaces_communs_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre des photos des espaces communs sous différents angles
                        </label>
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Boutons navigation standardisés - OBLIGATOIRE */}
              <NavigationButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}