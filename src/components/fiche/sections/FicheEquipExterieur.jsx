// src/components/fiche/sections/FicheEquipExterieur.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { TreePine } from 'lucide-react'
import React from 'react'

// Cartes de schéma - définir quels champs nettoyer par branche
const BRANCH_SCHEMAS = {
  exterieur: [
    'exterieur_type_espace', 'exterieur_description_generale', 'exterieur_entretien_prestataire',
    'exterieur_entretien_frequence', 'exterieur_entretien_type_prestation', 'exterieur_entretien_qui',
    'exterieur_equipements', 'exterieur_equipements_autre_details', 'exterieur_nombre_chaises_longues',
    'exterieur_nombre_parasols', 'exterieur_acces', 'exterieur_type_acces', 'exterieur_type_acces_autre_details',
    'barbecue_instructions', 'barbecue_type', 'barbecue_combustible_fourni', 'barbecue_ustensiles_fournis'
  ],
  piscine: [
    'piscine_type', 'piscine_acces', 'piscine_dimensions', 'piscine_disponibilite',
    'piscine_periode_disponibilite', 'piscine_heures', 'piscine_horaires_ouverture',
    'piscine_caracteristiques', 'piscine_periode_chauffage', 'piscine_entretien_prestataire',
    'piscine_entretien_frequence', 'piscine_entretien_type_prestation', 'piscine_entretien_qui',
    'piscine_regles_utilisation'
  ],
  jacuzzi: [
    'jacuzzi_acces', 'jacuzzi_entretien_prestataire', 'jacuzzi_entretien_frequence',
    'jacuzzi_entretien_type_prestation', 'jacuzzi_entretien_qui', 'jacuzzi_taille',
    'jacuzzi_heures_utilisation', 'jacuzzi_instructions'
  ],
  cuisine_ext: [
    'cuisine_ext_entretien_prestataire', 'cuisine_ext_entretien_frequence',
    'cuisine_ext_entretien_type_prestation', 'cuisine_ext_entretien_qui',
    'cuisine_ext_superficie', 'cuisine_ext_type', 'cuisine_ext_caracteristiques'
  ],
  sauna: [
    'sauna_acces', 'sauna_entretien_prestataire', 'sauna_entretien_frequence',
    'sauna_entretien_type_prestation', 'sauna_entretien_qui', 'sauna_instructions'
  ],
  hammam: [
    'hammam_acces', 'hammam_entretien_prestataire', 'hammam_entretien_frequence',
    'hammam_entretien_type_prestation', 'hammam_entretien_qui', 'hammam_instructions'
  ],
  salle_cinema: [
    'salle_cinema_instructions'
  ],
  salle_sport: [
    'salle_sport_instructions'
  ],
  salle_jeux: [
    'salle_jeux_equipements', 'salle_jeux_instructions'
  ]
}

const PHOTOS_SCHEMAS = {
  exterieur: ['exterieur_photos_taken', 'barbecue_photos_taken'],
  piscine: ['piscine_video_taken'],
  jacuzzi: ['jacuzzi_photos_taken'],
  cuisine_ext: [],
  sauna: ['sauna_photos_taken'],
  hammam: ['hammam_photos_taken'],
  salle_cinema: ['salle_cinema_photos_taken'],
  salle_sport: ['salle_sport_photos_taken'],
  salle_jeux: ['salle_jeux_photos_taken']
}

// Composant pattern entretien réutilisable
const EntretienPattern = React.memo(({ prefix, label, formData, getField, handleInputChange, handleRadioChange }) => {
  const entretienField = `${prefix}_entretien_prestataire`
  const entretienValue = getField(entretienField)

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-3 text-gray-900">
          Le prestataire doit-il gérer l'entretien {label} ?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={entretienValue === true}
              onChange={() => handleRadioChange(entretienField, 'true')}
              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
            />
            <span className="text-gray-700">Oui</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={entretienValue === false}
              onChange={() => handleRadioChange(entretienField, 'false')}
              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
            />
            <span className="text-gray-700">Non</span>
          </label>
        </div>
      </div>

      {entretienValue === true && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <label className="block font-medium mb-2 text-gray-900">Fréquence d'entretien</label>
            <input
              type="text"
              placeholder="Ex : 2 fois par semaine (lundi / vendredi)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
              value={getField(`${prefix}_entretien_frequence`)}
              onChange={(e) => handleInputChange(`${prefix}_entretien_frequence`, e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-2 text-gray-900">Type de prestation</label>
            <textarea
              placeholder="Ex : ajout des produits d'entretien"
              className="w-full p-3 border border-gray-300 rounded-lg h-20 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
              value={getField(`${prefix}_entretien_type_prestation`)}
              onChange={(e) => handleInputChange(`${prefix}_entretien_type_prestation`, e.target.value)}
            />
          </div>
        </div>
      )}

      {entretienValue === false && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block font-medium mb-2 text-gray-900">Qui s'occupe de l'entretien ?</label>
          <textarea
            placeholder="Ex : Une entreprise spécialisée..."
            className="w-full p-3 border border-gray-300 rounded-lg h-20 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
            value={getField(`${prefix}_entretien_qui`)}
            onChange={(e) => handleInputChange(`${prefix}_entretien_qui`, e.target.value)}
          />
        </div>
      )}
    </div>
  )
})

