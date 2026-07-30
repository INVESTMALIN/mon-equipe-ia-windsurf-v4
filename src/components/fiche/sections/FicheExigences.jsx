import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Settings } from 'lucide-react'

export default function FicheExigences() {
  const { 
    getField,
    updateField
  } = useForm()

  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  // « Animaux acceptés » vivait auparavant dans section_equipements, sous forme de case à
  // cocher (booléen). La question a été déplacée ici pour s'aligner sur la version
  // coordinateurs, où c'est un choix OUI/NON.
  //
  // Reprise des réponses déjà saisies, SANS écriture en base : tant que la nouvelle clé
  // est vide, on lit l'ancienne. Seul l'ancien `true` est repris (→ « OUI ») : l'ancien
  // `false` est la valeur par défaut de la case à cocher, indiscernable d'une question
  // jamais répondue — le reprendre en « NON » inventerait une réponse sur les fiches qui
  // n'ont jamais traité le sujet. Dès que l'utilisateur répond ici, la nouvelle clé gagne.
  // Dès que l'utilisateur répond ICI, on purge l'ancienne clé : sinon une fiche héritée
  // d'un ancien `true` répondue « NON » garderait les deux valeurs, et le PDF (générique,
  // il parcourt les deux sections) annoncerait à la fois animaux acceptés et refusés.
  // Écriture déclenchée par l'utilisateur sur SA fiche, dans son propre enregistrement —
  // pas de reprise de masse sur la base.
  const handleAnimauxChange = (value) => {
    handleInputChange('section_exigences.animaux_acceptes', value)
    if (getField('section_equipements.animaux_acceptes') !== undefined) {
      updateField('section_equipements.animaux_acceptes', null)
    }
    const legacyCommentaire = getField('section_equipements.animaux_commentaire')
    if (legacyCommentaire) {
      // Le commentaire hérité est recopié une fois vers la nouvelle clé avant purge,
      // pour qu'il ne disparaisse pas de l'écran au moment où l'ancienne est vidée.
      if (!getField('section_exigences.animaux_commentaire')) {
        handleInputChange('section_exigences.animaux_commentaire', legacyCommentaire)
      }
      updateField('section_equipements.animaux_commentaire', '')
    }
  }

  const animauxLegacy = getField('section_equipements.animaux_acceptes') === true ? 'oui' : ''
  const animauxAcceptes = getField('section_exigences.animaux_acceptes') || animauxLegacy
  const animauxCommentaire =
    getField('section_exigences.animaux_commentaire') ||
    getField('section_equipements.animaux_commentaire') ||
    ''

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Exigences du propriétaire</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Contraintes et exigences</h2>
                    <p className="text-gray-600">Paramètres de location définis par le propriétaire</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Grille pour les deux premiers champs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Nombre de nuits minimum */}
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Nombre de nuits minimum
                    </label>
                    <input 
                      type="number"
                      placeholder="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={getField('section_exigences.nombre_nuits_minimum') || ''}
                      onChange={(e) => handleInputChange('section_exigences.nombre_nuits_minimum', e.target.value)}
                    />
                  </div>

                  {/* Tarif minimum/nuit */}
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Tarif minimum/nuit
                    </label>
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={getField('section_exigences.tarif_minimum_nuit') || ''}
                      onChange={(e) => handleInputChange('section_exigences.tarif_minimum_nuit', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Payé par le voyageur (EUR) ! Si aucune réservation sous 10 jours, revoir la stratégie.
                    </p>
                  </div>

                </div>

                {/* Dates à bloquer */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Dates à bloquer pour utilisation personnelle du propriétaire
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: du 15/07/2024 au 30/07/2024, du 20/12/2024 au 05/01/2025"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={getField('section_exigences.dates_bloquees') || ''}
                    onChange={(e) => handleInputChange('section_exigences.dates_bloquees', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Format libre : ex du 01/01/2024 au 10/01/2025
                  </p>
                </div>

                {/* Précisions */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Précisions sur les exigences du propriétaire
                  </label>
                  <textarea 
                    placeholder="Donnez plus de détails sur les exigences du propriétaire..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                    rows="4"
                    value={getField('section_exigences.precisions_exigences') || ''}
                    onChange={(e) => handleInputChange('section_exigences.precisions_exigences', e.target.value)}
                  />
                </div>

                {/* Animaux acceptés */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">Animaux acceptés</label>
                  <div className="flex gap-6 mb-4">
                    {[{ v: 'oui', l: 'OUI' }, { v: 'non', l: 'NON' }].map(({ v, l }) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="animaux_acceptes"
                          checked={animauxAcceptes === v}
                          onChange={() => handleAnimauxChange(v)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] focus:ring-2"
                        />
                        <span className="text-gray-700">{l}</span>
                      </label>
                    ))}
                  </div>

                  {/* Commentaire conditionnel */}
                  {animauxAcceptes && (
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Commentaire (facultatif)</label>
                      <textarea
                        placeholder="Précisez les conditions d'acceptation des animaux, restrictions éventuelles..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                        rows="4"
                        value={animauxCommentaire}
                        onChange={(e) => handleInputChange('section_exigences.animaux_commentaire', e.target.value)}
                      />
                    </div>
                  )}
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