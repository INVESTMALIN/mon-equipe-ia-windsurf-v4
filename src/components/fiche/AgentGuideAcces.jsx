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
import { useRef, useState } from 'react'
import { Video, Wand2, RefreshCw, X, Copy, Check, AlertCircle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useForm } from '../FormContext'
import { supabase } from '../../supabaseClient'
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
  const { formData, getField, updateField } = useForm()

  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  // Identifiant de repli pour une fiche pas encore enregistrée (donc sans id) : il doit
  // être PROPRE À CETTE INSTANCE. Une constante partagée mettrait tous les brouillons —
  // de tous les utilisateurs — dans la même session n8n, et la mémoire du workflow
  // ferait fuiter les détails d'accès d'un logement dans le guide d'un autre.
  const [brouillonId] = useState(() => uuidv4())

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

      const genereAt = new Date().toISOString()

      // Persistance IMMÉDIATE, sans attendre l'auto-save : celui-ci est débounced à 5 s
      // et son timer est annulé au démontage du provider. Quitter l'écran juste après la
      // génération perdrait un résultat coûteux (plusieurs minutes de transcription).
      //
      // Update CIBLÉ sur la seule colonne section_guide_acces, comme lockFiche : on
      // n'appelle PAS handleSave, qui capture un formData antérieur aux écritures
      // ci-dessous et dont le setFormData(result.data) écraserait le guide.
      if (formData?.id) {
        const { error: erreurSave } = await supabase
          .from('fiche_lite')
          .update({
            section_guide_acces: {
              ...(formData.section_guide_acces || {}),
              guide_genere: texte,
              guide_genere_at: genereAt,
            },
            updated_at: genereAt,
          })
          .eq('id', formData.id)
        // Échec d'enregistrement : le guide reste affiché (il a coûté cher), mais on le
        // dit franchement plutôt que de laisser croire qu'il est en sécurité.
        if (erreurSave) {
          setError(
            `Guide généré mais NON enregistré (${erreurSave.message}). Copiez-le avant de quitter la page.`
          )
        }
      }

      // État local (et, pour une fiche sans id encore, seul vecteur de persistance :
      // l'auto-save créera la ligne avec le guide dedans).
      updateField('section_guide_acces.guide_genere', texte)
      updateField('section_guide_acces.guide_genere_at', genereAt)
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

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Agent guide d'accès</h3>
          <p className="text-sm text-gray-600">
            {guide
              ? `Guide généré${genereLe ? ` le ${genereLe}` : ''}`
              : 'Téléversez votre vidéo d\'accès, l\'agent rédige le guide pour vos voyageurs'}
          </p>
        </div>
      </div>

      {/* Téléversement */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          accept={GUIDE_ACCES_ACCEPT}
          onChange={handleFileSelect}
          disabled={loading}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#dbae61] file:text-white hover:file:bg-[#c49a4f] file:cursor-pointer disabled:opacity-50"
        />
        <p className="text-xs text-gray-500 mt-2">
          <strong>Formats acceptés :</strong> {GUIDE_ACCES_FORMATS_LABEL} • <strong>Taille max :</strong> {GUIDE_ACCES_TAILLES_LABEL}
        </p>
      </div>

      {selectedFile && (
        <div className="p-3 bg-[#dbae61] bg-opacity-10 border border-[#dbae61] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Video className="w-4 h-4 text-[#dbae61] shrink-0" />
            <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
            <span className="text-xs text-gray-500 shrink-0">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
          </div>
          <button
            type="button"
            onClick={removeFile}
            disabled={loading}
            className="text-[#dbae61] hover:text-[#c49a4f] disabled:opacity-50 shrink-0"
            title="Retirer le fichier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Génération. Le bouton reste grisé tant qu'aucune vidéo n'est sélectionnée :
          régénérer suppose un nouveau média, la vidéo précédente n'étant pas conservée. */}
      <div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!selectedFile || loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            !selectedFile || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#dbae61] hover:bg-[#c49a4f] text-white'
          }`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Génération en cours...
            </>
          ) : guide ? (
            <>
              <RefreshCw className="w-5 h-5" />
              Régénérer le guide d'accès
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Générer le guide d'accès
            </>
          )}
        </button>
        {!selectedFile && !loading && (
          <p className="text-xs text-gray-500 mt-2">
            {guide
              ? "Téléversez une nouvelle vidéo pour régénérer : la vidéo précédente n'est pas conservée."
              : 'Téléversez une vidéo pour activer la génération.'}
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Guide généré */}
      {guide && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-gray-900">Guide d'accès généré</p>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm font-medium text-[#dbae61] hover:text-[#c49a4f] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {guide}
          </div>
        </div>
      )}
    </div>
  )
}
