import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Scale,
  ShieldCheck,
  Camera,
  Sparkles,
  KeyRound,
  FileText,
  ArrowRight
} from 'lucide-react'

const GOLD = '#dbae61'

const benefits = [
  {
    icon: ClipboardList,
    title: '24 sections guidées',
    text: "Vous passez en revue chaque pièce et chaque équipement, du logement aux extérieurs, sans jamais vous demander quoi noter ensuite."
  },
  {
    icon: Scale,
    title: 'Le réglementaire intégré',
    text: "Les obligations et mentions légales sont prévues dans le parcours. Vous restez en conformité sans y penser."
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité du logement',
    text: "Détecteurs, équipements, points de vigilance, tout est passé au crible pour des logements aux normes."
  },
  {
    icon: Camera,
    title: 'Rappels photos',
    text: "L'outil vous dit quoi photographier et quand, pour une fiche complète et des biens qui se vendent."
  },
  {
    icon: Sparkles,
    title: 'Annonces générées par IA',
    text: "À partir de votre inspection, l'outil rédige l'annonce Airbnb et Booking, prête à publier."
  },
  {
    icon: KeyRound,
    title: "Guide d'accès, bientôt disponible",
    text: "Générez les instructions d'arrivée de vos voyageurs directement depuis la fiche."
  },
  {
    icon: FileText,
    title: 'Une fiche PDF carrée',
    text: "En fin de parcours, vous repartez avec un récapitulatif structuré et propre, prêt à partager avec le propriétaire ou votre équipe."
  }
]

export default function FicheLogementLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Barre haut */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/invest-malin-logo.png" alt="Invest Malin" className="h-8" />
          <span className="text-lg font-bold tracking-wide">FICHE LOGEMENT</span>
        </div>
        <Link
          to="/connexion"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Se connecter
        </Link>
      </header>

      {/* Hero — titre, pitch, CTA */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Inspectez vos logements comme un pro.{' '}
          <span style={{ color: GOLD }}>Sans rien oublier.</span>
        </h1>
        <p className="mt-5 text-lg text-gray-600">
          L'outil d'inspection tout-en-un pour les conciergeries : parcourez le logement
          section par section et repartez avec une fiche complète et son PDF.
        </p>
        <div className="mt-8">
          <Link
            to="/inscription-fiche-logement"
            className="inline-flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-colors"
          >
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Rappel sobre de ce que fait l'outil */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Tout ce qu'il faut pour inspecter un logement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <div
                  className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(219,174,97,0.12)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Prêt à inspecter votre premier logement ?
          </h2>
          <Link
            to="/inscription-fiche-logement"
            className="inline-flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-colors"
          >
            Créer mon compte et lancer ma première fiche
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} Invest Malin · Fiche Logement</span>
          <div className="flex gap-6">
            <Link to="/mentions-legales" className="hover:text-gray-700 transition-colors">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-gray-700 transition-colors">Confidentialité</Link>
            <Link to="/conditions-utilisation" className="hover:text-gray-700 transition-colors">CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
