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
              La présente politique de traitement des données personnelles explicite la manière dont la société CARDIN CONCIERGERIE LLP dont le siège social est situé 71-75 Shelton Street Covent Garden WC2H 9JQ London au Royaume-Uni recueille, utilise et traite les données à caractère personnel des utilisateurs recueillies sur le site Internet https://invest-malin.com (ci-après le « Site internet »), les formulaires électroniques et dans le cadre de l’exercice de son activité.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
              L’utilisateur du Site internet (ci-après « l’Utilisateur ») est informé des réglementations concernant la communication marketing, la Loi no2004-575 du 21 Juin 2014 pour la confiance dans l’économie numérique, la Loi n°2004-801 du 6 août 2004 relative à la protection des personnes physiques à l'égard des traitements de données à caractère personnel, et le Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des personnes physiques à l'égard du traitement des données à caractère personnel et à la libre circulation de ces données.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">2. Données collectées</h2>
              <h3 className="text-xl font-semibold text-black mb-3">2.1 Données d'identification</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
              Le traitement des données personnelles est assuré par CARDIN CONCIERGERIE LLP. Lors de votre inscription, nous collectons :
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
              Lorsque que des données personnelles sont nécessaires à la fourniture des services, ou au traitement des demandes de l’Utilisateur, le fait de ne pas les communiquer peut retarder, voire rendre impossible, le traitement de la demande, la réponse aux questions ainsi que la vente de services.
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
              <p className="text-gray-700 leading-relaxed mb-4">
              Certaines données de paiement seront également collectées en cas d’achat de services, à savoir notamment les données de facturation, le type ou le moyen de paiement, le numéro de carte de crédit ou de débit utilisée. Ces données ne sont pas collectées par CARDIN CONCIERGERIE LLP mais par la société Stripe Inc. (STRIPE FRANCE) à travers son module de paiement.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
              CARDIN CONCIERGERIE LLP peut également recueillir indirectement des données personnelles lorsque l’Utilisateur utilise le Site internet, à savoir notamment l’adresse IP, le moment de la connexion, le navigateur ou le système d’exploitation, par le biais de cookies similaires placés sur l’appareil électronique de l’Utilisateur.
              </p>
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
              CARDIN CONCIERGERIE LLP s’engage à prendre toutes les précautions nécessaires afin de préserver la sécurité des données personnelles et notamment qu’elles ne soient pas communiquées à des personnes non autorisées. Si un incident impactant l’intégrité ou la confidentialité des données personnelles est porté à la connaissance de CARDIN CONCIERGERIE LLP, elle s’engage à informer l’utilisateur dans les meilleurs délais et lui communiquer les mesures de corrections prises. Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, sauf dans les cas suivants:
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
              CARDIN CONCIERGERIE LLP peut conserver les données personnelles des Utilisateurs pendant deux années à compter du consentement des Utilisateurs ou jusqu’au retrait de leur consentement. En cas de relation commerciale, les données relatives aux services proposés par CARDIN CONCIERGERIE LLP sont conservées trois ans à compter de la fin des relations commerciales ou pour une durée supérieure lorsque CARDIN CONCIERGERIE LLP a une raison légitime ou légale de les conserver (notamment sans que cette liste soit exhaustive, les données relatives à la facturation). Nous conservons vos données personnelles pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées :
              </p>
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
              Conformément à la Loi n°78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés modifiées par la Loi n°2004-801 du 6 août 2004 relative à la protection des personnes physiques à l'égard des traitements de données à caractère personnel et les dispositions de la Loi du 20 juin 2018 adoptée en application du Règlement européen du 27 avril 2016 applicable depuis le 25 mai 2018, chaque Utilisateur dispose des droits suivants :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li><strong>Droit d'accès :</strong> chaque Utilisateur a le droit d’être informé, de façon concise, transparente, compréhensible et aisément accessible, de la façon dont ses données personnelles sont traitées. Il dispose également du droit d'obtenir la confirmation que ses données sont ou ne sont pas traitées, et, le cas échéant, l’accès à ces données et une copie desdites données.  </li>
                <li><strong>Droit de rectification :</strong> chaque Utilisateur a le droit d'obtenir la rectification de ses données et que ses données incomplètes soient complétées. </li>
                <li><strong>Droit à l'effacement/l'oubli :</strong> sous certaines conditions, chaque Utilisateur a le droit d'obtenir l’effacement de ses données.</li>
                <li><strong>Droit à la limitation du traitement :</strong> sous certaines conditions, chaque Utilisateur a le droit d’obtenir la limitation du traitement de ses données.</li>
                <li><strong>Droit à la portabilité :</strong> chaque Utilisateur dispose également du droit récupérer ses données dans un format structuré.</li>
                <li><strong>Droit d'opposition :</strong> chaque Utilisateur dispose également du droit de s’opposer, dans certaines conditions, au traitement de ses données à caractère personnel. Chaque Utilisateur peut également, à tout moment, s’opposer au traitement de ses données à des fins de prospection commerciale et retirer son consentement au traitement de ses données mis en œuvre à des fins de publicité comportementale, d’analyse de la navigation, et de mesures d’audience.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
              Pour savoir comment CARDIN CONCIERGERIE LLP utilise ses données personnelles et/ou exercer ses droits, l’Utilisateur doit adresser les demandes à CARDIN CONCIERGERIE LLP :
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>Par courrier à CARDIN CONCIERGERIE LLP 71-75 Shelton Street Covent Garden WC2H 9JQ London au Royaume-Uni</li>
              <li>Par email à contact@invest-malin.com</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
              Dans tous les cas, l’Utilisateur devra indiquer les données personnelles qu’il souhaiterait que CARDIN CONCIERGERIE LLP corrige, mette à jour ou supprime, en s’identifiant précisément avec une copie d’une pièce d’identité. Les demandes de suppression de données personnelles seront soumises aux obligations légales, notamment en matière de conservation ou d’archivage des documents. Enfin, l’Utilisateur peut déposer une réclamation auprès des autorités de contrôle, et notamment de la CNIL (https://www.cnil.fr/fr/plaintes). Il est enfin précisé que les Utilisateurs qui ne souhaitent pas faire l’objet de prospection commerciale par voie téléphonique peuvent s’inscrire gratuitement sur la liste d’opposition au démarchage téléphonique sur le site internet www.bloctel.gouv.fr.

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
                <a href="mailto:contact@invest-malin.fr" className="text-[#dbae61] hover:underline ml-1">contact@invest-malin.fr</a>
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