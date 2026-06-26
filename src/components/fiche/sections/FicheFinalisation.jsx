// src/components/fiche/sections/FicheFinalisation.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import MiniDashboard from '../MiniDashboard'
import { useForm } from '../../FormContext'
import { cleanFormData, extractSummary, validateDataConsistency } from '../../../lib/DataProcessor'
import { formatForPdf, prepareForN8nWebhook, generatePdfTitle } from '../../../lib/PdfFormatter'
import { CheckCircle, FileText, PenTool, MessageSquare, Send, Copy, Sparkles, Bot, Save, Wand2, Download, RefreshCw } from 'lucide-react'
import { generatePdfClientSide } from '../../../lib/PdfBuilder'
import { generateAnnoncePdf } from '../../../lib/annoncePdf'
import { supabase } from '../../../supabaseClient'
import useProgressiveLoading from '../../../hooks/useProgressiveLoading'

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
  const [chatMessages, setChatMessages] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const { currentMessage, currentIcon: LoadingIcon, dots } = useProgressiveLoading(annonceLoading, false)

  // ─── Agent annonce (moteur Edge Function annonce-generate) ───
  // Génération + régénération + PDF. Distinct de l'assistant n8n ci-dessous
  // (conservé en parallèle). Sortie assemblée stockée par plateforme.
  const [agentPlateforme, setAgentPlateforme] = useState('airbnb')
  const [agentLoading, setAgentLoading] = useState(false)
  const [agentOutput, setAgentOutput] = useState(null)
  const [agentError, setAgentError] = useState('')

  const quickPrompts = [
    {
      label: "Créer une annonce attractive",
      prompt: "Créez une annonce attractive pour ce logement basée sur l'inspection réalisée",
      icon: "✨"
    },
    {
      label: "Version courte Airbnb",
      prompt: "Créez une annonce courte et percutante pour Airbnb, mettant en avant les points forts",
      icon: "🏠"
    },
    {
      label: "Mettre en avant les équipements",
      prompt: "Réécris l'annonce en mettant l'accent sur les équipements et commodités disponibles",
      icon: "⚡"
    },
    {
      label: "Plus professionnelle",
      prompt: "Transforme cette description en version plus professionnelle pour agence immobilière",
      icon: "💼"
    },
    {
      label: "Ajouter des détails pratiques",
      prompt: "Enrichis l'annonce avec des détails pratiques sur l'accès, le quartier et les transports",
      icon: "📍"
    }
  ]

  const {
    formData,
    handleSave,
    saveStatus,
    back,
    updateField,
    finaliserFiche
  } = useForm()

  // Génère (ou régénère) l'annonce via l'Edge Function annonce-generate.
  // Le bouton est désactivé pendant l'appel → pas de double-clic (évite la
  // concurrence sur la même fiche × plateforme).
  const handleGenerateAgent = async () => {
    if (agentLoading) return
    const ficheId = formData?.id
    if (!ficheId) {
      setAgentError("Enregistrez d'abord la fiche avant de générer l'annonce.")
      return
    }
    setAgentLoading(true)
    setAgentError('')
    try {
      // On sauvegarde d'abord : le moteur lit la fiche_lite côté serveur.
      // handleSave() ne lève pas, il renvoie { success }. Si la sauvegarde
      // échoue, on ANNULE : sinon le moteur générerait depuis une fiche périmée
      // (ancienne ligne encore lisible) tout en affichant le résultat comme à jour.
      const saveRes = await handleSave()
      if (!saveRes?.success) {
        setAgentError(`Sauvegarde de la fiche échouée (${saveRes?.error || 'erreur inconnue'}). Génération annulée.`)
        return
      }

      const { data, error } = await supabase.functions.invoke('annonce-generate', {
        body: { ficheId, plateforme: agentPlateforme },
      })

      if (error) {
        // FunctionsHttpError : le corps porte le message métier (502 = modèle, etc.).
        let message = error.message || 'Échec de la génération.'
        try {
          const body = await error.context?.json?.()
          if (body?.message || body?.error) message = body.message || body.error
        } catch { /* corps illisible : on garde le message générique */ }
        setAgentError(message)
        return
      }
      if (!data?.success || !data?.output_assemble) {
        setAgentError(data?.message || "La génération n'a pas produit de sortie exploitable.")
        return
      }
      setAgentOutput(data.output_assemble)
    } catch (e) {
      setAgentError(e?.message || 'Erreur réseau pendant la génération.')
    } finally {
      setAgentLoading(false)
    }
  }

  // Change de plateforme : la sortie est propre à une plateforme → on la vide.
  const handleSwitchPlateforme = (p) => {
    if (p === agentPlateforme) return
    setAgentPlateforme(p)
    setAgentOutput(null)
    setAgentError('')
  }

  const handleDownloadAnnoncePdf = () => {
    if (!agentOutput) return
    try {
      generateAnnoncePdf(agentOutput, agentPlateforme, formData?.nom)
    } catch (e) {
      setAgentError(e?.message || 'Erreur lors de la génération du PDF.')
    }
  }

  const handleGeneratePDF = async () => {
    try {
      setPdfLoading(true)

      // Sauvegarder avant génération
      await handleSave()

      // Générer le PDF côté client
      generatePdfClientSide(formData)

      setPdfGenerated(true)
      setShowAnnonceAssistant(true)

    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    } finally {
      setPdfLoading(false)
    }
  }

  const annonceSessionIdRef = useRef(null)

  // ✅ AJOUTER dans useEffect d'initialisation
  useEffect(() => {
    // SessionId stable basé sur la fiche, pas sur le timestamp
    if (!annonceSessionIdRef.current && formData) {
      const ficheId = formData.id || formData.nom || 'nouvelle_fiche'
      const slug = String(ficheId).toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '')
      annonceSessionIdRef.current = `fiche_${slug}_annonce`

      // 🔥 AJOUT MINIMAL - DEBUG
      const ficheDataForAI = prepareForN8nWebhook(formData)
      console.log('ficheDataForAI:', ficheDataForAI)
    }
  }, [formData])

  // ✅ MODIFIER la fonction handleCreateAnnonce
  const handleCreateAnnonce = async () => {
    if (!annonceSessionIdRef.current) return

    try {
      setAnnonceLoading(true)

      const annoncePrompt = annonceInput || "Créez une annonce attractive pour ce logement basée sur l'inspection réalisée"
      const ficheDataForAI = prepareForN8nWebhook(formData)

      const requestBody = {
        chatInput: annoncePrompt,
        sessionId: annonceSessionIdRef.current,
        ficheData: ficheDataForAI
      }

      // ✅ AbortController + timeout + error handling complet
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 120000)

      const response = await fetch('https://hub.cardin.cloud/webhook/00297790-8d18-44ff-b1ce-61b8980d9a46/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!response.ok) {
        let errorMsg = ''
        try {
          errorMsg = await response.text()
        } catch (e) {
          // Ignore l'erreur de lecture du texte
        }
        throw new Error(`HTTP ${response.status}${errorMsg ? ` - ${errorMsg.slice(0, 200)}` : ''}`)
      }

      let data
      try {
        data = await response.json()
      } catch (e) {
        throw new Error('Réponse invalide du serveur (format JSON)')
      }

      setAnnonceResult(data.output || 'Réponse indisponible.')

    } catch (error) {
      console.error('Erreur création annonce:', error)

      // ✅ Messages d'erreur user-friendly
      let errorMessage = 'Erreur lors de la création de l\'annonce. Veuillez réessayer.'

      if (error.name === 'AbortError') {
        errorMessage = 'La génération a pris trop de temps. Vérifiez votre connexion et réessayez.'
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.'
      } else if (error.message?.includes('HTTP 500') || error.message?.includes('HTTP 502') || error.message?.includes('HTTP 503')) {
        errorMessage = 'Service temporairement indisponible. Merci de réessayer dans quelques instants.'
      }

      setAnnonceResult(errorMessage)
    } finally {
      setAnnonceLoading(false)
    }
  }

  // Copier l'annonce générée
  const handleCopyAnnonce = () => {
    navigator.clipboard.writeText(annonceResult)
      .then(() => {
        setCopiedAnnonce(true)
        setTimeout(() => setCopiedAnnonce(false), 2000)
      })
      .catch(() => {
        // Fail silencieux si pas de permissions clipboard
        // L'utilisateur peut toujours sélectionner et copier manuellement
      })
  }

  // Finaliser la fiche
  const handleFinaliser = async () => {
    const result = await finaliserFiche()
    if (result.success) {
      setShowFinalModal(true)
    } else {
      alert('Erreur lors de la finalisation : ' + (result.error || 'inconnue'))
    }
  }

  const handleQuickPrompt = async (prompt) => {
    setCurrentInput(prompt)
    await sendMessage(prompt)
  }

  const sendMessage = async (message) => {
    if (!message.trim()) return
    // DEBUG - AJOUTE CES 3 LIGNES
    console.log('sessionId:', annonceSessionIdRef.current)
    console.log('formData:', formData)

    // Ajouter le message utilisateur
    const userMessage = { type: 'user', content: message, timestamp: Date.now() }
    setChatMessages(prev => [...prev, userMessage])
    setCurrentInput('')

    try {
      setAnnonceLoading(true)

      const ficheDataForAI = prepareForN8nWebhook(formData)
      console.log('ficheDataForAI:', ficheDataForAI)

      const requestBody = {
        chatInput: message,
        sessionId: annonceSessionIdRef.current,
        ficheData: ficheDataForAI
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 120000)

      const response = await fetch('https://hub.cardin.cloud/webhook/00297790-8d18-44ff-b1ce-61b8980d9a46/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      console.log('Response data:', data)
      const botMessage = {
        type: 'bot',
        content: data.output || 'Réponse indisponible.',
        timestamp: Date.now()
      }

      setChatMessages(prev => [...prev, botMessage])

    } catch (error) {
      console.error('Erreur création annonce:', error)
      const errorMessage = {
        type: 'bot',
        content: 'Erreur lors de la génération. Merci de réessayer.',
        timestamp: Date.now()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setAnnonceLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(currentInput)
    }
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
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
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
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${pdfGenerated
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

                {/* Agent Annonce — moteur automatique (Edge Function) */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
                      <Wand2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Agent Annonce — génération automatique</h3>
                      <p className="text-sm text-gray-600">Génère l'annonce à partir de la fiche, puis téléchargez le PDF</p>
                    </div>
                  </div>

                  {/* Choix plateforme */}
                  <div className="inline-flex rounded-lg border border-gray-200 p-1 mb-4 bg-gray-50">
                    {[
                      { key: 'airbnb', label: 'Airbnb' },
                      { key: 'booking', label: 'Booking' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => handleSwitchPlateforme(key)}
                        disabled={agentLoading}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                          agentPlateforme === key ? 'bg-[#dbae61] text-white' : 'text-gray-700 hover:bg-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Boutons générer / télécharger */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleGenerateAgent}
                      disabled={agentLoading}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        agentLoading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#dbae61] hover:bg-[#c49a4f] text-white'
                      }`}
                    >
                      {agentLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Génération en cours...
                        </>
                      ) : agentOutput ? (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          Régénérer l'annonce {agentPlateforme === 'airbnb' ? 'Airbnb' : 'Booking'}
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          Générer l'annonce {agentPlateforme === 'airbnb' ? 'Airbnb' : 'Booking'}
                        </>
                      )}
                    </button>

                    {agentOutput && (
                      <button
                        onClick={handleDownloadAnnoncePdf}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium border-2 border-[#dbae61] text-[#dbae61] hover:bg-[#dbae61] hover:text-white transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Télécharger le PDF
                      </button>
                    )}
                  </div>

                  {/* Erreur */}
                  {agentError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      ❌ {agentError}
                    </div>
                  )}

                  {/* Aperçu de la sortie */}
                  {agentOutput && (
                    <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 space-y-3">
                      {agentPlateforme === 'airbnb' ? (
                        <>
                          {Array.isArray(agentOutput.airbnb?.titres) && agentOutput.airbnb.titres.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Titres proposés</p>
                              <ol className="list-decimal list-inside space-y-0.5">
                                {agentOutput.airbnb.titres.map((t, i) => <li key={i}>{t}</li>)}
                              </ol>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Description</p>
                            <p className="whitespace-pre-wrap">{agentOutput.airbnb?.description}</p>
                          </div>
                          {agentOutput.airbnb?.quartier && (
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Le quartier</p>
                              <p className="whitespace-pre-wrap">{agentOutput.airbnb.quartier}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Nom de l'hébergement</p>
                            <p>{agentOutput.booking?.nom}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">À propos du logement</p>
                            <p className="whitespace-pre-wrap">{agentOutput.booking?.about_property}</p>
                          </div>
                          {agentOutput.booking?.about_neighbourhood && (
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">À propos du quartier</p>
                              <p className="whitespace-pre-wrap">{agentOutput.booking.about_neighbourhood}</p>
                            </div>
                          )}
                        </>
                      )}
                      <p className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                        Aperçu partiel — le PDF contient l'annonce complète (mentions réglementaires, notes, etc.).
                      </p>
                    </div>
                  )}
                </div>

                {/* Assistant Annonce */}
                {showAnnonceAssistant && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <PenTool className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Assistant Annonce</h3>
                        <p className="text-sm text-gray-600">Générez et affinez votre annonce</p>
                      </div>
                    </div>

                    {/* Boutons de prompts rapides */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-3">Suggestions rapides :</p>
                      <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickPrompt(prompt.prompt)}
                            disabled={annonceLoading}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 border"
                          >
                            <span>{prompt.icon}</span>
                            <span>{prompt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Zone de chat */}
                    <div className="space-y-4">
                      {/* Messages */}
                      {chatMessages.length > 0 && (
                        <div className="max-h-80 overflow-y-auto space-y-3 bg-gray-50 rounded-lg p-4">
                          {chatMessages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] ${msg.type === 'user'
                                  ? 'bg-purple-600 text-white rounded-lg'
                                  : 'bg-white border shadow-sm text-gray-900 rounded-lg'
                                }`}>
                                <div className="p-3 text-sm whitespace-pre-wrap">{msg.content}</div>

                                {/* Bouton copier uniquement pour les réponses bot */}
                                {msg.type === 'bot' && (
                                  <div className="px-3 pb-2 border-t border-gray-100">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(msg.content)
                                        setCopiedAnnonce(true)
                                        setTimeout(() => setCopiedAnnonce(false), 2000)
                                      }}
                                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors mt-2"
                                    >
                                      <Copy className="w-3 h-3" />
                                      {copiedAnnonce ? 'Copié !' : 'Copier'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {annonceLoading && (
                            <div className="flex justify-start">
                              <div className="bg-white border shadow-sm rounded-lg p-3 max-w-[80%]">
                                <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
                                  <LoadingIcon className="w-4 h-4 text-purple-600" />
                                  <span>{currentMessage}{dots}</span>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                      {/* Zone de saisie */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentInput}
                          onChange={(e) => setCurrentInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Demandez une modification ou posez une question..."
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          disabled={annonceLoading}
                        />
                        <button
                          onClick={() => sendMessage(currentInput)}
                          disabled={annonceLoading || !currentInput.trim()}
                          className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${annonceLoading || !currentInput.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Feedback sauvegarde */}
              {saveStatus.saving && (
                <div className="mt-8 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  ⏳ Sauvegarde en cours...
                </div>
              )}
              {saveStatus.saved && (
                <div className="mt-8 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✅ Sauvegardé avec succès !
                </div>
              )}
              {saveStatus.error && (
                <div className="mt-8 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  ❌ {saveStatus.error}
                </div>
              )}

              {/* NAVIGATION FINALE - Style Letahost */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-8 mt-4 border-t border-gray-200">
                <button
                  onClick={back}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  ← Retour
                </button>

                <div className="flex gap-3">
                  {/* Bouton Enregistrer - icône seule sur mobile */}
                  <button
                    onClick={handleSave}
                    disabled={saveStatus.saving}
                    title={saveStatus.saving ? 'Sauvegarde...' : 'Enregistrer'}
                    className="flex items-center gap-2 px-3 sm:px-6 py-3 border-2 border-[#dbae61] text-[#dbae61] hover:bg-[#dbae61] hover:text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{saveStatus.saving ? 'Sauvegarde...' : 'Enregistrer'}</span>
                  </button>

                  {/* Bouton Finaliser - Style doré plein */}
                  <button
                    onClick={handleFinaliser}
                    className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg font-medium transition-all"
                  >
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>Finaliser la fiche</span>
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