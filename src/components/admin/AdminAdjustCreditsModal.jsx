import { useEffect, useState } from 'react'
import { X, AlertCircle, Plus, Minus } from 'lucide-react'
import { supabase } from '../../supabaseClient'

// Ajout (offert) ou retrait (correction) manuel de crédits. Le montant saisi est
// toujours POSITIF ; le sens vient de `action`. La raison est obligatoire. Le refus de
// passer sous zéro est garanti en base (admin_adjust_credits) — on double juste d'un
// garde client sur le retrait pour un feedback immédiat.
const ACTION_CONFIG = {
  add: {
    title: 'Ajouter des crédits',
    cta: 'Créditer',
    primaryClass: 'bg-[#dbae61] hover:bg-[#c49a4f]',
    Icon: Plus
  },
  remove: {
    title: 'Retirer des crédits',
    cta: 'Retirer',
    primaryClass: 'bg-red-600 hover:bg-red-700',
    Icon: Minus
  }
}

export default function AdminAdjustCreditsModal({ isOpen, onClose, onSuccess, user, action, balance }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setReason('')
      setError(null)
      setSubmitting(false)
    }
  }, [isOpen, action])

  if (!isOpen || !user || !action) return null

  const config = ACTION_CONFIG[action]
  const n = parseInt(amount, 10)
  const amountValid = Number.isInteger(n) && n > 0
  const wouldGoNegative = action === 'remove' && amountValid && n > (balance ?? 0)
  const reasonValid = reason.trim().length > 0
  const canSubmit = amountValid && reasonValid && !wouldGoNegative && !submitting

  const handleSubmit = async () => {
    setError(null)
    if (!amountValid) return setError('Montant invalide (entier positif requis)')
    if (!reasonValid) return setError('Une raison est obligatoire')
    if (wouldGoNegative) return setError('Le retrait dépasse le solde actuel')

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Session expirée. Reconnecte-toi.')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/admin-user-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'adjust_credits',
          user_id: user.id,
          direction: action, // 'add' | 'remove'
          amount: n,
          reason: reason.trim()
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'ajustement')
        setSubmitting(false)
        return
      }

      onSuccess?.(data.balance)
      onClose()
    } catch (err) {
      console.error('Erreur adjust credits:', err)
      setError('Erreur réseau. Réessaie.')
      setSubmitting(false)
    }
  }

  const Icon = config.Icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <Icon className="w-5 h-5 text-[#dbae61]" />
            {config.title}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm">
            <p className="text-gray-500 uppercase text-xs font-semibold mb-1">Concierge</p>
            <p className="font-medium text-gray-900 break-all">{user.email}</p>
            {(user.prenom || user.nom) && (
              <p className="text-gray-600">{[user.prenom, user.nom].filter(Boolean).join(' ')}</p>
            )}
            <p className="text-gray-600 mt-1">Solde actuel : <strong>{balance ?? 0}</strong> crédit{(balance ?? 0) > 1 ? 's' : ''}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Montant</label>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nombre de crédits"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#dbae61] focus:outline-none transition-colors"
            />
            {wouldGoNegative && (
              <p className="text-xs text-red-600 mt-1">Le retrait ({n}) dépasse le solde ({balance ?? 0}).</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Raison <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder={action === 'add' ? 'Ex. geste commercial, dédommagement…' : 'Ex. correction d\'une erreur de saisie…'}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#dbae61] focus:outline-none transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${config.primaryClass}`}
            >
              {submitting ? 'En cours…' : config.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
