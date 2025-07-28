import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, CreditCard, User, ArrowLeft, Settings } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function MonCompte() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/connexion')
      } else {
        setUser(session.user)
      }
    }
    checkAuth()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/connexion')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header noir */}
      <header className="bg-black text-white px-6 md:px-20 py-4">
        <div className="flex items-center justify-between">
          <Link to="/assistants" className="flex items-center gap-3 hover:text-[#dbae61] transition-colors">
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-8"
            />
            <span className="text-lg font-bold">MON ÉQUIPE IA</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              to="/assistants" 
              className="flex items-center gap-2 text-white hover:text-[#dbae61] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Retour aux assistants</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-6 md:px-20 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Mon Compte</h1>
          <p className="text-gray-600">Gérez vos informations et votre abonnement</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Informations personnelles */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#dbae61]" />
              <h2 className="text-xl font-bold text-black">Informations personnelles</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <p className="text-gray-600">{user?.email || 'Chargement...'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Actif
                </span>
              </div>
              
              <button className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors text-sm">
                Modifier les informations
              </button>
            </div>
          </div>

          {/* Abonnement */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-[#dbae61]" />
              <h2 className="text-xl font-bold text-black">Abonnement</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan actuel</label>
                <p className="text-gray-600">Gratuit</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prochaine facturation</label>
                <p className="text-gray-600">Aucune</p>
              </div>
              
              <Link 
                to="/upgrade" 
                className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Passer Premium
              </Link>
            </div>
          </div>
        </div>

        {/* Section placeholder pour futures fonctionnalités */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-[#dbae61]" />
            <h2 className="text-xl font-bold text-black">Paramètres avancés</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Historique des factures</h3>
              <p className="text-sm text-gray-500 mb-4">Consultez vos factures passées</p>
              <button className="text-[#dbae61] text-sm font-medium hover:underline" disabled>
                Bientôt disponible
              </button>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Moyens de paiement</h3>
              <p className="text-sm text-gray-500 mb-4">Gérez vos cartes bancaires</p>
              <button className="text-[#dbae61] text-sm font-medium hover:underline" disabled>
                Bientôt disponible
              </button>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Support client</h3>
              <p className="text-sm text-gray-500 mb-4">Contactez notre équipe</p>
              <a 
                href="mailto:support@invest-malin.fr" 
                className="text-[#dbae61] text-sm font-medium hover:underline"
              >
                Envoyer un email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}