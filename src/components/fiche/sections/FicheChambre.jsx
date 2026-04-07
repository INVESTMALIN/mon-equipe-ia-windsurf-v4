// src/components/fiche/sections/FicheChambre.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Bed, Home } from 'lucide-react'
import { useState, useCallback } from 'react'

// 🔥 COMPOSANT ACCORDÉON CHAMBRE (externe pour clarté)
const AccordeonChambre = ({ 
  chambreKey, 
  numeroAffiche, 
  formDataChambres, 
  accordeonsOuverts, 
  toggleAccordeon, 
  handleInputChange, 
  handleCheckboxChange, 
  handleCounterChange, 
  typesLits, 
  equipements 
}) => {
  const isOpen = accordeonsOuverts[chambreKey]
  const chambreData = formDataChambres[chambreKey] || {}
  
  // Composant Counter pour les lits
  const Counter = ({ litType, label }) => {
    const value = chambreData[litType] || 0
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleCounterChange(chambreKey, litType, 'decrement')}
            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:bg-gray-300"
            disabled={value === 0}
          >
            −
          </button>
          <span className="w-8 text-center font-semibold">{value}</span>
          <button
            type="button"
            onClick={() => handleCounterChange(chambreKey, litType, 'increment')}
            className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      {/* Header accordéon */}
      <button
        type="button"
        onClick={() => toggleAccordeon(chambreKey)}
        className="w-full px-4 py-3 bg-[#dbae61] text-white flex items-center justify-between hover:bg-[#c49a4f] transition-colors"
      >
        <span className="font-semibold">{numeroAffiche}</span>
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
              Nom ou description de la chambre
            </label>
            <input
              type="text"
              placeholder="Indiquez le nom ou une courte description"
              value={chambreData.nom_description || ""}
              onChange={(e) => handleInputChange(chambreKey, 'nom_description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
            />
          </div>

          {/* 2. Nombre de lits avec avertissement */}
          <div>
            <label className="block font-medium text-gray-900 mb-3">
              Nombre de lits
            </label>
            
            {/* Avertissement */}
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700">
              <p className="font-medium">
                ⚠️ ATTENTION ! EXCEPTION POUR LES LITS SUPERPOSÉS OU GIGOGNE :
              </p>
              <ul className="mt-2 text-sm space-y-1">
                <li>• 1 lit superposé = 2 lits (noter 2 dans la case)</li>
                <li>• 1 lit gigogne = 2 lits (noter 2 dans la case)</li>
              </ul>
            </div>

            {/* Compteurs de lits */}
            <div className="space-y-3">
              {typesLits.map(({ key, label }) => (
                <Counter
                  key={key}
                  litType={key}
                  label={label}
                />
              ))}
            </div>
          </div>

          {/* 3. Autre type de lit */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Autre type de lit ?
            </label>
            <input
              type="text"
              placeholder="ex : 1 très grand lit 200×200"
              value={chambreData.autre_type_lit || ""}
              onChange={(e) => handleInputChange(chambreKey, 'autre_type_lit', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
            />
          </div>

          {/* 4. Équipements */}
          <div>
            <label className="block font-medium text-gray-900 mb-3">
              Équipements dans la chambre
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {equipements.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={chambreData[key] === true}
                    onChange={(e) => handleCheckboxChange(chambreKey, key, e.target.checked)}
                    className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>

            {/* Champ conditionnel "Autre" */}
            {chambreData.equipements_autre === true && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Veuillez préciser..."
                  value={chambreData.equipements_autre_details || ""}
                  onChange={(e) => handleInputChange(chambreKey, 'equipements_autre_details', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>

          {/* 5. Rappel photos chambre (VERSION LITE) */}
          <div>
            <label className="block font-medium text-gray-900 mb-3">
              Photos de la chambre avec tous les équipements
            </label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`photos_chambre_${numeroAffiche}_taken`}
                  checked={chambreData.photos_rappels?.photos_chambre_taken || false}
                  onChange={(e) => handleInputChange(chambreKey, 'photos_rappels.photos_chambre_taken', e.target.checked)}
                  className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                />
                <label htmlFor={`photos_chambre_${numeroAffiche}_taken`} className="text-sm text-yellow-800">
                  📸 Pensez à prendre des photos de la chambre {numeroAffiche} avec tous les équipements
                </label>
              </div>
            </div>
          </div>

          {/* 6. Éléments abîmés */}
          <div>
            <label className="block font-medium text-gray-900 mb-3">
              Photos de tous les éléments abîmés, cassés ou détériorés dans la chambre {numeroAffiche}
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Traces d'usures, tâches, joints colorés, joints décollés, meubles abîmés, tâches sur les tissus, 
              tâches sur les murs, trous, absence de cache prise, absence de lustre, rayures, etc.
            </p>
            
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`chambre_${numeroAffiche}_elements_abimes`}
                  value="true"
                  checked={chambreData.elements_abimes === true}
                  onChange={() => handleInputChange(chambreKey, 'elements_abimes', true)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Oui</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`chambre_${numeroAffiche}_elements_abimes`}
                  value="false"
                  checked={chambreData.elements_abimes === false}
                  onChange={() => {
                    handleInputChange(chambreKey, 'elements_abimes', false)
                    handleInputChange(chambreKey, 'photos_rappels.elements_abimes_taken', false)
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Non</span>
              </label>
            </div>
            
            {/* Rappel conditionnel éléments abîmés (VERSION LITE) */}
            {chambreData.elements_abimes === true && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`elements_abimes_${numeroAffiche}_taken`}
                    checked={chambreData.photos_rappels?.elements_abimes_taken || false}
                    onChange={(e) => handleInputChange(chambreKey, 'photos_rappels.elements_abimes_taken', e.target.checked)}
                    className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                  />
                  <label htmlFor={`elements_abimes_${numeroAffiche}_taken`} className="text-sm text-blue-800">
                    📸 Pensez à prendre des photos des éléments abîmés de la chambre {numeroAffiche}
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

// 🔥 COMPOSANT PRINCIPAL FICHE CHAMBRE
export default function FicheChambre() {
  const { 
    getField,
    updateField
  } = useForm()

  // Récupérer le nombre de chambres depuis la section Visite
  const formDataVisite = getField('section_visite')
  const nombreChambres = parseInt(formDataVisite.nombre_chambres) || 0
  
  // Récupérer la typologie depuis la section Logement
  const formDataLogement = getField('section_logement')
  const typologie = formDataLogement.typologie

  // LOGIQUE STUDIO : Si Studio, forcer l'affichage d'1 "espace nuit"
  const isStudio = typologie === "Studio"
  const chambresAffichees = isStudio && nombreChambres === 0 ? 1 : nombreChambres
  const labelChambre = isStudio && nombreChambres === 0 ? "Espace nuit" : "Chambre"

  // Récupérer les données chambres
  const formDataChambres = getField('section_chambres')

  // État pour gérer les accordéons ouverts
  const [accordeonsOuverts, setAccordeonsOuverts] = useState({
    chambre_1: true, // Premier accordéon ouvert par défaut
    chambre_2: false,
    chambre_3: false,
    chambre_4: false,
    chambre_5: false,
    chambre_6: false
  })

  // Fonction pour toggler un accordéon
  const toggleAccordeon = (chambreKey) => {
    setAccordeonsOuverts(prev => ({
      ...prev,
      [chambreKey]: !prev[chambreKey]
    }))
  }

  // Fonction pour modifier un compteur de lit
  const handleCounterChange = (chambreKey, litType, operation) => {
    const currentValue = formDataChambres[chambreKey]?.[litType] || 0
    const newValue = operation === 'increment' ? currentValue + 1 : Math.max(0, currentValue - 1)
    updateField(`section_chambres.${chambreKey}.${litType}`, newValue)
  }

  // Fonction pour modifier un champ simple
  const handleInputChange = useCallback((chambreKey, field, value) => {
    updateField(`section_chambres.${chambreKey}.${field}`, value)
  }, [updateField])

  // Fonction pour modifier une checkbox équipement
  const handleCheckboxChange = useCallback((chambreKey, field, checked) => {
    updateField(`section_chambres.${chambreKey}.${field}`, checked ? true : null)
  }, [updateField])

  // Configuration des types de lits
  const typesLits = [
    { key: 'lit_simple_90_190', label: 'Lit simple (90 × 190 cm)' },
    { key: 'lit_double_140_190', label: 'Lit double (140 × 190 cm)' },
    { key: 'lit_queen_160_200', label: 'Queen size (160 × 200 cm)' },
    { key: 'lit_king_180_200', label: 'King size (180 × 200 cm)' },
    { key: 'canape_lit_simple', label: 'Canapé-lit Simple (dimensions variables)' },
    { key: 'canape_lit_double', label: 'Canapé-lit Double (dimensions variables)' },
    { key: 'lits_superposes_90_190', label: 'Lits superposés (90 × 190 cm par lit)' },
    { key: 'lit_gigogne', label: 'Lit Gigogne' }
  ]

  // Configuration des équipements
  const equipements = [
    { key: 'equipements_draps_fournis', label: 'Draps fournis' },
    { key: 'equipements_climatisation', label: 'Climatisation' },
    { key: 'equipements_ventilateur_plafond', label: 'Ventilateur de plafond' },
    { key: 'equipements_espace_rangement', label: 'Espace de rangement pour les vêtements (placard, armoire)' },
    { key: 'equipements_lit_bebe_60_120', label: 'Lit pour bébé (60 × 120 cm)' },
    { key: 'equipements_stores', label: 'Stores' },
    { key: 'equipements_television', label: 'Télévision' },
    { key: 'equipements_oreillers_couvertures_sup', label: 'Oreillers et couvertures supplémentaires' },
    { key: 'equipements_chauffage', label: 'Chauffage' },
    { key: 'equipements_cintres', label: 'Cintres' },
    { key: 'equipements_moustiquaire', label: 'Moustiquaire' },
    { key: 'equipements_lit_parapluie_60_120', label: 'Lit parapluie (60 × 120 cm)' },
    { key: 'equipements_systeme_audio', label: 'Système audio' },
    { key: 'equipements_coffre_fort', label: 'Coffre-fort' },
    { key: 'equipements_autre', label: 'Autre (veuillez préciser)' }
  ]

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">
              {isStudio && nombreChambres === 0 ? "Espace nuit" : "Chambres"}
            </h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
                    <Bed className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {isStudio && nombreChambres === 0 
                        ? "Configuration de l'espace nuit" 
                        : "Configuration des chambres"
                      }
                    </h2>
                    <p className="text-gray-600">
                      {isStudio && nombreChambres === 0
                        ? "Détails des équipements et aménagements de l'espace nuit du studio"
                        : "Détails des équipements et aménagements de chaque chambre"
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Vérification nombre de chambres avec logique Studio */}
              {chambresAffichees === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Aucune chambre configurée. Veuillez d'abord indiquer le nombre de chambres dans la section Visite.
                  </p>
                  <p className="text-sm text-gray-500">
                    Utilisez les boutons de navigation pour retourner à la section Visite.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    {isStudio && nombreChambres === 0 ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-800">
                          <strong>💡 Studio :</strong> Configuration de l'espace nuit du studio.
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        Configuration des <strong>{chambresAffichees} {labelChambre.toLowerCase()}{chambresAffichees > 1 ? 's' : ''}</strong> du logement
                      </p>
                    )}
                  </div>

                  {/* Accordéons dynamiques avec libellé adapté */}
                  {Array.from({ length: chambresAffichees }, (_, index) => {
                    const chambreKey = `chambre_${index + 1}`
                    const numeroAffiche = index + 1
                    const labelAccordeon = isStudio && nombreChambres === 0 ? "Espace nuit" : `${labelChambre} ${numeroAffiche}`
                    
                    return (
                      <AccordeonChambre
                        key={chambreKey}
                        chambreKey={chambreKey}
                        numeroAffiche={labelAccordeon} // Passer le label adapté
                        formDataChambres={formDataChambres}
                        accordeonsOuverts={accordeonsOuverts}
                        toggleAccordeon={toggleAccordeon}
                        handleInputChange={handleInputChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleCounterChange={handleCounterChange}
                        typesLits={typesLits}
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