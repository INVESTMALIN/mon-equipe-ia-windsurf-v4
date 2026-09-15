import { Link } from 'react-router-dom'
import { Coins, ArrowRight, Loader2 } from 'lucide-react'
import { Section, EtatIndisponible } from './Section'

// Bloc « Mes crédits », volontairement compact : quatre chiffres et un lien vers
// /mes-credits pour le détail et la recharge. Le solde vient du RPC (source
// d'autorité) ; achetés, consommés et rechargements viennent du ledger. Aucune
// équation « achetés − consommés = solde » n'est affichée : les crédits offerts et
// les corrections de l'équipe expliquent l'écart, on le dit quand c'est le cas.
export default function CreditsResume({ credits, solde, soldeLoading, soldeError, onRetrySolde, ledgerLoading, erreurLedger, onRetryLedger }) {
  const ecartExplique = credits && (credits.offerts > 0 || credits.corrections > 0)

  return (
    <Section icone={Coins} titre="Mes crédits" sousTitre="1 crédit = 1 fiche logement, sans expiration">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Chiffre libelle="Solde actuel" valeur={solde} loading={soldeLoading} error={soldeError} accent />
        <Chiffre libelle="Crédits achetés" valeur={credits?.achetes} loading={ledgerLoading} error={erreurLedger} />
        <Chiffre libelle="Consommés pour créer des fiches" valeur={credits?.consommes} loading={ledgerLoading} error={erreurLedger} />
        <Chiffre libelle="Rechargements" valeur={credits?.rechargements} loading={ledgerLoading} error={erreurLedger} />
      </dl>

      {(soldeError || erreurLedger) && (
        <div className="mt-4 space-y-2">
          {soldeError && <EtatIndisponible compact message="Le solde n’a pas pu être lu." onRetry={onRetrySolde} />}
          {erreurLedger && <EtatIndisponible compact message="L’historique des crédits n’a pas pu être lu." onRetry={onRetryLedger} />}
        </div>
      )}

      {ecartExplique && (
        <p className="mt-4 text-sm text-gray-600">
          Le solde tient aussi compte de{' '}
          {credits.offerts > 0 && <strong>{credits.offerts} crédit{credits.offerts > 1 ? 's' : ''} offert{credits.offerts > 1 ? 's' : ''}</strong>}
          {credits.offerts > 0 && credits.corrections > 0 && ' et de '}
          {credits.corrections > 0 && <strong>{credits.corrections} crédit{credits.corrections > 1 ? 's' : ''} retiré{credits.corrections > 1 ? 's' : ''} par correction</strong>}
          {' '}par l’équipe.
        </p>
      )}

      <Link
        to="/mes-credits"
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbae61]"
      >
        Voir le détail ou recharger
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Section>
  )
}

function Chiffre({ libelle, valeur, loading, error, accent }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${accent ? 'bg-[#dbae61]/10' : 'bg-gray-50'}`}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{libelle}</dt>
      <dd className="mt-1 text-2xl font-extrabold leading-none text-gray-900">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" aria-label="Chargement" />
        ) : error || valeur === null || valeur === undefined ? (
          <span className="text-base font-semibold text-gray-500">Indisponible</span>
        ) : (
          valeur
        )}
      </dd>
    </div>
  )
}
