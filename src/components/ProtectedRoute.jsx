import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur vérification session:', error)
          setIsAuthenticated(false)
        } else if (session?.user) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          // Redirection silencieuse vers connexion
          navigate('/connexion', { replace: true })
        }
      } catch (error) {
        console.error('Erreur authentification:', error)
        setIsAuthenticated(false)
        navigate('/connexion', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Écouter les changements d'état d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setIsAuthenticated(false)
          navigate('/connexion', { replace: true })
        } else if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate])

  // Affichage pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dbae61] mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification...</p>
        </div>
      </div>
    )
  }

  // Si authentifié, rendre le composant enfant
  if (isAuthenticated) {
    return children
  }

  // Si pas authentifié, on a déjà redirigé, donc ne rien rendre
  return null
}