import { useState, useEffect, useRef } from 'react'
import {
  HelpCircle, X, Compass, Coins, ClipboardList, Wand2, Lock, LifeBuoy,
} from 'lucide-react'
import { useIsFicheLite } from '../hooks/useIsFicheLite'

// Bouton d'aide flottant du parcours Fiche Logement (concierges à crédits).
// Monté globalement dans App.jsx, mais rendu UNIQUEMENT pour ce parcours : le contenu
// parle de crédits, de verrouillage et d'agent annonce, il n'a rien à faire devant un
// utilisateur Mon Équipe IA (assistants / abonnement).
//
// L'aide vit dans une modale, PAS dans une route : toute nouvelle route est fermée par
// défaut à ce parcours (cf. FICHE_LITE_ALLOWED_PATHS dans ProtectedRoute).
//
// ⚠️ Contenu client. Chaque affirmation est vérifiable dans le code :
//   - coût / débit          → CreateFicheModal + RPC create_fiche_lite_with_debit
//   - solde, packs, historique → MesCredits, useCreditBalance
//   - sauvegarde auto        → FormContext (debounce) + bouton Enregistrer
//   - saisie vocale          → FicheCuisine2 (étape « Cuisine 2 »)
//   - agent annonce / PDF    → FicheFinalisation
//   - champs verrouillés     → lib/lockedFields.js (LOCKED_FIELD_PATHS)
// Ne rien y ajouter sans l'avoir vérifié côté code.

const SUPPORT_EMAIL = 'contact@invest-malin.com'

const TABS = [
  { id: 'parcours', label: 'Comment ça marche', icon: Compass },
  { id: 'credits', label: 'Crédits', icon: Coins },
  { id: 'formulaire', label: 'Le formulaire', icon: ClipboardList },
  { id: 'annonce', label: 'Annonce et PDF', icon: Wand2 },
  { id: 'verrou', label: 'Champs verrouillés', icon: Lock },
  { id: 'aide', label: "Besoin d'aide", icon: LifeBuoy },
]

/** Puce dorée + texte, la liste standard de cette aide. */
function Puce({ children }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#dbae61] shrink-0" />
      <span>{children}</span>
    </li>
  )
}

/** Étape numérotée du parcours. */
function Etape({ n, titre, children }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-7 h-7 rounded-full bg-[#dbae61] text-white text-sm font-semibold flex items-center justify-center">
        {n}
      </span>
      <div>
        <p className="font-semibold text-gray-900">{titre}</p>
        <p className="text-sm text-gray-600 mt-0.5">{children}</p>
      </div>
    </li>
  )
}

/** Encadré d'attention (doré, jamais rouge : rien ici n'est une erreur). */
function Encadre({ titre, children }) {
  return (
    <div className="bg-[#dbae61]/10 border border-[#dbae61]/40 rounded-xl p-4">
      {titre && <p className="font-semibold text-gray-900 mb-1.5">{titre}</p>}
      <div className="text-sm text-gray-700 space-y-2">{children}</div>
    </div>
  )
}

function Titre({ children }) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
}

function SousTitre({ children }) {
  return <h4 className="font-semibold text-gray-900 mt-6 mb-2">{children}</h4>
}

