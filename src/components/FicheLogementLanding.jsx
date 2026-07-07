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
  // Les 6 premières features composent la grille (3×2 pile). La 7e (le livrable
  // final, la fiche PDF) est sortie de la grille et racontée dans une section
  // dédiée avec visuel — plus d'orphelin, et le livrable devient un vrai chapitre.
  const gridBenefits = benefits.slice(0, 6)
  const highlight = benefits[6]
  const HighlightIcon = highlight.icon

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Bloc sombre : header + hero (signature de la marque) */}
      <div className="bg-black text-white">
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

        {/* Hero — texte + visuel d'accompagnement */}
        <section className="max-w-6xl mx-auto px-6 pt-8 pb-20 lg:pt-12 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight">
                Inspectez vos logements comme un pro.{' '}
                <span style={{ color: GOLD }}>Sans rien oublier.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0">
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
            </div>

            <div className="relative">
              {/* Halo doré derrière le visuel */}
              <div
                className="absolute -inset-4 rounded-3xl blur-2xl opacity-30"
                style={{ backgroundColor: GOLD }}
                aria-hidden="true"
              />
              <img
                src="/images/hero-image.png"
                alt="Deux professionnels analysant un logement avec l'outil Fiche Logement"
                className="relative w-full rounded-2xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Ce que l'outil fait — clair */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Tout ce qu'il faut pour inspecter un logement. Au même endroit.
            </h2>
            <p className="mt-5 text-gray-600 text-lg">
              De l'état des lieux à l'annonce, Fiche Logement couvre chaque étape de
              l'inspection. Vous avancez section par section, l'outil structure, vérifie
              et n'oublie rien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridBenefits.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#dbae61] hover:shadow-md transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(219,174,97,0.12)' }}
                >
                  <Icon className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Le livrable (7e contenu) — section dédiée avec visuel */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              {/* Halo doré derrière le visuel */}
              <div
                className="absolute -inset-3 rounded-3xl blur-2xl opacity-20"
                style={{ backgroundColor: GOLD }}
                aria-hidden="true"
              />
              <img
                src="/images/pourquoi-image.png"
                alt="Récapitulatif structuré d'une fiche logement prêt à partager"
                className="relative w-full rounded-2xl shadow-xl ring-1 ring-gray-200"
              />
            </div>
            <div className="text-center lg:text-left">
              <span
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: GOLD }}
              >
                <HighlightIcon className="w-4 h-4" />
                Le livrable
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">{highlight.title}</h2>
              <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                {highlight.text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche — clair */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-14">
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
                <p className="text-gray-600 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarif (sans aucun montant) — panneau doré qui ressort */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div
            className="rounded-3xl p-8 md:p-12 text-center border border-[#dbae61]/40 shadow-sm"
            style={{ background: 'linear-gradient(135deg, rgba(219,174,97,0.12), rgba(219,174,97,0.03))' }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
              Vous payez à la fiche. Rien d'autre.
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pas d'abonnement, pas d'engagement. Vous achetez des crédits, un crédit égale
              une fiche complète. Plus vous prenez de crédits, moins la fiche vous coûte.
            </p>
            <div className="mt-8 inline-flex flex-col gap-3 text-left">
              {[
                'Sans abonnement ni engagement',
                'Un crédit = une fiche complète',
                'Plus de crédits, moins cher la fiche'
              ].map((line) => (
                <div key={line} className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final — sombre (referme sur la signature) */}
      <section className="bg-black text-white">
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

      {/* Pied de page — sombre, dans la continuité du CTA */}
      <footer className="bg-black border-t border-neutral-800">
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
