import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle, Scale, Users, MessageCircle } from 'lucide-react'

export default function ComingSoon({ assistant }) {
  
  // Forcer le scroll en haut au chargement
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [assistant])
  
  // Configuration des assistants
  const assistantConfig = {
    fiscaliste: {
      name: "Fiscaliste IA",
      icon: Scale,
      color: "#dbae61",
      image: "/images/fiscaliste-ia.png",
      description: "Votre expert fiscal personnel, disponible 24h/24",
      features: [
        "Optimisation fiscale personnalisée",
        "Calculs d'impôts et de charges",
        "Conseils de défiscalisation immobilière",
        "Analyse de votre situation fiscale",
        "Réponses aux questions complexes"
      ],
      comingSoon: "L'assistant Fiscaliste IA arrive bientôt avec des fonctionnalités avancées pour vous accompagner dans toutes vos démarches fiscales."
    },
    legalbnb: {
      name: "LegalBNB IA",
      icon: Users,
      color: "#dbae61",
      image: "/images/legalbnb-ia.png",
      description: "Votre juriste IA spécialisé en location courte durée",
      features: [
        "Analyse de règlements de copropriété",
        "Vérification de conformité légale",
        "Conseils juridiques personnalisés",
        "Rédaction de documents types",
        "Mise à jour réglementaire automatique"
      ],
      comingSoon: "LegalBNB IA sera votre expert juridique pour naviguer sereinement dans le monde de la location courte durée."
    },
    negociateur: {
      name: "Négociateur IA",
      icon: MessageCircle,
      color: "#dbae61",
      image: "/images/negociateur-ia.png",
      description: "Votre coach en négociation pour maximiser vos résultats",
      features: [
        "Analyse psychologique de vos interlocuteurs",
        "Stratégies de négociation personnalisées",
        "Scripts de conversation optimisés",
        "Résumé automatique de vos appels",
        "Coaching en temps réel"
      ],
      comingSoon: "Le Négociateur IA révolutionnera vos négociations grâce à l'intelligence artificielle et l'analyse comportementale."
    }
  }

  const config = assistantConfig[assistant] || assistantConfig.fiscaliste
  const IconComponent = config.icon

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
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
            <span className="hidden md:inline">Retour au dashboard</span>
            <span className="md:hidden">Retour</span>
          </Link>
        </div>
      </header>

      {/* Hero Section compacte */}
      <section className="relative py-12 overflow-hidden">
        {/* Background avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        
        {/* Contenu */}
        <div className="relative z-10 px-6 md:px-20">
          <div className="max-w-6xl mx-auto text-center">
            
            {/* Status badge centré */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-[#dbae61]/20 border border-[#dbae61]/30 rounded-full px-6 py-3">
                <Clock className="w-5 h-5 text-[#dbae61]" />
                <span className="text-[#dbae61] font-semibold">Bientôt disponible</span>
              </div>
            </div>

            {/* Titre principal */}
            <div className="text-white">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-4 bg-[#dbae61] rounded-2xl">
                  <IconComponent className="w-12 h-12 text-black" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  {config.name}
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {config.description}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-20">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Ce qui vous attend
            </h2>
            <p className="text-lg text-gray-600">
              {config.comingSoon}
            </p>
          </div>

          {/* Liste des fonctionnalités */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {config.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-[#dbae61] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-800 font-medium">
                    {feature}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline estimée */}
          <div className="bg-gradient-to-r from-[#dbae61]/10 to-[#c49a4f]/10 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-[#dbae61]" />
              <h3 className="text-xl font-bold text-black">
                Disponibilité estimée
              </h3>
            </div>
            <p className="text-2xl font-bold text-[#dbae61] mb-2">
              Février 2025
            </p>
            <p className="text-gray-600">
              Nous peaufinons actuellement les derniers détails pour vous offrir une expérience exceptionnelle.
            </p>
          </div>

        </div>
      </section>

      {/* Section CTA */}
      <section className="bg-black text-white py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-20 text-center">
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            En attendant, continuez avec l'Assistant Formation
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Notre Assistant Formation est déjà disponible et prêt à répondre à toutes vos questions 
            sur la formation Invest Malin.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/mon-compte/assistant-formation-v3"
              className="inline-flex items-center bg-[#dbae61] hover:bg-[#c49a4f] text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Assistant Formation
              <span className="ml-2">→</span>
            </Link>
            
            <Link
              to="/mon-compte-v2"
              className="inline-flex items-center bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold px-8 py-4 rounded-xl transition-all duration-300"
            >
              Retour au dashboard
            </Link>
          </div>
          
        </div>
      </section>

      {/* Footer simple */}
      <footer className="bg-gray-900 text-white px-6 md:px-20 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-6"
            />
            <span className="text-lg font-bold">MON ÉQUIPE IA</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Mon Équipe IA - Invest Malin. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}