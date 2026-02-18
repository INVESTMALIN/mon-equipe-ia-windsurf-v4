// src/components/fiche/sections/FicheEquipements.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Settings } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'


// À ajouter dans FicheEquipements.jsx APRÈS les imports, AVANT export default function

// Cartes de schéma - définir quels champs nettoyer par branche
const BRANCH_SCHEMAS = {
  tv: [
    'tv_type', 'tv_taille', 'tv_type_autre_details',
    'tv_services', 'tv_consoles'
  ],
  climatisation: [
    'climatisation_type', 'climatisation_instructions'
  ],
  chauffage: [
    'chauffage_type', 'chauffage_instructions'
  ],
  lave_linge: [
    'lave_linge_prix', 'lave_linge_emplacement',
    'lave_linge_instructions'
  ],
  seche_linge: [
    'seche_linge_prix', 'seche_linge_emplacement',
    'seche_linge_instructions'
  ],
  parking_equipement: [
    // Pas de sous-champs car parking a sa propre section
  ],
  piano: [
    'piano_marque', 'piano_type'
  ],
  accessible_mobilite_reduite: [
    'pmr_details'
  ],
  animaux_acceptes: [
    'animaux_commentaire'
  ]
}

export default function FicheEquipements() {
  const {
    getField,
    updateField
  } = useForm()

  // Récupération des données de la section
  const formData = getField('section_equipements') || {}

  // Handler pour champs simples avec nettoyage des branches
  const handleInputChange = (field, value) => {
    // Détection si c'est une checkbox d'équipement principale qui passe à false
    const fieldKey = field.split('.').pop()

    if (BRANCH_SCHEMAS[fieldKey] && value === false) {
      // C'est une checkbox racine qui est décochée, nettoyer la branche
      const currentData = getField('section_equipements')
      const newData = { ...currentData }

      // Nettoyer tous les champs de la branche
      BRANCH_SCHEMAS[fieldKey].forEach(key => {
        if (Array.isArray(newData[key])) {
          newData[key] = []
        } else if (typeof newData[key] === 'object' && newData[key] !== null) {
          newData[key] = {}
        } else {
          newData[key] = null
        }
      })

      // Remettre explicitement le flag racine à false
      newData[fieldKey] = false

      // Une seule mise à jour atomique
      updateField('section_equipements', newData)
    } else {
      // Comportement normal pour les autres cas
      updateField(field, value)
    }
  }

  // Handler spécialisé pour le statut WiFi avec nettoyage
  const handleWifiStatutChange = (field, value) => {
    updateField(field, value)

    // Nettoyer les identifiants si on quitte "oui"
    if (value !== 'oui') {
      updateField('section_equipements.wifi_nom_reseau', '')
      updateField('section_equipements.wifi_mot_de_passe', '')
    }

    // Nettoyer les détails si on quitte "en_cours"
    if (value !== 'en_cours') {
      updateField('section_equipements.wifi_details', '')
    }
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
                    <h2 className="text-xl font-semibold text-gray-900">Matériel et commodités</h2>
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
                  {/* BLOC CONDITIONNEL TV */}
                  {formData.tv && (
                    <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-6">
                      <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                        📺 Configuration TV
                      </h3>

                      {/* Type de TV */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-3">Type de TV *</label>
                        <div className="space-y-2">
                          {['Écran plat', 'Téléviseur', 'Projecteur', 'Autre'].map(option => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded transition-colors">
                              <input
                                type="radio"
                                name="tv_type"
                                checked={formData.tv_type === option}
                                onChange={() => handleInputChange('section_equipements.tv_type', option)}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Champ conditionnel "Autre" */}
                      {formData.tv_type === 'Autre' && (
                        <div>
                          <label className="block font-medium text-gray-900 mb-2">Précisez le type *</label>
                          <input
                            type="text"
                            placeholder="Quel type de TV ?"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                            value={formData.tv_type_autre_details || ""}
                            onChange={(e) => handleInputChange('section_equipements.tv_type_autre_details', e.target.value)}
                          />
                        </div>
                      )}

                      {/* Taille TV */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Taille de la TV</label>
                        <input
                          type="text"
                          placeholder="Ex: 55 pouces, 140 cm..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.tv_taille || ""}
                          onChange={(e) => handleInputChange('section_equipements.tv_taille', e.target.value)}
                        />
                      </div>

                      {/* Services de streaming */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-3">Services de streaming disponibles</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['Netflix', 'Amazon Prime', 'Disney+', 'Canal+', 'OCS', 'Apple TV+', 'YouTube Premium'].map(service => (
                            <label key={service} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(formData.tv_services || []).includes(service)}
                                onChange={(e) => {
                                  const currentServices = formData.tv_services || []
                                  if (e.target.checked) {
                                    handleInputChange('section_equipements.tv_services', [...currentServices, service])
                                  } else {
                                    handleInputChange('section_equipements.tv_services', currentServices.filter(s => s !== service))
                                  }
                                }}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                              />
                              <span className="text-sm">{service}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Consoles de jeux */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-3">Consoles de jeux disponibles</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series', 'Nintendo Switch', 'Autre'].map(console => (
                            <label key={console} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(formData.tv_consoles || []).includes(console)}
                                onChange={(e) => {
                                  const currentConsoles = formData.tv_consoles || []
                                  if (e.target.checked) {
                                    handleInputChange('section_equipements.tv_consoles', [...currentConsoles, console])
                                  } else {
                                    handleInputChange('section_equipements.tv_consoles', currentConsoles.filter(c => c !== console))
                                  }
                                }}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                              />
                              <span className="text-sm">{console}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Rappel vidéo TV (VERSION LITE) */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="tv_video_taken"
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                            checked={getField('section_equipements.photos_rappels.tv_video_taken') || false}
                            onChange={(e) => handleInputChange('section_equipements.photos_rappels.tv_video_taken', e.target.checked)}
                          />
                          <label htmlFor="tv_video_taken" className="text-sm text-yellow-800">
                            📹 Pensez à faire une vidéo expliquant le fonctionnement de la TV
                          </label>
                        </div>
                      </div>

                      {/* Rappel vidéo consoles (si consoles cochées) */}
                      {(formData.tv_consoles || []).length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="tv_consoles_video_taken"
                              className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                              checked={getField('section_equipements.photos_rappels.tv_consoles_video_taken') || false}
                              onChange={(e) => handleInputChange('section_equipements.photos_rappels.tv_consoles_video_taken', e.target.checked)}
                            />
                            <label htmlFor="tv_consoles_video_taken" className="text-sm text-yellow-800">
                              📹 Pensez à faire une vidéo expliquant le fonctionnement des consoles
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* BLOC CONDITIONNEL CLIMATISATION */}
                  {formData.climatisation && (
                    <div className="mt-8 p-6 bg-cyan-50 border-2 border-cyan-200 rounded-xl space-y-6">
                      <h3 className="text-lg font-semibold text-cyan-900 flex items-center gap-2">
                        ❄️ Configuration Climatisation
                      </h3>

                      {/* Type de climatisation */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-3">Type de climatisation *</label>
                        <div className="space-y-2">
                          {['Centralisée', 'Individuelle par pièce', 'Portable'].map(option => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded transition-colors">
                              <input
                                type="radio"
                                name="climatisation_type"
                                checked={formData.climatisation_type === option}
                                onChange={() => handleInputChange('section_equipements.climatisation_type', option)}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Instructions utilisation */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Instructions d'utilisation</label>
                        <textarea
                          placeholder="Expliquez comment utiliser la climatisation..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                          rows={4}
                          value={formData.climatisation_instructions || ""}
                          onChange={(e) => handleInputChange('section_equipements.climatisation_instructions', e.target.value)}
                        />
                      </div>

                      {/* Rappel vidéo */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="climatisation_video_taken"
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                            checked={getField('section_equipements.photos_rappels.climatisation_video_taken') || false}
                            onChange={(e) => handleInputChange('section_equipements.photos_rappels.climatisation_video_taken', e.target.checked)}
                          />
                          <label htmlFor="climatisation_video_taken" className="text-sm text-yellow-800">
                            📹 Pensez à faire une vidéo expliquant le fonctionnement de la climatisation
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BLOC CONDITIONNEL CHAUFFAGE */}
                  {formData.chauffage && (
                    <div className="mt-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-xl space-y-6">
                      <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                        🔥 Configuration Chauffage
                      </h3>

                      {/* Type de chauffage */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-3">Type de chauffage *</label>
                        <div className="space-y-2">
                          {['Central', 'Électrique', 'Gaz', 'Poêle', 'Cheminée'].map(option => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded transition-colors">
                              <input
                                type="radio"
                                name="chauffage_type"
                                checked={formData.chauffage_type === option}
                                onChange={() => handleInputChange('section_equipements.chauffage_type', option)}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Instructions utilisation */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Instructions d'utilisation</label>
                        <textarea
                          placeholder="Expliquez comment utiliser le chauffage..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                          rows={4}
                          value={formData.chauffage_instructions || ""}
                          onChange={(e) => handleInputChange('section_equipements.chauffage_instructions', e.target.value)}
                        />
                      </div>

                      {/* Rappel vidéo */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="chauffage_video_taken"
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                            checked={getField('section_equipements.photos_rappels.chauffage_video_taken') || false}
                            onChange={(e) => handleInputChange('section_equipements.photos_rappels.chauffage_video_taken', e.target.checked)}
                          />
                          <label htmlFor="chauffage_video_taken" className="text-sm text-yellow-800">
                            📹 Pensez à faire une vidéo expliquant le fonctionnement du chauffage
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BLOC CONDITIONNEL LAVE-LINGE */}
                  {formData.lave_linge && (
                    <div className="mt-8 p-6 bg-purple-50 border-2 border-purple-200 rounded-xl space-y-6">
                      <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                        🧺 Configuration Lave-linge
                      </h3>

                      {/* Prix */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-3">Prix *</label>
                        <div className="flex gap-6">
                          {['Compris', 'Supplément'].map(option => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name="lave_linge_prix"
                                checked={formData.lave_linge_prix === option}
                                onChange={() => handleInputChange('section_equipements.lave_linge_prix', option)}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Emplacement */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Emplacement du lave-linge</label>
                        <input
                          type="text"
                          placeholder="Ex: Dans la salle de bain, buanderie..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.lave_linge_emplacement || ""}
                          onChange={(e) => handleInputChange('section_equipements.lave_linge_emplacement', e.target.value)}
                        />
                      </div>

                      {/* Instructions */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Instructions d'utilisation</label>
                        <textarea
                          placeholder="Expliquez comment utiliser le lave-linge..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                          rows={4}
                          value={formData.lave_linge_instructions || ""}
                          onChange={(e) => handleInputChange('section_equipements.lave_linge_instructions', e.target.value)}
                        />
                      </div>

                      {/* Rappel vidéo */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="lave_linge_video_taken"
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                            checked={getField('section_equipements.photos_rappels.lave_linge_video_taken') || false}
                            onChange={(e) => handleInputChange('section_equipements.photos_rappels.lave_linge_video_taken', e.target.checked)}
                          />
                          <label htmlFor="lave_linge_video_taken" className="text-sm text-yellow-800">
                            📹 Pensez à faire une vidéo expliquant le fonctionnement du lave-linge
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BLOC CONDITIONNEL SÈCHE-LINGE */}
                  {formData.seche_linge && (
                    <div className="mt-8 p-6 bg-pink-50 border-2 border-pink-200 rounded-xl space-y-6">
                      <h3 className="text-lg font-semibold text-pink-900 flex items-center gap-2">
                        🌬️ Configuration Sèche-linge
                      </h3>

                      {/* Prix */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-3">Prix *</label>
                        <div className="flex gap-6">
                          {['Compris', 'Supplément'].map(option => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name="seche_linge_prix"
                                checked={formData.seche_linge_prix === option}
                                onChange={() => handleInputChange('section_equipements.seche_linge_prix', option)}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Emplacement */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Emplacement du sèche-linge</label>
                        <input
                          type="text"
                          placeholder="Ex: Dans la salle de bain, buanderie..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.seche_linge_emplacement || ""}
                          onChange={(e) => handleInputChange('section_equipements.seche_linge_emplacement', e.target.value)}
                        />
                      </div>

                      {/* Instructions */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Instructions d'utilisation</label>
                        <textarea
                          placeholder="Expliquez comment utiliser le sèche-linge..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                          rows={4}
                          value={formData.seche_linge_instructions || ""}
                          onChange={(e) => handleInputChange('section_equipements.seche_linge_instructions', e.target.value)}
                        />
                      </div>

                      {/* Rappel vidéo */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="seche_linge_video_taken"
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                            checked={getField('section_equipements.photos_rappels.seche_linge_video_taken') || false}
                            onChange={(e) => handleInputChange('section_equipements.photos_rappels.seche_linge_video_taken', e.target.checked)}
                          />
                          <label htmlFor="seche_linge_video_taken" className="text-sm text-yellow-800">
                            📹 Pensez à faire une vidéo expliquant le fonctionnement du sèche-linge
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BLOC CONDITIONNEL PIANO */}
                  {formData.piano && (
                    <div className="mt-8 p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl space-y-6">
                      <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                        🎹 Configuration Piano
                      </h3>

                      {/* Marque */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Marque du piano</label>
                        <input
                          type="text"
                          placeholder="Ex: Yamaha, Steinway..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.piano_marque || ""}
                          onChange={(e) => handleInputChange('section_equipements.piano_marque', e.target.value)}
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-3">Type de piano *</label>
                        <div className="space-y-2">
                          {['À queue', 'Droit', 'Numérique'].map(option => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded transition-colors">
                              <input
                                type="radio"
                                name="piano_type"
                                checked={formData.piano_type === option}
                                onChange={() => handleInputChange('section_equipements.piano_type', option)}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BLOC CONDITIONNEL PMR */}
                  {formData.accessible_mobilite_reduite && (
                    <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl space-y-6">
                      <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                        ♿ Détails accessibilité PMR
                      </h3>

                      {/* Détails accessibilité */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Détails sur l'accessibilité *</label>
                        <textarea
                          placeholder="Décrivez les aménagements pour personnes à mobilité réduite : rampe d'accès, largeur des portes, salle de bain adaptée, ascenseur, etc."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                          rows={5}
                          value={formData.pmr_details || ""}
                          onChange={(e) => handleInputChange('section_equipements.pmr_details', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* BLOC CONDITIONNEL ANIMAUX */}
                  {formData.animaux_acceptes && (
                    <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl space-y-6">
                      <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                        🐾 Conditions pour les animaux
                      </h3>

                      {/* Commentaire conditions */}
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Conditions et restrictions *</label>
                        <textarea
                          placeholder="Précisez les conditions d'accueil des animaux : taille, nombre, supplément éventuel, zones interdites, règles particulières..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                          rows={4}
                          value={formData.animaux_commentaire || ""}
                          onChange={(e) => handleInputChange('section_equipements.animaux_commentaire', e.target.value)}
                        />
                      </div>
                    </div>
                  )}



                  {/* SECTION Configuration Wi-Fi */}
                  <div className="mt-8 mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
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
                    {/* Champs conditionnels pour "Oui" - WiFi disponible */}
                    {formData.wifi_statut === 'oui' && (
                      <div className="mt-6 space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <label className="block font-medium text-gray-900 mb-2">
                            Nom du réseau WiFi (SSID) *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: MonWiFi, Livebox-A1B2..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                            value={formData.wifi_nom_reseau || ""}
                            onChange={(e) => handleInputChange('section_equipements.wifi_nom_reseau', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-gray-900 mb-2">
                            Mot de passe WiFi *
                          </label>
                          <input
                            type="text"
                            placeholder="Mot de passe du réseau WiFi"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                            value={formData.wifi_mot_de_passe || ""}
                            onChange={(e) => handleInputChange('section_equipements.wifi_mot_de_passe', e.target.value)}
                          />
                        </div>

                        {/* Rappel photo routeur */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="wifi_routeur_photo_taken"
                              className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                              checked={getField('section_equipements.photos_rappels.wifi_routeur_photo_taken') || false}
                              onChange={(e) => handleInputChange('section_equipements.photos_rappels.wifi_routeur_photo_taken', e.target.checked)}
                            />
                            <label htmlFor="wifi_routeur_photo_taken" className="text-sm text-yellow-800">
                              📸 Pensez à prendre une photo du routeur ou des instructions WiFi
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* SECTION Équipement ménage */}
                  <div className="mt-8 mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-lg font-semibold mb-6 text-green-800">🧹 Équipement ménage</h4>

                    <div className="space-y-8">

                      {/* Aspirateur */}
                      <div className="p-4 bg-white rounded-lg border border-green-100">
                        <h5 className="font-semibold text-gray-900 mb-3">Aspirateur</h5>
                        <div className="mb-3">
                          <label className="block font-medium text-gray-700 mb-2">Types d'aspirateur</label>
                          <div className="space-y-2">
                            {['Avec fil', 'Sans fil', 'Aspirateur balais', 'Aspirateur classique', 'Aspirateur de chantier'].map(option => (
                              <label key={option} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                <input
                                  type="radio"
                                  name="menage_aspirateur_type"
                                  checked={formData.menage_aspirateur_type === option}
                                  onChange={() => handleInputChange('section_equipements.menage_aspirateur_type', option)}
                                  className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="menage_aspirateur_video_taken"
                              className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                              checked={getField('section_equipements.photos_rappels.menage_aspirateur_video_taken') || false}
                              onChange={(e) => handleInputChange('section_equipements.photos_rappels.menage_aspirateur_video_taken', e.target.checked)}
                            />
                            <label htmlFor="menage_aspirateur_video_taken" className="text-sm text-yellow-800">
                              📹 Pensez à faire une vidéo expliquant le fonctionnement de l'aspirateur
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Serpillère et Seau */}
                      <div className="p-4 bg-white rounded-lg border border-green-100">
                        <h5 className="font-semibold text-gray-900 mb-3">Serpillère et Seau</h5>
                        <div className="mb-3">
                          <label className="block font-medium text-gray-700 mb-2">Types de serpillère</label>
                          <div className="space-y-2">
                            {['Serpillère espagnole (frange)', 'Serpillère torchon', 'Serpillière MOP plate (microfibres)'].map(option => (
                              <label key={option} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                <input
                                  type="radio"
                                  name="menage_serpillere_type"
                                  checked={formData.menage_serpillere_type === option}
                                  onChange={() => handleInputChange('section_equipements.menage_serpillere_type', option)}
                                  className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61]"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="menage_serpillere_video_taken"
                              className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                              checked={getField('section_equipements.photos_rappels.menage_serpillere_video_taken') || false}
                              onChange={(e) => handleInputChange('section_equipements.photos_rappels.menage_serpillere_video_taken', e.target.checked)}
                            />
                            <label htmlFor="menage_serpillere_video_taken" className="text-sm text-yellow-800">
                              📹 Pensez à faire une vidéo expliquant le fonctionnement de la serpillère et du seau
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Balais */}
                      <div className="p-4 bg-white rounded-lg border border-green-100">
                        <h5 className="font-semibold text-gray-900 mb-3">Balais</h5>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="menage_balais_video_taken"
                              className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                              checked={getField('section_equipements.photos_rappels.menage_balais_video_taken') || false}
                              onChange={(e) => handleInputChange('section_equipements.photos_rappels.menage_balais_video_taken', e.target.checked)}
                            />
                            <label htmlFor="menage_balais_video_taken" className="text-sm text-yellow-800">
                              📹 Pensez à faire une vidéo expliquant l'emplacement du balais
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Balayette */}
                      <div className="p-4 bg-white rounded-lg border border-green-100">
                        <h5 className="font-semibold text-gray-900 mb-3">Balayette</h5>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="menage_balayette_video_taken"
                              className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                              checked={getField('section_equipements.photos_rappels.menage_balayette_video_taken') || false}
                              onChange={(e) => handleInputChange('section_equipements.photos_rappels.menage_balayette_video_taken', e.target.checked)}
                            />
                            <label htmlFor="menage_balayette_video_taken" className="text-sm text-yellow-800">
                              📹 Pensez à faire une vidéo expliquant l'emplacement de la balayette
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Autres éléments de nettoyage */}
                      <div className="p-4 bg-white rounded-lg border border-green-100">
                        <h5 className="font-semibold text-gray-900 mb-3">Autres éléments de nettoyage</h5>
                        <div className="mb-3">
                          <label className="block font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            placeholder="Décrivez les autres équipements de nettoyage disponibles (éponges, produits ménagers, chiffons, etc.)..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                            rows={3}
                            value={formData.menage_autres_description || ""}
                            onChange={(e) => handleInputChange('section_equipements.menage_autres_description', e.target.value)}
                          />
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="menage_autres_video_taken"
                              className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                              checked={getField('section_equipements.photos_rappels.menage_autres_video_taken') || false}
                              onChange={(e) => handleInputChange('section_equipements.photos_rappels.menage_autres_video_taken', e.target.checked)}
                            />
                            <label htmlFor="menage_autres_video_taken" className="text-sm text-yellow-800">
                              📹 Pensez à faire une vidéo présentant les autres éléments de nettoyage
                            </label>
                          </div>
                        </div>
                      </div>

                    </div>
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