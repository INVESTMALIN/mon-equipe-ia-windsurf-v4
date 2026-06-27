import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard } from 'lucide-react'

// Placeholder volontaire (partie 2 : crédits + Stripe + ledger).
// Aucune logique réelle ici : recharge, historique et factures viendront plus tard.
export default function MesCredits() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 bg-[#dbae61] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-[#dbae61]" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">Mes crédits</h1>

          <p className="text-gray-600 mb-2">
            La recharge de crédits, l'historique de vos achats et vos factures
            arriveront bientôt ici.
          </p>
          <p className="text-sm text-gray-400 mb-6">Bientôt disponible</p>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  )
}
