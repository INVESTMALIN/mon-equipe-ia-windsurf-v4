import { Link, useNavigate } from 'react-router-dom'

// Conditions générales de vente des packs de crédits Fiche Logement.
//
// Version et date d'entrée en vigueur ÉCRITES EN DUR, volontairement.
// Les autres pages légales affichaient `new Date()`, donc la date du jour de
// consultation : un document qui se re-date tout seul à chaque visite ne prouve rien.
// Une version figée permet de dire quelle rédaction s'appliquait à une commande donnée
// (article 17). Toute modification de fond du texte ci-dessous doit s'accompagner d'un
// changement de ces deux constantes.
const CGV_VERSION = '1.0'
const CGV_DATE = '10 septembre 2026'

// Adresse de contact unique du document. `invest-malin.com` est le seul domaine du
// groupe qui reçoive réellement du courrier (enregistrement MX Google Workspace) :
// `invest-malin.fr` et `mon-equipe-ia.com` n'en ont aucun.
const CONTACT = 'contact@invest-malin.com'

function Article({ titre, children }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-black mb-4">{titre}</h2>
      <div className="text-gray-700 leading-relaxed space-y-4">{children}</div>
    </section>
  )
}

function Mail() {
  return (
    <a href={`mailto:${CONTACT}`} className="text-[#dbae61] hover:underline">
      {CONTACT}
    </a>
  )
}

