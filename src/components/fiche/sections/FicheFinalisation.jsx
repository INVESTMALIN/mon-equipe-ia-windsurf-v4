// src/components/fiche/sections/FicheFinalisation.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import MiniDashboard from '../MiniDashboard'
import { useForm } from '../../FormContext'
import { cleanFormData, extractSummary, validateDataConsistency } from '../../../lib/DataProcessor'
import { formatForPdf, prepareForN8nWebhook, generatePdfTitle } from '../../../lib/PdfFormatter'
import { CheckCircle, FileText, MessageSquare, Send, Copy, Sparkles } from 'lucide-react'

export default function FicheFinalisation() {
  const navigate = useNavigate()
  const [showFinalModal, setShowFinalModal] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showAnnonceAssistant, setShowAnnonceAssistant] = useState(false)
  const [annonceInput, setAnnonceInput] = useState('')
  const [annonceLoading, setAnnonceLoading] = useState(false)
  const [annonceResult, setAnnonceResult] = useState('')
  const [copiedAnnonce, setCopiedAnnonce] = useState(false)
  
  const { 
    formData,
    handleSave,
    saveStatus,
    back,
    updateField
  } = useForm()

  // 🔥 Génération PDF avec PdfFormatter
  const handleGeneratePDF = async () => {
    try {
      setPdfLoading(true)
      
      // Sauvegarder avant génération
      await handleSave()
      
      // Formater les données pour PDF
      const webhookData = prepareForN8nWebhook(formData)
      
      // Debug - Afficher la structure
      console.log('📤 Données envoyées au webhook n8n:', webhookData)
      
      // TODO: Remplacer par le vrai appel webhook n8n de Kévin
      // Simulation d'appel webhook (à remplacer)
      setTimeout(() => {
        setPdfGenerated(true)
        setShowAnnonceAssistant(true) // Afficher l'assistant après PDF généré
        setPdfLoading(false)
      }, 2000)
      
      // Appel réel webhook (à décommenter quand prêt)
      /*
      const response = await fetch('URL_WEBHOOK_KEVIN', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      })
      
      if (response.ok) {
        setPdfGenerated(true)
        setShowAnnonceAssistant(true)
      } else {
        throw new Error('Erreur génération PDF')
      }
      */
      
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    } finally {
      setPdfLoading(false)
    }
  }

  // Assistant Annonce
  const handleCreateAnnonce = async () => {
    try {
      setAnnonceLoading(true)
      
      const annoncePrompt = annonceInput || "Créez une annonce attractive pour ce logement basée sur l'inspection réalisée"
      const ficheDataForAI = prepareForN8nWebhook(formData)
      
      const requestBody = {
        chatInput: annoncePrompt,
        sessionId: `annonce_${Date.now()}`,
        ficheData: ficheDataForAI
      }
      
      const response = await fetch('https://hub.cardin.cloud/webhook/assistant-annonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (response.ok) {
        const result = await response.text()
        setAnnonceResult(result)
      } else {
        throw new Error('Erreur serveur')
      }
    } catch (error) {
      console.error('Erreur création annonce:', error)
      setAnnonceResult('Erreur lors de la création de l\'annonce. Veuillez réessayer.')
    } finally {
      setAnnonceLoading(false)
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
          {/* Messages sauvegarde */}
          {saveStatus.saving && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              ⏳ Sauvegarde en cours...
            </div>
          )}
          {saveStatus.saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              ✅ Sauvegardé avec succès !
            </div>
          )}
          {saveStatus.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              ❌ {saveStatus.error}
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Finalisation de l'inspection</h1>

            {/* 🔥 MINI DASHBOARD - Aperçu + Alertes */}
            <MiniDashboard formData={formData} />

            {/* GÉNÉRATION PDF ET OUTILS */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-8">
              
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Outils de finalisation</h2>
                    <p className="text-gray-600">Générez votre PDF et créez vos annonces</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Génération PDF */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📄 Fiche logement PDF</h3>
                  <p className="text-gray-600 mb-4">
                    Générez une fiche d'inspection professionnelle au format PDF
                  </p>
                  
                  <button
                    onClick={handleGeneratePDF}
                    disabled={pdfGenerated || pdfLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      pdfGenerated 
                        ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                        : pdfLoading
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    {pdfLoading ? 'Génération en cours...' : pdfGenerated ? 'PDF Généré ✓' : 'Générer la Fiche Logement (PDF)'}
                  </button>
                </div>

                {/* Assistant Annonce */}
                {showAnnonceAssistant && (
                  <div className="border border-purple-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">✨ Assistant Création d'Annonce</h3>
                        <p className="text-sm text-gray-600">Générez votre annonce personnalisée basée sur votre inspection</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Que souhaitez-vous mettre en avant dans votre annonce ?
                        </label>
                        <textarea
                          value={annonceInput}
                          onChange={(e) => setAnnonceInput(e.target.value)}
                          placeholder="Ex: 'Créez une annonce Airbnb qui met en avant la vue, la proximité des transports et le confort...'"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                      
                      <button
                        onClick={handleCreateAnnonce}
                        disabled={annonceLoading}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                          annonceLoading 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        {annonceLoading ? 'Génération en cours...' : 'Générer l\'annonce'}
                      </button>

                      {annonceResult && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">🎯 Annonce générée</h4>
                            <button
                              onClick={handleCopyAnnonce}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-white hover:bg-gray-100 rounded-lg transition-colors border"
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
                          <div className="bg-white rounded-lg p-4 border max-h-64 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700">{annonceResult}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* NAVIGATION FINALE - Style Letahost */}
              <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                <button
                  onClick={back}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  ← Retour
                </button>
                
                <div className="flex gap-3">
                  {/* Bouton Enregistrer - Style doré vide */}
                  <button
                    onClick={handleSave}
                    disabled={saveStatus.saving}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-[#dbae61] text-[#dbae61] hover:bg-[#dbae61] hover:text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    {saveStatus.saving ? 'Sauvegarde...' : 'Enregistrer'}
                  </button>
                  
                  {/* Bouton Finaliser - Style doré plein */}
                  <button
                    onClick={handleFinaliser}
                    className="flex items-center gap-2 px-6 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg font-medium transition-all"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Finaliser la fiche
                  </button>
                </div>
              </div>

              {/* Accordéon technique TRÈS discret */}
              <details className="mt-8 border-t border-gray-100 pt-4">
                <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  🔧 Données techniques de la fiche
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded border text-xs">
                  <pre className="text-gray-600 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify({
                      statut: formData.statut,
                      sections_remplies: Object.keys(formData).filter(key => 
                        key.startsWith('section_') && 
                        formData[key] && 
                        typeof formData[key] === 'object' && 
                        Object.keys(formData[key]).length > 0
                      ).length,
                      last_update: formData.updated_at,
                      pdf_title: generatePdfTitle(formData)
                    }, null, 2)}
                  </pre>
                </div>
              </details>
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
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg font-medium transition-all"
              >
                Retour au Dashboard
              </button>
              <button
                onClick={() => setShowFinalModal(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg font-medium transition-all"
              >
                Continuer l'édition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}