import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Coins, Loader2, AlertCircle, RefreshCw, CreditCard, FileText,
  CheckCircle, Clock, Info, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useCreditBalance } from '../hooks/useCreditBalance'

// Packs de crédits — l'`id` est le lookup_key Stripe. Le front n'envoie QUE cet id au
// serveur : ni montant, ni price_id, ni nombre de crédits, ni user_id (le serveur résout
// tout ça). Les prix/quantités ci-dessous ne servent QU'À l'affichage.
const PACKS = [
  { id: 'pack_1', credits: 1, prix: 5, unite: 5 },
  { id: 'pack_10', credits: 10, prix: 25, unite: 2.5 },
  { id: 'pack_20', credits: 20, prix: 40, unite: 2 },
  { id: 'pack_50', credits: 50, prix: 50, unite: 1, meilleur: true },
]

// Libellés d'affichage par type de mouvement. Fallback sur description/type pour accueillir
// un futur type (ex. debit_fiche) sans réécriture.
const MOVEMENT_LABELS = {
  achat: 'Achat de crédits',
  debit_fiche: 'Fiche logement créée',
}

// Poll du retour Stripe : la redirection navigateur et la livraison du webhook sont deux
// chemins indépendants. On attend qu'apparaisse la ligne du ledger de CETTE session.
const CONFIRM_MAX_ATTEMPTS = 15
const CONFIRM_INTERVAL_MS = 2000

// Format euro FR : entier sans décimale (5 €), sinon 2 décimales (2,50 €).
const eur = (n) =>
  n.toLocaleString('fr-FR', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })

