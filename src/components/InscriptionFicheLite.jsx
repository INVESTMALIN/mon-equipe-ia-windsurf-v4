import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { signupIndicatesExistingEmail } from '../lib/authHelpers'
import AccountExistsNotice from './AccountExistsNotice'
import { FL, DISPLAY_SANS, AUTH_FIELD_CLASS, AUTH_SUBMIT_CLASS } from '../lib/ficheLogementTheme'
import { AuthAside, BrandLockup, UniversePill } from './FicheLogementBrand'

// Inscription dédiée à la landing /fiche-logement (public ThriveCart).
// Identique dans l'esprit à Inscription.jsx, mais pose le rôle `fiche_lite`
// via la métadonnée signup (lue et whitelistée par le trigger handle_new_user).
// Volontairement séparée de Inscription.jsx pour ne rien changer au parcours
// d'inscription concierge existant.
//
// L'habillage vient de FicheLogementBrand (crème / encre / or) pour que cet écran
// soit visuellement le prolongement de la landing. La logique ci-dessous n'a pas
// bougé : même appel signUp, même détection d'email existant, même complétion du
// profil, même destination /compte-cree.
export default function InscriptionFicheLite() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [emailExists, setEmailExists] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setEmailExists(false)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/email-confirmation`,
        // Le trigger DB n'honore cette valeur que si elle vaut 'fiche_lite'.
        data: { role: 'fiche_lite' }
      }
    })

    // Email déjà en base : Supabase ne lève pas d'erreur (anti-énumération), on
    // le détecte via la réponse et on affiche un message actionnable au lieu de
    // filer silencieusement vers /compte-cree.
    if (signupIndicatesExistingEmail(data, error)) {
      setEmailExists(true)
      setLoading(false)
      return
    }

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
    <div className="flex min-h-screen" style={{ backgroundColor: FL.paper }}>
      <AuthAside
        eyebrow="Ton nouvel outil métier"
        title="Prépare tes logements"
        accent="comme un pro"
        text="Crée ton compte et lance ta première fiche. Le parcours guidé et l’assistant d’annonces sont inclus."
        points={[
          '24 sections guidées, des accès aux extérieurs',
          'Annonces Airbnb et Booking générées depuis ta fiche',
          'PDF propre à partager à ton équipe',
        ]}
      />

      <div className="flex flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Le lockup et la pastille ne sont visibles qu'en dessous de lg :
              au-delà, la colonne éditoriale de gauche les porte déjà. */}
          <div className="lg:hidden">
            <Link to="/fiche-logement" className="inline-block">
              <BrandLockup />
            </Link>
            <UniversePill className="mt-5" />
          </div>

          <h1 className={`mt-8 text-3xl sm:text-[2.1rem] lg:mt-0 ${DISPLAY_SANS}`}>
            Crée ton compte
          </h1>
          <p className="mt-3 text-base" style={{ color: FL.muted }}>
            Accède à l’outil de préparation et lance ta première fiche.
          </p>

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-bold" style={{ color: FL.ink }}>
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  className={AUTH_FIELD_CLASS}
                  style={{ borderColor: FL.line }}
                  placeholder="Ton prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-bold" style={{ color: FL.ink }}>
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  className={AUTH_FIELD_CLASS}
                  style={{ borderColor: FL.line }}
                  placeholder="Ton nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold" style={{ color: FL.ink }}>
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                className={AUTH_FIELD_CLASS}
                style={{ borderColor: FL.line }}
                placeholder="Ton adresse email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailExists(false) }}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold" style={{ color: FL.ink }}>
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className={AUTH_FIELD_CLASS}
                style={{ borderColor: FL.line }}
                placeholder="Choisis un mot de passe sécurisé"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="mt-1.5 text-xs" style={{ color: FL.muted }}>
                Minimum 6 caractères recommandés
              </p>
            </div>

            {emailExists && <AccountExistsNotice />}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className={AUTH_SUBMIT_CLASS}>
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: FL.muted }}>
            Déjà un compte ?{' '}
            <Link
              to="/connexion-fiche-logement"
              className="font-bold underline-offset-4 transition-colors hover:underline"
              style={{ color: FL.goldDeep }}
            >
              Se connecter
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link
              to="/fiche-logement"
              className="text-sm font-medium transition-colors hover:opacity-60"
              style={{ color: FL.muted }}
            >
              ← Retour à la présentation
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-relaxed" style={{ color: FL.muted }}>
            En créant ton compte, tu acceptes nos{' '}
            <Link to="/conditions-utilisation" className="underline" style={{ color: FL.goldDeep }}>
              conditions d’utilisation
            </Link>{' '}
            et notre{' '}
            <Link to="/politique-confidentialite" className="underline" style={{ color: FL.goldDeep }}>
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
