import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, CreditCard, User, ArrowLeft, Settings } from 'lucide-react'
import { supabase } from '../supabaseClient'
import ChangePasswordModal from './ChangePasswordModal'

export default function MonCompte() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      // Plus besoin de vérifier l'auth - ProtectedRoute s'en occupe
      const { data: { session } } = await supabase.auth.getSession()
      
      // L'utilisateur est forcément connecté ici
      setUser(session.user)
      await loadUserProfile(session.user.id)
    }
    loadUserData()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_status, stripe_customer_id, subscription_current_period_end')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erreur chargement profil:', error)
      } else {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!userProfile?.stripe_customer_id) {
      alert('Erreur: Aucun ID client Stripe trouvé')
      return
    }

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: userProfile.stripe_customer_id,
          return_url: window.location.origin + '/mon-compte'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        window.location.href = data.url
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      alert('Erreur réseau: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/connexion')
  }

  const renderSubscriptionSection = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-[#dbae61]" />
            <h2 className="text-xl font-bold text-black">Abonnement</h2>
          </div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      )
    }

    const subscriptionStatus = userProfile?.subscription_status || 'free'
    const periodEnd = userProfile?.subscription_current_period_end

    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-[#dbae61]" />
          <h2 className="text-xl font-bold text-black">Abonnement</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Plan actuel</label>
            <div className="flex items-center gap-2">
              {subscriptionStatus === 'free' && (
                <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  Gratuit
                </span>
              )}
              {subscriptionStatus === 'premium' && (
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Premium Actif
                </span>
              )}
              {subscriptionStatus === 'expired' && (
                <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Expiré
                </span>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prochaine facturation</label>
            <p className="text-gray-600">
              {subscriptionStatus === 'premium' && periodEnd 
                ? new Date(periodEnd).toLocaleDateString('fr-FR')
                : 'Aucune'
              }
            </p>
          </div>

          {subscriptionStatus === 'premium' && periodEnd && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prix</label>
              <p className="text-gray-600">4,90€/mois</p>
            </div>
          )}
          
          <div className="pt-4">
            {subscriptionStatus === 'free' && (
              <Link 
                to="/upgrade" 
                className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                Passer Premium
              </Link>
            )}
            
            {subscriptionStatus === 'premium' && (
              <button
                onClick={handleManageSubscription}
                className="bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                Gérer mon abonnement
              </button>
            )}
            
            {subscriptionStatus === 'expired' && (
              <Link 
                to="/upgrade" 
                className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                Réactiver Premium
              </Link>
            )}
          </div>
        </div>
      </div>
    )
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
              <span className="text-sm font-medium">Retour</span>
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
            <h2 className="text-xl font-bold text-black">Informations</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <p className="text-gray-600">{user?.email || 'Chargement...'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sécurité</label>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="text-[#dbae61] hover:text-[#c49a4f] font-medium transition-colors"
              >
                Modifier le mot de passe
              </button>
            </div>
            
            <button className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors text-sm">
              Modifier les informations
            </button>
          </div>
        </div>

        {/* Modal changement mot de passe */}
        <ChangePasswordModal 
          isOpen={showPasswordModal} 
          onClose={() => setShowPasswordModal(false)} 
        />

          {/* Section Abonnement dynamique */}
          {renderSubscriptionSection()}
        </div>

        {/* Statistiques d'utilisation */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-[#dbae61]" />
            <h2 className="text-xl font-bold text-black">Votre activité</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">24</div>
              <p className="text-sm text-blue-800 font-medium">Conversations</p>
              <p className="text-xs text-blue-600 mt-1">Ce mois-ci</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">156</div>
              <p className="text-sm text-green-800 font-medium">Questions posées</p>
              <p className="text-xs text-green-600 mt-1">Total</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
              <p className="text-sm text-purple-800 font-medium">Assistants utilisés</p>
              <p className="text-xs text-purple-600 mt-1">Formation + Premium</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-2">12j</div>
              <p className="text-sm text-orange-800 font-medium">Membre depuis</p>
              <p className="text-xs text-orange-600 mt-1">Décembre 2024</p>
            </div>
          </div>
        </div>

        {/* Accès rapide aux assistants */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-[#dbae61]" />
            <h2 className="text-xl font-bold text-black">Accès rapide</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link 
              to="/assistant-formation" 
              className="flex items-center gap-4 p-6 bg-gradient-to-r from-[#dbae61]/10 to-[#c49a4f]/10 rounded-lg hover:from-[#dbae61]/20 hover:to-[#c49a4f]/20 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-[#dbae61] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Assistant Formation</h3>
                <p className="text-sm text-gray-600">Questions sur la formation Invest Malin</p>
                <p className="text-xs text-[#dbae61] font-medium mt-1">Gratuit • Disponible</p>
              </div>
            </Link>

            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Assistants Premium</h3>
                <p className="text-sm text-gray-500">Fiscaliste IA, LegalBNB, Négociateur IA</p>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  {userProfile?.subscription_status === 'premium' ? 'Disponibles bientôt' : 'Nécessite Premium'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section paramètres avancés */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-[#dbae61]" />
            <h2 className="text-xl font-bold text-black">Gestion avancée</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Historique des factures</h3>
              <p className="text-sm text-gray-500 mb-4">Consultez et téléchargez vos factures</p>
              <button className="text-[#dbae61] text-sm font-medium hover:underline" disabled>
                Bientôt disponible
              </button>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Préférences</h3>
              <p className="text-sm text-gray-500 mb-4">Personnalisez votre expérience</p>
              <button className="text-[#dbae61] text-sm font-medium hover:underline" disabled>
                Bientôt disponible
              </button>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-orange-600" />
              </div>
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

        {/* Conseils et astuces */}
        <div className="mt-8 bg-gradient-to-r from-[#dbae61]/10 via-[#c49a4f]/10 to-[#dbae61]/10 rounded-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-black mb-2">💡 Maximisez votre expérience</h2>
            <p className="text-gray-600">Quelques conseils pour tirer le meilleur parti de Mon Équipe IA</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">🎯 Soyez précis</h3>
              <p className="text-sm text-gray-600">Plus vos questions sont détaillées, plus les réponses seront pertinentes et utiles.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">📚 Explorez</h3>
              <p className="text-sm text-gray-600">N'hésitez pas à poser des questions variées, chaque assistant a ses domaines d'expertise.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">⭐ Premium</h3>
              <p className="text-sm text-gray-600">Avec le plan Premium, accédez aux assistants spécialisés pour des conseils experts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}