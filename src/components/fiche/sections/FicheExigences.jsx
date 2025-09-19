import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Settings } from 'lucide-react'

export default function FicheExigences() {
  const { 
    getField,
    updateField
  } = useForm()

  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Exigences du propriétaire</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Contraintes et exigences</h2>
                    <p className="text-gray-600">Paramètres de location définis par le propriétaire</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Grille pour les deux premiers champs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Nombre de nuits minimum */}
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Nombre de nuits minimum
                    </label>
                    <input 
                      type="number"
                      placeholder="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={getField('section_exigences.nombre_nuits_minimum') || ''}
                      onChange={(e) => handleInputChange('section_exigences.nombre_nuits_minimum', e.target.value)}
                    />
                  </div>

                  {/* Tarif minimum/nuit */}
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Tarif minimum/nuit
                    </label>
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={getField('section_exigences.tarif_minimum_nuit') || ''}
                      onChange={(e) => handleInputChange('section_exigences.tarif_minimum_nuit', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Payé par le voyageur (EUR) ! Si aucune réservation sous 10 jours, revoir la stratégie.
                    </p>
                  </div>

                </div>

                {/* Dates à bloquer */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Dates à bloquer pour utilisation personnelle du propriétaire
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: du 15/07/2024 au 30/07/2024, du 20/12/2024 au 05/01/2025"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={getField('section_exigences.dates_bloquees') || ''}
                    onChange={(e) => handleInputChange('section_exigences.dates_bloquees', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Format libre : ex du 01/01/2024 au 10/01/2025
                  </p>
                </div>

                {/* Précisions */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Précisions sur les exigences du propriétaire
                  </label>
                  <textarea 
                    placeholder="Donnez plus de détails sur les exigences du propriétaire..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                    rows="4"
                    value={getField('section_exigences.precisions_exigences') || ''}
                    onChange={(e) => handleInputChange('section_exigences.precisions_exigences', e.target.value)}
                  />
                </div>
              </div>

              {/* Boutons navigation standardisés */}
              <NavigationButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}