import { Link } from 'react-router-dom'

export default function PolitiqueConfidentialite() {
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
            Politique de confidentialité
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Invest Malin s'engage à protéger la confidentialité de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez la plateforme Mon Équipe IA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">2. Données collectées</h2>
              <h3 className="text-xl font-semibold text-black mb-3">2.1 Données d'identification</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Lors de votre inscription, nous collectons :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Mot de passe (chiffré)</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-black mb-3">2.2 Données d'utilisation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Pendant votre utilisation de la plateforme, nous collectons :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Historique des conversations avec les assistants IA</li>
                <li>Données de navigation et d'utilisation</li>
                <li>Adresse IP et informations techniques</li>
                <li>Cookies et données de session</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">3. Finalités du traitement</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous utilisons vos données personnelles pour :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Gérer votre compte et vous authentifier</li>
                <li>Fournir les services des assistants IA</li>
                <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
                <li>Vous contacter pour des questions techniques ou commerciales</li>
                <li>Respecter nos obligations légales</li>
                <li>Analyser l'utilisation de la plateforme à des fins statistiques</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">4. Base légale du traitement</h2>
              <p className="text-gray-700 leading-relaxed">
                Le traitement de vos données personnelles repose sur :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li><strong>L'exécution du contrat :</strong> pour fournir les services demandés</li>
                <li><strong>L'intérêt légitime :</strong> pour améliorer nos services et assurer la sécurité</li>
                <li><strong>Votre consentement :</strong> pour les communications marketing (le cas échéant)</li>
                <li><strong>Les obligations légales :</strong> pour respecter la réglementation en vigueur</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">5. Partage des données</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, sauf dans les cas suivants :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li><strong>Prestataires de services :</strong> hébergement (Vercel), base de données (Supabase)</li>
                <li><strong>Obligations légales :</strong> si requis par la loi ou les autorités compétentes</li>
                <li><strong>Sécurité :</strong> pour protéger nos droits et ceux de nos utilisateurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">6. Conservation des données</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous conservons vos données personnelles pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li><strong>Données de compte :</strong> jusqu'à la suppression de votre compte</li>
                <li><strong>Historique des conversations :</strong> 3 ans après la dernière activité</li>
                <li><strong>Données de navigation :</strong> 13 mois maximum</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">7. Sécurité des données</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Chiffrement des données en transit et au repos</li>
                <li>Authentification sécurisée</li>
                <li>Accès restreint aux données selon le principe du besoin d'en connaître</li>
                <li>Surveillance et audit réguliers</li>
                <li>Hébergement sur des serveurs sécurisés en Europe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">8. Vos droits</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> supprimer vos données dans certains cas</li>
                <li><strong>Droit à la limitation :</strong> restreindre le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement pour des raisons légitimes</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à : 
                <a href="mailto:privacy@invest-malin.fr" className="text-[#dbae61] hover:underline ml-1">privacy@invest-malin.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">9. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous utilisons des cookies strictement nécessaires au fonctionnement de la plateforme (authentification, session). Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter le fonctionnement du service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">10. Transferts internationaux</h2>
              <p className="text-gray-700 leading-relaxed">
                Vos données peuvent être transférées vers des pays hors de l'Union européenne, notamment vers les États-Unis (Vercel). Ces transferts sont encadrés par des garanties appropriées conformément au RGPD.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">11. Modifications</h2>
              <p className="text-gray-700 leading-relaxed">
                Cette politique de confidentialité peut être modifiée à tout moment. Nous vous informerons de toute modification importante par email ou via la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">12. Contact et réclamations</h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits, contactez-nous à : 
                <a href="mailto:privacy@invest-malin.fr" className="text-[#dbae61] hover:underline ml-1">privacy@invest-malin.fr</a>
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Vous avez également le droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD.
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