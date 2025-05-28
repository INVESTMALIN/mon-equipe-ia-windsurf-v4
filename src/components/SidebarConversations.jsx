// src/components/SidebarConversations.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

function cn(...args) {
  return args.filter(Boolean).join(' ')
}

export default function SidebarConversations({ activeId, onSelect, userId }) {
  const [conversations, setConversations] = useState([])
  const [menuOpenId, setMenuOpenId] = useState(null)

  const fetchConversations = async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from('conversations')
      .select('conversation_id, question, created_at, title')
      .eq('user_id', userId)
      .eq('source', 'assistant-formation')
      .order('created_at', { ascending: false })

    if (!error && data) {
      const map = new Map()
      data.forEach(row => {
        if (!map.has(row.conversation_id)) {
          map.set(row.conversation_id, row)
        }
      })
      setConversations([...map.values()])
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [userId])

  const handleRename = async (id) => {
    const newTitle = prompt('Nouveau titre ?')
    if (!newTitle) return
    await supabase
      .from('conversations')
      .update({ title: newTitle })
      .eq('conversation_id', id)
    fetchConversations()
  }

  const handleDelete = async (id) => {
    const confirmed = confirm('Supprimer cette conversation ?')
    if (!confirmed) return
    await supabase
      .from('conversations')
      .delete()
      .eq('conversation_id', id)
    fetchConversations()
  }

  return (
    <aside className="w-64 h-full bg-white border-r p-4 overflow-auto flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4">Conversations</h2>
      <ul className="space-y-2">
        {conversations.map((conv) => (
          <li
            key={conv.conversation_id}
            className={cn(
              'group p-2 rounded flex justify-between items-center text-sm hover:bg-orange-50',
              conv.conversation_id === activeId && 'bg-orange-100 font-semibold'
            )}
          >
            <span
              onClick={() => onSelect(conv.conversation_id)}
              className="flex-1 cursor-pointer truncate pr-2"
            >
              {conv.title || conv.question?.slice(0, 40) || '(Sans titre)'}
            </span>
            <div className="relative">
              <button
                onClick={() =>
                  setMenuOpenId(menuOpenId === conv.conversation_id ? null : conv.conversation_id)
                }
                className="hover:bg-gray-100 rounded-full p-1"
              >
                <MoreVertical size={18} className="text-gray-500" />
              </button>
              {menuOpenId === conv.conversation_id && (
                <div className="absolute right-0 mt-1 w-36 bg-white border rounded shadow z-10">
                  <button
                    onClick={() => {
                      setMenuOpenId(null)
                      handleRename(conv.conversation_id)
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    <Pencil size={14} /> Renommer
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpenId(null)
                      handleDelete(conv.conversation_id)
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
