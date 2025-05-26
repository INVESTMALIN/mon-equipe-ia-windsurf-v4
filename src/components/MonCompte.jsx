export default function MonCompte() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">
            Bienvenue dans Mon Équipe IA
          </h1>
          <p className="text-gray-700 max-w-xl mx-auto">
            Mon Équipe IA est une collection d'agents spécialisés conçus pour répondre à toutes vos questions de gestion locative, fiscale, juridique ou formation. Des réponses immédiates, disponibles 24h/24, sans prise de tête.
          </p>
        </div>

        {/* Assistant Formation */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            🔮 Assistant Formation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">
                Assistant Formation n8n
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Votre copilote pendant la formation Invest Malin
              </p>
              <p className="text-sm text-gray-700">
                Accès, vidéos, modules, fiches pratiques... Obtenez des réponses immédiates à toutes vos questions sur la formation.
              </p>
              <ul className="text-sm text-gray-500 mt-3 list-disc pl-5">
                <li>Formation</li>
                <li>Réponses instantanées</li>
              </ul>
              <a href="#" className="text-orange-600 text-sm font-medium mt-4 inline-block">
                Accéder à l'assistant n8n →
              </a>
            </div>
            <div className="bg-white shadow border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">
                Assistant Formation Voiceflow
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Votre copilote pendant la formation Invest Malin
              </p>
              <p className="text-sm text-gray-700">
                Accès, vidéos, modules, fiches pratiques... Obtenez des réponses immédiates à toutes vos questions sur la formation.
              </p>
              <ul className="text-sm text-gray-500 mt-3 list-disc pl-5">
                <li>Formation</li>
                <li>Réponses instantanées</li>
              </ul>
              <a href="#" className="text-orange-600 text-sm font-medium mt-4 inline-block">
                Accéder à l'assistant Voiceflow →
              </a>
            </div>
          </div>
        </section>

        {/* Assistants spécialisés */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
            🔐 Choisissez votre assistant IA spécialisé !
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
            Découvrez nos agents IA les plus demandés, conçus pour accompagner les conciergeries sur tous les sujets clés.
            Chaque assistant est spécialisé pour répondre à un besoin précis de nos concierges.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white shadow border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Fiscaliste IA</h3>
              <p className="text-sm text-gray-600 mb-2">
                Simplifiez vos démarches fiscales
              </p>
              <p className="text-sm text-gray-700">
                Posez vos questions de fiscalité courte ou longue durée (TVA, LMNP, etc.) en langage simple.
              </p>
              <ul className="text-sm text-gray-500 mt-3 list-disc pl-5">
                <li>Fiscalité</li>
                <li>Gain de temps</li>
              </ul>
              <a href="#" className="text-orange-600 text-sm font-medium mt-4 inline-block">
                Accéder à l'assistant →
              </a>
            </div>
            <div className="bg-white shadow border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">LegalBNB</h3>
              <p className="text-sm text-gray-600 mb-2">
                L’IA qui vous répond comme un juriste
              </p>
              <p className="text-sm text-gray-700">
                Recevez des infos juridiques fiables adaptées aux conciergeries Airbnb.
              </p>
              <ul className="text-sm text-gray-500 mt-3 list-disc pl-5">
                <li>Juridique</li>
                <li>Infos pratiques</li>
              </ul>
              <a href="#" className="text-orange-600 text-sm font-medium mt-4 inline-block">
                Accéder à l'assistant →
              </a>
            </div>
            <div className="bg-white shadow border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Résumé d’appel</h3>
              <p className="text-sm text-gray-600 mb-2">
                Ne perdez plus une info client.
              </p>
              <p className="text-sm text-gray-700">
                L’IA résume vos appels clients et génère des suivis et actions recommandées.
              </p>
              <ul className="text-sm text-gray-500 mt-3 list-disc pl-5">
                <li>Suivi client</li>
                <li>Synthèse rapide</li>
              </ul>
              <a href="#" className="text-orange-600 text-sm font-medium mt-4 inline-block">
                Accéder à l'assistant →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


  