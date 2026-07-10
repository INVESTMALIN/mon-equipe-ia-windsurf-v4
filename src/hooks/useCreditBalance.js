import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

// Solde de crédits — TOUJOURS issu du RPC get_credit_balance (recalculé depuis le
// ledger côté serveur), JAMAIS calculé côté front. Factorisé pour être partagé entre
// /mes-credits et le chip du Dashboard.
//
// `enabled` : permet au Dashboard de ne déclencher le fetch que pour un rôle fiche_lite
// (le rôle n'est connu qu'après chargement du profil → l'appel se lance quand il passe
// à true). Défaut true pour les appelants qui savent déjà que le solde est pertinent.
export function useCreditBalance(enabled = true) {
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      // Sans argument : le défaut auth.uid() côté fonction renvoie le solde du user connecté.
      const { data, error: rpcError } = await supabase.rpc('get_credit_balance')
      if (rpcError) {
        setError(true)
        setBalance(null)
      } else {
        setBalance(data ?? 0)
      }
    } catch {
      // Rejet brut de la promesse (réseau coupé, client injoignable…).
      setError(true)
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) refresh()
  }, [enabled, refresh])

  return { balance, loading, error, refresh }
}
