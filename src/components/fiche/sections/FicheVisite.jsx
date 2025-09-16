// src/components/fiche/sections/FicheVisite.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Camera } from 'lucide-react'

export default function FicheVisite() {
  const { 
    getField,
    updateField
  } = useForm()

  // Récupération des données des sections
  const formDataVisite = getField('section_visite') || {}
  const formDataLogement = getField('section_logement') || {}
  
  // Pour la validation croisée
  const typologie = formDataLogement.typologie
  const nombreChambres = formDataVisite.nombre_chambres !== "" ? parseInt(formDataVisite.nombre_chambres) : null
  const chambreSelectionnee = formDataVisite.pieces_chambre === true
  const salleDebainsSelectionnee = formDataVisite.pieces_salle_bains === true

  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  const handleCheckboxChange = (field, checked) => {
    updateField(field, checked ? true : null)
  }

  // Logique de validation typologie vs nombre de chambres
  const getExpectedChambres = (typologie) => {
    switch (typologie) {
      case 'Studio': return 0
      case 'T2': return 1
      case 'T3': return 2
      case 'T4': return 3
      case 'T5': return 4
      case 'T6+': return 5
      default: return null
    }
  }

  const expectedChambres = getExpectedChambres(typologie)
  const showValidationError = chambreSelectionnee && 
                              nombreChambres !== null && 
                              expectedChambres !== null && 
                              nombreChambres !== expectedChambres

  // Options pour les types de pièces
  const pieceOptions = [
    { key: 'pieces_chambre', label: 'Chambre' },
    { key: 'pieces_salon', label: 'Salon' },
    { key: 'pieces_salle_bains', label: 'Salle de bains' },
    { key: 'pieces_salon_prive', label: 'Salon privé' },
    { key: 'pieces_kitchenette', label: 'Kitchenette' },
    { key: 'pieces_cuisine', label: 'Cuisine' },
    { key: 'pieces_salle_manger', label: 'Salle à manger' },
    { key: 'pieces_bureau', label: 'Bureau' },
    { key: 'pieces_salle_jeux', label: 'Salle de jeux' },
    { key: 'pieces_salle_sport', label: 'Salle de sport' },
    { key: 'pieces_buanderie', label: 'Buanderie' },
    { key: 'pieces_terrasse', label: 'Terrasse' },
    { key: 'pieces_balcon', label: 'Balcon' },
    { key: 'pieces_jardin', label: 'Jardin' },
    { key: 'pieces_autre', label: 'Autre (veuillez préciser)' }
  ]

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Visite du logement</h1>
            
            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Tour du logement</h2>
                    <p className="text-gray-600">Détaillez la composition et les espaces du bien</p>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="space-y-8">
                
                {/* Types de pièces */}
                <div>
                  <label className="block font-medium text-gray-900 mb-4">
                    Quelles types de pièces le logement comprend-il ? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {pieceOptions.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={formDataVisite[key] === true}
                          onChange={(e) => handleCheckboxChange(`section_visite.${key}`, e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Champ conditionnel "Autre" */}
                  {formDataVisite.pieces_autre === true && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Veuillez préciser..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        value={formDataVisite.pieces_autre_details || ""}
                        onChange={(e) => handleInputChange('section_visite.pieces_autre_details', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Conditionnel : Nombre de chambres si "Chambre" cochée */}
                {chambreSelectionnee && (
                  <div>
                    <div className="mb-3">
                      <label className="block font-medium text-gray-900 mb-2">
                        Nombre de chambres *
                      </label>
                    </div>
                    <select 
                      className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={formDataVisite.nombre_chambres || ""}
                      onChange={(e) => handleInputChange('section_visite.nombre_chambres', e.target.value)}
                    >
                      <option value="">Veuillez sélectionner</option>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                    <p className="mt-4 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      💡 <strong>Note pour Studio :</strong> Si vous avez sélectionné "Studio" dans la typologie, 
                      choisissez 0 chambres.
                    </p>
                    
                    {/* Alerte de validation croisée */}
                    {showValidationError && (
                      <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                        <p className="font-medium text-red-800">
                          ⚠️ Le nombre de chambres ne correspond pas à la typologie du bien ! 
                          Merci de vérifier ces informations !
                        </p>
                        <p className="text-sm mt-2 text-red-700">
                          Typologie actuelle : <strong>{typologie}</strong> 
                          {expectedChambres !== null && (
                            <> ({expectedChambres} chambre{expectedChambres > 1 ? 's' : ''})</>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditionnel : Nombre de salles de bains si "Salle de bains" cochée */}
                {salleDebainsSelectionnee && (
                  <div>
                    <label className="block font-medium text-gray-900 mb-3">
                      Visite — Nombre de salles de bains *
                    </label>
                    <select 
                      className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={formDataVisite.nombre_salles_bains || ""}
                      onChange={(e) => handleInputChange('section_visite.nombre_salles_bains', e.target.value)}
                    >
                      <option value="">Veuillez sélectionner</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>
                )}

                {/* Rappel vidéo de visite (VERSION LITE) */}
                <div>
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="video_visite_taken"
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        checked={getField('section_visite.photos_rappels.video_visite_taken') || false}
                        onChange={(e) => handleInputChange('section_visite.photos_rappels.video_visite_taken', e.target.checked)}
                      />
                      <label htmlFor="video_visite_taken" className="text-sm text-yellow-800">
                        📹 Pensez à faire une vidéo de visite commentée !
                      </label>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <h4 className="font-medium text-blue-800 mb-2">📹 Instructions pour la vidéo :</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• <strong>Parlez clairement</strong> et articulez bien</li>
                      <li>• <strong>Commentez chaque pièce</strong> visitée et ses équipements</li>
                      <li>• <strong>Attention au bruit ambiant</strong> (évitez la musique, circulation...)</li>
                      <li>• <strong>Filmez en mode paysage</strong> pour une meilleure qualité</li>
                      <li>• <strong>Éclairage suffisant</strong> : allumez les lumières si nécessaire</li>
                      <li>• <strong>Mouvements lents</strong> pour éviter le flou</li>
                    </ul>
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