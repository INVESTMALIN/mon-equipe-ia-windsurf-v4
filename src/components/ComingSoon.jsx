import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle, Scale, PenTool, MessageCircle, Rocket } from 'lucide-react'

export default function ComingSoon({ assistant }) {
  
  // Forcer le scroll en haut au chargement
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [assistant])
  
  // Configuration des assistants spécifiques
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
    annonce: {
      name: "ANNONCE IA",
      icon: PenTool,
      color: "#dbae61",
      image: "/images/annonce-ia.png",
      description: "L'IA qui rend la création d'annonces facile",
      features: [
        "Rédige des descriptions adaptées à votre bien",
        "Liste les équipements Airbnb/Booking", 
        "Optimise votre guide d'arrivée"
      ],
      comingSoon: "L'assistant Annonce IA arrive bientôt pour transformer la création de vos annonces immobilières."
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

  // Configuration générale (quand pas d'assistant spécifique)
  const generalConfig = {
    name: "Assistants Premium",
    icon: Rocket,
    color: "#dbae61",
    image: "/images/hero-image.png",
    description: "Votre équipe IA complète bientôt disponible",
    features: [
      "Fiscaliste IA - Expert fiscal personnalisé",
      "Annonce IA - Création d'annonces optimisées",
      "Négociateur IA - Coach en négociation avancée",
      "Support premium 24h/24",
      "Mises à jour automatiques et nouvelles fonctionnalités"
    ],
    comingSoon: "Nos assistants IA spécialisés sont actuellement en cours de développement. Le système de paiement sera bientôt disponible pour vous permettre d'accéder à toute la puissance de votre équipe IA."
  }

  // Choisir la configuration selon le contexte
  const config = assistant ? assistantConfig[assistant] : generalConfig
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
            to={assistant ? "/assistants" : "/upgrade"}
            className="flex items-center gap-2 text-white hover:text-[#dbae61] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Retour</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-20 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* En-tête avec icône */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: config.color }}>
              <IconComponent className="w-10 h-10 text-black" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-6">
              {config.name}
            </h1>
            
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8">
              {config.description}
            </p>

            {/* Badge Coming Soon */}
            <div className="inline-flex items-center gap-2 bg-[#dbae61] text-black px-6 py-3 rounded-full font-semibold mb-8">
              <Clock className="w-5 h-5" />
              Bientôt disponible
            </div>
          </div>

          {/* Description */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">
              {assistant ? `${config.name} qui vous attend` : "Votre équipe IA qui vous attend"}
            </h2>
            <p className="text-lg text-gray-600">
              {config.comingSoon}
            </p>
          </div>

          {/* Liste des fonctionnalités */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {config.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
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
              {assistant 
                ? "Nous peaufinons actuellement les derniers détails pour vous offrir une expérience exceptionnelle."
                : "Nos équipes finalisent le développement des assistants et l'intégration du système de paiement sécurisé."
              }
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
              to="/assistant-formation"
              className="bg-[#dbae61] hover:bg-[#c49a4f] text-black font-bold px-8 py-4 rounded-lg transition-colors"
            >
              Accéder à l'Assistant Formation
            </Link>
            
            <Link
              to="/assistants"
              className="border-2 border-white text-white hover:bg-white hover:text-black font-bold px-8 py-4 rounded-lg transition-colors"
            >
              Retour aux assistants
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}