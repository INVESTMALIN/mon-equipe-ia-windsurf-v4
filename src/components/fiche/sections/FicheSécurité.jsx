// src/components/fiche/sections/FicheSécurité.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Shield } from 'lucide-react'

export default function FicheSécurité() {
  const { 
    getField,
    updateField
  } = useForm()

  const handleInputChange = (fieldPath, value) => {
    updateField(fieldPath, value)
  }

  const handleCheckboxChange = (fieldPath, checked) => {
    updateField(fieldPath, checked)
  }

  const handleArrayCheckboxChange = (fieldPath, option, checked) => {
    const currentArray = getField(fieldPath) || []
    let newArray
    if (checked) {
      newArray = [...currentArray, option]
    } else {
      newArray = currentArray.filter(item => item !== option)
      
      // Nettoyage automatique des champs liés
      if (option === 'Système d\'alarme') {
        updateField('section_securite.alarme_desarmement', '')
      }
      if (option === 'Autre (veuillez préciser)') {
        updateField('section_securite.equipements_autre_details', '')
      }
    }
    updateField(fieldPath, newArray)
  }

  // Récupération des données
  const formData_section = getField('section_securite')

  // Liste des équipements de sécurité
  const equipementsSecurite = [
    'Détecteur de fumée',
    'Détecteur de monoxyde de carbone',
    'Extincteur',
    'Trousse de premiers secours',
    'Verrou de sécurité sur la porte d\'entrée',
    'Système d\'alarme',
    'Caméras de surveillance extérieures',
    'Caméras de surveillance intérieures (uniquement dans les espaces communs)',
    'Autre (veuillez préciser)'
  ]

  // Déterminer quels équipements sont cochés
  const equipementsCoches = formData_section.equipements || []
  const systemeAlarmeSelected = equipementsCoches.includes('Système d\'alarme')
  const autreSelected = equipementsCoches.includes('Autre (veuillez préciser)')

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Sécurité</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Équipements de sécurité</h2>
                    <p className="text-gray-600">Vérifiez la présence des équipements de sécurité obligatoires</p>
                  </div>
                </div>
              </div>

              {/* Formulaire sécurité */}
              <div className="space-y-6">
                <div>
                  <label className="block font-medium text-gray-900 mb-4">
                    Équipements de sécurité présents *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {equipementsSecurite.map((equipement) => (
                      <label key={equipement} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={equipementsCoches.includes(equipement)}
                          onChange={(e) => handleArrayCheckboxChange('section_securite.equipements', equipement, e.target.checked)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <span className="text-sm text-gray-700">{equipement}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Champ conditionnel - Système d'alarme */}
                {systemeAlarmeSelected && (
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Instructions pour désarmer l'alarme
                    </label>
                    <textarea
                      placeholder="Expliquez comment désarmer le système d'alarme..."
                      value={getField('section_securite.alarme_desarmement') || ''}
                      onChange={(e) => handleInputChange('section_securite.alarme_desarmement', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      rows={3}
                    />
                  </div>
                )}

                {/* Champ conditionnel - Autre équipement */}
                {autreSelected && (
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Précisez les autres équipements
                    </label>
                    <input
                      type="text"
                      placeholder="Décrivez les autres équipements de sécurité..."
                      value={getField('section_securite.equipements_autre_details') || ''}
                      onChange={(e) => handleInputChange('section_securite.equipements_autre_details', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    />
                  </div>
                )}

                {/* Rappels photos */}
                {equipementsCoches.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        id="photos_equipements_securite_taken"
                        type="checkbox"
                        checked={getField('section_securite.photos_rappels.photos_equipements_securite_taken') || false}
                        onChange={(e) => handleCheckboxChange('section_securite.photos_rappels.photos_equipements_securite_taken', e.target.checked)}
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <label htmlFor="photos_equipements_securite_taken" className="text-sm text-yellow-800">
                        📸 Pensez à prendre des photos de tous les équipements de sécurité
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* NavigationButtons standard */}
              <NavigationButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}