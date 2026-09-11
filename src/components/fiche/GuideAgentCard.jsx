// src/components/fiche/GuideAgentCard.jsx
//
// Carte « Agent guide d'accès » — PRÉSENTATION UNIQUEMENT.
//
// Toute la logique (téléversement, appel du moteur, persistance dans
// section_guide_acces) reste dans AgentGuideAcces.jsx, qui passe ici l'état et les
// gestionnaires en props. Ce composant ne décide rien : il compose, avec les mêmes
// primitives que la carte Agent Annonce (fiche/AgentCard.jsx), pour que les deux cartes
// soient le même objet visuel.
//
// Composition, du plus important au plus discret, une fois un guide généré :
//   1. en-tête compact (icône, nom, statut « Ton guide d'accès est prêt ») ;
//   2. le RÉSULTAT — surtitre daté + titre en serif s'il en existe un exploitable ;
//   3. action principale ivoire (« Voir le guide complet » / « Masquer ») ;
//   4. action secondaire en contour (« Copier le texte ») ;
//   5. régénération en lien discret, qui DÉPLIE la zone de téléversement ;
//   6. le texte complet sur fond clair quand il est déplié.
// Sans guide, la zone de téléversement est visible d'emblée : générer est l'action
// principale.

import { useId } from 'react'
import {
  Video, Wand2, Sparkles, RefreshCw, X, Copy, Check, AlertCircle, Loader2, Eye, EyeOff, Upload,
} from 'lucide-react'
import { FL } from '../../lib/ficheLogementTheme'
import { titreGuide } from '../../lib/agentTitres'
import {
  AgentCard, AgentCardHeader, AgentTitleBlock, AgentPrimaryButton, AgentSecondaryButton,
  AgentGhostButton, AgentLightPanel, AgentError, AgentNote,
} from './AgentCard'

export default function GuideAgentCard({
  guide,
  genereLe,
  loading,
  error,
  selectedFile,
  copied,
  guideVisible,
  regenOuvert,
  fileInputRef,
  accept,
  formatsLabel,
  taillesLabel,
  onFileSelect,
  onRemoveFile,
  onGenerate,
  onCopy,
  onToggleGuide,
  onToggleRegen,
}) {
  const inputId = useId()
  const titre = titreGuide(guide)
  // Sans guide, toujours visible ; avec guide, seulement derrière « Régénérer » — et
  // pendant une génération, pour que le bouton occupé reste sous les yeux.
  const zoneTeleversementVisible = !guide || regenOuvert || loading

  // Une seule phrase de statut, jamais « prêt » sans guide enregistré.
  const statut = loading
    ? 'Génération du guide en cours…'
    : guide
      ? "Ton guide d'accès est prêt"
      : "Téléverse ta vidéo d'accès, l'agent rédige le guide pour tes voyageurs"

  const zoneTeleversement = (
    <div className="space-y-3">
      <div>
        {/* L'input reste dans le DOM (sr-only) pour le clavier et les lecteurs d'écran ; le
            label stylé est le bouton visible. On évite le bouton natif : le plugin
            @tailwindcss/forms le restyle en clair, ce qui le faisait passer pour l'action
            principale, et son libellé dépend de la locale du navigateur. */}
        <input
          id={inputId}
          type="file"
          ref={fileInputRef}
          accept={accept}
          onChange={onFileSelect}
          disabled={loading}
          className="peer sr-only"
        />
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 peer-focus-visible:ring-2 peer-focus-visible:ring-[#dbae61] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#171714] peer-disabled:pointer-events-none peer-disabled:opacity-50"
          style={{ borderColor: 'rgba(255,255,255,0.28)' }}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {selectedFile ? 'Changer de fichier' : 'Choisir une vidéo ou un audio'}
        </label>
        <AgentNote className="mt-2">
          <strong className="text-white/70">Formats acceptés :</strong> {formatsLabel} ·{' '}
          <strong className="text-white/70">Taille max :</strong> {taillesLabel}
        </AgentNote>
      </div>

      {selectedFile && (
        <div
          className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
          style={{ borderColor: FL.lineDark, backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Video className="h-4 w-4 shrink-0" style={{ color: FL.goldLight }} aria-hidden="true" />
            <span className="truncate text-sm text-white/90">{selectedFile.name}</span>
            <span className="shrink-0 text-xs text-white/50">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
          </div>
          <AgentGhostButton onClick={onRemoveFile} disabled={loading} aria-label="Retirer le fichier" className="!px-1.5">
            <X className="h-4 w-4" aria-hidden="true" />
          </AgentGhostButton>
        </div>
      )}

      <div>
        {/* Le bouton reste grisé tant qu'aucune vidéo n'est sélectionnée : régénérer
            suppose un nouveau média, la vidéo précédente n'étant pas conservée. */}
        <AgentPrimaryButton onClick={onGenerate} disabled={!selectedFile || loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Génération en cours…
            </>
          ) : guide ? (
            <>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Régénérer le guide d'accès
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              Générer le guide d'accès
            </>
          )}
        </AgentPrimaryButton>
        {!selectedFile && !loading && (
          <AgentNote className="mt-2">
            {guide
              ? "Téléverse une nouvelle vidéo pour régénérer : la vidéo précédente n'est pas conservée."
              : 'Téléverse une vidéo pour activer la génération.'}
          </AgentNote>
        )}
      </div>
    </div>
  )

  return (
    <AgentCard>
      <AgentCardHeader icon={Sparkles} name="Agent guide d'accès" status={statut} busy={loading} />

      {/* ── Le résultat, avant les actions ── */}
      {guide && !loading && (
        <AgentTitleBlock
          eyebrow={genereLe ? `Guide d'accès · généré le ${genereLe}` : "Guide d'accès enregistré"}
          title={titre}
        />
      )}

      {/* ── Actions quand un guide existe : lire, copier, régénérer (discret) ── */}
      {guide && !loading && (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <AgentPrimaryButton onClick={onToggleGuide} aria-expanded={guideVisible} aria-controls="guide-acces-texte">
            {guideVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {guideVisible ? 'Masquer le guide' : 'Voir le guide complet'}
          </AgentPrimaryButton>
          <AgentSecondaryButton onClick={onCopy}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? 'Copié' : 'Copier le texte'}
          </AgentSecondaryButton>
          <AgentGhostButton
            onClick={onToggleRegen}
            aria-expanded={regenOuvert}
            aria-controls="guide-acces-regeneration"
            className="sm:ml-auto"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Régénérer
          </AgentGhostButton>
        </div>
      )}

      {/* ── Contenu complet, sur fond clair ── */}
      {guide && !loading && guideVisible && (
        <AgentLightPanel>
          <div id="guide-acces-texte" className="max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {guide}
          </div>
        </AgentLightPanel>
      )}

      {/* ── Téléversement + génération : principal sans guide, replié derrière « Régénérer » sinon ── */}
      {zoneTeleversementVisible && <div id="guide-acces-regeneration">{zoneTeleversement}</div>}

      {error && (
        <AgentError>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </AgentError>
      )}
    </AgentCard>
  )
}
