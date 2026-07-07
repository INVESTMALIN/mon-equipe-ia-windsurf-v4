import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Coins, Loader2, AlertCircle, RefreshCw, Check, Lock, FileText,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

// Packs de crédits — tarification validée, EN DUR (pas de table en base, pas de
// Stripe dans cette brique). Les crédits sont à vie (sans expiration).
const PACKS = [
  { credits: 1, prix: 5, unite: 5 },
  { credits: 10, prix: 25, unite: 2.5 },
  { credits: 20, prix: 40, unite: 2 },
  { credits: 50, prix: 50, unite: 1, meilleur: true },
]

// Format euro FR : entier sans décimale (5 €), sinon 2 décimales (2,50 €).
const eur = (n) =>
  n.toLocaleString('fr-FR', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })

export default function MesCredits() {
  const navigate = useNavigate()

  // Solde : jamais calculé côté front, toujours issu du RPC get_credit_balance.
  const [solde, setSolde] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [paiementInfo, setPaiementInfo] = useState(false)

  const fetchSolde = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      // Sans argument : le défaut auth.uid() côté fonction renvoie le solde du user connecté.
      const { data, error: rpcError } = await supabase.rpc('get_credit_balance')
      if (rpcError) {
        setError(true)
        setSolde(null)
      } else {
        setSolde(data ?? 0)
      }
    } catch (err) {
      // Rejet brut de la promesse (réseau coupé, client injoignable…) : Supabase ne
      // renvoie pas toujours l'erreur dans rpcError, on couvre aussi ce cas.
      setError(true)
      setSolde(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSolde()
  }, [fetchSolde])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes crédits</h1>
              <p className="text-gray-600 mt-1">Rechargez votre compte pour créer vos fiches logement</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800 font-medium px-4 py-3 transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 mr-2 inline" />
              Tableau de bord
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ─── Bloc solde ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {loading ? (
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Chargement de votre solde…</span>
            </div>
          ) : error ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3 text-red-600">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Impossible de récupérer votre solde</p>
                  <p className="text-sm text-red-500">Vérifiez votre connexion, puis réessayez.</p>
                </div>
              </div>
              <button
                onClick={fetchSolde}
                className="inline-flex items-center justify-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-16 h-16 shrink-0 bg-[#dbae61] bg-opacity-15 rounded-2xl flex items-center justify-center">
                <Coins className="w-8 h-8 text-[#dbae61]" />
              </div>
              <div className="flex-1">
                {solde === 0 ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900">Vous n'avez pas encore de crédits</p>
                    <p className="text-gray-600 mt-1">
                      Choisissez un pack ci-dessous pour créer votre première fiche logement.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600">Il vous reste</p>
                    <p className="text-4xl font-bold text-gray-900 leading-tight">
                      {solde} <span className="text-2xl font-semibold">crédit{solde > 1 ? 's' : ''}</span>
                    </p>
                  </>
                )}
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#dbae61]" />
                  1 crédit = 1 fiche logement · sans expiration
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Cartes de packs ─── */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Recharger des crédits</h2>
          <p className="text-gray-600 mb-5">Plus le pack est grand, moins la fiche coûte cher. Vos crédits n'expirent jamais.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PACKS.map((pack) => (
              <div
                key={pack.credits}
                className={`relative bg-white rounded-2xl shadow-sm p-6 flex flex-col border ${
                  pack.meilleur ? 'border-[#dbae61] ring-1 ring-[#dbae61]' : 'border-gray-100'
                }`}
              >
                {pack.meilleur && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#dbae61] text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    Meilleur prix
                  </span>
                )}

                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">
                    {pack.credits === 1 ? 'Pack découverte' : `Pack ${pack.credits} fiches`}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {pack.credits} <span className="text-lg font-semibold text-gray-600">crédit{pack.credits > 1 ? 's' : ''}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{eur(pack.unite)} € / fiche</p>

                  <p className="mt-4 text-4xl font-extrabold text-[#dbae61]">{eur(pack.prix)} €</p>
                </div>

                <button
                  onClick={() => setPaiementInfo(true)}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Acheter
                </button>
              </div>
            ))}
          </div>

          {paiementInfo && (
            <div className="mt-5 flex items-center gap-2 bg-[#dbae61] bg-opacity-10 border border-[#dbae61] text-[#a07c32] px-4 py-3 rounded-xl">
              <Check className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Le paiement en ligne arrive très bientôt. Merci de votre patience !</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
