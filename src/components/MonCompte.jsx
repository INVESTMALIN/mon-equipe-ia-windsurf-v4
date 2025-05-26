import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, Scale, FileText } from 'lucide-react'

export default function MonCompte() {
  return (
    <div className="space-y-16">
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <GraduationCap className="text-orange-500 w-6 h-6" />
          Assistant Formation
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">Assistant Formation</h3>
            <p className="mb-4 text-gray-700">Votre copilote pendant la formation Invest Malin</p>
            <p className="mb-4 text-gray-600">
              Accès, vidéos, modules, fiches pratiques... Obtenez des réponses immédiates à toutes vos questions sur la formation.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Formation</li>
              <li>• Réponses instantanées</li>
            </ul>
            <Link to="/mon-compte/assistant-formation" className="text-orange-600 hover:underline font-medium">
              Accéder à l'assistant →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="text-orange-500 w-6 h-6" />
          Choisissez votre assistant IA spécialisé !
        </h2>
        <p className="text-gray-700 mb-4">
          Découvrez nos agents IA les plus demandés, conçus pour accompagner les conciergeries sur tous les sujets clés.
          Chaque assistant est spécialisé pour répondre à un besoin précis de nos concierges.
          Disponible avec l’abonnement Pro.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="text-orange-500 w-5 h-5" />
              <h3 className="text-lg font-semibold">Fiscaliste IA</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">Simplifiez vos démarches fiscales</p>
            <ul className="text-sm text-gray-600 mb-4">
              <li>• TVA sur Booking, LMNP, résidence principale…</li>
              <li>• Posez vos questions de fiscalité courte durée et l’IA vous éclaire, sans jargon.</li>
              <li>• Des réponses rapides, adaptées à votre situation.</li>
            </ul>
            <Link to="#" className="text-orange-600 hover:underline font-medium">
              Accéder à l’assistant →
            </Link>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="text-orange-500 w-5 h-5" />
              <h3 className="text-lg font-semibold">LegalBNB</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">L’IA qui vous répond comme un juriste</p>
            <ul className="text-sm text-gray-600 mb-4">
              <li>• Règlements de copropriété, sous-location, contrat de gestion…</li>
              <li>• Recevez des infos juridiques fiables adaptées aux conciergeries Airbnb.</li>
            </ul>
            <Link to="#" className="text-orange-600 hover:underline font-medium">
              Accéder à l’assistant →
            </Link>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-orange-500 w-5 h-5" />
              <h3 className="text-lg font-semibold">Résumé d’appel</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">Ne perdez plus une info client.</p>
            <ul className="text-sm text-gray-600 mb-4">
              <li>• L’IA résume vos appels en 10 secondes.</li>
              <li>• Suivi clair, structuré et actionnable (besoins, objections, prochaines étapes…)</li>
              <li>• Gain de rigueur et en temps.</li>
            </ul>
            <Link to="#" className="text-orange-600 hover:underline font-medium">
              Accéder à l’assistant →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
