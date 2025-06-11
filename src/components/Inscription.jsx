import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Inscription() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Insérer dans la table 'users'
    await supabase.from('users').insert([
      {
        id: data.user.id,
        prenom: firstName,
        nom: lastName
      }
    ])

    navigate('/compte-cree')
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Colonne gauche - Image */}
      <div className="hidden lg:block lg:flex-1 relative">
        <img
          src="/images/hero-image.png"
          alt="Mon Équipe IA"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            Rejoignez la révolution IA
          </h2>
          <p className="text-lg opacity-90">
            Créez votre compte et découvrez comment l'intelligence artificielle peut transformer votre conciergerie.
          </p>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-md mx-auto w-full">
          {/* Logo et titre */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <img 
                src="/images/invest-malin-logo.png" 
                alt="Invest Malin Logo" 
                className="h-8"
              />
              <span className="text-2xl font-bold text-black">MON ÉQUIPE IA</span>
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">
              Créer votre compte
            </h1>
            <p className="text-gray-600 text-lg">
              Commencez votre parcours avec vos assistants IA personnalisés
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors"
                  placeholder="Votre prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors"
                  placeholder="Votre nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                placeholder="Choisissez un mot de passe sécurisé"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 caractères recommandés
              </p>
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
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Liens */}
          <div className="mt-8 text-center space-y-4">
            <div className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link 
                to="/connexion" 
                className="text-[#dbae61] hover:text-[#c49a4f] font-medium transition-colors"
              >
                Se connecter
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

          {/* Mention légale */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              En créant un compte, vous acceptez nos{' '}
              <Link to="/conditions-utilisation" className="text-[#dbae61] hover:underline">conditions d'utilisation</Link>
              {' '}et notre{' '}
              <Link to="/politique-confidentialite" className="text-[#dbae61] hover:underline">politique de confidentialité</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}