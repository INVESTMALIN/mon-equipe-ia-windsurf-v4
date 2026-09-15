import { AlertCircle, RefreshCw } from 'lucide-react'
import { CARD } from '../compte/cardClass'

// Briques de présentation de /mes-statistiques. Aucune logique de calcul ici (cf.
// lib/ficheStats.js) : uniquement le cadre des sections et les états partagés.

// Carte de section : titre en h2, icône dorée, sous-titre humain optionnel.
export function Section({ icone: Icone, titre, sousTitre, children, className = '' }) {
  return (
    <section className={`${CARD} ${className}`} aria-labelledby={`section-${slug(titre)}`}>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {Icone && <Icone className="h-6 w-6 shrink-0 text-[#dbae61]" aria-hidden="true" />}
          <h2 id={`section-${slug(titre)}`} className="text-xl font-bold text-gray-900">{titre}</h2>
        </div>
        {sousTitre && <p className="mt-1 text-sm text-gray-500">{sousTitre}</p>}
      </div>
      {children}
    </section>
  )
}

// État d'erreur localisé : jamais un zéro à la place d'une donnée qui n'a pas pu être
// lue. Le bouton relance UNIQUEMENT la source concernée.
export function EtatIndisponible({ message = 'Ces données sont indisponibles pour le moment.', onRetry, compact = false }) {
  return (
    <div
      role="status"
      className={`flex ${compact ? 'flex-col items-start gap-2' : 'flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'} rounded-xl border border-red-200 bg-red-50 px-4 py-3`}
    >
      <div className="flex items-start gap-2 text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbae61]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Réessayer
        </button>
      )}
    </div>
  )
}

// État vide sobre (aucune fiche, rien à compléter…), avec une action optionnelle.
export function EtatVide({ titre, texte, action }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
      <p className="font-semibold text-gray-900">{titre}</p>
      {texte && <p className="mt-1 text-sm text-gray-600">{texte}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

function slug(texte) {
  return String(texte)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
}
