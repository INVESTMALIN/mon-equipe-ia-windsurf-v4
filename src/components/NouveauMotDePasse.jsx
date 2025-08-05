import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function NouveauMotDePasse() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  // Vérifier si l'utilisateur a une session de récupération valide
  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Si pas de session ou pas de recovery, rediriger
      if (!session) {
        setError('Lien de récupération invalide ou expiré.')
        setTimeout(() => {
          navigate('/mot-de-passe-oublie')
        }, 3000)
      }
    }

    checkRecoverySession()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation des mots de passe
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    try {
      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError('Erreur lors de la mise à jour : ' + error.message)
      } else {
        setSuccess(true)
        // Redirection automatique vers connexion après 2 secondes
        setTimeout(() => {
          navigate('/connexion')
        }, 2000)
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite.')
    }
    
    setLoading(false)
  }

  // Si le mot de passe a été mis à jour avec succès
  if (success) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">
              Mot de passe mis à jour !
            </h1>
            <p className="text-gray-600">
              Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion...
            </p>
          </div>
          <Link
            to="/connexion"
            className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Se connecter maintenant
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-8"
            />
            <span className="text-xl font-bold text-black">MON ÉQUIPE IA</span>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-600">
            Choisissez un nouveau mot de passe sécurisé pour votre compte
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors"
              placeholder="Saisissez votre nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 caractères recommandés
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors"
              placeholder="Confirmez votre nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#dbae61] hover:bg-[#c49a4f] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>

        {/* Lien de retour */}
        <div className="mt-8 text-center">
          <Link 
            to="/connexion" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}