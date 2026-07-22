import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, AlertCircle, Mail, MailCheck, MailWarning,
  Coins, Plus, Minus, Lock, Unlock, CreditCard, UserCog, CheckCircle,
  Send, Power, Ban, X
} from 'lucide-react'
import { supabase } from '../../supabaseClient'
import RoleBadge from './RoleBadge'
import AdminUpdateSubscriptionModal from './AdminUpdateSubscriptionModal'
import AdminAdjustCreditsModal from './AdminAdjustCreditsModal'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const MOVEMENT_LABELS = {
  achat: 'Achat',
  debit_fiche: 'Débit fiche',
  offert: 'Crédits offerts',
  correction: 'Correction'
}

function StatusBadge({ status }) {
  const map = {
    premium: 'bg-[#dbae61] bg-opacity-20 text-[#8b7355]',
    trial: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    free: 'bg-gray-100 text-gray-700'
  }
  const labels = { premium: 'Premium', trial: 'Essai', expired: 'Expiré', free: 'Gratuit' }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || map.free}`}>{labels[status] || status}</span>
}

export default function AdminUserDetail() {
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [creditModal, setCreditModal] = useState({ open: false, action: null })
  const [subModal, setSubModal] = useState({ open: false, action: null })
  const [unlockingId, setUnlockingId] = useState(null)
  const [promoting, setPromoting] = useState(false)
  const [promoteConfirm, setPromoteConfirm] = useState(false)
  const [disableConfirmOpen, setDisableConfirmOpen] = useState(false)
  const [actionNotice, setActionNotice] = useState(null)
  const [busyAction, setBusyAction] = useState(null) // 'resend_confirmation' | 'resend_reset' | 'disable' | 'enable'

  // Le bandeau vit en haut de page alors que certaines actions se déclenchent en bas :
  // sans ça, le retour d'une action peut ne jamais entrer dans le viewport.
  // `loading` en dépendance : les actions qui enchaînent setActionNotice + fetchDetail
  // démontent le bandeau pendant le rechargement (ref null au premier passage) — on
  // scrolle donc après le remontage, quand loading repasse à false.
  const noticeRef = useRef(null)
  useEffect(() => {
    if (actionNotice && !loading) noticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [actionNotice, loading])

  // Un bandeau de succès se rapporte à la DERNIÈRE action : toute nouvelle action
  // (y compris l'ouverture d'une modale) efface celui de la précédente.
  const openCreditModal = (action) => { setActionNotice(null); setCreditModal({ open: true, action }) }
  const openSubModal = (action) => { setActionNotice(null); setSubModal({ open: true, action }) }

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Session expirée. Reconnecte-toi.')
        setLoading(false)
        return
      }
      const res = await fetch('/api/admin-user-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'get', user_id: id })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors du chargement')
        return
      }
      setDetail(data)
    } catch (err) {
      console.error('Erreur fetch admin-user-actions/get:', err)
      setError('Erreur réseau. Réessaie.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchDetail() }, [fetchDetail])

  const handleUnlock = async (ficheId) => {
    setUnlockingId(ficheId)
    setActionNotice(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin-user-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'unlock_fiche', fiche_id: ficheId })
      })
      const data = await res.json()
      if (!res.ok) {
        setActionNotice({ type: 'error', text: data.error || 'Erreur déverrouillage' })
        return
      }
      setActionNotice({ type: 'success', text: 'Fiche déverrouillée.' })
      fetchDetail()
    } catch (err) {
      console.error('Erreur unlock fiche:', err)
      setActionNotice({ type: 'error', text: 'Erreur réseau.' })
    } finally {
      setUnlockingId(null)
    }
  }

  const handlePromote = async () => {
    setPromoting(true)
    setActionNotice(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin-user-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'promote_admin', user_id: id })
      })
      const data = await res.json()
      if (!res.ok) {
        setActionNotice({ type: 'error', text: data.error || 'Erreur promotion' })
        return
      }
      setActionNotice({ type: 'success', text: 'Compte promu admin.' })
      setPromoteConfirm(false)
      fetchDetail()
    } catch (err) {
      console.error('Erreur promote admin:', err)
      setActionNotice({ type: 'error', text: 'Erreur réseau.' })
    } finally {
      setPromoting(false)
    }
  }

  const runAction = async (action) => {
    setBusyAction(action)
    setActionNotice(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin-user-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action, user_id: id })
      })
      const data = await res.json()
      if (!res.ok) {
        setActionNotice({ type: 'error', text: data.error || 'Erreur' })
        return
      }
      // Retour explicite avec l'adresse destinataire pour les envois de mail :
      // sans elle, l'admin ne sait pas si l'action a fonctionné et reclique.
      const dest = data.email || detail?.user?.email
      const messages = {
        resend_confirmation: `Un lien de connexion a été envoyé${dest ? ` à ${dest}` : ''}.`,
        resend_reset: `Un email de réinitialisation a été envoyé${dest ? ` à ${dest}` : ''}.`,
        disable: 'Compte désactivé.',
        enable: 'Compte réactivé.'
      }
      setActionNotice({ type: 'success', text: messages[action] || 'Fait.' })
      if (action === 'disable' || action === 'enable') fetchDetail()
    } catch (err) {
      console.error(`Erreur ${action}:`, err)
      setActionNotice({ type: 'error', text: 'Erreur réseau.' })
    } finally {
      setBusyAction(null)
    }
  }

  const user = detail?.user
  const isDisabled = !!user?.disabled_at
  const isFicheLite = user?.role === 'fiche_lite'
  const isSubWorld = user?.role === 'user' || user?.role === 'admin'
  const canSetPremium = user?.subscription_status === 'free' || user?.subscription_status === 'expired'
  const canRenew = user?.subscription_status === 'premium' || user?.subscription_status === 'trial'
  const canSetFree = user?.subscription_status !== 'free'

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
            <span className="text-sm font-medium">Retour à la liste</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-20 py-12">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dbae61] mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Chargement de la fiche…</p>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Erreur</p>
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={fetchDetail} className="mt-2 text-sm text-red-700 underline hover:no-underline">Réessayer</button>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {actionNotice && (
              <div ref={noticeRef} className={`flex items-start gap-2 p-3 rounded-lg border ${actionNotice.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {actionNotice.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <p className="text-sm">{actionNotice.text}</p>
              </div>
            )}

            {/* Tronc commun */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-black">
                    {[user.prenom, user.nom].filter(Boolean).join(' ') || 'Concierge'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="break-all">{user.email || '—'}</span>
                  </div>
                  <div className="mt-2">
                    {user.email_confirmed_at ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <MailCheck className="w-3.5 h-3.5" /> Email confirmé le {formatDate(user.email_confirmed_at)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-700">
                        <MailWarning className="w-3.5 h-3.5" /> Email non confirmé
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <RoleBadge role={user.role} />
                  {isDisabled && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Ban className="w-3 h-3" /> Désactivé le {formatDate(user.disabled_at)}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">Inscrit le {formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Bloc crédits (fiche_lite) */}
            {isFicheLite && detail.credits && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-black flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#dbae61]" /> Crédits
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openCreditModal('add')}
                      className="inline-flex items-center gap-1 bg-[#dbae61] hover:bg-[#c49a4f] text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Ajouter
                    </button>
                    <button
                      onClick={() => openCreditModal('remove')}
                      disabled={(detail.credits.balance ?? 0) <= 0}
                      className="inline-flex items-center gap-1 border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" /> Retirer
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs uppercase font-semibold text-gray-500">Solde</p>
                  <p className="text-3xl font-bold text-black">{detail.credits.balance ?? 0}<span className="text-base font-medium text-gray-500 ml-1">crédit{(detail.credits.balance ?? 0) > 1 ? 's' : ''}</span></p>
                </div>

                <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Historique des mouvements</p>
                {detail.credits.ledger.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun mouvement.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                        <tr>
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4 text-right">Montant</th>
                          <th className="py-2">Détail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {detail.credits.ledger.map((m) => (
                          <tr key={m.id}>
                            <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{formatDateTime(m.created_at)}</td>
                            <td className="py-2 pr-4 text-gray-700">{MOVEMENT_LABELS[m.type] || m.type}</td>
                            <td className={`py-2 pr-4 text-right font-medium ${m.amount > 0 ? 'text-green-700' : 'text-red-600'}`}>
                              {m.amount > 0 ? '+' : ''}{m.amount}
                            </td>
                            <td className="py-2 text-gray-500">
                              {m.description}
                              {m.metadata?.reason && <span className="block text-xs text-gray-400">« {m.metadata.reason} »</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Fiches du concierge (fiche_lite) */}
            {isFicheLite && detail.fiches && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-black mb-4">Fiches logement</h2>
                {detail.fiches.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucune fiche.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {detail.fiches.map((f) => (
                      <div key={f.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{f.nom || 'Fiche sans nom'}</p>
                          <p className="text-xs text-gray-500">
                            {f.statut} · créée le {formatDate(f.created_at)}
                            {f.archived_at && ' · archivée'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {f.fields_locked ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Lock className="w-3.5 h-3.5" /> Verrouillée</span>
                              <button
                                onClick={() => handleUnlock(f.id)}
                                disabled={unlockingId === f.id}
                                className="inline-flex items-center gap-1 border-2 border-gray-200 text-gray-700 hover:border-[#dbae61] text-xs font-medium px-2.5 py-1 rounded-lg disabled:opacity-40 transition-colors"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                {unlockingId === f.id ? '…' : 'Déverrouiller'}
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">Modifiable</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bloc abonnement (user / admin) */}
            {isSubWorld && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-black flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-[#dbae61]" /> Abonnement
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase font-semibold text-gray-500 mb-1">Statut</p>
                    <StatusBadge status={user.subscription_status} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-gray-500 mb-1">Expiration</p>
                    <p className="text-sm text-gray-700">
                      {formatDate(user.subscription_status === 'trial' ? user.subscription_trial_end : user.subscription_current_period_end)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {canSetPremium && (
                    <button onClick={() => openSubModal('set_premium')} className="bg-[#dbae61] hover:bg-[#c49a4f] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Offrir le premium</button>
                  )}
                  {canRenew && (
                    <button onClick={() => openSubModal('renew')} className="border-2 border-gray-200 text-gray-700 hover:border-[#dbae61] text-sm font-medium px-4 py-2 rounded-lg transition-colors">Renouveler</button>
                  )}
                  {canSetFree && (
                    <button onClick={() => openSubModal('set_free')} className="border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Révoquer le premium</button>
                  )}
                </div>

                {/* Promotion admin — uniquement pour un user */}
                {user.role === 'user' && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Rôle</p>
                    {!promoteConfirm ? (
                      <button onClick={() => setPromoteConfirm(true)} className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-[#dbae61] text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        <UserCog className="w-4 h-4" /> Promouvoir en admin
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-gray-700">Confirmer la promotion en admin ? Cette action donne l'accès complet à l'espace admin.</span>
                        <button onClick={handlePromote} disabled={promoting} className="bg-[#dbae61] hover:bg-[#c49a4f] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40 transition-colors">
                          {promoting ? 'En cours…' : 'Oui, promouvoir'}
                        </button>
                        <button onClick={() => setPromoteConfirm(false)} disabled={promoting} className="text-sm text-gray-500 underline hover:no-underline">Annuler</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Compte : emails + désactivation */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-black mb-4">Compte</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runAction('resend_confirmation')}
                  disabled={busyAction !== null}
                  className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-[#dbae61] text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40 transition-colors"
                >
                  <MailCheck className="w-4 h-4" />
                  {busyAction === 'resend_confirmation' ? 'Envoi…' : 'Envoyer un lien de connexion'}
                </button>
                <button
                  onClick={() => runAction('resend_reset')}
                  disabled={busyAction !== null}
                  className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-[#dbae61] text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {busyAction === 'resend_reset' ? 'Envoi…' : 'Réinitialiser le mot de passe'}
                </button>

                {isDisabled ? (
                  <button
                    onClick={() => runAction('enable')}
                    disabled={busyAction !== null}
                    className="inline-flex items-center gap-2 border-2 border-green-200 text-green-700 hover:bg-green-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40 transition-colors"
                  >
                    <Power className="w-4 h-4" />
                    {busyAction === 'enable' ? '…' : 'Réactiver le compte'}
                  </button>
                ) : (
                  <button
                    onClick={() => { setActionNotice(null); setDisableConfirmOpen(true) }}
                    disabled={busyAction !== null}
                    className="inline-flex items-center gap-2 border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40 transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    {busyAction === 'disable' ? '…' : 'Désactiver le compte'}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                La désactivation bloque la connexion sans supprimer le compte (réversible). La suppression définitive se fait depuis la liste.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <AdminAdjustCreditsModal
        isOpen={creditModal.open}
        action={creditModal.action}
        user={user}
        balance={detail?.credits?.balance ?? 0}
        onClose={() => setCreditModal({ open: false, action: null })}
        onSuccess={(newBalance) => {
          const verb = creditModal.action === 'add' ? 'ajoutés' : 'retirés'
          setCreditModal({ open: false, action: null })
          setActionNotice({ type: 'success', text: `Crédits ${verb}${Number.isInteger(newBalance) ? ` — nouveau solde : ${newBalance}` : ''}.` })
          fetchDetail()
        }}
      />

      <AdminUpdateSubscriptionModal
        isOpen={subModal.open}
        action={subModal.action}
        user={user}
        onClose={() => setSubModal({ open: false, action: null })}
        onSuccess={() => {
          setSubModal({ open: false, action: null })
          setActionNotice({ type: 'success', text: 'Abonnement mis à jour.' })
          fetchDetail()
        }}
      />

      {/* Confirmation de désactivation : modale de l'app (même gabarit que les crédits),
          pas le confirm() natif — que certains navigateurs permettent de supprimer
          définitivement, ce qui ferait sauter la confirmation en silence. */}
      {disableConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-600" />
                Désactiver le compte
              </h2>
              <button
                onClick={() => setDisableConfirmOpen(false)}
                disabled={busyAction !== null}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Désactiver ce compte ? Le concierge ne pourra plus se connecter (récupérable).
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDisableConfirmOpen(false)}
                  disabled={busyAction !== null}
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => { await runAction('disable'); setDisableConfirmOpen(false) }}
                  disabled={busyAction !== null}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {busyAction === 'disable' ? 'En cours…' : 'Désactiver'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
