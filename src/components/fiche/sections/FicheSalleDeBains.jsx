// src/components/fiche/sections/FicheSalleDeBains.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Bath, Home } from 'lucide-react'
import { useState, useCallback } from 'react'

// 🔥 COMPOSANT ACCORDÉON SALLE DE BAIN (externe pour clarté)
const AccordeonSalleDeBain = ({ 
  salleKey, 
  numeroAffiche, 
  formDataSallesDeBains, 
  accordeonsOuverts, 
  toggleAccordeon, 
  handleInputChange, 
  handleCheckboxChange, 
  handleRadioChange, 
  equipements 
}) => {
  const isOpen = accordeonsOuverts[salleKey]
  const salleData = formDataSallesDeBains[salleKey] || {}
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      {/* Header accordéon */}
      <button
        type="button"
        onClick={() => toggleAccordeon(salleKey)}
        className="w-full px-4 py-3 bg-[#dbae61] text-white flex items-center justify-between hover:bg-[#c49a4f] transition-colors"
      >
        <span className="font-semibold">Salle de bain {numeroAffiche}</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Contenu accordéon */}
      {isOpen && (
        <div className="p-6 space-y-6">
          
          {/* 1. Nom ou description */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Nom ou description de la salle de bain
            </label>
            <input
              type="text"
              placeholder="Indiquez le nom ou une courte description"
              value={salleData.nom_description || ""}
              onChange={(e) => handleInputChange(salleKey, 'nom_description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
            />
          </div>

          {/* 2. Équipements (obligatoire) */}
          <div>
            <label className="block font-medium text-gray-900 mb-3">
              Équipements <span className="text-red-500">*</span>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {equipements.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    checked={salleData[key] === true}
                    onChange={(e) => handleCheckboxChange(salleKey, key, e.target.checked)}
                    className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                  />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>

            {/* Champ conditionnel "Autre" */}
            {salleData.equipements_autre === true && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Veuillez préciser..."
                  value={salleData.equipements_autre_details || ""}
                  onChange={(e) => handleInputChange(salleKey, 'equipements_autre_details', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Champ conditionnel "WC séparé" si WC coché */}
            {salleData.equipements_wc === true && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block font-medium text-gray-900 mb-3">
                  WC Séparé ? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`${salleKey}_wc_separe`}
                      value="true"
                      checked={salleData.wc_separe === true}
                      onChange={(e) => handleRadioChange(salleKey, 'wc_separe', e.target.value)}
                      className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                    />
                    <span className="text-sm font-medium">Oui</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`${salleKey}_wc_separe`}
                      value="false"
                      checked={salleData.wc_separe === false}
                      onChange={(e) => handleRadioChange(salleKey, 'wc_separe', e.target.value)}
                      className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                    />
                    <span className="text-sm font-medium">Non</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 3. Accès (obligatoire) */}
          <div>
            <label className="block font-medium text-gray-900 mb-3">
              Accès <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={`${salleKey}_acces`}
                  value="privee"
                  checked={salleData.acces === "privee"}
                  onChange={(e) => handleInputChange(salleKey, 'acces', e.target.value)}
                  className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                />
                <span className="text-sm font-medium">Attenant à une chambre</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={`${salleKey}_acces`}
                  value="partagee"
                  checked={salleData.acces === "partagee"}
                  onChange={(e) => handleInputChange(salleKey, 'acces', e.target.value)}
                  className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                />
                <span className="text-sm font-medium">Commun</span>
              </label>
            </div>
          </div>

          {/* 4. Photos - Salle de bains (VERSION LITE) */}
          <div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`photos_salle_de_bain_${numeroAffiche}_taken`}
                  checked={salleData.photos_rappels?.photos_salle_de_bain_taken || false}
                  onChange={(e) => handleInputChange(salleKey, 'photos_rappels.photos_salle_de_bain_taken', e.target.checked)}
                  className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                />
                <label htmlFor={`photos_salle_de_bain_${numeroAffiche}_taken`} className="text-sm text-yellow-800">
                  📸 Pensez à prendre des photos de la salle de bain {numeroAffiche}
                </label>
              </div>
            </div>
          </div>

          {/* 5. Éléments abîmés */}
          <div>
            <label className="block font-medium text-gray-900 mb-3">
              Photos de tous les éléments abîmés, cassés ou détériorés dans la salle de bain {numeroAffiche}
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Traces d'usures, tâches, joints colorés, joints décollés, meubles abîmés, tâches sur les tissus, 
              tâches sur les murs, trous, absence de cache prise, absence de lustre, rayures, etc.
            </p>
            
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`salle_de_bain_${numeroAffiche}_elements_abimes`}
                  value="true"
                  checked={salleData.elements_abimes === true}
                  onChange={() => handleInputChange(salleKey, 'elements_abimes', true)}
                  className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                />
                <span>Oui</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`salle_de_bain_${numeroAffiche}_elements_abimes`}
                  value="false"
                  checked={salleData.elements_abimes === false}
                  onChange={() => {
                    handleInputChange(salleKey, 'elements_abimes', false)
                    handleInputChange(salleKey, 'photos_rappels.elements_abimes_taken', false)
                  }}
                  className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61]"
                />
                <span>Non</span>
              </label>
            </div>
            
            {/* Rappel conditionnel éléments abîmés (VERSION LITE) */}
            {salleData.elements_abimes === true && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`elements_abimes_${numeroAffiche}_taken`}
                    checked={salleData.photos_rappels?.elements_abimes_taken || false}
                    onChange={(e) => handleInputChange(salleKey, 'photos_rappels.elements_abimes_taken', e.target.checked)}
                    className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                  />
                  <label htmlFor={`elements_abimes_${numeroAffiche}_taken`} className="text-sm text-blue-800">
                    📸 Pensez à prendre des photos des éléments abîmés de la salle de bain {numeroAffiche}
                  </label>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

// 🔥 COMPOSANT PRINCIPAL FICHE SALLE DE BAINS
export default function FicheSalleDeBains() {
  const { 
    getField,
    updateField
  } = useForm()

  // Récupérer le nombre de salles de bains depuis la section Visite
  const formDataVisite = getField('section_visite')
  const nombreSallesDeBains = parseInt(formDataVisite.nombre_salles_bains) || 0
  
  // Récupérer les données salles de bains
  const formDataSallesDeBains = getField('section_salle_de_bains')

  // État pour gérer les accordéons ouverts
  const [accordeonsOuverts, setAccordeonsOuverts] = useState({
    salle_de_bain_1: true, // Premier accordéon ouvert par défaut
    salle_de_bain_2: false,
    salle_de_bain_3: false,
    salle_de_bain_4: false,
    salle_de_bain_5: false,
    salle_de_bain_6: false
  })

  // Fonction pour toggler un accordéon
  const toggleAccordeon = (salleKey) => {
    setAccordeonsOuverts(prev => ({
      ...prev,
      [salleKey]: !prev[salleKey]
    }))
  }

  // Fonction pour modifier un champ simple
  const handleInputChange = useCallback((salleKey, field, value) => {
    updateField(`section_salle_de_bains.${salleKey}.${field}`, value)
  }, [updateField])

  // Fonction pour modifier une checkbox équipement
  const handleCheckboxChange = useCallback((salleKey, field, checked) => {
    updateField(`section_salle_de_bains.${salleKey}.${field}`, checked ? true : null)
  }, [updateField])

  // Fonction pour modifier un radio button
  const handleRadioChange = useCallback((salleKey, field, value) => {
    updateField(`section_salle_de_bains.${salleKey}.${field}`, value === 'true' ? true : (value === 'false' ? false : null))
  }, [updateField])

  // Configuration des équipements
  const equipements = [
    { key: 'equipements_douche', label: 'Douche' },
    { key: 'equipements_baignoire', label: 'Baignoire' },
    { key: 'equipements_douche_baignoire_combinees', label: 'Douche et baignoire combinées' },
    { key: 'equipements_double_vasque', label: 'Double vasque' },
    { key: 'equipements_wc', label: 'WC' },
    { key: 'equipements_bidet', label: 'Bidet' },
    { key: 'equipements_chauffage', label: 'Chauffage' },
    { key: 'equipements_lave_linge', label: 'Lave-linge' },
    { key: 'equipements_seche_serviette', label: 'Sèche-serviette' },
    { key: 'equipements_seche_cheveux', label: 'Sèche-cheveux' },
    { key: 'equipements_autre', label: 'Autre (veuillez préciser)' }
  ]

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Salle de bains</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Bath className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Configuration des salles de bains</h2>
                    <p className="text-gray-600">Détails des équipements et aménagements de chaque salle de bains</p>
                  </div>
                </div>
              </div>
              
              {/* Vérification nombre de salles de bains */}
              {nombreSallesDeBains === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Aucune salle de bains configurée. Veuillez d'abord indiquer le nombre de salles de bains dans la section Visite.
                  </p>
                  <p className="text-sm text-gray-500">
                    Utilisez les boutons de navigation pour retourner à la section Visite.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <p className="text-gray-600">
                      Configuration des <strong>{nombreSallesDeBains} salle{nombreSallesDeBains > 1 ? 's' : ''} de bains</strong> du logement
                    </p>
                  </div>

                  {/* Accordéons dynamiques */}
                  {Array.from({ length: nombreSallesDeBains }, (_, index) => {
                    const salleKey = `salle_de_bain_${index + 1}`
                    const numeroAffiche = index + 1
                    
                    return (
                      <AccordeonSalleDeBain
                        key={salleKey}
                        salleKey={salleKey}
                        numeroAffiche={numeroAffiche}
                        formDataSallesDeBains={formDataSallesDeBains}
                        accordeonsOuverts={accordeonsOuverts}
                        toggleAccordeon={toggleAccordeon}
                        handleInputChange={handleInputChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleRadioChange={handleRadioChange}
                        equipements={equipements}
                      />
                    )
                  })}
                </div>
              )}
              
              <NavigationButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}