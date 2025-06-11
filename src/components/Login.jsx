import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Erreur de login:', error.message)
      setError('Connexion échouée : ' + error.message)
      setLoading(false)
      return
    }

    // Si succès
    console.log('Login réussi:', data)
    window.location.href = '/mon-compte'
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Colonne gauche - Formulaire */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-md mx-auto w-full">
          {/* Logo et titre */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/images/invest-malin-logo.png" 
                alt="Invest Malin Logo" 
                className="h-8"
              />
              <span className="text-xl font-bold text-black">MON ÉQUIPE IA</span>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Bienvenue !
            </h1>
            <p className="text-gray-600 text-lg">
              Connectez-vous pour accéder à vos assistants IA personnalisés
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Liens */}
          <div className="mt-8 text-center space-y-4">
            <div className="text-sm text-gray-600">
              <Link 
                to="/mot-de-passe-oublie" 
                className="text-[#dbae61] hover:text-[#c49a4f] font-medium transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link 
                to="/inscription" 
                className="text-[#dbae61] hover:text-[#c49a4f] font-medium transition-colors"
              >
                Créer un compte
              </Link>
            </div>
          </div>

          {/* Retour à l'accueil */}
          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Colonne droite - Image */}
      <div className="hidden lg:block lg:flex-1 relative">
        <img
          src="/images/pourquoi-image.png"
          alt="Mon Équipe IA"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            Votre équipe IA vous attend
          </h2>
          <p className="text-lg opacity-90">
            Accédez à vos assistants spécialisés en fiscalité, juridique et négociation pour optimiser votre conciergerie.
          </p>
        </div>
      </div>
    </div>
  )
}