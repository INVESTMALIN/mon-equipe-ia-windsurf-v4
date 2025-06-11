import { Link } from 'react-router-dom'

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
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
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="px-6 md:px-20 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-black mb-8">
            Mentions légales
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Éditeur du site</h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>Raison sociale :</strong> Invest Malin<br />
                <strong>Forme juridique :</strong> [À compléter]<br />
                <strong>Capital social :</strong> [À compléter]<br />
                <strong>Siège social :</strong> [Adresse à compléter]<br />
                <strong>SIRET :</strong> [Numéro à compléter]<br />
                <strong>RCS :</strong> [Numéro à compléter]<br />
                <strong>Téléphone :</strong> [Numéro à compléter]<br />
                <strong>Email :</strong> contact@invest-malin.fr
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Directeur de publication</h2>
              <p className="text-gray-700 leading-relaxed">
                Le directeur de publication du site est [Nom à compléter], en sa qualité de [Fonction à compléter].
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Hébergement</h2>
              <p className="text-gray-700 leading-relaxed">
                Le site Mon Équipe IA est hébergé par :<br />
                <strong>Vercel Inc.</strong><br />
                340 S Lemon Ave #4133<br />
                Walnut, CA 91789<br />
                États-Unis
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Propriété intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed">
                L'ensemble du contenu du site Mon Équipe IA (textes, images, vidéos, logos, etc.) est protégé par le droit d'auteur et appartient à Invest Malin ou à ses partenaires. Toute reproduction, distribution, modification ou utilisation sans autorisation préalable est strictement interdite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Données personnelles</h2>
              <p className="text-gray-700 leading-relaxed">
                Les informations recueillies sur ce site font l'objet d'un traitement informatique destiné à la gestion des comptes utilisateurs et à l'amélioration de nos services. Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour plus d'informations, consultez notre <Link to="/politique-confidentialite" className="text-[#dbae61] hover:underline">politique de confidentialité</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies. Vous pouvez modifier vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Limitation de responsabilité</h2>
              <p className="text-gray-700 leading-relaxed">
                Invest Malin met tout en œuvre pour offrir aux utilisateurs des informations et/ou des outils disponibles et vérifiés, mais ne saurait être tenu pour responsable des erreurs, d'une absence de disponibilité des informations et/ou de la présence de virus sur son site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Droit applicable</h2>
              <p className="text-gray-700 leading-relaxed">
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse : 
                <a href="mailto:contact@invest-malin.fr" className="text-[#dbae61] hover:underline ml-1">contact@invest-malin.fr</a>
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
    </div>
  )
}