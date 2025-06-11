import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://julinhio.github.io/mon-equipe-ia-windsurf-v4/connexion'
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage("Un email de réinitialisation a été envoyé à votre adresse.")
    }
    
    setLoading(false)
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
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}

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
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>

        {/* Liens de retour */}
        <div className="mt-8 text-center space-y-4">
          <div className="text-sm text-gray-600">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link 
              to="/connexion" 
              className="text-[#dbae61] hover:text-[#c49a4f] font-medium transition-colors"
            >
              Se connecter
            </Link>
          </div>
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}