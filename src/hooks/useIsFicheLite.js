import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// true si l'utilisateur connecté suit le parcours Fiche Logement (concierge à crédits).
// Sert à n'afficher QU'À lui les éléments propres à ce parcours : le monde Mon Équipe IA
// (assistants, abonnement) ne doit jamais voir une aide qui parle de crédits ou de
// verrouillage de fiche.
//
// Fail-closed : tant que le rôle n'est pas lu POSITIVEMENT, on renvoie false. Sur une
// erreur réseau, il vaut mieux pas d'aide qu'une aide affichée au mauvais public.
export function useIsFicheLite() {
  const [isFicheLite, setIsFicheLite] = useState(false)

  useEffect(() => {
    let cancelled = false

    const resolve = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setIsFicheLite(false)
        return
      }
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      if (cancelled) return
      setIsFicheLite(!error && data?.role === 'fiche_lite')
    }

    resolve()

    // Connexion / déconnexion : recalcul sans rechargement de page. Le travail est
    // déporté hors du callback (setTimeout 0) : supabase-js v2 tient un verrou pendant
    // l'exécution des listeners, appeler auth.getUser() dedans peut bloquer.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => { if (!cancelled) resolve() }, 0)
    })

    return () => {
      cancelled = true
      subscription?.unsubscribe()
    }
  }, [])

  return isFicheLite
}
