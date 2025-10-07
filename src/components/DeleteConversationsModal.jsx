import { X, AlertTriangle } from 'lucide-react'

export default function DeleteConversationsModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icône d'alerte */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Supprimer tout l'historique ?
        </h2>

        {/* Message d'avertissement */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 leading-relaxed">
            <strong>⚠️ Attention :</strong> Cette action supprimera définitivement <strong>TOUTES</strong> vos conversations sur <strong>TOUS</strong> les assistants IA :
          </p>
          <ul className="mt-2 ml-4 text-sm text-red-700 space-y-1">
            <li>• Assistant Invest Malin</li>
            <li>• Assistant Annonce</li>
            <li>• Assistant Juridique</li>
            <li>• Assistant Négociateur</li>
          </ul>
          <p className="mt-3 text-sm text-red-800 font-semibold">
            Cette action est irréversible.
          </p>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Suppression...' : 'Supprimer tout'}
          </button>
        </div>
      </div>
    </div>
  )
}