export default function MesCredits() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Solde : toujours issu du RPC, jamais calculé côté front (hook partagé).
  const { balance: solde, loading, error, refresh } = useCreditBalance()

  // Historique des mouvements (RLS : chaque user ne voit que ses lignes).
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  // Achat en cours (id du pack) : bloque tous les boutons + anti double-clic.
  const [purchasingPack, setPurchasingPack] = useState(null)
  const [purchaseError, setPurchaseError] = useState(null) // 'refus' | 'incident'

  // Retour Stripe, lu UNE fois au montage puis retiré de l'URL (pas de rejeu au refresh).
  const [checkoutReturn, setCheckoutReturn] = useState(null) // { status, sessionId }
  const [confirming, setConfirming] = useState(false)
  const [confirmOutcome, setConfirmOutcome] = useState(null) // 'credited' | 'pending'
  const [creditedAmount, setCreditedAmount] = useState(null)

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    // Scope EXPLICITE au user courant : ne PAS dépendre de la seule RLS. La policy
    // admin (credit_ledger_select_admin) laisse un admin lire TOUTES les lignes ; sans
    // ce filtre, un compte admin verrait ici l'historique de tous les utilisateurs.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setHistory([]); setHistoryLoading(false); return }
    const { data, error: histError } = await supabase
      .from('credit_ledger')
      .select('id, amount, type, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20) // on ne charge jamais tout le ledger
    if (!histError) setHistory(data || [])
    setHistoryLoading(false)
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Cherche la ligne de crédit de CETTE session pour le user courant. Scope explicite
  // par user_id (pas seulement la RLS, cf. policy admin). Renvoie la ligne ou null.
  const findSessionCredit = useCallback(async (sessionId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('credit_ledger')
      .select('amount')
      .eq('user_id', user.id)
      .eq('metadata->>stripe_session_id', sessionId)
      .limit(1)
      .maybeSingle()
    return data || null
  }, [])

  // 1) Lecture du query param au montage, puis nettoyage immédiat (replace, sans reload).
  useEffect(() => {
    const status = searchParams.get('checkout')
    if (status === 'success' || status === 'cancel') {
      setCheckoutReturn({ status, sessionId: searchParams.get('session_id') })
      setSearchParams({}, { replace: true })
    }
    // Volontairement au montage uniquement (on capture l'état d'arrivée).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) Sur retour "success" : attendre que la ligne du ledger de cette session apparaisse.
  useEffect(() => {
    if (checkoutReturn?.status !== 'success' || !checkoutReturn.sessionId) return

    let cancelled = false
    let attempts = 0
    const sessionId = checkoutReturn.sessionId
    setConfirming(true)
    setConfirmOutcome(null)

    const tick = async () => {
      attempts += 1
      // Condition déterministe : la ligne de CE user pour CETTE session existe.
      const row = await findSessionCredit(sessionId)

      if (cancelled) return

      if (row) {
        setCreditedAmount(row.amount)
        setConfirmOutcome('credited')
        setConfirming(false)
        await refresh()
        await fetchHistory()
        await fetchInvoices()
        return
      }

      if (attempts >= CONFIRM_MAX_ATTEMPTS) {
        // Pas un échec : le paiement est confirmé par Stripe, le crédit tarde juste.
        setConfirmOutcome('pending')
        setConfirming(false)
        await refresh()
        return
      }

      setTimeout(tick, CONFIRM_INTERVAL_MS)
    }

    tick()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutReturn])

  // Bouton "Actualiser" de l'état "en attente" : ré-interroge la session. Si le webhook
  // est arrivé après le plafond, on bascule en "confirmé" (bandeau + montant), et dans
  // tous les cas on rafraîchit solde ET historique — pas seulement le solde.
  const retryConfirm = useCallback(async () => {
    const sessionId = checkoutReturn?.sessionId
    const row = sessionId ? await findSessionCredit(sessionId) : null
    if (row) {
      setCreditedAmount(row.amount)
      setConfirmOutcome('credited')
    }
    await refresh()
    await fetchHistory()
    await fetchInvoices()
  }, [checkoutReturn, findSessionCredit, refresh, fetchHistory, fetchInvoices])

  const handlePurchase = async (pack) => {
    if (purchasingPack) return // anti double-clic : une seule session à la fois
    setPurchaseError(null)
    setPurchasingPack(pack.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setPurchaseError('incident')
        setPurchasingPack(null)
        return
      }

      const res = await fetch('/api/create-credit-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ pack: pack.id }), // uniquement l'id du pack
      })

      if (res.ok) {
        const data = await res.json()
        window.location.href = data.url // redirection Stripe (l'état "purchasing" persiste)
        return
      }

      // 403 = refus (rôle non éligible) ≠ 5xx/réseau = incident. Message différent.
      setPurchaseError(res.status === 403 ? 'refus' : 'incident')
      setPurchasingPack(null)
    } catch {
      setPurchaseError('incident')
      setPurchasingPack(null)
    }
  }

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
        {/* ─── Bandeau retour Stripe : crédité / crédit en attente ─── */}
        {/* (L'état "validation en cours" est porté par le bloc solde ci-dessous, qui n'affiche */}
        {/*  alors AUCUN chiffre — on ne présente jamais l'ancien solde comme final.) */}
        {confirmOutcome === 'credited' && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">
              Paiement confirmé.{creditedAmount ? ` ${creditedAmount} crédit${creditedAmount > 1 ? 's' : ''} ajouté${creditedAmount > 1 ? 's' : ''} à votre compte.` : ' Vos crédits ont été ajoutés.'}
            </span>
          </div>
        )}
        {confirmOutcome === 'pending' && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl">
            <Clock className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              {/* Copie NEUTRE et conditionnelle : la ligne du ledger n'est pas encore là, on */}
              {/* n'affirme pas le paiement (URL forgeable). Jamais "erreur" ni "échec". */}
              <p className="font-medium">Validation de votre paiement en cours.</p>
              <p className="text-blue-700">Si votre paiement a bien été confirmé, vos crédits apparaîtront ici sous peu.</p>
              <button onClick={retryConfirm} className="mt-1 inline-flex items-center gap-1.5 font-semibold underline hover:no-underline">
                <RefreshCw className="w-3.5 h-3.5" />
                Actualiser le solde
              </button>
            </div>
          </div>
        )}

        {checkoutReturn?.status === 'cancel' && (
          <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl">
            <Info className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Paiement annulé — aucun crédit n'a été débité.</span>
          </div>
        )}

        {/* ─── Bloc solde ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {confirming ? (
            // Retour de paiement : aucun chiffre tant que le crédit n'est pas confirmé
            // (jamais l'ancien solde présenté comme final). Copie NEUTRE : on n'affirme PAS
            // qu'un paiement a été reçu tant que la ligne du ledger ne le prouve pas — le
            // query param `checkout=success` est forgeable/partageable.
            <div className="flex items-center gap-3 text-[#a07c32]">
              <Loader2 className="w-6 h-6 shrink-0 animate-spin" />
              <div>
                <p className="font-semibold text-gray-900">Validation de votre paiement…</p>
                <p className="text-sm text-gray-500">Vos crédits apparaîtront ici dès confirmation.</p>
              </div>
            </div>
          ) : loading ? (
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
                onClick={refresh}
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

          {purchaseError && (
            <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">
                {purchaseError === 'refus'
                  ? "Votre compte n'a pas accès à l'achat de crédits."
                  : "Le paiement n'a pas pu être lancé. Réessayez dans un instant."}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PACKS.map((pack) => {
              const isThisLoading = purchasingPack === pack.id
              const anyLoading = purchasingPack !== null
              return (
                <div
                  key={pack.id}
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
                    onClick={() => handlePurchase(pack)}
                    disabled={anyLoading}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    {isThisLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirection…
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Acheter
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── Historique des mouvements ─── */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {historyLoading ? (
              <div className="flex items-center gap-3 text-gray-500 px-6 py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Chargement de l'historique…</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center px-6 py-12">
                <Coins className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-gray-500 font-medium mt-3">Aucun mouvement pour le moment</p>
                <p className="text-gray-400 text-sm mt-1">Vos achats et utilisations de crédits apparaîtront ici.</p>
              </div>
            ) : (
              <ul>
                {history.map((mvt, index) => {
                  const positif = mvt.amount > 0
                  return (
                    <li
                      key={mvt.id}
                      className={`flex items-center justify-between gap-4 px-6 py-4 ${
                        index !== history.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${positif ? 'bg-green-100' : 'bg-red-100'}`}>
                          {positif
                            ? <ArrowUpRight className="w-4 h-4 text-green-700" />
                            : <ArrowDownRight className="w-4 h-4 text-red-700" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {MOVEMENT_LABELS[mvt.type] || mvt.description || mvt.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(mvt.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'long', year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`font-semibold whitespace-nowrap ${positif ? 'text-green-700' : 'text-red-700'}`}>
                          {positif ? '+' : ''}{mvt.amount} crédit{Math.abs(mvt.amount) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          {!historyLoading && history.length === 20 && (
            <p className="text-xs text-gray-400 mt-2">Seuls les 20 derniers mouvements sont affichés.</p>
          )}
        </div>
      </div>
    </div>
  )
}
