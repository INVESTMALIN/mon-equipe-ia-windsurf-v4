import { Link } from 'react-router-dom'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'

export default function AccountCreated() {
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

        {/* Icône de succès */}
        <div className="w-20 h-20 bg-[#dbae61] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-black" />
        </div>

        {/* Titre principal */}
        <h1 className="text-3xl font-bold text-black mb-4">
          Compte créé avec succès ! 🎉
        </h1>

        {/* Sous-titre */}
        <p className="text-[#dbae61] font-semibold text-lg mb-6">
          Bienvenue dans Mon Équipe IA
        </p>

        {/* Message principal */}
        <div className="bg-[#f8f8f8] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-[#dbae61]" />
            <h3 className="text-lg font-semibold text-black">Email de confirmation envoyé</h3>
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            Un email de confirmation vous a été envoyé à votre adresse. 
            <strong> Vérifiez votre boîte mail</strong> (et vos spams) pour activer votre compte.
          </p>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-[#dbae61]">
            <p className="text-sm text-gray-600">
              💡 <strong>Conseil :</strong> Si vous ne recevez pas l'email dans les 5 minutes, 
              vérifiez votre dossier spam ou tentez de vous reconnecter.
            </p>
          </div>
        </div>

        {/* Étapes suivantes */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">Prochaines étapes :</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#dbae61] rounded-full flex items-center justify-center text-black text-sm font-bold">1</div>
              <span className="text-gray-700">Confirmez votre email en cliquant sur le lien reçu</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#dbae61] rounded-full flex items-center justify-center text-black text-sm font-bold">2</div>
              <span className="text-gray-700">Connectez-vous à votre espace personnel</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#dbae61] rounded-full flex items-center justify-center text-black text-sm font-bold">3</div>
              <span className="text-gray-700">Découvrez vos assistants IA spécialisés</span>
            </div>
          </div>
        </div>

        {/* Bouton principal */}
        <Link
          to="/connexion"
          className="inline-flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-black font-semibold py-3 px-8 rounded-lg transition-colors mb-6"
        >
          Se connecter maintenant
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
            Besoin d'aide ? Contactez-nous à{' '}
            <a href="mailto:support@invest-malin.fr" className="text-[#dbae61] hover:underline">
              support@invest-malin.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}