import { useState } from 'react'
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { supabase } from '../../supabaseClient'

const DURATION_OPTIONS = [
  { value: 1, label: '1 mois' },
  { value: 6, label: '6 mois' },
  { value: 12, label: '1 an' }
]

function tomorrowYmd() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function ymdToEndOfDayIso(ymd) {
  // Local end-of-day so the user's intent ("expires on this date") matches.
  return new Date(`${ymd}T23:59:59`).toISOString()
}

export default function AdminCreateUserModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [statusType, setStatusType] = useState('free')
  const [durationMode, setDurationMode] = useState('preset')
  const [presetMonths, setPresetMonths] = useState(12)
  const [customDate, setCustomDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const reset = () => {
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setPrenom('')
    setNom('')
    setStatusType('free')
    setDurationMode('preset')
    setPresetMonths(12)
    setCustomDate('')
    setError(null)
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) return setError('Email requis')
    if (!password || password.length < 6) return setError('Mot de passe requis (6 caractères minimum)')
    if (statusType === 'premium' && durationMode === 'custom' && !customDate) {
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

      const body = {
        email: email.trim(),
        password,
        prenom: prenom.trim() || null,
        nom: nom.trim() || null,
        subscription_status: statusType
      }
      if (statusType === 'premium') {
        if (durationMode === 'custom') body.custom_end_date = ymdToEndOfDayIso(customDate)
        else body.months = presetMonths
      }

      const res = await fetch('/api/admin-create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création')
        setSubmitting(false)
        return
      }

      reset()
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Erreur création user:', err)
      setError('Erreur réseau. Réessaie.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">Créer un compte</h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#dbae61] focus:outline-none transition-colors"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 pr-10 border-2 border-gray-200 rounded-lg focus:border-[#dbae61] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              6 caractères minimum. Tu communiques le mot de passe au user en direct (pas d'email envoyé).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#dbae61] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#dbae61] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatusType('free')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                  statusType === 'free'
                    ? 'bg-[#dbae61] text-white border-[#dbae61]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#dbae61]'
                }`}
              >
                Gratuit
              </button>
              <button
                type="button"
                onClick={() => setStatusType('premium')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                  statusType === 'premium'
                    ? 'bg-[#dbae61] text-white border-[#dbae61]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#dbae61]'
                }`}
              >
                Premium
              </button>
            </div>
          </div>

          {statusType === 'premium' && (
            <div className="space-y-3 p-4 rounded-lg bg-[#dbae61]/5 border border-[#dbae61]/20">
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
              <p className="text-xs text-gray-500">Calculé à partir d'aujourd'hui.</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg bg-[#dbae61] hover:bg-[#c49a4f] text-white font-medium disabled:opacity-40 transition-colors"
            >
              {submitting ? 'Création…' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
