import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap, LogOut, MessageSquareText, Menu, X } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function MonCompte() {
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
      <header className="bg-black text-white px-6 md:px-20 py-4">
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
            <span className="text-sm font-medium">Contact</span>
            <button
              onClick={handleLogout}
              className="bg-white text-black px-4 py-2 rounded text-sm font-medium"
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
              <span 
                className="text-sm font-medium cursor-pointer hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </span>
              <button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                className="bg-white text-black px-4 py-2 rounded text-sm font-medium text-left"
              >
                Déconnexion
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Section blanche avec titre Assistant Formation */}
      <section className="bg-white px-6 md:px-20 py-12">
        <div className="flex items-center gap-4">
          <GraduationCap className="w-12 h-12 text-yellow-600" />
          <h1 className="text-4xl font-bold text-black">ASSISTANT FORMATION</h1>
        </div>
      </section>

      {/* Section noire avec contenu en deux colonnes */}
      <section className="bg-black text-white">
        <div className="grid md:grid-cols-[60%_40%] min-h-[400px]">
          <div className="px-6 md:px-20 py-12 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold mb-8">
              Votre copilote pendant la formation Invest Malin
            </h2>
            <div className="space-y-6 text-lg leading-relaxed">
              <p>
                Accédez à tous les supports de la formation Invest Malin : vidéos, modules, documents 
                téléchargeables, fiches pratiques, FAQ. Cet assistant vous accompagne à chaque étape de 
                votre apprentissage pour lever vos doutes, gagner du temps et rester motivé.
              </p>
              <p>
                Posez-lui vos questions techniques, pratiques ou administratives : il est connecté à toute la 
                documentation, et répond instantanément 24h/24.
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/mon-compte/assistant-formation-v2"
                className="inline-block text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#dbae61' }}
              >
                ACCÉDER À L'ASSISTANT >
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden">
            <img
              src="/images/assistant-formation-rectangle.png"
              alt="Assistant Formation"
              className="w-full h-full min-h-[400px] object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Section Choisissez votre assistant IA spécialisé */}
      <section className="bg-white px-6 md:px-20 py-16">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <MessageSquareText className="w-8 h-8 text-yellow-600" />
            <h2 className="text-3xl font-bold text-black">
              CHOISISSEZ <span className="font-bold">VOTRE ASSISTANT</span> IA SPÉCIALISÉ !
            </h2>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">
            Découvrez nos agents IA les plus demandés, conçus pour accompagner les conciergeries 
            sur tous les sujets clés. Chaque assistant est spécialisé pour répondre à un besoin 
            précis de nos concierges. Disponible avec l'abonnement Pro.
          </p>
        </div>
      </section>

      {/* Grille des assistants spécialisés */}
      <section>
        {/* Fiscaliste IA */}
        <div className="relative">
          <div className="bg-white py-8 px-6 md:px-20">
          <div className="ml-0 md:ml-96 md:pl-24">
              <h3 className="text-3xl font-bold text-black">FISCALISTE IA</h3>
            </div>
          </div>
          <div className="bg-gray-100 py-8 pb-8 px-6 md:px-20">
          <div className="ml-0 md:ml-96 md:pl-24">

              <p className="text-gray-800 mb-4 text-lg font-medium">Simplifiez vos démarches fiscales</p>
              <ul className="text-gray-700 mb-6 space-y-2">
                <li>• Posez vos questions de fiscalité courte durée</li>
                <li>• L'IA vous éclaire, sans jargon</li>
                <li>• Réponses adaptées à votre situation</li>
              </ul>
              <Link to="#" className="inline-block text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-colors" style={{ backgroundColor: '#dbae61' }}>
                ACCÉDER À L'ASSISTANT >
              </Link>
            </div>
          </div>
          <div className="absolute top-0 bottom-0 w-64 md:w-96 z-10 hidden md:block" style={{ left: '6rem' }}>
            <img src="/images/fiscaliste-ia.png" alt="Fiscaliste IA" className="w-full h-full object-cover object-left" />
          </div>
        </div>

        {/* LegalBNB IA */}
        <div className="relative mt-12">
          <div className="bg-white py-12 px-6 md:px-20">
            <div className="mr-0 md:mr-96">
              <h3 className="text-3xl font-bold text-black">LEGALBNB IA</h3>
            </div>
          </div>
          <div className="bg-gray-100 py-8 pb-8 px-6 md:px-20">
            <div className="mr-0 md:mr-96">
              <p className="text-gray-800 mb-4 text-lg font-medium">L'IA qui vous répond comme un juriste</p>
              <ul className="text-gray-700 mb-6 space-y-2">
                <li>• Assistant spécialisé dans l'analyse de règlements (copro, mairie, etc.)</li>
                <li>• Lit vos documents (PDF, copier-coller) et sort les points clés.</li>
                <li>• Peut répondre à des questions simples sur vos droits et obligations</li>
              </ul>
              <Link to="#" className="inline-block text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-colors" style={{ backgroundColor: '#dbae61' }}>
                ACCÉDER À L'ASSISTANT >
              </Link>
            </div>
          </div>
          <div className="absolute top-0 bottom-0 w-64 md:w-96 z-10 hidden md:block" style={{ right: '6rem' }}>
            <img src="/images/legalbnb-ia.png" alt="LegalBNB IA" className="w-full h-full object-cover object-right" />
          </div>
        </div>

        {/* Négociateur IA */}
        <div className="relative mt-12">
          <div className="bg-white py-8 px-6 md:px-20">
            <div className="ml-0 md:ml-96">
              <h3 className="text-3xl font-bold text-black">NÉGOCIATEUR IA</h3>
            </div>
          </div>
          <div className="bg-gray-100 py-8 pb-8 px-6 md:px-20">
            <div className="ml-0 md:ml-96">
              <p className="text-gray-800 mb-4 text-lg font-medium">Vous accompagne dans les négociations avec vos clients.</p>
              <ul className="text-gray-700 mb-6 space-y-2">
                <li>• L'IA résume vos appels clients en 10 secondes</li>
                <li>• Analyse une transcription ou un appel</li>
                <li>• Détecte la personnalité de l'interlocuteur (profil psychologique, probable bloc)</li>
                <li>• Propose une stratégie de persuasion adaptée.</li>
              </ul>
              <Link to="#" className="inline-block text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-colors" style={{ backgroundColor: '#dbae61' }}>
                ACCÉDER À L'ASSISTANT >
              </Link>
            </div>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-64 md:w-96 z-10 hidden md:block">
            <img src="/images/negociateur-ia.png" alt="Négociateur IA" className="w-full h-full object-cover object-left" />
          </div>
        </div>
        <div className="bg-white py-16"></div>
      </section>
{/* Bannière finale */}
      <section className="relative h-64">
        <img
          src="/images/bas-de-page.png"
          alt="Bannière finale"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Votre équipe IA vous attend
            </h2>
            <p className="text-xl opacity-90 max-w-2xl">
              Rejoignez des milliers de concierges qui utilisent déjà nos assistants IA
            </p>
          </div>
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
                <li><Link to="/mon-compte/assistant-formation-v2" className="hover:text-white transition-colors">Assistant Formation</Link></li>
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