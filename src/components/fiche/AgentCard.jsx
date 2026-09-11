// src/components/fiche/AgentCard.jsx
//
// Primitives visuelles PARTAGÉES par les deux cartes d'agent de la fiche (Agent Annonce
// dans la finalisation, Agent guide d'accès dans la section Guide d'Accès).
//
// Elles reprennent la direction artistique de la carte « Assistant » de la landing
// /fiche-logement (FicheLogementPreviews.AnnoncePreview) : fond anthracite, texte
// ivoire, accents dorés mesurés, titre en serif. Les jetons viennent de
// lib/ficheLogementTheme — SOURCE UNIQUE de la palette, on n'en redéfinit aucun ici.
//
// Ce fichier ne contient AUCUNE logique métier : pas de Supabase, pas de génération,
// pas d'état. Chaque carte garde sa logique et n'emprunte ici que de la présentation,
// pour que les deux cartes restent visuellement le même objet.
//
// Hiérarchie voulue une fois le contenu généré : le RÉSULTAT (titre) attire l'œil,
// l'action principale est ivoire (« Voir … complète »), l'action secondaire est un
// contour, et la régénération n'est qu'un lien discret. Le texte complet déplié
// s'affiche sur fond clair (AgentLightPanel) pour une lecture confortable.

import { ChevronDown, Loader2 } from 'lucide-react'
import { FL } from '../../lib/ficheLogementTheme'

// Anneau de focus clavier lisible sur fond sombre : doré, décalé de la couleur de la carte.
const FOCUS_RING =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbae61] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171714]'

const BUTTON_BASE = `inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors disabled:cursor-not-allowed ${FOCUS_RING}`

// ─────────────────────────────────────────────────────────────────────────────
// Conteneur
// ─────────────────────────────────────────────────────────────────────────────

/** Carte anthracite. `as` permet de garder la sémantique du conteneur d'origine. */
export function AgentCard({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl p-5 sm:p-6 space-y-5 ${className}`}
      style={{ backgroundColor: FL.ink, color: '#ffffff', boxShadow: '0 30px 50px -40px rgba(23,23,20,0.9)' }}
    >
      {children}
    </section>
  )
}

/**
 * En-tête compact : carré doré avec l'icône, nom de l'assistant en capitales espacées,
 * ligne de statut en dessous. Le statut est la SEULE phrase qui dit où on en est
 * (« prête », « aucune », « chargement… ») : on ne la duplique pas ailleurs.
 */
export function AgentCardHeader({ icon, name, status, busy = false }) {
  const Icon = icon
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: FL.gold }}
        aria-hidden="true"
      >
        <Icon className="h-[18px] w-[18px]" style={{ color: FL.ink }} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: FL.gold }}>
          {name}
        </h3>
        <p className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-white/75">
          {busy && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />}
          <span className="min-w-0">{status}</span>
        </p>
      </div>
    </div>
  )
}

/**
 * Bloc de résultat : surtitre en capitales dorées + titre en serif ivoire. C'est lui qui
 * doit attirer l'attention avant les actions. `title` vide → seul le surtitre est rendu
 * (cas d'un guide sans ligne de titre exploitable).
 */
export function AgentTitleBlock({ eyebrow, title }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: FL.goldLight }}>
        {eyebrow}
      </p>
      {title ? (
        <p className="mt-1.5 font-serif text-xl leading-snug text-white sm:text-2xl">{title}</p>
      ) : null}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Boutons — trois niveaux, jamais plus
// ─────────────────────────────────────────────────────────────────────────────

/** Action principale : pavé ivoire, texte encre. */
export function AgentPrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`${BUTTON_BASE} px-5 py-3 disabled:opacity-60 ${className}`}
      style={{ backgroundColor: FL.paper, color: FL.ink }}
      {...props}
    >
      {children}
    </button>
  )
}

/** Action secondaire : contour ivoire, texte ivoire. Bien visible, mais en retrait. */
export function AgentSecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`${BUTTON_BASE} border px-5 py-3 text-white hover:bg-white/10 disabled:opacity-50 ${className}`}
      style={{ borderColor: 'rgba(255,255,255,0.28)' }}
      {...props}
    >
      {children}
    </button>
  )
}

/** Action discrète : simple texte, pour la régénération et les aides. */
export function AgentGhostButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`${BUTTON_BASE} rounded-lg px-2 py-2 text-white/60 hover:text-white disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Sélecteur à deux positions (Airbnb / Booking). `aria-pressed` porte l'état pour le
 * clavier et les lecteurs d'écran ; la position active est ivoire, l'autre en retrait.
 */
export function AgentSegmented({ label, options, value, onChange, disabled = false }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-lg border p-1"
      style={{ borderColor: FL.lineDark, backgroundColor: 'rgba(255,255,255,0.05)' }}
    >
      {options.map(([key, text]) => {
        const active = key === value
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(key)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${FOCUS_RING} ${
              active ? '' : 'text-white/60 hover:text-white'
            }`}
            style={active ? { backgroundColor: FL.paper, color: FL.ink } : undefined}
          >
            {text}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Panneaux
// ─────────────────────────────────────────────────────────────────────────────

/** Contenu déplié : fond papier, texte encre — lisible longtemps. */
export function AgentLightPanel({ children, className = '' }) {
  return (
    <div
      className={`rounded-xl border p-4 text-sm sm:p-5 ${className}`}
      style={{ backgroundColor: FL.paper, color: FL.ink, borderColor: FL.line }}
    >
      {children}
    </div>
  )
}

/** Erreur : panneau clair rouge, pour rester lisible sur l'anthracite. */
export function AgentError({ children }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {children}
    </div>
  )
}

/** Remarque discrète sous une action. */
export function AgentNote({ children, className = '' }) {
  return <p className={`text-xs leading-relaxed text-white/50 ${className}`}>{children}</p>
}

/**
 * Aide dépliable. Le bouton porte `aria-expanded` et `aria-controls` ; le contenu est
 * rendu dans un panneau clair pour ne pas concurrencer le résultat.
 */
export function AgentDisclosure({ id, label, open, onToggle, children }) {
  return (
    <div>
      <AgentGhostButton aria-expanded={open} aria-controls={id} onClick={onToggle} className="-ml-2 justify-start text-left">
        {label}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </AgentGhostButton>
      {open && (
        <AgentLightPanel className="mt-2 space-y-2">
          <div id={id}>{children}</div>
        </AgentLightPanel>
      )}
    </div>
  )
}
