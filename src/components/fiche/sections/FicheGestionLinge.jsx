// src/components/fiche/sections/FicheGestionLinge.jsx
import { useState } from 'react'
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Package } from 'lucide-react'

const getChampsParType = (typeAccordeon) => {
  const champsLits = [
    'couettes', 'oreillers', 'draps_housses', 'housses_couette', 
    'protections_matelas', 'taies_oreillers'
  ]
  
  const champsMaison = [
    'draps_bain', 'petites_serviettes', 'tapis_bain', 
    'torchons', 'plaids', 'oreillers_decoratifs'
  ]
  
  // Si c'est un accordéon de lit (90x200, 140x200, etc.)
  if (typeAccordeon.includes('x200')) {
    return champsLits
  }
  
  // Si c'est l'accordéon "autres"
  if (typeAccordeon === 'autres') {
    return champsMaison
  }
  
  // Fallback (ne devrait pas arriver)
  return []
}

// Helper pour les labels des types de linge
const getLingeLabel = (key) => {
  const labels = {
    couettes: "Couettes",
    oreillers: "Oreillers", 
    draps_housses: "Draps housses (plats)",
    housses_couette: "Housses de couette",
    protections_matelas: "Protections matelas / Alaises",
    taies_oreillers: "Taies d'oreillers",
    draps_bain: "Grandes serviettes (par logement)",
    petites_serviettes: "Petites serviette (par logement)",
    tapis_bain: "Tapis de bain (par logement)",
    torchons: "Torchons (par logement)",
    plaids: "Plaids",
    oreillers_decoratifs: "Oreillers décoratifs"
  }
  return labels[key] || key
}

