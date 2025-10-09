import { Link, useNavigate } from 'react-router-dom'

export default function ConditionsUtilisation() {
  const navigate = useNavigate()

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
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Retour
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="px-6 md:px-20 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-black mb-8">
            Conditions d'utilisation
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">1. Objet</h2>
              <p className="text-gray-700 leading-relaxed">
                Les présentes conditions générales d'utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de la plateforme Mon Équipe IA, mise à disposition par la société Invest Malin. L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">2. Description du service</h2>
              <p className="text-gray-700 leading-relaxed">
                Mon Équipe IA est une plateforme proposant des assistants d'intelligence artificielle spécialisés dans différents domaines liés à la gestion de conciergerie : formation, fiscalité, aspects juridiques et négociation. Ces outils sont conçus pour accompagner et assister les utilisateurs dans leurs activités professionnelles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">3. Accès au service</h2>
              <p className="text-gray-700 leading-relaxed">
                L'accès à la plateforme nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes et à jour lors de son inscription. Il est responsable de la confidentialité de ses identifiants de connexion et de toutes les activités réalisées sous son compte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">4. Utilisation du service</h2>
              <p className="text-gray-700 leading-relaxed">
                L'utilisateur s'engage à utiliser la plateforme conformément à sa destination et dans le respect des lois en vigueur. Il est notamment interdit de :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Utiliser le service à des fins illégales ou non autorisées</li>
                <li>Tenter de contourner les mesures de sécurité</li>
                <li>Reproduire, copier ou revendre tout ou partie du service</li>
                <li>Transmettre des virus ou codes malveillants</li>
                <li>Harceler ou porter atteinte à d'autres utilisateurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">5. Limitations des assistants IA</h2>
              <p className="text-gray-700 leading-relaxed">
                Les assistants IA sont des outils d'aide et de conseil. Ils ne remplacent en aucun cas l'expertise d'un professionnel qualifié. L'utilisateur reconnaît que les réponses fournies par les assistants IA sont générées automatiquement et peuvent contenir des erreurs. Pour toute décision importante, il est recommandé de consulter un expert humain.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">6. Propriété intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed">
                Tous les contenus présents sur la plateforme (textes, logiciels, bases de données, etc.) sont protégés par le droit de la propriété intellectuelle. L'utilisateur ne peut utiliser ces contenus qu'aux fins prévues par le service, sans autorisation préalable écrite d'Invest Malin.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">7. Données personnelles</h2>
              <p className="text-gray-700 leading-relaxed">
                Le traitement des données personnelles est régi par notre <Link to="/politique-confidentialite" className="text-[#dbae61] hover:underline">politique de confidentialité</Link>, qui fait partie intégrante des présentes conditions d'utilisation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">8. Limitation de responsabilité</h2>
              <p className="text-gray-700 leading-relaxed">
                Invest Malin ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme. La responsabilité d'Invest Malin est limitée au montant des sommes versées par l'utilisateur au cours des 12 derniers mois.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">9. Modification des CGU</h2>
              <p className="text-gray-700 leading-relaxed">
                Invest Malin se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification par email ou via la plateforme. La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">10. Résiliation</h2>
              <p className="text-gray-700 leading-relaxed">
                L'utilisateur peut résilier son compte à tout moment en nous contactant. Invest Malin peut suspendre ou résilier l'accès d'un utilisateur en cas de violation des présentes CGU, avec ou sans préavis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">11. Droit applicable et juridiction</h2>
              <p className="text-gray-700 leading-relaxed">
                Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence des tribunaux français.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">12. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question relative aux présentes conditions d'utilisation, vous pouvez nous contacter à l'adresse : 
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