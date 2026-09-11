// src/components/fiche/sections/FicheFinalisation.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import MiniDashboard from '../MiniDashboard'
import AnnonceAgentCard from '../AnnonceAgentCard'
import { Eyebrow } from '../../FicheLogementBrand'
import { FL, DISPLAY_SERIF } from '../../../lib/ficheLogementTheme'
import { useForm } from '../../FormContext'
import { generatePdfTitle } from '../../../lib/PdfFormatter'
import {
  CheckCircle, FileText, Save, Sparkles, Loader2, AlertCircle, Settings, ArrowLeft, Lock,
} from 'lucide-react'
import { generatePdfClientSide } from '../../../lib/PdfBuilder'
import { generateAnnoncePdf } from '../../../lib/annoncePdf'
import { supabase } from '../../../supabaseClient'

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
    finaliserFiche,
    isFicheLocked,
    demarrerGenerationPdf,
    prolongerGenerationPdf,
    terminerGenerationPdf,
    persisterGenerationPdf
  } = useForm()

  // Rôle de l'utilisateur : seul `fiche_lite` déclenche l'avertissement + le verrou.
  // Pour tout autre rôle (premium/trial/admin), le comportement est strictement inchangé.
  const [userRole, setUserRole] = useState(null)
  const [roleLoaded, setRoleLoaded] = useState(false)
  const [showLockModal, setShowLockModal] = useState(false)

  // Le rôle conditionne le verrou : tant qu'il n'est pas résolu, on NE génère PAS de
  // PDF (bouton désactivé). Sinon un fiche_lite qui clique pendant le chargement (ou si
  // la requête échoue et laisse userRole=null) obtiendrait un 1er PDF SANS verrou → trou
  // de recyclage rouvert. Retry léger pour ne pas rester bloqué sur un aléa réseau.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || cancelled) return
        const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (cancelled) return
        if (!error && data) {
          setUserRole(data.role ?? null)
          setRoleLoaded(true)
          return
        }
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
      }
    })()
    return () => { cancelled = true }
  }, [])

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
    // Le contenu complet se replie : la nouvelle plateforme se présente d'abord par
    // son titre, l'utilisateur redéplie s'il veut lire. État d'affichage seulement.
    setApercuVisible(false)
  }

  const handleDownloadAnnoncePdf = () => {
    if (!agentOutput) return
    try {
      generateAnnoncePdf(agentOutput, agentPlateforme, formData?.nom)
    } catch (e) {
      setAgentError(e?.message || 'Erreur lors de la génération du PDF.')
    }
  }

  // Clic sur « Générer PDF » : un fiche_lite dont la fiche n'est pas encore verrouillée
  // est averti AVANT (le PDF va figer l'identité du bien). Sinon (premium, ou fiche déjà
  // verrouillée = générations suivantes) → génération directe, comportement inchangé.
  const handleGeneratePDF = () => {
    // Rôle pas encore résolu : on ne génère pas (le bouton est déjà désactivé). Garde
    // défensive pour ne jamais produire un PDF sans avoir pu décider du verrou.
    if (!roleLoaded) return
    if (userRole === 'fiche_lite' && !isFicheLocked) {
      setShowLockModal(true)
      return
    }
    runGeneratePDF({ withLock: false })
  }

  // Génération effective. Ordre voulu : PDF D'ABORD (client-side, synchrone), PUIS le
  // verrou — on ne verrouille JAMAIS sans avoir délivré le PDF. Si le lock échoue après
  // coup, la fiche reste déverrouillée (le pop-up réapparaîtra), pas de lock-sans-PDF.
  const runGeneratePDF = async ({ withLock }) => {
    // Vrai tant que pdfmake peut encore aboutir alors qu'on a déjà rendu la main à
    // l'interface (dépassement du délai de garde). Dans ce cas SEULEMENT, le gel de
    // l'identité doit survivre au `finally` : la remise tardive posera le verrou, et
    // il ne doit pas verrouiller une identité modifiée entre-temps.
    let renduPeutEncoreAboutir = false
    // Vrai dès que le fichier a été remis. À partir de là, c'est la persistance qui
    // gouverne le voile : le `finally` ci-dessous ne doit surtout pas l'effacer, sinon
    // un échec d'enregistrement disparaîtrait de l'écran sans que personne le voie.
    let livraisonFaite = false
    try {
      setPdfLoading(true)

      // Voile bloquant DÈS L'ENTRÉE, avant la moindre attente. La sauvegarde et le
      // chargement des annonces ci-dessous prennent du temps ; sans lui, la sidebar
      // reste utilisable et l'utilisateur peut modifier le propriétaire ou l'adresse.
      // `handleSave` a alors capturé l'ancienne identité, le PDF se construit sur
      // l'ancienne, mais l'auto-save persiste la nouvelle — et la remise du fichier
      // verrouillerait une identité absente du PDF téléchargé.
      // Levé dans le `finally`, sauf rendu encore en cours (cf. ci-dessus).
      demarrerGenerationPdf()

      // La sauvegarde ne LÈVE PAS en cas d'échec (retourne { success:false }). Si elle
      // échoue, on interrompt TOUT : pas de PDF (il serait généré depuis des données
      // non persistées) et surtout pas de verrou (sinon la fiche serait figée sur les
      // anciennes valeurs, incohérentes avec le PDF). L'utilisateur réessaie.
      const saveRes = await handleSave()
      if (!saveRes?.success) {
        alert("La sauvegarde de la fiche a échoué : vos dernières modifications ne sont pas enregistrées. Réessayez avant de générer le PDF.")
        return
      }

      // Les annonces ne sont pas dans la fiche : elles vivent dans agent_outputs, une
      // ligne par plateforme. On les charge ICI (les DEUX, pas seulement la plateforme
      // affichée) pour que le récapitulatif final du PDF soit complet.
      //
      // En cas d'échec de lecture on INTERROMPT, comme pour la sauvegarde : on ne sait
      // pas si des annonces existent, et livrer un PDF amputé serait d'autant plus
      // coûteux qu'il fige l'identité du bien pour un fiche_lite.
      //
      // L'id est lu sur la RÉPONSE de la sauvegarde, pas sur `formData` : la fermeture
      // de cette fonction date d'avant l'appel, donc sur une fiche jamais enregistrée
      // elle porterait encore `id: null`.
      const ficheId = saveRes?.data?.id || formData.id
      // Identité du bien telle que LA SAUVEGARDE CI-DESSUS vient de l'écrire, renvoyée
      // par son propre RETURNING (champ calculé `identite_verrouillee`). C'est celle
      // que le PDF va contenir. La relire dans un second appel laisserait un autre
      // onglet s'intercaler et on comparerait alors contre SA version.
      const identiteDuPdf = saveRes?.data?.identite_verrouillee
      let annonces = []
      if (ficheId) {
        const { data: lignesAnnonces, error: erreurAnnonces } = await supabase
          .from('agent_outputs')
          .select('plateforme, output_assemble, statut')
          .eq('fiche_id', ficheId)
        if (erreurAnnonces) {
          alert("Impossible de charger les annonces générées pour les joindre au PDF. Réessayez.")
          return
        }
        // Même prédicat que l'affichage : une ligne en 'erreur' ou sans sortie n'est
        // pas une annonce, on ne la joint pas.
        annonces = (lignesAnnonces || []).filter((l) => l.statut !== 'erreur' && l.output_assemble)
      }

      // PDF D'ABORD, PUIS la trace en base — jamais de verrou ni de preuve sans PDF
      // délivré. `download()` de pdfmake rend la main AVANT d'avoir produit le
      // fichier : la persistance se fait donc dans `onDelivered`, appelé depuis son
      // callback de fin, après `saveAs`. Elle a lieu même si le délai de garde a
      // déjà rendu la main à l'interface — un fichier remis en retard reste remis.
      //
      // Cet update écrit `pdf_generated_at` pour TOUS LES RÔLES (premium inclus) :
      // c'est lui, et non le verrou, qui fait apparaître le badge « PDF » du
      // dashboard. Le verrou n'est posé qu'en plus, dans le MÊME update — pas de
      // fenêtre où l'un serait écrit sans l'autre.
      //
      // ⚠️ Limite résiduelle : le fichier est remis au navigateur, mais savoir si
      // l'utilisateur l'a réellement enregistré sur son disque n'est pas observable
      // depuis une page web. Et si cet update échoue, la fiche garde son PDF sans
      // preuve — badge absent, pop-up de verrou qui réapparaîtra. Le défaut penche
      // donc du côté du FAUX NÉGATIF, jamais de la fausse promesse.
      await generatePdfClientSide(formData, {
        annonces,
        onDelivered: async () => {
          livraisonFaite = true
          // L'horodatage est celui de la REMISE, figé ici : les éventuelles reprises
          // d'enregistrement rejoueront exactement la même preuve.
          // `ficheId` est celui renvoyé par la sauvegarde : sur une fiche créée à
          // l'instant, `formData.id` de cette fermeture vaut encore null.
          const res = await persisterGenerationPdf({
            ficheId,
            withLock,
            horodatage: new Date().toISOString(),
            identite: identiteDuPdf,
          })
          if (!res?.success) {
            // Pas d'alerte : le voile affiche déjà l'état « enregistrement non
            // confirmé » et propose de réessayer. Une alerte doublerait le message.
            console.error('Enregistrement de la génération PDF échoué (PDF déjà délivré) :', res?.error)
          }
        },
      })
      setPdfGenerated(true)
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      // Dépassement du délai de garde : pdfmake tourne toujours et peut encore livrer
      // le fichier. Ce n'est donc PAS un échec définitif — pas d'alerte d'erreur. Le
      // voile passe à l'état « plus long que prévu », qui explique la situation et
      // offre une sortie sûre (recharger la fiche, sans écrire ni verrouiller).
      // L'identité reste gelée jusqu'à `onDelivered`, sans quoi une modification
      // faite dans cet intervalle serait verrouillée alors que le PDF ne la contient
      // pas.
      renduPeutEncoreAboutir = !!error?.renduEnCours
      if (renduPeutEncoreAboutir) {
        prolongerGenerationPdf()
      } else {
        // Échec définitif : le voile tombe et l'utilisateur reprend la main.
        terminerGenerationPdf()
        alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
      }
    } finally {
      // Le voile n'est retiré ici que si RIEN n'a été livré et que le rendu ne peut
      // plus aboutir : sortie anticipée avant le rendu, ou échec définitif. Dès qu'une
      // remise a eu lieu, c'est la persistance qui décide quand il tombe.
      if (!renduPeutEncoreAboutir && !livraisonFaite) terminerGenerationPdf()
      setPdfLoading(false)
    }
  }

  const handleConfirmLock = () => {
    setShowLockModal(false)
    runGeneratePDF({ withLock: true })
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
            {/* Titre dans le même registre que les autres sections du wizard, avec une
                ligne d'orientation : la finalisation est la conclusion du formulaire. */}
            <h1 className="text-2xl font-bold mb-1 text-gray-900">Finalisation de l'inspection</h1>
            <p className="mb-6 text-gray-600">
              État du logement, points à vérifier, puis livrables et actions finales.
            </p>

            {/* SYNTHÈSE — identité, conformité, caractéristiques, atouts, points d'attention */}
            <MiniDashboard formData={formData} />

            {/* ── Livrables ── */}
            <div className="mb-4 mt-10">
              <Eyebrow>Livrables</Eyebrow>
            </div>

            {/* Fiche logement — carte du livrable PDF, blanche comme les autres cartes
                claires de la page, mêmes arrondis et mêmes marges. Une carte de livrable
                à part entière : titre en serif (le traitement du nom du logement et du
                titre de l'annonce), description lisible, puis le bouton sous le texte,
                aligné avec le titre, à la largeur de son libellé. Une seule icône
                document, dans le bouton. Comportement de génération, confirmations,
                verrou, états de progression et d'erreur strictement inchangés. */}
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
              <h3 className={`text-2xl text-gray-900 sm:text-3xl ${DISPLAY_SERIF}`}>Fiche logement</h3>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
                Toutes les informations du logement réunies dans un document clair, prêt à partager.
              </p>

              <button
                onClick={handleGeneratePDF}
                disabled={pdfGenerated || pdfLoading || !roleLoaded}
                className={`mt-7 inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-base font-semibold transition-all ${pdfGenerated
                    ? 'bg-green-100 text-green-700 border-2 border-green-200'
                    : (pdfLoading || !roleLoaded)
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-[#dbae61] hover:bg-[#c49a4f] text-white'
                  }`}
              >
                {pdfGenerated ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                {pdfLoading ? 'Génération en cours...' : pdfGenerated ? 'PDF généré' : !roleLoaded ? 'Chargement…' : 'Générer le PDF'}
              </button>
            </div>


            {/* Agent Annonce — directement sur le fond de page, à la largeur des autres
                grandes sections. Variante « souple » : anthracite chaud, bordure fine et
                ombre légère, pour s'asseoir sur le gris de la page plutôt que de trancher
                dans un bloc blanc. Présentation dans AnnonceAgentCard, logique ci-dessus ;
                seul l'aperçu se masque, les commandes restent toujours visibles. */}
            <div className="mt-6">
              <AnnonceAgentCard
                variant="souple"
                plateforme={agentPlateforme}
                onSwitchPlateforme={handleSwitchPlateforme}
                output={agentOutput}
                fetching={agentFetching}
                loading={agentLoading}
                error={agentError}
                apercuVisible={apercuVisible}
                onToggleApercu={() => setApercuVisible((v) => !v)}
                onGenerate={handleGenerateAgent}
                onDownloadPdf={handleDownloadAnnoncePdf}
                howItWorksOpen={howItWorksOpen}
                onToggleHowItWorks={() => setHowItWorksOpen((o) => !o)}
              />
            </div>

            {/* ── Actions finales : distinctes des actions propres aux livrables ── */}
            <div className="mb-4 mt-10">
              <Eyebrow>Actions finales</Eyebrow>
            </div>

            {/* Retours de sauvegarde et navigation finale. Les données techniques restent
                accessibles juste en dessous. */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Feedback sauvegarde */}
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

              {/* NAVIGATION FINALE - Style Letahost */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
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
            </div>

            {/* Accordéon technique TRÈS discret.
                pb-20 : réserve la zone du bouton d'aide flottant (cette section n'utilise
                pas NavigationButtons, elle a sa propre navigation ci-dessus). */}
            <details className="mt-8 pb-20 border-t border-gray-100 pt-4">
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

      {/* Pop-up d'avertissement AVANT la 1re génération de PDF (fiche_lite uniquement) :
          confirmer fige l'identité du bien puis génère ; annuler ne fait rien. */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full">
            <div className="mb-5 flex items-start gap-3">
              <div className="w-11 h-11 shrink-0 bg-[#dbae61] bg-opacity-15 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#dbae61]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Avant de générer le PDF</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Une fois le PDF généré, vous ne pourrez plus modifier les informations qui
                  identifient votre bien : <strong>nom du propriétaire, adresse, type de propriété,
                  surface, typologie, type de niveau</strong>, et le cas échéant nom de résidence,
                  bâtiment, étage et numéro de porte. Les autres champs (contact, capacité,
                  précisions, équipements…) restent modifiables.
                </p>
                <p className="text-gray-500 text-sm mt-3">
                  Pour établir une fiche sur un autre bien, créez une nouvelle fiche.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowLockModal(false)}
                className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmLock}
                className="px-5 py-2.5 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg font-semibold transition-colors"
              >
                Générer le PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
