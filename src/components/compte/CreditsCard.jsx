import { Link } from 'react-router-dom'
import { Coins, FileText, Loader2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react'
import { useCreditBalance } from '../../hooks/useCreditBalance'
import { CARD } from './cardClass'

// Carte Crédits du parcours Fiche Logement Lite (rôle fiche_lite uniquement).
//
// Le solde vient du hook partagé avec /mes-credits et le dashboard : RPC
// `get_credit_balance`, recalculé depuis le ledger côté serveur. Jamais une valeur
// figée ni un calcul côté front — les trois écrans affichent donc le même chiffre.
// Aucune écriture ici : l'achat et l'historique vivent sur /mes-credits.
export default function CreditsCard() {
  const { balance, loading, error, refresh } = useCreditBalance()

  return (
    <div className={CARD}>
      <div className="flex items-center gap-3 mb-6">
        <Coins className="w-6 h-6 text-[#dbae61]" />
        <h2 className="text-xl font-bold text-black">Crédits</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Chargement de votre solde…</span>
        </div>
      ) : error ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Impossible de récupérer votre solde</p>
              <p className="text-sm text-red-500">Vérifiez votre connexion, puis réessayez.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      ) : (
        <div>
          {balance === 0 ? (
            <>
              <p className="text-2xl font-bold text-gray-900">Vous n'avez pas encore de crédits</p>
              <p className="text-gray-600 mt-1">Rechargez votre compte pour créer votre première fiche logement.</p>
            </>
          ) : (
            <>
              <p className="text-gray-600">Il vous reste</p>
              <p className="text-4xl font-bold text-gray-900 leading-tight">
                {balance} <span className="text-2xl font-semibold">crédit{balance > 1 ? 's' : ''}</span>
              </p>
            </>
          )}
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#dbae61]" />
            1 crédit = 1 fiche logement · sans expiration
          </p>
          <Link
            to="/mes-credits"
            className="mt-6 inline-flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
          >
            Gérer mes crédits
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