function ContenuOnglet({ id }) {
  switch (id) {
    case 'parcours':
      return (
        <div className="space-y-5">
          <Titre>Fiche Logement, de bout en bout</Titre>
          <p className="text-gray-700">
            Vous remplissez la fiche d'un logement, puis l'outil en tire deux choses : un PDF
            récapitulatif complet, et une annonce prête à publier sur Airbnb ou Booking.
          </p>

          <ol className="space-y-4 mt-2">
            <Etape n="1" titre="Achetez des crédits">
              Un crédit vaut un logement. Vous choisissez un pack depuis « Recharger mes crédits ».
            </Etape>
            <Etape n="2" titre="Créez la fiche">
              Depuis « Nouvelle Fiche », donnez-lui un nom pour la retrouver. Un crédit est utilisé
              à ce moment-là, et c'est le seul.
            </Etape>
            <Etape n="3" titre="Remplissez les 24 étapes">
              Du propriétaire jusqu'à la finalisation. Tout est enregistré au fur et à mesure : vous
              pouvez fermer et reprendre plus tard, autant de fois que nécessaire.
            </Etape>
            <Etape n="4" titre="Générez votre annonce">
              Sur la dernière étape, choisissez Airbnb ou Booking. L'annonce est rédigée à partir de
              ce que vous avez saisi.
            </Etape>
            <Etape n="5" titre="Générez le PDF de la fiche">
              Le récapitulatif complet du logement, téléchargé sur votre appareil.
            </Etape>
          </ol>

          <Encadre>
            <p>
              Rien ne vous oblige à tout faire d'un coup. Une fiche commencée vous attend dans
              « Mes Fiches Logement », vous la rouvrez avec « Modifier ».
            </p>
          </Encadre>
        </div>
      )

    case 'credits':
      return (
        <div className="space-y-4">
          <Titre>Ce que paie un crédit</Titre>
          <p className="text-gray-700">
            Créer une fiche coûte <strong>1 crédit</strong>. C'est le seul moment où vous êtes débité.
          </p>

          <SousTitre>Compris dans ce crédit, sans supplément</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>Remplir les 24 étapes de la fiche, sur autant de sessions que vous voulez.</Puce>
            <Puce>Générer votre annonce Airbnb <strong>et</strong> votre annonce Booking.</Puce>
            <Puce>Les régénérer autant de fois que vous le souhaitez.</Puce>
            <Puce>Télécharger le PDF de la fiche et le PDF de l'annonce, autant de fois que vous voulez.</Puce>
          </ul>

          <SousTitre>Voir votre solde</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>En haut de « Mes Fiches Logement », à côté du bouton « Nouvelle Fiche ».</Puce>
            <Puce>
              Sur la page « Recharger mes crédits », avec l'historique de vos 20 derniers mouvements
              (achats et fiches créées).
            </Puce>
          </ul>

          <SousTitre>Acheter des crédits</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>
              Cliquez sur « Recharger mes crédits », puis choisissez un pack. Plus le pack est grand,
              moins la fiche vous revient cher.
            </Puce>
            <Puce>Le paiement se fait par carte, sur une page de paiement sécurisée.</Puce>
            <Puce>
              Vous revenez ensuite automatiquement sur votre page crédits. Le solde se met à jour en
              quelques secondes ; s'il tarde, utilisez « Actualiser le solde ».
            </Puce>
            <Puce><strong>Vos crédits n'expirent jamais.</strong></Puce>
          </ul>

          <Encadre titre="Un crédit utilisé ne revient pas">
            <p>
              Si vous supprimez une fiche, le crédit qui a servi à la créer n'est pas recrédité.
              Pour simplement faire de la place dans votre liste, préférez « Archiver ».
            </p>
          </Encadre>
        </div>
      )

    case 'formulaire':
      return (
        <div className="space-y-4">
          <Titre>Remplir la fiche</Titre>
          <p className="text-gray-700">
            La fiche compte 24 étapes, de « Propriétaire » à « Finalisation ». Vous les parcourez
            dans l'ordre que vous voulez.
          </p>

          <SousTitre>Naviguer</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>Sur ordinateur : le menu noir à gauche liste toutes les étapes, cliquez pour y aller.</Puce>
            <Puce>Sur téléphone : le bouton menu en haut à gauche ouvre la même liste.</Puce>
            <Puce>En bas de chaque étape : « Retour » et « Suivant ».</Puce>
            <Puce>
              Aucun champ n'est obligatoire pour avancer. Mais plus la fiche est complète, plus
              l'annonce générée sera juste et détaillée.
            </Puce>
          </ul>

          <SousTitre>Votre saisie est enregistrée toute seule</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>
              Quelques secondes après que vous avez arrêté de taper, la fiche est enregistrée
              automatiquement. Un bandeau vert « Sauvegardé avec succès » vous le confirme.
            </Puce>
            <Puce>
              Le bouton « Enregistrer », en bas de chaque étape, force la sauvegarde immédiatement.
              Pratique avant de fermer votre téléphone ou de changer de logement.
            </Puce>
            <Puce>
              Pour reprendre plus tard : retournez dans « Mes Fiches Logement » et cliquez sur
              « Modifier » sur la fiche concernée. Vous retrouvez tout.
            </Puce>
          </ul>

          <SousTitre>La saisie vocale (étape « Cuisine 2 »)</SousTitre>
          <p className="text-gray-700">
            Pour l'inventaire des ustensiles, vous pouvez parler au lieu de tout cocher à la main.
          </p>
          <ul className="space-y-2 text-gray-700">
            <Puce>Autorisez l'accès au micro quand votre navigateur le demande.</Puce>
            <Puce>
              Maintenez le bouton enfoncé et énumérez naturellement : « j'ai 4 assiettes plates,
              2 bols, une cocotte-minute… ». Relâchez pour envoyer.
            </Puce>
            <Puce>
              Vous pouvez le faire en plusieurs fois : à chaque enregistrement, ce qui est détecté
              s'ajoute à ce que vous aviez déjà.
            </Puce>
            <Puce>Vous pouvez aussi envoyer un fichier audio au lieu d'enregistrer en direct.</Puce>
            <Puce>Les quantités se remplissent juste en dessous, et restent modifiables à la main.</Puce>
          </ul>

          <SousTitre>Les photos</SousTitre>
          <p className="text-gray-700">
            La fiche ne stocke pas de photos. Certaines étapes affichent un rappel avec une case à
            cocher, pour que vous n'oubliiez pas de photographier un élément pendant votre visite
            (boîte à clés, digicode, interphone, jeux de clés…). Vous cochez la case une fois la
            photo prise ; elle reste sur votre téléphone.
          </p>

          <SousTitre>Brouillon, Complété, Archivé</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>Une fiche neuve est en <strong>Brouillon</strong>.</Puce>
            <Puce>
              Le bouton « Finaliser la fiche », sur la dernière étape, la passe en
              <strong> Complété</strong>. Elle reste consultable et modifiable après.
            </Puce>
            <Puce>
              <strong>Archiver</strong> masque une fiche de votre liste sans rien supprimer. C'est
              réversible à tout moment avec « Désarchiver ».
            </Puce>
          </ul>
        </div>
      )

    case 'annonce':
      return (
        <div className="space-y-4">
          <Titre>Votre annonce et vos PDF</Titre>
          <p className="text-gray-700">
            Tout se passe sur la dernière étape de la fiche, « Finalisation ».
          </p>

          <SousTitre>L'agent annonce</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>
              Choisissez la plateforme, <strong>Airbnb</strong> ou <strong>Booking</strong>, puis
              cliquez sur « Générer l'annonce ». Comptez 20 à 30 secondes.
            </Puce>
            <Puce>
              L'agent écrit à partir de ce que vous avez saisi dans la fiche et de la localisation du
              logement (commerces, transports, distances). Il n'invente pas d'information.
            </Puce>
            <Puce>
              Pour Airbnb, il produit des propositions de titre, la description, et les rubriques
              « le logement », « accès des voyageurs », « le quartier », « comment se déplacer »,
              ainsi que les mentions réglementaires.
            </Puce>
            <Puce>
              Pour Booking, il produit le nom de l'hébergement et les champs « à propos » (logement,
              quartier, hôte). La grande description, elle, est rédigée par Booking.
            </Puce>
            <Puce>
              Les deux plateformes sont indépendantes : votre annonce Airbnb et votre annonce Booking
              sont conservées chacune de leur côté, et vous les retrouvez en revenant sur la page.
            </Puce>
            <Puce>
              « Afficher l'annonce » vous la montre à l'écran, « Télécharger le PDF » l'enregistre
              sur votre appareil.
            </Puce>
          </ul>

          <Encadre titre="Complétez la fiche avant de générer">
            <p>
              Chaque génération part de la version enregistrée de votre fiche : votre saisie est
              donc sauvegardée juste avant. Une fiche plus complète donne une meilleure annonce.
            </p>
            <p>
              Vous pouvez régénérer autant de fois que vous voulez, sans crédit supplémentaire. Le
              bouton devient alors « Régénérer l'annonce », et la nouvelle version remplace la
              précédente.
            </p>
          </Encadre>

          <SousTitre>Le PDF de la fiche</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>
              Le bouton « Générer la Fiche Logement (PDF) » produit le récapitulatif complet du
              logement et le télécharge.
            </Puce>
            <Puce>
              Juste après, le bouton affiche « PDF Généré » et n'est plus cliquable, le temps que
              vous restez sur cette page. Pour en produire un nouveau, allez sur une autre étape et
              revenez sur « Finalisation » : le bouton est de nouveau actif.
            </Puce>
            <Puce>
              Vous pouvez le refaire autant de fois que vous voulez, sans crédit supplémentaire.
            </Puce>
          </ul>

          <Encadre titre="La première génération verrouille une partie de la fiche">
            <p>
              Avant votre tout premier PDF, un message vous prévient et vous pouvez encore annuler.
              Voir l'onglet « Champs verrouillés ».
            </p>
          </Encadre>
        </div>
      )

    case 'verrou':
      return (
        <div className="space-y-4">
          <Titre>Ce qui se fige après le premier PDF</Titre>
          <p className="text-gray-700">
            Une fiche correspond à un logement, et un crédit couvre ce logement. Pour éviter qu'une
            même fiche serve à plusieurs biens, les informations qui identifient le logement sont
            verrouillées dès que vous générez le PDF de la fiche pour la première fois.
          </p>

          <Encadre titre="Vous êtes prévenu avant">
            <p>
              Au premier clic sur « Générer la Fiche Logement (PDF) », un message récapitule ce qui
              va être figé. Vous pouvez annuler, corriger, et revenir générer ensuite.
            </p>
          </Encadre>

          <SousTitre>Ce qui devient non modifiable</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>Le nom et le prénom du propriétaire.</Puce>
            <Puce>L'adresse du logement : rue, complément, ville, code postal.</Puce>
            <Puce>Le type de propriété, la surface, la typologie et le type de niveau.</Puce>
            <Puce>
              Pour un appartement ou un studio : le nom de la résidence, le bâtiment, l'étage et le
              numéro de porte.
            </Puce>
          </ul>
          <p className="text-sm text-gray-600">
            Ces champs restent visibles, simplement grisés, et un message vous le rappelle en haut
            des étapes concernées.
          </p>

          <SousTitre>Ce qui reste modifiable, sans limite</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>
              Tout le reste : coordonnées de contact, capacité d'accueil, clés et accès, équipements,
              linge, consommables, réglementation, précisions de chaque pièce…
            </Puce>
            <Puce>
              Et vous continuez à générer vos annonces et vos PDF autant de fois que vous voulez.
            </Puce>
          </ul>

          <SousTitre>Avant de générer votre premier PDF</SousTitre>
          <p className="text-gray-700">
            Prenez trente secondes pour relire les étapes « Propriétaire » et « Logement ». C'est le
            bon moment pour corriger une adresse ou une surface.
          </p>

          <Encadre titre="Vous avez fait une faute de frappe ?">
            <p>
              Si une information verrouillée est erronée, ne recréez pas une fiche tout de suite :
              écrivez-nous à <strong>{SUPPORT_EMAIL}</strong> en indiquant le nom de la fiche et ce
              qu'il faut corriger. Nous verrons ensemble comment débloquer la situation.
            </p>
          </Encadre>
        </div>
      )

    case 'aide':
      return (
        <div className="space-y-4">
          <Titre>Gérer vos fiches et nous joindre</Titre>

          <SousTitre>Supprimer une fiche</SousTitre>
          <ul className="space-y-2 text-gray-700">
            <Puce>
              Depuis « Mes Fiches Logement », ouvrez le bouton à trois points en haut à droite de la
              fiche, puis « Supprimer ». Une confirmation vous demande de valider.
            </Puce>
            <Puce>
              <strong>La suppression est définitive</strong> : la fiche, son contenu et les annonces
              générées disparaissent, et le crédit utilisé pour la créer n'est pas recrédité.
            </Puce>
            <Puce>
              Si vous voulez juste alléger votre liste, utilisez « Archiver » : la fiche est masquée
              mais conservée, et « Désarchiver » la fait revenir.
            </Puce>
          </ul>

          <SousTitre>Un problème, une question ?</SousTitre>
          <p className="text-gray-700">
            Écrivez-nous à <strong>{SUPPORT_EMAIL}</strong>.
          </p>
          <p className="text-gray-700">Pour que nous puissions vous aider vite, précisez :</p>
          <ul className="space-y-2 text-gray-700">
            <Puce>le nom de la fiche concernée ;</Puce>
            <Puce>l'étape où vous étiez et ce que vous essayiez de faire ;</Puce>
            <Puce>le message affiché à l'écran, si vous en avez vu un (une capture aide beaucoup) ;</Puce>
            <Puce>l'appareil utilisé : ordinateur ou téléphone, et quel navigateur.</Puce>
          </ul>

          <Encadre titre="Un réflexe qui règle beaucoup de choses">
            <p>
              Si une page se fige ou n'affiche pas ce que vous attendez, rechargez-la. Votre saisie
              enregistrée est conservée, vous ne perdez rien.
            </p>
          </Encadre>
        </div>
      )

    default:
      return null
  }
}

