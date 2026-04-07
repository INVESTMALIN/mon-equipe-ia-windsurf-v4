import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Scale } from 'lucide-react'

// Listes de villes
const VILLES_CHANGEMENT_USAGE = [
  "NON !",
  "Ahetze", "Aix-en-Provence", "Anglet", "Annecy", "Antibes", "Arbonne", 
  "Arcangues", "Ascain", "Bandiat", "Bassussarry", "Bayonne", "Biarritz", 
  "Bidart", "Biriatou", "Bordeaux", "Boucau", "Boulogne-Billancourt", 
  "Cannes", "Chaville", "Ciboure", "Colombes", "Courbevoie", "Creil", 
  "Dunkerque", "Échirolles", "Évry-Courcouronnes", "Garches", "Grenoble", 
  "Guéthary", "Hendaye", "Issy-les-Moulineaux", "Jatxou", "La Baule", 
  "La Garenne-Colombes", "La Rochelle", "Lahonce", "Larressore", 
  "Levallois-Perret", "Lille", "Lyon", "Marseille", "Montpellier", 
  "Mouguerre", "Nantes", "Nanterre", "Neuilly-sur-Seine", "Nice", "Paris", 
  "Puteaux", "Roquebrune-Cap-Martin", "Rueil-Malmaison", "Saint-Cloud", 
  "Saint-Jean-de-Luz", "Saint-Malo", "Saint-Paul-de-Vence", 
  "Saint-Pierre d'Irube", "Sète", "Strasbourg", "Suresnes", "Toulouse", 
  "Urcuit", "Urrugne", "Ustaritz", "Vaucresson", "Versailles", 
  "Villefranche-sur-Mer", "Villefranque"
];

