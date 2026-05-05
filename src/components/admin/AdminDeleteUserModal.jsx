import { useState } from 'react'
import { X, AlertTriangle, AlertCircle } from 'lucide-react'
import { supabase } from '../../supabaseClient'

export default function AdminDeleteUserModal({ isOpen, onClose, onSuccess, user }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !user) return null

  const handleClose = () => {
    if (submitting) return
    setError(null)
    onClose()
  }

  const handleConfirm = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Session expirée. Reconnecte-toi.')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/admin-delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ user_id: user.id })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la suppression')
        setSubmitting(false)
        return
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Erreur delete user:', err)
      setError('Erreur réseau. Réessaie.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          disabled={submitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
          Supprimer ce compte ?
        </h2>

        <div className="text-center mb-4">
          <p className="font-medium text-gray-900 break-all">{user.email}</p>
          {(user.prenom || user.nom) && (
            <p className="text-sm text-gray-500">{[user.prenom, user.nom].filter(Boolean).join(' ')}</p>
          )}
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800 leading-relaxed">
            <strong>⚠️ Attention :</strong> Cette action supprimera définitivement :
          </p>
          <ul className="mt-2 ml-4 text-sm text-red-700 space-y-1">
            <li>• Le compte d'authentification</li>
            <li>• Le profil utilisateur</li>
            <li>• Toutes les conversations associées</li>
            <li>• Toutes les fiches logement associées</li>
          </ul>
          <p className="mt-3 text-sm text-red-800 font-semibold">
            Cette action est irréversible.
          </p>
        </div>

        {user.stripe_subscription_id && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800">
              <strong>Abonnement Stripe actif.</strong> La suppression du compte n'annule pas la facturation Stripe — pense à annuler l'abonnement côté Stripe.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
          >
            {submitting ? 'Suppression…' : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  )
}
