import { useState } from 'react'
import { X, Trash2, AlertCircle } from 'lucide-react'
import { deleteFiche } from '../../lib/supabaseHelpers'

// Confirmation de suppression. UNE étape. Nomme la fiche pour qu'on sache laquelle on
// supprime. `showCreditWarning` (fiche_lite) rappelle que le crédit ne revient pas — la
// suppression ne touche JAMAIS au ledger (aucun remboursement, c'est la règle).
export default function DeleteFicheModal({ isOpen, onClose, fiche, onDeleted, showCreditWarning = false }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !fiche) return null

  const handleClose = () => {
    if (deleting) return
    setError(null)
    onClose()
  }

  const handleDelete = async () => {
    setError(null)
    setDeleting(true)
    const result = await deleteFiche(fiche.id)
    if (!result.success) {
      setDeleting(false)
      setError('La suppression a échoué. Réessayez.')
      return
    }
    onDeleted?.()
    // Reset AVANT de fermer : la modale reste montée dans le Dashboard (seul isOpen bascule) ;
    // sans ce reset, la suppression suivante rouvrirait avec les contrôles gelés (bouton
    // bloqué sur « Suppression… »).
    setDeleting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          disabled={deleting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Supprimer cette fiche ?</h2>
        <p className="text-center text-gray-900 font-medium break-words">« {fiche.nom} »</p>
        <p className="text-center text-sm text-gray-500 mt-1 mb-4">Cette action est définitive.</p>

        {showCreditWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">Le crédit utilisé pour créer cette fiche ne sera pas remboursé.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={deleting}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-colors"
          >
            {deleting ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}
