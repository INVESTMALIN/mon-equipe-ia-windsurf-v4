import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Plus, MoreHorizontal, Trash2, Edit2, X, Menu, ChevronDown } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function SidebarConversations({ activeId, onSelect, userId, source, onNewConversation }) {
  const [conversations, setConversations] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [currentLimit, setCurrentLimit] = useState(5)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  
  const debounceRef = useRef(null)
  const channelRef = useRef(null)

  // ==========================================
  // 1. FETCH CONVERSATIONS (fonction principale)
  // ==========================================
  const fetchConversations = async (limit = 5) => {
    if (!userId) return
    
    const { data, error } = await supabase
      .from('conversations')
      .select('conversation_id, question, created_at, title, source')
      .eq('source', source)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit + 1) // +1 pour détecter s'il y en a plus

    if (error) {
      console.error('Erreur fetch conversations:', error)
      return
    }

    // Déduplication
    const seen = new Set()
    const unique = []
    for (const row of data) {
      if (!seen.has(row.conversation_id)) {
        seen.add(row.conversation_id)
        unique.push(row)
      }
    }

    // Vérifier s'il y a plus de conversations
    setHasMore(unique.length > limit)
    setConversations(unique.slice(0, limit))
    setCurrentLimit(limit)
  }

  // ==========================================
  // 2. CHARGEMENT INITIAL (au mount)
  // ==========================================
  useEffect(() => {
    if (!userId) return
    fetchConversations(5) // Charge les 5 premières
  }, [userId, source])

  // ==========================================
  // 3. REALTIME SUPABASE (écoute INSERT/DELETE)
  // ==========================================
  useEffect(() => {
    if (!userId) return

    // Cleanup ancien channel si existe
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`conversations_${source}_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const eventSource = payload.new?.source || payload.old?.source
        if (eventSource !== source) return

        // Debounce le refresh
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
          // Sur INSERT/DELETE, reset à 5
          // Sur UPDATE, garde la limite actuelle
          const newLimit = (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') 
            ? 5 
            : currentLimit
          fetchConversations(newLimit)
        }, 150)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      clearTimeout(debounceRef.current)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [userId, source, currentLimit])

  // ==========================================
  // 4. REFRESH MANUEL (window.refreshSidebar)
  // ==========================================
  useEffect(() => {
    const handleManualRefresh = () => {
      if (!userId) {
        // Retry une seule fois après 300ms si userId pas prêt
        setTimeout(() => {
          if (userId) fetchConversations(5)
        }, 300)
        return
      }
      fetchConversations(5) // Reset à 5 sur refresh manuel
    }

    window.addEventListener('refreshSidebar', handleManualRefresh)
    return () => window.removeEventListener('refreshSidebar', handleManualRefresh)
  }, [userId, source])

  // Fermer le dropdown en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Si on clique et que ce n'est ni le bouton ni le menu
      if (dropdownOpen && !e.target.closest('.dropdown-container')) {
        setDropdownOpen(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  // ==========================================
  // 5. PAGINATION ("Voir plus")
  // ==========================================
  const loadMoreConversations = () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    
    const newLimit = currentLimit + 5
    fetchConversations(newLimit).finally(() => {
      setLoadingMore(false)
    })
  }

  // ==========================================
  // 6. ACTIONS UTILISATEUR
  // ==========================================
  const deleteConversation = async (conversationId) => {
    if (!userId) return
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .eq('source', source)

    if (!error) {
      // Si conversation active supprimée, sélectionner la suivante
      if (activeId === conversationId) {
        const remaining = conversations.filter(c => c.conversation_id !== conversationId)
        onSelect(remaining.length > 0 ? remaining[0].conversation_id : null)
      }
      setDropdownOpen(null)
    }
  }

  const updateTitle = async (conversationId, newTitle) => {
    if (!userId || !newTitle.trim()) return
    
    const { error } = await supabase
      .from('conversations')
      .update({ title: newTitle })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .eq('source', source)

    if (!error) {
      setConversations(prev => 
        prev.map(c => 
          c.conversation_id === conversationId ? { ...c, title: newTitle } : c
        )
      )
      setEditingId(null)
      setEditTitle('')
    }
  }

  const handleRename = (conv) => {
    setEditingId(conv.conversation_id)
    setEditTitle(getPreview(conv))
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
    setIsMobileOpen(false)
    onNewConversation()
  }

  const handleSelectConversation = (conversationId) => {
    setIsMobileOpen(false)
    onSelect(conversationId)
  }

  // ==========================================
  // 7. UTILITAIRES
  // ==========================================
  const getPreview = (conv) => {
    const text = conv.title || (conv.question || '').replace(/\s+/g, ' ').trim()
    return text.slice(0, 40) || 'Nouvelle conversation'
  }

  // ==========================================
  // 8. RENDER
  // ==========================================
  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        fixed md:relative 
        w-72 bg-white border-r border-gray-200 
        flex flex-col h-screen z-50 
        transition-transform duration-300 ease-in-out
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversations
            </h2>
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

        {/* Liste conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.conversation_id}
              className={`relative group border-b border-gray-100 hover:bg-gray-50 ${
                activeId === conv.conversation_id
                  ? 'bg-[#dbae61] bg-opacity-10 border-l-4 border-l-[#dbae61]'
                  : ''
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
                      {getPreview(conv)}
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
                className="dropdown-container absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>

              {dropdownOpen === conv.conversation_id && (
                <div className="dropdown-container absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
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
          
          {/* Bouton "Voir plus" */}
          {hasMore && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={loadMoreConversations}
                disabled={loadingMore}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
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