export default function FicheEquipExterieur() {
  const {
    getField,
    updateField
  } = useForm()

  // Récupérer formData pour les booléens
  const formData = getField('section_equip_spe_exterieur')

  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  const handleRadioChange = (field, value) => {
    const boolValue = value === 'true' ? true : (value === 'false' ? false : null)

    // Si on passe à false sur une question racine, nettoyer la branche
    if (boolValue === false) {
      const currentData = getField('section_equip_spe_exterieur')
      const newData = { ...currentData }

      // Déterminer quelle branche nettoyer
      let branchToClean = null
      if (field.includes('dispose_exterieur')) branchToClean = 'exterieur'
      else if (field.includes('dispose_piscine')) branchToClean = 'piscine'
      else if (field.includes('dispose_jacuzzi')) branchToClean = 'jacuzzi'
      else if (field.includes('dispose_cuisine_exterieure')) branchToClean = 'cuisine_ext'
      else if (field.includes('dispose_sauna')) branchToClean = 'sauna'
      else if (field.includes('dispose_hammam')) branchToClean = 'hammam'
      else if (field.includes('dispose_salle_cinema')) branchToClean = 'salle_cinema'
      else if (field.includes('dispose_salle_sport')) branchToClean = 'salle_sport'
      else if (field.includes('dispose_salle_jeux')) branchToClean = 'salle_jeux'

      if (branchToClean) {
        // Nettoyer les champs de la branche
        BRANCH_SCHEMAS[branchToClean].forEach(key => {
          if (Array.isArray(newData[key])) {
            newData[key] = []
          } else if (typeof newData[key] === 'object' && newData[key] !== null) {
            newData[key] = {}
          } else {
            newData[key] = null
          }
        })

        // Nettoyer les photos associées
        if (newData.photos_rappels) {
          PHOTOS_SCHEMAS[branchToClean].forEach(photoKey => {
            newData.photos_rappels[photoKey] = false
          })
        }
      }

      // Remettre explicitement le flag racine à false
      const fieldKey = field.split('.').pop()
      newData[fieldKey] = false

      // Une seule mise à jour atomique
      updateField('section_equip_spe_exterieur', newData)
    } else {
      // Comportement normal pour les autres cas
      updateField(field, boolValue)
    }
  }

  const handleArrayCheckboxChange = (field, option, checked) => {
    const currentArray = formData[field.split('.').pop()] || []
    let newArray
    if (checked) {
      newArray = [...currentArray, option]
    } else {
      newArray = currentArray.filter(item => item !== option)
    }
    updateField(field, newArray)
  }

  const handleNumberChange = (field, value) => {
    updateField(field, value === '' ? null : parseInt(value))
  }

  const handleBranchToggle = (branchField, value, branchPrefix) => {
    // D'abord mettre à jour le champ principal
    handleRadioChange(branchField, value)

    // Si on désélectionne (false), nettoyer tous les champs de la branche
    if (value === 'false') {
      const currentData = getField('section_equip_spe_exterieur')
      const cleanedData = { ...currentData }

      // Nettoyer tous les champs qui commencent par le préfixe de la branche
      Object.keys(cleanedData).forEach(key => {
        if (key.startsWith(branchPrefix)) {
          if (Array.isArray(cleanedData[key])) {
            cleanedData[key] = []
          } else if (typeof cleanedData[key] === 'object' && cleanedData[key] !== null) {
            cleanedData[key] = {}
          } else {
            cleanedData[key] = null
          }
        }
      })

      // Nettoyer aussi les rappels photos associés
      if (cleanedData.photos_rappels) {
        const photosToClean = Object.keys(cleanedData.photos_rappels).filter(key =>
          key.startsWith(branchPrefix.replace('_', ''))
        )
        photosToClean.forEach(key => {
          cleanedData.photos_rappels[key] = false
        })
      }

      // Mettre à jour toute la section d'un coup
      updateField('section_equip_spe_exterieur', cleanedData)
    }
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />

      <div className="flex-1 flex flex-col">
        <ProgressBar />

        <div className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Équipements spécifiques et extérieurs</h1>

            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* Header avec icône */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TreePine className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Espaces extérieurs et équipements</h2>
                  <p className="text-gray-600">Inventaire des espaces et équipements extérieurs</p>
                </div>
              </div>

              {/* Questions racines - Grid 2x2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Question 1 : Extérieur */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-900">
                    Le logement dispose-t-il d'un extérieur ? *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_exterieur === true}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_exterieur', 'true')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_exterieur === false}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_exterieur', 'false')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                </div>

                {/* Question 2 : Piscine */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-900">
                    Le logement propose-t-il une piscine ?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_piscine === true}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_piscine', 'true')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_piscine === false}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_piscine', 'false')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                </div>

                {/* Question 3 : Jacuzzi */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-900">
                    Le logement propose-t-il un jacuzzi ?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_jacuzzi === true}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_jacuzzi', 'true')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_jacuzzi === false}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_jacuzzi', 'false')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                </div>

                {/* Question 4 : Cuisine extérieure */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-900">
                    Le logement propose-t-il une cuisine extérieure ?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_cuisine_exterieure === true}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_cuisine_exterieure', 'true')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_cuisine_exterieure === false}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_cuisine_exterieure', 'false')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                </div>

                {/* Question 5 : Sauna */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-900">
                    Le logement dispose-t-il d'un sauna ?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_sauna === true}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_sauna', 'true')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_sauna === false}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_sauna', 'false')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                </div>

                {/* Question 6 : Hammam */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-900">
                    Le logement dispose-t-il d'un hammam ?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_hammam === true}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_hammam', 'true')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_hammam === false}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_hammam', 'false')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                </div>

                {/* Question 7 : Salle de cinéma */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-900">
                    Le logement dispose-t-il d'une salle de cinéma ?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_salle_cinema === true}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_salle_cinema', 'true')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_salle_cinema === false}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_salle_cinema', 'false')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                </div>

                {/* Question 8 : Salle de sport */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-900">
                    Le logement dispose-t-il d'une salle de sport ?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_salle_sport === true}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_salle_sport', 'true')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_salle_sport === false}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_salle_sport', 'false')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                </div>

                {/* Question 9 : Salle de jeux */}
                <div className="space-y-3">
                  <label className="block font-semibold text-gray-900">
                    Le logement dispose-t-il d'une salle de jeux ?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_salle_jeux === true}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_salle_jeux', 'true')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.dispose_salle_jeux === false}
                        onChange={() => handleRadioChange('section_equip_spe_exterieur.dispose_salle_jeux', 'false')}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* BRANCHE EXTÉRIEUR - ÉTAPE 2 */}
              {formData.dispose_exterieur === true && (
                <div className="mt-12 pt-8 border-t border-green-200">
                  <div className="border-l-4 border-green-500 pl-6 space-y-8">
                    <h2 className="text-xl font-semibold text-green-700 flex items-center gap-2">
                      🌿 Espace extérieur
                    </h2>

                    {/* Type d'espace extérieur */}
                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">
                        Quel type d'espace extérieur est disponible ?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['Balcon', 'Terrasse', 'Jardin', 'Patio', 'Aucun'].map(option => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.exterieur_type_espace || []).includes(option)}
                              onChange={(e) => handleArrayCheckboxChange('section_equip_spe_exterieur.exterieur_type_espace', option, e.target.checked)}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Description générale */}
                    <div>
                      <label className="block font-semibold mb-2 text-gray-900">
                        Description générale du ou des espace(s) extérieur(s)
                      </label>
                      <textarea
                        placeholder="Décrivez l'espace extérieur, son agencement, sa décoration, les équipements présents (par ex: table, chaises, barbecue) et l'ambiance (vue, orientation, etc.)"
                        className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                        value={getField('section_equip_spe_exterieur.exterieur_description_generale')}
                        onChange={(e) => handleInputChange('section_equip_spe_exterieur.exterieur_description_generale', e.target.value)}
                      />
                    </div>

                    {/* Pattern entretien */}
                    <EntretienPattern
                      prefix="section_equip_spe_exterieur.exterieur"
                      label="de l'extérieur"
                      formData={formData}
                      getField={getField}
                      handleInputChange={handleInputChange}
                      handleRadioChange={handleRadioChange}
                    />

                    {/* Équipements disponibles */}
                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">
                        Équipements disponibles dans l'espace extérieur :
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          'Table extérieure', 'Chaises', 'Chaises longues', 'Barbecue', 'Parasol',
                          'Produits pour la plage', 'Brasero', 'Hamac', 'Jeux pour enfants',
                          'Éclairage extérieur', 'Brise-vue', 'Clôture', 'Douche extérieure',
                          'Moustiquaire', 'Autre'
                        ].map(option => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.exterieur_equipements || []).includes(option)}
                              onChange={(e) => handleArrayCheckboxChange('section_equip_spe_exterieur.exterieur_equipements', option, e.target.checked)}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>

                      {/* Champ conditionnel "Autre" */}
                      {(formData.exterieur_equipements || []).includes('Autre') && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Veuillez saisir une autre option ici"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                            value={getField('section_equip_spe_exterieur.exterieur_equipements_autre_details')}
                            onChange={(e) => handleInputChange('section_equip_spe_exterieur.exterieur_equipements_autre_details', e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Nombres conditionnels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(formData.exterieur_equipements || []).includes('Chaises longues') && (
                        <div>
                          <label className="block font-medium mb-2 text-gray-900">Chaises longues - Nombre</label>
                          <input
                            type="number"
                            placeholder="ex: 2"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                            value={formData.exterieur_nombre_chaises_longues || ''}
                            onChange={(e) => handleNumberChange('section_equip_spe_exterieur.exterieur_nombre_chaises_longues', e.target.value)}
                          />
                        </div>
                      )}

                      {(formData.exterieur_equipements || []).includes('Parasol') && (
                        <div>
                          <label className="block font-medium mb-2 text-gray-900">Parasols - Nombre</label>
                          <input
                            type="number"
                            placeholder="ex: 1"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                            value={formData.exterieur_nombre_parasols || ''}
                            onChange={(e) => handleNumberChange('section_equip_spe_exterieur.exterieur_nombre_parasols', e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Rappel photos VERSION LITE */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-3">📸 Rappel photos</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={getField('section_equip_spe_exterieur.photos_rappels.exterieur_photos_taken') || false}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.exterieur_photos_taken', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                        />
                        <span className="text-sm text-yellow-700">Pensez à prendre des photos de l'extérieur</span>
                      </label>
                    </div>

                    {/* Accès */}
                    <div>
                      <label className="block font-semibold mb-2 text-gray-900">
                        Accès à l'espace extérieur :
                      </label>
                      <textarea
                        placeholder="Expliquez comment accéder à l'espace extérieur (par ex: directement depuis le salon ou via un escalier extérieur)"
                        className="w-full p-3 border border-gray-300 rounded-lg h-20 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                        value={getField('section_equip_spe_exterieur.exterieur_acces')}
                        onChange={(e) => handleInputChange('section_equip_spe_exterieur.exterieur_acces', e.target.value)}
                      />
                    </div>

                    {/* Type d'accès */}
                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">
                        Est-ce que l'espace extérieur est privé ou partagé ?
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          'Privé',
                          'Partagé avec d\'autres logements',
                          'Partagé avec le voisinage',
                          'Autre'
                        ].map(option => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={formData.exterieur_type_acces === option}
                              onChange={() => handleInputChange('section_equip_spe_exterieur.exterieur_type_acces', option)}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>

                      {/* Champ conditionnel "Autre" */}
                      {formData.exterieur_type_acces === 'Autre' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Veuillez saisir une autre option ici"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                            value={getField('section_equip_spe_exterieur.exterieur_type_acces_autre_details')}
                            onChange={(e) => handleInputChange('section_equip_spe_exterieur.exterieur_type_acces_autre_details', e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* SOUS-BRANCHE BARBECUE */}
                    {(formData.exterieur_equipements || []).includes('Barbecue') && (
                      <div className="border-l-4 border-orange-500 pl-6 space-y-6 bg-orange-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-orange-700 flex items-center gap-2">
                          🔥 Section Barbecue
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-medium mb-2 text-gray-900">Instructions d'utilisation</label>
                            <textarea
                              placeholder="Fournissez des informations sur l'utilisation du barbecue"
                              className="w-full p-3 border border-gray-300 rounded-lg h-20 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                              value={getField('section_equip_spe_exterieur.barbecue_instructions')}
                              onChange={(e) => handleInputChange('section_equip_spe_exterieur.barbecue_instructions', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block font-medium mb-2 text-gray-900">Type de barbecue</label>
                            <input
                              type="text"
                              placeholder="Indiquez le type de barbecue (charbon, gaz, électrique)"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                              value={getField('section_equip_spe_exterieur.barbecue_type')}
                              onChange={(e) => handleInputChange('section_equip_spe_exterieur.barbecue_type', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-semibold mb-3 text-gray-900">Le combustible est-il fourni ?</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  checked={formData.barbecue_combustible_fourni === true}
                                  onChange={() => handleRadioChange('section_equip_spe_exterieur.barbecue_combustible_fourni', 'true')}
                                  className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                                />
                                <span className="text-gray-700">Oui</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  checked={formData.barbecue_combustible_fourni === false}
                                  onChange={() => handleRadioChange('section_equip_spe_exterieur.barbecue_combustible_fourni', 'false')}
                                  className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                                />
                                <span className="text-gray-700">Non</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block font-semibold mb-3 text-gray-900">Les ustensiles sont-ils fournis ?</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  checked={formData.barbecue_ustensiles_fournis === true}
                                  onChange={() => handleRadioChange('section_equip_spe_exterieur.barbecue_ustensiles_fournis', 'true')}
                                  className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                                />
                                <span className="text-gray-700">Oui</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  checked={formData.barbecue_ustensiles_fournis === false}
                                  onChange={() => handleRadioChange('section_equip_spe_exterieur.barbecue_ustensiles_fournis', 'false')}
                                  className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                                />
                                <span className="text-gray-700">Non</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Rappel photos barbecue */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-800 mb-3">📸 Rappel photos</h4>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={getField('section_equip_spe_exterieur.photos_rappels.barbecue_photos_taken') || false}
                              onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.barbecue_photos_taken', e.target.checked)}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                            />
                            <span className="text-sm text-yellow-700">Pensez à prendre des photos du barbecue et des ustensiles</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BRANCHE PISCINE - ÉTAPE 3 */}
              {formData.dispose_piscine === true && (
                <div className="mt-12 pt-8 border-t border-blue-200">
                  <div className="border-l-4 border-blue-500 pl-6 space-y-8">
                    <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                      🏊‍♂️ Piscine
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Type */}
                      <div>
                        <label className="block font-semibold mb-3 text-gray-900">Type</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={formData.piscine_type === 'Privée'}
                              onChange={() => handleInputChange('section_equip_spe_exterieur.piscine_type', 'Privée')}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                            />
                            <span className="text-gray-700">Privée</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={formData.piscine_type === 'Publique ou partagée'}
                              onChange={() => handleInputChange('section_equip_spe_exterieur.piscine_type', 'Publique ou partagée')}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                            />
                            <span className="text-gray-700">Publique ou partagée</span>
                          </label>
                        </div>
                      </div>

                      {/* Accès */}
                      <div>
                        <label className="block font-semibold mb-3 text-gray-900">Accès</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={formData.piscine_acces === 'Intérieur'}
                              onChange={() => handleInputChange('section_equip_spe_exterieur.piscine_acces', 'Intérieur')}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                            />
                            <span className="text-gray-700">Intérieur</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={formData.piscine_acces === 'Extérieur'}
                              onChange={() => handleInputChange('section_equip_spe_exterieur.piscine_acces', 'Extérieur')}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                            />
                            <span className="text-gray-700">Extérieur</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label className="block font-medium mb-2 text-gray-900">Dimensions</label>
                      <input
                        type="text"
                        placeholder="ex : 5m sur 2m"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                        value={getField('section_equip_spe_exterieur.piscine_dimensions')}
                        onChange={(e) => handleInputChange('section_equip_spe_exterieur.piscine_dimensions', e.target.value)}
                      />
                    </div>

                    {/* Disponibilité */}
                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">Disponibilité</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.piscine_disponibilite === 'Disponible toute l\'année'}
                            onChange={() => handleInputChange('section_equip_spe_exterieur.piscine_disponibilite', 'Disponible toute l\'année')}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                          />
                          <span className="text-gray-700">Disponible toute l'année</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.piscine_disponibilite === 'Disponible à certaines périodes'}
                            onChange={() => handleInputChange('section_equip_spe_exterieur.piscine_disponibilite', 'Disponible à certaines périodes')}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                          />
                          <span className="text-gray-700">Disponible à certaines périodes</span>
                        </label>
                      </div>

                      {formData.piscine_disponibilite === 'Disponible à certaines périodes' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Indiquez les périodes de disponibilité de la piscine"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                            value={getField('section_equip_spe_exterieur.piscine_periode_disponibilite')}
                            onChange={(e) => handleInputChange('section_equip_spe_exterieur.piscine_periode_disponibilite', e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Heures d'utilisation */}
                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">Heures d'utilisation</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.piscine_heures === 'Ouverture 24h/24'}
                            onChange={() => handleInputChange('section_equip_spe_exterieur.piscine_heures', 'Ouverture 24h/24')}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                          />
                          <span className="text-gray-700">Ouverture 24h/24</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.piscine_heures === 'Heures d\'ouverture spécifiques'}
                            onChange={() => handleInputChange('section_equip_spe_exterieur.piscine_heures', 'Heures d\'ouverture spécifiques')}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                          />
                          <span className="text-gray-700">Heures d'ouverture spécifiques</span>
                        </label>
                      </div>

                      {formData.piscine_heures === 'Heures d\'ouverture spécifiques' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Indiquez les horaires d'ouverture de la piscine"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                            value={getField('section_equip_spe_exterieur.piscine_horaires_ouverture')}
                            onChange={(e) => handleInputChange('section_equip_spe_exterieur.piscine_horaires_ouverture', e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Caractéristiques */}
                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">
                        Caractéristiques de la piscine
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          'Chauffée', 'À débordement', 'Couloir de nage', 'Taille olympique',
                          'Toit-terrasse', 'Eau salée', 'Bâche de piscine', 'Jouets de piscine',
                          'Toboggan aquatique'
                        ].map(option => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.piscine_caracteristiques || []).includes(option)}
                              onChange={(e) => handleArrayCheckboxChange('section_equip_spe_exterieur.piscine_caracteristiques', option, e.target.checked)}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>

                      {(formData.piscine_caracteristiques || []).includes('Chauffée') && (
                        <div className="mt-3">
                          <label className="block font-medium mb-2 text-gray-900">Période de chauffage de la piscine</label>
                          <input
                            type="text"
                            placeholder="ex : Septembre - Juin"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                            value={getField('section_equip_spe_exterieur.piscine_periode_chauffage')}
                            onChange={(e) => handleInputChange('section_equip_spe_exterieur.piscine_periode_chauffage', e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Pattern entretien piscine */}
                    <EntretienPattern
                      prefix="section_equip_spe_exterieur.piscine"
                      label="de la piscine"
                      formData={formData}
                      getField={getField}
                      handleInputChange={handleInputChange}
                      handleRadioChange={handleRadioChange}
                    />

                    {/* Règles d'utilisation */}
                    <div>
                      <label className="block font-medium mb-2 text-gray-900">Règles d'utilisation</label>
                      <textarea
                        placeholder="Indiquez les règles d'utilisation ou consignes particulières pour l'utilisation de la piscine."
                        className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                        value={getField('section_equip_spe_exterieur.piscine_regles_utilisation')}
                        onChange={(e) => handleInputChange('section_equip_spe_exterieur.piscine_regles_utilisation', e.target.value)}
                      />
                    </div>

                    {/* Rappel vidéo piscine VERSION LITE */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-3">📹 Rappel vidéo</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={getField('section_equip_spe_exterieur.photos_rappels.piscine_video_taken') || false}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.piscine_video_taken', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                        />
                        <span className="text-sm text-yellow-700">Pensez à prendre une vidéo de la piscine</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* BRANCHE JACUZZI - ÉTAPE 3 */}
              {formData.dispose_jacuzzi === true && (
                <div className="mt-12 pt-8 border-t border-purple-200">
                  <div className="border-l-4 border-purple-500 pl-6 space-y-8">
                    <h2 className="text-xl font-semibold text-purple-700 flex items-center gap-2">
                      💦 Jacuzzi
                    </h2>

                    {/* Accès */}
                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">Accès</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.jacuzzi_acces === 'Intérieur'}
                            onChange={() => handleInputChange('section_equip_spe_exterieur.jacuzzi_acces', 'Intérieur')}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                          />
                          <span className="text-gray-700">Intérieur</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.jacuzzi_acces === 'Extérieur'}
                            onChange={() => handleInputChange('section_equip_spe_exterieur.jacuzzi_acces', 'Extérieur')}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                          />
                          <span className="text-gray-700">Extérieur</span>
                        </label>
                      </div>
                    </div>

                    {/* Pattern entretien jacuzzi */}
                    <EntretienPattern
                      prefix="section_equip_spe_exterieur.jacuzzi"
                      label="du jacuzzi"
                      formData={formData}
                      getField={getField}
                      handleInputChange={handleInputChange}
                      handleRadioChange={handleRadioChange}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium mb-2 text-gray-900">Taille</label>
                        <input
                          type="text"
                          placeholder="Indiquez les dimensions du jacuzzi"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                          value={getField('section_equip_spe_exterieur.jacuzzi_taille')}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.jacuzzi_taille', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block font-medium mb-2 text-gray-900">Heures d'utilisation</label>
                        <input
                          type="text"
                          placeholder="Ex : Disponible 24h/24 ou heures précises"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                          value={getField('section_equip_spe_exterieur.jacuzzi_heures_utilisation')}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.jacuzzi_heures_utilisation', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium mb-2 text-gray-900">Instructions d'utilisation</label>
                      <textarea
                        placeholder="Indiquez les consignes d'utilisation du jacuzzi"
                        className="w-full p-3 border border-gray-300 rounded-lg h-20 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                        value={getField('section_equip_spe_exterieur.jacuzzi_instructions')}
                        onChange={(e) => handleInputChange('section_equip_spe_exterieur.jacuzzi_instructions', e.target.value)}
                      />
                    </div>

                    {/* Rappel photos jacuzzi */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-3">📸 Rappel photos</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={getField('section_equip_spe_exterieur.photos_rappels.jacuzzi_photos_taken') || false}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.jacuzzi_photos_taken', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                        />
                        <span className="text-sm text-yellow-700">Pensez à prendre des photos du jacuzzi</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* BRANCHE CUISINE EXTÉRIEURE - ÉTAPE 3 */}
              {formData.dispose_cuisine_exterieure === true && (
                <div className="mt-12 pt-8 border-t border-yellow-200">
                  <div className="border-l-4 border-yellow-500 pl-6 space-y-8">
                    <h2 className="text-xl font-semibold text-yellow-700 flex items-center gap-2">
                      🍳 Cuisine extérieure
                    </h2>

                    {/* Pattern entretien cuisine extérieure */}
                    <EntretienPattern
                      prefix="section_equip_spe_exterieur.cuisine_ext"
                      label="de la cuisine extérieure"
                      formData={formData}
                      getField={getField}
                      handleInputChange={handleInputChange}
                      handleRadioChange={handleRadioChange}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium mb-2 text-gray-900">Superficie</label>
                        <input
                          type="text"
                          placeholder="Indiquez la taille de la cuisine extérieure"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                          value={getField('section_equip_spe_exterieur.cuisine_ext_superficie')}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.cuisine_ext_superficie', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-3 text-gray-900">Type de cuisine extérieure</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={formData.cuisine_ext_type === 'Privée'}
                              onChange={() => handleInputChange('section_equip_spe_exterieur.cuisine_ext_type', 'Privée')}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                            />
                            <span className="text-gray-700">Privée</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={formData.cuisine_ext_type === 'Publique ou partagée'}
                              onChange={() => handleInputChange('section_equip_spe_exterieur.cuisine_ext_type', 'Publique ou partagée')}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                            />
                            <span className="text-gray-700">Publique ou partagée</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">Caractéristiques</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Four', 'Évier'].map(option => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.cuisine_ext_caracteristiques || []).includes(option)}
                              onChange={(e) => handleArrayCheckboxChange('section_equip_spe_exterieur.cuisine_ext_caracteristiques', option, e.target.checked)}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BRANCHE SAUNA */}
              {formData.dispose_sauna === true && (
                <div className="mt-12 pt-8 border-t border-red-200">
                  <div className="border-l-4 border-red-500 pl-6 space-y-8">
                    <h2 className="text-xl font-semibold text-red-700 flex items-center gap-2">
                      🔥 Sauna
                    </h2>

                    {/* Accès */}
                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">Accès</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.sauna_acces === 'Intérieur'}
                            onChange={() => handleInputChange('section_equip_spe_exterieur.sauna_acces', 'Intérieur')}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                          />
                          <span className="text-gray-700">Intérieur</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.sauna_acces === 'Extérieur'}
                            onChange={() => handleInputChange('section_equip_spe_exterieur.sauna_acces', 'Extérieur')}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                          />
                          <span className="text-gray-700">Extérieur</span>
                        </label>
                      </div>
                    </div>

                    {/* Entretien */}
                    <EntretienPattern
                      prefix="section_equip_spe_exterieur.sauna"
                      label="du sauna"
                      formData={formData}
                      getField={getField}
                      handleInputChange={handleInputChange}
                      handleRadioChange={handleRadioChange}
                    />

                    {/* Instructions */}
                    <div>
                      <label className="block font-medium mb-2 text-gray-900">Instructions d'utilisation</label>
                      <textarea
                        placeholder="Indiquez les consignes d'utilisation du sauna"
                        className="w-full p-3 border border-gray-300 rounded-lg h-20 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                        value={getField('section_equip_spe_exterieur.sauna_instructions')}
                        onChange={(e) => handleInputChange('section_equip_spe_exterieur.sauna_instructions', e.target.value)}
                      />
                    </div>

                    {/* Rappel photos */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-3">📸 Rappel photos</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={getField('section_equip_spe_exterieur.photos_rappels.sauna_photos_taken') || false}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.sauna_photos_taken', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                        />
                        <span className="text-sm text-yellow-700">Pensez à prendre des photos du sauna</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* BRANCHE HAMMAM */}
              {formData.dispose_hammam === true && (
                <div className="mt-12 pt-8 border-t border-teal-200">
                  <div className="border-l-4 border-teal-500 pl-6 space-y-8">
                    <h2 className="text-xl font-semibold text-teal-700 flex items-center gap-2">
                      💨 Hammam
                    </h2>

                    {/* Accès */}
                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">Accès</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.hammam_acces === 'Intérieur'}
                            onChange={() => handleInputChange('section_equip_spe_exterieur.hammam_acces', 'Intérieur')}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                          />
                          <span className="text-gray-700">Intérieur</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.hammam_acces === 'Extérieur'}
                            onChange={() => handleInputChange('section_equip_spe_exterieur.hammam_acces', 'Extérieur')}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                          />
                          <span className="text-gray-700">Extérieur</span>
                        </label>
                      </div>
                    </div>

                    {/* Entretien */}
                    <EntretienPattern
                      prefix="section_equip_spe_exterieur.hammam"
                      label="du hammam"
                      formData={formData}
                      getField={getField}
                      handleInputChange={handleInputChange}
                      handleRadioChange={handleRadioChange}
                    />

                    {/* Instructions */}
                    <div>
                      <label className="block font-medium mb-2 text-gray-900">Instructions d'utilisation</label>
                      <textarea
                        placeholder="Indiquez les consignes d'utilisation du hammam"
                        className="w-full p-3 border border-gray-300 rounded-lg h-20 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                        value={getField('section_equip_spe_exterieur.hammam_instructions')}
                        onChange={(e) => handleInputChange('section_equip_spe_exterieur.hammam_instructions', e.target.value)}
                      />
                    </div>

                    {/* Rappel photos */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-3">📸 Rappel photos</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={getField('section_equip_spe_exterieur.photos_rappels.hammam_photos_taken') || false}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.hammam_photos_taken', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                        />
                        <span className="text-sm text-yellow-700">Pensez à prendre des photos du hammam</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* BRANCHE SALLE DE CINÉMA */}
              {formData.dispose_salle_cinema === true && (
                <div className="mt-12 pt-8 border-t border-indigo-200">
                  <div className="border-l-4 border-indigo-500 pl-6 space-y-8">
                    <h2 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
                      🎬 Salle de cinéma
                    </h2>

                    {/* Instructions */}
                    <div>
                      <label className="block font-medium mb-2 text-gray-900">Instructions d'utilisation</label>
                      <textarea
                        placeholder="Indiquez les consignes d'utilisation de la salle de cinéma (équipements disponibles, règles, etc.)"
                        className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                        value={getField('section_equip_spe_exterieur.salle_cinema_instructions')}
                        onChange={(e) => handleInputChange('section_equip_spe_exterieur.salle_cinema_instructions', e.target.value)}
                      />
                    </div>

                    {/* Rappel photos */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-3">📸 Rappel photos</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={getField('section_equip_spe_exterieur.photos_rappels.salle_cinema_photos_taken') || false}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.salle_cinema_photos_taken', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                        />
                        <span className="text-sm text-yellow-700">Pensez à prendre des photos de la salle de cinéma</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* BRANCHE SALLE DE SPORT */}
              {formData.dispose_salle_sport === true && (
                <div className="mt-12 pt-8 border-t border-orange-200">
                  <div className="border-l-4 border-orange-500 pl-6 space-y-8">
                    <h2 className="text-xl font-semibold text-orange-700 flex items-center gap-2">
                      🏋️ Salle de sport
                    </h2>

                    {/* Instructions */}
                    <div>
                      <label className="block font-medium mb-2 text-gray-900">Instructions d'utilisation</label>
                      <textarea
                        placeholder="Indiquez les équipements disponibles et les consignes d'utilisation de la salle de sport"
                        className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                        value={getField('section_equip_spe_exterieur.salle_sport_instructions')}
                        onChange={(e) => handleInputChange('section_equip_spe_exterieur.salle_sport_instructions', e.target.value)}
                      />
                    </div>

                    {/* Rappel photos */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-3">📸 Rappel photos</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={getField('section_equip_spe_exterieur.photos_rappels.salle_sport_photos_taken') || false}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.salle_sport_photos_taken', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                        />
                        <span className="text-sm text-yellow-700">Pensez à prendre des photos de la salle de sport</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* BRANCHE SALLE DE JEUX */}
              {formData.dispose_salle_jeux === true && (
                <div className="mt-12 pt-8 border-t border-pink-200">
                  <div className="border-l-4 border-pink-500 pl-6 space-y-8">
                    <h2 className="text-xl font-semibold text-pink-700 flex items-center gap-2">
                      🎱 Salle de jeux
                    </h2>

                    {/* Équipements disponibles */}
                    <div>
                      <label className="block font-semibold mb-3 text-gray-900">Équipements disponibles</label>
                      <div className="flex flex-wrap gap-4">
                        {['Billard', 'Baby Foot', 'Ping Pong'].map(option => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.salle_jeux_equipements || []).includes(option)}
                              onChange={(e) => handleArrayCheckboxChange('section_equip_spe_exterieur.salle_jeux_equipements', option, e.target.checked)}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Instructions par équipement */}
                    {(formData.salle_jeux_equipements || []).length > 0 && (
                      <div className="space-y-4">
                        <label className="block font-medium text-gray-900">Instructions d'utilisation</label>
                        <textarea
                          placeholder="Décrivez les règles et consignes d'utilisation pour chaque équipement disponible"
                          className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]"
                          value={getField('section_equip_spe_exterieur.salle_jeux_instructions')}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.salle_jeux_instructions', e.target.value)}
                        />
                      </div>
                    )}

                    {/* Rappel photos */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-3">📸 Rappel photos</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={getField('section_equip_spe_exterieur.photos_rappels.salle_jeux_photos_taken') || false}
                          onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.salle_jeux_photos_taken', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                        />
                        <span className="text-sm text-yellow-700">Pensez à prendre des photos de la salle de jeux</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION ÉLÉMENTS ABÎMÉS - ÉTAPE 3 */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Éléments abîmés dans d'autres espaces</h3>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Exemples d'éléments à vérifier :</span> Traces d'usures, tâches, joints colorés, joints décollés, meubles abîmés, tâches sur les tissus, tâches sur les murs, trous, absence de cache prise, absence de lustre, rayures, etc.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Garage */}
                  <div>
                    <label className="block font-semibold mb-3 text-gray-900">
                      Garage
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.garage_elements_abimes === true}
                          onChange={() => handleRadioChange('section_equip_spe_exterieur.garage_elements_abimes', 'true')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                        />
                        <span className="text-gray-700">Oui</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.garage_elements_abimes === false}
                          onChange={() => handleRadioChange('section_equip_spe_exterieur.garage_elements_abimes', 'false')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                        />
                        <span className="text-gray-700">Non</span>
                      </label>
                    </div>
                    {formData.garage_elements_abimes === true && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getField('section_equip_spe_exterieur.photos_rappels.garage_elements_abimes_taken') || false}
                            onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.garage_elements_abimes_taken', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                          />
                          <span className="text-sm text-yellow-700">📸 Photos prises</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Buanderie */}
                  <div>
                    <label className="block font-semibold mb-3 text-gray-900">
                      Buanderie
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.buanderie_elements_abimes === true}
                          onChange={() => handleRadioChange('section_equip_spe_exterieur.buanderie_elements_abimes', 'true')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                        />
                        <span className="text-gray-700">Oui</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.buanderie_elements_abimes === false}
                          onChange={() => handleRadioChange('section_equip_spe_exterieur.buanderie_elements_abimes', 'false')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                        />
                        <span className="text-gray-700">Non</span>
                      </label>
                    </div>
                    {formData.buanderie_elements_abimes === true && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getField('section_equip_spe_exterieur.photos_rappels.buanderie_elements_abimes_taken') || false}
                            onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.buanderie_elements_abimes_taken', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                          />
                          <span className="text-sm text-yellow-700">📸 Photos prises</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Autres pièces */}
                  <div>
                    <label className="block font-semibold mb-3 text-gray-900">
                      Autres pièces
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.autres_pieces_elements_abimes === true}
                          onChange={() => handleRadioChange('section_equip_spe_exterieur.autres_pieces_elements_abimes', 'true')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                        />
                        <span className="text-gray-700">Oui</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.autres_pieces_elements_abimes === false}
                          onChange={() => handleRadioChange('section_equip_spe_exterieur.autres_pieces_elements_abimes', 'false')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                        />
                        <span className="text-gray-700">Non</span>
                      </label>
                    </div>
                    {formData.autres_pieces_elements_abimes === true && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getField('section_equip_spe_exterieur.photos_rappels.autres_pieces_elements_abimes_taken') || false}
                            onChange={(e) => handleInputChange('section_equip_spe_exterieur.photos_rappels.autres_pieces_elements_abimes_taken', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2 rounded"
                          />
                          <span className="text-sm text-yellow-700">📸 Photos prises</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <NavigationButtons />
          </div>
        </div>
      </div>
    </div>
  )
}