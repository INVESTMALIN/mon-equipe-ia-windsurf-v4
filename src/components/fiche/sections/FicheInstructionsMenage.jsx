// src/components/fiche/sections/FicheInstructionsMenage.jsx
//
// 🧹 Section « Instructions Ménage » — tout ce qui est destiné au prestataire de ménage.
//
// Portée depuis la version coordinateurs (source de vérité), avec les adaptations Lite :
//   - les champs média deviennent des rappels à cocher : Lite ne stocke aucun fichier ;
//   - les contacts de maintenance ne sont pas portés (décision produit : un concierge
//     indépendant n'a ni l'usage ni le board Monday derrière) ;
//   - le rappel des consommables est dérivé de la section Consommables DE LITE, dont la
//     liste diverge volontairement de celle des coordinateurs (cf. consommablesRecapLite).
//
// Trois champs viennent de la section Avis (`type_premier_menage`,
// `type_premiere_maintenance`, le rappel vidéo de l'état du logement) : c'est un
// DÉPLACEMENT. Les valeurs déjà saisies sont relues en repli, cf. handleTypePassage.
import { useState, useMemo } from 'react'
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Sparkles } from 'lucide-react'
import { TYPES_PASSAGE, TYPES_MAINTENANCE } from '../../../lib/avisGrilleHelpers'
import { buildConsommablesRecapLite } from '../../../lib/consommablesRecapLite'

// Pense-bête statique : aucune donnée en base, uniquement de l'aide à l'inspection.
// Vivait dans la section Avis, déplacé ici avec le reste du bloc ménage.
const CHECKLIST_MENAGE = [
  { title: 'Logement de manière général' },
  { title: 'Mobilier', subtext: "(derrière, au-dessus, à l'intérieur si poussière)" },
  { title: 'Cuisine :', items: ["État de l'évier et robinetterie", 'Four et micro-ondes', 'Hotte et filtre', 'Réfrigérateur / congélateur (moisissures ?)', 'État des placards'] },
  { title: 'Salle de bain :', items: ['Cuvette des WC stable et fonctionnelle', 'Cabine de douche / carrelage', 'Joints / moisissures', 'Siphons qui évacuent bien'] },
  { title: 'Linge :', items: ['Draps et serviettes en bon état, non tachés'] },
  { title: 'Extérieurs :', items: ['Mobilier en bon état'] }
]

const CHECKLIST_MAINTENANCE = [
  { title: 'Éclairage : ampoules fonctionnelles' },
  { title: 'Électricité :', items: ['Prises', 'Interrupteurs', 'Télécommande / TV / Wi-Fi'] },
  { title: 'Plomberie :', items: ['Fuites sous éviers / WC', "Pression d'eau", 'Eau chaude'] },
  { title: 'Chauffage / climatisation opérationnels' },
  { title: 'Fenêtres / volets / rideaux fonctionnels' },
  { title: 'Électroménager :', items: ['Lave-linge', 'Lave-vaisselle', 'Cafetière, bouilloire, etc.'] },
  { title: 'Détecteur de fumée présent et fonctionnel' },
  { title: 'Mobilier :', items: ['Casse', 'Rayures', 'Mal fixé'] },
  { title: 'Traces de nuisibles :', items: ['Insectes', 'Humidité', 'Moisissures'] },
  { title: 'Murs et plafonds :', items: ['Tâches', 'Trous', 'Fissures'] }
]