export default function ConditionsVente() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <header className="bg-white shadow-sm px-6 md:px-20 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/invest-malin-logo.png" alt="Invest Malin Logo" className="h-8" />
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
          <h1 className="text-4xl font-bold text-black mb-2">
            Conditions générales de vente
          </h1>
          <p className="text-gray-600 mb-8">
            Packs de crédits Fiche Logement — version {CGV_VERSION}, en vigueur le {CGV_DATE}.
          </p>

          <div className="prose prose-lg max-w-none space-y-8">

            <Article titre="Article 1 — Vendeur">
              <p>
                Le service est édité et commercialisé par CARDIN CONCIERGERIE LLC, société de
                droit de l’État du Nouveau-Mexique (États-Unis), Business ID 0008077608, dont le
                siège est situé 412 W 7th St, Clovis, NM 88101, États-Unis, ci-après « le Vendeur ».
              </p>
              <p>
                Le Vendeur exploite la marque Invest Malin et la plateforme Mon Équipe IA,
                accessible à l’adresse mon-equipe-ia.com.
              </p>
              <p>
                Contact : <Mail />
              </p>
            </Article>

            <Article titre="Article 2 — Objet et champ d’application">
              <p>
                Les présentes conditions régissent la vente de packs de crédits permettant
                d’utiliser le service Fiche Logement, entre le Vendeur et toute personne qui
                achète ces crédits, ci-après « le Client ».
              </p>
              <p>
                Fiche Logement est accessible de deux manières distinctes : dans le cadre de
                l’abonnement Mon Équipe IA, pendant la durée de cet abonnement, ou par l’achat de
                crédits, sans abonnement. Les présentes conditions ne régissent que l’achat de
                crédits. L’abonnement relève de conditions propres.
              </p>
              <p>
                L’utilisation de la plateforme reste régie par les{' '}
                <Link to="/conditions-utilisation" className="text-[#dbae61] hover:underline">
                  conditions générales d’utilisation
                </Link>
                , que les présentes conditions complètent. En cas de contradiction sur un point
                relatif à la vente, les présentes conditions prévalent.
              </p>
            </Article>

            <Article titre="Article 3 — Définitions">
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Crédit</strong> : unité prépayée permettant de créer une Fiche.</li>
                <li>
                  <strong>Fiche</strong> : dossier structuré décrivant un logement, créé et
                  complété par le Client depuis son compte.
                </li>
                <li>
                  <strong>Livrables</strong> : le PDF de la Fiche, les annonces générées pour les
                  plateformes de location, et le guide d’accès.
                </li>
                <li>
                  <strong>Client consommateur</strong> : personne physique qui agit à des fins
                  n’entrant pas dans le cadre de son activité commerciale, industrielle,
                  artisanale, libérale ou agricole.
                </li>
                <li><strong>Client professionnel</strong> : tout autre Client.</li>
              </ul>
            </Article>

            <Article titre="Article 4 — Description du service">
              <p>
                Un crédit permet de créer une Fiche. Depuis cette Fiche, le Client peut générer les
                Livrables et les régénérer sans débit de crédit supplémentaire.
              </p>
              <p>
                Le PDF est produit dans le navigateur du Client et lui est remis en téléchargement.
                Le Vendeur n’en conserve pas de copie sur ses serveurs. Il appartient au Client de
                l’enregistrer.
              </p>
              <p>
                La génération des annonces et du guide d’accès repose sur des prestataires
                techniques tiers. Leur indisponibilité temporaire peut retarder une génération.
              </p>
              <p>
                Pour générer un guide d’accès, le Client téléverse un média. Ce média est transmis
                à un prestataire de traitement et n’est pas conservé par le Vendeur. Une nouvelle
                génération suppose donc de téléverser à nouveau le média.
              </p>
              <p>
                Les contenus générés sont des propositions rédactionnelles produites
                automatiquement. Le Client reste responsable de leur relecture et de leur
                conformité avant toute publication ou diffusion. Le Vendeur ne garantit aucun
                résultat commercial.
              </p>
            </Article>

            <Article titre="Article 5 — Prix">
              <p>
                Les prix sont exprimés en euros et affichés sur la{' '}
                <Link to="/fiche-logement/tarifs" className="text-[#dbae61] hover:underline">
                  page tarifaire
                </Link>{' '}
                ainsi que dans l’espace d’achat avant validation de la commande.
              </p>
              <p>Les packs proposés sont :</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>1 crédit pour 5 €</li>
                <li>10 crédits pour 25 €</li>
                <li>20 crédits pour 40 €</li>
                <li>50 crédits pour 50 €</li>
              </ul>
              <p>TVA non applicable.</p>
              <p>
                Le prix applicable est celui affiché au moment de la commande. Le Vendeur peut
                modifier ses prix à tout moment ; la modification est sans effet sur les commandes
                déjà passées et sur les crédits déjà acquis.
              </p>
            </Article>

            <Article titre="Article 6 — Commande et paiement">
              <p>
                La commande suppose la création préalable d’un compte. Le Client sélectionne un
                pack depuis son espace de crédits, puis est redirigé vers la page de paiement.
              </p>
              <p>
                Le paiement s’effectue par carte bancaire, en une fois, au moment de la commande,
                via le prestataire de paiement Stripe. Le Vendeur n’a accès à aucune donnée de
                carte bancaire et n’en conserve aucune.
              </p>
              <p>
                Le contrat est formé à l’encaissement du paiement. Les crédits sont ajoutés au
                compte du Client dès confirmation du paiement, et le mouvement correspondant
                apparaît dans l’historique de son espace de crédits.
              </p>
            </Article>

            <Article titre="Article 7 — Facture">
              <p>
                Une facture est établie pour chaque commande et mise à disposition du Client depuis
                son espace de crédits. Sa mise à disposition peut intervenir avec un délai après le
                paiement. À défaut, le Client peut la demander à l’adresse de contact indiquée à
                l’article 1.
              </p>
            </Article>

            <Article titre="Article 8 — Utilisation des crédits">
              <p>
                <strong>Débit.</strong> Un crédit est débité à la création d’une Fiche. C’est le
                seul moment où le Client est débité : compléter une Fiche, générer ou régénérer un
                Livrable n’entraîne aucun débit supplémentaire.
              </p>
              <p>
                <strong>Durée de validité.</strong> Les crédits ne sont soumis à aucune date
                d’expiration.
              </p>
              <p>
                <strong>Suppression d’une Fiche.</strong> Le Client peut supprimer une Fiche à tout
                moment. La suppression est définitive et le crédit utilisé pour la créer n’est pas
                restitué. Pour retirer une Fiche de sa liste sans la détruire, le Client dispose de
                la fonction d’archivage.
              </p>
              <p>
                <strong>Verrouillage.</strong> À la première génération du PDF d’une Fiche, et
                après confirmation par le Client, les informations suivantes sont figées : prénom
                et nom du propriétaire, rue, complément d’adresse, ville et code postal du bien,
                type de propriété et sa précision éventuelle, surface, typologie, nombre de
                niveaux pour une maison, et le cas échéant nom de résidence, bâtiment, étage et
                numéro de porte. Les autres informations restent modifiables, y compris le pays. Ce verrouillage ne peut être levé que par le Vendeur, sur
                demande motivée. Pour établir une Fiche portant sur un autre bien, le Client crée
                une nouvelle Fiche, ce qui débite un crédit.
              </p>
              <p>
                <strong>Non-transférabilité.</strong> Les crédits sont attachés au compte du
                Client. Ils ne sont ni cessibles, ni échangeables, ni convertibles en argent, sous
                réserve des articles 9, 10 et 14.
              </p>
            </Article>

            <Article titre="Article 9 — Droit de rétractation du Client consommateur">
              <p>
                <strong>9.1 Nature du contrat.</strong> Le service fourni est un service numérique :
                il permet au Client de créer, de traiter et de stocker des données sous forme
                numérique. Le contrat ne porte pas sur la fourniture d’un contenu numérique livré
                une fois pour toutes.
              </p>
              <p>
                <strong>9.2 Principe.</strong> Le Client consommateur dispose d’un délai de
                quatorze jours à compter de la conclusion du contrat pour se rétracter, sans avoir
                à motiver sa décision.
              </p>
              <p>
                <strong>9.3 Utilisation des crédits pendant le délai.</strong> Les crédits sont
                disponibles dès l’encaissement du paiement et le Client peut les utiliser
                immédiatement. Le Vendeur ne recueille pas de demande expresse d’exécution du
                contrat avant la fin du délai de rétractation. En conséquence, le Client
                consommateur qui se rétracte ne doit au Vendeur aucune somme au titre des crédits
                qu’il a déjà utilisés.
              </p>
              <p>
                <strong>9.4 Effets de la rétractation.</strong> Le prix du pack est remboursé
                intégralement, y compris pour les crédits déjà utilisés. Le remboursement
                intervient au plus tard quatorze jours après réception de la demande, par le même
                moyen de paiement que celui utilisé pour la commande.
              </p>
              <p>
                <strong>9.5 Modalités d’exercice.</strong> Le Client exerce son droit de
                rétractation au moyen du formulaire type figurant en annexe, ou par toute autre
                déclaration dénuée d’ambiguïté adressée à <Mail />.
              </p>
            </Article>

            <Article titre="Article 10 — Remboursement en dehors du droit de rétractation">
              <p>
                En dehors des cas prévus à l’article 9, le Vendeur rembourse, sur demande adressée
                à l’adresse de contact indiquée à l’article 1, un pack dont aucun crédit n’a été
                utilisé.
              </p>
              <p>
                Le solde de crédits du compte fait foi : un pack est réputé non utilisé lorsque le
                solde disponible au moment de la demande est au moins égal au nombre de crédits de
                ce pack. Aucun remboursement n’est accordé au-delà de ce solde. Le Client qui
                détient plusieurs packs n’a donc pas à établir de quel pack proviennent les crédits
                qu’il a consommés.
              </p>
              <p>
                Cette politique commerciale s’applique sous réserve des droits que le Client tient
                de la loi, notamment au titre des articles 9 et 11.
              </p>
            </Article>

            <Article titre="Article 11 — Garantie légale de conformité">
              <p>
                Le Client consommateur bénéficie de la garantie légale de conformité applicable aux
                services numériques. En cas de défaut de conformité, il peut exiger la mise en
                conformité du service et, à défaut, obtenir une réduction du prix ou la résolution
                du contrat, dans les conditions prévues par la loi.
              </p>
              <p>
                Le Client professionnel dispose des garanties prévues par le droit commun.
              </p>
              <p>Toute demande est adressée à l’adresse de contact indiquée à l’article 1.</p>
            </Article>

            <Article titre="Article 12 — Disponibilité du service">
              <p>
                Le Vendeur met en œuvre les moyens raisonnables pour assurer la disponibilité du
                service, sans s’engager sur un taux de disponibilité déterminé. Le service peut
                être interrompu pour maintenance ou en raison de l’indisponibilité d’un prestataire
                technique tiers.
              </p>
              <p>
                Une interruption n’entraîne par elle-même aucun débit de crédit. Le Vendeur ne
                garantit pas l’absence de perte de données : il appartient au Client de conserver
                une copie des Livrables qu’il télécharge.
              </p>
              <p>
                Si une interruption prolongée empêche durablement le Client d’utiliser ses crédits,
                celui-ci peut en demander le remboursement.
              </p>
            </Article>

            <Article titre="Article 13 — Contenus du Client et Livrables">
              <p>
                Le Client reste titulaire des informations qu’il saisit dans ses Fiches et des
                médias qu’il téléverse. Il garantit disposer du droit de les utiliser, notamment
                lorsqu’ils concernent un bien ou une personne tiers.
              </p>
              <p>
                Le Client accorde au Vendeur le droit d’héberger et de traiter ces contenus, ainsi
                que de les transmettre à ses prestataires techniques, dans la seule mesure
                nécessaire à la fourniture du service.
              </p>
              <p>
                Les Livrables générés depuis une Fiche appartiennent au Client, qui peut les
                utiliser, les modifier et les diffuser librement.
              </p>
            </Article>

            <Article titre="Article 14 — Compte et clôture">
              <p>
                Le Client peut demander la clôture de son compte à l’adresse de contact indiquée à
                l’article 1. La clôture entraîne la suppression des Fiches enregistrées.
              </p>
              <p>
                Les crédits non utilisés sont remboursés sur demande formulée lors de la clôture,
                dans les conditions prévues à l’article 10.
              </p>
              <p>
                Le Vendeur peut suspendre ou clôturer un compte en cas de manquement grave aux
                présentes conditions ou aux conditions générales d’utilisation, après information
                du Client et, sauf urgence ou manquement rendant la poursuite de la relation
                impossible, mise en demeure restée sans effet. Les crédits non consommés sont alors
                remboursés, sauf fraude.
              </p>
            </Article>

            <Article titre="Article 15 — Responsabilité">
              <p>
                Le Vendeur répond des dommages causés au Client résultant d’un manquement à ses
                obligations contractuelles.
              </p>
              <p>
                À l’égard d’un Client professionnel, la responsabilité du Vendeur est limitée au
                montant des sommes versées par ce Client au cours des douze mois précédant le fait
                générateur, et le Vendeur ne répond pas des dommages indirects tels qu’une perte
                d’exploitation ou un manque à gagner.
              </p>
              <p>
                Ces limitations ne s’appliquent ni au Client consommateur, ni en cas de faute
                lourde ou dolosive, ni dans les cas où la loi les écarte.
              </p>
              <p>
                Le Client demeure responsable de l’exactitude des informations qu’il saisit et du
                contrôle des contenus générés avant leur diffusion.
              </p>
            </Article>

            <Article titre="Article 16 — Données personnelles">
              <p>
                Les traitements de données personnelles réalisés dans le cadre de la vente et de
                l’utilisation du service sont décrits dans la{' '}
                <Link to="/politique-confidentialite" className="text-[#dbae61] hover:underline">
                  politique de confidentialité
                </Link>{' '}
                accessible sur le site.
              </p>
            </Article>

            <Article titre="Article 17 — Modification des conditions">
              <p>
                Le Vendeur peut modifier les présentes conditions. La version applicable à une
                commande est celle en vigueur au jour de cette commande, et elle continue de régir
                cette commande après toute modification ultérieure. Une nouvelle version ne
                s’applique pas rétroactivement à une commande antérieure et ne peut pas réduire les
                droits que le Client en tire.
              </p>
            </Article>

            <Article titre="Article 18 — Réclamation">
              <p>
                Toute réclamation est adressée à <Mail />. Le Vendeur s’efforce d’y répondre dans
                un délai raisonnable.
              </p>
            </Article>

            <Article titre="Article 19 — Droit applicable et litiges">
              <p>Les présentes conditions sont régies par le droit français.</p>
              <p>
                Le Client consommateur résidant dans un État membre de l’Union européenne conserve
                en tout état de cause le bénéfice des dispositions impératives protectrices de la
                loi de son pays de résidence habituelle, et peut porter son action devant la
                juridiction de son domicile.
              </p>
              <p>
                Pour un Client professionnel, tout litige relève de la compétence des tribunaux
                français compétents.
              </p>
            </Article>

            <Article titre="Annexe — Formulaire type de rétractation">
              <p className="italic">
                À compléter et renvoyer uniquement si vous souhaitez vous rétracter.
              </p>
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-3">
                <p>
                  À l’attention de CARDIN CONCIERGERIE LLC, 412 W 7th St, Clovis, NM 88101,
                  États-Unis, <Mail /> :
                </p>
                <p>
                  Je vous notifie par la présente ma rétractation du contrat portant sur l’achat du
                  pack de crédits ci-dessous.
                </p>
                <p>
                  Commandé le : …<br />
                  Numéro de commande : …<br />
                  Nom du Client : …<br />
                  Adresse du Client : …<br />
                  Date : …<br />
                  Signature (uniquement en cas de notification sur papier) : …
                </p>
              </div>
            </Article>

          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Version {CGV_VERSION} — en vigueur le {CGV_DATE}.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 px-6 md:px-20 text-sm text-gray-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 Mon Équipe IA. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-gray-700">Accueil</Link>
            <Link to="/mentions-legales" className="hover:text-gray-700">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-gray-700">Confidentialité</Link>
            <Link to="/conditions-utilisation" className="hover:text-gray-700">Conditions d’utilisation</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
