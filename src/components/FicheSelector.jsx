import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { FileText, X } from 'lucide-react'

export default function FicheSelector({ userId, onSelect, onClose }) {
  const [fiches, setFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

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
    <div className="mb-3 relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#dbae61]" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] text-sm text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <span className="text-gray-500">Sélectionner une fiche...</span>
          <span className="text-gray-400">▼</span>
        </button>
        <button 
          onClick={onClose} 
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Annuler"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
  
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">          {fiches.map((fiche) => (
            <button
              key={fiche.id}
              type="button"
              onClick={() => {
                handleSelectFiche(fiche)
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left hover:bg-[#dbae61] hover:bg-opacity-10 text-sm border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">{fiche.nom}</div>
              <div className="text-xs text-gray-500">
                {new Date(fiche.created_at).toLocaleDateString('fr-FR')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )}