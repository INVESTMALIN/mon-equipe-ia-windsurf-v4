import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function UpgradeRequired() {
  const [loading, setLoading] = useState(false)
  const [hasUsedTrial, setHasUsedTrial] = useState(false) // 🔥 NOUVEAU

  // 🔥 NOUVEAU : Récupérer has_used_trial au chargement
  useEffect(() => {
    window.scrollTo(0, 0)
    
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('has_used_trial')
          .eq('id', user.id)
          .single()
        
        setHasUsedTrial(profile?.has_used_trial || false)
      }
    }
    fetchUserProfile()
  }, [])

  const handleStartTrial = async () => {
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('Erreur: Session expirée, veuillez vous reconnecter')
        setLoading(false)
        return
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        window.location.href = data.url
      } else {
        alert('Erreur: ' + data.error)
        setLoading(false)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur réseau: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <header className="bg-black text-white px-6 md:px-20 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-8"
            />
            <span className="text-lg font-bold">MON ÉQUIPE IA</span>
          </div>
          
          <Link 
            to="/assistants" 
            className="flex items-center gap-2 text-white hover:text-[#dbae61] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Retour</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-20 py-16">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-[#dbae61] rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-black" />
            </div>
            
            {/* 🔥 MODIFIÉ : Titre conditionnel */}
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-6">
              {hasUsedTrial ? 'Abonnement Premium' : 'Essai Gratuit de 30 Jours'}
            </h1>
            
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8">
              Débloquez l'accès aux assistants IA spécialisés et révolutionnez 
              la gestion de votre conciergerie avec nos experts virtuels.
            </p>

            {/* 🔥 MODIFIÉ : Badge conditionnel */}
            {!hasUsedTrial ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 max-w-lg mx-auto">
                <p className="text-green-800 font-semibold">
                  🎉 Essai gratuit pendant 30 jours !
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Puis 19,99€/mois - Résiliable à tout moment
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-lg mx-auto">
                <p className="text-blue-800 font-semibold">
                  💎 Abonnement Premium
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  19,99€/mois - Résiliable à tout moment
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 text-blue-700 text-sm bg-blue-100 rounded-md px-3 py-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <span>Vous avez déjà bénéficié de l'essai gratuit</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-4 border-[#dbae61] p-8 mb-12 relative overflow-hidden">
            <div className="absolute -top-3 -right-3 bg-[#dbae61] text-black px-6 py-2 rounded-bl-lg font-bold text-sm transform rotate-3">
              PREMIUM
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">Plan Premium</h2>
              
              {/* 🔥 MODIFIÉ : Prix conditionnel */}
              {!hasUsedTrial ? (
                <>
                  <div className="text-4xl font-bold text-[#dbae61] mb-2">
                    <span className="line-through text-2xl text-gray-400 mr-2">19,99€</span>
                    GRATUIT
                  </div>
                  <p className="text-gray-600">30 premiers jours, puis 19,99€/mois</p>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-[#dbae61] mb-2">
                    19,99€
                  </div>
                  <p className="text-gray-600">par mois - Résiliable à tout moment</p>
                </>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Assistant Annonce</h4>
                    <p className="text-sm text-gray-600">Facilite la création d'annonces</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Assistant Juridique</h4>
                    <p className="text-sm text-gray-600">Conseils légaux et réglementations</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Assistant Négociateur</h4>
                    <p className="text-sm text-gray-600">Stratégies de négociation avancées</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Accès illimité</h4>
                    <p className="text-sm text-gray-600">Conversations sans limite</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Historique complet</h4>
                    <p className="text-sm text-gray-600">Toutes vos conversations sauvegardées</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Support prioritaire</h4>
                    <p className="text-sm text-gray-600">Assistance dédiée maintenue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Texte bouton conditionnel */}
            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="w-full bg-[#dbae61] hover:bg-[#c49a4f] disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 ease-in-out hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                  Redirection vers Stripe...
                </span>
              ) : (
                hasUsedTrial ? "S'abonner maintenant" : "Démarrer mon essai gratuit de 30 jours"
              )}
            </button>
            
            <p className="text-center text-gray-500 text-sm mt-4">
              Aucun engagement • Résiliation possible à tout moment • Sécurisé par Stripe
            </p>
          </div>

          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong>Des questions ?</strong> Contactez notre support ou consultez notre 
              <Link to="/faq" className="text-[#dbae61] hover:underline ml-1">FAQ</Link>
            </p>
            <p className="text-sm">
              Vous conservez l'accès à l'Assistant Formation gratuitement, même sans abonnement.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}