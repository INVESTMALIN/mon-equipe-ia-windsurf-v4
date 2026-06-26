// src/components/fiche/sections/FicheFinalisation.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import MiniDashboard from '../MiniDashboard'
import { useForm } from '../../FormContext'
import { generatePdfTitle } from '../../../lib/PdfFormatter'
import {
  CheckCircle, FileText, Save, Sparkles, Wand2, Download, RefreshCw,
  ChevronDown, Loader2, AlertCircle, Settings, ArrowLeft, Info, Eye, EyeOff,
} from 'lucide-react'
import { generatePdfClientSide } from '../../../lib/PdfBuilder'
import { generateAnnoncePdf } from '../../../lib/annoncePdf'
import { supabase } from '../../../supabaseClient'

const PLATEFORME_LABEL = { airbnb: 'Airbnb', booking: 'Booking' }

export default function FicheFinalisation() {
  const navigate = useNavigate()
  const [showFinalModal, setShowFinalModal] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  // ─── Agent annonce (moteur Edge Function annonce-generate) ───
  const [agentPlateforme, setAgentPlateforme] = useState('airbnb')
  const [agentLoading, setAgentLoading] = useState(false) // génération en cours
  const [agentFetching, setAgentFetching] = useState(false) // chargement depuis agent_outputs
  const [agentOutput, setAgentOutput] = useState(null)
  const [agentError, setAgentError] = useState('')
  const [apercuVisible, setApercuVisible] = useState(false) // aperçu de l'annonce masqué par défaut
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)

  const {
    formData,
    handleSave,
    saveStatus,
    back,
    finaliserFiche
  } = useForm()

  // Charge l'annonce DÉJÀ persistée (agent_outputs) pour la fiche + plateforme
  // courantes, au montage et à chaque changement de plateforme. AUCUNE génération
  // automatique : on n'affiche que ce qui existe déjà en base (RLS : le propriétaire
  // lit sa ligne avec son JWT). La régénération reste un acte manuel.
  useEffect(() => {
    const ficheId = formData?.id
    if (!ficheId) {
      setAgentOutput(null)
      return
    }
    let cancelled = false
    // Vide la sortie précédente AVANT de charger : si la fiche change sans
    // remontage du composant (route /fiche?id=… réutilisée), on n'affiche jamais
    // l'annonce de l'ancienne fiche pendant la requête de la nouvelle.
    setAgentOutput(null)
    setAgentFetching(true)
    setAgentError('')
    ;(async () => {
      const { data, error } = await supabase
        .from('agent_outputs')
        .select('output_assemble, statut')
        .eq('fiche_id', ficheId)
        .eq('plateforme', agentPlateforme)
        .maybeSingle()
      if (cancelled) return
      // On n'affiche qu'une annonce VALIDE : toute ligne non-'erreur' avec une
      // sortie présente (donc 'genere' OU 'valide' — la table autorise les deux).
      // Même prédicat que `annonceValideExistante` côté persistance. Une ligne en
      // 'erreur' ou absente → état "à générer", pas de bruit affiché.
      if (!error && data && data.statut !== 'erreur' && data.output_assemble) {
        setAgentOutput(data.output_assemble)
      } else {
        setAgentOutput(null)
      }
      setAgentFetching(false)
    })()
    return () => { cancelled = true }
  }, [formData?.id, agentPlateforme])

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

  // Bascule de plateforme : on vide l'aperçu et on laisse l'effet recharger
  // l'annonce déjà générée pour la nouvelle plateforme (ou l'état "à générer").
  const handleSwitchPlateforme = (p) => {
    if (p === agentPlateforme || agentLoading) return
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

    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    } finally {
      setPdfLoading(false)
    }
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

  /* ──────────────────────────────────────────────────────────────────────────
     ANCIEN ASSISTANT ANNONCE n8n — DÉSACTIVÉ (remplacé par l'agent annonce
     ci-dessus, moteur Edge Function annonce-generate). Conservé pour référence,
     ne doit plus s'afficher ni s'exécuter. NE PAS réactiver sans décision produit
     (le nouvel agent persiste dans agent_outputs ; n8n postait sur un webhook).

     // import useRef + useProgressiveLoading, prepareForN8nWebhook (PdfFormatter)
     // const [showAnnonceAssistant, setShowAnnonceAssistant] = useState(false)
     // const [annonceInput, setAnnonceInput] = useState('')
     // const [annonceLoading, setAnnonceLoading] = useState(false)
     // const [annonceResult, setAnnonceResult] = useState('')
     // const [copiedAnnonce, setCopiedAnnonce] = useState(false)
     // const [chatMessages, setChatMessages] = useState([])
     // const [currentInput, setCurrentInput] = useState('')
     // const { currentMessage, currentIcon: LoadingIcon, dots } = useProgressiveLoading(annonceLoading, false)
     // const annonceSessionIdRef = useRef(null)
     //
     // const quickPrompts = [
     //   { label: "Créer une annonce attractive", prompt: "Créez une annonce attractive pour ce logement basée sur l'inspection réalisée", icon: "(sparkles)" },
     //   { label: "Version courte Airbnb", prompt: "Créez une annonce courte et percutante pour Airbnb, mettant en avant les points forts", icon: "(maison)" },
     //   { label: "Mettre en avant les équipements", prompt: "Réécris l'annonce en mettant l'accent sur les équipements et commodités disponibles", icon: "(eclair)" },
     //   { label: "Plus professionnelle", prompt: "Transforme cette description en version plus professionnelle pour agence immobilière", icon: "(mallette)" },
     //   { label: "Ajouter des détails pratiques", prompt: "Enrichis l'annonce avec des détails pratiques sur l'accès, le quartier et les transports", icon: "(epingle)" },
     // ]
     //
     // useEffect(() => { // sessionId stable basé sur la fiche
     //   if (!annonceSessionIdRef.current && formData) {
     //     const ficheId = formData.id || formData.nom || 'nouvelle_fiche'
     //     const slug = String(ficheId).toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '')
     //     annonceSessionIdRef.current = `fiche_${slug}_annonce`
     //   }
     // }, [formData])
     //
     // const handleCreateAnnonce = async () => {
     //   if (!annonceSessionIdRef.current) return
     //   try {
     //     setAnnonceLoading(true)
     //     const annoncePrompt = annonceInput || "Créez une annonce attractive pour ce logement basée sur l'inspection réalisée"
     //     const ficheDataForAI = prepareForN8nWebhook(formData)
     //     const requestBody = { chatInput: annoncePrompt, sessionId: annonceSessionIdRef.current, ficheData: ficheDataForAI }
     //     const controller = new AbortController()
     //     const timeout = setTimeout(() => controller.abort(), 120000)
     //     const response = await fetch('https://hub.cardin.cloud/webhook/00297790-8d18-44ff-b1ce-61b8980d9a46/chat', {
     //       method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody), signal: controller.signal })
     //     clearTimeout(timeout)
     //     if (!response.ok) { let errorMsg = ''; try { errorMsg = await response.text() } catch (e) { } throw new Error(`HTTP ${response.status}${errorMsg ? ` - ${errorMsg.slice(0, 200)}` : ''}`) }
     //     let data; try { data = await response.json() } catch (e) { throw new Error('Réponse invalide du serveur (format JSON)') }
     //     setAnnonceResult(data.output || 'Réponse indisponible.')
     //   } catch (error) {
     //     let errorMessage = "Erreur lors de la création de l'annonce. Veuillez réessayer."
     //     if (error.name === 'AbortError') errorMessage = 'La génération a pris trop de temps. Vérifiez votre connexion et réessayez.'
     //     else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.'
     //     else if (error.message?.includes('HTTP 500') || error.message?.includes('HTTP 502') || error.message?.includes('HTTP 503')) errorMessage = 'Service temporairement indisponible. Merci de réessayer dans quelques instants.'
     //     setAnnonceResult(errorMessage)
     //   } finally { setAnnonceLoading(false) }
     // }
     //
     // const handleCopyAnnonce = () => {
     //   navigator.clipboard.writeText(annonceResult).then(() => { setCopiedAnnonce(true); setTimeout(() => setCopiedAnnonce(false), 2000) }).catch(() => { })
     // }
     //
     // const handleQuickPrompt = async (prompt) => { setCurrentInput(prompt); await sendMessage(prompt) }
     //
     // const sendMessage = async (message) => {
     //   if (!message.trim()) return
     //   const userMessage = { type: 'user', content: message, timestamp: Date.now() }
     //   setChatMessages(prev => [...prev, userMessage]); setCurrentInput('')
     //   try {
     //     setAnnonceLoading(true)
     //     const ficheDataForAI = prepareForN8nWebhook(formData)
     //     const requestBody = { chatInput: message, sessionId: annonceSessionIdRef.current, ficheData: ficheDataForAI }
     //     const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 120000)
     //     const response = await fetch('https://hub.cardin.cloud/webhook/00297790-8d18-44ff-b1ce-61b8980d9a46/chat', {
     //       method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody), signal: controller.signal })
     //     clearTimeout(timeout)
     //     if (!response.ok) throw new Error(`HTTP ${response.status}`)
     //     const data = await response.json()
     //     setChatMessages(prev => [...prev, { type: 'bot', content: data.output || 'Réponse indisponible.', timestamp: Date.now() }])
     //   } catch (error) {
     //     setChatMessages(prev => [...prev, { type: 'bot', content: 'Erreur lors de la génération. Merci de réessayer.', timestamp: Date.now() }])
     //   } finally { setAnnonceLoading(false) }
     // }
     //
     // const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(currentInput) } }
     //
     // handleGeneratePDF() faisait aussi: setShowAnnonceAssistant(true) pour révéler le chat.
     //
     // JSX (rendu sous le gating `showAnnonceAssistant`, retiré du return) :
     //   <div className="bg-white rounded-xl shadow-sm p-6">  // carte Assistant Annonce (icône PenTool violette)
     //     en-tête "Assistant Annonce" / "Générez et affinez votre annonce"
     //     // Boutons de prompts rapides : quickPrompts.map(... handleQuickPrompt(prompt.prompt) ...)
     //     // Zone de chat : chatMessages.map(... bulles user/bot + bouton Copier ...)
     //     //   + indicateur de chargement (LoadingIcon + currentMessage + dots)
     //     // Zone de saisie : <input value={currentInput} onKeyPress={handleKeyPress}/> + bouton Send (sendMessage)
     //   </div>
  ────────────────────────────────────────────────────────────────────────── */

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />

      <div className="flex-1 flex flex-col">
        <ProgressBar />

        <div className="flex-1 p-6 bg-gray-100">
          {/* Messages sauvegarde */}
          {saveStatus.saving && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> Sauvegarde en cours...
            </div>
          )}
          {saveStatus.saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> Sauvegardé avec succès !
            </div>
          )}
          {saveStatus.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{saveStatus.error}</span>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Finalisation de l'inspection</h1>

            {/* MINI DASHBOARD - Aperçu + Alertes */}
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
                {/* Génération PDF fiche logement */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#dbae61]" /> Fiche logement PDF
                  </h3>
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
                          : 'bg-[#dbae61] hover:bg-[#c49a4f] text-white'
                      }`}
                  >
                    {pdfGenerated ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    {pdfLoading ? 'Génération en cours...' : pdfGenerated ? 'PDF Généré' : 'Générer la Fiche Logement (PDF)'}
                  </button>
                </div>

                {/* Agent Annonce — commandes toujours visibles ; seul l'aperçu se masque */}
                <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                  {/* Header (toujours visible) */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
                      <Wand2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Agent Annonce — génération automatique</h3>
                      <p className="text-sm text-gray-600">
                        {agentFetching
                          ? "Chargement de l'annonce enregistrée…"
                          : agentOutput
                            ? `Annonce ${PLATEFORME_LABEL[agentPlateforme]} prête`
                            : 'Aucune annonce générée pour le moment'}
                      </p>
                    </div>
                  </div>

                  {/* Explication « comment ça marche » (dépliable) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setHowItWorksOpen((o) => !o)}
                      className="flex items-center gap-1.5 text-sm font-medium text-[#dbae61] hover:text-[#c49a4f] transition-colors"
                    >
                      <Info className="w-4 h-4" />
                      Comment l'annonce est-elle générée ?
                      <ChevronDown className={`w-4 h-4 transition-transform ${howItWorksOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {howItWorksOpen && (
                      <div className="mt-2 p-4 bg-[#dbae61]/5 border border-[#dbae61]/20 rounded-lg text-sm text-gray-700 space-y-2">
                        <p>
                          L'agent rédige selon les bonnes pratiques 2026, calibrées sur une analyse de 115 597 annonces
                          dont 3 565 « top performers » (Superhost, note ≥ 4,8/5, occupation élevée) — des seuils observés,
                          pas inventés.
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          <li><strong>Titre</strong> : 37–43 caractères (plafond Airbnb 50), structuré <em>typologie + ambiance + ancrage géographique</em>, sans émoji ni majuscules intégrales.</li>
                          <li><strong>Description</strong> : ~430–450 caractères (plafond 500), avec accroche située, description spatiale, distances/accessibilité, puis le différenciateur du bien.</li>
                          <li><strong>Ancrage géographique réel</strong> : commerces, transports, plage et points d'intérêt avec leurs distances proviennent de la localisation enrichie de la fiche — jamais inventés.</li>
                          <li><strong>Équipements hiérarchisés</strong> : on met en avant les différenciateurs (arrivée autonome, consommables fournis, café, linge, cuisine équipée) plutôt que les standards (wifi, cuisine).</li>
                          <li><strong>Style factuel</strong> : des faits (climatisé, 500 m de la plage, rénové) plutôt que des adjectifs vides.</li>
                        </ul>
                        <p>
                          Les mentions réglementaires (n° d'enregistrement, classe DPE) et les disclosures (état, quartier, caméra)
                          sont ajoutées automatiquement par le système. Sur <strong>Booking</strong>, la grande description est générée
                          par la plateforme : l'agent remplit le nom et les champs « à propos » (logement, quartier, hôte).
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Choix plateforme */}
                  <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                    {['airbnb', 'booking'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleSwitchPlateforme(key)}
                        disabled={agentLoading}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                          agentPlateforme === key ? 'bg-[#dbae61] text-white' : 'text-gray-700 hover:bg-white'
                        }`}
                      >
                        {PLATEFORME_LABEL[key]}
                      </button>
                    ))}
                  </div>

                  {/* Commandes : générer/régénérer · afficher/masquer · télécharger (toujours visibles) */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleGenerateAgent}
                      disabled={agentLoading || agentFetching}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        agentLoading || agentFetching ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#dbae61] hover:bg-[#c49a4f] text-white'
                      }`}
                    >
                      {agentLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Génération en cours...
                        </>
                      ) : agentFetching ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Chargement…
                        </>
                      ) : agentOutput ? (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          Régénérer l'annonce {PLATEFORME_LABEL[agentPlateforme]}
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          Générer l'annonce {PLATEFORME_LABEL[agentPlateforme]}
                        </>
                      )}
                    </button>

                    {agentOutput && (
                      <button
                        type="button"
                        onClick={() => setApercuVisible((v) => !v)}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        {apercuVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        {apercuVisible ? "Masquer l'annonce" : "Afficher l'annonce"}
                      </button>
                    )}

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
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{agentError}</span>
                    </div>
                  )}

                  {/* Chargement de l'annonce enregistrée */}
                  {agentFetching && !agentOutput && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Chargement de l'annonce enregistrée…
                    </p>
                  )}

                  {/* Aperçu de la sortie — masqué par défaut, basculé par « Afficher / Masquer l'annonce » */}
                  {agentOutput && apercuVisible && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 space-y-3">
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

              </div>

              {/* Feedback sauvegarde */}
              {saveStatus.saving && (
                <div className="mt-8 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> Sauvegarde en cours...
                </div>
              )}
              {saveStatus.saved && (
                <div className="mt-8 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" /> Sauvegardé avec succès !
                </div>
              )}
              {saveStatus.error && (
                <div className="mt-8 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{saveStatus.error}</span>
                </div>
              )}

              {/* NAVIGATION FINALE - Style Letahost */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-8 mt-4 border-t border-gray-200">
                <button
                  onClick={back}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour
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
                <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" /> Données techniques de la fiche
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
