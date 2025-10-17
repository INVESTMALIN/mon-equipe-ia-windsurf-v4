import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Sparkles, Zap, Shield, Clock, ArrowRight, Star } from 'lucide-react'

export default function Tarifs() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-black text-white px-6 md:px-20 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-8"
            />
            <span className="text-lg font-bold">MON ÉQUIPE IA</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="text-sm hover:text-[#dbae61] transition-colors hidden md:block"
            >
              ← Retour
            </Link>
            <Link 
              to="/connexion" 
              className="text-sm bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#dbae61]/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#dbae61]" />
            <span className="text-sm font-medium text-[#dbae61]">Essai gratuit 30 jours • Sans engagement</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Votre équipe IA complète<br />
            <span className="text-[#dbae61]">à partir de 19,99€/mois</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            4 assistants spécialisés + Fiche logement (PDF).<br />
            Automatisez votre conciergerie, gagnez du temps, augmentez vos revenus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/inscription"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-lg"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/assistants"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-4 rounded-xl transition-all border-2 border-gray-200 text-lg"
            >
              Voir les assistants
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Plan Gratuit */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuit</h3>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl font-bold text-gray-900">0€</span>
                <span className="text-gray-500">/mois</span>
              </div>
              <p className="text-gray-600">Pour les membres du programme Invest Malin</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>Assistant Invest Malin</strong> illimité</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Réponses instantanées 24h/24</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Ton coach perso dans ta poche</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Toujours dispo, même le dimanche</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Accès à tous les contenus du programme</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Assistants spécialisés</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Fiche logement PDF</span>
              </li>
            </ul>

            <Link
              to="/inscription"
              className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Plan Premium */}
          <div className="bg-gradient-to-br from-[#dbae61] to-[#c49a4f] rounded-2xl shadow-2xl border-2 border-[#dbae61] p-8 relative transform md:scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-sm font-bold">
              ⭐ RECOMMANDÉ
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl font-bold text-white">19,99€</span>
                <span className="text-white/80">/mois</span>
              </div>
              <p className="text-white/90">Essai gratuit 30 jours</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white"><strong>Tout du plan Gratuit</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white"><strong>Assistant Annonce IA</strong> - Créez des annonces optimisées</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white"><strong>Assistant LegalBNB IA</strong> - Informations juridiques/fiscales</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white"><strong>Assistant Négociateur IA</strong> - Stratégies de négociation</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white"><strong>Fiche logement PDF</strong> - Inspections structurées + PDF</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white">Support prioritaire</span>
              </li>
            </ul>

            <Link
              to="/inscription"
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#dbae61] font-bold px-6 py-4 rounded-lg transition-all hover:scale-105 shadow-lg text-lg"
            >
              Démarrer l'essai gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>

          </div>
        </div>

        {/* Trust badges */}
        <div className="max-w-4xl mx-auto mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Paiement sécurisé par Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Sans engagement</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Résiliation en 1 clic</span>
          </div>
        </div>
      </section>

      {/* Timeline Trial */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comment fonctionne l'essai gratuit ?
          </h2>

          <div className="relative">

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-[#dbae61] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                  1
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Inscription gratuite</h3>
                  <p className="text-gray-600">Créez votre compte en 30 secondes. Aucune carte bancaire requise.</p>
                </div>
              </div>
              

              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-[#dbae61] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                  2
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">30 jours d'essai complet</h3>
                  <p className="text-gray-600">Testez tous les assistants premium + Fiche Logement sans limite. Carte requise, mais aucun débit avant la fin.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-[#dbae61] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                  3
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Décidez en toute liberté</h3>
                  <p className="text-gray-600">Annulez à tout moment en 1 clic. Si vous êtes conquis, continuez pour 19,99€/mois.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Pricing */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Questions fréquentes
          </h2>

          <div className="space-y-6">
            <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex items-center justify-between">
                Puis-je annuler à tout moment ?
                <span className="text-[#dbae61] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Oui, absolument. Vous pouvez annuler votre abonnement en 1 clic depuis votre compte. Aucun engagement, aucune pénalité.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex items-center justify-between">
                Que se passe-t-il après l'essai gratuit ?
                <span className="text-[#dbae61] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Après 30 jours, vous n'avez rien à faire, votre abonnement Premium commence à 19,99€/mois.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex items-center justify-between">
                Les prix incluent-ils la TVA ?
                <span className="text-[#dbae61] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Oui, tous nos prix sont TTC (TVA française incluse). Aucun frais caché.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex items-center justify-between">
                Puis-je garder l'Assistant Invest Malin si j'annule Premium ?
                <span className="text-[#dbae61] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Oui ! L'Assistant sur l'accompagnement Invest Malin reste gratuit à vie, même si vous annulez votre abonnement Premium.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex items-center justify-between">
                Y a-t-il des frais d'installation ou autres ?
                <span className="text-[#dbae61] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Non, aucun. L'inscription est gratuite et vous avez accès immédiat à tout dès votre inscription.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-6 py-16 bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à automatiser votre conciergerie ?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Rejoignez les concierges qui gagnent du temps chaque jour avec Mon Équipe IA.
          </p>
          
          <Link
            to="/inscription"
            className="inline-flex items-center justify-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-bold px-10 py-5 rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl text-lg"
          >
            Démarrer gratuitement maintenant
            <ArrowRight className="w-6 h-6" />
          </Link>

          <p className="text-gray-400 text-sm mt-6">
            30 jours d'essai • Sans engagement • Assistance incluse
          </p>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="bg-black text-white px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">© 2025 Mon Équipe IA • Invest Malin</p>
          <div className="flex gap-6 text-sm">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link>
            <Link to="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="text-gray-400 hover:text-white transition-colors">Confidentialité</Link>
            <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}