// Composant pour une section d'inventaire
const InventaireSection = ({ taille, titre, dataKey, formData, handleInputChange, openSections, toggleSection, getLingeLabel }) => {
  const inventaireData = formData[dataKey] || {}
  const isOpen = openSections[taille]
  
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => toggleSection(taille)}
        className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg font-semibold flex justify-between items-center transition-colors"
      >
        <span>{titre}</span>
        <span className="text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {getChampsParType(taille).map((typeLingeKey) => {
            const typeLingeLabel = getLingeLabel(typeLingeKey)
            return (
              <div key={typeLingeKey}>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  {typeLingeLabel}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  value={inventaireData[typeLingeKey] || ""}
                  onChange={(e) => handleInputChange(`section_gestion_linge.${dataKey}.${typeLingeKey}`, e.target.value)}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function FicheGestionLinge() {
  const { 
    getField,
    updateField
  } = useForm()

  // État pour les sections collapsibles
  const [openSections, setOpenSections] = useState({
    '90x200': false,
    '140x200': false,
    '160x200': false,
    '180x200': false,
    'autres': false
  })

  // Récupération des données de la section
  const formData = getField('section_gestion_linge') || {}
  const disposeDeLingeData = formData.dispose_de_linge

  // Handler pour champs simples
  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  // Handler pour toggle sections
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Gestion du linge</h1>
            
            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Inventaire du linge</h2>
                    <p className="text-gray-600">Répertoriez le linge disponible dans le logement</p>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="space-y-8">
                
                {/* Question principale */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">
                    Le logement dispose-t-il de linge ? *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dispose_de_linge"
                        checked={disposeDeLingeData === true}
                        onChange={() => handleInputChange('section_gestion_linge.dispose_de_linge', true)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dispose_de_linge"
                        checked={disposeDeLingeData === false}
                        onChange={() => handleInputChange('section_gestion_linge.dispose_de_linge', false)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Non</span>
                    </label>
                  </div>
                </div>

                {/* Sections conditionnelles si OUI */}
                {disposeDeLingeData === true && (
                  <>
                    {/* Inventaire par tailles - Sections collapsibles */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        Inventaire - Veuillez indiquer les quantités par taille de lit
                      </h3>
                      <div className="space-y-3">
                        <InventaireSection 
                          taille="90x200" 
                          titre="90x200 (lit simple)" 
                          dataKey="inventaire_90x200"
                          formData={formData}
                          handleInputChange={handleInputChange}
                          openSections={openSections}
                          toggleSection={toggleSection}
                          getLingeLabel={getLingeLabel}
                        />
                        <InventaireSection 
                          taille="140x200" 
                          titre="140x200 (lit standard)" 
                          dataKey="inventaire_140x200"
                          formData={formData}
                          handleInputChange={handleInputChange}
                          openSections={openSections}
                          toggleSection={toggleSection}
                          getLingeLabel={getLingeLabel}
                        />
                        <InventaireSection 
                          taille="160x200" 
                          titre="160x200 (lit queen size)" 
                          dataKey="inventaire_160x200"
                          formData={formData}
                          handleInputChange={handleInputChange}
                          openSections={openSections}
                          toggleSection={toggleSection}
                          getLingeLabel={getLingeLabel}
                        />
                        <InventaireSection 
                          taille="180x200" 
                          titre="180x200 (lit king size)" 
                          dataKey="inventaire_180x200"
                          formData={formData}
                          handleInputChange={handleInputChange}
                          openSections={openSections}
                          toggleSection={toggleSection}
                          getLingeLabel={getLingeLabel}
                        />
                        <InventaireSection 
                          taille="autres" 
                          titre="Autres ou hors catégorie (serviettes, oreillers, taies, torchons etc)" 
                          dataKey="inventaire_autres"
                          formData={formData}
                          handleInputChange={handleInputChange}
                          openSections={openSections}
                          toggleSection={toggleSection}
                          getLingeLabel={getLingeLabel}
                        />
                      </div>
                    </div>

                    {/* État du linge */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-3">État du linge</label>
                      <div className="grid grid-cols-1 gap-3 max-w-md">
                        {[
                          { key: 'etat_neuf', label: 'Neuf' },
                          { key: 'etat_usage', label: 'Usagé' },
                          { key: 'etat_propre', label: 'Propre' },
                          { key: 'etat_sale', label: 'Sale' },
                          { key: 'etat_tache', label: 'Taché (taches incrustées mais propre)' }
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                            <input 
                              type="checkbox"
                              checked={formData[key] === true}
                              onChange={(e) => handleInputChange(`section_gestion_linge.${key}`, e.target.checked)}
                              className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Informations supplémentaires sur l'état */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        État du linge - Informations supplémentaires sur l'état et/ou sur le linge manquant
                      </label>
                      <textarea 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                        placeholder="Décrivez l'état général du linge, les éléments manquants, les remplacements nécessaires..."
                        value={formData.etat_informations || ""}
                        onChange={(e) => handleInputChange('section_gestion_linge.etat_informations', e.target.value)}
                      />
                    </div>

                    {/* Rappel photos du linge (VERSION LITE) */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="linge_photo_taken"
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          checked={getField('section_gestion_linge.photos_rappels.linge_taken') || false}
                          onChange={(e) => handleInputChange('section_gestion_linge.photos_rappels.linge_taken', e.target.checked)}
                        />
                        <label htmlFor="linge_photo_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre des photos du linge
                        </label>
                      </div>
                    </div>

                    {/* Emplacement du stock - Description */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Linge - Emplacement du stock - Description
                      </label>
                      <textarea 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all h-24"
                        placeholder="Décrivez précisément où se situe le stock de linge dans le logement. Combien-y-a-t-il de stockage dans le logement ? Supplément de certaines choses..."
                        value={formData.emplacement_description || ""}
                        onChange={(e) => handleInputChange('section_gestion_linge.emplacement_description', e.target.value)}
                      />
                    </div>

                    {/* Rappel photos emplacement (VERSION LITE) */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="emplacement_photo_taken"
                          className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                          checked={getField('section_gestion_linge.photos_rappels.emplacement_taken') || false}
                          onChange={(e) => handleInputChange('section_gestion_linge.photos_rappels.emplacement_taken', e.target.checked)}
                        />
                        <label htmlFor="emplacement_photo_taken" className="text-sm text-yellow-800">
                          📸 Pensez à prendre des photos de l'emplacement du stock
                        </label>
                      </div>
                    </div>

                    {/* Code du cadenas */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Linge - Emplacement du stock - Code du cadenas, de la malle ou emplacement de la clé ? *
                      </label>
                      <input 
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        placeholder="Précisez ici le code ou l'emplacement de la clé."
                        value={formData.emplacement_code_cadenas || ""}
                        onChange={(e) => handleInputChange('section_gestion_linge.emplacement_code_cadenas', e.target.value)}
                      />
                    </div>
                  </>
                )}

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