const VILLES_DECLARATION_SIMPLE = [
  "NON !",
  "Achères", "Ahetze", "Aix-en-Provence", "Alba-la-Romaine", "Albi", 
  "Alby-sur-Chéran", "Allèves", "Anglet", "Angoulins-sur-Mer", "Annecy", 
  "Aragnouet", "Arbonne", "Arcangues", "Argonay", "Arles", "Arradon", 
  "Arromanches-les-Bains", "Artigues", "Ascain", "Asnières-sur-Seine", 
  "Auberive", "Auménancourt", "Auriol", "Aytré", "Bandol", "Barjols", 
  "Bassussarry", "Batz-sur-mer", "Bayeux", "Bayonne", "Beaumont-sur-Vesle", 
  "Beaune", "Bétheny", "Bezannes", "Biarritz", "Bidart", "Biriatou", 
  "Bluffy", "Bordeaux", "Bormes-les-Mimosas", "Boucau", "Boulogne-Billancourt", 
  "Bourgogne-Fresne", "Bras", "Brue-Auriac", "Buchelay", "Camps-la-Source", 
  "Carcès", "Cassis", "Cauroy-lès-Hermonville", "Cauterets", 
  "Chainaz-les-Frasses", "Champigny-sur-Vesle", "Chandolas", "Chapeiry", 
  "Chaumes-en-Retz", "Chauvé", "Charvonnex", "Châteauvert", "Châtel", 
  "Châtelaillon-Plage", "Chavanod", "Chaville", "Ciboure", "Colmar", 
  "Colombes", "Conflans-Sainte-Honorine", "Correns", "Cotignac", 
  "Courbevoie", "Courcelles-Sapicourt", "Créteil", "Cuers", "Cusy", 
  "Deauville", "Dompierre-sur-Mer", "Duingt", "Eaubonne", "Écueil", 
  "Entrecasteaux", "Epagny Metz-Tessy", "Époye", "Esparron-de-Pallières", 
  "Évian-les-Bains", "Fillière", "Fox-Amphoux", "Forcalqueiret", 
  "Frontignan", "Gaillard", "Garéoult", "Gassin", "Ginasservis", "Grimaud", 
  "Groisy", "Guéthary", "Hardricourt", "Hendaye", "Héry-sur-Alby", 
  "Heutrégiville", "Honfleur", "Isle-sur-Suippe", "Issou", 
  "Issy-les-Moulineaux", "Istres", "Jatxou", "La Baule", "La Bernerie-en-Retz", 
  "La Celle", "La Ciotat", "La Croix-Valmer", "La Garenne-Colombes", 
  "La Londe-les-Maures", "La Plaine-sur-Mer", "La Rochelle", 
  "La Roque d'Anthéron", "La Roquebrussanne", "La Verdière", "Labenne", 
  "Lagord", "Lahonce", "Larmor-baden", "Larressore", "Le Castellet", 
  "Le Lavandou", "Le Plan-de-la-Tour", "Le Pouliguen", "Le Val", 
  "Les Baux-de-Provence", "Les Sables d'Olonne", "Leschaux", 
  "Levallois-Perret", "Lille", "Loivre", "Lorient", "Lyon", 
  "Mandelieu-la-Napoule", "Marseille", "Martigues", "Menthon-Saint-Bernard", 
  "Menton", "Meudon", "Montfort-sur-Argens", "Montigny-lès-Cormeilles", 
  "Montmeyan", "Montpellier", "Morillon", "Mouguerre", "Mûres", 
  "Nans-les-Pins", "Nanterre", "Nantes", "Nâves-Parmelan", "Néoules", 
  "Neuilly-sur-Seine", "Nice", "Nieul-sur-Mer", "Nîmes", "Ollières", 
  "Orgeval", "Paris", "Pazanne", "Périgny", "Poissy", "Poisy", "Pontevès", 
  "Pornic", "Port-en-Bessin-Huppain", "Port-Louis", "Port-Saint-Louis-du-Rhône", 
  "Port-Saint-Père", "Pourcieux", "Pourrières", "Préfailles", "Prouilly", 
  "Provins", "Puilboreau", "Puteaux", "Quimper", "Quintal", "Ramatuelle", 
  "Reims", "Rians", "Rilly-la-Montagne", "Rocbaron", "Roquebrune-Cap-Martin", 
  "Roquebrune-sur-Argens", "Rouans", "Rueil-Malmaison", "Saint-Cannat", 
  "Saint-Cyr-sur-Mer", "Sainte-Anastasie-sur-Issole", "Saintes-Maries-de-la-Mer", 
  "Saint-Eustache", "Saint-Félix", "Saint-Gildas-de-Rhuys", 
  "Saint-Hilaire-de-Chaléons", "Saint-Hilaire-le-Petit", "Saint-Jean-de-Luz", 
  "Saint-Jorioz", "Saint-Julien", "Saint-Lary-Soulan", "Saint-Malo", 
  "Saint-Martin-de-Pallières", "Saint-Maurice", "Saint-Maximin-la-Sainte-Baume", 
  "Saint-Michel-Chef-Chef", "Saint-Paul-de-Vence", "Saint-Pierre d'Irube", 
  "Saint-Sylvestre", "Saint-Tropez", "Salles-sur-Mer", "Sanary-sur-Mer", 
  "Sarzeau", "Seignosse", "Séné", "Sept-Saulx", "Serzy-et-Prin", "Sète", 
  "Sèvres", "Sevrier", "Sillery", "Soorts-Hossegor", "Soustons", "Strasbourg", 
  "Talloires-Montmin", "Toulouse", "Tourves", "Trépail", "Trigny", "Troyes", 
  "Urcuit", "Urrugne", "Ustaritz", "Val-de-Vesle", "Vannes", "Vanves", 
  "Varages", "Versailles", "Verzenay", "Veyrier-du-Lac", "Villaz", 
  "Villefranque", "Villeneuve-en-Retz", "Villeneuve-Loubet", 
  "Villennes-sur-Seine", "Villers-Allerand", "Villers-Marmery", "Vincennes", 
  "Vins-sur-Caramy", "Viuz-la-Chiésaz", "Vue", "Witry-lès-Reims"
];