export default function FicheLiteHelpButton() {
  const isFicheLite = useIsFicheLite()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(TABS[0].id)

  const openerRef = useRef(null) // bouton flottant, à qui le focus est rendu à la fermeture
  const panelRef = useRef(null)  // panneau de la modale, périmètre du piège à focus
  const closeRef = useRef(null)  // bouton « fermer », qui reçoit le focus à l'ouverture

  // Le gate de rôle peut se refermer alors que la modale est ouverte (déconnexion depuis
  // un autre onglet, session expirée, profil devenu illisible). On referme explicitement :
  // sinon le composant ne rend plus rien MAIS `isOpen` resterait vrai, le verrou de scroll
  // posé sur <body> ne serait jamais relâché (page entière non défilable), et la modale
  // resurgirait toute seule si le rôle repassait à true.
  useEffect(() => {
    if (!isFicheLite) setIsOpen(false)
  }, [isFicheLite])

  // Échap ferme, le scroll de la page derrière est gelé, et le focus clavier est confiné
  // à la modale. `aria-modal="true"` affirme que le reste de la page est inerte : sans
  // piège à focus, un utilisateur au clavier tabulerait vers des contrôles situés derrière
  // l'overlay, que le lecteur d'écran annonce pourtant comme inaccessibles.
  useEffect(() => {
    if (!isOpen) return

    const opener = openerRef.current
    closeRef.current?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') { setIsOpen(false); return }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = panel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
      // Focus rendu au bouton flottant. `isConnected` : quand la fermeture vient du gate
      // de rôle, le bouton est déjà démonté — on ne tente pas de focaliser un nœud détaché.
      if (opener?.isConnected) opener.focus()
    }
  }, [isOpen])

  if (!isFicheLite) return null

  return (
    <>
      {/* Bouton flottant. Les écrans du parcours réservent la place correspondante en bas
          de page (cf. NavigationButtons, FicheFinalisation, Dashboard, MesCredits) pour ne
          jamais recouvrir « Suivant », « Finaliser » ou le menu d'une fiche sur mobile.
          z-30 : sous l'overlay du menu de sections mobile (z-40), qui doit donc bien
          recouvrir le bouton quand il est ouvert. */}
      <button
        ref={openerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Aide : comment ça marche"
        title="Comment ça marche ?"
        className="fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-[#dbae61] hover:bg-[#c49a4f] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="aide-fiche-titre"
            className="bg-white w-full sm:max-w-3xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 bg-[#dbae61] bg-opacity-15 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-[#dbae61]" />
                </div>
                <div className="min-w-0">
                  <h2 id="aide-fiche-titre" className="text-lg font-bold text-gray-900 truncate">
                    Comment ça marche ?
                  </h2>
                  <p className="text-sm text-gray-500 truncate">Guide d'utilisation de Fiche Logement</p>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer l'aide"
                className="shrink-0 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Onglets — défilables horizontalement sur mobile */}
            <div className="border-b border-gray-200 px-5 sm:px-6 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const actif = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        actif
                          ? 'border-[#dbae61] text-[#a07c32]'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6">
              <ContenuOnglet id={activeTab} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
