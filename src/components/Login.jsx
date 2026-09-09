import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { FL, DISPLAY_SANS, AUTH_FIELD_CLASS, AUTH_SUBMIT_CLASS } from '../lib/ficheLogementTheme'
import { AuthAside, BrandLockup, UniversePill } from './FicheLogementBrand'

// Écran de connexion unique de l'application, décliné en deux habillages.
//
//   variant="meia"  (défaut) → /connexion, univers général Mon Équipe IA
//   variant="fiche"          → /connexion-fiche-logement, univers Fiche Logement
//
// Seule la PRÉSENTATION change. `handleSubmit` est écrit une seule fois et sert les
// deux variantes : même appel signInWithPassword, même traduction du ban Supabase,
// même lecture du rôle, même destination post-login. Un visiteur qui arrive par
// /connexion et un visiteur qui arrive par la landing atterrissent donc exactement
// au même endroit, et les deux pages restent interchangeables si besoin.
export default function Login({ variant = 'meia' }) {
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
      // Le ban Supabase (désactivation admin) renvoie « User is banned » : message
      // brut anglais, illisible pour un concierge. On le traduit en consigne claire.
      if (/banned/i.test(error.message)) {
        setError('Votre compte a été désactivé. Contactez votre conciergerie.')
      } else {
        setError('Connexion échouée : ' + error.message)
      }
      setLoading(false)
      return
    }

    // Si succès : router selon le rôle.
    // Un fiche_lite (accès ThriveCart) atterrit sur son dashboard ;
    // tous les autres gardent leur destination d'origine (/assistants).
    let destination = '/assistants'
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()
      if (profile?.role === 'fiche_lite') {
        destination = '/dashboard'
      }
    } catch (profileError) {
      console.error('Erreur lecture rôle post-login:', profileError)
    }

    console.log('Login réussi:', data)
    window.location.href = destination
  }

  // ───────────────────────── Variante Fiche Logement ─────────────────────────
  if (variant === 'fiche') {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: FL.paper }}>
        <AuthAside
          eyebrow="Ton espace de préparation"
          title="Reprends là où"
          accent="tu t’es arrêté"
          // « rappels photo » et non « photos » : Lite ne stocke AUCUN fichier, les
          // champs média du parcours coordinateurs y deviennent des cases à cocher
          // (cf. src/lib/formDefaults.js et FicheEquipements). Promettre les photos
          // ici serait un engagement que le produit ne tient pas.
          text="Tes fiches, tes rappels photo et tes annonces générées restent réunies au même endroit."
          points={[
            'Tes fiches en cours et terminées',
            'Tes annonces Airbnb et Booking',
            'Tes PDF prêts à partager',
          ]}
        />

        <div className="flex flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-md">
            {/* Visible seulement sous lg : au-delà, la colonne de gauche porte l'identité. */}
            <div className="lg:hidden">
              <Link to="/fiche-logement" className="inline-block">
                <BrandLockup />
              </Link>
              <UniversePill className="mt-5" />
            </div>

            <h1 className={`mt-8 text-3xl sm:text-[2.1rem] lg:mt-0 ${DISPLAY_SANS}`}>
              Retrouve tes fiches logement
            </h1>
            <p className="mt-3 text-base" style={{ color: FL.muted }}>
              Connecte-toi pour continuer la préparation de tes biens et accéder à tes annonces.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Ton mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className={AUTH_SUBMIT_CLASS}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm">
              <Link
                to="/mot-de-passe-oublie"
                className="font-bold underline-offset-4 transition-colors hover:underline"
                style={{ color: FL.goldDeep }}
              >
                Mot de passe oublié ?
              </Link>
            </p>

            <p className="mt-4 text-center text-sm" style={{ color: FL.muted }}>
              Pas encore de compte ?{' '}
              <Link
                to="/inscription-fiche-logement"
                className="font-bold underline-offset-4 transition-colors hover:underline"
                style={{ color: FL.goldDeep }}
              >
                Créer mon compte
              </Link>
            </p>

            <p className="mt-8 text-center">
              <Link
                to="/fiche-logement"
                className="text-sm font-medium transition-colors hover:opacity-60"
                style={{ color: FL.muted }}
              >
                ← Retour à la présentation
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ───────────────────── Variante Mon Équipe IA (inchangée) ─────────────────────
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
