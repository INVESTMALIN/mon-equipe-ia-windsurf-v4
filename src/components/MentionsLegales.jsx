import { Link, useNavigate } from 'react-router-dom'

export default function MentionsLegales() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <header className="bg-white shadow-sm px-6 md:px-20 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-8"
            />
            <span className="text-xl font-bold text-black">MON ÉQUIPE IA</span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Retour
          </button>
        </div>
      </header>

      <main className="px-6 md:px-20 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-black mb-8">Mentions légales</h1>

          <div className="prose prose-lg max-w-none space-y-8">

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Éditeur du site</h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>Raison sociale :</strong> CARDIN CONCIERGERIE LLP<br />
                <strong>Forme juridique :</strong> Limited Liability Partnership<br />
                <strong>Numéro d’immatriculation :</strong> OC448822<br />
                <strong>Siège social :</strong> 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom<br />
                <strong>Représentant légal :</strong> Loïc Cardin<br />
                <strong>Email :</strong> contact@invest-malin.fr
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Responsable de la publication</h2>
              <p className="text-gray-700 leading-relaxed">
                Loïc Cardin, en qualité de représentant légal de CARDIN CONCIERGERIE LLP.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Hébergement</h2>
              <p className="text-gray-700 leading-relaxed">
                Ce site est hébergé par :<br />
                <strong>Vercel Inc.</strong><br />
                340 S Lemon Ave #4133<br />
                Walnut, CA 91789<br />
                États-Unis
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Accès au site</h2>
              <p className="text-gray-700 leading-relaxed">
                Le site est accessible à tout moment, sauf en cas de maintenance ou de problème technique. CARDIN CONCIERGERIE LLP s’efforce de garantir la disponibilité du service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Propriété intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed">
                L’ensemble des éléments présents sur le site Mon Équipe IA (textes, images, logos, vidéos, etc.) est la propriété exclusive de CARDIN CONCIERGERIE LLP ou fait l’objet d’une autorisation d’utilisation. Toute reproduction ou exploitation non autorisée est interdite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Responsabilité</h2>
              <p className="text-gray-700 leading-relaxed">
                L’éditeur ne saurait être tenu responsable de dommages matériels liés à l’utilisation du site. L’utilisateur s’engage à accéder au site avec un équipement récent, sans virus, et à jour.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Protection des données personnelles</h2>
              <p className="text-gray-700 leading-relaxed">
                Les données collectées sont utilisées uniquement dans le cadre des services proposés par Mon Équipe IA. Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et de suppression de vos données. Pour plus d’informations, consultez notre <Link to="/politique-confidentialite" className="text-[#dbae61] hover:underline">politique de confidentialité</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Ce site utilise des cookies à des fins de statistiques et de fonctionnement. Vous pouvez configurer votre navigateur pour refuser les cookies ou être informé de leur utilisation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Droit applicable</h2>
              <p className="text-gray-700 leading-relaxed">
              La connexion et la navigation sur le site internet mon-equipe-ia.com par l’utilisateur implique l’acceptation intégrale et sans réserve des présentes mentions légales. Le présent site est régi par le droit français. En cas de litige, les tribunaux compétents de Paris seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse :
                <a 
                  href="mailto:contact@invest-malin.fr" 
                  className="text-[#dbae61] hover:underline ml-1"
                >
                  {['contact', '@', 'invest-malin.fr'].join('')}
                </a>
              </p>
            </section>

          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          
        </div>
        
      </main>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 md:px-20 text-sm text-gray-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 Mon Équipe IA. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-gray-700">Accueil</Link>
            <Link to="/mentions-legales" className="hover:text-gray-700">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-gray-700">Confidentialité</Link>
            <Link to="/conditions-utilisation" className="hover:text-gray-700">Conditions d'utilisation</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
