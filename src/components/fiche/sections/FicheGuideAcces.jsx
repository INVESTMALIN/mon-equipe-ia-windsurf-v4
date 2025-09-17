// src/components/fiche/sections/FicheGuideAcces.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { MapPin, Camera, Users } from 'lucide-react'

export default function FicheGuideAcces() {
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

  const handleCheckboxChange = (fieldPath, checked) => {
    updateField(fieldPath, checked)
  }

  // Récupération des données
  const formData = getField('section_guide_acces')

  // Éléments à documenter (checklist)
  const elementsDocumenter = [
    'Point de repère visible depuis la rue',
    'Entrée de l\'immeuble ou du bâtiment',
    'Code d\'accès ou interphone',
    'Hall d\'entrée et orientation',
    'Ascenseur ou escalier à emprunter',
    'Palier et numérotation',
    'Porte d\'appartement',
    'Boîte aux lettres ou point de récupération des clés'
  ]

  // Difficultés d'accès possibles
  const difficultesAcces = [
    'Numérotation peu visible ou confuse',
    'Plusieurs entrées possibles',
    'Code d\'accès ou badge nécessaire',
    'Parking ou stationnement complexe',
    'Ascenseur en panne fréquente',
    'Travaux ou déviations temporaires',
    'Éclairage insuffisant le soir',
    'Accès difficile avec bagages'
  ]

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Guide d'Accès</h1>
            
            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Documentation de l'Accès</h2>
                    <p className="text-gray-600">Guidez efficacement vos voyageurs</p>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="space-y-8">
                
                {/* Message d'introduction avec conseils */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-3">
                        Mettez-vous à la place des voyageurs
                      </h3>
                      <p className="text-blue-700 text-sm mb-3">
                        Un guide d'accès bien documenté est bénéfique pour vous et utile aux voyageurs. 
                        Filmez bien chaque étape pour créer une expérience d'arrivée fluide.
                      </p>
                      <p className="text-blue-600 text-sm font-medium">
                        💡 Pensez aux détails qui facilitent l'accès au logement
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point de repère principal */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Point de repère principal visible depuis la rue *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Panneau de rue, café 'Le Central', station de métro, pharmacie..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={formData.point_repere_principal || ''}
                    onChange={(e) => handleInputChange('section_guide_acces.point_repere_principal', e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Choisissez un élément facilement identifiable par les voyageurs
                  </p>
                </div>

                {/* Description détaillée du parcours */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Description étape par étape de l'accès au logement *
                  </label>
                  <textarea
                    placeholder="Décrivez le parcours complet depuis le point de repère jusqu'à la porte d'entrée : direction à prendre, nombre de mètres, éléments à repérer, codes éventuels, étage, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                    rows={5}
                    value={formData.description_acces || ""}
                    onChange={(e) => handleInputChange('section_guide_acces.description_acces', e.target.value)}
                  />
                </div>

                {/* Éléments à documenter (checklist) */}
                <div>
                  <label className="block font-medium text-gray-900 mb-4">
                    Éléments à photographier et filmer pour le guide d'accès :
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {elementsDocumenter.map(element => (
                      <label key={element} className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={(formData.elements_documenter || []).includes(element)}
                          onChange={(e) => handleArrayCheckboxChange('section_guide_acces.elements_documenter', element, e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] border-gray-300 rounded focus:ring-[#dbae61] mt-0.5"
                        />
                        <span className="text-sm text-gray-700">{element}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficultés d'accès identifiées */}
                <div>
                  <label className="block font-medium text-gray-900 mb-4">
                    Difficultés d'accès identifiées (à signaler aux voyageurs) :
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {difficultesAcces.map(difficulte => (
                      <label key={difficulte} className="flex items-start gap-3 cursor-pointer p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={(formData.difficultes_acces || []).includes(difficulte)}
                          onChange={(e) => handleArrayCheckboxChange('section_guide_acces.difficultes_acces', difficulte, e.target.checked)}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mt-0.5"
                        />
                        <span className="text-sm text-gray-700">{difficulte}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conseils supplémentaires */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Conseils spécifiques pour faciliter l'arrivée des voyageurs
                  </label>
                  <textarea
                    placeholder="Conseils pratiques : meilleurs horaires d'arrivée, contact en cas de problème, alternatives en cas de panne d'ascenseur, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                    rows={3}
                    value={formData.conseils_voyageurs || ""}
                    onChange={(e) => handleInputChange('section_guide_acces.conseils_voyageurs', e.target.value)}
                  />
                </div>

                {/* Rappels documentation */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Camera className="w-6 h-6 text-yellow-600 mt-1" />
                    <h3 className="font-medium text-gray-900">Documentation visuelle</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.photos_rappels?.photos_etapes_acces_taken || false}
                        onChange={(e) => handleCheckboxChange('section_guide_acces.photos_rappels.photos_etapes_acces_taken', e.target.checked)}
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <span className="text-sm text-yellow-800">
                        📸 Photos étape par étape réalisées (carrousel d'accès)
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.photos_rappels?.video_acces_taken || false}
                        onChange={(e) => handleCheckboxChange('section_guide_acces.photos_rappels.video_acces_taken', e.target.checked)}
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <span className="text-sm text-yellow-800">
                        🎥 Vidéo continue d'accès réalisée (du repère à la porte)
                      </span>
                    </label>
                  </div>
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