// src/components/fiche/sections/FicheTeletravail.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Laptop } from 'lucide-react'

export default function FicheTeletravail() {
  const { 
    getField,
    updateField
  } = useForm()

  const handleInputChange = (fieldPath, value) => {
    updateField(fieldPath, value)
  }

  const handleArrayCheckboxChange = (fieldPath, option, checked) => {
    const currentArray = getField(fieldPath) || []
    let newArray
    if (checked) {
      newArray = [...currentArray, option]
    } else {
      newArray = currentArray.filter(item => item !== option)
    }
    updateField(fieldPath, newArray)
  }

  // Récupération des données
  const formData = getField('section_teletravail')

  // Liste des équipements de télétravail
  const equipementsTeletravail = [
    'Bureau ou espace de travail dédié',
    'Chaise ergonomique',
    'Support pour ordinateur portable',
    'Éclairage adapté (lampe de bureau, lumière naturelle)',
    'Multiprise avec prises USB',
    'Fournitures de bureau (stylos, papier, etc.)',
    'Imprimante',
    'Scanner',
    'Autre (veuillez préciser)'
  ]

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Télétravail</h1>
            
            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Laptop className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Équipements Télétravail</h2>
                    <p className="text-gray-600">Facilités pour le travail à distance</p>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="space-y-8">
                
                {/* Message informatif */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    Le télétravail est une priorité pour de nombreux voyageurs. Veuillez fournir des 
                    informations précises sur l'équipement et la qualité de la connexion pour garantir une expérience 
                    optimale.
                  </p>
                </div>

                {/* Équipements télétravail */}
                <div>
                  <label className="block font-medium text-gray-900 mb-4">
                    Équipements pour le télétravail disponibles :
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipementsTeletravail.map(equipement => (
                      <label key={equipement} className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={(formData.equipements || []).includes(equipement)}
                          onChange={(e) => handleArrayCheckboxChange('section_teletravail.equipements', equipement, e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] border-gray-300 rounded focus:ring-[#dbae61] mt-0.5"
                        />
                        <span className="text-sm text-gray-700">{equipement}</span>
                      </label>
                    ))}
                  </div>

                  {/* Champ conditionnel pour "Autre" */}
                  {(formData.equipements || []).includes('Autre (veuillez préciser)') && (
                    <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <label className="block font-medium text-gray-900 mb-2">
                        Autre (veuillez préciser) :
                      </label>
                      <input
                        type="text"
                        placeholder="Veuillez saisir une autre option ici"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        value={formData.equipements_autre_details || ''}
                        onChange={(e) => handleInputChange('section_teletravail.equipements_autre_details', e.target.value)}
                      />
                    </div>
                  )}
                </div>

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