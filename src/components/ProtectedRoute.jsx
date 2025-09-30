import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ProtectedRoute({ children, requirePremium = false }) {
  const [loading, setLoading] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)
  const navigate = useNavigate()

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

        // 2. Si pas besoin de premium, utilisateur connecté suffit
        if (!requirePremium) {
          setIsAllowed(true)
          return
        }

        // 3. Si premium requis, récupérer profil utilisateur + DATES
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('subscription_status, subscription_trial_end, subscription_current_period_end')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Erreur récupération profil:', profileError)
          navigate('/connexion', { replace: true })
          return
        }

        const status = profile.subscription_status
        const now = new Date()

        // 4. Vérifier expiration TRIAL
        if (status === 'trial') {
          if (!profile.subscription_trial_end) {
            console.log('Trial sans date de fin, accès refusé')
            navigate('/upgrade', { replace: true })
            return
          }

          const trialEnd = new Date(profile.subscription_trial_end)
          if (trialEnd < now) {
            console.log(`Trial expiré (${trialEnd.toISOString()})`)
            navigate('/upgrade', { replace: true })
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
            navigate('/upgrade', { replace: true })
            return
          }

          const periodEnd = new Date(profile.subscription_current_period_end)
          if (periodEnd < now) {
            console.log(`Premium expiré (${periodEnd.toISOString()})`)
            navigate('/upgrade', { replace: true })
            return
          }

          // Premium valide
          setIsAllowed(true)
          return
        }

        // 6. Statut non autorisé (free, expired, autre)
        console.log(`Accès premium refusé. Statut actuel: ${status}`)
        navigate('/upgrade', { replace: true })

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
  }, [navigate, requirePremium])

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