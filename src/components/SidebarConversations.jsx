import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Plus, MoreHorizontal, Trash2, Edit2, X, Menu, ChevronDown } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function SidebarConversations({ activeId, onSelect, userId, source, onNewConversation }) {
  const [conversations, setConversations] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // 🆕 Pagination state
  const [currentLimit, setCurrentLimit] = useState(5) // 👈 Ici
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // ✅ FIX DEBOUNCE : Anti-tempête d'événements
  const fetchDebounceRef = useRef(null)

  const triggerFetch = (shouldReset = false) => {
    clearTimeout(fetchDebounceRef.current)
    fetchDebounceRef.current = setTimeout(() => fetchConversations(shouldReset), 120)
  }

  // ✅ FIX REALTIME + DELETE : Gère tous les events (INSERT/UPDATE/DELETE)
  useEffect(() => {
    if (!userId) return
    
    fetchConversations(true) // Reset au mount

    const channel = supabase
      .channel(`conv_${source}_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        // ✅ FIX DELETE : payload.new est null sur DELETE, utiliser old aussi
        const src = payload.new?.source ?? payload.old?.source
        if (src !== source) return
        
        // Reset seulement sur INSERT/DELETE, pas sur UPDATE
        const shouldReset = payload.eventType === 'INSERT' || payload.eventType === 'DELETE'
        triggerFetch(shouldReset)
      })
      .subscribe()

    return () => { 
      supabase.removeChannel(channel)
      clearTimeout(fetchDebounceRef.current) // ✅ Cleanup debounce
    }
  }, [userId, source])

  // ✅ FIX REFRESH MANUEL : Écouter l'événement custom avec garde userId
  useEffect(() => {
    const handleRefresh = () => {
      if (!userId) return // 🔒 Pas d'appel tant que userId n'est pas prêt
      triggerFetch(true) // Reset sur refresh manuel
    }
    window.addEventListener('refreshSidebar', handleRefresh)
    return () => window.removeEventListener('refreshSidebar', handleRefresh)
  }, [userId, source])

  // Fonction utilitaire pour l'aperçu des conversations
  const previewOf = (conv) => {
    const preview = conv.title || (conv.question || '').replace(/\s+/g, ' ').trim()
    return preview.slice(0, 40) || 'Nouvelle conversation'
  }

  const fetchConversations = async (reset = false) => {
    // 🔒 GARDE GLOBALE : Empêcher fetch avec userId null
    if (!userId) return
    
    const base = reset ? 5 : currentLimit // 👈 Et ici
    const OVERFETCH = 3 // Marge pour la déduplication
    
    const { data, error } = await supabase
      .from('conversations')
      .select('conversation_id, question, created_at, title, source')
      .eq('source', source)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(base * OVERFETCH + 1) // Overfetch pour gérer la déduplication

    if (error) {
      console.error(error)
      return
    }

    // Déduplication AVANT calcul hasMore
    const seen = new Set()
    const uniqueConversations = []
    for (const row of data) {
      if (!seen.has(row.conversation_id)) {
        seen.add(row.conversation_id)
        uniqueConversations.push(row)
      }
    }
    
    // Maintenant on peut correctement calculer hasMore
    setHasMore(uniqueConversations.length > base)
    setConversations(uniqueConversations.slice(0, base))
    
    if (reset) {
      setCurrentLimit(5) // 👈 Et là
    }
  }

  const loadMoreConversations = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    const newLimit = currentLimit + 5 // 👈 Et aussi l'incrément du "Voir plus"
    const OVERFETCH = 3
    
    const { data, error } = await supabase
      .from('conversations')
      .select('conversation_id, question, created_at, title, source')
      .eq('source', source)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(newLimit * OVERFETCH + 1) // Overfetch pour gérer la déduplication

    if (error) {
      console.error(error)
      setLoadingMore(false)
      return
    }

    // Déduplication AVANT calcul hasMore
    const seen = new Set()
    const uniqueConversations = []
    for (const row of data) {
      if (!seen.has(row.conversation_id)) {
        seen.add(row.conversation_id)
        uniqueConversations.push(row)
      }
    }
    
    // Maintenant on peut correctement calculer hasMore
    setHasMore(uniqueConversations.length > newLimit)
    setConversations(uniqueConversations.slice(0, newLimit))
    setCurrentLimit(newLimit)
    setLoadingMore(false)
  }

  const deleteConversation = async (conversationId) => {
    if (!userId) return // 🔒 Garde anti-null
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .eq('source', source)

    if (!error) {
      // Si on supprime la conversation active, sélectionner la première restante
      if (activeId === conversationId) {
        const remainingConversations = conversations.filter(c => c.conversation_id !== conversationId)
        if (remainingConversations.length > 0) {
          onSelect(remainingConversations[0].conversation_id)
        } else {
          onSelect(null) // Aucune conversation restante
        }
      }
      
      setConversations(prev => prev.filter(c => c.conversation_id !== conversationId))
      setDropdownOpen(null)
    }
  }

  const updateTitle = async (conversationId, newTitle) => {
    if (!userId || !newTitle.trim()) return // 🔒 Garde anti-null + titre vide
    
    const { error } = await supabase
      .from('conversations')
      .update({ title: newTitle })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .eq('source', source)

    if (!error) {
      setConversations(prev => 
        prev.map(c => 
          c.conversation_id === conversationId 
            ? { ...c, title: newTitle }
            : c
        )
      )
      setEditingId(null)
      setEditTitle('')
    }
  }

  const handleRename = (conv) => {
    setEditingId(conv.conversation_id)
    setEditTitle(previewOf(conv))
    setDropdownOpen(null)
  }

  const handleSaveTitle = (conversationId) => {
    if (editTitle.trim()) {
      updateTitle(conversationId, editTitle.trim())
    } else {
      setEditingId(null)
      setEditTitle('')
    }
  }

  const handleNewConversation = () => {
    setIsMobileOpen(false) // Fermer sidebar mobile
    onNewConversation()
  }

  const handleSelectConversation = (conversationId) => {
    setIsMobileOpen(false) // Fermer sidebar mobile
    onSelect(conversationId)
  }

  return (
    <>
      {/* ✅ BOUTON HAMBURGER MOBILE */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ✅ OVERLAY MOBILE */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ✅ SIDEBAR RESPONSIVE */}
      <div className={`
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        fixed md:relative 
        w-72 bg-white border-r border-gray-200 
        flex flex-col h-screen z-50 
        transition-transform duration-300 ease-in-out
      `}>
        {/* Header avec bouton fermer mobile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversations
            </h2>
            
            {/* ✅ BOUTON FERMER MOBILE */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <button
            onClick={handleNewConversation}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle conversation
          </button>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.conversation_id}
              className={`relative group border-b border-gray-100 hover:bg-gray-50 ${
                activeId === conv.conversation_id ?
                  'bg-[#dbae61] bg-opacity-10 border-l-4 border-l-[#dbae61]' : ''
              }`}
            >
              <div
                onClick={() => handleSelectConversation(conv.conversation_id)}
                className="p-4 cursor-pointer"
              >
                {editingId === conv.conversation_id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveTitle(conv.conversation_id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle(conv.conversation_id)
                      if (e.key === 'Escape') { setEditingId(null); setEditTitle('') }
                    }}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1"
                    autoFocus
                  />
                ) : (
                  <>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {previewOf(conv)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(conv.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Menu dropdown */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDropdownOpen(dropdownOpen === conv.conversation_id ? null : conv.conversation_id)
                }}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>

              {dropdownOpen === conv.conversation_id && (
                <div className="absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                  <button
                    onClick={() => handleRename(conv)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit2 className="w-3 h-3" />
                    Renommer
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.conversation_id)}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {/* 🆕 BOUTON "VOIR PLUS" */}
          {hasMore && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={loadMoreConversations}
                disabled={loadingMore}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                    <span>Chargement...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Voir plus</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}