import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Search, AlertCircle, ChevronLeft, ChevronRight, Shield, MoreVertical, Plus } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import AdminCreateUserModal from './AdminCreateUserModal'
import AdminUpdateSubscriptionModal from './AdminUpdateSubscriptionModal'
import AdminDeleteUserModal from './AdminDeleteUserModal'

const PER_PAGE = 25
const SEARCH_DEBOUNCE_MS = 350

const STATUS_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'free', label: 'Gratuit' },
  { value: 'trial', label: 'Essai' },
  { value: 'premium', label: 'Premium' },
  { value: 'expired', label: 'Expiré' }
]

function StatusBadge({ status }) {
  switch (status) {
    case 'premium':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#dbae61] bg-opacity-20 text-[#8b7355]">Premium</span>
    case 'trial':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Essai</span>
    case 'expired':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expiré</span>
    case 'free':
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Gratuit</span>
  }
}

function RoleBadge({ role }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#dbae61] bg-opacity-20 text-[#8b7355]">
        <Shield className="w-3 h-3" />
        Admin
      </span>
    )
  }
  return <span className="text-xs text-gray-500">Utilisateur</span>
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function ExpirationCell({ user }) {
  const { subscription_status, subscription_current_period_end, subscription_trial_end } = user
  const endDate = subscription_status === 'trial' ? subscription_trial_end : subscription_current_period_end

  if (!endDate) return <span className="text-gray-400">—</span>

  const end = new Date(endDate)
  const now = new Date()
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24))

  // Alert when premium expires in <30 days (still in the future)
  const showAlert =
    subscription_status === 'premium' &&
    daysLeft > 0 &&
    daysLeft < 30

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-gray-700">{formatDate(endDate)}</span>
      {showAlert && (
        <span className="inline-flex items-center gap-1 text-xs text-orange-700">
          <AlertCircle className="w-3 h-3" />
          Expire dans {daysLeft}j
        </span>
      )}
    </div>
  )
}

export default function AdminUsersList() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Action UI state
  const [currentUserId, setCurrentUserId] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModal, setUpdateModal] = useState({ open: false, user: null, action: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null })
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuContainerRef = useRef(null)

  // Track the connected admin's id so we can disable destructive actions
  // on their own row (server-side guard exists too).
  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setCurrentUserId(session?.user?.id || null)
    })
    return () => { cancelled = true }
  }, [])

  // Close kebab menu on outside click
  useEffect(() => {
    if (openMenuId === null) return
    const handler = (e) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openMenuId])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  // Reset to page 1 whenever filter or debounced search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Session expirée. Reconnecte-toi.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin-list-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          page,
          perPage: PER_PAGE,
          search: debouncedSearch,
          status
        })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Erreur lors du chargement')
        return
      }

      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Erreur fetch admin-list-users:', err)
      setError('Erreur réseau. Réessaie.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, status])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const showingFrom = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const showingTo = Math.min(page * PER_PAGE, total)

  const openUpdateModal = (user, action) => {
    setOpenMenuId(null)
    setUpdateModal({ open: true, user, action })
  }
  const closeUpdateModal = () => setUpdateModal({ open: false, user: null, action: null })

  const openDeleteModal = (user) => {
    setOpenMenuId(null)
    setDeleteModal({ open: true, user })
  }
  const closeDeleteModal = () => setDeleteModal({ open: false, user: null })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white px-6 md:px-20 py-4">
        <div className="flex items-center justify-between">
          <Link to="/assistants" className="flex items-center gap-3 hover:text-[#dbae61] transition-colors">
            <img
              src="/images/invest-malin-logo.png"
              alt="Invest Malin Logo"
              className="h-8"
            />
            <span className="text-lg font-bold">MON ÉQUIPE IA</span>
          </Link>

          <Link
            to="/mon-compte"
            className="flex items-center gap-2 text-white hover:text-[#dbae61] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-20 py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-[#dbae61]" />
              <h1 className="text-3xl font-bold text-black">Espace admin</h1>
            </div>
            <p className="text-gray-600">Gestion des utilisateurs</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer un compte
          </button>
        </div>

        {/* Filtres + recherche */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par email…"
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#dbae61] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatus(f.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    status === f.value
                      ? 'bg-[#dbae61] text-white border-[#dbae61]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#dbae61]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dbae61] mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Chargement des utilisateurs…</p>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Erreur</p>
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchUsers}
                    className="mt-2 text-sm text-red-700 underline hover:no-underline"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun utilisateur trouvé.</p>
              {(debouncedSearch || status !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setStatus('all') }}
                  className="mt-2 text-sm text-[#dbae61] underline hover:no-underline"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Prénom</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiration</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Inscription</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const isSelf = u.id === currentUserId
                    const canSetFree = u.subscription_status !== 'free'
                    const canSetPremium = u.subscription_status === 'free' || u.subscription_status === 'expired'
                    const canRenew = u.subscription_status === 'premium' || u.subscription_status === 'trial'
                    const menuOpen = openMenuId === u.id
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{u.email || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{u.prenom || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{u.nom || '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={u.subscription_status} /></td>
                        <td className="px-4 py-3"><ExpirationCell user={u} /></td>
                        <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(u.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <div
                            className="relative inline-block"
                            ref={menuOpen ? menuContainerRef : null}
                          >
                            <button
                              onClick={() => setOpenMenuId(menuOpen ? null : u.id)}
                              disabled={isSelf}
                              title={isSelf ? 'Tu ne peux pas modifier ton propre compte' : 'Actions'}
                              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {menuOpen && !isSelf && (
                              <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                                {canSetPremium && (
                                  <button
                                    onClick={() => openUpdateModal(u, 'set_premium')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Passer en premium
                                  </button>
                                )}
                                {canRenew && (
                                  <button
                                    onClick={() => openUpdateModal(u, 'renew')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Renouveler
                                  </button>
                                )}
                                {canSetFree && (
                                  <button
                                    onClick={() => openUpdateModal(u, 'set_free')}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    Passer en gratuit
                                  </button>
                                )}
                                <div className="border-t border-gray-100 my-1" />
                                <button
                                  onClick={() => openDeleteModal(u)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                                >
                                  Supprimer le compte
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                {showingFrom}–{showingTo} sur {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#dbae61] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
                <span className="text-sm text-gray-600 px-2">
                  Page {page} / {totalPages}
                </span>
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

      <AdminCreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchUsers}
      />

      <AdminUpdateSubscriptionModal
        isOpen={updateModal.open}
        user={updateModal.user}
        action={updateModal.action}
        onClose={closeUpdateModal}
        onSuccess={fetchUsers}
      />

      <AdminDeleteUserModal
        isOpen={deleteModal.open}
        user={deleteModal.user}
        onClose={closeDeleteModal}
        onSuccess={fetchUsers}
      />
    </div>
  )
}
