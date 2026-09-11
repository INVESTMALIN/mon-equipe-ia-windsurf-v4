// src/components/fiche/AnnonceAgentCard.jsx
//
// Carte « Agent Annonce » de la finalisation — PRÉSENTATION UNIQUEMENT.
//
// Toute la logique (lecture d'agent_outputs, appel de l'Edge Function annonce-generate,
// bascule de plateforme, PDF) reste dans FicheFinalisation.jsx, qui passe ici l'état et
// les gestionnaires en props. Ce composant ne décide rien : il compose.
//
// Composition, du plus important au plus discret :
//   1. en-tête compact (icône, nom, statut) ;
//   2. sélecteur Airbnb / Booking ;
//   3. le RÉSULTAT — surtitre + titre enregistré en serif — visible dès qu'une annonce existe ;
//   4. action principale ivoire (« Voir l'annonce complète » / « Masquer ») ;
//   5. action secondaire en contour (« Télécharger le PDF ») ;
//   6. régénération en lien discret ;
//   7. aide dépliable, en dernier.
// Avant la première génération, l'action principale est « Générer ».

import {
  Wand2, Sparkles, Download, RefreshCw, Loader2, AlertCircle, Eye, EyeOff, Info,
} from 'lucide-react'
import {
  AgentCard, AgentCardHeader, AgentTitleBlock, AgentPrimaryButton, AgentSecondaryButton,
  AgentGhostButton, AgentSegmented, AgentLightPanel, AgentError, AgentNote, AgentDisclosure,
} from './AgentCard'
import { PLATEFORME_LABEL, titreAnnonce } from '../../lib/agentTitres'


// ─── Aperçu de l'annonce : miroirs écran de contenuAirbnb()/contenuBooking()
// (src/lib/annoncePdf.js). Même règle que le PDF : une section vide est masquée.

/** Équivalent écran de bloc() : titre + corps, rien si le corps est vide. */
function SectionApercu({ titre, texte }) {
  const contenu = (texte == null ? '' : String(texte)).trim()
  if (!contenu) return null
  return (
    <div>
      <p className="mb-1 font-bold">{titre}</p>
      <p className="whitespace-pre-wrap">{contenu}</p>
    </div>
  )
}

