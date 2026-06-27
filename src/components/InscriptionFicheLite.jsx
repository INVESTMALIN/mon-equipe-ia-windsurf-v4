import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// Inscription dédiée à la landing /fiche-logement (public ThriveCart).
// Identique dans l'esprit à Inscription.jsx, mais pose le rôle `fiche_lite`
// via la métadonnée signup (lue et whitelistée par le trigger handle_new_user).
// Volontairement séparée de Inscription.jsx pour ne rien changer au parcours
// d'inscription concierge existant.
export default function InscriptionFicheLite() {
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
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/email-confirmation`,
        // Le trigger DB n'honore cette valeur que si elle vaut 'fiche_lite'.
        data: { role: 'fiche_lite' }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const userId = data?.user?.id
    if (!userId) {
      // Cas confirmation email obligatoire : le trigger DB a déjà créé la ligne
      // users avec le rôle fiche_lite. On laisse l'utilisateur confirmer.
      navigate('/compte-cree')
      return
    }

    // La ligne users existe déjà via trigger : on complète juste prénom/nom.
    await new Promise(resolve => setTimeout(resolve, 500))

    const { error: updateError } = await supabase
      .from('users')
      .update({
        prenom: firstName,
        nom: lastName
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Erreur update profil:', updateError)
      // On continue quand même, le compte principal est créé
    }

    navigate('/compte-cree')
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Colonne gauche - Image / pitch */}
      <div className="hidden lg:flex lg:flex-1 relative flex-col justify-end p-12">
        <img
          src="/images/hero-image.png"
          alt="Fiche Logement"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
        <div className="relative text-white max-w-md">
          <h2 className="text-3xl font-bold mb-4">
            Inspectez vos logements comme un pro.
          </h2>
          <p className="text-lg text-gray-200">
            Créez votre compte et lancez votre première fiche d'inspection en quelques minutes.
          </p>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-white">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/images/invest-malin-logo.png"
                alt="Invest Malin Logo"
                className="h-8"
              />
              <span className="text-2xl font-bold text-black">FICHE LOGEMENT</span>
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">
              Créer votre compte
            </h1>
            <p className="text-gray-600 text-lg">
              Accédez à l'outil d'inspection et lancez votre première fiche.
            </p>
          </div>

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

          <div className="mt-8 text-center">
            <Link
              to="/fiche-logement"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Retour à la présentation
            </Link>
          </div>

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
