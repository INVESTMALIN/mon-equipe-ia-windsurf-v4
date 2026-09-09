import { FileText, Loader2, RotateCcw, Clock } from 'lucide-react'
import { useForm } from '../FormContext'
import { GENERATION_PDF } from '../../lib/pdfEtats'

// Voile bloquant affiché pendant la génération d'un PDF.
//
// Il est monté par FicheWizard, donc AU-DESSUS des sections et de la navigation :
// un seul composant couvre la sidebar, les boutons d'étape et tous les champs, sans
// avoir à désactiver quoi que ce soit section par section. Il survit au changement
// de section puisque son état vit dans FormContext, pas dans l'écran de finalisation.
//
// Pourquoi bloquer : le verrou d'identité n'est posé qu'APRÈS la remise du fichier.
// Entre le lancement et cette pose, une modification de l'identité serait figée par
// un PDF qui ne la contient pas. `updateField` refuse déjà ces écritures — mais un
// refus invisible est pire que rien : l'utilisateur saisirait dans des champs
// d'apparence active et verrait son travail disparaître. Ce voile rend le refus
// visible et empêche la saisie plutôt que de la jeter en silence.
export default function GenerationPdfOverlay() {
  const { generationPdf } = useForm()
  const statut = generationPdf?.statut

  if (statut !== GENERATION_PDF.EN_COURS && statut !== GENERATION_PDF.PROLONGE) return null

  const prolonge = statut === GENERATION_PDF.PROLONGE

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generation-pdf-titre"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl" aria-live="polite">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: prolonge ? '#fef3c7' : 'rgba(219,174,97,0.15)' }}
        >
          {prolonge ? (
            <Clock className="h-7 w-7 text-[#b45309]" aria-hidden="true" />
          ) : (
            <FileText className="h-7 w-7 text-[#dbae61]" aria-hidden="true" />
          )}
        </div>

        <h2 id="generation-pdf-titre" className="text-xl font-bold text-gray-900">
          {prolonge ? 'La génération prend plus de temps que prévu' : 'Préparation de votre PDF'}
        </h2>

        {prolonge ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Le document est toujours en cours de préparation. S’il aboutit, le téléchargement
              partira tout seul et cette fenêtre se fermera.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Vous pouvez aussi reprendre la main en rechargeant la fiche. La préparation en cours
              sera interrompue : <strong>aucun PDF ne sera enregistré et votre fiche ne sera pas
              verrouillée</strong>. Vos données déjà sauvegardées sont conservées.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#171714] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a25]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Recharger la fiche
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Le téléchargement démarrera automatiquement. Ne fermez pas cette page.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              La navigation et la saisie sont suspendues le temps de la préparation : les
              informations qui identifient le bien doivent rester celles du document en cours de
              création.
            </p>
            <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin text-[#dbae61]" aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  )
}
