// src/components/fiche/sections/FicheConsommables.jsx
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { ShoppingCart } from 'lucide-react'

export default function FicheConsommables() {
  const { 
    getField,
    updateField
  } = useForm()

  // Récupération des données de la section
  const formData = getField('section_consommables') || {}
  const fournisParPrestataire = formData.fournis_par_prestataire

  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  const handleRadioChange = (field, value) => {
    updateField(field, value === 'true' ? true : (value === 'false' ? false : null))
  }

  const handleCheckboxChange = (field, checked) => {
    updateField(field, checked ? true : null)
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Consommables</h1>
            
            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Gestion des consommables</h2>
                    <p className="text-gray-600">Définissez les produits mis à disposition des voyageurs</p>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="space-y-8">
                
                {/* Question principale */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">
                    Les consommables sont-ils fournis par le prestataire de ménage ? *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fournis_par_prestataire"
                        value="true"
                        checked={fournisParPrestataire === true}
                        onChange={(e) => handleRadioChange('section_consommables.fournis_par_prestataire', e.target.value)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fournis_par_prestataire"
                        value="false"
                        checked={fournisParPrestataire === false}
                        onChange={(e) => handleRadioChange('section_consommables.fournis_par_prestataire', e.target.value)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Non</span>
                    </label>
                  </div>
                </div>

                {/* Si OUI : Consommables recommandés selon template contrat */}
                {fournisParPrestataire === true && (
                  <div>
                    <label className="block font-medium text-gray-900 mb-3">
                      Consommables recommandés
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      Cette liste figure dans nos modèles de contrats de ménage. Cochez les éléments que votre prestataire accepte de fournir.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.papier_toilette === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.papier_toilette', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">2 rouleaux de papier toilette par toilette</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.savon_mains === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.savon_mains', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">1 savon pour les mains par lavabo</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.produit_vaisselle === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.produit_vaisselle', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">1 produit vaisselle par cuisine</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.eponge_cuisine === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.eponge_cuisine', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">1 éponge par cuisine (en bon état)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.sel_poivre_sucre === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.sel_poivre_sucre', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">Sel, poivre, sucre (en quantité adéquate)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.cafe_the === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.cafe_the', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">Café et thé (1 sachet par personne)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.essuie_tout === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.essuie_tout', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">Essuie-tout/Sopalin</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.sac_poubelle === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.sac_poubelle', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">Sac poubelle</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.produit_vitres === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.produit_vitres', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">Produit vitres</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.produit_sol === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.produit_sol', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">Produit sol</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.produit_salle_bain === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.produit_salle_bain', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">Produit salle de bain/multi-surfaces ou vinaigre ménager</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.produit_wc_javel === true}
                            onChange={(e) => handleCheckboxChange('section_consommables.produit_wc_javel', e.target.checked)}
                            className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          />
                          <span className="text-sm">Produit WC / Javel</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.consommables_recommandes_autre === true}
                                onChange={(e) => handleCheckboxChange('section_consommables.consommables_recommandes_autre', e.target.checked)}
                                className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                            />
                            <span className="text-sm">Autre (précisez)</span>
                        </label>
                      </div>
                      {/* Champ conditionnel "Autre recommandé" */}
                        {formData.consommables_recommandes_autre === true && (
                        <div className="mt-3">
                            <input
                            type="text"
                            placeholder="Précisez l'autre consommable recommandé..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                            value={formData.consommables_recommandes_autre_details || ""}
                            onChange={(e) => handleInputChange('section_consommables.consommables_recommandes_autre_details', e.target.value)}
                            />
                        </div>
                    )}
                    </div>
                  </div>
                )}

                {/* Si OUI : Consommables "Sur demande" */}
                {fournisParPrestataire === true && (
                  <div>
                    <label className="block font-medium text-gray-900 mb-3">
                      Consommables "Sur demande"
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.gel_douche === true}
                          onChange={(e) => handleCheckboxChange('section_consommables.gel_douche', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <span className="text-sm">Gel douche</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.shampoing === true}
                          onChange={(e) => handleCheckboxChange('section_consommables.shampoing', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <span className="text-sm">Shampoing</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.apres_shampoing === true}
                          onChange={(e) => handleCheckboxChange('section_consommables.apres_shampoing', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <span className="text-sm">Après Shampoing</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.pastilles_lave_vaisselle === true}
                          onChange={(e) => handleCheckboxChange('section_consommables.pastilles_lave_vaisselle', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <span className="text-sm">Pastilles, sel et liquide de rinçage pour lave-vaisselle</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.autre_consommable === true}
                          onChange={(e) => handleCheckboxChange('section_consommables.autre_consommable', e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                        />
                        <span className="text-sm">Autre (précisez)</span>
                      </label>
                    </div>
                    
                    {/* Champ conditionnel "Autre" */}
                    {formData.autre_consommable === true && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Précisez l'autre consommable..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                          value={formData.autre_consommable_details || ""}
                          onChange={(e) => handleInputChange('section_consommables.autre_consommable_details', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Section Type de Café - TOUJOURS AFFICHÉE */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">
                    Consommables "Café & Cafetière"
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.cafe_nespresso === true}
                        onChange={(e) => handleCheckboxChange('section_consommables.cafe_nespresso', e.target.checked)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <span className="text-sm">Nespresso</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.cafe_senseo === true}
                        onChange={(e) => handleCheckboxChange('section_consommables.cafe_senseo', e.target.checked)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <span className="text-sm">Senseo</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.cafe_tassimo === true}
                        onChange={(e) => handleCheckboxChange('section_consommables.cafe_tassimo', e.target.checked)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <span className="text-sm">Tassimo</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.cafe_soluble === true}
                        onChange={(e) => handleCheckboxChange('section_consommables.cafe_soluble', e.target.checked)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <span className="text-sm">Café soluble</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.cafe_moulu === true}
                        onChange={(e) => handleCheckboxChange('section_consommables.cafe_moulu', e.target.checked)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <span className="text-sm">Café moulu</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.cafe_grain === true}
                        onChange={(e) => handleCheckboxChange('section_consommables.cafe_grain', e.target.checked)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <span className="text-sm">Café grain</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.cafe_autre === true}
                        onChange={(e) => handleCheckboxChange('section_consommables.cafe_autre', e.target.checked)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <span className="text-sm">Autre (précisez)</span>
                    </label>
                  </div>
                  
                  {/* Champ conditionnel "Autre café" */}
                  {formData.cafe_autre === true && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Précisez le type de café..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        value={formData.cafe_autre_details || ""}
                        onChange={(e) => handleInputChange('section_consommables.cafe_autre_details', e.target.value)}
                      />
                    </div>
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