import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getUserFiches, getFichesAvecAnnonce, setFicheArchived } from '../lib/supabaseHelpers'
import { FICHE_STATUS_FILTERS, matchesFicheFilter } from '../lib/ficheFilters'
import { useCreditBalance } from '../hooks/useCreditBalance'
import { 
  FileText, 
  ArrowLeft, 
  Search, 
  Grid3X3, 
  List, 
  Edit,
  Archive,
  ArchiveRestore,
  Trash2,
  MoreVertical,
  Calendar,
  Clock,
  CreditCard,
  Coins,
  LogOut
} from 'lucide-react'
import { EtatEditionIcone, BadgesLivrables } from './fiche/LivrablesBadges'
import CreateFicheModal from './fiche/CreateFicheModal'
import DeleteFicheModal from './fiche/DeleteFicheModal'

// Famille visuelle unique des actions de l'en-tête : même hauteur, même arrondi,
// même graisse, mêmes icônes. Seul le remplissage porte la hiérarchie (doré plein
// pour l'action principale, contour pour les secondaires).
const ACTION_BASE =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors'
const ACTION_SECONDARY =
  `${ACTION_BASE} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900`

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [fiches, setFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("Tous")
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'list'
  const [showDropdown, setShowDropdown] = useState(null)
  // Fiches disposant d'une annonce exploitable. Chargé en UNE requête pour toute
  // la liste (cf. getFichesAvecAnnonce), jamais une par carte.
  const [idsAvecAnnonce, setIdsAvecAnnonce] = useState(() => new Set())

  // Modales crédits (fiche_lite) : création payante + suppression.
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [ficheToDelete, setFicheToDelete] = useState(null)

  // Solde de crédits réel (hook partagé avec /mes-credits). Fetch uniquement pour un
  // rôle fiche_lite — le rôle n'est connu qu'après chargement du profil, l'appel se
  // déclenche donc quand `enabled` passe à true.
  const { balance: creditsBalance, refresh: refreshCredits } = useCreditBalance(userProfile?.role === 'fiche_lite')

  // Déconnexion du dashboard. Le bouton n'est rendu QUE pour le rôle fiche_lite
  // (cf. en-tête plus bas) : on le renvoie donc vers la connexion de SON univers.
  // Le repli /connexion couvre le cas où le bouton serait un jour rouvert à un
  // autre rôle.
  //
  // ⚠️ On navigue AVANT le signOut, volontairement. ProtectedRoute écoute
  // `SIGNED_OUT` et redirige de son côté vers /connexion : en signant d'abord, sa
  // redirection partirait la première et le visiteur verrait passer la connexion
  // générique avant d'arriver ici. En quittant /dashboard d'abord, ProtectedRoute
  // est démonté et désabonné quand l'événement arrive, donc une seule redirection.
  const handleLogout = async () => {
    navigate(userProfile?.role === 'fiche_lite' ? '/connexion-fiche-logement' : '/connexion')
    await supabase.auth.signOut()
  }

  useEffect(() => {
    checkUserAndPremium()
  }, [])

  const checkUserAndPremium = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        navigate('/connexion')
        return
      }

      setUser(user)

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Erreur récupération profil:', profileError)
      } else {
        setUserProfile(profile)

        // Charger les fiches si l'utilisateur a accès (premium/trial concierge
        // OU rôle fiche_lite issu de la landing ThriveCart)
        if (
          profile?.subscription_status === 'premium' ||
          profile?.subscription_status === 'trial' ||
          profile?.role === 'fiche_lite'
        ) {
          await loadUserFiches(user.id)
        }
      }

    } catch (error) {
      console.error('Erreur auth:', error)
      navigate('/connexion')
    } finally {
      setLoading(false)
    }
  }

  const loadUserFiches = async (userId) => {
    try {
      const result = await getUserFiches(userId)
      if (!result.success) {
        console.error('Erreur chargement fiches:', result.error)
        return
      }
      setFiches(result.data)
      // Requête annexe : son échec ne doit jamais vider la liste des fiches, il
      // se traduit par une absence de badge « Annonce » (cf. helper).
      setIdsAvecAnnonce(await getFichesAvecAnnonce(result.data.map((f) => f.id)))
    } catch (error) {
      console.error('Erreur chargement fiches:', error)
    }
  }

  // Archiver / désarchiver : bascule l'horodatage `archived_at`. Le `statut` d'origine
  // (Brouillon / Complété) n'est jamais touché, la fiche reprend donc exactement sa place
  // au désarchivage. Réversible : pas de modale de confirmation.
  const handleToggleArchive = async (fiche) => {
    const result = await setFicheArchived(fiche.id, !fiche.archived_at)
    if (!result.success) {
      console.error('Erreur archivage:', result.error)
      return
    }
    if (user?.id) await loadUserFiches(user.id)
  }

  const handleMenuAction = (action, fiche) => {
    switch (action) {
      case 'edit':
        navigate(`/fiche?id=${fiche.id}`)
        break
      case 'archive':
        handleToggleArchive(fiche)
        break
      case 'delete':
        setFicheToDelete(fiche)
        break
    }
    setShowDropdown(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dbae61] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  const isFicheLite = userProfile?.role === 'fiche_lite'
  const hasAccess =
    userProfile?.subscription_status === 'premium' ||
    userProfile?.subscription_status === 'trial' ||
    isFicheLite

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-[#dbae61] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[#dbae61]" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Accès Premium Requis
            </h2>
            
            <p className="text-gray-600 mb-6">
              La fonctionnalité Fiche Logement est réservée aux membres Premium. 
              Passez à Premium pour accéder à vos fiches d'inspection professionnelles.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/upgrade')}
                className="w-full bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Passer à Premium
              </button>
              
              <button
                onClick={() => navigate('/assistants')}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux assistants
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filtrage (prédicat partagé avec les compteurs, cf. src/lib/ficheFilters.js)
  const statusFilters = FICHE_STATUS_FILTERS
  const filteredFiches = fiches.filter(fiche => {
    const matchesSearch = fiche.nom.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch && matchesFicheFilter(fiche, activeFilter)
  })

  // Couleurs des statuts
  const getStatusColor = (statut) => {
    switch (statut) {
      case "Complété": return "bg-green-100 text-green-800"
      case "Brouillon": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Compteur de chaque onglet : EXACTEMENT le même prédicat que l'affichage, donc
  // « Tous » exclut les archivées et le compteur reste cohérent avec ce qui est listé.
  const getFilterCount = (filter) => fiches.filter(f => matchesFicheFilter(f, filter)).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes fiches</h1>
              {/* Ligne d'état : le nombre de fiches, et pour fiche_lite le solde de
                  crédits juste à côté. Le solde était un encadré doré dans la barre
                  d'actions ; il vit mieux ici, en information, à côté de l'autre
                  compteur — la barre d'actions ne porte plus que des actions. */}
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-600">
                <span>
                  {filteredFiches.length} fiche{filteredFiches.length > 1 ? 's' : ''}
                </span>
                {isFicheLite ? (
                  <>
                    <span aria-hidden="true" className="text-gray-300">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#dbae61]" />
                      {creditsBalance ?? '—'} crédit{creditsBalance > 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <span>• Premium actif</span>
                )}
              </p>
            </div>

            {/* Barre d'actions. Une seule famille visuelle : même hauteur (h-11), même
                arrondi, mêmes icônes 16px. La hiérarchie passe par le remplissage —
                doré plein pour l'action principale, contour pour les secondaires —
                pas par des tailles différentes.
                Mobile : grille 2 colonnes, l'action principale sur toute la largeur
                et les secondaires côte à côte en dessous. Desktop : une seule rangée. */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
              <button
                onClick={() => (isFicheLite ? setShowCreateModal(true) : navigate('/fiche'))}
                className={`${ACTION_BASE} col-span-2 bg-[#dbae61] text-white hover:bg-[#c49a4f] sm:col-span-1 sm:px-5`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                Nouvelle fiche
                {isFicheLite && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-white bg-opacity-20 px-2 py-0.5 text-xs font-medium"
                    title="Créer une fiche coûte 1 crédit"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    1
                  </span>
                )}
              </button>

              {/* fiche_lite : accès à la page crédits. Concierge : retour assistants. */}
              {isFicheLite ? (
                <button onClick={() => navigate('/mes-credits')} className={ACTION_SECONDARY}>
                  <CreditCard className="w-4 h-4 shrink-0" />
                  Recharger
                </button>
              ) : (
                <button
                  onClick={() => navigate('/assistants')}
                  className={`${ACTION_SECONDARY} col-span-2 sm:col-span-1`}
                >
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  Retour
                </button>
              )}

              {/* Déconnexion réservée à fiche_lite : le dashboard est sa page d'accueil,
                  il n'a pas d'autre porte de sortie. Un concierge garde la sienne dans
                  /mon-compte, d'où l'absence du bouton ici pour Premium et Trial.
                  Libellé visible en mobile (la grille laisse la place), icône seule en
                  desktop pour ne pas alourdir la rangée — `aria-label` porte le nom
                  accessible dans les deux cas. */}
              {isFicheLite && (
                <button
                  onClick={handleLogout}
                  title="Se déconnecter"
                  aria-label="Se déconnecter"
                  className={`${ACTION_SECONDARY} sm:w-11 sm:px-0`}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="sm:hidden">Déconnexion</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal — pb-28 réserve la zone du bouton d'aide flottant (parcours
          Fiche Logement) pour qu'il ne recouvre pas le menu de la dernière fiche. */}
      <div className="max-w-6xl mx-auto px-6 py-8 pb-28">
        {/* Filtres et recherche */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Onglets de filtrage */}
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === filter
                      ? 'bg-[#dbae61] text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {filter}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeFilter === filter 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {getFilterCount(filter)}
                  </span>
                </button>
              ))}
            </div>

            {/* Barre de recherche et options d'affichage */}
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une fiche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                />
              </div>
              
              <div className="flex bg-white border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-[#dbae61]' : 'text-gray-400'}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-[#dbae61]' : 'text-gray-400'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vue Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFiches.map((fiche) => (
              // `h-full` + `flex-col` : la grille étire déjà les cartes d'une rangée à
              // la même hauteur, la carte propage cette hauteur à son contenu. C'est ce
              // qui permet d'afficher zéro, un ou trois badges sans réserver de zone
              // vide et sans imposer de hauteur fixe.
              <div key={fiche.id} className="flex h-full flex-col bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between mb-4 gap-2">
                    {/* `min-w-0` sur le conteneur ET `truncate` sur le titre : un nom
                        long est coupé au lieu de pousser l'icône hors de la carte. */}
                    <div className="flex min-w-0 items-center gap-1.5">
                      <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-[#dbae61] transition-colors cursor-pointer">
                        {fiche.nom}
                      </h3>
                      <EtatEditionIcone locked={!!fiche.fields_locked} />
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === fiche.id ? null : fiche.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {showDropdown === fiche.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => handleMenuAction('edit', fiche)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Edit size={16} />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleMenuAction('archive', fiche)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {fiche.archived_at ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                            {fiche.archived_at ? 'Désarchiver' : 'Archiver'}
                          </button>
                          <button
                            onClick={() => handleMenuAction('delete', fiche)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* `self-start` : la carte est un conteneur flex en colonne, donc
                      ses enfants sont étirés par défaut. Sans cela la pastille de
                      statut s'allongerait sur toute la largeur de la carte. */}
                  <span className={`self-start inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(fiche.statut)}`}>
                    {fiche.statut}
                  </span>
                  
                  {/* Informations supplémentaires */}
                  <div className="text-sm text-gray-500 space-y-1 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Créée le {new Date(fiche.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {fiche.updated_at !== fiche.created_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Modifiée le {new Date(fiche.updated_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Livrables : ligne distincte, séparée par un filet, collée en bas
                      de la carte par `mt-auto`. Sans livrable, le composant ne rend
                      RIEN — ni filet, ni ligne, ni hauteur réservée. Les cartes
                      restent alignées parce que la grille les étire, pas parce qu'on
                      leur ménage une place. */}
                  <BadgesLivrables
                    fiche={fiche}
                    idsAvecAnnonce={idsAvecAnnonce}
                    wrapperClassName="mt-auto border-t border-gray-100 pt-3"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vue List */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {filteredFiches.map((fiche, index) => (
              <div
                key={fiche.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  index !== filteredFiches.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* `min-w-0` + `truncate` : c'est le nom qui se coupe quand la
                        place manque, jamais l'icône d'état qui le suit. */}
                    <div className="flex min-w-0 items-center gap-1.5">
                      <h3 className="text-base font-semibold text-gray-900 truncate hover:text-[#dbae61] transition-colors">
                        {fiche.nom}
                      </h3>
                      <EtatEditionIcone locked={!!fiche.fields_locked} />
                    </div>

                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(fiche.statut)}`}>
                      {fiche.statut}
                    </span>

                    {/* `shrink-0` + `whitespace-nowrap` : quand la place manque, c'est
                        le nom qui se tronque, pas les dates qui passent sur deux
                        lignes — sinon la rangée grandit et rompt l'alignement de la
                        liste. */}
                    <div className="hidden sm:flex shrink-0 items-center gap-4 text-sm text-gray-500 whitespace-nowrap">
                      <span>Créée le {new Date(fiche.created_at).toLocaleDateString('fr-FR')}</span>
                      {fiche.updated_at !== fiche.created_at && (
                        <span>Modifiée le {new Date(fiche.updated_at).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>

                    {/* Desktop : les badges restent sur la ligne, à la suite des
                        dates, pour garder la lecture compacte de la vue liste.
                        `shrink-0` les protège du rétrécissement, c'est le nom qui
                        cède la place. */}
                    <BadgesLivrables
                      fiche={fiche}
                      idsAvecAnnonce={idsAvecAnnonce}
                      className="hidden shrink-0 sm:flex"
                    />
                  </div>
                  
                  {/* Menu contextuel */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === fiche.id ? null : fiche.id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {showDropdown === fiche.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => handleMenuAction('edit', fiche)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Edit size={16} />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleMenuAction('archive', fiche)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {fiche.archived_at ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                          {fiche.archived_at ? 'Désarchiver' : 'Archiver'}
                        </button>
                        <button
                          onClick={() => handleMenuAction('delete', fiche)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile : la ligne est déjà occupée par le nom, le statut et le
                    menu. Les badges passent en dessous et peuvent revenir à la
                    ligne entre eux. Sans livrable, rien n'est rendu — la rangée
                    garde exactement sa hauteur d'origine. */}
                <BadgesLivrables
                  fiche={fiche}
                  idsAvecAnnonce={idsAvecAnnonce}
                  className="sm:hidden"
                  wrapperClassName="mt-2 sm:hidden"
                />
              </div>
            ))}
          </div>
        )}

        {/* Message si aucune fiche */}
        {filteredFiches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Aucune fiche trouvée</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm ? 'Essayez de modifier votre recherche' : 'Créez votre première fiche pour commencer'}
            </p>
          </div>
        )}
      </div>

      {/* Click outside pour fermer dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDropdown(null)}
        />
      )}

      {/* Modale de création payante (fiche_lite) — création + débit atomiques via RPC */}
      <CreateFicheModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        balance={creditsBalance}
        onDebited={refreshCredits}
      />

      {/* Modale de suppression — ne touche jamais au ledger (aucun remboursement) */}
      <DeleteFicheModal
        isOpen={!!ficheToDelete}
        fiche={ficheToDelete}
        showCreditWarning={isFicheLite}
        onClose={() => setFicheToDelete(null)}
        onDeleted={() => { if (user?.id) loadUserFiches(user.id) }}
      />
    </div>
  )
}