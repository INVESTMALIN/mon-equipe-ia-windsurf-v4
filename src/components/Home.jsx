import { Link } from 'react-router-dom'
import {
  MessageCircle,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  ShieldCheck,
  Bot
} from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-gray-50 text-gray-800">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 md:px-20 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-orange-600">
            <Bot size={24} className="text-orange-500" />
            Mon Équipe IA
          </div>
          <nav className="flex gap-6 text-base text-gray-700 font-medium">
            <Link to="/a-propos" className="hover:text-orange-600">À propos</Link>
            <Link to="/notre-mission" className="hover:text-orange-600">Notre mission</Link>
            <Link to="/tarifs" className="hover:text-orange-600">Tarifs</Link>
            <Link to="/#temoignages" className="hover:text-orange-600">Témoignages</Link>
          </nav>
        </div>
      </header>


      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-20 bg-[#fdf7ee]">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold text-orange-600 mb-4">
            Un assistant IA sur mesure pour votre activité
          </h1>
          <p className="text-lg mb-6">
            Automatisez. Optimisez. Reprenez du temps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/assistants"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-md text-center"
            >
              Découvrir les assistants
            </Link>
            <Link
              to="/connexion"
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

      {/* Cas d’usage */}
      <section className="px-6 md:px-20 py-20 bg-white">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-12">
          Cas d’usage populaires
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm text-center">
            <MessageCircle className="mx-auto text-orange-500 mb-4" size={40} />
            <h3 className="font-semibold text-lg mb-2">Réponse automatique aux clients</h3>
            <p>Ne ratez plus aucun message. Votre assistant répond instantanément aux demandes.</p>
          </div>
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm text-center">
            <CalendarCheck className="mx-auto text-orange-500 mb-4" size={40} />
            <h3 className="font-semibold text-lg mb-2">Suivi des réservations</h3>
            <p>Gardez le contrôle sur vos plannings, vos alertes et vos imprévus.</p>
          </div>
          <div className="bg-[#fdf7ee] p-6 rounded-xl shadow-sm text-center">
            <FileText className="mx-auto text-orange-500 mb-4" size={40} />
            <h3 className="font-semibold text-lg mb-2">Résumé des messages</h3>
            <p>Une synthèse claire et rapide pour gagner du temps chaque jour.</p>
          </div>
        </div>
      </section>

      {/* Pourquoi nous ? */}
      <section className="flex flex-col md:flex-row items-center px-6 md:px-20 py-20 gap-12 bg-gray-50">
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
      <section id="temoignages" className="px-6 md:px-20 py-16 bg-white text-center">
        <p className="text-lg italic text-gray-700">
          “Déjà utilisé dans plusieurs conciergeries actives à travers la France et l'Europe.”
        </p>
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
