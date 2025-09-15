import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import { useForm } from '../../FormContext'
import { Home } from 'lucide-react'
import NavigationButtons from '../NavigationButtons'

export default function FicheLogement() {
  const { 
    next, 
    back, 
    currentStep, 
    totalSteps, 
    getField,
    updateField,
    handleSave,
    saveStatus
  } = useForm()

  // Options pour le dropdown "Autre"
  const autresTypes = [
    "Chambres d'hôtes",
    "Auberges de jeunesse", 
    "Lofts",
    "Studios",
    "Bungalows",
    "Chalets",
    "Cabanes",
    "Cabanes perchées",
    "Tiny houses",
    "Yourtes",
    "Dômes",
    "Tipis",
    "Tentes",
    "Camping-cars",
    "Bateaux",
    "Péniches",
    "Îles privées",
    "Châteaux",
    "Moulins",
    "Phares",
    "Granges rénovées",
    "Conteneurs aménagés",
    "Grottes",
    "Igloos",
    "Roulottes",
    "Treehouses (cabanes dans les arbres)",
    "Fermes",
    "Ranchs",
    "Cottages",
    "Maisons troglodytes",
    "Huttes",
    "Caravanes",
    "Bulles transparentes",
    "Maisons flottantes",
    "Wagons de train aménagés",
    "Avions reconvertis",
    "Capsules",
    "Maisons souterraines",
    "Maisons sur pilotis"
  ]

  // Handlers pour les champs
  const handleInputChange = (fieldPath, value) => {
    updateField(fieldPath, value)
  }

  // Récupération des valeurs pour affichage conditionnel
  const formData = getField('section_logement')
  const typePropriete = formData.type_propriete
  const isAutre = typePropriete === 'Autre'
  const isAppartement = typePropriete === 'Appartement'

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />

      <div className="flex-1 flex flex-col">
        {/* Barre de progression en haut */}
        <ProgressBar />
        
        {/* Contenu principal */}
        <div className="flex-1 p-6 bg-gray-100">

          {/* Contenu principal - même style que FicheForm */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Informations sur le logement</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Caractéristiques du logement</h2>
                    <p className="text-gray-600">Renseignez les informations principales du bien immobilier</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Type de propriété */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Type de propriété *
                  </label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={getField('section_logement.type_propriete')}
                    onChange={(e) => handleInputChange('section_logement.type_propriete', e.target.value)}
                  >
                    <option value="">Veuillez sélectionner</option>
                    <option value="Appartement">Appartement</option>
                    <option value="Maison">Maison</option>
                    <option value="Villa">Villa</option>
                    <option value="Studio">Studio</option>
                    <option value="Loft">Loft</option>
                    <option value="Autre">Autre</option>
                  </select>
                  
                  {/* Affichage conditionnel si "Autre" */}
                  {isAutre && (
                    <div className="mt-3">
                      <label className="block font-medium text-gray-900 mb-2">Type - Autres (Veuillez préciser) *</label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        value={getField('section_logement.type_autre_precision')}
                        onChange={(e) => handleInputChange('section_logement.type_autre_precision', e.target.value)}
                      >
                        <option value="">Veuillez sélectionner</option>
                        {autresTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Surface et numéro - grille 2 colonnes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Surface en m² *
                    </label>
                    <input 
                      type="number" 
                      placeholder="Ex: 45"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={getField('section_logement.surface')}
                      onChange={(e) => handleInputChange('section_logement.surface', e.target.value)}
                    />
                  </div>

                  <div>
    <label className="block font-medium text-gray-900 mb-2">
      Typologie *
    </label>
    <select 
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
      value={getField('section_logement.typologie')}
      onChange={(e) => handleInputChange('section_logement.typologie', e.target.value)}
    >
      <option value="">Sélectionner</option>
      <option value="Studio">Studio</option>
      <option value="T2">T2</option>
      <option value="T3">T3</option>
      <option value="T4">T4</option>
      <option value="T5">T5</option>
      <option value="T6+">T6+</option>
    </select>
  </div>
</div>

                {/* Typologie et capacité - grille 3 colonnes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Personnes max *
                    </label>
                    <input 
                      type="number" 
                      placeholder="Ex: 4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={getField('section_logement.nombre_personnes_max')}
                      onChange={(e) => handleInputChange('section_logement.nombre_personnes_max', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Nombre de lits *
                    </label>
                    <input 
                      type="number" 
                      placeholder="Ex: 2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={getField('section_logement.nombre_lits')}
                      onChange={(e) => handleInputChange('section_logement.nombre_lits', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Incluez canapés-lits et comptez 2 pour les lits superposés
                    </p>
                  </div>
                </div>
              </div>

              {/* Section conditionnelle Appartement */}
              {isAppartement && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Accès à l'appartement</h3>
                    <p className="text-gray-600">Informations spécifiques pour les appartements</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Résidence et bâtiment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Nom de la résidence</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Les Jardins de la Paix"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={getField('section_logement.appartement.nom_residence')}
                          onChange={(e) => handleInputChange('section_logement.appartement.nom_residence', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Bâtiment</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Bâtiment A"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={getField('section_logement.appartement.batiment')}
                          onChange={(e) => handleInputChange('section_logement.appartement.batiment', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Accès et étage */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Type d'accès</label>
                        <select 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={getField('section_logement.appartement.acces')}
                          onChange={(e) => handleInputChange('section_logement.appartement.acces', e.target.value)}
                        >
                          <option value="">Sélectionner</option>
                          <option value="RDC">Rez-de-chaussée</option>
                          <option value="Escalier">Escalier</option>
                          <option value="Ascenseur">Ascenseur</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Étage</label>
                        <input 
                          type="text" 
                          placeholder="Ex: 3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={getField('section_logement.appartement.etage')}
                          onChange={(e) => handleInputChange('section_logement.appartement.etage', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Numéro de porte</label>
                        <input 
                          type="text" 
                          placeholder="Ex: 12A"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={getField('section_logement.appartement.numero_porte')}
                          onChange={(e) => handleInputChange('section_logement.appartement.numero_porte', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Boutons navigation standardisés */}
            <NavigationButtons />
          </div>
        </div>
      </div>
    </div>
  )
}