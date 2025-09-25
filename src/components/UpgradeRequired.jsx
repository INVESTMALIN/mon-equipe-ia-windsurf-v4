import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function UpgradeRequired() {
  const [loading, setLoading] = useState(false)

  // Scroll vers le haut au chargement de la page
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleStartTrial = async () => {
    setLoading(true)

    try {
      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('Erreur: Session expirée, veuillez vous reconnecter')
        setLoading(false)
        return
      }

      // Appeler l'API de création de checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        // Rediriger vers Stripe Checkout
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
      {/* Header simple */}
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

      {/* Contenu principal */}
      <main className="flex-1 px-6 md:px-20 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-[#dbae61] rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-black" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Essai Gratuit de 30 Jours
            </h1>
            
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8">
              Débloquez l'accès aux assistants IA spécialisés et révolutionnez 
              la gestion de votre conciergerie avec nos experts virtuels.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 max-w-lg mx-auto">
              <p className="text-green-800 font-semibold">
                🎉 Essai gratuit pendant 30 jours !
              </p>
              <p className="text-green-600 text-sm mt-1">
                Puis 19,99€/mois - Résiliable à tout moment
              </p>
            </div>
          </div>

          {/* Plan Premium */}
          <div className="bg-white rounded-2xl shadow-xl border-4 border-[#dbae61] p-8 mb-12 relative overflow-hidden">
            {/* Badge Premium */}
            <div className="absolute -top-3 -right-3 bg-[#dbae61] text-black px-6 py-2 rounded-bl-lg font-bold text-sm transform rotate-3">
              PREMIUM
            </div>
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">Plan Premium</h2>
              <div className="text-4xl font-bold text-[#dbae61] mb-2">
                <span className="line-through text-2xl text-gray-400 mr-2">19,99€</span>
                GRATUIT
              </div>
              <p className="text-gray-600">30 premiers jours, puis 19,99€/mois</p>
            </div>

            {/* Fonctionnalités */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Assistant Fiscal</h4>
                    <p className="text-sm text-gray-600">Optimisation fiscale et déclarations</p>
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

            {/* CTA Button fonctionnel */}
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
                "Démarrer mon essai gratuit de 30 jours"
              )}
            </button>
            
            {/* Small print */}
            <p className="text-center text-gray-500 text-sm mt-4">
              Aucun engagement • Résiliation possible à tout moment • Sécurisé par Stripe
            </p>
          </div>

          {/* FAQ rapide */}
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