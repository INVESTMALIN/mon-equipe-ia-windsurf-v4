import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap, Briefcase, Scale, FileText } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function MonCompte() {
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) navigate('/connexion')
    }
    checkAuth()
  }, [])

  return (
    <div className="space-y-16">
      {/* Bloc Assistant Formation */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <GraduationCap className="text-orange-500 w-6 h-6" />
          Assistant Formation
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-orange-50 shadow-md rounded-lg p-6 border border-orange-200 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Assistant Formation</h3>
              <p className="mb-4 text-gray-700">Votre copilote pendant la formation Invest Malin</p>
              <p className="mb-4 text-gray-600">
                Accédez à tous les supports de la formation Invest Malin : vidéos, modules, documents téléchargeables, fiches pratiques, FAQ.
                Cet assistant vous accompagne à chaque étape de votre apprentissage pour lever vos doutes, gagner du temps et rester motivé.
              </p>
              <p className="mb-4 text-gray-600">
                Posez-lui vos questions techniques, pratiques ou administratives : il est connecté à toute la documentation, et répond instantanément 24h/24.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">🎓 Formation</span>
                <span className="inline-flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">💬 Réponses instantanées</span>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/mon-compte/assistant-formation"
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition"
                >
                  Accéder à l’assistant →
                </Link>
                <Link
                  to="/mon-compte/assistant-formation-v2"
                  className="inline-block border border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold py-2 px-4 rounded-md transition"
                >
                  Accéder à l’assistant V2
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <img
                src="/images/hero-illustration.png"
                alt="Illustration assistant formation"
                className="w-full h-auto object-contain rounded-md shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bloc assistants spécialisés */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="text-orange-500 w-6 h-6" />
          Choisissez votre assistant IA spécialisé !
        </h2>
        <p className="text-gray-700 mb-4">
          Découvrez nos agents IA les plus demandés, conçus pour accompagner les conciergeries sur tous les sujets clés.
          Chaque assistant est spécialisé pour répondre à un besoin précis de nos concierges.
          Disponible avec l’abonnement Pro.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fiscaliste IA */}
          <div className="bg-orange-50 shadow-md rounded-lg p-6 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="text-orange-500 w-5 h-5" />
              <h3 className="text-lg font-semibold">Fiscaliste IA</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">Simplifiez vos démarches fiscales</p>
            <ul className="text-sm text-gray-600 mb-4">
              <li>• Posez vos questions de fiscalité courte durée</li>
              <li>• L’IA vous éclaire, sans jargon</li>
              <li>• Réponses adaptées à votre situation</li>
            </ul>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-100 text-sm text-gray-800 px-3 py-1 rounded-full">📊 Fiscalité</span>
              <span className="bg-gray-100 text-sm text-gray-800 px-3 py-1 rounded-full">🧾 LMNP</span>
              <span className="bg-gray-100 text-sm text-gray-800 px-3 py-1 rounded-full">📁 TVA</span>
            </div>
            
            <Link
              to="#"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Accéder à l’assistant →
            </Link>
          </div>

          {/* LegalBNB */}
          <div className="bg-orange-50 shadow-md rounded-lg p-6 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="text-orange-500 w-5 h-5" />
              <h3 className="text-lg font-semibold">LegalBNB</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">L’IA qui vous répond comme un juriste</p>
            <ul className="text-sm text-gray-600 mb-4">
              <li>• Questions de sous-location, règlement, assurance</li>
              <li>• Réponses fiables, adaptées aux conciergeries</li>
              <li>• Disponible en continu</li>
            </ul>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-100 text-sm text-gray-800 px-3 py-1 rounded-full">⚖️ Juridique</span>
              <span className="bg-gray-100 text-sm text-gray-800 px-3 py-1 rounded-full">📜 Copropriété</span>
              <span className="bg-gray-100 text-sm text-gray-800 px-3 py-1 rounded-full">📃 Contrats</span>
            </div>
            <Link
              to="#"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Accéder à l’assistant →
            </Link>
          </div>

          {/* Résumé d’appel */}
          <div className="bg-orange-50 shadow-md rounded-lg p-6 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-orange-500 w-5 h-5" />
              <h3 className="text-lg font-semibold">Résumé d’appel</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">Ne perdez plus une info client.</p>
            <ul className="text-sm text-gray-600 mb-4">
              <li>• L’IA résume vos appels clients en 10 secondes</li>
              <li>• Suivi structuré (besoins, objections, prochaines étapes)</li>
              <li>• Plus clair, plus pro</li>
            </ul>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-100 text-sm text-gray-800 px-3 py-1 rounded-full">📞 Appels</span>
              <span className="bg-gray-100 text-sm text-gray-800 px-3 py-1 rounded-full">📝 Synthèse</span>
              <span className="bg-gray-100 text-sm text-gray-800 px-3 py-1 rounded-full">⏱️ Gain de temps</span>
            </div>
            <Link
              to="#"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Accéder à l’assistant →
            </Link>
          </div>
        </div>
      </section>

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
