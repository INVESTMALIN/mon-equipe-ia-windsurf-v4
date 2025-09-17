// src/components/fiche/sections/FicheSécurité.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import { useForm } from '../../FormContext'
import { cleanFormData, extractSummary, validateDataConsistency } from '../../../lib/DataProcessor'
import { Shield, FileText, Sparkles, Copy, CheckCircle, MessageSquare, Send, AlertTriangle } from 'lucide-react'

export default function FicheSécurité() {
  const navigate = useNavigate()
  const [showFinalModal, setShowFinalModal] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  const [showAnnonceAssistant, setShowAnnonceAssistant] = useState(false)
  const [annonceInput, setAnnonceInput] = useState('')
  const [annonceLoading, setAnnonceLoading] = useState(false)
  const [annonceResult, setAnnonceResult] = useState('')
  const [copiedAnnonce, setCopiedAnnonce] = useState(false)
  
  const { 
    getField,
    updateField,
    formData,
    handleSave,
    saveStatus,
    back  // Ajout de la fonction back
  } = useForm()

  const handleInputChange = (fieldPath, value) => {
    updateField(fieldPath, value)
  }

  const handleCheckboxChange = (fieldPath, checked) => {
    updateField(fieldPath, checked)
  }

  const handleArrayCheckboxChange = (fieldPath, option, checked) => {
    const currentArray = getField(fieldPath) || []
    let newArray
    if (checked) {
      newArray = [...currentArray, option]
    } else {
      newArray = currentArray.filter(item => item !== option)
      
      // Nettoyage automatique des champs liés
      if (option === 'Système d\'alarme') {
        updateField('section_securite.alarme_desarmement', '')
      }
      if (option === 'Autre (veuillez préciser)') {
        updateField('section_securite.equipements_autre_details', '')
      }
    }
    updateField(fieldPath, newArray)
  }

  // Récupération des données
  const formData_section = getField('section_securite')

  // Liste des équipements de sécurité
  const equipementsSecurite = [
    'Détecteur de fumée',
    'Détecteur de monoxyde de carbone',
    'Extincteur',
    'Trousse de premiers secours',
    'Verrou de sécurité sur la porte d\'entrée',
    'Système d\'alarme',
    'Caméras de surveillance extérieures',
    'Caméras de surveillance intérieures (uniquement dans les espaces communs)',
    'Autre (veuillez préciser)'
  ]

  // Déterminer quels équipements sont cochés
  const equipementsCoches = formData_section.equipements || []
  const systemeAlarmeSelected = equipementsCoches.includes('Système d\'alarme')
  const autreSelected = equipementsCoches.includes('Autre (veuillez préciser)')

  // Génération PDF simulée
  const handleGeneratePDF = async () => {
    // IMPORTANT: Sauvegarder avant de générer le PDF
    await handleSave()
    
    // TODO: Implémenter la vraie génération PDF avec toutes les données de la fiche
    // const pdfUrl = await generatePDFFromFormData(formData)
    
    // Simulation génération PDF
    setTimeout(() => {
      setPdfGenerated(true)
      setShowAnnonceAssistant(true) // Afficher l'assistant annonce
    }, 2000)
  }

  // Créer l'annonce via webhook n8n
  const handleCreateAnnonce = async () => {
    if (!annonceInput.trim()) return
    
    setAnnonceLoading(true)
    setAnnonceResult('')
    
    try {
      // TODO: Remplacer par le vrai webhook URL
      const webhookUrl = 'https://hub.cardin.cloud/webhook/PLACEHOLDER_ANNONCE_WEBHOOK'
      
      // Structurer les données pour l'assistant
      const requestData = {
        chatInput: annonceInput,
        sessionId: `fiche_${formData.id}_${Date.now()}`,
        ficheData: formatFicheDataForAI(formData), // Helper à créer
        // pdfUrl: pdfGeneratedUrl // Optionnel
      }
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
      
      const result = await response.json()
      setAnnonceResult(result.output || 'Annonce générée avec succès !')
      
    } catch (error) {
      console.error('Erreur création annonce:', error)
      setAnnonceResult('Erreur lors de la création de l\'annonce. Veuillez réessayer.')
    } finally {
      setAnnonceLoading(false)
    }
  }

  // Helper pour formater les données de la fiche pour l'IA
  const formatFicheDataForAI = (formData) => {
    // Utilise le DataProcessor pour nettoyer les données
    const cleanedData = cleanFormData(formData)
    const summary = extractSummary(formData)
    
    return {
      // Résumé structuré pour l'IA
      resume: summary,
      
      // Données principales nettoyées
      sections_principales: {
        logement: cleanedData.section_logement || {},
        avis: cleanedData.section_avis || {},
        equipements: cleanedData.section_equipements || {},
        securite: cleanedData.section_securite || {}
      },
      
      // Métadonnées utiles
      metadata: {
        completion: summary.stats.pourcentage_completion,
        statut: formData.statut,
        hash: Date.now() // Simple timestamp pour cette version
      }
    }
  }

  // Copier l'annonce générée
  const handleCopyAnnonce = () => {
    navigator.clipboard.writeText(annonceResult)
    setCopiedAnnonce(true)
    setTimeout(() => setCopiedAnnonce(false), 2000)
  }

  // Finaliser la fiche
  const handleFinaliser = async () => {
    // IMPORTANT: Sauvegarder avant de finaliser
    await handleSave()
    updateField('statut', 'Complété')
    setShowFinalModal(true)
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          {/* Container centré - OBLIGATOIRE */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Équipements de Sécurité</h1>
            
            {/* Carte blanche principale - OBLIGATOIRE */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône - OBLIGATOIRE */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Sécurité du Logement</h2>
                    <p className="text-gray-600">Équipements et mesures de sécurité</p>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="space-y-8">
                
                {/* Liste principale des équipements */}
                <div>
                  <label className="block font-medium text-gray-900 mb-4">
                    Équipements de sécurité disponibles :
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {equipementsSecurite.map(equipement => (
                      <label key={equipement} className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={equipementsCoches.includes(equipement)}
                          onChange={(e) => handleArrayCheckboxChange('section_securite.equipements', equipement, e.target.checked)}
                          className="w-4 h-4 text-[#dbae61] border-gray-300 rounded focus:ring-[#dbae61] mt-0.5"
                        />
                        <span className="text-sm text-gray-700">{equipement}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SECTION CONDITIONNELLE : SYSTÈME D'ALARME */}
                {systemeAlarmeSelected && (
                  <div className="border-l-4 border-red-500 pl-6 bg-red-50 p-6 rounded-r-lg space-y-6">
                    <h3 className="text-lg font-semibold text-red-700">Système d'alarme</h3>
                    
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Précisez comment désarmer le système d'alarme (seulement si nécessaire pour entrer dans le logement) *
                      </label>
                      <textarea
                        placeholder="Rédigez un descriptif précis pour permettre de désarmer l'alarme si nécessaire pour entrer dans le logement."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                        rows={4}
                        value={formData_section.alarme_desarmement || ''}
                        onChange={(e) => handleInputChange('section_securite.alarme_desarmement', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* SECTION CONDITIONNELLE : AUTRE */}
                {autreSelected && (
                  <div className="border-l-4 border-gray-500 pl-6 bg-gray-50 p-6 rounded-r-lg space-y-6">
                    <h3 className="text-lg font-semibold text-gray-700">Autre équipement</h3>
                    
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Veuillez préciser :</label>
                      <input
                        type="text"
                        placeholder="Décrivez l'équipement de sécurité supplémentaire"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        value={formData_section.equipements_autre_details || ''}
                        onChange={(e) => handleInputChange('section_securite.equipements_autre_details', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* RAPPELS PHOTOS (visible si au moins un équipement coché) */}
                {equipementsCoches.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="photos_equipements_securite_taken"
                        checked={formData_section.photos_rappels?.photos_equipements_securite_taken || false}
                        onChange={(e) => handleInputChange('section_securite.photos_rappels.photos_equipements_securite_taken', e.target.checked)}
                        className="h-4 w-4 text-[#dbae61] focus:ring-[#dbae61] rounded"
                      />
                      <label htmlFor="photos_equipements_securite_taken" className="text-sm text-yellow-800">
                        📸 Pensez à prendre des photos de tous les équipements de sécurité
                      </label>
                    </div>
                  </div>
                )}

                {/* SECTION FINALISATION */}
                <div className="border-t pt-8 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Finalisation de l'inspection</h3>
                  
                  {/* Génération PDF */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleGeneratePDF}
                      disabled={pdfGenerated}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        pdfGenerated 
                          ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      {pdfGenerated ? 'PDF Généré ✓' : 'Générer la Fiche Logement (PDF)'}
                    </button>
                    
                    <button
                      onClick={handleFinaliser}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Finaliser la fiche
                    </button>
                  </div>

                  {/* Assistant Annonce - Section qui slide après génération PDF */}
                  {showAnnonceAssistant && (
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mt-6 animate-slide-down">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Assistant Création d'Annonce</h4>
                          <p className="text-sm text-gray-600">Générez votre annonce personnalisée basée sur votre inspection</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Zone de saisie */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Que souhaitez-vous mettre en avant dans votre annonce ?
                          </label>
                          <textarea
                            placeholder="Ex: Créez-moi une annonce attractive pour ce logement en mettant l'accent sur le confort et la sécurité..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                            rows={3}
                            value={annonceInput}
                            onChange={(e) => setAnnonceInput(e.target.value)}
                          />
                        </div>

                        {/* Bouton génération */}
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            L'assistant analysera automatiquement toutes les données de votre inspection
                          </p>
                          <button
                            onClick={handleCreateAnnonce}
                            disabled={!annonceInput.trim() || annonceLoading}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                              !annonceInput.trim() || annonceLoading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            {annonceLoading ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Génération...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Créer l'annonce
                              </>
                            )}
                          </button>
                        </div>

                        {/* Résultat de l'annonce */}
                        {annonceResult && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900">Votre annonce générée :</h5>
                              <button
                                onClick={handleCopyAnnonce}
                                className="flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors"
                              >
                                {copiedAnnonce ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm">Copié !</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    <span className="text-sm">Copier</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-sm text-gray-700">{annonceResult}</pre>
                            </div>
                          </div>
                        )}

                        {/* Preview des données intelligent */}
                        <details className="bg-white border border-gray-200 rounded-lg">
                          <summary className="cursor-pointer hover:bg-gray-50 p-4 font-medium text-gray-700">
                            📊 Aperçu des données structurées pour l'assistant
                          </summary>
                          <div className="p-4 border-t border-gray-200">
                            {(() => {
                              const summary = extractSummary(formData)
                              const validation = validateDataConsistency(formData)
                              
                              return (
                                <div className="space-y-6">
                                  {/* Validation et alertes */}
                                  {!validation.isValid && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                                        <span className="font-medium text-orange-800">Points d'attention détectés</span>
                                      </div>
                                      <ul className="text-sm text-orange-700 space-y-1">
                                        {validation.issues.map((issue, index) => (
                                          <li key={index}>• {issue}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* Résumé du logement */}
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Résumé du logement</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium">Type:</span> {summary.logement.type || 'Non renseigné'}
                                        </div>
                                        <div>
                                          <span className="font-medium">Surface:</span> {summary.logement.surface || 'Non renseigné'}
                                        </div>
                                        <div>
                                          <span className="font-medium">Capacité:</span> {summary.logement.capacite || 'Non renseigné'}
                                        </div>
                                        <div>
                                          <span className="font-medium">Lits:</span> {summary.logement.nombre_lits || 'Non renseigné'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Atouts principaux */}
                                  {summary.atouts_principaux.length > 0 && (
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-3">Atouts identifiés</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {summary.atouts_principaux.map((atout, index) => (
                                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                            {atout}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Équipements notables */}
                                  {summary.equipements_cles.length > 0 && (
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-3">Équipements clés</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {summary.equipements_cles.map((equipement, index) => (
                                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {equipement}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Stats de completion */}
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Progression de l'inspection</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Sections remplies</span>
                                        <span className="font-medium">{summary.stats.sections_remplies}/{summary.stats.total_sections}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${summary.stats.pourcentage_completion}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {summary.stats.pourcentage_completion}% complété
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Données techniques (accordéon dans l'accordéon) */}
                                  <details className="bg-gray-50 rounded-lg">
                                    <summary className="cursor-pointer p-3 text-sm text-gray-600 hover:text-gray-800">
                                      🔧 Données techniques envoyées à l'IA
                                    </summary>
                                    <div className="p-3 border-t border-gray-200">
                                      <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                                        {JSON.stringify(formatFicheDataForAI(formData), null, 2)}
                                      </pre>
                                    </div>
                                  </details>
                                </div>
                              )
                            })()}
                          </div>
                        </details>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Navigation personnalisée pour la dernière page */}
              <div className="pt-8 mt-8 border-t">
                <div className="flex justify-between">
                  <button
                    onClick={back}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    ← Retour
                  </button>
                  
                  <button
                    onClick={handleSave}
                    disabled={saveStatus.saving}
                    className="px-6 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg font-medium transition-all"
                  >
                    {saveStatus.saving ? 'Sauvegarde...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE FINALISATION */}
      {showFinalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 text-center">
            <div className="mb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Fiche finalisée avec succès !
              </h2>
              <p className="text-gray-600">
                La fiche "<strong>{formData.nom}</strong>" a été marquée comme complétée.
              </p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setShowFinalModal(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Continuer
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg font-medium transition-all"
              >
                Retour Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}