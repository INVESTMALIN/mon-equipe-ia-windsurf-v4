// src/components/fiche/sections/FicheCuisine1.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { ChefHat } from 'lucide-react'

export default function FicheCuisine1() {
  const { 
    getField,
    updateField
  } = useForm()

  // Récupération des données de la section
  const formData = getField('section_cuisine_1')

  // Handler pour champs simples
  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  // Handler pour checkboxes (équipements principaux et types cafetière)
  const handleCheckboxChange = (field, checked) => {
    updateField(field, checked ? true : null)
  }

  // Handler pour radio buttons
  const handleRadioChange = (field, value) => {
    updateField(field, value)
  }

  // Liste des équipements principaux
  const equipements = [
    { key: 'equipements_refrigerateur', label: 'Réfrigérateur' },
    { key: 'equipements_congelateur', label: 'Congélateur' },
    { key: 'equipements_mini_refrigerateur', label: 'Mini réfrigérateur' },
    { key: 'equipements_cuisiniere', label: 'Cuisinière' },
    { key: 'equipements_plaque_cuisson', label: 'Plaque de cuisson' },
    { key: 'equipements_four', label: 'Four' },
    { key: 'equipements_micro_ondes', label: 'Four à micro-ondes' },
    { key: 'equipements_lave_vaisselle', label: 'Lave-vaisselle' },
    { key: 'equipements_cafetiere', label: 'Cafetière' },
    { key: 'equipements_bouilloire', label: 'Bouilloire électrique' },
    { key: 'equipements_grille_pain', label: 'Grille-pain' },
    { key: 'equipements_blender', label: 'Blender' },
    { key: 'equipements_cuiseur_riz', label: 'Cuiseur à riz' },
    { key: 'equipements_machine_pain', label: 'Machine à pain' },
    { key: 'equipements_lave_linge', label: 'Lave-linge' },
    { key: 'equipements_autre', label: 'Autre (veuillez préciser)' }
  ]

  // Types de cafetière
  const typesCafetiere = [
    { key: 'cafetiere_type_filtre', label: 'Cafetière filtre' },
    { key: 'cafetiere_type_expresso', label: 'Machine à expresso' },
    { key: 'cafetiere_type_piston', label: 'Cafetière à piston' },
    { key: 'cafetiere_type_keurig', label: 'Machine à café Keurig' },
    { key: 'cafetiere_type_nespresso', label: 'Nespresso' },
    { key: 'cafetiere_type_manuelle', label: 'Cafetière manuelle' },
    { key: 'cafetiere_type_bar_grain', label: 'Cafetière bar grain (type Delonghi)' },
    { key: 'cafetiere_type_bar_moulu', label: 'Cafetière bar café moulu (type Delonghi)' }
  ]

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Cuisine 1 - Équipements</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Équipements de cuisine</h2>
                    <p className="text-gray-600">Configuration des appareils électroménagers et équipements</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                
                {/* Section principale : Sélection des équipements */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">
                    Quels équipements électroménagers sont disponibles dans la cuisine ? <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {equipements.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          checked={formData[key] === true}
                          onChange={(e) => handleCheckboxChange(`section_cuisine_1.${key}`, e.target.checked)}
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
                        placeholder="Veuillez préciser..."
                        value={formData.equipements_autre_details || ""}
                        onChange={(e) => handleInputChange('section_cuisine_1.equipements_autre_details', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* RÉFRIGÉRATEUR */}
                {formData.equipements_refrigerateur === true && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-blue-800">Réfrigérateur - Détails</h3>
                    
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Marque <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Précisez la marque du réfrigérateur"
                        value={formData.refrigerateur_marque || ""}
                        onChange={(e) => handleInputChange('section_cuisine_1.refrigerateur_marque', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Instructions d'utilisation
                      </label>
                      <textarea
                        placeholder="Instructions d'utilisation du réfrigérateur"
                        value={formData.refrigerateur_instructions || ""}
                        onChange={(e) => handleInputChange('section_cuisine_1.refrigerateur_instructions', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                      />
                    </div>

                    {/* Rappel photo VERSION LITE */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="refrigerateur_taken"
                          checked={formData.photos_rappels?.refrigerateur_taken || false}
                          onChange={(e) => handleInputChange('section_cuisine_1.photos_rappels.refrigerateur_taken', e.target.checked)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <label htmlFor="refrigerateur_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre une vidéo d'utilisation du réfrigérateur
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONGÉLATEUR */}
                {formData.equipements_congelateur === true && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-blue-800">Congélateur - Détails</h3>
                    
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Instructions d'utilisation
                      </label>
                      <textarea
                        placeholder="Instructions d'utilisation du congélateur"
                        value={formData.congelateur_instructions || ""}
                        onChange={(e) => handleInputChange('section_cuisine_1.congelateur_instructions', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="congelateur_taken"
                          checked={formData.photos_rappels?.congelateur_taken || false}
                          onChange={(e) => handleInputChange('section_cuisine_1.photos_rappels.congelateur_taken', e.target.checked)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <label htmlFor="congelateur_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre une vidéo d'utilisation du congélateur
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* MINI RÉFRIGÉRATEUR */}
                {formData.equipements_mini_refrigerateur === true && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-blue-800">Mini réfrigérateur - Détails</h3>
                    
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Instructions d'utilisation
                      </label>
                      <textarea
                        placeholder="Instructions d'utilisation du mini réfrigérateur"
                        value={formData.mini_refrigerateur_instructions || ""}
                        onChange={(e) => handleInputChange('section_cuisine_1.mini_refrigerateur_instructions', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="mini_refrigerateur_taken"
                          checked={formData.photos_rappels?.mini_refrigerateur_taken || false}
                          onChange={(e) => handleInputChange('section_cuisine_1.photos_rappels.mini_refrigerateur_taken', e.target.checked)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <label htmlFor="mini_refrigerateur_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre une vidéo d'utilisation du mini réfrigérateur
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* CUISINIÈRE */}
                {formData.equipements_cuisiniere === true && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-blue-800">Cuisinière - Détails</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">
                          Marque <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Précisez la marque"
                          value={formData.cuisiniere_marque || ""}
                          onChange={(e) => handleInputChange('section_cuisine_1.cuisiniere_marque', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-gray-900 mb-2">
                          Type
                        </label>
                        <select
                          value={formData.cuisiniere_type || ""}
                          onChange={(e) => handleInputChange('section_cuisine_1.cuisiniere_type', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        >
                          <option value="">Sélectionnez le type</option>
                          <option value="Électrique">Électrique</option>
                          <option value="Gaz">Gaz</option>
                          <option value="Induction">Induction</option>
                          <option value="À bois">À bois</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Nombre de feux
                      </label>
                      <input
                        type="number"
                        placeholder="Indiquez le nombre de feux"
                        value={formData.cuisiniere_nombre_feux || ""}
                        onChange={(e) => handleInputChange('section_cuisine_1.cuisiniere_nombre_feux', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Instructions d'utilisation
                      </label>
                      <textarea
                        placeholder="Instructions d'utilisation de la cuisinière"
                        value={formData.cuisiniere_instructions || ""}
                        onChange={(e) => handleInputChange('section_cuisine_1.cuisiniere_instructions', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="cuisiniere_taken"
                          checked={formData.photos_rappels?.cuisiniere_taken || false}
                          onChange={(e) => handleInputChange('section_cuisine_1.photos_rappels.cuisiniere_taken', e.target.checked)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <label htmlFor="cuisiniere_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre des photos et vidéos d'utilisation de la cuisinière
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* CAFETIÈRE (section complexe) */}
                {formData.equipements_cafetiere === true && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-6">
                    <h3 className="font-semibold text-blue-800">Cafetière - Détails</h3>
                    
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Marque <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Précisez la marque de la cafetière"
                        value={formData.cafetiere_marque || ""}
                        onChange={(e) => handleInputChange('section_cuisine_1.cafetiere_marque', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-3">
                        Type de cafetière
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {typesCafetiere.map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={formData[key] === true}
                              onChange={(e) => handleCheckboxChange(`section_cuisine_1.${key}`, e.target.checked)}
                              className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Instructions d'utilisation
                      </label>
                      <textarea
                        placeholder="Instructions d'utilisation de la cafetière"
                        value={formData.cafetiere_instructions || ""}
                        onChange={(e) => handleInputChange('section_cuisine_1.cafetiere_instructions', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-3">
                        Le café est-il fourni ?
                      </label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="cafetiere_cafe_fourni"
                            value="Non"
                            checked={formData.cafetiere_cafe_fourni === "Non"}
                            onChange={(e) => handleRadioChange('section_cuisine_1.cafetiere_cafe_fourni', e.target.value)}
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                          />
                          <span>Non</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="cafetiere_cafe_fourni"
                            value="Oui par le propriétaire"
                            checked={formData.cafetiere_cafe_fourni === "Oui par le propriétaire"}
                            onChange={(e) => handleRadioChange('section_cuisine_1.cafetiere_cafe_fourni', e.target.value)}
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                          />
                          <span>Oui par le propriétaire</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="cafetiere_cafe_fourni"
                            value="Oui par la femme de ménage"
                            checked={formData.cafetiere_cafe_fourni === "Oui par la femme de ménage"}
                            onChange={(e) => handleRadioChange('section_cuisine_1.cafetiere_cafe_fourni', e.target.value)}
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                          />
                          <span>Oui par la femme de ménage</span>
                        </label>
                      </div>
                    </div>

                    {/* Champ conditionnel marque du café */}
                    {(formData.cafetiere_cafe_fourni === "Oui par le propriétaire" || formData.cafetiere_cafe_fourni === "Oui par la femme de ménage") && (
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">
                          Marque du café fourni
                        </label>
                        <input
                          type="text"
                          placeholder="Précisez la marque du café fourni"
                          value={formData.cafetiere_marque_cafe || ""}
                          onChange={(e) => handleInputChange('section_cuisine_1.cafetiere_marque_cafe', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        />
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="cafetiere_taken"
                          checked={formData.photos_rappels?.cafetiere_taken || false}
                          onChange={(e) => handleInputChange('section_cuisine_1.photos_rappels.cafetiere_taken', e.target.checked)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <label htmlFor="cafetiere_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre des photos et vidéos d'utilisation de la cafetière
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Autres équipements simplifiés */}
                {[
                  { key: 'plaque_cuisson', label: 'Plaque de cuisson', hasDetails: true },
                  { key: 'four', label: 'Four', hasDetails: true },
                  { key: 'micro_ondes', label: 'Four à micro-ondes', hasDetails: false },
                  { key: 'lave_vaisselle', label: 'Lave-vaisselle', hasDetails: false },
                  { key: 'bouilloire', label: 'Bouilloire électrique', hasDetails: false },
                  { key: 'grille_pain', label: 'Grille-pain', hasDetails: false },
                  { key: 'blender', label: 'Blender', hasDetails: false },
                  { key: 'cuiseur_riz', label: 'Cuiseur à riz', hasDetails: false },
                  { key: 'machine_pain', label: 'Machine à pain', hasDetails: false }
                ].map(({ key, label, hasDetails }) => (
                  formData[`equipements_${key}`] === true && (
                    <div key={key} className="p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                      <h3 className="font-semibold text-blue-800">{label} - Détails</h3>
                      
                      {hasDetails && key === 'plaque_cuisson' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block font-medium text-gray-900 mb-2">
                                Marque <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Marque"
                                value={formData.plaque_cuisson_marque || ""}
                                onChange={(e) => handleInputChange('section_cuisine_1.plaque_cuisson_marque', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-gray-900 mb-2">Type</label>
                              <select
                                value={formData.plaque_cuisson_type || ""}
                                onChange={(e) => handleInputChange('section_cuisine_1.plaque_cuisson_type', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                              >
                                <option value="">Type</option>
                                <option value="Électrique">Électrique</option>
                                <option value="Gaz">Gaz</option>
                                <option value="Induction">Induction</option>
                              </select>
                            </div>
                            <div>
                              <label className="block font-medium text-gray-900 mb-2">Nombre de feux</label>
                              <input
                                type="number"
                                placeholder="Nb feux"
                                value={formData.plaque_cuisson_nombre_feux || ""}
                                onChange={(e) => handleInputChange('section_cuisine_1.plaque_cuisson_nombre_feux', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {hasDetails && key === 'four' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-medium text-gray-900 mb-2">
                              Marque <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Marque du four"
                              value={formData.four_marque || ""}
                              onChange={(e) => handleInputChange('section_cuisine_1.four_marque', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-900 mb-2">Type</label>
                            <select
                              value={formData.four_type || ""}
                              onChange={(e) => handleInputChange('section_cuisine_1.four_type', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                            >
                              <option value="">Sélectionnez le type</option>
                              <option value="Simple">Simple</option>
                              <option value="Double">Double</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block font-medium text-gray-900 mb-2">
                          Instructions d'utilisation
                        </label>
                        <textarea
                          placeholder={`Instructions d'utilisation ${label.toLowerCase()}`}
                          value={formData[`${key}_instructions`] || ""}
                          onChange={(e) => handleInputChange(`section_cuisine_1.${key}_instructions`, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                        />
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`${key}_taken`}
                            checked={formData.photos_rappels?.[`${key}_taken`] || false}
                            onChange={(e) => handleInputChange(`section_cuisine_1.photos_rappels.${key}_taken`, e.target.checked)}
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <label htmlFor={`${key}_taken`} className="text-sm text-yellow-800">
                            📸 Pensez à prendre des photos et vidéos d'utilisation du {label.toLowerCase()}
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                ))}

                {/* Éléments abîmés */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">
                    Photos de tous les éléments abîmés, cassés ou détériorés dans la cuisine
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Traces d'usures, tâches, joints colorés, joints décollés, meubles abîmés, tâches sur les tissus, 
                    tâches sur les murs, trous, absence de cache prise, absence de lustre, rayures, 
                    traces dans électroménagers, traces dans les poêles/casseroles, etc.
                  </p>
                  
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cuisine_elements_abimes"
                        value="true"
                        checked={formData.elements_abimes === true}
                        onChange={() => handleInputChange('section_cuisine_1.elements_abimes', true)}
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                      />
                      <span>Oui</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cuisine_elements_abimes"
                        value="false"
                        checked={formData.elements_abimes === false}
                        onChange={() => {
                          handleInputChange('section_cuisine_1.elements_abimes', false)
                          handleInputChange('section_cuisine_1.photos_rappels.elements_abimes_taken', false)
                        }}
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                      />
                      <span>Non</span>
                    </label>
                  </div>
                  
                  {/* Rappel conditionnel éléments abîmés (VERSION LITE) */}
                  {formData.elements_abimes === true && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="elements_abimes_taken"
                          checked={formData.photos_rappels?.elements_abimes_taken || false}
                          onChange={(e) => handleInputChange('section_cuisine_1.photos_rappels.elements_abimes_taken', e.target.checked)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <label htmlFor="elements_abimes_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre des photos des éléments abîmés de la cuisine
                        </label>
                      </div>
                    </div>
                  )}
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