import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function FAQ() {
  const [openItems, setOpenItems] = useState(new Set())

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  const faqItems = [
    {
      question: "Qu'est-ce que Mon Équipe IA ?",
      answer: "Mon Équipe IA est une plateforme qui met à votre disposition des assistants d'intelligence artificielle spécialisés pour optimiser la gestion de votre conciergerie. Nos assistants vous aident dans les domaines de la formation, de la fiscalité, du juridique et de la négociation."
    },
    {
      question: "Comment fonctionne l'Assistant Formation ?",
      answer: "L'Assistant Formation, aussi appelé Coach Malin, répond à toutes vos questions liées à la formation Invest Malin 24h/24 et 7j/7. Il a accès à l'ensemble du contenu de formation et peut vous guider à chaque étape de votre apprentissage."
    },
    {
      question: "Quels sont les différents assistants disponibles ?",
      answer: "Nous proposons 4 assistants spécialisés : l'Assistant Formation pour vos questions pédagogiques, l'Assistant Négociateur pour analyser vos appels commerciaux, l'Assistant Fiscaliste pour les questions de LMNP et TVA, et l'Assistant LegalBNB pour les aspects juridiques et réglementaires."
    },
    {
      question: "Les assistants IA remplacent-ils un expert humain ?",
      answer: "Non, nos assistants IA sont conçus pour vous accompagner et vous faire gagner du temps, mais ils ne remplacent pas l'expertise humaine. Pour des cas complexes ou spécifiques, nous recommandons toujours de consulter un professionnel qualifié."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, la sécurité de vos données est notre priorité. Toutes les informations sont chiffrées et stockées sur des serveurs sécurisés en Europe. Nous respectons strictement le RGPD et ne partageons jamais vos données avec des tiers."
    },
    {
      question: "Comment puis-je accéder aux assistants ?",
      answer: "Après avoir créé votre compte, vous accédez à votre tableau de bord personnel où vous pouvez choisir l'assistant adapté à vos besoins. Chaque assistant dispose de sa propre interface de chat pour une expérience optimale."
    },
    {
      question: "Y a-t-il une limite d'utilisation ?",
      answer: "L'utilisation des assistants dépend de votre abonnement. Les détails des limites et fonctionnalités sont précisés dans votre espace personnel. Contactez-nous si vous avez des besoins spécifiques."
    },
    {
      question: "Comment contacter le support ?",
      answer: "Vous pouvez nous contacter via l'adresse email support@invest-malin.fr. Nous nous engageons à répondre dans les 24h ouvrées. Pour les questions urgentes, utilisez d'abord nos assistants IA qui sont disponibles instantanément."
    }
  ]

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 md:px-20 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-8"
            />
            <span className="text-xl font-bold text-black">MON ÉQUIPE IA</span>
          </Link>
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="px-6 md:px-20 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-black mb-4">
              Questions fréquentes
            </h1>
            <p className="text-xl text-gray-600">
              Trouvez rapidement les réponses à vos questions sur Mon Équipe IA
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-black pr-4">
                    {item.question}
                  </h3>
                  {openItems.has(index) ? (
                    <ChevronUp className="text-[#dbae61] w-5 h-5 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="text-[#dbae61] w-5 h-5 flex-shrink-0" />
                  )}
                </button>
                {openItems.has(index) && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 text-center bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-black mb-4">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-gray-600 mb-6">
              Notre équipe est là pour vous aider. Contactez-nous directement.
            </p>
            <a
              href="mailto:support@invest-malin.fr"
              className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}