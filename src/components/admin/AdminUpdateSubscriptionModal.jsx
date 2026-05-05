import { useEffect, useState } from 'react'
import { X, AlertCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '../../supabaseClient'

const DURATION_OPTIONS = [
  { value: 1, label: '1 mois' },
  { value: 6, label: '6 mois' },
  { value: 12, label: '1 an' }
]

const ACTION_CONFIG = {
  set_free: {
    title: 'Passer en gratuit',
    cta: 'Confirmer',
    primaryClass: 'bg-red-600 hover:bg-red-700'
  },
  set_premium: {
    title: 'Passer en premium',
    cta: 'Activer',
    primaryClass: 'bg-[#dbae61] hover:bg-[#c49a4f]'
  },
  renew: {
    title: 'Renouveler',
    cta: 'Renouveler',
    primaryClass: 'bg-[#dbae61] hover:bg-[#c49a4f]'
  }
}

function tomorrowYmd() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function ymdToEndOfDayIso(ymd) {
  return new Date(`${ymd}T23:59:59`).toISOString()
}

export default function AdminUpdateSubscriptionModal({ isOpen, onClose, onSuccess, user, action }) {
  const [durationMode, setDurationMode] = useState('preset')
  const [presetMonths, setPresetMonths] = useState(1)
  const [customDate, setCustomDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Reset internal state every time the modal opens or the action changes
  useEffect(() => {
    if (isOpen) {
      setDurationMode('preset')
      setPresetMonths(action === 'renew' ? 1 : 12)
      setCustomDate('')
      setError(null)
      setSubmitting(false)
    }
  }, [isOpen, action])

  if (!isOpen || !user || !action) return null

  const config = ACTION_CONFIG[action]
  const needsDuration = action === 'set_premium' || action === 'renew'
  const hasStripeSub = !!user.stripe_subscription_id

  const handleSubmit = async () => {
    setError(null)
    if (needsDuration && durationMode === 'custom' && !customDate) {
      return setError("Date d'expiration requise")
    }

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Session expirée. Reconnecte-toi.')
        setSubmitting(false)
        return
      }

      const body = { user_id: user.id, action }
      if (needsDuration) {
        if (durationMode === 'custom') body.custom_end_date = ymdToEndOfDayIso(customDate)
        else body.months = presetMonths
      }

      const res = await fetch('/api/admin-update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la mise à jour')
        setSubmitting(false)
        return
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Erreur update subscription:', err)
      setError('Erreur réseau. Réessaie.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">{config.title}</h2>
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
            <p className="text-gray-500 uppercase text-xs font-semibold mb-1">Utilisateur</p>
            <p className="font-medium text-gray-900 break-all">{user.email}</p>
            {(user.prenom || user.nom) && (
              <p className="text-gray-600">{[user.prenom, user.nom].filter(Boolean).join(' ')}</p>
            )}
          </div>

          {hasStripeSub && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-0.5">Abonnement Stripe actif</p>
                <p>
                  {action === 'set_free'
                    ? "Cette action n'annulera pas la facturation Stripe. Le user continuera d'être facturé tant que tu n'as pas annulé l'abo dans Stripe."
                    : 'Ta modification peut être écrasée par les prochains webhooks Stripe (paiement, annulation, renouvellement).'}
                </p>
              </div>
            </div>
          )}

          {needsDuration && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Durée</label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setDurationMode('preset'); setPresetMonths(opt.value) }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
                      durationMode === 'preset' && presetMonths === opt.value
                        ? 'bg-[#dbae61] text-white border-[#dbae61]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#dbae61]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDurationMode('custom')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
                    durationMode === 'custom'
                      ? 'bg-[#dbae61] text-white border-[#dbae61]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#dbae61]'
                  }`}
                >
                  Date custom
                </button>
              </div>
              {durationMode === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={tomorrowYmd()}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#dbae61] focus:outline-none transition-colors"
                />
              )}
              <p className="text-xs text-gray-500">
                {action === 'renew'
                  ? "Calculé à partir d'aujourd'hui (les jours restants ne sont pas reportés)."
                  : "Calculé à partir d'aujourd'hui."}
              </p>
            </div>
          )}

          {action === 'set_free' && (
            <p className="text-sm text-gray-600">
              Le user passera en statut <strong>gratuit</strong>. Toutes les dates d'abonnement seront effacées.
            </p>
          )}

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
              disabled={submitting}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-40 transition-colors ${config.primaryClass}`}
            >
              {submitting ? 'En cours…' : config.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
