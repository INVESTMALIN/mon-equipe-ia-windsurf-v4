// src/components/fiche/sections/FicheSalonSam.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Sofa } from 'lucide-react'

export default function FicheSalonSam() {
  const { 
    getField,
    updateField
  } = useForm()

  // Récupération des données de la section
  const formData = getField('section_salon_sam')

  // Handler pour champs simples
  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  // Handler pour checkboxes
  const handleCheckboxChange = (field, checked) => {
    updateField(field, checked ? true : null)
    
    // Nettoyage conditionnel : si on décoche cheminée, vider le type
    if (field === 'section_salon_sam.equipements_cheminee' && !checked) {
      updateField('section_salon_sam.cheminee_type', '')
    }
  }


  // Handler pour radio buttons
  const handleRadioChange = (field, value) => {
    updateField(field, value)
  }

  // Liste des équipements
  const equipements = [
    { key: 'equipements_table_manger', label: 'Table à manger' },
    { key: 'equipements_chaises', label: 'Chaises' },
    { key: 'equipements_canape', label: 'Canapé' },
    { key: 'equipements_canape_lit', label: 'Canapé-lit' },
    { key: 'equipements_fauteuils', label: 'Fauteuils' },
    { key: 'equipements_table_basse', label: 'Table basse' },
    { key: 'equipements_television', label: 'Télévision' },
    { key: 'equipements_cheminee', label: 'Cheminée' },
    { key: 'equipements_jeux_societe', label: 'Jeux de société' },
    { key: 'equipements_livres_magazines', label: 'Livres et magazines' },
    { key: 'equipements_livres_jouets_enfants', label: 'Livres et jouets pour enfants' },
    { key: 'equipements_climatisation', label: 'Climatisation' },
    { key: 'equipements_chauffage', label: 'Chauffage' },
    { key: 'equipements_autre', label: 'Autre (veuillez préciser)' }
  ]

  // Types de cheminée
  const typesCheminee = [
    'Électrique',
    'Éthanol', 
    'Gaz',
    'Poêle à granulés',
    'Bois',
    'Décorative'
  ]

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Salon et salle à manger</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
                    <Sofa className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Configuration des espaces de vie</h2>
                    <p className="text-gray-600">Détails du salon et de la salle à manger</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                
                {/* 1. Description générale */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Description générale du salon et de la salle à manger <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Décrivez ces espaces, leur agencement, leur décoration, l'ambiance, les éléments notables, etc."
                    value={formData.description_generale || ""}
                    onChange={(e) => handleInputChange('section_salon_sam.description_generale', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-32"
                  />
                </div>

                {/* 2. Équipements disponibles */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">
                    Équipements disponibles dans le salon et la salle à manger <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {equipements.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          checked={formData[key] === true}
                          onChange={(e) => handleCheckboxChange(`section_salon_sam.${key}`, e.target.checked)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Champ conditionnel "Autre" */}
                  {formData.equipements_autre === true && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Veuillez saisir une autre option ici"
                        value={formData.equipements_autre_details || ""}
                        onChange={(e) => handleInputChange('section_salon_sam.equipements_autre_details', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Cheminée - Type (conditionnel) */}
                {formData.equipements_cheminee === true && (
                  <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
                    <label className="block font-medium text-gray-900 mb-3">
                      Cheminée - Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {typesCheminee.map((type) => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-orange-100 rounded">
                          <input
                            type="radio"
                            name="cheminee_type"
                            value={type}
                            checked={formData.cheminee_type === type}
                            onChange={(e) => handleRadioChange('section_salon_sam.cheminee_type', e.target.value)}
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                          />
                          <span className="text-sm font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Nombre de places assises à la table à manger */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Nombre de places assises à la table à manger <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="par ex. 4"
                    min="0"
                    value={formData.nombre_places_table || ""}
                    onChange={(e) => handleInputChange('section_salon_sam.nombre_places_table', e.target.value)}
                    className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  />
                </div>

                {/* 5. Autres équipements ou détails */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Autres équipements ou détails <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Indiquez tout autre équipement ou détail pertinent concernant le salon et la salle à manger."
                    value={formData.autres_equipements_details || ""}
                    onChange={(e) => handleInputChange('section_salon_sam.autres_equipements_details', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                  />
                </div>

                {/* 6. Photos du Salon et de la Salle à Manger (VERSION LITE) */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">
                    Photos du Salon et de la Salle à Manger
                  </label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="photos_salon_sam_taken"
                        checked={formData.photos_rappels?.photos_salon_sam_taken || false}
                        onChange={(e) => handleInputChange('section_salon_sam.photos_rappels.photos_salon_sam_taken', e.target.checked)}
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <label htmlFor="photos_salon_sam_taken" className="text-sm text-yellow-800">
                        📸 Pensez à prendre des photos du salon et de la salle à manger
                      </label>
                    </div>
                  </div>
                </div>

                {/* 7. Éléments abîmés SALON */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Éléments abîmés dans le salon</h3>
                  
                  <div className="mb-4">
                    <label className="block font-medium text-gray-900 mb-3">
                      Photos de tous les éléments abîmés, cassés ou détériorés dans le salon
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      Traces d'usures, tâches, joints colorés, joints décollés, meubles abîmés, tâches sur les tissus, 
                      tâches sur les murs, trous, absence de cache prise, absence de lustre, rayures, etc.
                    </p>
                    
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="salon_elements_abimes"
                          value="true"
                          checked={formData.salon_elements_abimes === true}
                          onChange={() => handleInputChange('section_salon_sam.salon_elements_abimes', true)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                        />
                        <span>Oui</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="salon_elements_abimes"
                          value="false"
                          checked={formData.salon_elements_abimes === false}
                          onChange={() => {
                            handleInputChange('section_salon_sam.salon_elements_abimes', false)
                            handleInputChange('section_salon_sam.photos_rappels.salon_elements_abimes_taken', false)
                          }}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                        />
                        <span>Non</span>
                      </label>
                    </div>
                    
                    {/* Rappel conditionnel éléments abîmés salon (VERSION LITE) */}
                    {formData.salon_elements_abimes === true && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="salon_elements_abimes_taken"
                            checked={formData.photos_rappels?.salon_elements_abimes_taken || false}
                            onChange={(e) => handleInputChange('section_salon_sam.photos_rappels.salon_elements_abimes_taken', e.target.checked)}
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <label htmlFor="salon_elements_abimes_taken" className="text-sm text-yellow-800">
                            📸 Pensez à prendre des photos des éléments abîmés du salon
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 8. Éléments abîmés SALLE À MANGER */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Éléments abîmés dans la salle à manger</h3>
                  
                  <div className="mb-4">
                    <label className="block font-medium text-gray-900 mb-3">
                      Photos de tous les éléments abîmés, cassés ou détériorés dans la salle à manger
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      Traces d'usures, tâches, joints colorés, joints décollés, meubles abîmés, tâches sur les tissus, 
                      tâches sur les murs, trous, absence de cache prise, absence de lustre, rayures, etc.
                    </p>
                    
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="salle_manger_elements_abimes"
                          value="true"
                          checked={formData.salle_manger_elements_abimes === true}
                          onChange={() => handleInputChange('section_salon_sam.salle_manger_elements_abimes', true)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                        />
                        <span>Oui</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="salle_manger_elements_abimes"
                          value="false"
                          checked={formData.salle_manger_elements_abimes === false}
                          onChange={() => {
                            handleInputChange('section_salon_sam.salle_manger_elements_abimes', false)
                            handleInputChange('section_salon_sam.photos_rappels.salle_manger_elements_abimes_taken', false)
                          }}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                        />
                        <span>Non</span>
                      </label>
                    </div>
                    
                    {/* Rappel conditionnel éléments abîmés salle à manger (VERSION LITE) */}
                    {formData.salle_manger_elements_abimes === true && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="salle_manger_elements_abimes_taken"
                            checked={formData.photos_rappels?.salle_manger_elements_abimes_taken || false}
                            onChange={(e) => handleInputChange('section_salon_sam.photos_rappels.salle_manger_elements_abimes_taken', e.target.checked)}
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <label htmlFor="salle_manger_elements_abimes_taken" className="text-sm text-yellow-800">
                            📸 Pensez à prendre des photos des éléments abîmés de la salle à manger
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
              
              <NavigationButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}