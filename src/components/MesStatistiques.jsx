import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import LitePageHeader from './fiche/LitePageHeader'
import { ClipboardList, CheckCircle2, Layers, Coins, RefreshCw } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { getUserFiches, getAnnoncesDisponibles, getMouvementsCredits } from '../lib/supabaseHelpers'
import { useCreditBalance } from '../hooks/useCreditBalance'
import { calculerStats } from '../lib/ficheStats'
import KpiCard from './stats/KpiCard'
import InventaireFiches from './stats/InventaireFiches'
import CouvertureLivrables from './stats/CouvertureLivrables'
import FichesACompleter from './stats/FichesACompleter'
import CreditsResume from './stats/CreditsResume'
import ActiviteRecente from './stats/ActiviteRecente'
import { CARD } from './compte/cardClass'

// /mes-statistiques — vue synthétique de l'activité d'un concierge Fiche Logement Lite.
//
// Réservée au rôle fiche_lite : le gating est fait PAR LA ROUTE (ProtectedRoute
// `onlyRoles`), avant tout rendu ; cette page n'a donc aucun contenu à cacher.
//
// ── Données : quatre sources, une page (1 000 lignes) = une requête ─────────────
// Chaque source est lue page par page jusqu'à épuisement (lireToutesLesPages) : un
// compte ordinaire tient en une requête par source, un compte très actif en quelques-
// unes, et rien n'est tronqué en silence par le plafond max-rows de PostgREST.
//   1. fiches       getUserFiches         (même projection que le dashboard, sans JSON)
//   2. annonces     getAnnoncesDisponibles (même contrat que les badges, une ligne par
//                                          couple fiche × plateforme, jamais le contenu)
//   3. mouvements   getMouvementsCredits   (amount, type, date : pas de métadonnées)
//   4. solde        RPC get_credit_balance (source d'autorité, jamais recalculé ici)
// Aucune requête par fiche. Tout le calcul est dans lib/ficheStats.js (pur, testé).
//
// ── Échecs partiels ──────────────────────────────────────────────────────────────
// Les fiches sont la colonne vertébrale : sans elles, la page affiche une erreur avec
// relance. Chaque autre source a son propre état d'erreur et sa propre relance ; une
// donnée illisible s'affiche « Indisponible », jamais « 0 ».

// Chargeur d'une source : état { data, loading, error } + relance. Un numéro de
// séquence garantit qu'une réponse lente partie en premier n'écrase pas une réponse
// plus récente (même idiome que MesCredits).
function useSource(charger, actif) {
  const [etat, setEtat] = useState({ data: null, loading: true, error: null })
  const seq = useRef(0)
  const lancer = useCallback(async () => {
    if (!actif) return
    const n = ++seq.current
    setEtat((e) => ({ ...e, loading: true, error: null }))
    let res
    try {
      res = await charger()
    } catch (e) {
      res = { success: false, error: e?.message || 'Erreur inattendue' }
    }
    if (n !== seq.current) return
    if (res?.success) setEtat({ data: res.data, loading: false, error: null })
    else setEtat({ data: null, loading: false, error: res?.error || 'Erreur' })
  }, [charger, actif])
  useEffect(() => { lancer() }, [lancer])
  return { ...etat, refresh: lancer }
}

