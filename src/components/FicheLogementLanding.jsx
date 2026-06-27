import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Scale,
  ShieldCheck,
  Camera,
  Sparkles,
  KeyRound,
  FileText,
  ArrowRight,
  Check
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

const steps = [
  'Créez votre compte et lancez une nouvelle fiche.',
  "Parcourez le logement et remplissez les sections, l'outil vous guide du début à la fin.",
  'Récupérez votre fiche structurée, son PDF et vos annonces, prêts à l\'emploi.'
]

export default function FicheLogementLanding() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Barre haut */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/invest-malin-logo.png" alt="Invest Malin" className="h-8" />
          <span className="text-lg font-bold tracking-wide">FICHE LOGEMENT</span>
        </div>
        <Link
          to="/connexion"
          className="text-sm text-gray-300 hover:text-white transition-colors"
        >
          Se connecter
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mx-auto">
          Inspectez vos logements comme un pro.{' '}
          <span style={{ color: GOLD }}>Sans rien oublier.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          L'outil d'inspection tout-en-un pensé pour les conciergeries. Vous parcourez le
          logement section par section, l'outil structure tout, du réglementaire à la
          sécurité, et vous repartez avec une fiche complète et un PDF carré, prêt à partager.
        </p>
        <div className="mt-10">
          <Link
            to="/inscription-fiche-logement"
            className="inline-flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-black font-semibold text-lg px-8 py-4 rounded-xl transition-colors"
          >
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Ce que l'outil fait */}
      <section className="bg-neutral-950 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              Tout ce qu'il faut pour inspecter un logement. Au même endroit.
            </h2>
            <p className="mt-5 text-gray-300 text-lg">
              De l'état des lieux à l'annonce, Fiche Logement couvre chaque étape de
              l'inspection. Vous avancez section par section, l'outil structure, vérifie
              et n'oublie rien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-black border border-neutral-800 rounded-2xl p-6 hover:border-[#dbae61] transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(219,174,97,0.12)' }}
                >
                  <Icon className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="border-t border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            Une fiche complète en trois étapes.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-5 text-black"
                  style={{ backgroundColor: GOLD }}
                >
                  {i + 1}
                </div>
                <p className="text-gray-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarif (sans aucun montant) */}
      <section className="bg-neutral-950 border-t border-neutral-800">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-5">
            Vous payez à la fiche. Rien d'autre.
          </h2>
          <p className="text-gray-300 text-lg">
            Pas d'abonnement, pas d'engagement. Vous achetez des crédits, un crédit égale
            une fiche complète. Plus vous prenez de crédits, moins la fiche vous coûte.
          </p>
          <div className="mt-8 inline-flex flex-col gap-3 text-left">
            {[
              'Sans abonnement ni engagement',
              'Un crédit = une fiche complète',
              'Plus de crédits, moins cher la fiche'
            ].map((line) => (
              <div key={line} className="flex items-center gap-3 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Prêt à inspecter votre premier logement ?
          </h2>
          <Link
            to="/inscription-fiche-logement"
            className="inline-flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-black font-semibold text-lg px-8 py-4 rounded-xl transition-colors"
          >
            Créer mon compte et lancer ma première fiche
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} Invest Malin · Fiche Logement</span>
          <div className="flex gap-6">
            <Link to="/mentions-legales" className="hover:text-gray-300 transition-colors">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-gray-300 transition-colors">Confidentialité</Link>
            <Link to="/conditions-utilisation" className="hover:text-gray-300 transition-colors">CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
