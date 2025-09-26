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

        // 3. Si premium requis, récupérer profil utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Erreur récupération profil:', profileError)
          navigate('/connexion', { replace: true })
          return
        }

        // 4. Vérifier si statut premium ou trial
        const isPremiumUser = profile.subscription_status === 'premium' || 
                             profile.subscription_status === 'trial'

        if (!isPremiumUser) {
          console.log(`Accès premium refusé. Statut actuel: ${profile.subscription_status}`)
          navigate('/upgrade', { replace: true })
          return
        }

        // 5. Tout est OK, autoriser l'accès
        setIsAllowed(true)

      } catch (error) {
        console.error('Erreur générale checkAccess:', error)
        navigate('/connexion', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    checkAccess()

    // 6. Écouter les changements d'authentification
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