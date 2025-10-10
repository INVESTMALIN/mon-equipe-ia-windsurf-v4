import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap, LogOut, MessageSquareText, Menu, X, Scale, Phone, Users, Lock, FileText, CheckCircle, PenTool} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function MonCompteV2() {

  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('subscription_status, has_used_trial')
          .eq('id', user.id)
          .single()
        setUserProfile(profile)
      }
    }
    fetchUserProfile()
  }, [])

  const isPremium = userProfile?.subscription_status === 'premium' || 
                    userProfile?.subscription_status === 'trial'
  
  const ctaText = userProfile?.has_used_trial ? 'Souscrire →' : 'Essai gratuit →'


  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/connexion')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header noir */}
      <header className="bg-black text-white px-6 md:px-20 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-10"
            />
            <span className="text-lg font-bold">MON ÉQUIPE IA</span>
          </div>
          
          {/* Menu desktop */}
          <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-[#dbae61] transition-colors">
            Accueil
          </Link>
          <Link to="/mon-compte" className="text-sm font-medium hover:text-[#dbae61] transition-colors">
            Mon compte
          </Link>
          <Link to="/support" className="text-sm font-medium hover:text-[#dbae61] transition-colors">
            Support
          </Link>
            <button
              onClick={handleLogout}
              className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Déconnexion
            </button>
          </div>

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
              <Link to="/" className="text-sm font-medium hover:text-[#dbae61] transition-colors">
                Accueil
              </Link>
              <Link to="/mon-compte" className="text-sm font-medium hover:text-[#dbae61] transition-colors">
                Compte
              </Link>
              <span 
                className="text-sm font-medium cursor-pointer hover:text-[#dbae61] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </span>
              <button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium text-left hover:bg-gray-100 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section - Assistant Invest Malin */}
      <section className="relative overflow-hidden">
        {/* Background avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        
        {/* Content */}
        <div className="relative z-10 px-6 md:px-20 py-12">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
            {/* Left content */}
            <div className="text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-[#dbae61] rounded-xl">
                  <GraduationCap className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold">
                  ASSISTANT<br />INVEST MALIN
                </h1>
              </div>
              
              <h2 className="text-xl font-light mb-4 text-gray-300">
                Votre copilote pendant l'accompagnement Invest Malin
              </h2>
              
              <div className="space-y-3 text-base leading-relaxed text-gray-300 mb-6">
                <p>
                  Obtenez des réponses sur tous les supports du programme Invest Malin : vidéos, modules, documents, 
                  fiches pratiques, FAQ.
                </p>
                <p>
                  Posez-lui vos questions techniques, pratiques ou administratives : il est connecté à toute la 
                  documentation, et répond instantanément 24h/24.
                </p>
              </div>
              
              <Link
                to="/assistant-formation"
                className="inline-flex items-center bg-[#dbae61] hover:bg-[#c49a4f] text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Accéder à l'assistant
                <span className="ml-2">→</span>
              </Link>
            </div>
            
            {/* Right image */}
            <div className="relative">
              <div className="aspect-[3/2] rounded-2xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/images/assistant-formation-rectangle.png"
                  alt="Assistant Formation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Assistants spécialisés */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-black text-center">
                CHOISISSEZ VOTRE ASSISTANT IA SPÉCIALISÉ
              </h2>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Découvrez nos agents IA les plus demandés, vos nouveaux alliés du quotidien ! 
            </p>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Conçus pour vous accompagner sur les sujets clé de votre conciergerie, ces assistants spécialisés répondent à vos besoins avec précision et rapidité. 
            </p>
          </div>

          {/* Grille des assistants */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Juridique IA */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/fiscaliste-ia.png" 
                  alt="Juridique IA" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-8 h-8 text-[#dbae61]" />
                  <h3 className="text-2xl font-bold text-black">LEBALBNB IA</h3>
                </div>
                <p className="text-lg font-medium text-gray-800 mb-4">
                L'IA qui simplifie vos démarches fiscales & légales
                </p>
                <ul className="text-gray-600 mb-6 space-y-2 flex-grow">
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Outil d’aide à la compréhension du droit et de la fiscalité
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Lit et analyse les règlements (copro, mairie)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Vous éclaire, sans jargon
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Support d’aide à la décision – informations à titre indicatif, sans valeur de conseil juridique.
                  </li>
                </ul>
                {isPremium ? (
                  <Link 
                    to="/juridique" 
                    className="inline-block text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-colors" 
                    style={{ backgroundColor: '#dbae61' }}
                  >
                    Accéder à l'assistant →
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Lock className="w-4 h-4" />
                      <span>Premium requis</span>
                    </div>
                    <Link 
                      to="/upgrade" 
                      className="inline-block bg-gray-400 hover:bg-gray-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                      {ctaText}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Annonce IA */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/annonce-ia.png" 
                  alt="Annonce IA" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <PenTool className="w-8 h-8 text-[#dbae61]" />
                  <h3 className="text-2xl font-bold text-black">ANNONCE IA</h3>
                </div>
                <p className="text-lg font-medium text-gray-800 mb-4">
                L'IA qui facilite la création d'annonces
                </p>
                <ul className="text-gray-600 mb-6 space-y-2 flex-grow">
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Rédige des descriptions adaptées à votre bien
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Liste les équipements pour Airbnb & Booking
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Propose un guide d'arrivée personnalisé
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Optimise votre annonce
                  </li>
                </ul>
                {isPremium ? (
                  <Link 
                    to="/annonce" 
                    className="inline-block text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-colors" 
                    style={{ backgroundColor: '#dbae61' }}
                  >
                    Accéder à l'assistant →
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Lock className="w-4 h-4" />
                      <span>Premium requis</span>
                    </div>
                    <Link 
                      to="/upgrade" 
                      className="inline-block bg-gray-400 hover:bg-gray-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                      {ctaText}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Négociateur IA */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/negociateur-ia.png" 
                  alt="Négociateur IA" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-8 h-8 text-[#dbae61]" />
                  <h3 className="text-2xl font-bold text-black">NÉGOCIATEUR IA</h3>
                </div>
                <p className="text-lg font-medium text-gray-800 mb-4">
                  L'IA qui vous aide à négocier avec efficacité
                </p>
                <ul className="text-gray-600 mb-6 space-y-2 flex-grow">
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Résume vos appels clients en 10 secondes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Détecte la personnalité de l'interlocuteur
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Propose des modèles de discours et d'emails
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Suggère une stratégie adaptée
                  </li>
                </ul>
                {isPremium ? (
                  <Link 
                    to="/negociateur" 
                    className="inline-block text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-colors" 
                    style={{ backgroundColor: '#dbae61' }}
                  >
                    Accéder à l'assistant →
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Lock className="w-4 h-4" />
                      <span>Premium requis</span>
                    </div>
                    <Link 
                      to="/upgrade" 
                      className="inline-block bg-gray-400 hover:bg-gray-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                      {ctaText}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fiche Logement - Bannière Premium */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          <div className="bg-gradient-to-r from-[#dbae61] to-[#c49a4f] rounded-3xl p-10 md:p-16 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Left content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
                  <FileText className="w-8 h-8 text-white" />
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    FICHE LOGEMENT
                  </h2>
                </div>
                
                <p className="text-xl font-semibold text-white mb-4">
                  Créez vos fiches d'inspection professionnelles
                </p>
                
                <ul className="text-white mb-6 space-y-2 text-left max-w-md mx-auto lg:mx-0">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    <span>Formulaire complet 23 sections</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    <span>Génération PDF automatique</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    <span>Création d'annonces Airbnb/Booking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    <span>Rappels visuels pour photos</span>
                  </li>
                </ul>

                {isPremium ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center bg-white hover:bg-gray-100 text-[#dbae61] font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Accéder à mes fiches
                    <span className="ml-2">→</span>
                  </Link>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white justify-center lg:justify-start">
                      <Lock className="w-5 h-5" />
                      <span className="font-semibold">Premium requis</span>
                    </div>
                    <Link
                      to="/upgrade"
                      className="inline-flex items-center bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg"
                    >
                      {ctaText}
                    </Link>
                  </div>
                )}
              </div>

              {/* Right illustration */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                  <FileText className="w-16 h-16 md:w-20 md:h-20 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/bas-de-page.png"
            alt="Bannière finale"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6 md:px-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Votre équipe IA vous attend
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Rejoignez des milliers de concierges qui utilisent déjà nos assistants IA pour optimiser leur conciergerie
          </p>
          
          {isPremium ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center bg-[#dbae61] hover:bg-[#c49a4f] text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              ACCÉDER À MON TABLEAU DE BORD
              <span className="ml-2">→</span>
            </Link>
          ) : (
            <Link
              to="/upgrade"
              className="inline-flex items-center bg-[#dbae61] hover:bg-[#c49a4f] text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {userProfile?.has_used_trial ? 'SOUSCRIRE' : 'ESSAYER GRATUITEMENT 30 JOURS'}
              <span className="ml-2">→</span>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white px-6 md:px-20 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
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
                Révolutionnez votre conciergerie et automatisez vos tâches grâce à l'intelligence artificielle.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#dbae61] mb-4">ASSISTANTS</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                {/* Assistant Invest Malin - Toujours accessible */}
                <li>
                  <Link 
                    to="/assistant-formation" 
                    className="hover:text-white transition-colors"
                  >
                    Assistant Invest Malin
                  </Link>
                </li>
                
                {/* Assistants Premium - Affichage conditionnel */}
                <li>
                  {isPremium ? (
                    <Link 
                      to="/negociateur" 
                      className="hover:text-white transition-colors"
                    >
                      Assistant Négociateur
                    </Link>
                  ) : (
                    <Link 
                      to="/upgrade" 
                      className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                      <span>Assistant Négociateur</span>
                      <Lock className="w-3 h-3 group-hover:text-[#dbae61] transition-colors" />
                    </Link>
                  )}
                </li>
                
                <li>
                  {isPremium ? (
                    <Link 
                      to="/juridique" 
                      className="hover:text-white transition-colors"
                    >
                      Assistant Juridique
                    </Link>
                  ) : (
                    <Link 
                      to="/upgrade" 
                      className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                      <span>Assistant Juridique</span>
                      <Lock className="w-3 h-3 group-hover:text-[#dbae61] transition-colors" />
                    </Link>
                  )}
                </li>
                
                <li>
                  {isPremium ? (
                    <Link 
                      to="/annonce" 
                      className="hover:text-white transition-colors"
                    >
                      Assistant Annonce
                    </Link>
                  ) : (
                    <Link 
                      to="/upgrade" 
                      className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                      <span>Assistant Annonce</span>
                      <Lock className="w-3 h-3 group-hover:text-[#dbae61] transition-colors" />
                    </Link>
                  )}
                </li>
                <li>
                  {isPremium ? (
                    <Link 
                      to="/dashboard" 
                      className="hover:text-white transition-colors"
                    >
                      Fiche Logement
                    </Link>
                  ) : (
                    <Link 
                      to="/upgrade" 
                      className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                      <span>Fiche Logement</span>
                      <Lock className="w-3 h-3 group-hover:text-[#dbae61] transition-colors" />
                    </Link>
                  )}
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#dbae61] mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
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