/** Équivalent écran de blocReglementation() : seulement les lignes renseignées. */
function MentionsReglementairesApercu({ mentions }) {
  if (!mentions) return null
  const lignes = []
  if (mentions.numero_enregistrement) lignes.push(`Numéro d'enregistrement : ${mentions.numero_enregistrement}`)
  if (mentions.dpe_classe) lignes.push(`Classe DPE : ${mentions.dpe_classe}`)
  if (mentions.mention_consommation_excessive) lignes.push(mentions.mention_consommation_excessive)
  if (mentions.estimation_depenses_annuelles) lignes.push(mentions.estimation_depenses_annuelles)
  if (!lignes.length) return null
  return (
    <div>
      <p className="mb-1 font-bold">Mentions réglementaires</p>
      <ul className="list-inside list-disc space-y-0.5">
        {lignes.map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    </div>
  )
}

function ApercuAnnonce({ output, plateforme }) {
  if (plateforme === 'airbnb') {
    const titres = Array.isArray(output.airbnb?.titres) ? output.airbnb.titres.filter(Boolean) : []
    return (
      <>
        {titres.length > 0 && (
          <div>
            <p className="mb-1 font-bold">Titres proposés</p>
            <ol className="list-inside list-decimal space-y-0.5">
              {titres.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
          </div>
        )}
        {output.airbnb?.nombre_voyageurs != null && (
          <p><span className="font-bold">Nombre de voyageurs :</span> {output.airbnb.nombre_voyageurs}</p>
        )}
        <SectionApercu titre="Description" texte={output.airbnb?.description} />
        <SectionApercu titre="Le logement" texte={output.airbnb?.logement} />
        <SectionApercu titre="Accès des voyageurs" texte={output.airbnb?.acces_voyageurs} />
        <SectionApercu titre="Échanges avec les voyageurs" texte={output.airbnb?.echanges_voyageurs} />
        <SectionApercu titre="Le quartier" texte={output.airbnb?.quartier} />
        <SectionApercu titre="Comment se déplacer" texte={output.airbnb?.comment_se_deplacer} />
        <SectionApercu titre="Autres remarques" texte={output.airbnb?.autres_remarques} />
        <MentionsReglementairesApercu mentions={output.airbnb?.mentions_reglementaires} />
        <SectionApercu titre="Note sur l'état" texte={output.airbnb?.note_etat} />
        <SectionApercu titre="Note sur le quartier" texte={output.airbnb?.note_quartier} />
      </>
    )
  }
  return (
    <>
      <SectionApercu titre="Nom de l'hébergement" texte={output.booking?.nom} />
      <SectionApercu titre="À propos du logement" texte={output.booking?.about_property} />
      <SectionApercu titre="À propos du quartier" texte={output.booking?.about_neighbourhood} />
      <SectionApercu titre="À propos de l'hôte" texte={output.booking?.about_host} />
      <MentionsReglementairesApercu mentions={output.booking?.mentions_reglementaires} />
      <SectionApercu titre="Note sur l'état" texte={output.booking?.note_etat} />
      <SectionApercu titre="Note sur le quartier" texte={output.booking?.note_quartier} />
      <SectionApercu titre="Caméra de surveillance" texte={output.booking?.note_camera} />
    </>
  )
}

export default function AnnonceAgentCard({
  plateforme,
  onSwitchPlateforme,
  output,
  fetching,
  loading,
  error,
  apercuVisible,
  onToggleApercu,
  onGenerate,
  onDownloadPdf,
  howItWorksOpen,
  onToggleHowItWorks,
}) {
  const label = PLATEFORME_LABEL[plateforme]
  const titre = titreAnnonce(output, plateforme)
  const occupe = loading || fetching

  // Une seule phrase de statut, jamais « prête » sans annonce chargée.
  const statut = loading
    ? `Génération de l'annonce ${label} en cours…`
    : fetching
      ? "Chargement de l'annonce enregistrée…"
      : output
        ? 'Ton annonce est prête'
        : `Aucune annonce ${label} pour le moment`

  return (
    <AgentCard>
      <AgentCardHeader icon={Sparkles} name="Agent Annonce" status={statut} busy={occupe} />

      <AgentSegmented
        label="Plateforme de l'annonce"
        options={[['airbnb', 'Airbnb'], ['booking', 'Booking']]}
        value={plateforme}
        onChange={onSwitchPlateforme}
        disabled={loading}
      />

      {/* ── Le résultat, avant les actions ── */}
      {output && !loading && (
        <AgentTitleBlock eyebrow={`${label} · titre enregistré`} title={titre} />
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {output && !loading ? (
          <>
            <AgentPrimaryButton
              onClick={onToggleApercu}
              aria-expanded={apercuVisible}
              aria-controls="annonce-apercu"
            >
              {apercuVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              {apercuVisible ? "Masquer l'annonce" : "Voir l'annonce complète"}
            </AgentPrimaryButton>
            <AgentSecondaryButton onClick={onDownloadPdf}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Télécharger le PDF
            </AgentSecondaryButton>
            <AgentGhostButton onClick={onGenerate} disabled={occupe} className="sm:ml-auto">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Régénérer
            </AgentGhostButton>
          </>
        ) : (
          <AgentPrimaryButton onClick={onGenerate} disabled={occupe}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Génération en cours…
              </>
            ) : fetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Chargement…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" aria-hidden="true" />
                Générer l'annonce {label}
              </>
            )}
          </AgentPrimaryButton>
        )}
      </div>

      {loading && (
        <AgentNote>La génération prend généralement 20 à 30 secondes, merci de patienter.</AgentNote>
      )}

      {error && (
        <AgentError>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </AgentError>
      )}

      {/* ── Contenu complet, sur fond clair ── */}
      {output && !loading && apercuVisible && (
        <AgentLightPanel className="space-y-3">
          <div id="annonce-apercu">
            <div className="space-y-3">
              <ApercuAnnonce output={output} plateforme={plateforme} />
            </div>
          </div>
        </AgentLightPanel>
      )}

      {/* ── Aide, en dernier et discrète ── */}
      <AgentDisclosure
        id="annonce-comment"
        label={<><Info className="h-4 w-4" aria-hidden="true" /> Comment l'annonce est-elle générée ?</>}
        open={howItWorksOpen}
        onToggle={onToggleHowItWorks}
      >
        <p>
          L'agent rédige selon les bonnes pratiques 2026, calibrées sur une analyse de 115 597 annonces
          dont 3 565 « top performers » (Superhost, note ≥ 4,8/5, occupation élevée) — des seuils observés,
          pas inventés.
        </p>
        <ul className="list-inside list-disc space-y-1">
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
      </AgentDisclosure>
    </AgentCard>
  )
}
