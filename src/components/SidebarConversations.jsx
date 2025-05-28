import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function cn(...args) {
  return args.filter(Boolean).join(' ')
}

export default function SidebarConversations({ activeId, onSelect, userId }) {
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    if (!userId) return

    async function fetchConversations() {
      const { data, error } = await supabase
        .from('conversations')
        .select('conversation_id, question, created_at')
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

    fetchConversations()
  }, [userId])

  return (
    <aside className="w-64 h-full bg-white border-r p-4 overflow-auto flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4">Conversations</h2>
      <ul className="space-y-2">
        {conversations.map(conv => (
          <li
            key={conv.conversation_id}
            className={cn(
              'p-2 rounded text-sm hover:bg-orange-50 flex justify-between items-center group',
              conv.conversation_id === activeId && 'bg-orange-100 font-semibold'
            )}
          >
            <span
              onClick={() => onSelect(conv.conversation_id)}
              className="flex-1 truncate cursor-pointer"
            >
              {conv.question === '(Nouvelle conversation)'
                ? 'Nouvelle conversation'
                : conv.question?.slice(0, 40)}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation()
                console.log('Menu pour', conv.conversation_id)
              }}
              className="text-gray-500 text-lg font-bold opacity-50 hover:opacity-100 hover:shadow-sm rounded px-1 py-0.5 transition"
              title="Options"
              style={{
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                lineHeight: 1,
                fontSize: '1.25rem'
              }}
            >
              ...
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
