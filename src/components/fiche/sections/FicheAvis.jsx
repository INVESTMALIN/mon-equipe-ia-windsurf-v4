import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { MessageSquare } from 'lucide-react'

const StyledCheckboxGrid = ({ options, values, path, onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {options.map(({ key, label }) => (
      <label
        key={key}
        className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-[#dbae61] hover:bg-[#dbae61]/5"
      >
        <input
          type="checkbox"
          checked={values[key] || false}
          onChange={(e) => onChange(`${path}.${key}`, e.target.checked)}
          className="h-4 w-4 shrink-0 text-[#dbae61] focus:ring-[#dbae61]"
        />
        <span className="text-sm text-gray-900 group-hover:text-[#dbae61] transition-colors">{label}</span>
      </label>
    ))}
  </div>
)

export default function FicheAvis() {
  const { 
    getField,
    updateField
  } = useForm()

  const formData = getField('section_avis')
  const atouts = formData.atouts_logement || {}
  const voyageurs = formData.types_voyageurs || {}

  const handleInputChange = (fieldPath, value) => {
    updateField(fieldPath, value)
  }

  const optionsAtouts = [
    { key: 'lumineux', label: 'Lumineux' },
    { key: 'rustique', label: 'Rustique' },
    { key: 'central', label: 'Central' },
    { key: 'convivial', label: 'Convivial' },
    { key: 'authentique', label: 'Authentique' },
    { key: 'douillet', label: 'Douillet' },
    { key: 'design_moderne', label: 'Design moderne' },
    { key: 'terrasse_balcon', label: 'Terrasse / Balcon' },
    { key: 'proche_transports', label: 'Proche des transports en commun' },
    { key: 'piscine', label: 'Piscine' },
    { key: 'jacuzzi', label: 'Jacuzzi' },
    { key: 'cheminee', label: 'Cheminée' },
    { key: 'charmant', label: 'Charmant' },
    { key: 'elegant', label: 'Élégant' },
    { key: 'atypique', label: 'Atypique' },
    { key: 'renove', label: 'Rénové' },
    { key: 'familial', label: 'Familial' },
    { key: 'cosy_confortable', label: 'Cosy / Confortable' },
    { key: 'decoration_traditionnelle', label: 'Décoration traditionnelle' },
    { key: 'jardin', label: 'Jardin' },
    { key: 'proche_commerces', label: 'Proche des commerces' },
    { key: 'sauna_spa', label: 'Sauna / Spa' },
    { key: 'video_projecteur', label: 'Vidéo Projecteur' },
    { key: 'station_recharge_electrique', label: 'Station de recharge pour véhicules électriques' },
    { key: 'romantique', label: 'Romantique' },
    { key: 'paisible', label: 'Paisible' },
    { key: 'chic', label: 'Chic' },
    { key: 'accueillant', label: 'Accueillant' },
    { key: 'tranquille', label: 'Tranquille' },
    { key: 'spacieux', label: 'Spacieux' },
    { key: 'vue_panoramique', label: 'Vue panoramique' },
    { key: 'parking_prive', label: 'Parking privé' },
    { key: 'equipements_haut_gamme', label: 'Équipements haut de gamme' },
    { key: 'billard', label: 'Billard' },
    { key: 'jeux_arcade', label: "Jeux d'arcade" },
    { key: 'table_ping_pong', label: 'Table de ping pong' },
    { key: 'autres_atouts', label: 'Autre (veuillez préciser)' },
  ]

  const optionsVoyageurs = [
    { key: 'duo_amoureux', label: "Duo d'amoureux" },
    { key: 'nomades_numeriques', label: 'Nomades numériques' },
    { key: 'aventuriers_independants', label: 'Aventuriers indépendants' },
    { key: 'tribus_familiales', label: 'Tribus familiales' },
    { key: 'bandes_amis', label: 'Bandes d\'amis' },
    { key: 'voyageurs_experience', label: "Voyageurs d'expérience" },
    { key: 'autres_voyageurs', label: 'Autre (préciser)' },
  ]

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Avis sur le logement</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Votre avis compte !</h2>
                    <p className="text-gray-600">Partagez votre perception unique du logement</p>
                  </div>
                </div>
              </div>

              {/* Message d'information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-blue-900 leading-relaxed">
                  Votre avis compte énormément ! En tant que concierge, votre perception du logement sur place est unique et précieuse.
                  Vos observations peuvent révéler des atouts cachés ou des particularités que seul quelqu'un ayant visité le lieu peut remarquer.
                  Ces détails peuvent faire toute la différence dans l'annonce, alors n'hésitez pas à partager vos impressions !
                </p>
              </div>

              {/* Évaluation de l'environnement */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Évaluation de l'environnement et du logement</h3>
                
                {/* Vidéo globale - Rappel simple */}
                <div className="mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="video_globale_taken"
                        checked={formData.photos_rappels?.video_globale_taken || false}
                        onChange={(e) => handleInputChange('section_avis.photos_rappels.video_globale_taken', e.target.checked)}
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <label htmlFor="video_globale_taken" className="text-sm text-yellow-800">
                        📹 Pensez à prendre les vidéos globales du quartier, immeuble et logement
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Évaluation du quartier */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Évaluation du quartier</h3>
                
                {/* Type de quartier */}
                <div className="mb-6">
                  <label className="block font-medium text-gray-900 mb-3">Type de quartier</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { key: 'quartier_neuf', label: 'Quartier neuf (récemment développé, moderne)' },
                      { key: 'quartier_ancien', label: 'Quartier ancien (historique, caractère authentique)' },
                      { key: 'quartier_populaire', label: 'Quartier populaire (vivant, mais parfois moins soigné)' },
                      { key: 'quartier_residentiel', label: 'Quartier résidentiel (principalement des logements)' },
                      { key: 'quartier_excentre', label: 'Quartier excentré (loin des points d\'intérêt principaux)' },
                      { key: 'quartier_central', label: 'Quartier central (proche du centre-ville, bien desservi)' },
                      { key: 'quartier_chic', label: 'Quartier chic (haut de gamme, commerçants et services de luxe)' },
                      { key: 'quartier_intermediaire', label: 'Quartier intermédiaire (familial, moyen de gamme)' },
                      { key: 'quartier_defavorise', label: 'Quartier défavorisé (secteur avec des conditions de vie moins favorables) ⚠️' }
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-[#dbae61] hover:bg-[#dbae61]/5"
                      >
                        <input
                          type="checkbox"
                          checked={formData.quartier_types?.includes(key) || false}
                          onChange={(e) => {
                            const currentTypes = formData.quartier_types || []
                            const newTypes = e.target.checked 
                              ? [...currentTypes, key]
                              : currentTypes.filter(type => type !== key)
                            handleInputChange('section_avis.quartier_types', newTypes)
                          }}
                          className="h-4 w-4 shrink-0 text-[#dbae61] focus:ring-[#dbae61]"
                        />
                        <span className="text-sm text-gray-900 group-hover:text-[#dbae61] transition-colors">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Sécurité du quartier */}
                <div className="mb-6">
                  <label className="block font-medium text-gray-900 mb-3">Sécurité du quartier</label>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'securise', label: 'Sécurisé (quartier calme)' },
                      { value: 'modere', label: 'Quartier modéré (risques modérés de délinquance)' },
                      { value: 'zone_risques', label: 'Zone à risques (Pas de sentiment de sécurité, quartiers difficiles à sécuriser. Risque de vol, d\'intrusion, délinquance ou plus.) ⚠️' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="quartier_securite"
                          value={value}
                          checked={formData.quartier_securite === value}
                          onChange={() => handleInputChange('section_avis.quartier_securite', value)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Perturbations du quartier */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-900 mb-3">Perturbations du quartier</label>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'aucune', label: 'Pas d\'élément perturbateur' },
                      { value: 'perturbateur', label: 'Élément perturbateur à proximité (ex : restaurant avec forte odeur, rue bruyante, lieux de fêtes)' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="quartier_perturbations"
                          value={value}
                          checked={formData.quartier_perturbations === value}
                          onChange={() => handleInputChange('section_avis.quartier_perturbations', value)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Champ conditionnel - Détails perturbations */}
                  {formData.quartier_perturbations === 'perturbateur' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Décrire l'élément perturbateur (ex : bruit de discothèque, odeurs de cuisine d'un restaurant, circulation dense etc)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        rows="3"
                        placeholder="Décrivez précisément l'élément perturbateur..."
                        value={formData.quartier_perturbations_details || ''}
                        onChange={(e) => handleInputChange('section_avis.quartier_perturbations_details', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Évaluation de l'immeuble */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Évaluation de l'immeuble</h3>
                
                {/* État général de l'immeuble */}
                <div className="mb-6">
                  <label className="block font-medium text-gray-900 mb-3">État général de l'immeuble</label>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'bon_etat', label: 'Bon état (entretien régulier, bâtiment bien conservé, récentes rénovations)' },
                      { value: 'etat_correct', label: 'État correct (l\'immeuble est bien entretenu et a besoin d\'améliorations mineures)' },
                      { value: 'mauvais_etat', label: 'Mauvais état (bâtiment vétuste, rénovations nécessaires) ⚠️' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="immeuble_etat_general"
                          value={value}
                          checked={formData.immeuble_etat_general === value}
                          onChange={() => handleInputChange('section_avis.immeuble_etat_general', value)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Propreté de l'immeuble */}
                <div className="mb-6">
                  <label className="block font-medium text-gray-900 mb-3">Propreté de l'immeuble</label>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'propre', label: 'Propre (espaces communs bien entretenus)' },
                      { value: 'sale', label: 'Sale (espaces communs mal nettoyés, débris visibles) ⚠️' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="immeuble_proprete"
                          value={value}
                          checked={formData.immeuble_proprete === value}
                          onChange={() => handleInputChange('section_avis.immeuble_proprete', value)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Accessibilité de l'immeuble */}
                <div className="mb-6">
                  <label className="block font-medium text-gray-900 mb-3">Accessibilité de l'immeuble</label>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'tres_accessible', label: 'Très accessible (ascenseur fonctionnel, rampes, accès facile aux personnes à mobilité réduite)' },
                      { value: 'moderement_accessible', label: 'Modérément accessible (accès aux étages supérieurs possible, mais avec quelques limitations)' },
                      { value: 'inaccessible', label: 'Inaccessible (pas d\'ascenseur, rampes non présentes, escalier raide difficultés d\'accès pour personnes à mobilité réduite)' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="immeuble_accessibilite"
                          value={value}
                          checked={formData.immeuble_accessibilite === value}
                          onChange={() => handleInputChange('section_avis.immeuble_accessibilite', value)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Niveau sonore de l'immeuble */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-900 mb-3">Niveau sonore de l'immeuble</label>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'tres_calme', label: 'Très calme (absence de bruit, excellente isolation sonore)' },
                      { value: 'relativement_calme', label: 'Relativement calme (bruit modéré provenant des voisins ou de l\'extérieur)' },
                      { value: 'tres_bruyant', label: 'Très bruyant (nuisances sonores importantes, mauvaise insonorisation)' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="immeuble_niveau_sonore"
                          value={value}
                          checked={formData.immeuble_niveau_sonore === value}
                          onChange={() => handleInputChange('section_avis.immeuble_niveau_sonore', value)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Évaluation du logement */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Évaluation du logement</h3>
                
                {/* État général du logement */}
                <div className="mb-6">
                  <label className="block font-medium text-gray-900 mb-3">État général du logement</label>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'excellent_etat', label: 'Excellent état (récent ou rénové, tout est fonctionnel, pas d\'usure visible)' },
                      { value: 'bon_etat', label: 'Bon état (quelques signes d\'usure légers)' },
                      { value: 'etat_moyen', label: 'État moyen (éléments nécessitant des réparations mineures)' },
                      { value: 'etat_degrade', label: 'État dégradé (meubles, installations détériorés, des travaux sont nécessaires) ⚠️' },
                      { value: 'tres_mauvais_etat', label: 'Très mauvais état (vétusté générale) ⚠️' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="logement_etat_general"
                          value={value}
                          checked={formData.logement_etat_general === value}
                          onChange={() => handleInputChange('section_avis.logement_etat_general', value)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Champ conditionnel - Détails état dégradé */}
                  {(formData.logement_etat_general === 'etat_degrade' || formData.logement_etat_general === 'tres_mauvais_etat') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Décrire l'élément vétustes (ex : murs et meubles abimés, sol abîmé, moisissure etc)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        rows="3"
                        placeholder="Décrivez les éléments détériorés..."
                        value={formData.logement_etat_details || ''}
                        onChange={(e) => handleInputChange('section_avis.logement_etat_details', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                {/* Propreté et entretien */}
                <div className="mb-6">
                  <label className="block font-medium text-gray-900 mb-3">Propreté et entretien</label>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'propre', label: 'Propre (logement bien nettoyé, entretien régulier et approfondi du logement)' },
                      { value: 'correct', label: 'Correct (légères traces d\'usure, entretien basique)' },
                      { value: 'sale', label: 'Sale (zones visibles non nettoyées, saleté visible et absence ou manque d\'entretien) ⚠️' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="logement_proprete"
                          value={value}
                          checked={formData.logement_proprete === value}
                          onChange={() => handleInputChange('section_avis.logement_proprete', value)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Champ conditionnel - Détails éléments sales */}
                  {formData.logement_proprete === 'sale' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Décrire les éléments sales (ex: murs sales, cafards, odeur)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        rows="3"
                        placeholder="Décrivez les problèmes de propreté..."
                        value={formData.logement_proprete_details || ''}
                        onChange={(e) => handleInputChange('section_avis.logement_proprete_details', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                {/* Ambiance générale du logement */}
                <div className="mb-6">
                  <label className="block font-medium text-gray-900 mb-3">Ambiance générale du logement</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'logement_epure', label: 'Logement épuré (décor minimaliste, espaces aérés)' },
                      { key: 'logement_charge', label: 'Logement chargé (beaucoup de décorations, de meubles, de bibelots etc)' },
                      { key: 'decoration_moderne', label: 'Décoration moderne (meubles neufs ou récents, lignes modernes)' },
                      { key: 'decoration_traditionnelle', label: 'Décoration traditionnelle (meubles anciens et décoration ancienne)' },
                      { key: 'decoration_specifique', label: 'Décoration spécifique (logement à thème)' },
                      { key: 'absence_decoration', label: 'Absence de décoration' },
                      { key: 'decoration_personnalisee', label: 'Décoration très personnalisée (décor familiale avec des éléments personnels de propriétaires) ⚠️' }
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-[#dbae61] hover:bg-[#dbae61]/5"
                      >
                        <input
                          type="checkbox"
                          checked={formData.logement_ambiance?.includes(key) || false}
                          onChange={(e) => {
                            const currentAmbiance = formData.logement_ambiance || []
                            const newAmbiance = e.target.checked 
                              ? [...currentAmbiance, key]
                              : currentAmbiance.filter(item => item !== key)
                            handleInputChange('section_avis.logement_ambiance', newAmbiance)
                          }}
                          className="h-4 w-4 shrink-0 text-[#dbae61] focus:ring-[#dbae61]"
                        />
                        <span className="text-sm text-gray-900 group-hover:text-[#dbae61] transition-colors">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Champ conditionnel - Absence de décoration */}
                  {formData.logement_ambiance?.includes('absence_decoration') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Décrire les éléments à rajouter (ex : cadres, rideaux etc)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        rows="3"
                        placeholder="Listez les éléments décoratifs manquants..."
                        value={formData.logement_absence_decoration_details || ''}
                        onChange={(e) => handleInputChange('section_avis.logement_absence_decoration_details', e.target.value)}
                      />
                    </div>
                  )}
                  
                  {/* Champ conditionnel - Décoration personnalisée */}
                  {formData.logement_ambiance?.includes('decoration_personnalisee') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Décrire l'élément personnalisés (ex : photos de famille, éléments religieux etc)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        rows="3"
                        placeholder="Décrivez les éléments personnels..."
                        value={formData.logement_decoration_personnalisee_details || ''}
                        onChange={(e) => handleInputChange('section_avis.logement_decoration_personnalisee_details', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                {/* Vis-à-vis du logement */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-900 mb-3">Vis-à-vis du logement</label>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'vue_degagee', label: 'Vue dégagée sur pièce principale et jardin' },
                      { value: 'vis_a_vis_partielle', label: 'Vis-à-vis partielle sur pièce principale et jardin (arbres, clôture etc)' },
                      { value: 'vis_a_vis_direct', label: 'Vis-à-vis direct sur pièce principale et jardin ⚠️' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="logement_vis_a_vis"
                          value={value}
                          checked={formData.logement_vis_a_vis === value}
                          onChange={() => handleInputChange('section_avis.logement_vis_a_vis', value)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Rappel photo vis-à-vis */}
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="vis_a_vis_photos_taken"
                        checked={formData.photos_rappels?.vis_a_vis_taken || false}
                        onChange={(e) => handleInputChange('section_avis.photos_rappels.vis_a_vis_taken', e.target.checked)}
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <label htmlFor="vis_a_vis_photos_taken" className="text-sm text-yellow-800">
                        📸 Pensez à prendre des photos du vis-à-vis
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Atouts du logement */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Atouts du logement</h3>
                <StyledCheckboxGrid
                  options={optionsAtouts}
                  values={atouts}
                  path="section_avis.atouts_logement"
                  onChange={handleInputChange}
                />
                {atouts.autres_atouts && (
                  <textarea
                    className="mt-4 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    placeholder="Précisez les autres atouts..."
                    value={getField('section_avis.atouts_logement_autre') || ''}
                    onChange={(e) => handleInputChange('section_avis.atouts_logement_autre', e.target.value)}
                  />
                )}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Autres caractéristiques</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    placeholder="Aspects uniques à mettre en avant..."
                    value={getField('section_avis.autres_caracteristiques') || ''}
                    onChange={(e) => handleInputChange('section_avis.autres_caracteristiques', e.target.value)}
                  />
                </div>
              </div>

              {/* Types de voyageurs */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Types de voyageurs</h3>
                <StyledCheckboxGrid
                  options={optionsVoyageurs}
                  values={voyageurs}
                  path="section_avis.types_voyageurs"
                  onChange={handleInputChange}
                />
                {voyageurs.autres_voyageurs && (
                  <textarea
                    className="mt-4 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    placeholder="Précisez le type de voyageurs..."
                    value={getField('section_avis.types_voyageurs_autre') || ''}
                    onChange={(e) => handleInputChange('section_avis.types_voyageurs_autre', e.target.value)}
                  />
                )}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Pourquoi ce logement convient ?</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    placeholder="Expliquez l'adaptation du logement"
                    value={getField('section_avis.explication_adaptation') || ''}
                    onChange={(e) => handleInputChange('section_avis.explication_adaptation', e.target.value)}
                  />
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