export default function MesStatistiques() {
  const [user, setUser] = useState(null)
  const [userError, setUserError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data, error }) => {
      if (cancelled) return
      if (error || !data?.user) setUserError(true)
      else setUser(data.user)
    })
    return () => { cancelled = true }
  }, [])

  const userId = user?.id
  const chargerFiches = useCallback(() => getUserFiches(userId), [userId])
  const chargerAnnonces = useCallback(() => getAnnoncesDisponibles(userId), [userId])
  const chargerMouvements = useCallback(() => getMouvementsCredits(userId), [userId])

  const fiches = useSource(chargerFiches, Boolean(userId))
  const annonces = useSource(chargerAnnonces, Boolean(userId))
  const mouvements = useSource(chargerMouvements, Boolean(userId))
  const solde = useCreditBalance()

  const stats = useMemo(() => {
    if (!fiches.data) return null
    return calculerStats({
      fiches: fiches.data,
      annonces: annonces.data,
      mouvements: mouvements.data,
      now: Date.now(),
    })
  }, [fiches.data, annonces.data, mouvements.data])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête commun des pages secondaires Lite (cf. fiche/LitePageHeader). */}
      <LitePageHeader titre="Mes statistiques" sousTitre="Une vue claire de vos fiches et de leurs livrables" />

      {/* pb-28 : réserve la zone du bouton d'aide flottant du parcours. */}
      <main className="max-w-6xl mx-auto px-6 py-8 pb-28">
        {userError || fiches.error ? (
          <div className={`${CARD} mx-auto max-w-md text-center`} role="alert">
            <p className="text-lg font-semibold text-gray-900">Impossible de charger vos statistiques</p>
            <p className="mt-1 text-gray-600">Vérifiez votre connexion, puis réessayez.</p>
            <button
              type="button"
              onClick={() => (userError ? window.location.reload() : fiches.refresh())}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#dbae61] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#c49a4f] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#dbae61]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Réessayer
            </button>
          </div>
        ) : !stats ? (
          <div className="flex items-center justify-center py-24" role="status">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#dbae61]" />
              <p className="text-gray-600">Chargement de vos statistiques…</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Bloc 1 — Vue d'ensemble */}
            <section aria-label="Vue d’ensemble" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                icone={ClipboardList}
                libelle="Fiches existantes"
                valeur={stats.inventaire.total}
                detail={`${stats.inventaire.actives} active${stats.inventaire.actives > 1 ? 's' : ''} · ${stats.inventaire.archivees} archivée${stats.inventaire.archivees > 1 ? 's' : ''}`}
              />
              <KpiCard
                icone={CheckCircle2}
                libelle="Fiches complétées"
                valeur={stats.inventaire.completeesActives}
                detail={`sur ${stats.inventaire.actives} fiche${stats.inventaire.actives > 1 ? 's' : ''} active${stats.inventaire.actives > 1 ? 's' : ''}`}
              />
              <KpiCard
                icone={Layers}
                libelle="Livrables disponibles"
                valeur={stats.couverture?.totalLivrables}
                detail={
                  stats.couverture
                    ? `${stats.couverture.pdf} PDF · ${stats.couverture.airbnb} Airbnb · ${stats.couverture.booking} Booking · ${stats.couverture.guide} guide${stats.couverture.guide > 1 ? 's' : ''}`
                    : null
                }
                loading={annonces.loading}
                error={annonces.error}
                onRetry={annonces.refresh}
              />
              <KpiCard
                icone={Coins}
                libelle="Crédits restants"
                valeur={solde.balance}
                detail="1 crédit = 1 fiche logement"
                loading={solde.loading}
                error={solde.error}
                onRetry={solde.refresh}
                lien={{ to: '/mes-credits', libelle: 'Recharger' }}
              />
            </section>

            {/* Bloc 2 — Mes fiches */}
            <InventaireFiches inventaire={stats.inventaire} creations={stats.creations} />

            {/* Bloc 3 — Mes livrables */}
            {annonces.loading ? (
              <ChargementSection titre="Mes livrables" />
            ) : (
              <CouvertureLivrables
                couverture={stats.couverture}
                erreurAnnonces={Boolean(annonces.error)}
                onRetryAnnonces={annonces.refresh}
              />
            )}

            {/* Bloc 4 — Fiches à compléter */}
            {annonces.loading ? (
              <ChargementSection titre="Fiches à compléter" />
            ) : (
              <FichesACompleter
                aCompleter={stats.aCompleter}
                fichesActives={stats.fichesActives.length}
                erreurAnnonces={Boolean(annonces.error)}
                onRetryAnnonces={annonces.refresh}
              />
            )}

            {/* Bloc 5 — Mes crédits */}
            <CreditsResume
              credits={stats.credits}
              solde={solde.balance}
              soldeLoading={solde.loading}
              soldeError={solde.error}
              onRetrySolde={solde.refresh}
              ledgerLoading={mouvements.loading}
              erreurLedger={Boolean(mouvements.error)}
              onRetryLedger={mouvements.refresh}
            />

            {/* Bloc 6 — Activité récente */}
            <ActiviteRecente activite={stats.activite} annoncesIndisponibles={Boolean(annonces.error)} />
          </div>
        )}
      </main>
    </div>
  )
}

function ChargementSection({ titre }) {
  return (
    <section className={CARD} aria-label={titre} role="status">
      <h2 className="text-xl font-bold text-gray-900">{titre}</h2>
      <p className="mt-3 text-sm text-gray-500">Chargement…</p>
    </section>
  )
}
