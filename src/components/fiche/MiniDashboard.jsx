// src/components/fiche/MiniDashboard.jsx
//
// Synthèse de la finalisation : identité du logement, conformité et recommandations,
// caractéristiques, atouts, puis points d'attention. La LOGIQUE (calculateConformity,
// generateApercu, detectAlertes) est inchangée ; seule la présentation a été refaite.
//
// Parti pris : une conclusion de formulaire, pas un tableau de bord. Une seule carte
// blanche pour « le logement », découpée par des filets chauds plutôt qu'en blocs
// colorés imbriqués ; les couleurs de statut ne portent que sur de petits repères
// (pastille, icône, texte) pour dire la situation sans la crier. Les points d'attention
// gardent leur propre carte quand il y en a — ils doivent rester visibles — et se
// réduisent à une ligne calme quand il n'y en a pas. Rien ici ne fait paraître une fiche
// conforme ou complète quand elle ne l'est pas : chaque libellé reprend le calcul existant.
import { detectAlertes, generateApercu } from '../../lib/AlerteDetector'
import {
  MapPin, User, ClipboardList, CheckCircle, AlertTriangle, XCircle, AlertCircle, Wrench, ArrowRight,
} from 'lucide-react'
import { Eyebrow } from '../FicheLogementBrand'
import { FL, DISPLAY_SERIF } from '../../lib/ficheLogementTheme'

// Fonction simple pour calculer seulement la conformité
const calculateConformity = (formData) => {
  const reglementation = formData.section_reglementation || {}
  const avis = formData.section_avis || {}

  let conformiteStatut = 'conforme'
  let conformiteActions = []
  let conformiteMessages = []

  // RÉGLEMENTATION OFFICIELLE
  const requiresChangementUsage = reglementation.ville_changement_usage && reglementation.ville_changement_usage !== "NON !"
  const requiresDeclarationSimple = reglementation.ville_declaration_simple && reglementation.ville_declaration_simple !== "NON !"

  if (requiresChangementUsage) {
    conformiteStatut = 'demarches_requises'
    conformiteActions.push('Changement d\'usage requis')
    conformiteMessages.push('Renseignez-vous auprès de votre mairie sur les conditions et exemptions.')
  }

  if (requiresDeclarationSimple) {
    conformiteStatut = 'demarches_requises'
    conformiteActions.push('Déclaration simple requise')
    conformiteMessages.push('Formulaire Cerfa n°14004*04 à déposer en mairie avant de commencer la location.')
  }

  // RECOMMANDATIONS INTERNES
  const zoneRisques = avis.quartier_securite === 'zone_risques'
  const quartierDefavorise = avis.quartier_types?.includes('quartier_defavorise')

  if (zoneRisques) {
    conformiteStatut = 'attention_requise'
    conformiteActions.push('Zone à risques détectée')
    conformiteMessages.push('Vérifications supplémentaires recommandées.')
  }

  if (quartierDefavorise) {
    if (conformiteStatut === 'conforme') conformiteStatut = 'attention_requise'
    conformiteActions.push('Quartier défavorisé')
    conformiteMessages.push('Impact possible sur l\'attractivité.')
  }

  return {
    conformiteStatut,
    conformiteActions,
    conformiteMessages,
    requiresChangementUsage,
    requiresDeclarationSimple
  }
}

  // Calculer le nombre de chambres depuis FicheVisite
  const calculateNombreChambres = (formData) => {
    const visite = formData.section_visite || {}
    return visite.nombre_chambres || 'Non renseigné'
  }


// ─────────────────────────────────────────────────────────────────────────────
// Présentation
// ─────────────────────────────────────────────────────────────────────────────

// Repères de statut : une seule palette sémantique, appliquée à de petits éléments.
const TONS = {
  emerald: { texte: 'text-emerald-700', pastille: 'bg-emerald-500', filet: 'border-emerald-300' },
  blue: { texte: 'text-blue-700', pastille: 'bg-blue-500', filet: 'border-blue-300' },
  amber: { texte: 'text-amber-700', pastille: 'bg-amber-500', filet: 'border-amber-300' },
  red: { texte: 'text-red-700', pastille: 'bg-red-500', filet: 'border-red-300' },
}

const CONFORMITE = {
  conforme: { label: 'Conforme', ton: 'emerald', icone: CheckCircle },
  demarches_requises: { label: 'Démarches requises', ton: 'blue', icone: ClipboardList },
  attention_requise: { label: 'Attention requise', ton: 'amber', icone: AlertTriangle },
  non_conforme: { label: 'Non conforme', ton: 'red', icone: XCircle },
}

