import { Link } from 'react-router-dom'
import { AlertCircle, Loader2, RefreshCw, ArrowRight } from 'lucide-react'
import { CARD } from '../compte/cardClass'

// Indicateur principal de la vue d'ensemble : un chiffre lisible, un libellé, un
// détail qui rend le chiffre compréhensible. Trois états : valeur, chargement,
// indisponible (avec relance de la seule source concernée). Jamais un « 0 » qui
// masquerait une erreur.
export default function KpiCard({ icone: Icone, libelle, valeur, detail, loading, error, onRetry, lien }) {
  return (
    <div className={`${CARD} flex flex-col`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
        {Icone && <Icone className="h-4 w-4 shrink-0 text-[#dbae61]" aria-hidden="true" />}
        <span>{libelle}</span>
      </div>

      {loading ? (
        <div className="mt-3 flex items-center gap-2 text-gray-400" role="status">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Chargement…</span>
        </div>
      ) : error ? (
        <div className="mt-3" role="status">
          <p className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            Indisponible
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbae61]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Réessayer
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="mt-2 text-4xl font-extrabold leading-none tracking-tight text-gray-900">{valeur}</p>
          {detail && <p className="mt-2 text-sm text-gray-500">{detail}</p>}
        </>
      )}

      {lien && !loading && !error && (
        <Link
          to={lien.to}
          className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-[#8b7355] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbae61] rounded"
        >
          {lien.libelle}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
