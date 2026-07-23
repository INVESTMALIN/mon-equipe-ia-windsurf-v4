import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Search, AlertCircle, ChevronLeft, ChevronRight, Unlink } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { formatEuros, formatDateFacture } from '../../lib/invoiceFormat'
import { DriveLink, NumeroFacture } from './AdminUserInvoices'

const PER_PAGE = 25
const SEARCH_DEBOUNCE_MS = 350

// Page globale /admin/invoices — TOUTES les factures archivées, orphelines comprises
// (ventes Invest Malin hors plateforme : `user_id` null, durablement). La colonne
// « Compte » rend les orphelines visibles sans écran séparé.
//
// Lecture DIRECTE depuis le client, pas d'endpoint serverless (plafond Hobby 10/12) :
// la policy RLS `invoices_select_admin` porte la garantie en base. La recherche est
// exécutée côté Postgres (ilike) : elle porte sur l'ENSEMBLE des factures, pas
// seulement sur la page affichée.
//
// Seul emprunt serverless : /api/admin-list-users (endpoint EXISTANT) pour résoudre
// user_id → email de compte. Nécessaire parce que la table `users` n'a volontairement
// aucune policy RLS de lecture admin (hardening PR #33-37) — un embed PostgREST
// reviendrait vide côté client.

// La syntaxe .or() de PostgREST se parse sur les virgules/parenthèses : on les retire
// du terme (elles n'apparaissent pas dans un numéro, un nom ou un email), et on
// échappe les jokers LIKE pour que « 100% » cherche un pourcent littéral.
function toIlikePattern(rawTerm) {
  const cleaned = rawTerm.replace(/[,()"]/g, ' ').trim()
  if (!cleaned) return null
  return `%${cleaned.replace(/[\\%_]/g, '\\$&')}%`
}

// user_id → email du compte, via l'endpoint admin existant, paginé jusqu'à épuisement
// (perPage plafonné à 100 côté serveur — une réponse tronquée afficherait à tort des
// comptes « inconnus »).
async function fetchAccountEmails() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Session expirée')

  const map = new Map()
  let page = 1
  while (true) {
    const res = await fetch('/api/admin-list-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ page, perPage: 100, search: '', status: 'all' })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur chargement des comptes')
    for (const u of data.users || []) map.set(u.id, u.email)
    if (page * 100 >= (data.total || 0) || (data.users || []).length === 0) break
    page++
  }
  return map
}

function AccountCell({ userId, accountEmails }) {
  if (!userId) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
        <Unlink className="w-3.5 h-3.5" /> Non rattachée
      </span>
    )
  }
  const email = accountEmails?.get(userId)
  return (
    <Link
      to={`/admin/users/${userId}`}
      className="text-sm text-gray-900 hover:text-[#dbae61] hover:underline break-all"
    >
      {email || 'Voir la fiche'}
    </Link>
  )
}

export default function AdminInvoicesList() {
  const [invoices, setInvoices] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Annuaire des comptes, chargé une fois. En échec, on affiche quand même les
  // factures (les liens « Voir la fiche » restent fonctionnels sans email).
  const [accountEmails, setAccountEmails] = useState(null)
  useEffect(() => {
    let cancelled = false
    fetchAccountEmails()
      .then((map) => { if (!cancelled) setAccountEmails(map) })
      .catch((err) => console.error('Erreur annuaire comptes:', err))
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  // Une recherche lancée depuis la page N déclenche DEUX fetchs dans la même passe
  // (l'ancienne page puis la page 1 après reset). Sans garde, celui qui résout en
  // DERNIER gagne — potentiellement le périmé. Chaque fetch prend un numéro de
  // séquence ; seule la réponse du dernier parti a le droit d'écrire l'état.
  const requestSeq = useRef(0)

  const fetchInvoices = useCallback(async () => {
    const seq = ++requestSeq.current
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('invoices')
        .select('id, user_id, numero_facture, montant, date_facture, nom_client, lien_drive', { count: 'exact' })

      const pattern = toIlikePattern(debouncedSearch)
      if (pattern) {
        query = query.or(
          ['numero_facture', 'nom_client', 'email'].map((col) => `${col}.ilike.${pattern}`).join(',')
        )
      }

      const from = (page - 1) * PER_PAGE
      const { data, count, error: fetchError } = await query
        .order('date_facture', { ascending: false, nullsFirst: false })
        .order('received_at', { ascending: false })
        .range(from, from + PER_PAGE - 1)

      if (seq !== requestSeq.current) return // réponse périmée : un fetch plus récent est parti

      if (fetchError) {
        // PGRST103 : la plage demandée dépasse le résultat. Arrive quand une recherche
        // rétrécit le total alors qu'on était en page N (le fetch de la même passe voit
        // encore l'ancienne page avant le reset). Pas une erreur : retour page 1, le
        // re-fetch suit via la dépendance.
        if (fetchError.code === 'PGRST103') {
          setPage(1)
          return
        }
        console.error('Erreur chargement factures:', fetchError)
        setError('Erreur lors du chargement des factures.')
        return
      }
      setInvoices(data || [])
      setTotal(count || 0)
    } catch (err) {
      if (seq !== requestSeq.current) return
      console.error('Erreur fetch factures:', err)
      setError('Erreur réseau. Réessaie.')
    } finally {
      // Le spinner appartient au dernier fetch parti : un périmé ne l'éteint pas.
      if (seq === requestSeq.current) setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const showingFrom = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const showingTo = Math.min(page * PER_PAGE, total)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white px-6 md:px-20 py-4">
        <div className="flex items-center justify-between">
          <Link to="/assistants" className="flex items-center gap-3 hover:text-[#dbae61] transition-colors">
            <img src="/images/invest-malin-logo.png" alt="Invest Malin Logo" className="h-8" />
            <span className="text-lg font-bold">MON ÉQUIPE IA</span>
          </Link>
          <Link to="/admin/users" className="flex items-center gap-2 text-white hover:text-[#dbae61] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour aux utilisateurs</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-20 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-[#dbae61]" />
            <h1 className="text-3xl font-bold text-black">Factures</h1>
          </div>
          <p className="text-gray-600">
            Toutes les factures archivées, y compris celles qui ne sont rattachées à aucun compte.
          </p>
        </div>

        {/* Recherche — exécutée en base, sur l'ensemble des factures */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par numéro, nom ou email…"
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#dbae61] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dbae61] mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Chargement des factures…</p>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Erreur</p>
                  <p className="text-sm text-red-700">{error}</p>
                  <button onClick={fetchInvoices} className="mt-2 text-sm text-red-700 underline hover:no-underline">
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {debouncedSearch ? 'Aucune facture ne correspond à cette recherche.' : 'Aucune facture archivée pour le moment.'}
              </p>
              {debouncedSearch && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-2 text-sm text-[#dbae61] underline hover:no-underline"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Numéro</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Compte</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Facture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDateFacture(inv.date_facture)}</td>
                      <td className="px-4 py-3 text-sm"><NumeroFacture numero={inv.numero_facture} /></td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 whitespace-nowrap">{formatEuros(inv.montant)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{inv.nom_client || '—'}</td>
                      <td className="px-4 py-3"><AccountCell userId={inv.user_id} accountEmails={accountEmails} /></td>
                      <td className="px-4 py-3"><DriveLink href={inv.lien_drive} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">{showingFrom}–{showingTo} sur {total}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#dbae61] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
                <span className="text-sm text-gray-600 px-2">Page {page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#dbae61] transition-colors"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
