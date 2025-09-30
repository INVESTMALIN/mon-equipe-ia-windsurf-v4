import { useState } from 'react'
import { X, User, Mail, CreditCard, Lock } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function EditProfileModal({ isOpen, onClose, user, onPasswordClick, onPortalClick }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Mettre à jour le profil utilisateur dans Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          prenom: firstName,
          nom: lastName
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess('Profil mis à jour avec succès')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Erreur mise à jour profil:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setSuccess('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#dbae61] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Modifier mon profil</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Prénom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prénom
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors"
              placeholder="Votre prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors"
              placeholder="Votre nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Email (lecture seule) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                value={user?.email || ''}
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pour modifier votre email, contactez le support
            </p>
          </div>

          {/* Boutons actions rapides */}
          <div className="pt-4 space-y-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onPasswordClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Modifier le mot de passe
            </button>

            <button
              type="button"
              onClick={onPortalClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#dbae61] text-[#dbae61] rounded-lg font-medium hover:bg-[#dbae61] hover:text-white transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Gérer mon abonnement
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Boutons validation */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#dbae61] hover:bg-[#c49a4f] disabled:bg-gray-400 text-black font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}