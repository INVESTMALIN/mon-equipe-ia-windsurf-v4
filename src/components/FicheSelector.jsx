import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { FileText, X } from 'lucide-react'

export default function FicheSelector({ userId, onSelect, onClose }) {
  const [fiches, setFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFiches = async () => {
      if (!userId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('fiche_lite')
          .select('id, nom, created_at, statut')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        setFiches(data || [])
      } catch (err) {
        console.error('Erreur fetch fiches:', err)
        setError('Impossible de charger vos fiches')
      } finally {
        setLoading(false)
      }
    }

    fetchFiches()
  }, [userId])

  const handleSelectFiche = async (fiche) => {
    // On va fetch les détails complets de la fiche
    try {
      const { data, error } = await supabase
        .from('fiche_lite')
        .select('*')
        .eq('id', fiche.id)
        .single()

      if (error) throw error

      onSelect(data)
    } catch (err) {
      console.error('Erreur lors de la sélection:', err)
      alert('Erreur lors de la sélection de la fiche')
    }
  }

  if (loading) {
    return (
      <div className="mb-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">Chargement de vos fiches...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-3 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={onClose} className="text-red-600 hover:text-red-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (fiches.length === 0) {
    return (
      <div className="mb-3 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
        <p className="text-sm text-gray-600">Aucune fiche disponible. Créez-en une depuis le tableau de bord.</p>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="mb-3 flex items-center gap-2">
      <FileText className="w-4 h-4 text-[#dbae61]" />
      <select
        onChange={(e) => {
          const ficheId = e.target.value
          if (ficheId) {
            const fiche = fiches.find(f => f.id === ficheId)
            if (fiche) handleSelectFiche(fiche)
          }
        }}
        className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] text-sm"
        defaultValue=""
      >
        <option value="" disabled>Sélectionner une fiche...</option>
        {fiches.map((fiche) => (
          <option key={fiche.id} value={fiche.id}>
            {fiche.nom} - {new Date(fiche.created_at).toLocaleDateString('fr-FR')}
          </option>
        ))}
      </select>
      <button 
        onClick={onClose} 
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Annuler"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}