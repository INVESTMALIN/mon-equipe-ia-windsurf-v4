import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// Parcours Fiche Logement Lite : un user `fiche_lite` ne peut accéder QU'À ces
// routes. Toute autre route protégée de Mon Équipe IA le renvoie à son dashboard
// (produit standalone, indépendant de Mon Équipe IA). Pour rouvrir une route en
// bonus (ex: '/assistant-invest-malin'), il suffit d'ajouter son path ici.
export const FICHE_LITE_ALLOWED_PATHS = [
  '/dashboard',      // tableau de bord fiches
  '/fiche',          // création / édition d'une fiche (?id=... = query, pathname = /fiche)
  '/nouvelle-fiche', // alias création
  '/mes-credits',    // solde + achat de crédits + retour Stripe (?checkout=success)
  '/mon-compte',     // page compte
]

export default function ProtectedRoute({ children, requirePremium = false, allowRoles = [] }) {
  const [loading, setLoading] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Clé stable pour les deps de l'effet (allowRoles est un tableau recréé à chaque render)
  const allowRolesKey = allowRoles.join(',')

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 1. Vérifier si utilisateur connecté
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur vérification session:', error)
          navigate('/connexion', { replace: true })
          return
        }

        if (!session?.user) {
          navigate('/connexion', { replace: true })
          return
        }

        // 2. Récupérer le profil (rôle + infos premium). Le rôle est requis sur
        // TOUTES les routes protégées pour le gating fiche_lite ci-dessous, pas
        // seulement sur les routes premium.
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('subscription_status, subscription_trial_end, subscription_current_period_end, role')
          .eq('id', session.user.id)
          .single()

        // 2b. Gating Fiche Logement Lite : un user `fiche_lite` ne peut accéder
        // QU'AUX routes de son parcours (cf. FICHE_LITE_ALLOWED_PATHS). Toute
        // autre route le renvoie à son dashboard. N'affecte AUCUN autre rôle
        // (premium/admin/free). Fail-open si le profil est illisible : on ne
        // bloque pas les autres rôles sur une erreur transitoire (le check
        // premium ci-dessous, lui, refuse déjà l'accès sans profil valide).
        if (
          !profileError &&
          profile?.role === 'fiche_lite' &&
          !FICHE_LITE_ALLOWED_PATHS.includes(location.pathname)
        ) {
          navigate('/dashboard', { replace: true })
          return
        }

        // 3. Si pas besoin de premium, utilisateur connecté suffit
        if (!requirePremium) {
          setIsAllowed(true)
          return
        }

        // 4. Premium requis : à partir d'ici le profil doit être lisible
        if (profileError) {
          console.error('Erreur récupération profil:', profileError)
          navigate('/connexion', { replace: true })
          return
        }

        const status = profile.subscription_status
        const role = profile.role
        const now = new Date()

        // 3b. Rôles explicitement autorisés sur cette route (ex: fiche_lite sur
        // la Fiche Logement et son dashboard). Court-circuite le check premium
        // SANS toucher au parcours concierge (allowRoles vide => comportement
        // d'origine).
        if (allowRoles.includes(role)) {
          setIsAllowed(true)
          return
        }

        // Cible de redirection en cas de refus : un fiche_lite n'a rien à faire
        // sur /upgrade (offre premium concierge), on le renvoie à son dashboard.
        const deniedRedirect = role === 'fiche_lite' ? '/dashboard' : '/upgrade'

        // 4. Vérifier expiration TRIAL
        if (status === 'trial') {
          if (!profile.subscription_trial_end) {
            console.log('Trial sans date de fin, accès refusé')
            navigate(deniedRedirect, { replace: true })
            return
          }

          const trialEnd = new Date(profile.subscription_trial_end)
          if (trialEnd < now) {
            console.log(`Trial expiré (${trialEnd.toISOString()})`)
            navigate(deniedRedirect, { replace: true })
            return
          }

          // Trial valide
          setIsAllowed(true)
          return
        }

        // 5. Vérifier expiration PREMIUM
        if (status === 'premium') {
          if (!profile.subscription_current_period_end) {
            console.log('Premium sans date de fin, accès refusé')
            navigate(deniedRedirect, { replace: true })
            return
          }

          const periodEnd = new Date(profile.subscription_current_period_end)
          if (periodEnd < now) {
            console.log(`Premium expiré (${periodEnd.toISOString()})`)
            navigate(deniedRedirect, { replace: true })
            return
          }

          // Premium valide
          setIsAllowed(true)
          return
        }

        // 6. Statut non autorisé (free, expired, autre)
        console.log(`Accès premium refusé. Statut actuel: ${status}`)
        navigate(deniedRedirect, { replace: true })

      } catch (error) {
        console.error('Erreur générale checkAccess:', error)
        navigate('/connexion', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    checkAccess()

    // 7. Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setIsAllowed(false)
          navigate('/connexion', { replace: true })
        } else if (event === 'SIGNED_IN' && session) {
          // Relancer la vérification complète
          checkAccess()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate, requirePremium, allowRolesKey, location.pathname])

  // Affichage pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dbae61] mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des accès...</p>
        </div>
      </div>
    )
  }

  // Si autorisé, afficher le contenu
  return isAllowed ? children : null
}