// src/components/fiche/sections/FicheEquipements.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Settings } from 'lucide-react'

export default function FicheEquipements() {
  const { 
    getField,
    updateField
  } = useForm()

  // Récupération des données de la section
  const formData = getField('section_equipements') || {}

  // Handler pour champs simples
  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  // Handler pour checkboxes multiples (parking sur place types)
  const handleCheckboxArrayChange = (field, value, checked) => {
    const currentArray = formData[field.split('.').pop()] || []
    if (checked) {
      const newArray = [...currentArray, value]
      updateField(field, newArray)
    } else {
      const newArray = currentArray.filter(item => item !== value)
      updateField(field, newArray)
    }
  }

  // Handler spécialisé pour le type de parking avec nettoyage des sous-options
  const handleParkingTypeChange = (field, value) => {
    updateField(field, value)
    
    // Nettoyer les champs des autres types non sélectionnés    
    if (value !== 'rue') {
      updateField('section_equipements.parking_rue_details', '')
    }
    if (value !== 'sur_place') {
      updateField('section_equipements.parking_sur_place_types', [])
      updateField('section_equipements.parking_sur_place_details', '')
    }
    if (value !== 'payant') {
      updateField('section_equipements.parking_payant_type', '')
      updateField('section_equipements.parking_payant_details', '')
    }
  }

  // Liste des équipements pour la checklist
  const equipements = [
    // Colonne 1
    { key: 'climatisation', label: 'Climatisation' },
    { key: 'lave_linge', label: 'Lave-linge' },
    { key: 'seche_linge', label: 'Sèche-linge' },
    { key: 'parking_equipement', label: 'Parking' },
    { key: 'tourne_disque', label: 'Tourne disque' },
    { key: 'coffre_fort', label: 'Coffre fort' },
    { key: 'ascenseur', label: 'Ascenseur' },
    { key: 'animaux_acceptes', label: 'Animaux acceptés' },
    { key: 'fetes_autorisees', label: 'Fêtes autorisées' },
    
    // Colonne 2
    { key: 'tv', label: 'TV' },
    { key: 'chauffage', label: 'Chauffage' },
    { key: 'fer_repasser', label: 'Fer à repasser' },
    { key: 'etendoir', label: 'Etendoir' },
    { key: 'piano', label: 'Piano' },
    { key: 'cinema', label: 'Cinéma' },
    { key: 'compacteur_dechets', label: 'Compacteur de déchets' },
    { key: 'accessible_mobilite_reduite', label: 'Accessible aux personnes à mobilité réduite' },
    { key: 'fumeurs_acceptes', label: 'Fumeurs acceptés' }
  ]

  // Types de parking pour GRATUIT SUR PLACE (4 options, checkboxes multiples)
  const typesParkingGratuitOptions = [
    'Parking sous-terrain',
    'Abri voiture', 
    'Stationnement dans une allée privée',
    'Garage individuel'
  ]

  // Types de parking pour PAYANT (3 options, radio unique)
  const typesParkingPayantOptions = [
    'Parking sous-terrain',
    'Abri voiture', 
    'Stationnement dans une allée privée'
  ]

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Équipements</h1>
            
            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Équipements et commodités</h2>
                    <p className="text-gray-600">Répertoriez tous les équipements disponibles dans le logement</p>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="space-y-8">
                
                {/* SECTION 1: Équipements techniques essentiels */}
                <div>
                  <h3 className="text-lg font-semibold mb-6 text-gray-900">Équipements techniques essentiels</h3>
                  
                  {/* Rappel vidéo accès local poubelle (VERSION LITE) */}
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="video_acces_poubelle_taken"
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        checked={getField('section_equipements.photos_rappels.video_acces_poubelle_taken') || false}
                        onChange={(e) => handleInputChange('section_equipements.photos_rappels.video_acces_poubelle_taken', e.target.checked)}
                      />
                      <label htmlFor="video_acces_poubelle_taken" className="text-sm text-yellow-800">
                        📹 Pensez à faire une vidéo de l'accès au local poubelle
                      </label>
                    </div>
                  </div>

                  {/* Local Poubelle - Emplacement */}
                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-2">
                      Emplacement du local poubelle *
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                      placeholder="Décrivez l'emplacement du local poubelle"
                      value={formData.poubelle_emplacement || ""}
                      onChange={(e) => handleInputChange('section_equipements.poubelle_emplacement', e.target.value)}
                    />
                  </div>

                  {/* Local Poubelle - Ramassage */}
                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-2">
                      Programmation du ramassage des déchets *
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                      placeholder="Décrivez le fonctionnement du ramassage des déchets, les jours de ramassage, etc."
                      value={formData.poubelle_ramassage || ""}
                      onChange={(e) => handleInputChange('section_equipements.poubelle_ramassage', e.target.value)}
                    />
                  </div>

                  {/* Rappel photos local poubelle (VERSION LITE) */}
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="poubelle_taken"
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        checked={getField('section_equipements.photos_rappels.poubelle_taken') || false}
                        onChange={(e) => handleInputChange('section_equipements.photos_rappels.poubelle_taken', e.target.checked)}
                      />
                      <label htmlFor="poubelle_taken" className="text-sm text-yellow-800">
                        📸 Pensez à prendre des photos du local poubelle
                      </label>
                    </div>
                  </div>

                  {/* Disjoncteur - Emplacement */}
                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-2">
                      Emplacement du disjoncteur *
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                      placeholder="Décrivez l'emplacement du disjoncteur principal"
                      value={formData.disjoncteur_emplacement || ""}
                      onChange={(e) => handleInputChange('section_equipements.disjoncteur_emplacement', e.target.value)}
                    />
                  </div>

                  {/* Rappel photos disjoncteur (VERSION LITE) */}
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="disjoncteur_taken"
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        checked={getField('section_equipements.photos_rappels.disjoncteur_taken') || false}
                        onChange={(e) => handleInputChange('section_equipements.photos_rappels.disjoncteur_taken', e.target.checked)}
                      />
                      <label htmlFor="disjoncteur_taken" className="text-sm text-yellow-800">
                        📸 Pensez à prendre des photos du disjoncteur
                      </label>
                    </div>
                  </div>

                  {/* Vanne d'arrêt d'eau - Emplacement */}
                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-2">
                      Emplacement de la vanne d'arrêt d'eau *
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                      placeholder="Décrivez où se trouve la vanne d'arrêt d'eau principale"
                      value={formData.vanne_eau_emplacement || ""}
                      onChange={(e) => handleInputChange('section_equipements.vanne_eau_emplacement', e.target.value)}
                    />
                  </div>

                  {/* Rappel photos vanne d'eau (VERSION LITE) */}
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="vanne_arret_taken"
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        checked={getField('section_equipements.photos_rappels.vanne_arret_taken') || false}
                        onChange={(e) => handleInputChange('section_equipements.photos_rappels.vanne_arret_taken', e.target.checked)}
                      />
                      <label htmlFor="vanne_arret_taken" className="text-sm text-yellow-800">
                        📸 Pensez à prendre des photos de la vanne d'arrêt d'eau
                      </label>
                    </div>
                  </div>

                  {/* Système de chauffage d'eau */}
                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-3">
                      Système de chauffage d'eau *
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="systeme_chauffage_eau"
                          checked={formData.systeme_chauffage_eau === 'Chaudière'}
                          onChange={() => handleInputChange('section_equipements.systeme_chauffage_eau', 'Chaudière')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span>Chaudière</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="systeme_chauffage_eau"
                          checked={formData.systeme_chauffage_eau === 'Ballon d\'eau chaude'}
                          onChange={() => handleInputChange('section_equipements.systeme_chauffage_eau', 'Ballon d\'eau chaude')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span>Ballon d'eau chaude</span>
                      </label>
                    </div>
                  </div>

                  {/* Emplacement système chauffage */}
                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-2">
                      Emplacement du système de chauffage d'eau *
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                      placeholder="Décrivez où se trouve la chaudière ou le ballon d'eau chaude"
                      value={formData.chauffage_eau_emplacement || ""}
                      onChange={(e) => handleInputChange('section_equipements.chauffage_eau_emplacement', e.target.value)}
                    />
                  </div>

                  {/* Rappels photos et vidéo système chauffage (VERSION LITE) */}
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="chauffage_eau_taken"
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          checked={getField('section_equipements.photos_rappels.chauffage_eau_taken') || false}
                          onChange={(e) => handleInputChange('section_equipements.photos_rappels.chauffage_eau_taken', e.target.checked)}
                        />
                        <label htmlFor="chauffage_eau_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre des photos du système de chauffage d'eau
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="video_systeme_chauffage_taken"
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          checked={getField('section_equipements.photos_rappels.video_systeme_chauffage_taken') || false}
                          onChange={(e) => handleInputChange('section_equipements.photos_rappels.video_systeme_chauffage_taken', e.target.checked)}
                        />
                        <label htmlFor="video_systeme_chauffage_taken" className="text-sm text-yellow-800">
                          📹 Pensez à faire une vidéo du système de chauffage
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Équipements et commodités */}
                <div>
                  <h3 className="text-lg font-semibold mb-6 text-gray-900">Équipements et commodités</h3>
                  
                  {/* Checklist équipements en 2 colonnes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {equipements.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input 
                          type="checkbox"
                          checked={formData[key] === true}
                          onChange={(e) => handleInputChange(`section_equipements.${key}`, e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>

                  {/* SECTION Configuration Wi-Fi */}
                  <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4 text-blue-800">📶 Configuration Wi-Fi</h4>
                    
                    <div className="mb-4">
                      <label className="block font-medium text-gray-900 mb-3">Statut du WiFi</label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio"
                            name="wifi_statut"
                            value="oui"
                            checked={formData.wifi_statut === 'oui'}
                            onChange={(e) => handleInputChange('section_equipements.wifi_statut', e.target.value)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                          />
                          <span>Oui (WiFi disponible et fonctionnel)</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio"
                            name="wifi_statut"
                            value="en_cours"
                            checked={formData.wifi_statut === 'en_cours'}
                            onChange={(e) => handleInputChange('section_equipements.wifi_statut', e.target.value)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                          />
                          <span>En cours d'installation</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio"
                            name="wifi_statut"
                            value="non"
                            checked={formData.wifi_statut === 'non'}
                            onChange={(e) => handleInputChange('section_equipements.wifi_statut', e.target.value)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                          />
                          <span className="text-red-600 font-medium">Non (pas de WiFi disponible) ❌</span>
                        </label>
                      </div>
                    </div>

                    {/* Champ conditionnel pour "En cours" */}
                    {formData.wifi_statut === 'en_cours' && (
                      <div className="mt-4">
                        <label className="block font-medium text-gray-900 mb-2">Détails sur l'installation</label>
                        <textarea 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                          placeholder="Décrivez la date d'installation du Wi-Fi, comment et par qui..."
                          value={formData.wifi_details || ""}
                          onChange={(e) => handleInputChange('section_equipements.wifi_details', e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Parking principal */}
                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-3">Parking *</label>
                    <div className="space-y-2 max-w-lg">
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors">
                        <input 
                          type="radio" 
                          name="parking_type"
                          checked={formData.parking_type === 'rue'}
                          onChange={() => handleParkingTypeChange('section_equipements.parking_type', 'rue')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                        />
                        <span className="text-sm">Parking gratuit dans la rue</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors">
                        <input 
                          type="radio" 
                          name="parking_type"
                          checked={formData.parking_type === 'sur_place'}
                          onChange={() => handleParkingTypeChange('section_equipements.parking_type', 'sur_place')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                        />
                        <span className="text-sm">Parking gratuit sur place</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors">
                        <input 
                          type="radio" 
                          name="parking_type"
                          checked={formData.parking_type === 'payant'}
                          onChange={() => handleParkingTypeChange('section_equipements.parking_type', 'payant')}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                        />
                        <span className="text-sm">Stationnement payant à l'extérieur de la propriété</span>
                      </label>
                    </div>
                  </div>

                  {/* Champs conditionnels parking */}
                  {formData.parking_type === 'rue' && (
                    <div className="mb-6">
                      <label className="block font-medium text-gray-900 mb-2">
                        Parking gratuit dans la rue - Détails *
                      </label>
                      <textarea 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-32"
                        placeholder="Fournissez des informations détaillées sur le parking gratuit :
• Emplacement des places de stationnement (noms des rues spécifiques)
• Disponibilité habituelle des places (facile/difficile à trouver)
• Restrictions éventuelles (horaires, durée maximale, jours spécifiques)
• Règles de stationnement particulières (ex: alternance côté pair/impair)
• Distance approximative du logement
• Conseils pour trouver une place
• Sécurité du quartier pour le stationnement
• Toute autre information utile pour les voyageurs"
                        value={formData.parking_rue_details || ""}
                        onChange={(e) => handleInputChange('section_equipements.parking_rue_details', e.target.value)}
                      />
                    </div>
                  )}

                  {formData.parking_type === 'sur_place' && (
                    <>
                      <div className="mb-6">
                        <label className="block font-medium text-gray-900 mb-3">Parking - Type * (plusieurs choix possibles)</label>
                        <div className="space-y-2">
                          {typesParkingGratuitOptions.map(option => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={(formData.parking_sur_place_types || []).includes(option)}
                                onChange={(e) => handleCheckboxArrayChange('section_equipements.parking_sur_place_types', option, e.target.checked)}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="block font-medium text-gray-900 mb-2">
                          Parking gratuit sur place - Détails *
                        </label>
                        <textarea 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-32"
                          placeholder="Fournissez des informations détaillées sur le parking gratuit..."
                          value={formData.parking_sur_place_details || ""}
                          onChange={(e) => handleInputChange('section_equipements.parking_sur_place_details', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {formData.parking_type === 'payant' && (
                    <>
                      <div className="mb-6">
                        <label className="block font-medium text-gray-900 mb-3">Parking - Stationnement payant - Type *</label>
                        <div className="space-y-2">
                          {typesParkingPayantOptions.map(option => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio"
                                name="parking_payant_type"
                                checked={formData.parking_payant_type === option}
                                onChange={() => handleInputChange('section_equipements.parking_payant_type', option)}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="block font-medium text-gray-900 mb-2">
                          Parking - Stationnement payant - Détails *
                        </label>
                        <textarea 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-32"
                          placeholder="Fournissez des informations détaillées sur le parking payant..."
                          value={formData.parking_payant_details || ""}
                          onChange={(e) => handleInputChange('section_equipements.parking_payant_details', e.target.value)}
                        />
                      </div>
                    </>
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