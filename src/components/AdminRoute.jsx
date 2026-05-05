import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session?.user) {
          navigate('/connexion', { replace: true })
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        // Fail-closed : toute erreur ou rôle != 'admin' refuse l'accès
        if (profileError || profile?.role !== 'admin') {
          navigate('/mon-compte', { replace: true })
          return
        }

        setIsAllowed(true)
      } catch (err) {
        console.error('Erreur AdminRoute checkAccess:', err)
        navigate('/mon-compte', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    checkAccess()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setIsAllowed(false)
          navigate('/connexion', { replace: true })
        } else if (event === 'SIGNED_IN' && session) {
          checkAccess()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate])

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

  return isAllowed ? children : null
}
