import { Link } from 'react-router-dom'
import {
  MessageCircle,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  ShieldCheck,
  Bot,
  User,
  Users,
  UserRound,
  UserCircle, 
  UserSquare
} from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-gray-50 text-gray-800">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 md:px-20 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-orange-600">
            <Link to="/" className="flex items-center gap-2"> {/* Lien vers la homepage */}
              <Bot size={24} className="text-orange-500" />
              Mon Équipe IA
            </Link>
          </div>
          <nav className="flex gap-6 text-base text-gray-700 font-medium">
            <a href="#a-propos" className="hover:text-orange-600">À propos</a>
            <a href="#notre-mission" className="hover:text-orange-600">Notre mission</a>
            <Link to="/tarifs" className="hover:text-orange-600">Tarifs</Link>
            <a href="#temoignages" className="hover:text-orange-600">Témoignages</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-20 bg-[#fdf7ee]">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold text-orange-600 mb-4">
            Une équipe IA dédiée à votre activité
          </h1>
          <p className="text-lg mb-6">
            Optimisez votre gestion quotidienne avec un assistant IA personnalisé, conçu pour vous accompagner à chaque étape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#assistants"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-md text-center"
            >
              Découvrir les assistants
            </a>
            <Link
              to="#assistants"
              className="bg-white text-orange-600 border border-orange-500 hover:bg-orange-100 font-semibold px-6 py-3 rounded-md text-center"
            >
              Accéder à mon compte
            </Link>
          </div>
        </div>
        <img
          src="/images/hero-illustration.png"
          alt="Illustration IA"
          className="max-w-md w-full mt-10 md:mt-0"
        />
      </section>

      {/* Qui sommes-nous */}
      <section id="a-propos" className="px-6 md:px-20 py-12 bg-white text-center">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">Qui sommes-nous ?</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel mauris nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
        </p>
      </section>

      {/* Cas d’usage réels */}
      <section className="px-6 md:px-20 py-12 bg-white">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-8">
          Cas d’usage réels
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm text-center">
            <MessageCircle className="mx-auto text-orange-500 mb-4" size={40} />
            <h3 className="font-semibold text-lg mb-2">Accompagnement pédagogique</h3>
            <p>Coach Malin répond à toutes les questions liées à la formation Invest Malin, 24h/24.</p>
          </div>
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm text-center">
            <CalendarCheck className="mx-auto text-orange-500 mb-4" size={40} />
            <h3 className="font-semibold text-lg mb-2">Analyse d'appels clients</h3>
            <p>Suivi structuré des appels (besoins, objections, étapes), en quelques secondes.</p>
          </div>
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm text-center">
            <FileText className="mx-auto text-orange-500 mb-4" size={40} />
            <h3 className="font-semibold text-lg mb-2">Support fiscal et juridique</h3>
            <p>Des réponses claires sur la LMNP, TVA, sous-location et copropriété, sans jargon.</p>
          </div>
        </div>
      </section>

      {/* Découvrez nos assistants IA Section */}
      <section id="assistants" className="px-6 md:px-20 py-16 bg-white">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-12">
          Découvrez nos assistants IA
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm">
            <MessageCircle className="text-orange-500 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Assistant Formation</h3>
            <p className="text-gray-700">Coach Malin répond à toutes les questions liées à la formation Invest Malin, 24h/24. Idéal pour les nouveaux élèves ou les clients curieux.</p>
          </div>
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm">
            <CalendarCheck className="text-orange-500 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Assistant Appels</h3>
            <p className="text-gray-700">Analyse automatique des appels commerciaux : détection des objections, des besoins, et des signaux d'achat.</p>
          </div>
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm">
            <FileText className="text-orange-500 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Assistant Juridique</h3>
            <p className="text-gray-700">FAQ intelligente sur la fiscalité, la copropriété, la sous-location, la TVA, et autres problématiques juridiques de terrain.</p>
          </div>
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm">
            <Users className="text-orange-500 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Assistant Équipe</h3>
            <p className="text-gray-700">Partage des process internes, des guides, et répond aux questions fréquentes de votre équipe.</p>
          </div>
        </div>
      </section>

      {/* Pourquoi Mon Équipe IA ? */}
      <section className="flex flex-col md:flex-row items-center px-6 md:px-20 py-12 gap-12 bg-gray-50">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-orange-600 mb-6">Pourquoi Mon Équipe IA ?</h2>
          <ul className="space-y-4 text-lg">
            <li className="flex items-center gap-3">
              <LayoutDashboard className="text-orange-500" size={24} />
              Interface simple et intuitive
            </li>
            <li className="flex items-center gap-3">
              <Settings className="text-orange-500" size={24} />
              Aucune compétence technique requise
            </li>
            <li className="flex items-center gap-3">
              <SlidersHorizontal className="text-orange-500" size={24} />
              Assistants personnalisables selon votre métier
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="text-orange-500" size={24} />
              Données hébergées en Europe
            </li>
          </ul>
        </div>
        <img
          src="/images/pourquoi-illustration.png"
          alt="Fonctionnalités IA"
          className="flex-1 max-w-md w-full"
        />
      </section>

      {/* Témoignages */}
      <section id="temoignages" className="px-6 md:px-20 py-16 bg-white">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-12">
          Témoignages
        </h2>
        <div className="flex justify-center gap-8 flex-wrap">
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm text-center w-64">
            <UserRound className="mx-auto text-orange-500 mb-4" size={40} />
            <p className="text-gray-600 mb-4">“Mon équipe IA nous a permis de rationaliser nos processus, un vrai gain de temps !”</p>
            <span className="text-gray-500 font-semibold">Jean Dupont</span>
          </div>
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm text-center w-64">
            <User className="mx-auto text-orange-500 mb-4" size={40} />
            <p className="text-gray-600 mb-4">“Un outil indispensable pour nous, c’est devenu un réflexe quotidien et quasiment un membre de l'équipe.”</p>
            <span className="text-gray-500 font-semibold">Marie Leclerc</span>
          </div>
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm text-center w-64">
            <UserCircle className="mx-auto text-orange-500 mb-4" size={40} />
            <p className="text-gray-600 mb-4">“Les réponses instantanées ont vraiment boosté notre productivité, on est plus réactif.”</p>
            <span className="text-gray-500 font-semibold">Lucie Martin</span>
          </div>
        </div>
      </section>

      {/* Call to action final */}
      <section className="px-6 md:px-20 py-16 bg-[#fdf7ee] text-center">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">
          Vous êtes prêt à passer à l’action ?
        </h2>
        <Link
          to="/inscription"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-md"
        >
          Créer mon espace
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 md:px-20 text-sm text-gray-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 Mon Équipe IA. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link to="/mentions-legales" className="hover:text-gray-700">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-gray-700">Confidentialité</Link>
            <Link to="/contact" className="hover:text-gray-700">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
