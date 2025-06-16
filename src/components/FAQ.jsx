import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageCircle, Users, FileText, Bot } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FAQ() {
  const [openItems, setOpenItems] = useState({})

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const faqCategories = [
    {
      title: "Général",
      icon: <MessageCircle className="w-5 h-5" style={{ color: '#dbae61' }} />,
      items: [
        {
          id: "general-1",
          question: "Qu'est-ce que Mon Équipe IA ?",
          answer: "Mon Équipe IA est une plateforme qui met à votre disposition des assistants IA spécialisés pour vous accompagner dans votre activité de conciergerie. Chaque assistant est conçu pour répondre à des besoins spécifiques : formation, fiscalité, juridique, etc."
        },
        {
          id: "general-2",
          question: "Comment fonctionne l'assistant IA ?",
          answer: "Nos assistants IA utilisent des technologies avancées de traitement du langage naturel. Ils sont entraînés sur des données spécifiques à votre domaine d'activité pour vous fournir des réponses précises et pertinentes 24h/24."
        },
        {
          id: "general-3",
          question: "Mes données sont-elles sécurisées ?",
          answer: "Absolument. Toutes vos données sont hébergées en Europe et chiffrées. Nous respectons le RGPD et ne partageons jamais vos informations avec des tiers."
        }
      ]
    },
    {
      title: "Assistants IA",
      icon: <Bot className="w-5 h-5" style={{ color: '#dbae61' }} />,
      items: [
        {
          id: "assistants-1",
          question: "Quels assistants sont disponibles ?",
          answer: "Nous proposons plusieurs assistants spécialisés : Assistant Formation (pour la formation Invest Malin), Fiscaliste IA (questions fiscales), LegalBNB (questions juridiques), et Négociateur IA (aide à la négociation)."
        },
        {
          id: "assistants-2",
          question: "L'Assistant Formation est-il gratuit ?",
          answer: "Oui, l'Assistant Formation est accessible gratuitement à tous les clients de la formation Invest Malin. Il vous accompagne pendant et après votre formation."
        },
        {
          id: "assistants-3",
          question: "Comment accéder aux assistants spécialisés ?",
          answer: "Les assistants spécialisés (Fiscaliste IA, LegalBNB, Négociateur IA) sont disponibles avec l'abonnement Pro. Après connexion, vous pouvez y accéder directement depuis votre tableau de bord."
        }
      ]
    },
    {
      title: "Compte et Abonnement",
      icon: <Users className="w-5 h-5" style={{ color: '#dbae61' }} />,
      items: [
        {
          id: "compte-1",
          question: "Comment créer mon compte ?",
          answer: "Cliquez sur 'Créer mon espace' depuis la page d'accueil, puis renseignez vos informations. Vous recevrez un email de confirmation pour activer votre compte."
        },
        {
          id: "compte-2",
          question: "J'ai oublié mon mot de passe, que faire ?",
          answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié' et saisissez votre email. Vous recevrez un lien pour créer un nouveau mot de passe."
        },
        {
          id: "compte-3",
          question: "Puis-je modifier mes informations personnelles ?",
          answer: "Oui, une fois connecté, rendez-vous dans votre espace 'Mon Compte' pour modifier vos informations personnelles et paramètres de compte."
        }
      ]
    },
    {
      title: "Support Technique",
      icon: <FileText className="w-5 h-5" style={{ color: '#dbae61' }} />,
      items: [
        {
          id: "support-1",
          question: "L'assistant ne répond pas, que faire ?",
          answer: "Vérifiez votre connexion internet et actualisez la page. Si le problème persiste, contactez notre support technique via la page contact."
        },
        {
          id: "support-2",
          question: "Comment signaler un bug ?",
          answer: "Vous pouvez nous signaler tout problème technique via notre page de contact en décrivant précisément le problème rencontré."
        },
        {
          id: "support-3",
          question: "L'historique de mes conversations est-il sauvegardé ?",
          answer: "Oui, toutes vos conversations avec les assistants IA sont automatiquement sauvegardées dans votre compte et accessibles depuis la barre latérale."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f8' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 md:px-20 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold" style={{ color: '#dbae61' }}>
            <Bot size={24} style={{ color: '#dbae61' }} />
            Mon Équipe IA
          </Link>
          <nav className="flex gap-4 text-base font-medium">
            <Link
              to="/"
              className="px-4 py-2 border rounded-md transition hover:bg-gray-100"
              style={{ borderColor: '#dbae61', color: '#000' }}
            >
              Accueil
            </Link>
            <Link
              to="/connexion"
              className="text-white px-4 py-2 rounded-md transition hover:opacity-90"
              style={{ backgroundColor: '#dbae61' }}
            >
              Se connecter
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-20 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Questions Fréquentes
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Trouvez rapidement les réponses à vos questions sur Mon Équipe IA, nos assistants et notre plateforme.
        </p>
      </section>

      {/* FAQ Content */}
      <section className="px-6 md:px-20 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-100" style={{ backgroundColor: '#fefaf4' }}>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  {category.icon}
                  {category.title}
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {category.items.map((item) => (
                  <div key={item.id} className="p-6">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="flex justify-between items-center w-full text-left p-4 rounded-lg transition hover:bg-[#fef2e4]"
                      style={{ backgroundColor: 'white' }}
                    >
                      <h3 className="text-lg font-semibold text-gray-800 pr-4">
                        {item.question}
                      </h3>
                      {openItems[item.id] ? (
                        <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: '#dbae61' }} />
                      ) : (
                        <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: '#dbae61' }} />
                      )}
                    </button>

                    {openItems[item.id] && (
                      <div className="mt-4 text-gray-600 leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-20 py-16 bg-white text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Vous ne trouvez pas la réponse à votre question ?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Notre équipe support est là pour vous aider. N'hésitez pas à nous contacter.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/contact"
            className="text-white font-semibold px-6 py-3 rounded-md transition hover:opacity-90"
            style={{ backgroundColor: '#dbae61' }}
          >
            Nous contacter
          </Link>
          <Link
            to="/"
            className="font-semibold px-6 py-3 rounded-md transition hover:bg-gray-100 border"
            style={{ borderColor: '#dbae61', color: '#000' }}
          >
            Retour à l'accueil
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 md:px-20 text-sm text-gray-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 Mon Équipe IA. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link to="/mentions-legales" className="hover:text-gray-700">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-gray-700">Confidentialité</Link>
            <Link to="/conditions-utilisation" className="hover:text-gray-700">Conditions d'utilisation</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
