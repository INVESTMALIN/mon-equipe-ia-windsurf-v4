import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap, LogOut, MessageSquareText, Menu, X, Scale, Phone, Users, Lock } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function MonCompteV2() {

  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('subscription_status')
          .eq('id', user.id)
          .single()
        setUserProfile(profile)
      }
    }
    fetchUserProfile()
  }, [])

  const isPremium = userProfile?.subscription_status === 'premium'
  
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) navigate('/connexion')
    }
    checkAuth()
  }, [])

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
          <Link to="/mon-compte" className="text-sm font-medium hover:text-[#dbae61] transition-colors">
            Compte
          </Link>
            <span className="text-sm font-medium cursor-pointer hover:text-[#dbae61] transition-colors">Contact</span>
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

      {/* Hero Section - Assistant Formation */}
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
                  ASSISTANT<br />FORMATION
                </h1>
              </div>
              
              <h2 className="text-xl font-light mb-4 text-gray-300">
                Votre copilote pendant la formation Invest Malin
              </h2>
              
              <div className="space-y-3 text-base leading-relaxed text-gray-300 mb-6">
                <p>
                  Accédez à tous les supports de la formation Invest Malin : vidéos, modules, documents 
                  téléchargeables, fiches pratiques, FAQ.
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
        <div className="max-w-6xl mx-auto px-6 md:px-20">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mb-6">
              <MessageSquareText className="w-6 h-6 md:w-8 md:h-8 text-[#dbae61]" />
              <h2 className="text-2xl md:text-3xl font-bold text-black text-center">
                CHOISISSEZ VOTRE ASSISTANT IA SPÉCIALISÉ
              </h2>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Découvrez nos agents IA les plus demandés, conçus pour accompagner les conciergeries 
              sur tous les sujets clés. Chaque assistant est spécialisé pour répondre à un besoin 
              précis de nos concierges.
            </p>
          </div>

          {/* Grille des assistants */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Fiscaliste IA */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/fiscaliste-ia.png" 
                  alt="Fiscaliste IA" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-8 h-8 text-[#dbae61]" />
                  <h3 className="text-2xl font-bold text-black">FISCALISTE IA</h3>
                </div>
                <p className="text-lg font-medium text-gray-800 mb-4">
                  Simplifiez vos démarches fiscales
                </p>
                <ul className="text-gray-600 mb-6 space-y-2 flex-grow">
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Posez vos questions de fiscalité courte durée
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    L'IA vous éclaire, sans jargon
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Réponses adaptées à votre situation
                  </li>
                </ul>
                {isPremium ? (
                  <Link 
                    to="/fiscaliste" 
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
                      Premium (bientôt) →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* LegalBNB IA */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/legalbnb-ia.png" 
                  alt="LegalBNB IA" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-[#dbae61]" />
                  <h3 className="text-2xl font-bold text-black">LEGALBNB IA</h3>
                </div>
                <p className="text-lg font-medium text-gray-800 mb-4">
                  L'IA qui vous répond comme un juriste
                </p>
                <ul className="text-gray-600 mb-6 space-y-2 flex-grow">
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Assistant spécialisé dans l'analyse de règlements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Lit vos documents et sort les points clés
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#dbae61] font-bold">•</span>
                    Répond sur vos droits et obligations
                  </li>
                </ul>
                {isPremium ? (
                  <Link 
                    to="/legalbnb" 
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
                      Premium (bientôt) →
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
                  Vous accompagne dans les négociations
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
                    Propose une stratégie adaptée
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
                      Premium (bientôt) →
                    </Link>
                  </div>
                )}
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
          <Link
            to="/assistant-formation"
            className="inline-flex items-center bg-[#dbae61] hover:bg-[#c49a4f] text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            COMMENCER MAINTENANT
            <span className="ml-2">→</span>
          </Link>
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
                Révolutionnez votre conciergerie avec l'intelligence artificielle
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#dbae61] mb-4">ASSISTANTS</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/mon-compte/assistant-formation" className="hover:text-white transition-colors">Assistant Formation</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Assistant Négociateur</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Assistant Fiscaliste</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Assistant LegalBNB</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#dbae61] mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="mailto:support@invest-malin.fr" className="hover:text-white transition-colors">Contact</a></li>
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