// src/components/AccessCodeModal.jsx
import { useState } from 'react'
import { X, Lock } from 'lucide-react'

export default function AccessCodeModal({ onSuccess }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Récupérer le code depuis les variables d'environnement
    const validCode = import.meta.env.VITE_ACCESS_CODE

    if (code.trim().toUpperCase() === validCode?.toUpperCase()) {
      // Stocker la validation dans localStorage
      localStorage.setItem('investmalin_access_granted', 'true')
      onSuccess()
    } else {
      setError('Code incorrect. Veuillez réessayer.')
      setCode('')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        
        {/* Icône en haut */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#dbae61] bg-opacity-10 p-4 rounded-full">
            <Lock className="w-8 h-8 text-[#dbae61]" />
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Accès sécurisé
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Entrez le code d'accès communiqué lors de votre formation Invest Malin
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Saisissez votre code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent text-center text-lg font-mono uppercase"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Vérification...' : 'Valider le code'}
          </button>
        </form>

        {/* Info supplémentaire */}
        <p className="text-sm text-gray-500 text-center mt-6">
          Vous n'avez pas reçu le code ? Contactez votre formateur Invest Malin.
        </p>
      </div>
    </div>
  )
}