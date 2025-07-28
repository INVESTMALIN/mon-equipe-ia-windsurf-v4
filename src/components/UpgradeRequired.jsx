import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react'

export default function UpgradeRequired() {
  // Scroll vers le haut au chargement de la page
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
              Accès Premium Requis
            </h1>
            
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Débloquez l'accès aux assistants IA spécialisés et révolutionnez 
              la gestion de votre conciergerie avec nos experts virtuels.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 max-w-2xl mx-auto mb-8">
            
            {/* Header pricing */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">Plan Premium</h2>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-[#dbae61]">4,90€</span>
                <span className="text-gray-600">/mois</span>
              </div>
              <p className="text-gray-600 mt-2">Accès illimité aux assistants spécialisés</p>
            </div>

            {/* Features list */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-[#dbae61] flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-black">Fiscaliste IA</h3>
                  <p className="text-gray-600 text-sm">Expert en fiscalité immobilière et optimisation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-[#dbae61] flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-black">LegalBNB</h3>
                  <p className="text-gray-600 text-sm">Spécialiste juridique location courte durée</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-[#dbae61] flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-black">Négociateur IA</h3>
                  <p className="text-gray-600 text-sm">Assistant pour vos négociations immobilières</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-[#dbae61] flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-black">Assistant Formation</h3>
                  <p className="text-gray-600 text-sm">Toujours inclus - Accès illimité maintenu</p>
                </div>
              </div>
            </div>

            {/* CTA Button - Redirection vers ComingSoon */}
            <Link
              to="/coming-soon"
              className="block w-full bg-[#dbae61] hover:bg-[#c49a4f] text-black font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300 hover:scale-105 transform text-center"
            >
              Découvrir le Plan Premium
            </Link>
            
            {/* Small print */}
            <p className="text-center text-gray-500 text-sm mt-4">
              Assistants en cours de développement • Paiement bientôt disponible
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