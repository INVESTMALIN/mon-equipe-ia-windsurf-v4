import { useState } from 'react'
import { X, AlertCircle, Home, Bot } from 'lucide-react'
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
  return new Date(`${ymd}T23:59:59`).toISOString()
}

export default function AdminCreateUserModal({ isOpen, onClose, onSuccess }) {
  const [world, setWorld] = useState('fiche_lite') // 'fiche_lite' | 'mon_equipe_ia'
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [role, setRole] = useState('user') // pour Mon Équipe IA
  const [statusType, setStatusType] = useState('free')
  const [durationMode, setDurationMode] = useState('preset')
  const [presetMonths, setPresetMonths] = useState(12)
  const [customDate, setCustomDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const reset = () => {
    setWorld('fiche_lite')
    setEmail('')
    setPrenom('')
    setNom('')
    setRole('user')
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
    if (world === 'mon_equipe_ia' && statusType === 'premium' && durationMode === 'custom' && !customDate) {
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
        prenom: prenom.trim() || null,
        nom: nom.trim() || null,
        world
      }
      if (world === 'mon_equipe_ia') {
        body.role = role
        body.subscription_status = statusType
        if (statusType === 'premium') {
          if (durationMode === 'custom') body.custom_end_date = ymdToEndOfDayIso(customDate)
          else body.months = presetMonths
        }
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

      // Compte créé. Si l'email d'invitation n'est pas parti, on remonte l'avertissement
      // sans bloquer (l'admin pourra renvoyer l'invitation depuis la fiche).
      reset()
      onSuccess?.(data.warning || null)
      onClose()
    } catch (err) {
      console.error('Erreur création user:', err)
      setError('Erreur réseau. Réessaie.')
      setSubmitting(false)
    }
  }

  const isMeia = world === 'mon_equipe_ia'

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

          {/* Choix du monde */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type de compte</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWorld('fiche_lite')}
                className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-colors ${
                  world === 'fiche_lite' ? 'bg-[#dbae61]/10 border-[#dbae61]' : 'bg-white border-gray-200 hover:border-[#dbae61]'
                }`}
              >
                <Home className="w-5 h-5 text-[#dbae61]" />
                <span className="text-sm font-medium text-gray-800">Fiche Logement</span>
                <span className="text-xs text-gray-500">Crédits · démarre à 0</span>
              </button>
              <button
                type="button"
                onClick={() => setWorld('mon_equipe_ia')}
                className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-colors ${
                  isMeia ? 'bg-[#dbae61]/10 border-[#dbae61]' : 'bg-white border-gray-200 hover:border-[#dbae61]'
                }`}
              >
                <Bot className="w-5 h-5 text-[#dbae61]" />
                <span className="text-sm font-medium text-gray-800">Mon Équipe IA</span>
                <span className="text-xs text-gray-500">Abonnement</span>
              </button>
            </div>
          </div>

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
              placeholder="concierge@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Un email d'invitation lui sera envoyé pour définir son mot de passe.
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

          {/* Champs spécifiques Mon Équipe IA */}
          {isMeia && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rôle</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      role === 'user' ? 'bg-[#dbae61] text-white border-[#dbae61]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#dbae61]'
                    }`}
                  >
                    Utilisateur
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      role === 'admin' ? 'bg-[#dbae61] text-white border-[#dbae61]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#dbae61]'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusType('free')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      statusType === 'free' ? 'bg-[#dbae61] text-white border-[#dbae61]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#dbae61]'
                    }`}
                  >
                    Gratuit
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusType('premium')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      statusType === 'premium' ? 'bg-[#dbae61] text-white border-[#dbae61]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#dbae61]'
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
            </>
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
              {submitting ? 'Création…' : 'Créer et inviter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
