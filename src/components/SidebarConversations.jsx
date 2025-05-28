import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

function cn(...args) {
  return args.filter(Boolean).join(' ')
}

export default function SidebarConversations({ activeId, onSelect, userId }) {
  const [conversations, setConversations] = useState([])
  const [menuOpenId, setMenuOpenId] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!userId) return
    fetchConversations()
  }, [userId])

  async function fetchConversations() {
    const { data, error } = await supabase
      .from('conversations')
      .select('conversation_id, question, created_at, title')
      .eq('source', 'assistant-formation')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      const map = new Map()
      data.forEach(row => {
        if (!map.has(row.conversation_id)) {
          map.set(row.conversation_id, row)
        }
      })
      setConversations([...map.values()].reverse())
    } else {
      console.error(error)
    }
  }

  async function handleRename(conversationId) {
    const newTitle = prompt('Nouveau nom de la conversation :')
    if (!newTitle) return

    const { error } = await supabase
      .from('conversations')
      .update({ title: newTitle })
      .eq('conversation_id', conversationId)

    if (error) {
      console.error(error)
    } else {
      await fetchConversations()
    }
  }

  async function handleDelete(conversationId) {
    const confirmed = confirm('Supprimer cette conversation ?')
    if (!confirmed) return

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('conversation_id', conversationId)

    if (error) {
      console.error(error)
    } else {
      await fetchConversations()
    }
  }

  // 👇 Ajout du gestionnaire de clic extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null)
      }
    }

    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpenId])

  return (
    <aside className="w-64 h-full bg-white border-r p-4 overflow-auto flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4">Conversations</h2>
      <ul className="space-y-2">
        {conversations.map(conv => (
          <li
            key={conv.conversation_id}
            className={cn(
              'p-2 rounded text-sm hover:bg-orange-50 flex justify-between items-center group relative',
              conv.conversation_id === activeId && 'bg-orange-100 font-semibold'
            )}
          >
            <span
              onClick={() => onSelect(conv.conversation_id)}
              className="flex-1 truncate cursor-pointer"
            >
              {conv.title
                ? conv.title
                : conv.question === '(Nouvelle conversation)'
                ? 'Nouvelle conversation'
                : conv.question?.slice(0, 40)}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpenId(menuOpenId === conv.conversation_id ? null : conv.conversation_id)
              }}
              className="text-gray-500 text-lg font-bold opacity-50 hover:opacity-100 hover:shadow-sm rounded px-1 py-0.5 transition"
              title="Options"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                lineHeight: 1,
                fontSize: '1.25rem'
              }}
            >
              ...
            </button>

            {menuOpenId === conv.conversation_id && (
              <div
                ref={menuRef}
                className="absolute right-2 top-8 z-10"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  borderRadius: '6px',
                  minWidth: '120px',
                  padding: '4px 0',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => {
                    handleRename(conv.conversation_id)
                    setMenuOpenId(null)
                  }}
                  style={{
                    all: 'unset',
                    width: '100%',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderRadius: '6px'
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f9f9f9')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                >
                  Renommer
                </button>
                <button
                  onClick={() => {
                    handleDelete(conv.conversation_id)
                    setMenuOpenId(null)
                  }}
                  style={{
                    all: 'unset',
                    width: '100%',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#b91c1c',
                    borderRadius: '6px'
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f9f9f9')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                >
                  Supprimer
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
