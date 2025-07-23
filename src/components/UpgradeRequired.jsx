import { Link } from 'react-router-dom'
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react'

export default function UpgradeRequired() {
  // TODO: Récupérer user.id pour l'ajouter au Payment Link
  // const { user } = useAuth() // À implémenter selon votre système auth

  const handleUpgrade = () => {
    // TODO: Remplacer par le vrai Payment Link Stripe
    const stripePaymentLink = `https://buy.stripe.com/VOTRE_PAYMENT_LINK?client_reference_id=USER_ID`
    window.location.href = stripePaymentLink
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
            to="/mon-compte-v2" 
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

            {/* CTA Button */}
            <button
              onClick={handleUpgrade}
              className="w-full bg-[#dbae61] hover:bg-[#c49a4f] text-black font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300 hover:scale-105 transform"
            >
              Souscrire au Plan Premium
            </button>
            
            {/* Small print */}
            <p className="text-center text-gray-500 text-sm mt-4">
              Paiement sécurisé par Stripe • Résiliation possible à tout moment
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