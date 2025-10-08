import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Users,
  Scale,
  CheckCircle,
  User,
  GraduationCap,
  Phone,
  X,
  Menu,
  ArrowRight
} from 'lucide-react'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="bg-white text-gray-800">

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
          
          {/* Menu desktop */}
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#cas-usage" className="hover:text-[#dbae61] transition-colors">À PROPOS</a>
            <a href="#assistants" className="hover:text-[#dbae61] transition-colors">NOS ASSISTANTS</a>
            <a href="/tarifs" className="hover:text-[#dbae61] transition-colors">TARIFS</a>
            <a href="/connexion" className="hover:text-[#dbae61] transition-colors">SE CONNECTER</a>          </nav>

          {/* Bouton hamburger mobile */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-700">
            <div className="flex flex-col space-y-4 pt-4">
              <a 
                href="#cas-usage" 
                className="hover:text-[#dbae61] transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                À PROPOS
              </a>
              <a 
                href="#assistants" 
                className="hover:text-[#dbae61] transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                NOS ASSISTANTS
              </a>
              <a 
                href="/tarifs" 
                className="hover:text-[#dbae61] transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                TARIFS
              </a>
              <a 
                href="/connextion" 
                className="hover:text-[#dbae61] transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                CONNEXION
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section - Titre principal */}
      <section className="bg-[#f8f8f8] px-6 md:px-20 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-6 leading-tight">
            UNE ÉQUIPE <span className="font-normal">IA</span> DÉDIÉE À VOTRE CONCIERGERIE
          </h1>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
            Ajoutez des "collaborateurs" à votre conciergerie, optimisez votre 
            gestion quotidienne avec un assistant IA personnalisé, conçu 
            pour vous accompagner à chaque étape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/inscription"
              className="bg-[#dbae61] hover:bg-[#c49a4f] text-white font-bold px-8 py-3 rounded-md transition-colors"
            >
              Créer mon compte →
            </Link>
            
            <Link
              to="/tarifs"
              className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-3 rounded-md border-2 border-gray-200 transition-colors"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* Section MON ÉQUIPE IA avec image - Ratio 40/60 */}
      <section className="bg-black text-white">
        <div className="flex flex-col md:grid md:grid-cols-[40%_60%] md:h-[500px]">
          <div className="relative overflow-hidden h-64 md:h-auto">
            <img
              src="/images/hero-image.png"
              alt="Mon équipe IA"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="px-6 md:px-8 lg:px-12 py-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6">
              <span className="text-[#dbae61]">MON ÉQUIPE IA</span>, Révolutionne votre conciergerie
            </h2>
            <p className="text-gray-300 mb-6">
              <span className="text-[#dbae61] font-semibold">MON ÉQUIPE IA</span> révolutionne la gestion de votre conciergerie 
              en vous offrant des assistants IA dédiés, intelligents et adaptés à 
              vos besoins.
            </p>
            <p className="text-gray-300 mb-8">
              Notre mission est de vous fournir les outils nécessaires pour :
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-white mt-1">•</span>
                <span><strong>automatiser les tâches répétitives</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white mt-1">•</span>
                <span><strong>améliorer l'efficacité</strong> de votre équipe</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white mt-1">•</span>
                <span><strong>répondre rapidement</strong> à toutes les demandes de vos clients.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Cas d'usage réels */}
      <section id="cas-usage" className="bg-white px-6 md:px-20 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black mb-12">
            CAS D'USAGE RÉELS
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#f5f1e8] p-8 rounded-2xl shadow-md text-center">
              <GraduationCap className="text-[#dbae61] w-12 h-12 mx-auto mb-6" />
              <h3 className="font-bold text-lg mb-4 text-black">ACCOMPAGNEMENT PÉDAGOGIQUE</h3>
              <p className="text-gray-700">
                Répondre à toutes les questions liées à la 
                l'accompagnement Invest Malin 7j/7, 
                24h/24.
              </p>
            </div>
            <div className="bg-[#f5f1e8] p-8 rounded-2xl shadow-md text-center">
              <Phone className="text-[#dbae61] w-12 h-12 mx-auto mb-6" />
              <h3 className="font-bold text-lg mb-4 text-black">ANALYSE D'APPELS CLIENTS</h3>
              <p className="text-gray-700">
                Analyse la personnalité 
                de vos clients, résume vos appels, propose 
                une stratégie de 
                négociation adaptée.
              </p>
            </div>
            <div className="bg-[#f5f1e8] p-8 rounded-2xl shadow-md text-center">
              <Scale className="text-[#dbae61] w-12 h-12 mx-auto mb-6" />
              <h3 className="font-bold text-lg mb-4 text-black">SUPPORT FISCAL ET JURIDIQUE</h3>
              <p className="text-gray-700">
                Des réponses claires sur 
                la LMNP, TVA, les 
                règlements de 
                copropriété, sans jargon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Découvrez nos assistants IA */}
      <section id="assistants" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-20">
          <h2 className="text-3xl font-bold text-center text-black mb-12">
            DÉCOUVREZ NOS ASSISTANTS <span className="font-normal">IA</span>
          </h2>
        </div>
        
        {/* Container avec image d'arrière-plan - pleine largeur */}
        <div className="relative bg-gray-900 overflow-hidden">
          {/* Image d'arrière-plan */}
          <div className="absolute inset-0 opacity-40">
            <img
              src="/images/hero-image.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative max-w-6xl mx-auto px-6 md:px-20 py-12">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Assistant Invest Malin */}
              <div className="bg-white/95 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="text-[#dbae61] w-8 h-8" />
                  <h3 className="text-lg font-bold text-black">ASSISTANT <span className="font-bold">INVEST MALIN</span></h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Coach Malin répond à toutes les 
                  questions liées à l'accompagnement Invest 
                  Malin, 24h/24. Le meilleur expert en 
                  conciergerie dans votre poche.
                </p>
              </div>

              {/* Assistant Négociateur */}
              <div className="bg-white/95 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="text-[#dbae61] w-8 h-8" />
                  <h3 className="text-lg font-bold text-black">ASSISTANT <span className="font-bold">NÉGOCIATEUR</span></h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Analyse automatique des appels 
                  commerciaux : détection des objections, de la personnalité,
                  des besoins et des signaux d'achat.
                </p>
              </div>

              {/* Assistant Juridique */}
              <div className="bg-white/95 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="text-[#dbae61] w-8 h-8" />
                  <h3 className="text-lg font-bold text-black">ASSISTANT <span className="font-bold">JURIDIQUE</span></h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Assistant expert en démarches fiscales & légales, la 
                  copropriété, la sous-location, la TVA, et 
                  toutes problématiques juridiques de 
                  terrain.
                </p>
              </div>

              {/* Assistant Annonce */}
              <div className="bg-white/95 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="text-[#dbae61] w-8 h-8" />
                  <h3 className="text-lg font-bold text-black">ASSISTANT <span className="font-bold">ANNONCE</span></h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Assistant spécialisé dans la création d'annonces
                  optimisées. Il rédige des descriptions adaptées, optimise votre annonce, etc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Pourquoi Mon Équipe IA ?*/}
      <section className="bg-[#f8f8f8]">
        <div className="flex flex-col-reverse md:grid md:grid-cols-[60%_40%] md:h-[400px]">
          <div className="px-6 md:px-20 lg:px-32 xl:px-48 py-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-black mb-8">
              POURQUOI <span className="font-normal">MON ÉQUIPE IA</span> ?
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <CheckCircle className="text-[#dbae61] w-6 h-6 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-700">Interface simple et intuitive</span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="text-[#dbae61] w-6 h-6 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-700">Aucune compétence technique requise</span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="text-[#dbae61] w-6 h-6 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-700">Assistants personnalisables à la conciergerie</span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="text-[#dbae61] w-6 h-6 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-700">Vos données sont sécurisées et protégées</span>
              </li>
            </ul>
          </div>
          <div className="relative overflow-hidden h-64 md:h-auto">
            <img
              src="/images/pourquoi-image.png"
              alt="Pourquoi Mon Équipe IA"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

{/* Section Fiche Logement */}
<section className="bg-gradient-to-br from-[#dbae61] to-[#c49a4f]">
  <div className="flex flex-col md:grid md:grid-cols-[50%_50%]">
    
    {/* Contenu gauche */}
    <div className="px-8 md:px-32 py-12 flex flex-col justify-center text-white">
      <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4 w-fit">
        <span className="text-sm font-bold">✨ EXCLUSIVITÉ PREMIUM</span>
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
        Fiche Logement
      </h2>
      
      <p className="text-lg mb-6 leading-relaxed text-white/90">
        Votre outil d'inspection professionnelle intégré. Structurez vos visites, générez des PDFs instantanément, et créez des annonces optimisées.
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#dbae61] font-bold text-sm">✓</span>
          </div>
          <span className="font-semibold">Dashboard de gestion centralisé</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#dbae61] font-bold text-sm">✓</span>
          </div>
          <span className="font-semibold">Formulaire complet 24 sections</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#dbae61] font-bold text-sm">✓</span>
          </div>
          <span className="font-semibold">Génération PDF instantanée</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#dbae61] font-bold text-sm">✓</span>
          </div>
          <span className="font-semibold">Assistant Annonce intégré</span>
        </div>
      </div>

      <Link
        to="/tarifs"
        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#dbae61] font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-2xl w-fit"
      >
        Voir tous les avantages
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>

    {/* Image/mockup droite */}
    <div className="relative overflow-hidden min-h-[400px] md:min-h-[500px]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform rotate-2 hover:rotate-0 transition-transform">
          <div className="bg-gray-100 rounded-lg p-6 space-y-3">
            <div className="h-8 bg-[#dbae61] rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 bg-[#dbae61] rounded mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Témoignages */}
      <section id="temoignages" className="bg-white px-6 md:px-20 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black mb-12">
            TÉMOIGNAGES
          </h2>
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="bg-[#f8f8f8] p-8 rounded-lg shadow-sm text-center max-w-sm">
              <div className="w-16 h-16 bg-[#dbae61] rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="text-black w-8 h-8" />
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Mon équipe IA m'a permis de 
                devenir une meilleure négociatrice 
                pour convaincre les propriétaires"
              </p>
              <h4 className="font-bold text-black">SÉVERINE</h4>
            </div>
            <div className="bg-[#f8f8f8] p-8 rounded-lg shadow-sm text-center max-w-sm">
              <div className="w-16 h-16 bg-[#dbae61] rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="text-black w-8 h-8" />
              </div>
              <p className="text-gray-700 mb-6 italic">
                "L'assistant Fiscaliste est devenu outil 
                indispensable pour nous et 
                quasiment un membre de l'équipe."
              </p>
              <h4 className="font-bold text-black">THOMAS</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action final */}
      <section className="relative bg-gray-900 px-6 md:px-20 py-20 text-center text-white">
        {/* Image d'arrière-plan */}
        <div className="absolute inset-0 opacity-30">
          <img
            src="/images/pourquoi-image.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">
            Vous êtes prêt à déléguer vos actions ?
          </h2>
          <Link
            to="/inscription"
            className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white font-bold px-10 py-4 rounded-md text-lg transition-colors"
          >
            Créer mon espace
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white px-6 md:px-20 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/images/invest-malin-logo.png" 
                  alt="Invest Malin Logo" 
                  className="h-6"
                />
                <span className="text-lg font-bold">MON ÉQUIPE IA</span>
              </div>
              <p className="text-gray-400 text-sm">
                Révolutionnez votre conciergerie avec l'intelligence artificielle
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#dbae61] mb-4">ASSISTANTS</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/connexion" className="hover:text-white transition-colors">Assistant Invest Malin</Link></li>
                <li><Link to="/connexion" className="hover:text-white transition-colors">Assistant Négociateur</Link></li>
                <li><Link to="/connexion" className="hover:text-white transition-colors">Assistant Fiscaliste</Link></li>
                <li><Link to="/connexion" className="hover:text-white transition-colors">Assistant LegalBNB</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#dbae61] mb-4">COMPTE</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/connexion" className="hover:text-white transition-colors">Se connecter</Link></li>
                <li><Link to="/inscription" className="hover:text-white transition-colors">Créer un compte</Link></li>
                <li><Link to="/mot-de-passe-oublie" className="hover:text-white transition-colors">Mot de passe oublié</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#dbae61] mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="mailto:contact@invest-malin.fr" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link to="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link to="/conditions-utilisation" className="hover:text-white transition-colors">Conditions d'utilisation</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 Mon Équipe IA - Invest Malin. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}