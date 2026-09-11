// src/components/fiche/AgentGuideAcces.jsx
//
// Bloc « Agent guide d'accès » affiché DANS la section Guide d'Accès du wizard.
// Même moteur que l'assistant autonome (/assistant-guide-acces) — cf. lib/guideAccesAgent —
// mais sans interface de chat : un téléversement, un bouton, le guide affiché.
//
// Deux différences assumées avec l'assistant autonome :
//   - le contexte fiche vient du FormContext de la fiche OUVERTE (pas d'un sélecteur) ;
//   - le guide est PERSISTÉ dans section_guide_acces (guide_genere / guide_genere_at),
//     donc relu à la réouverture de la fiche.
//
// ⚠️ La vidéo n'est stockée NULLE PART. Régénérer impose donc de re-téléverser un média :
//   dans la même session le fichier est encore en mémoire, après réouverture il ne l'est plus.
// ⚠️ `guide_genere` / `guide_genere_at` sont explicitement EXCLUS du PDF de la fiche
//   (cf. CHAMPS_HORS_PDF dans lib/PdfBuilder) : leur intégration fera l'objet d'un travail dédié.
import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useForm } from '../FormContext'
import GuideAgentCard from './GuideAgentCard'
import { extractFicheContext } from '../../lib/ficheContextHelper'
import {
  GUIDE_ACCES_ACCEPT,
  GUIDE_ACCES_FORMATS_LABEL,
  GUIDE_ACCES_TAILLES_LABEL,
  genererGuideAcces,
  guideAccesErrorMessage,
  validateGuideAccesFile,
} from '../../lib/guideAccesAgent'

const MESSAGE_AGENT =
  "Génère le guide d'accès complet de ce logement à partir de cette vidéo et des données de la fiche."

function formatHorodatage(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function AgentGuideAcces() {
  const { formData, getField, updateField, handleSave } = useForm()

  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  // États d'AFFICHAGE uniquement (cf. commentaire au-dessus du rendu).
  const [guideVisible, setGuideVisible] = useState(false)
  const [regenOuvert, setRegenOuvert] = useState(false)
  const fileInputRef = useRef(null)

  // Identifiant de repli pour une fiche pas encore enregistrée (donc sans id) : il doit
  // être PROPRE À CETTE INSTANCE. Une constante partagée mettrait tous les brouillons —
  // de tous les utilisateurs — dans la même session n8n, et la mémoire du workflow
  // ferait fuiter les détails d'accès d'un logement dans le guide d'un autre.
  const [brouillonId] = useState(() => uuidv4())

  // Demande de persistance immédiate, honorée par l'effet ci-dessous.
  // Pourquoi un effet et non un `await` dans handleGenerate : les deux `updateField`
  // ne sont visibles qu'au rendu suivant. L'effet s'exécute là, donc handleSave — qui
  // lit l'état courant et sérialise les écritures (cf. FormContext) — écrit un état
  // qui porte déjà le guide, ainsi que ce que l'utilisateur a saisi pendant les
  // minutes de génération.
  const [aPersister, setAPersister] = useState(0)
  const dernierePersistanceRef = useRef(0)

  useEffect(() => {
    // Ref et non state : StrictMode double-invoque les effets en dev, et la seconde
    // invocation verrait encore l'ancien state → deuxième sauvegarde inutile.
    if (!aPersister || dernierePersistanceRef.current === aPersister) return
    dernierePersistanceRef.current = aPersister

    ;(async () => {
      const res = await handleSave()
      // Le guide reste affiché (il a coûté cher), mais on le dit franchement plutôt
      // que de laisser croire qu'il est en sécurité.
      if (!res?.success) {
        setError(
          `Guide généré mais NON enregistré (${res?.error || 'erreur inconnue'}). Copiez-le avant de quitter la page.`
        )
      }
    })()
  }, [aPersister, handleSave])

  const guide = getField('section_guide_acces.guide_genere') || ''
  const genereLe = formatHorodatage(getField('section_guide_acces.guide_genere_at'))

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const erreurFichier = validateGuideAccesFile(file)
    if (erreurFichier) {
      setError(erreurFichier)
      e.target.value = ''
      setSelectedFile(null)
      return
    }

    setError('')
    setSelectedFile(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleGenerate = async () => {
    if (!selectedFile || loading) return

    setLoading(true)
    setError('')

    try {
      // SessionId stable par fiche : le workflow n8n garde la mémoire d'une génération
      // à l'autre sur le même bien. Dès que la fiche a un id on s'ancre dessus — c'est
      // la seule clé stable d'une réouverture à l'autre. Tant qu'elle n'en a pas, repli
      // sur l'uuid de CETTE instance, jamais sur une constante partagée.
      const sessionId = formData?.id
        ? `fiche_${formData.id}_guide_acces`
        : `brouillon_${brouillonId}_guide_acces`

      const texte = await genererGuideAcces({
        sessionId,
        message: MESSAGE_AGENT,
        file: selectedFile,
        context: extractFicheContext(formData),
      })

      // État local d'abord, puis demande de persistance IMMÉDIATE : les trois setState
      // sont groupés par React, donc l'effet ci-dessus s'exécute sur un formData qui
      // porte déjà le guide. On n'attend pas l'auto-save, débounced à 5 s et dont le
      // timer est annulé au démontage : quitter l'écran juste après la génération
      // perdrait un résultat qui coûte plusieurs minutes de transcription.
      updateField('section_guide_acces.guide_genere', texte)
      updateField('section_guide_acces.guide_genere_at', new Date().toISOString())
      setAPersister((n) => n + 1)
      removeFile()
    } catch (e) {
      setError(guideAccesErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(guide)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Présentation déléguée à GuideAgentCard (mêmes primitives que l'Agent Annonce).
  // Tout ce qui précède est inchangé ; les deux états ci-dessus (guideVisible,
  // regenOuvert) ne sont que de l'affichage et ne touchent ni les données ni la
  // persistance.
  return (
    <GuideAgentCard
      guide={guide}
      genereLe={genereLe}
      loading={loading}
      error={error}
      selectedFile={selectedFile}
      copied={copied}
      guideVisible={guideVisible}
      regenOuvert={regenOuvert}
      fileInputRef={fileInputRef}
      accept={GUIDE_ACCES_ACCEPT}
      formatsLabel={GUIDE_ACCES_FORMATS_LABEL}
      taillesLabel={GUIDE_ACCES_TAILLES_LABEL}
      onFileSelect={handleFileSelect}
      onRemoveFile={removeFile}
      onGenerate={handleGenerate}
      onCopy={handleCopy}
      onToggleGuide={() => setGuideVisible((v) => !v)}
      onToggleRegen={() => setRegenOuvert((o) => !o)}
    />
  )
}
