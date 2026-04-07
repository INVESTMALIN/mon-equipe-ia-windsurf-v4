import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Key } from 'lucide-react'

export default function FicheClefs() {
  const {
    getField,
    updateField
  } = useForm()

  const isAutreBoite = getField('section_clefs.boiteType') === 'Autres'

  // Récupération des données de la section
  const formData = getField('section_clefs')

  // Handlers
  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  const handleRadioChange = (field, value) => {
    updateField(field, value === 'true' ? true : (value === 'false' ? false : null))
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />

      <div className="flex-1 flex flex-col">
        <ProgressBar />

        <div className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Gestion des clés et accès</h1>

            <div className="bg-white rounded-xl shadow-sm p-8">

              {/* Header avec icône */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Accès au logement</h2>
                    <p className="text-gray-600">Systèmes d'accès et clés</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">

                {/* Type de boîte à clés */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">Type de boîte à clés *</label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {["TTlock", "Igloohome", "Masterlock", "Autres"].map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-[#dbae61] hover:bg-[#dbae61]/5">
                        <input
                          type="radio"
                          name="boiteType"
                          value={type}
                          checked={getField('section_clefs.boiteType') === type}
                          onChange={(e) => handleInputChange('section_clefs.boiteType', e.target.value)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span className="font-medium">{type}</span>
                      </label>
                    ))}
                  </div>

                  {/* Champ conditionnel pour "Autres" - DÉPLACÉ ICI */}
                  {isAutreBoite && (
                    <div className="mt-4">
                      <label className="block font-medium text-gray-900 mb-2">
                        Précisez le type de boîte *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Boîte magnétique, coffre-fort, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        value={getField('section_clefs.boiteType_autre_precision') || ''}
                        onChange={(e) => handleInputChange('section_clefs.boiteType_autre_precision', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Emplacement de la boîte à clés */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Emplacement de la boîte à clés *</label>
                  <textarea
                    placeholder="Décrivez précisément où se trouve la boîte à clés (ex: à côté de la porte d'entrée, sur la droite)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                    rows="3"
                    value={formData.emplacementBoite || ''}
                    onChange={(e) => handleInputChange('section_clefs.emplacementBoite', e.target.value)}
                  />

                  {/* Rappel photo emplacement */}
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="emplacement_photo_taken"
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        checked={getField('section_clefs.photos_rappels.clefs_taken') || false}
                        onChange={(e) => handleInputChange('section_clefs.photos_rappels.clefs_taken', e.target.checked)}
                      />
                      <label htmlFor="emplacement_photo_taken" className="text-sm text-yellow-800">
                        📸 Pensez à prendre une photo de l'emplacement de la boîte à clés
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sections conditionnelles selon le type de boîte */}
                {formData.boiteType === "TTlock" && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Configuration TTlock</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Code Masterpin conciergerie *</label>
                        <input
                          type="text"
                          placeholder="ex: 2863"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.ttlock?.masterpinConciergerie || ''}
                          onChange={(e) => handleInputChange('section_clefs.ttlock.masterpinConciergerie', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Code Propriétaire *</label>
                        <input
                          type="text"
                          placeholder="ex: 1234"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.ttlock?.codeProprietaire || ''}
                          onChange={(e) => handleInputChange('section_clefs.ttlock.codeProprietaire', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Code Ménage *</label>
                        <input
                          type="text"
                          placeholder="ex: 5678"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.ttlock?.codeMenage || ''}
                          onChange={(e) => handleInputChange('section_clefs.ttlock.codeMenage', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.boiteType === "Igloohome" && (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Configuration Igloohome</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Masterpin conciergerie *</label>
                        <input
                          type="text"
                          placeholder="ex: 2863"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.igloohome?.masterpinConciergerie || ''}
                          onChange={(e) => handleInputChange('section_clefs.igloohome.masterpinConciergerie', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Code Voyageur *</label>
                        <input
                          type="text"
                          placeholder="ex: 1111"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.igloohome?.codeVoyageur || ''}
                          onChange={(e) => handleInputChange('section_clefs.igloohome.codeVoyageur', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Code Propriétaire *</label>
                        <input
                          type="text"
                          placeholder="ex: 1234"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.igloohome?.codeProprietaire || ''}
                          onChange={(e) => handleInputChange('section_clefs.igloohome.codeProprietaire', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Code Ménage *</label>
                        <input
                          type="text"
                          placeholder="ex: 5678"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.igloohome?.codeMenage || ''}
                          onChange={(e) => handleInputChange('section_clefs.igloohome.codeMenage', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.boiteType === "Masterlock" && (
                  <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl">
                    <h3 className="text-lg font-semibold text-orange-800 mb-4">Configuration Masterlock</h3>
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Code de la boîte à clés *</label>
                      <input
                        type="text"
                        placeholder="ex: 2863"
                        className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        value={formData.masterlock?.code || ''}
                        onChange={(e) => handleInputChange('section_clefs.masterlock.code', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Interphone */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <label className="block font-medium text-gray-900 mb-3">Logement équipé d'un interphone ? *</label>
                  <div className="flex gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="interphone"
                        value="true"
                        checked={formData.interphone === true}
                        onChange={(e) => handleRadioChange('section_clefs.interphone', e.target.value)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="interphone"
                        value="false"
                        checked={formData.interphone === false}
                        onChange={(e) => handleRadioChange('section_clefs.interphone', e.target.value)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Non</span>
                    </label>
                  </div>

                  {/* Champs conditionnels Interphone */}
                  {formData.interphone === true && (
                    <div className="pl-6 border-l-4 border-blue-500 space-y-4 mt-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Instructions pour l'interphone</label>
                        <textarea
                          placeholder="S'il existe un code d'accès, notez-le ici et expliquez comment l'utiliser. S'il n'y a pas de code, précisez à quel nom il faut sonner. Ajoutez toute instruction spéciale."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                          rows="3"
                          value={formData.interphoneDetails || ''}
                          onChange={(e) => handleInputChange('section_clefs.interphoneDetails', e.target.value)}
                        />
                      </div>

                      {/* Rappel photo interphone */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="interphone_photo_taken"
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <label htmlFor="interphone_photo_taken" className="text-sm text-yellow-800">
                            📸 Pensez à prendre une photo de l'interphone
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tempo-gâche */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <label className="block font-medium text-gray-900 mb-3">Logement équipé d'un tempo-gâche ? *</label>
                  <div className="flex gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tempoGache"
                        value="true"
                        checked={formData.tempoGache === true}
                        onChange={(e) => handleRadioChange('section_clefs.tempoGache', e.target.value)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tempoGache"
                        value="false"
                        checked={formData.tempoGache === false}
                        onChange={(e) => handleRadioChange('section_clefs.tempoGache', e.target.value)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Non</span>
                    </label>
                  </div>

                  {/* Champs conditionnels Tempo-gâche */}
                  {formData.tempoGache === true && (
                    <div className="pl-6 border-l-4 border-green-500 space-y-4 mt-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Instructions pour le tempo-gâche</label>
                        <textarea
                          placeholder="Expliquez comment utiliser le tempo-gâche, le délai d'ouverture, les codes nécessaires, etc."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                          rows="3"
                          value={formData.tempoGacheDetails || ''}
                          onChange={(e) => handleInputChange('section_clefs.tempoGacheDetails', e.target.value)}
                        />
                      </div>

                      {/* Rappel photo tempo-gâche */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="tempo_gache_photo_taken"
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <label htmlFor="tempo_gache_photo_taken" className="text-sm text-yellow-800">
                            📸 Pensez à prendre une photo du tempo-gâche
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Digicode */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <label className="block font-medium text-gray-900 mb-3">Logement équipé d'un digicode ? *</label>
                  <div className="flex gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="digicode"
                        value="true"
                        checked={formData.digicode === true}
                        onChange={(e) => handleRadioChange('section_clefs.digicode', e.target.value)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="digicode"
                        value="false"
                        checked={formData.digicode === false}
                        onChange={(e) => handleRadioChange('section_clefs.digicode', e.target.value)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Non</span>
                    </label>
                  </div>

                  {/* Champs conditionnels Digicode */}
                  {formData.digicode === true && (
                    <div className="pl-6 border-l-4 border-purple-500 space-y-4 mt-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Code et instructions du digicode</label>
                        <textarea
                          placeholder="Indiquez le code du digicode et expliquez comment l'utiliser (ex: tapez le code puis #, attendez le bip, etc.)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                          rows="3"
                          value={formData.digicodeDetails || ''}
                          onChange={(e) => handleInputChange('section_clefs.digicodeDetails', e.target.value)}
                        />
                      </div>

                      {/* Rappel photo digicode */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="digicode_photo_taken"
                            className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <label htmlFor="digicode_photo_taken" className="text-sm text-yellow-800">
                            📸 Pensez à prendre une photo du digicode
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Clefs physiques */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Clefs physiques - 3 JEUX DE CLEFS OBLIGATOIRES</h3>

                  <div className="space-y-6">
                    {/* Rappel photos clefs */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="clefs_photos_taken"
                          checked={formData.photos_rappels?.clefs_taken || false}
                          onChange={(e) => handleInputChange('section_clefs.photos_rappels.clefs_taken', e.target.checked)}
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <label htmlFor="clefs_photos_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre des photos des clefs (3 jeux maximum)
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Précisions sur les clefs</label>
                      <textarea
                        placeholder="Décrivez les clefs : nombre total, types (porte d'entrée, boîte aux lettres, cave, etc.), particularités..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                        rows="3"
                        value={formData.clefs?.precision || ''}
                        onChange={(e) => handleInputChange('section_clefs.clefs.precision', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-3">Le prestataire a-t-il reçu les clefs ?</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="clefs_prestataire"
                            value="true"
                            checked={formData.clefs?.prestataire === true}
                            onChange={(e) => handleRadioChange('section_clefs.clefs.prestataire', e.target.value)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                          />
                          <span>Oui</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="clefs_prestataire"
                            value="false"
                            checked={formData.clefs?.prestataire === false}
                            onChange={(e) => handleRadioChange('section_clefs.clefs.prestataire', e.target.value)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                          />
                          <span>Non</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Détails sur la remise des clefs</label>
                      <textarea
                        placeholder="Le prestataire a-t-il reçu les clés en mains propres ? Où sont stockées les clés ? Quel type de clef ? Précisions complémentaires..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                        rows="3"
                        value={formData.clefs?.details || ''}
                        onChange={(e) => handleInputChange('section_clefs.clefs.details', e.target.value)}
                      />
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