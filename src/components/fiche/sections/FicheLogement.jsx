import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import { useForm } from '../../FormContext'
import { Home } from 'lucide-react'
import NavigationButtons from '../NavigationButtons'

// ─── Constantes de style ───────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
const labelClass = "block font-medium text-gray-900 mb-2"

// Valeurs vides pour réinitialisation
const EMPTY_ACCES = { nom_residence: "", batiment: "", acces: "", etage: "", numero_porte: "" }
const EMPTY_MAISON = { maison_niveau: "", maison_nb_etages: "" }

// ─── Composant AccesLogementSection sorti du parent pour éviter la perte de focus ───
function AccesLogementSection({ prefix, titre, getField, handleInputChange }) {
  const prefixLabel = prefix === 'appartement' ? 'Appartement' : 'Studio'

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{titre}</h3>
      </div>

      <div className="space-y-4">
        {/* Nom résidence + Bâtiment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{prefixLabel} - Nom de la résidence</label>
            <input
              type="text"
              placeholder="Indiquez le nom de la résidence (ex. : Les Jardins)"
              className={inputClass}
              value={getField(`section_logement.${prefix}.nom_residence`)}
              onChange={(e) => handleInputChange(`section_logement.${prefix}.nom_residence`, e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>{prefixLabel} - Bâtiment</label>
            <input
              type="text"
              placeholder="Indiquez le bâtiment (ex. : E1)"
              className={inputClass}
              value={getField(`section_logement.${prefix}.batiment`)}
              onChange={(e) => handleInputChange(`section_logement.${prefix}.batiment`, e.target.value)}
            />
          </div>
        </div>

        {/* Accès + Étage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{prefixLabel} - Accès à l'appartement</label>
            <select
              className={inputClass}
              value={getField(`section_logement.${prefix}.acces`)}
              onChange={(e) => handleInputChange(`section_logement.${prefix}.acces`, e.target.value)}
            >
              <option value="">Veuillez sélectionner</option>
              <option value="RDC">Rez-de-chaussée</option>
              <option value="Escalier">Escalier</option>
              <option value="Ascenseur">Ascenseur</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{prefixLabel} - Étage</label>
            <input
              type="text"
              placeholder="Indiquez l'étage (ex. : 1)"
              className={inputClass}
              value={getField(`section_logement.${prefix}.etage`)}
              onChange={(e) => handleInputChange(`section_logement.${prefix}.etage`, e.target.value)}
            />
          </div>
        </div>

        {/* Numéro de porte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{prefixLabel} - Numéro de porte</label>
            <input
              type="text"
              placeholder="Indiquez le numéro de porte (ex. : 12A)"
              className={inputClass}
              value={getField(`section_logement.${prefix}.numero_porte`)}
              onChange={(e) => handleInputChange(`section_logement.${prefix}.numero_porte`, e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Options "Autre" ───────────────────────────────────────────────────────
const autresTypes = [
  "Chambres d'hôtes", "Auberges de jeunesse", "Lofts", "Studios", "Bungalows",
  "Chalets", "Cabanes", "Cabanes perchées", "Tiny houses", "Yourtes", "Dômes",
  "Tipis", "Tentes", "Camping-cars", "Bateaux", "Péniches", "Îles privées",
  "Châteaux", "Moulins", "Phares", "Granges rénovées", "Conteneurs aménagés",
  "Grottes", "Igloos", "Roulottes", "Treehouses (cabanes dans les arbres)",
  "Fermes", "Ranchs", "Cottages", "Maisons troglodytes", "Huttes", "Caravanes",
  "Bulles transparentes", "Maisons flottantes", "Wagons de train aménagés",
  "Avions reconvertis", "Capsules", "Maisons souterraines", "Maisons sur pilotis"
]

// ─── Composant principal ───────────────────────────────────────────────────
export default function FicheLogement() {
  const { getField, updateField } = useForm()

  const handleInputChange = (fieldPath, value) => {
    updateField(fieldPath, value)
  }

  // Changement de type de propriété avec nettoyage des champs conditionnels
  const handleTypeProprieteChange = (newType) => {
    const prev = getField('section_logement.type_propriete')

    // Réinitialiser les champs de l'ancien type
    if (prev === 'Appartement') {
      updateField('section_logement.appartement', { ...EMPTY_ACCES })
    }
    if (prev === 'Studio') {
      updateField('section_logement.studio', { ...EMPTY_ACCES })
    }
    if (prev === 'Maison' || prev === 'Villa') {
      updateField('section_logement.maison_niveau', EMPTY_MAISON.maison_niveau)
      updateField('section_logement.maison_nb_etages', EMPTY_MAISON.maison_nb_etages)
    }
    if (prev === 'Autre') {
      updateField('section_logement.type_autre_precision', '')
    }

    updateField('section_logement.type_propriete', newType)
  }

  const typePropriete = getField('section_logement.type_propriete')
  const isAutre = typePropriete === 'Autre'
  const isAppartement = typePropriete === 'Appartement'
  const isStudio = typePropriete === 'Studio'
  const isMaisonOuVilla = typePropriete === 'Maison' || typePropriete === 'Villa'
  const maisonNiveau = getField('section_logement.maison_niveau')

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />

      <div className="flex-1 flex flex-col">
        <ProgressBar />

        <div className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Informations sur le logement</h1>

            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* En-tête section */}
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
                  <label className={labelClass}>Type de propriété *</label>
                  <select
                    className={inputClass}
                    value={typePropriete}
                    onChange={(e) => handleTypeProprieteChange(e.target.value)}
                  >
                    <option value="">Veuillez sélectionner</option>
                    <option value="Appartement">Appartement</option>
                    <option value="Maison">Maison</option>
                    <option value="Villa">Villa</option>
                    <option value="Studio">Studio</option>
                    <option value="Loft">Loft</option>
                    <option value="Autre">Autre</option>
                  </select>

                  {isAutre && (
                    <div className="mt-3">
                      <label className={labelClass}>Type - Autres (Veuillez préciser) *</label>
                      <select
                        className={inputClass}
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

                {/* Surface + Typologie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Surface en m² *</label>
                    <input
                      type="number"
                      placeholder="Ex: 45"
                      className={inputClass}
                      value={getField('section_logement.surface')}
                      onChange={(e) => handleInputChange('section_logement.surface', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Typologie *</label>
                    <select
                      className={inputClass}
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

                {/* Personnes max + Nombre de lits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Personnes max *</label>
                    <input
                      type="number"
                      placeholder="Ex: 4"
                      className={inputClass}
                      value={getField('section_logement.nombre_personnes_max')}
                      onChange={(e) => handleInputChange('section_logement.nombre_personnes_max', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nombre de lits *</label>
                    <input
                      type="number"
                      placeholder="Ex: 2"
                      className={inputClass}
                      value={getField('section_logement.nombre_lits')}
                      onChange={(e) => handleInputChange('section_logement.nombre_lits', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Incluez canapés-lits et comptez 2 pour les lits superposés
                    </p>
                  </div>
                </div>

                {/* Classement du logement */}
                <div>
                  <label className={labelClass}>Classement du logement</label>
                  <input
                    type="text"
                    placeholder="Ex: 3 étoiles, Gîte de France 4 épis…"
                    className={inputClass}
                    value={getField('section_logement.classement_logement')}
                    onChange={(e) => handleInputChange('section_logement.classement_logement', e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Indiquez le classement officiel du logement s'il en possède un
                  </p>
                </div>
              </div>

              {/* ─── Maison / Villa : Type de niveau ─── */}
              {isMaisonOuVilla && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Type de niveau</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      {[
                        { value: 'plain_pied', label: 'De plain pied' },
                        { value: 'etage', label: 'À étage(s)' }
                      ].map(({ value, label }) => (
                        <label
                          key={value}
                          className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 cursor-pointer transition-all ${maisonNiveau === value
                              ? 'border-[#dbae61] bg-[#fdf6e8] text-gray-900 font-medium'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                        >
                          <input
                            type="radio"
                            name="maison_niveau"
                            value={value}
                            checked={maisonNiveau === value}
                            onChange={() => handleInputChange('section_logement.maison_niveau', value)}
                            className="accent-[#dbae61]"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    <div>
                      <label className={labelClass}>Nombre d'étages / Précisions</label>
                      <input
                        type="text"
                        placeholder="Ex: 2 étages, chambre au 1er, salon au RDC…"
                        className={inputClass}
                        value={getField('section_logement.maison_nb_etages')}
                        onChange={(e) => handleInputChange('section_logement.maison_nb_etages', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Appartement : Accès au logement ─── */}
              {isAppartement && (
                <AccesLogementSection
                  prefix="appartement"
                  titre="Appartement - Accès au logement"
                  getField={getField}
                  handleInputChange={handleInputChange}
                />
              )}

              {/* ─── Studio : Accès au logement ─── */}
              {isStudio && (
                <AccesLogementSection
                  prefix="studio"
                  titre="Studio - Accès au logement"
                  getField={getField}
                  handleInputChange={handleInputChange}
                />
              )}
            </div>

            <NavigationButtons />
          </div>
        </div>
      </div>
    </div>
  )
}