const ChecklistColumn = ({ emoji, titre, sections }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-900 pb-2 mb-1 border-b border-gray-200">{emoji} {titre}</h3>
    {sections.map((section) => (
      <div key={section.title}>
        <p className="text-xs font-medium text-gray-700 mt-3 mb-1">
          {section.title}
          {section.subtext && <span className="font-normal text-gray-500"> {section.subtext}</span>}
        </p>
        {section.items && (
          <ul className="ml-5 list-disc text-xs text-gray-600 space-y-0.5">
            {section.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
      </div>
    ))}
  </div>
)

// Rappel photo/vidéo — Lite n'héberge aucun média, il invite à le prendre.
const RappelMedia = ({ id, checked, onChange, children }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 text-[#dbae61] focus:ring-[#dbae61] rounded"
      />
      <span className="text-sm text-yellow-800">{children}</span>
    </label>
  </div>
)

const BoutonsChoix = ({ options, value, onSelect }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const active = value === option
      return (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(active ? null : option)}
          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
            active
              ? 'bg-[#dbae61] text-white border-[#dbae61]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#dbae61]'
          }`}
        >
          {option}
        </button>
      )
    })}
  </div>
)

// Radio « qui s'en occupe » — booléen : true = prestataire, false = propriétaire.
const ChoixFournisseur = ({ name, value, onChange }) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
    {[
      { bool: false, label: 'Propriétaire' },
      { bool: true, label: 'Prestataire de ménage' }
    ].map(({ bool, label }) => (
      <label key={label} className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name={name}
          checked={value === bool}
          onChange={() => onChange(bool)}
          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
        />
        <span className="text-sm text-gray-900">{label}</span>
      </label>
    ))}
  </div>
)

export default function FicheInstructionsMenage() {
  const { getField, updateField } = useForm()

  const formData = getField('section_instructions_menage') || {}
  const avis = getField('section_avis') || {}

  const [checklistOpen, setChecklistOpen] = useState(false)

  const handleInputChange = (fieldPath, value) => {
    updateField(fieldPath, value)
  }

  // 🔁 Rappel des consommables — dérivé, jamais stocké. `getField` relit le FormContext
  // à chaque rendu : une modification dans la section Consommables se reflète ici
  // immédiatement, sans sauvegarde ni synchronisation.
  // `buildConsommablesRecapLite` tolère déjà une entrée vide : pas de `|| {}` ici, il
  // fabriquerait un objet neuf à chaque rendu et casserait la mémoïsation.
  const consommables = getField('section_consommables')
  const recap = useMemo(() => buildConsommablesRecapLite(consommables), [consommables])

  // ── Reprise des valeurs saisies avant le déplacement, SANS écriture en base ────
  // Tant que la nouvelle clé est vide, on lit l'ancienne (section_avis). Dès que
  // l'utilisateur répond ICI, on purge l'ancienne : sinon la fiche porterait les deux
  // valeurs et le PDF — générique, il parcourt toutes les sections — afficherait deux
  // types de 1er ménage, potentiellement contradictoires. L'écriture est déclenchée par
  // l'utilisateur sur SA fiche : aucune reprise de masse sur la base.
  //
  // Cas de la maintenance : Lite proposait ici les valeurs de MÉNAGE (TYPES_PASSAGE),
  // alors que la liste métier est TYPES_MAINTENANCE. Une ancienne valeur qui n'existe
  // pas dans la nouvelle liste n'est pas reprise — elle serait affichée sans bouton
  // correspondant. Volume jugé négligeable, aucun script de reprise (décision produit).
  const legacyMaintenance = TYPES_MAINTENANCE.includes(avis.type_premiere_maintenance)
    ? avis.type_premiere_maintenance
    : null

  const typePremierMenage = formData.type_premier_menage || avis.type_premier_menage || null
  const typePremiereMaintenance = formData.type_premiere_maintenance || legacyMaintenance

  const etatLogementVideoTaken =
    formData.photos_rappels?.etat_logement_video_taken ||
    avis.photos_rappels?.etat_logement_video_taken ||
    false

  const setTypePremierMenage = (value) => {
    handleInputChange('section_instructions_menage.type_premier_menage', value)
    if (avis.type_premier_menage) {
      updateField('section_avis.type_premier_menage', null)
    }
  }

  const setTypePremiereMaintenance = (value) => {
    handleInputChange('section_instructions_menage.type_premiere_maintenance', value)
    if (avis.type_premiere_maintenance) {
      updateField('section_avis.type_premiere_maintenance', null)
    }
  }

  const setEtatLogementVideoTaken = (checked) => {
    handleInputChange('section_instructions_menage.photos_rappels.etat_logement_video_taken', checked)
    if (avis.photos_rappels?.etat_logement_video_taken) {
      updateField('section_avis.photos_rappels.etat_logement_video_taken', false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />

      <div className="flex-1 flex flex-col">
        <ProgressBar />

        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Instructions Ménage</h1>

            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">

              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Ce que le prestataire va recevoir</h2>
                    <p className="text-gray-600">Les informations destinées au ménage</p>
                  </div>
                </div>
              </div>

              {/* Message d'information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-blue-900 leading-relaxed">
                  Cette section rassemble tout ce dont le prestataire de ménage a besoin avant sa
                  première intervention : l'état constaté, le type de passage nécessaire, les
                  consignes propres au logement et la mise en place du kit de bienvenue.
                </p>
              </div>

              <div className="space-y-8">

                {/* Pense-bête - Points sensibles à filmer */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setChecklistOpen((open) => !open)}
                    className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    aria-expanded={checklistOpen}
                  >
                    <span className="font-medium text-gray-900">Points sensibles à filmer (pense-bête)</span>
                    <span className={`text-gray-500 transition-transform ${checklistOpen ? 'rotate-180' : ''}`}>▾</span>
                  </button>

                  {checklistOpen && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ChecklistColumn emoji="🧹" titre="Ménage" sections={CHECKLIST_MENAGE} />
                      <ChecklistColumn emoji="🔧" titre="Maintenance" sections={CHECKLIST_MAINTENANCE} />
                    </div>
                  )}
                </div>

                {/* Rappel vidéo état du logement */}
                <RappelMedia
                  id="etat_logement_video_taken"
                  checked={etatLogementVideoTaken}
                  onChange={setEtatLogementVideoTaken}
                >
                  📹 Pensez à filmer l'état général du logement (vue d'ensemble, points sensibles, défauts constatés)
                </RappelMedia>

                {/* Type de 1er passage */}
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Type de 1er passage</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sur la base de ce que vous avez constaté, indiquez le type d'intervention nécessaire
                    pour le ménage et pour la maintenance.
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">🧹 Ménage</label>
                    <BoutonsChoix
                      options={TYPES_PASSAGE}
                      value={typePremierMenage}
                      onSelect={setTypePremierMenage}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">🔧 Maintenance</label>
                    <BoutonsChoix
                      options={TYPES_MAINTENANCE}
                      value={typePremiereMaintenance}
                      onSelect={setTypePremiereMaintenance}
                    />
                  </div>
                </div>

                {/* Consignes générales */}
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Consignes générales</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Les consignes de ménage propres à ce logement.
                  </p>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    rows="4"
                    placeholder="Ex : passer l'aspirateur sous le canapé, aérer 10 min avant de partir..."
                    value={formData.consignes_generales || ''}
                    onChange={(e) => handleInputChange('section_instructions_menage.consignes_generales', e.target.value)}
                  />

                  <div className="mt-4">
                    <RappelMedia
                      id="consignes_videos_taken"
                      checked={formData.photos_rappels?.consignes_videos_taken || false}
                      onChange={(checked) => handleInputChange('section_instructions_menage.photos_rappels.consignes_videos_taken', checked)}
                    >
                      📹 Pensez à filmer les consignes de ménage (tâches à traiter, matériaux sensibles, tutoriel pour un élément spécifique comme un jacuzzi)
                    </RappelMedia>
                  </div>
                </div>

                {/* Produits et matériel */}
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Produits et matériel</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Ce qu'il faut utiliser, et ce qu'il ne faut surtout pas.
                  </p>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    rows="4"
                    placeholder="Ex : produit X pour le sol, pas de javel sur le parquet, ne pas utiliser d'éponge abrasive sur la plaque..."
                    value={formData.produits_materiel || ''}
                    onChange={(e) => handleInputChange('section_instructions_menage.produits_materiel', e.target.value)}
                  />
                </div>

                {/* Kit de bienvenue */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Kit de bienvenue</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    L'accueil et la mise en scène à l'arrivée des voyageurs.
                  </p>

                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 mb-6 text-sm">
                    ⚠️ À ne pas confondre avec les <strong>consommables</strong> de la section
                    Consommables : les consommables, ce sont le papier toilette, le savon, le café.
                    Le kit, c'est l'accueil.
                  </div>

                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-3">Qui achète le kit ?</label>
                    <ChoixFournisseur
                      name="kit_achat_par_prestataire"
                      value={formData.kit_achat_par_prestataire}
                      onChange={(bool) => handleInputChange('section_instructions_menage.kit_achat_par_prestataire', bool)}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-3">Qui met le kit en place ?</label>
                    <ChoixFournisseur
                      name="kit_installation_par_prestataire"
                      value={formData.kit_installation_par_prestataire}
                      onChange={(bool) => handleInputChange('section_instructions_menage.kit_installation_par_prestataire', bool)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Composition du kit et endroit où le disposer
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      rows="4"
                      placeholder="Ex : 1 bouteille de vin + 2 verres + mot de bienvenue, sur la table de la cuisine..."
                      value={formData.kit_composition || ''}
                      onChange={(e) => handleInputChange('section_instructions_menage.kit_composition', e.target.value)}
                    />
                  </div>

                  <RappelMedia
                    id="kit_photos_taken"
                    checked={formData.photos_rappels?.kit_photos_taken || false}
                    onChange={(checked) => handleInputChange('section_instructions_menage.photos_rappels.kit_photos_taken', checked)}
                  >
                    📸 Pensez à prendre des photos de la disposition du ou des kits
                  </RappelMedia>
                </div>

                {/* Rappel des consommables — LECTURE SEULE, dérivé de la section Consommables.
                    Rien n'est stocké ici : pour modifier, il faut retourner dans Consommables. */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">Rappel des consommables</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Lecture seule
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Repris de la section Consommables, pour vous aider à décrire le kit sans confondre
                    les deux. Pour modifier, retournez dans la section Consommables — l'affichage se
                    met à jour tout seul.
                  </p>

                  {recap.isEmpty ? (
                    <p className="text-sm text-gray-500 italic">
                      Rien n'est encore renseigné dans la section Consommables.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                          Consommables du quotidien fournis par
                        </p>
                        <p className="text-sm text-gray-900">
                          {recap.quotidien || <span className="italic text-gray-500">Non renseigné</span>}
                        </p>
                      </div>

                      {recap.recommandes.length > 0 && (
                        <div className="rounded-lg bg-red-50 border-l-4 border-red-400 p-3">
                          <p className="text-sm font-semibold text-red-800 mb-2">
                            Fournis par le prestataire de ménage :
                          </p>
                          <ul className="text-sm text-red-700 space-y-0.5">
                            {recap.recommandes.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {recap.surDemande.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                            Consommables « sur demande »
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recap.surDemande.map((item) => (
                              <span key={item} className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {recap.cafe.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                            Café / Cafetière
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recap.cafe.map((item) => (
                              <span key={item} className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Points de vigilance */}
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Points de vigilance</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Les oublis classiques sur ce logement.
                  </p>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    rows="4"
                    placeholder="Ex : bien refermer le velux, purger la clim, fermer le volet du bas..."
                    value={formData.points_vigilance || ''}
                    onChange={(e) => handleInputChange('section_instructions_menage.points_vigilance', e.target.value)}
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
