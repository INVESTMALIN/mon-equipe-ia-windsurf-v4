import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { HelpCircle, CreditCard, User, ArrowLeft, ArrowRight, MessageSquare, Shield, Trash2, AlertCircle } from 'lucide-react'
import { supabase } from '../supabaseClient'
import ChangePasswordModal from './ChangePasswordModal'
import EditProfileModal from './EditProfileModal'
import DeleteConversationsModal from './DeleteConversationsModal'

export default function MonCompte() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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
        .select('subscription_status, stripe_customer_id, subscription_current_period_end, subscription_trial_end, subscription_cancel_at_period_end, has_used_trial, prenom, nom')
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
    try {
      // Récupérer le token d'authentification actuel
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('Erreur: Session expirée, veuillez vous reconnecter')
        return
      }
  
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // ← NOUVEAU: Token auth
        },
        body: JSON.stringify({
          return_url: window.location.origin + '/mon-compte'
          // Plus besoin de customer_id - l'API le récupère via le token
        })
      })
  
      const data = await response.json()
      
      if (response.ok) {
        window.location.href = data.url
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur réseau: ' + error.message)
    }
  }

  const handleDeleteAllConversations = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', user.id)
      
      if (error) throw error
      
      alert('✅ Toutes vos conversations ont été supprimées avec succès.')
      setShowDeleteModal(false)
      
      // Rafraîchir la sidebar de tous les assistants
      window.dispatchEvent(new Event('refreshSidebar'))
    } catch (error) {
      console.error('Erreur suppression conversations:', error)
      alert('❌ Erreur lors de la suppression. Veuillez réessayer ou contacter le support.')
    } finally {
      setLoading(false)
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
    const trialEnd = userProfile?.subscription_trial_end

    // Calculer les jours restants pour le trial
    const getDaysLeft = (endDate) => {
      if (!endDate) return null
      const now = new Date()
      const end = new Date(endDate)
      const diffTime = end - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    }

    const renderStatusBadge = () => {
      const isCancelled = userProfile?.subscription_cancel_at_period_end
      
      // Si annulation programmée, afficher badge + alerte
      if (isCancelled && (subscriptionStatus === 'trial' || subscriptionStatus === 'premium')) {
        const endDate = subscriptionStatus === 'trial' ? trialEnd : periodEnd
        const dateStr = endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'bientôt'
        
        return (
          <div className="space-y-2">
            {/* Badge normal selon le statut */}
            {subscriptionStatus === 'trial' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✨ Essai gratuit ({getDaysLeft(trialEnd)} jour{getDaysLeft(trialEnd) > 1 ? 's' : ''} restant{getDaysLeft(trialEnd) > 1 ? 's' : ''})
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#dbae61] bg-opacity-20 text-[#8b7355]">Premium Actif</span>
            )}
            
            {/* Alerte annulation */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200">
              <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span className="text-sm text-orange-800">
                Annulation programmée - Accès jusqu'au {dateStr}
              </span>
            </div>
          </div>
        )
      }
      
      // Sinon, affichage normal
      switch (subscriptionStatus) {
        case 'free':
          return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Gratuit</span>
        case 'trial':
          const daysLeft = getDaysLeft(trialEnd)
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✨ Essai gratuit ({daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''})
            </span>
          )
        case 'premium':
          return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#dbae61] bg-opacity-20 text-[#8b7355]">Premium Actif</span>
        case 'expired':
          return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Expiré</span>
        default:
          return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Inconnu</span>
      }
    }

    const renderStatusDetails = () => {
      switch (subscriptionStatus) {
        case 'free':
          const hasUsedTrial = userProfile?.has_used_trial
          return (
            <div>
              <p className="text-gray-600 mb-4">
                Vous utilisez actuellement la version gratuite avec accès à l'Assistant Invest Malin.
              </p>
              <Link 
                to="/upgrade" 
                className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                {hasUsedTrial ? 'Commerncer l\'abonnement' : 'Démarrer l\'essai gratuit 30 jours'}
              </Link>
            </div>
          )

          case 'trial':
            const daysLeft = getDaysLeft(trialEnd)
            const trialEndDate = trialEnd ? new Date(trialEnd).toLocaleDateString('fr-FR') : 'Non définie'
            const isCancelled = userProfile?.subscription_cancel_at_period_end
            
            return (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-1">🎉 Essai gratuit actif !</h4>
                  <p className="text-green-700 text-sm">
                    Profitez de tous les assistants premium jusqu'au <strong>{trialEndDate}</strong>
                  </p>
                  {!isCancelled && daysLeft <= 5 && (
                    <p className="text-green-600 text-xs mt-1">
                      💡 Votre abonnement sera automatiquement activé à 19,99€/mois
                    </p>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><strong>Fin de l'essai :</strong> {trialEndDate}</p>
                  {!isCancelled && <p><strong>Puis :</strong> 19,99€/mois</p>}
                  {isCancelled && <p><strong>Puis :</strong> Pas de renouvellement (annulation programmée)</p>}
                </div>
                <button
                  onClick={handleManageSubscription}
                  className="bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
                >
                  {isCancelled ? 'Réactiver mon abonnement' : 'Gérer mon abonnement'}
                </button>
              </div>
            )

        case 'premium':
          const premiumEndDate = periodEnd ? new Date(periodEnd).toLocaleDateString('fr-FR') : 'Non définie'
          
          return (
            <div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><strong>Statut :</strong> Abonnement actif</p>
                <p><strong>Prochaine facturation :</strong> {premiumEndDate}</p>
                <p><strong>Prix :</strong> 19,99€/mois</p>
              </div>
              <button
                onClick={handleManageSubscription}
                className="bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                {userProfile?.subscription_cancel_at_period_end ? 'Réactiver mon abonnement' : 'Gérer mon abonnement'}
              </button>
            </div>
          )

        case 'expired':
          return (
            <div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-1">Abonnement expiré</h4>
                <p className="text-red-700 text-sm">
                  Votre accès aux assistants premium a été suspendu.
                </p>
              </div>
              <Link 
                to="/upgrade" 
                className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                Réactiver Premium
              </Link>
            </div>
          )

        default:
          return (
            <div>
              <p className="text-gray-600 mb-4">
                État de l'abonnement non reconnu. Contactez le support.
              </p>
            </div>
          )
      }
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-[#dbae61]" />
          <h2 className="text-xl font-bold text-black">Abonnement</h2>
        </div>
        
        <div className="mb-4">
          {renderStatusBadge()}
        </div>

        {renderStatusDetails()}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Prénom</label>
                <p className="text-gray-900 font-medium">{userProfile?.prenom || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nom</label>
                <p className="text-gray-900 font-medium">{userProfile?.nom || 'Non renseigné'}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
              <p className="text-gray-900 font-medium">{user?.email || 'Chargement...'}</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mot de passe</label>
              <p className="text-gray-400 font-mono text-sm">••••••••••••</p>
            </div>
            
            <button 
              onClick={() => setShowEditModal(true)}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg transition-colors font-medium"
            >
              Modifier les informations
            </button>
          </div>
        </div>

        {/* Modal changement mot de passe */}
        <ChangePasswordModal 
          isOpen={showPasswordModal} 
          onClose={() => setShowPasswordModal(false)} 
        />

        {/* Modal édition profil */}
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
          onPasswordClick={() => {
            setShowEditModal(false)
            setShowPasswordModal(true)
          }}
          onPortalClick={handleManageSubscription}
        />

          {/* Section Abonnement dynamique */}
          {renderSubscriptionSection()}
        </div>

        {/* Accès rapide aux assistants - SECTION CORRIGÉE */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-[#dbae61]" />
            <h2 className="text-xl font-bold text-black">Accès rapide</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Assistant Invest Malin - Gratuit */}
            <Link 
              to="/assistant-invest-malin" 
              className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Assistant Invest Malin</h3>
                <p className="text-sm text-gray-600">Questions sur l'accompagnement Invest Malin</p>
                <p className="text-xs text-blue-600 font-medium mt-1">Gratuit • Disponible</p>
              </div>
            </Link>

            {/* Assistant Annonce - Premium */}
            {(userProfile?.subscription_status === 'premium' || userProfile?.subscription_status === 'trial') ? (
              <Link 
                to="/annonce" 
                className="flex items-center gap-4 p-6 bg-gradient-to-r from-[#dbae61]/10 to-[#c49a4f]/10 rounded-lg hover:from-[#dbae61]/20 hover:to-[#c49a4f]/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-[#dbae61] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Assistant Annonce</h3>
                  <p className="text-sm text-gray-600">Créez des annonces attractives</p>
                  <p className="text-xs text-[#dbae61] font-medium mt-1">Premium • Disponible</p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Assistant Annonce</h3>
                  <p className="text-sm text-gray-500">Créez des annonces attractives</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Nécessite Premium</p>
                </div>
              </div>
            )}

            {/* Assistant Juridique - Premium */}
            {(userProfile?.subscription_status === 'premium' || userProfile?.subscription_status === 'trial') ? (
              <Link 
                to="/juridique" 
                className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Assistant Juridique</h3>
                  <p className="text-sm text-gray-600">Conseils juridiques immobiliers</p>
                  <p className="text-xs text-green-600 font-medium mt-1">Premium • Disponible</p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Assistant Juridique</h3>
                  <p className="text-sm text-gray-500">Conseils juridiques immobiliers</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Nécessite Premium</p>
                </div>
              </div>
            )}

            {/* Assistant Négociateur - Premium */}
            {(userProfile?.subscription_status === 'premium' || userProfile?.subscription_status === 'trial') ? (
              <Link 
                to="/negociateur" 
                className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Assistant Négociateur</h3>
                  <p className="text-sm text-gray-600">Stratégies de négociation</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">Premium • Disponible</p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Assistant Négociateur</h3>
                  <p className="text-sm text-gray-500">Stratégies de négociation</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Nécessite Premium</p>
                </div>
              </div>
            )}
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
              <h3 className="font-semibold text-gray-900 mb-2">🤖 Limites</h3>
              <p className="text-sm text-gray-600">L'IA peut faire des erreurs, vérifiez toujours les informations importantes.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">⭐ Premium</h3>
              <p className="text-sm text-gray-600">Avec le plan Premium, accédez aux assistants spécialisés pour des conseils experts.</p>
            </div>
          </div>
        </div>

        {/* Section RGPD & Données */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#dbae61]" />
            <h2 className="text-xl font-bold text-black">Vos données et vie privée</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              Conformément au <strong>RGPD</strong> (Règlement Général sur la Protection des Données),
              vous disposez d’un droit d’accès, de rectification et de suppression de vos données personnelles.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">Conservation de vos conversations</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Vos conversations sont conservées pour améliorer nos services</li>
                <li>• Après 12 mois, elles sont anonymisées (suppression de votre identité)</li>
                <li>• Vous pouvez supprimer tout votre historique à tout moment ci-dessous</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Suppression en cours...' : 'Supprimer tout mon historique'}
              </button>

              <a
                href="https://www.cnil.fr/fr/reglement-europeen-protection-donnees"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                En savoir plus sur le RGPD →
              </a>
            </div>
          </div>
        </div>


        {/* Section FAQ */}
        <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm p-8 border border-gray-200">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-4">
              <HelpCircle className="w-12 h-12 text-[#dbae61] mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Une question ?
            </h3>
            <p className="text-gray-600 mb-6">
              Consultez notre foire aux questions pour trouver rapidement des réponses sur votre compte, les assistants IA, et bien plus encore.
            </p>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-6 py-3 rounded-lg border-2 border-gray-200 transition-colors"
            >
              Accéder à la FAQ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Modal suppression conversations */}
        <DeleteConversationsModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAllConversations}
          loading={loading}
        />
                
      </div>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 md:px-20 text-sm text-gray-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 Mon Équipe IA. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-gray-700">Accueil</Link>
            <Link to="/mentions-legales" className="hover:text-gray-700">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-gray-700">Confidentialité</Link>
            <Link to="/conditions-utilisation" className="hover:text-gray-700">Conditions d'utilisation</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}