export default function FicheReglementation() {
  const { 
    getField,
    updateField
  } = useForm()

  const formData = getField('section_reglementation')
  const villeChangementUsage = formData.ville_changement_usage || ""
  const villeDeclarationSimple = formData.ville_declaration_simple || ""
  const dateExpiration = formData.date_expiration_changement || ""
  const numeroDeclaration = formData.numero_declaration || ""
  const detailsReglementation = formData.details_reglementation || ""
  
  // Documents checklist
  const documentsData = formData.documents || {}

  // Logiques conditionnelles
  const requiresChangementUsage = villeChangementUsage && villeChangementUsage !== "NON !"
  const showDeclarationSimple = villeChangementUsage === "NON !"
  const requiresDeclarationSimple = villeDeclarationSimple && villeDeclarationSimple !== "NON !"
  const showAucuneDeclaration = showDeclarationSimple && villeDeclarationSimple === "NON !"

  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Réglementation</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Conformité réglementaire</h2>
                    <p className="text-gray-600">Changement d'usage et déclaration en meublé de tourisme</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* 1. Dropdown Changement d'usage */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">
                    Le logement se situe-t-il dans une de ces villes ? Changement d'usage ! *
                  </label>
                  <select
                    value={villeChangementUsage}
                    onChange={(e) => handleInputChange('section_reglementation.ville_changement_usage', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  >
                    <option value="">Veuillez sélectionner</option>
                    {VILLES_CHANGEMENT_USAGE.map(ville => (
                      <option key={ville} value={ville}>{ville}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Rappelons que cette liste peut évoluer et qu'il est toujours préférable de vérifier auprès de la mairie concernée avant tout projet de location touristique.
                  </p>
                </div>

                {/* 2. Affichage conditionnel - Changement d'usage requis */}
                {requiresChangementUsage && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-6">
                      <p className="text-orange-800 font-medium flex items-start gap-2">
                        <span className="text-orange-600">⚠️</span>
                        <span>
                          Attention ! Votre ville exige un changement d'usage pour les meublés de tourisme. 
                          Renseignez-vous auprès de votre mairie sur les conditions et exemptions avant toute mise en location.
                        </span>
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">
                          À quelle date le changement d'usage expire-t-il ?
                        </label>
                        <input
                          type="date"
                          value={dateExpiration}
                          onChange={(e) => handleInputChange('section_reglementation.date_expiration_changement', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-gray-900 mb-2">
                          Quel est le numéro de déclaration en meublé de tourisme ?
                        </label>
                        <input
                          type="text"
                          value={numeroDeclaration}
                          onChange={(e) => handleInputChange('section_reglementation.numero_declaration', e.target.value)}
                          placeholder="Numéro de déclaration"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Il est obligatoire de l'afficher sur toutes les plateformes de locations courte durée !
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Affichage conditionnel - Déclaration simple */}
                {showDeclarationSimple && (
                  <div>
                    <label className="block font-medium text-gray-900 mb-3">
                      Le logement se situe-t-il dans une de ces villes ? Simple déclaration ! *
                    </label>
                    <select
                      value={villeDeclarationSimple}
                      onChange={(e) => handleInputChange('section_reglementation.ville_declaration_simple', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    >
                      <option value="">Veuillez sélectionner</option>
                      {VILLES_DECLARATION_SIMPLE.map(ville => (
                        <option key={ville} value={ville}>{ville}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      Rappelons que cette liste peut évoluer et qu'il est toujours préférable de vérifier auprès de la mairie concernée avant tout projet de location touristique.
                    </p>
                  </div>
                )}

                {/* 4. Affichage conditionnel - Déclaration simple requise */}
                {requiresDeclarationSimple && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-blue-800 font-medium flex items-start gap-2">
                        <span className="text-blue-600">📋</span>
                        <span>
                          Votre ville demande une déclaration simple pour les meublés de tourisme. 
                          Remplissez le formulaire Cerfa n°14004*04 et déposez-le en mairie avant de commencer la location.
                        </span>
                      </p>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Quel est le numéro de déclaration en meublé de tourisme ?
                      </label>
                      <input
                        type="text"
                        value={numeroDeclaration}
                        onChange={(e) => handleInputChange('section_reglementation.numero_declaration', e.target.value)}
                        placeholder="Numéro de déclaration"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Il est obligatoire de l'afficher sur toutes les plateformes de locations courte durée !
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. Affichage conditionnel - Aucune déclaration */}
                {showAucuneDeclaration && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium flex items-start gap-2">
                        <span className="text-green-600">✅</span>
                        <span>
                          Bonne nouvelle ! Aucune déclaration n'est requise a priori. 
                          Vérifiez tout de même auprès de votre mairie, car les réglementations évoluent rapidement.
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Textarea détails - TOUJOURS VISIBLE */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Veuillez indiquer tout détail pertinent concernant le changement d'usage ou la déclaration en meublé de tourisme : *
                  </label>
                  <textarea
                    value={detailsReglementation}
                    onChange={(e) => handleInputChange('section_reglementation.details_reglementation', e.target.value)}
                    placeholder="Le changement d'usage est-il en cours ? Une demande de déclaration a-t-elle été faite ? Si oui, quand ? Le propriétaire a-t-il déjà entamé les démarches nécessaires ? Avez-vous des remarques concernant la réglementation applicable à ce logement"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Section Documents - TOUJOURS VISIBLE */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">Documents</h3>
                  
                  <p className="block font-medium text-gray-900 mb-2">
                  Vérifiez que vous avez bien récupéré les documents suivants auprès du propriétaire :
                  </p>
                  
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'carte_identite', label: "Carte d'identité" },
                        { key: 'rib', label: 'RIB' },
                        { key: 'cerfa', label: 'CERFA' },
                        { key: 'assurance_pno', label: 'Assurance PNO' },
                        { key: 'rcp', label: 'RCP' },
                        { key: 'acte_propriete', label: 'Acte Propriété' }
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-[#dbae61] hover:bg-[#dbae61]/5">
                          <input
                            type="checkbox"
                            checked={documentsData[key] || false}
                            onChange={(e) => handleInputChange(`section_reglementation.documents.${key}`, e.target.checked)}
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm text-gray-900">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons navigation standardisés */}
              <NavigationButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}