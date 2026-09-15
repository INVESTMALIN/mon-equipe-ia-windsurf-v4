import { Link } from 'react-router-dom'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'

export default function EmailConfirmation() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 w-full max-w-2xl text-center">
        
        {/* Logo et branding */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-8"
            />
            <span className="text-xl font-bold text-black">MON ÉQUIPE IA</span>
          </div>
        </div>

        {/* Icône de succès avec effet */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="w-24 h-24 bg-[#dbae61] rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-black" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-[#dbae61]" />
          </div>
        </div>

        {/* Titre principal */}
        <h1 className="text-3xl font-bold text-black mb-4">
          E-mail confirmé ! 🎊
        </h1>

        {/* Sous-titre */}
        <p className="text-[#dbae61] font-semibold text-lg mb-6">
          Votre compte est maintenant activé
        </p>

        {/* Message principal */}
        <div className="bg-[#f8f8f8] rounded-lg p-6 mb-8">
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Parfait ! Votre adresse email a été <strong>vérifiée avec succès</strong>. 
            Vous pouvez maintenant accéder à l'ensemble de vos assistants IA.
          </p>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-[#dbae61]">
            <p className="text-sm text-gray-600">
              🚀 <strong>Prêt à commencer ?</strong> Connectez-vous pour découvrir 
              vos assistants spécialisés en fiscalité, juridique et négociation.
            </p>
          </div>
        </div>

        {/* Avantages débloqués */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">Vous avez maintenant accès à :</h3>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📚</span>
              </div>
              <span className="text-gray-700 font-medium">Assistant Invest Malin (gratuit)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">⚖️</span>
              </div>
              <span className="text-gray-700 font-medium">LegalBNB IA (premium)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">🖋️</span>
              </div>
              <span className="text-gray-700 font-medium">Annonce IA (premium)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm">💬</span>
              </div>
              <span className="text-gray-700 font-medium">Négociateur IA (premium)</span>
            </div>
          </div>
        </div>

        {/* Bouton principal */}
        <Link
          to="/connexion"
          className="inline-flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-black font-semibold py-3 px-8 rounded-lg transition-colors mb-6"
        >
          Accéder à mon espace
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Lien retour */}
        <div className="pt-4 border-t border-gray-200">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Besoin d'aide pour commencer ?{' '}
            <a href="mailto:contact@invest-malin.com" className="text-[#dbae61] hover:underline">
              Contactez notre support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}