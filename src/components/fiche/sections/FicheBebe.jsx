// src/components/fiche/sections/FicheBebe.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Baby } from 'lucide-react'

export default function FicheBebe() {
  const { 
    getField,
    updateField
  } = useForm()

  const handleInputChange = (fieldPath, value) => {
    updateField(fieldPath, value)
  }

  const handleRadioChange = (fieldPath, value) => {
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
      
      // Nettoyage automatique des champs liés quand on décoche
      if (option === 'Lit bébé') {
        updateField('section_bebe.lit_bebe_type', '')
        updateField('section_bebe.lit_parapluie_disponibilite', '')
        updateField('section_bebe.lit_stores_occultants', null)
      }
      
      if (option === 'Chaise haute') {
        updateField('section_bebe.chaise_haute_type', '')
        updateField('section_bebe.chaise_haute_disponibilite', '')
        updateField('section_bebe.chaise_haute_caracteristiques', [])
        updateField('section_bebe.chaise_haute_prix', '')
      }
      
      if (option === 'Jouets pour enfants') {
        updateField('section_bebe.jouets_tranches_age', [])
      }
      
      if (option === 'Autre (veuillez préciser)') {
        updateField('section_bebe.equipements_autre_details', '')
      }
    }
    
    updateField(fieldPath, newArray)
  }

  // Récupération des données
  const formData = getField('section_bebe')

  // Liste des équipements bébé
  const equipementsBebe = [
    'Lit bébé',
    'Chaise haute',
    'Table à langer',
    'Baignoire pour bébé',
    'Barrières de sécurité pour bébé',
    'Jouets pour enfants',
    'Babyphone',
    'Caches-prises',
    'Protections sur les coins de tables',
    'Protections sur les fenêtres',
    'Autre (veuillez préciser)'
  ]

  // Déterminer quels équipements sont cochés
  const equipementsCoches = formData.equipements || []
  const litBebeSelected = equipementsCoches.includes('Lit bébé')
  const chaisseHauteSelected = equipementsCoches.includes('Chaise haute')
  const jouetsSelected = equipementsCoches.includes('Jouets pour enfants')
  const autreSelected = equipementsCoches.includes('Autre (veuillez préciser)')

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Équipements pour Bébé</h1>
            
            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Baby className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Équipements Bébé</h2>
                    <p className="text-gray-600">Facilités pour les familles avec enfants</p>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="space-y-8">
                
                {/* Liste principale des équipements */}
                <div>
                  <label className="block font-medium text-gray-900 mb-4">
                    Équipements pour bébé disponibles dans le logement :
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipementsBebe.map(equipement => (
                      <label key={equipement} className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={equipementsCoches.includes(equipement)}
                          onChange={(e) => handleArrayCheckboxChange('section_bebe.equipements', equipement, e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] border-gray-300 rounded focus:ring-[#dbae61] mt-0.5"
                        />
                        <span className="text-sm text-gray-700">{equipement}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SECTION CONDITIONNELLE : LIT BÉBÉ */}
                {litBebeSelected && (
                  <div className="border-l-4 border-pink-500 pl-6 bg-pink-50 p-6 rounded-r-lg space-y-6">
                    <h3 className="text-lg font-semibold text-pink-700">Lit bébé</h3>
                    
                    {/* Type de lit bébé */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-3">Type de lit bébé :</label>
                      <div className="space-y-3">
                        {['Lit pour bébé', 'Parc de voyage', 'Lit parapluie'].map(type => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="lit_bebe_type"
                              value={type}
                              checked={formData.lit_bebe_type === type}
                              onChange={(e) => handleRadioChange('section_bebe.lit_bebe_type', e.target.value)}
                              className="w-4 h-4 text-[#dbae61] border-gray-300 focus:ring-[#dbae61]"
                            />
                            <span className="text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* SOUS-SECTION CONDITIONNELLE : LIT PARAPLUIE */}
                    {formData.lit_bebe_type === 'Lit parapluie' && (
                      <div className="bg-white border border-pink-200 rounded-lg p-6 space-y-6">
                        <h4 className="font-medium text-gray-900">Lit Parapluie</h4>
                        
                        {/* Disponibilité lit parapluie */}
                        <div>
                          <label className="block font-medium text-gray-900 mb-3">Disponibilité du lit parapluie :</label>
                          <div className="space-y-3">
                            {['Toujours dans le logement', 'Sur demande'].map(dispo => (
                              <label key={dispo} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="lit_parapluie_disponibilite"
                                  value={dispo}
                                  checked={formData.lit_parapluie_disponibilite === dispo}
                                  onChange={(e) => handleRadioChange('section_bebe.lit_parapluie_disponibilite', e.target.value)}
                                  className="w-4 h-4 text-[#dbae61] border-gray-300 focus:ring-[#dbae61]"
                                />
                                <span className="text-gray-700">{dispo}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Stores occultants */}
                        <div>
                          <label className="block font-medium text-gray-900 mb-3">Caractéristique supplémentaire :</label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.lit_stores_occultants === true}
                              onChange={(e) => handleCheckboxChange('section_bebe.lit_stores_occultants', e.target.checked)}
                              className="w-4 h-4 text-[#dbae61] border-gray-300 rounded focus:ring-[#dbae61]"
                            />
                            <span className="text-gray-700">Stores occultants dans la pièce</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION CONDITIONNELLE : CHAISE HAUTE */}
                {chaisseHauteSelected && (
                  <div className="border-l-4 border-blue-500 pl-6 bg-blue-50 p-6 rounded-r-lg space-y-6">
                    <h3 className="text-lg font-semibold text-blue-700">Chaise haute</h3>
                    
                    {/* Type de chaise haute */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-3">Type de chaise haute :</label>
                      <div className="space-y-3">
                        {['Indépendante', 'Pliable ou transformable', 'Rehausseur', 'Siège de table'].map(type => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="chaise_haute_type"
                              value={type}
                              checked={formData.chaise_haute_type === type}
                              onChange={(e) => handleRadioChange('section_bebe.chaise_haute_type', e.target.value)}
                              className="w-4 h-4 text-[#dbae61] border-gray-300 focus:ring-[#dbae61]"
                            />
                            <span className="text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Disponibilité chaise haute */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-3">Disponibilité de la chaise haute :</label>
                      <div className="space-y-3">
                        {['Toujours disponible dans le logement', 'Sur demande'].map(dispo => (
                          <label key={dispo} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="chaise_haute_disponibilite"
                              value={dispo}
                              checked={formData.chaise_haute_disponibilite === dispo}
                              onChange={(e) => handleRadioChange('section_bebe.chaise_haute_disponibilite', e.target.value)}
                              className="w-4 h-4 text-[#dbae61] border-gray-300 focus:ring-[#dbae61]"
                            />
                            <span className="text-gray-700">{dispo}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Caractéristiques chaise haute */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-3">Caractéristiques de la chaise haute :</label>
                      <div className="space-y-3">
                        {['Rembourrée', 'Avec sangles ou harnais', 'Avec plateau'].map(carac => (
                          <label key={carac} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.chaise_haute_caracteristiques || []).includes(carac)}
                              onChange={(e) => handleArrayCheckboxChange('section_bebe.chaise_haute_caracteristiques', carac, e.target.checked)}
                              className="w-4 h-4 text-[#dbae61] border-gray-300 rounded focus:ring-[#dbae61]"
                            />
                            <span className="text-gray-700">{carac}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Prix chaise haute */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-3">Prix de la chaise haute :</label>
                      <div className="space-y-3">
                        {['Compris dans votre séjour', 'Disponible moyennant un supplément'].map(prix => (
                          <label key={prix} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="chaise_haute_prix"
                              value={prix}
                              checked={formData.chaise_haute_prix === prix}
                              onChange={(e) => handleRadioChange('section_bebe.chaise_haute_prix', e.target.value)}
                              className="w-4 h-4 text-[#dbae61] border-gray-300 focus:ring-[#dbae61]"
                            />
                            <span className="text-gray-700">{prix}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION CONDITIONNELLE : JOUETS */}
                {jouetsSelected && (
                  <div className="border-l-4 border-green-500 pl-6 bg-green-50 p-6 rounded-r-lg space-y-6">
                    <h3 className="text-lg font-semibold text-green-700">Jouets pour enfants</h3>
                    
                    <div>
                      <label className="block font-medium text-gray-900 mb-3">Tranches d'âge concernées :</label>
                      <div className="grid grid-cols-2 gap-4">
                        {['0 à 2 ans', '2 à 5 ans', '5 à 10 ans', 'Plus de 10 ans'].map(tranche => (
                          <label key={tranche} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.jouets_tranches_age || []).includes(tranche)}
                              onChange={(e) => handleArrayCheckboxChange('section_bebe.jouets_tranches_age', tranche, e.target.checked)}
                              className="w-4 h-4 text-[#dbae61] border-gray-300 rounded focus:ring-[#dbae61]"
                            />
                            <span className="text-gray-700">{tranche}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION CONDITIONNELLE : AUTRE */}
                {autreSelected && (
                  <div className="border-l-4 border-gray-500 pl-6 bg-gray-50 p-6 rounded-r-lg space-y-6">
                    <h3 className="text-lg font-semibold text-gray-700">Autre équipement</h3>
                    
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Veuillez préciser :</label>
                      <input
                        type="text"
                        placeholder="Décrivez l'équipement bébé supplémentaire"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        value={formData.equipements_autre_details || ''}
                        onChange={(e) => handleInputChange('section_bebe.equipements_autre_details', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* RAPPELS PHOTOS (visible si au moins un équipement cochéé) */}
                {equipementsCoches.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="photos_equipements_bebe_taken"
                        checked={formData.photos_rappels?.photos_equipements_bebe_taken || false}
                        onChange={(e) => handleInputChange('section_bebe.photos_rappels.photos_equipements_bebe_taken', e.target.checked)}
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <label htmlFor="photos_equipements_bebe_taken" className="text-sm text-yellow-800">
                        📸 Pensez à prendre des photos de tous les équipements bébé sélectionnés
                      </label>
                    </div>
                  </div>
                )}

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
