import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageCircle, Users, FileText, Bot, Shield, AlertTriangle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function FAQ() {
  const navigate = useNavigate()
  const [openItems, setOpenItems] = useState({})

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const faqCategories = [
    {
      title: "Avertissement légal",
      icon: <FileText className="w-5 h-5" style={{ color: '#dbae61' }} />,
      items: [
        {
          id: "disclaimer-1",
          question: "Limites de responsabilité de l’IA",
          answer: "Nos assistants IA utilisent des modèles avancés d’intelligence artificielle, mais peuvent commettre des erreurs ou fournir des réponses approximatives. Les informations proposées doivent toujours être vérifiées avant toute décision importante."
        },
        {
          id: "disclaimer-2",
          question: "Conseils juridiques, fiscaux ou professionnels",
          answer: "Les réponses fournies par les assistants IA ne constituent pas des conseils juridiques, fiscaux ou comptables. Elles sont données à titre informatif et général. Pour toute décision engageant votre responsabilité, veuillez consulter un professionnel qualifié."
        }
      ]
    },
    {
      title: "Confidentialité & RGPD",
      icon: <Shield className="w-5 h-5" style={{ color: '#dbae61' }} />,
      items: [
        {
          id: "rgpd-1",
          question: "Comment mes données sont-elles protégées ?",
          answer: "Toutes les données sont hébergées dans l’Union Européenne et chiffrées. Nous appliquons les recommandations de la CNIL et respectons le Règlement Général sur la Protection des Données (RGPD)."
        },
        {
          id: "rgpd-2",
          question: "Combien de temps mes conversations sont-elles conservées ?",
          answer: "Vos conversations sont conservées pendant 6 mois pour votre confort d’usage. Après 12 mois, elles sont automatiquement anonymisées et ne permettent plus de vous identifier."
        },
        {
          id: "rgpd-3",
          question: "Puis-je supprimer mon historique ?",
          answer: "Oui, vous pouvez supprimer tout votre historique depuis la section 'Mon Compte'. Cette action est immédiate et irréversible."
        },
        {
          id: "rgpd-4",
          question: "Quels sont mes droits RGPD ?",
          answer: "Vous disposez d’un droit d’accès, de rectification, de portabilité et de suppression de vos données. Pour toute demande, vous pouvez contacter notre délégué à la protection des données (DPO) à l’adresse : contact@mon-equipe-ia.com."
        }
      ]
    },
    {
      title: "Mentions légales & Réglementation",
      icon: <FileText className="w-5 h-5" style={{ color: '#dbae61' }} />,
      items: [
        {
          id: "legal-1",
          question: "Où consulter les CGU/CGV ?",
          answer: "Les Conditions Générales d’Utilisation et de Vente sont accessibles à tout moment depuis le pied de page du site ou via la page 'Mentions légales'."
        },
        {
          id: "legal-2",
          question: "Quelle est votre politique de confidentialité ?",
          answer: "Notre politique détaille la collecte, l’usage et la durée de conservation de vos données. Vous pouvez la consulter sur la page 'Politique de confidentialité'."
        },
        {
          id: "legal-3",
          question: "Êtes-vous conforme au RGPD ?",
          answer: "Oui. Mon Équipe IA applique strictement les obligations légales du RGPD et suit les recommandations de la CNIL. Nous nous engageons à la transparence et à la sécurité de vos données."
        },
        {
          id: "legal-4",
          question: "Comment contacter le DPO ?",
          answer: "Pour toute question relative à vos données personnelles, vous pouvez écrire à notre DPO à l’adresse : dpo@mon-equipe-ia.com."
        }
      ]
    },
    {
      title: "Compte et Abonnement",
      icon: <Users className="w-5 h-5" style={{ color: '#dbae61' }} />,
      items: [
        {
          id: "compte-1",
          question: "Comment fonctionne la période d’essai (trial) ?",
          answer: "La période d’essai de 30 jours vous permet d’accéder à tous les assistants premium gratuitement. À l’issue du trial, vous pouvez souscrire à l’abonnement mensuel pour conserver vos accès."
        },
        {
          id: "compte-2",
          question: "Que se passe-t-il si je ne renouvelle pas mon abonnement ?",
          answer: "Vos accès aux assistants premium seront suspendus, mais vos conversations resteront consultables pendant 6 mois avant anonymisation."
        },
        {
          id: "compte-3",
          question: "Puis-je changer de formule ?",
          answer: "Nous ne proposons qu'ne seule formule, l'abonnement mensuel auquel vous pouvez souscrire après un période d'essai gratuite. Si vous êtes satisfait de votre période d'essai, vous n'avez rien à faire, l'abonnement sera automatiquement débité sur votre carte chaque mois. Les changements sont gérés automatiquement via Stripe."
        }
      ]
    },
    {
      title: "Assistants IA",
      icon: <Bot className="w-5 h-5" style={{ color: '#dbae61' }} />,
      items: [
        {
          id: "assistants-1",
          question: "Quelles sont les limites des assistants IA ?",
          answer: "Les assistants ne remplacent pas un professionnel. Ils s’appuient sur des données fiables mais ne peuvent pas garantir une exactitude totale. Leur rôle est d’assister, pas de trancher."
        },
        {
          id: "assistants-2",
          question: "Que fait l’Assistant Invest Malin ?",
          answer: "L’Assistant Formation répond à vos questions sur l'accompagnement Invest Malin, les modules, et les bonnes pratiques de gestion locative. Il est accessible gratuitement."
        },
        {
          id: "assistants-3",
          question: "Comment l’IA apprend-elle ?",
          answer: "Nos assistants n’apprennent pas directement de vos conversations. Ils s’appuient sur des modèles pré-entraînés et des bases de connaissances internes validées."
        }
      ]
    },
    {
      title: "Support Technique",
      icon: <MessageCircle className="w-5 h-5" style={{ color: '#dbae61' }} />,
      items: [
        {
          id: "support-1",
          question: "Comment signaler un bug ou un dysfonctionnement ?",
          answer: "Vous pouvez le faire directement via le formulaire de contact. Décrivez le contexte, l’assistant concerné et le message d’erreur si possible."
        },
        {
          id: "support-2",
          question: "Qu’est-ce que la Fiche Logement ?",
          answer: "La Fiche Logement permet aux conciergeries de centraliser toutes les informations clés d’un logement (check-in, équipements, photos, état). Elle est automatiquement reliée à votre compte et à vos réservations."
        },
        {
          id: "support-3",
          question: "L’application est-elle compatible mobile ?",
          answer: "Oui, l’application fonctionne parfaitement sur mobile et tablette. Une version PWA (installable sur votre téléphone) sera prochainement disponible."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f8' }}>
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
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Retour
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-20 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Questions Fréquentes</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Trouvez rapidement les réponses à vos questions sur Mon Équipe IA, nos assistants et notre plateforme.
        </p>
      </section>

      {/* FAQ Content */}
      <section className="px-6 md:px-20 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                      <h3 className="text-lg font-semibold text-gray-800 pr-4">{item.question}</h3>
                      {openItems[item.id] ? (
                        <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: '#dbae61' }} />
                      ) : (
                        <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: '#dbae61' }} />
                      )}
                    </button>

                    {openItems[item.id] && (
                      <div className="mt-4 text-gray-600 leading-relaxed">{item.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
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

      {/* Disclaimer Section */}
      <section className="bg-[#fff7e6] border-b border-yellow-300 text-yellow-900 text-center px-6 md:px-20 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3 justify-center">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <p className="text-sm sm:text-base font-medium leading-relaxed">
            <strong>Important :</strong> les assistants IA peuvent contenir des erreurs ou approximations.
            Les réponses fournies ne constituent pas des conseils juridiques, fiscaux ou professionnels.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 md:px-20 text-sm text-gray-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 Mon Équipe IA. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-gray-700">Accueil</Link>
            <Link to="/mentions-legales" className="hover:text-gray-700">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-gray-700">Confidentialité</Link>
            <Link to="/conditions-utilisation" className="hover:text-gray-700">Conditions d'utilisation</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
