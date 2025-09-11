import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getUserFiches } from '../lib/supabaseHelpers'
import { 
  FileText, 
  ArrowLeft, 
  Search, 
  Grid3X3, 
  List, 
  Edit, 
  Archive, 
  Trash2,
  MoreVertical,
  Calendar,
  Clock
} from 'lucide-react'

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
        
        // Charger les fiches si premium
        if (profile?.subscription_status === 'premium') {
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
      if (result.success) {
        setFiches(result.data)
      } else {
        console.error('Erreur chargement fiches:', result.error)
      }
    } catch (error) {
      console.error('Erreur chargement fiches:', error)
    }
  }

  const handleMenuAction = (action, fiche) => {
    switch (action) {
      case 'edit':
        navigate(`/fiche?id=${fiche.id}`)
        break
      case 'archive':
        console.log('Archiver fiche:', fiche.nom)
        break
      case 'delete':
        console.log('Supprimer fiche:', fiche.nom)
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

  const isPremium = userProfile?.subscription_status === 'premium'

  if (!isPremium) {
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

  // Filtrage
  const statusFilters = ["Tous", "Complété", "Brouillon"]
  const filteredFiches = fiches.filter(fiche => {
    const matchesSearch = fiche.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = activeFilter === "Tous" || fiche.statut === activeFilter
    return matchesSearch && matchesStatus
  })

  // Couleurs des statuts
  const getStatusColor = (statut) => {
    switch (statut) {
      case "Complété": return "bg-green-100 text-green-800"
      case "Brouillon": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Compter les fiches par filtre
  const getFilterCount = (filter) => {
    return filter === "Tous" 
      ? fiches.length
      : fiches.filter(f => f.statut === filter).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Fiches Logement</h1>
              <p className="text-gray-600 mt-1">
                {filteredFiches.length} fiche{filteredFiches.length > 1 ? 's' : ''} • Premium actif
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/nouvelle-fiche')}
                className="bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                Nouvelle Fiche
              </button>
              
              <button
                onClick={() => navigate('/assistants')}
                className="text-gray-600 hover:text-gray-800 font-medium px-4 py-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2 inline" />
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-6 py-8">
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
              <div key={fiche.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-[#dbae61] transition-colors cursor-pointer">
                      {fiche.nom}
                    </h3>
                    
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
                            <Archive size={16} />
                            Archiver
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
                  
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(fiche.statut)}`}>
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
                    <h3 className="text-base font-semibold text-gray-900 truncate hover:text-[#dbae61] transition-colors">
                      {fiche.nom}
                    </h3>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(fiche.statut)}`}>
                      {fiche.statut}
                    </span>
                    
                    <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                      <span>Créée le {new Date(fiche.created_at).toLocaleDateString('fr-FR')}</span>
                      {fiche.updated_at !== fiche.created_at && (
                        <span>Modifiée le {new Date(fiche.updated_at).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
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
                          <Archive size={16} />
                          Archiver
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
    </div>
  )
}