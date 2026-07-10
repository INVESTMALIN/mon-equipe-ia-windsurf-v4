import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Coins, AlertCircle, FileText, Loader2 } from 'lucide-react'
import { supabase } from '../../supabaseClient'

// Modale de confirmation de création (utilisateurs fiche_lite uniquement). UNE modale,
// pas deux étapes : trois infos claires (coût, solde restant, non remboursé), puis action.
// La création + le débit sont atomiques côté base (RPC create_fiche_lite_with_debit) : le
// front ne fait que déclencher, la garantie est en base.
export default function CreateFicheModal({ isOpen, onClose, balance, onDebited }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [insufficient, setInsufficient] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  // Solde insuffisant : soit connu d'avance (< 1), soit renvoyé par la RPC (course concurrente).
  const showInsufficient = insufficient || (typeof balance === 'number' && balance < 1)

  const handleClose = () => {
    if (creating) return
    setName('')
    setInsufficient(false)
    setError(null)
    onClose()
  }

  const handleCreate = async () => {
    setError(null)
    setCreating(true)
    // Nom saisi transmis à la RPC ; un nom vide reste accepté (le serveur retombe sur
    // « Nouvelle fiche »), on ne bloque pas la création pour ça.
    const { data: ficheId, error: rpcError } = await supabase.rpc('create_fiche_lite_with_debit', {
      p_nom: name,
    })
    if (rpcError) {
      setCreating(false)
      // P0001 = solde insuffisant (levé par la fonction, autoritaire sur le solde réel).
      if (rpcError.code === 'P0001') { setInsufficient(true); return }
      setError('La création a échoué. Réessayez dans un instant.')
      return
    }
    onDebited?.() // rafraîchit le solde affiché côté Dashboard
    onClose()
    navigate(`/fiche?id=${ficheId}`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          disabled={creating}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#dbae61] bg-opacity-15 rounded-full flex items-center justify-center">
            {showInsufficient
              ? <Coins className="w-8 h-8 text-[#dbae61]" />
              : <FileText className="w-8 h-8 text-[#dbae61]" />}
          </div>
        </div>

        {showInsufficient ? (
          <>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Crédits insuffisants</h2>
            <p className="text-center text-gray-600 mb-5">
              La création d'une fiche coûte 1 crédit et il ne vous en reste pas assez. Rechargez pour continuer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => { onClose(); navigate('/mes-credits') }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold rounded-xl transition-colors"
              >
                <Coins className="w-4 h-4" />
                Recharger
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-4">Créer une nouvelle fiche</h2>

            <div className="mb-4">
              <label htmlFor="fiche-nom" className="block text-sm font-medium text-gray-700 mb-1.5">Nom de la fiche</label>
              <input
                id="fiche-nom"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={creating}
                placeholder="Ex : Appartement Rue de la Paix"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent disabled:bg-gray-50"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">Facultatif — pour retrouver votre fiche dans la liste.</p>
            </div>

            <ul className="text-sm text-gray-700 space-y-2.5 mb-5 bg-gray-50 border border-gray-100 rounded-xl p-4">
              <li className="flex items-center gap-2.5">
                <Coins className="w-4 h-4 text-[#dbae61] shrink-0" />
                <span>Créer cette fiche coûte <strong>1 crédit</strong>.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#dbae61] shrink-0" />
                <span>Il vous reste <strong>{typeof balance === 'number' ? balance : '…'}</strong> crédit{balance > 1 ? 's' : ''}.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#dbae61] shrink-0 mt-0.5" />
                <span>Ce crédit n'est pas remboursé si vous supprimez la fiche.</span>
              </li>
            </ul>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#dbae61] hover:bg-[#c49a4f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                {creating ? (<><Loader2 className="w-4 h-4 animate-spin" /> Création…</>) : 'Créer la fiche'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