const NON_RENSEIGNE = 'Non renseigné'

/** Valeur + unité, sans jamais produire « Non renseigné personnes ». */
function avecUnite(valeur, unite) {
  if (valeur == null || valeur === '' || valeur === NON_RENSEIGNE) return NON_RENSEIGNE
  return `${valeur} ${unite}`
}

/** Groupe interne de la carte : surtitre à filet doré, puis contenu. */
function Groupe({ titre, children }) {
  return (
    <div className="mt-7 border-t pt-7" style={{ borderColor: FL.line }}>
      <Eyebrow className="mb-4">{titre}</Eyebrow>
      {children}
    </div>
  )
}

/** Cellule de caractéristique : libellé discret, valeur en gras, précision en dessous. */
function Caracteristique({ label, valeur, precision, ton }) {
  const manquant = valeur === NON_RENSEIGNE
  const couleur = manquant ? 'text-gray-400 italic' : ton ? TONS[ton].texte : 'text-gray-900'
  return (
    <div className="min-w-0 py-3 pr-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-0.5 break-words text-sm font-semibold ${couleur}`}>{valeur}</p>
      {precision && !manquant && <p className="break-words text-xs text-gray-500">{precision}</p>}
    </div>
  )
}

/** Ligne de recommandation ou d'alerte : repère coloré, titre, message, action. */
function Ligne({ ton, icone, titre, message, action }) {
  const Icone = icone
  return (
    <li className={`flex items-start gap-3 border-l-2 py-2 pl-3 ${TONS[ton].filet}`}>
      {Icone
        ? <Icone className={`mt-0.5 h-4 w-4 shrink-0 ${TONS[ton].texte}`} aria-hidden="true" />
        : <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONS[ton].pastille}`} aria-hidden="true" />}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{titre}</p>
        {message && <p className="text-sm text-gray-600">{message}</p>}
        {action && (
          <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${TONS[ton].texte}`}>
            <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" /> {action}
          </p>
        )}
      </div>
    </li>
  )
}

export default function MiniDashboard({ formData }) {
  const apercu = generateApercu(formData)
  const alertes = detectAlertes(formData)
  const conformity = calculateConformity(formData)
  const nombreChambres = calculateNombreChambres(formData)

  const proprietaire = formData.section_proprietaire || {}
  const nomFiche = formData.nom || 'Sans nom'
  const ville = proprietaire.adresse?.ville || proprietaire.ville || 'Non renseignée'
  const nomProprietaire = `${proprietaire.prenom || ''} ${proprietaire.nom || ''}`.trim() || NON_RENSEIGNE
  const statut = formData.statut || 'Brouillon'

  const conf = CONFORMITE[conformity.conformiteStatut] || CONFORMITE.non_conforme
  const IconeConf = conf.icone
  const aucuneDemarche = !conformity.requiresChangementUsage && !conformity.requiresDeclarationSimple

  const nbAlertes = alertes.critiques.length + alertes.moderees.length + alertes.elementsAbimes.length
  // Le ton du WiFi dit quelque chose : disponible = bon, absent = à savoir, sinon neutre.
  const tonWifi = apercu.equipements.wifi.disponible ? 'emerald' : apercu.equipements.wifi.statut === 'non' ? 'amber' : undefined

  return (
    <div className="space-y-6">
      {/* ── Le logement : identité, conformité, caractéristiques, atouts ── */}
      <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
        {/* Identité — titre du bien en serif, métadonnées sur une ligne, statut en pastille. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Eyebrow>Logement</Eyebrow>
            <h2 className={`mt-3 break-words text-2xl text-gray-900 sm:text-3xl ${DISPLAY_SERIF}`}>{nomFiche}</h2>
            <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Ville</dt>
                <MapPin className="h-4 w-4 shrink-0" style={{ color: FL.goldDeep }} aria-hidden="true" />
                <dd>{ville}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Propriétaire</dt>
                <User className="h-4 w-4 shrink-0" style={{ color: FL.goldDeep }} aria-hidden="true" />
                <dd>{nomProprietaire}</dd>
              </div>
            </dl>
          </div>
          <div className="shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                statut === 'Complété' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statut === 'Complété' ? 'bg-emerald-500' : 'bg-gray-400'}`} aria-hidden="true" />
              {statut}
            </span>
          </div>
        </div>

        {/* Conformité & recommandations */}
        <Groupe titre="Conformité & recommandations">
          <div className="flex items-center gap-2">
            <IconeConf className={`h-5 w-5 shrink-0 ${TONS[conf.ton].texte}`} aria-hidden="true" />
            <p className={`text-base font-bold ${TONS[conf.ton].texte}`}>{conf.label}</p>
          </div>
          {aucuneDemarche && (
            <p className="mt-2 text-sm text-gray-600">Aucune démarche réglementaire n'est requise a priori.</p>
          )}
          {conformity.conformiteActions.length > 0 && (
            <ul className="mt-3 space-y-2">
              {conformity.conformiteActions.map((action, index) => {
                const interne = action.includes('Zone à risques') || action.includes('Quartier défavorisé')
                return (
                  <Ligne
                    key={index}
                    ton={interne ? 'amber' : 'blue'}
                    titre={action}
                    message={conformity.conformiteMessages[index]}
                  />
                )
              })}
            </ul>
          )}
          <p className="mt-3 text-xs text-gray-400">
            Selon la réglementation de la location courte durée et les recommandations internes.
          </p>
        </Groupe>

        {/* Caractéristiques */}
        <Groupe titre="Caractéristiques">
          {/* Deux rangées de trois : six colonnes tronquaient « Parking dans la rue ». */}
          <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
            <Caracteristique label="Capacité" valeur={avecUnite(apercu.capacite.personnes, 'personnes')} />
            <Caracteristique
              label="Chambres"
              valeur={nombreChambres === NON_RENSEIGNE ? NON_RENSEIGNE : String(nombreChambres)}
              precision={apercu.capacite.lits !== NON_RENSEIGNE ? `${apercu.capacite.lits} lits` : undefined}
            />
            <Caracteristique label="Surface" valeur={apercu.capacite.surface} />
            <Caracteristique label="Type" valeur={apercu.nom} />
            <Caracteristique label="WiFi" valeur={apercu.equipements.wifi.texte} ton={tonWifi} />
            <Caracteristique label="Parking" valeur={apercu.equipements.parking.texte} />
          </div>
        </Groupe>

        {/* Atouts — seulement s'il y en a, en pastilles neutres. */}
        {apercu.atouts.length > 0 && (
          <Groupe titre="Atouts">
            <ul className="flex flex-wrap gap-2">
              {apercu.atouts.map((atout, index) => (
                <li
                  key={index}
                  className="rounded-full border px-3 py-1 text-sm font-medium"
                  style={{ borderColor: FL.line, backgroundColor: FL.paper, color: FL.ink }}
                >
                  {atout}
                </li>
              ))}
            </ul>
          </Groupe>
        )}

        {/* Sans point d'attention : une ligne calme, pas un bloc vert. Le libellé reprend
            exactement le calcul de detectAlertes — il n'affirme rien de plus. */}
        {nbAlertes === 0 && (
          <div className="mt-7 flex items-center gap-2 border-t pt-6 text-sm text-gray-600" style={{ borderColor: FL.line }}>
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            Aucun point d'attention détecté : aucun problème majeur identifié sur ce logement.
          </div>
        )}
      </section>

      {/* ── Points d'attention : carte propre, visible, quand il y en a ── */}
      {nbAlertes > 0 && (
        <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8" aria-labelledby="points-attention">
          <div className="flex items-center justify-between gap-4">
            <Eyebrow>Points d'attention</Eyebrow>
            <span className="text-xs font-semibold text-gray-500">{nbAlertes} à vérifier</span>
          </div>
          <h3 id="points-attention" className="sr-only">Points d'attention</h3>

          {alertes.critiques.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-700">Critique · {alertes.critiques.length}</p>
              <ul className="space-y-1">
                {alertes.critiques.map((a, i) => (
                  <Ligne key={i} ton="red" icone={AlertCircle} titre={a.titre} message={a.message} action={a.action} />
                ))}
              </ul>
            </div>
          )}

          {alertes.moderees.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-700">Modéré · {alertes.moderees.length}</p>
              <ul className="space-y-1">
                {alertes.moderees.map((a, i) => (
                  <Ligne key={i} ton="amber" icone={AlertTriangle} titre={a.titre} message={a.message} />
                ))}
              </ul>
            </div>
          )}

          {alertes.elementsAbimes.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-600">
                Éléments abîmés · {alertes.elementsAbimes.length}
              </p>
              <ul className="flex flex-wrap gap-2">
                {alertes.elementsAbimes.map((a, i) => (
                  <li key={i} className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
                    <Wrench className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {a.espace}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
