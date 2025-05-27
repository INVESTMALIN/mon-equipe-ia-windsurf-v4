// src/components/SidebarConversations.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
function cn(...args) {
    return args.filter(Boolean).join(' ')
  }

export default function SidebarConversations({ activeId, onSelect }) {
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    async function fetchConversations() {
      const { data, error } = await supabase
        .from('conversations')
        .select('conversation_id, question, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        // regrouper par conversation_id, garder la question la plus ancienne de chaque id
        const map = new Map()
        data.forEach(row => {
          if (!map.has(row.conversation_id)) {
            map.set(row.conversation_id, row)
          }
        })
        setConversations([...map.values()])
      }
    }
    fetchConversations()
  }, [])

  return (
    <aside className="w-64 h-full bg-white border-r p-4 overflow-auto flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4">Conversations</h2>
      <ul className="space-y-2">
        {conversations.map(conv => (
          <li
            key={conv.conversation_id}
            className={cn(
              'p-2 rounded cursor-pointer text-sm hover:bg-orange-50',
              conv.conversation_id === activeId && 'bg-orange-100 font-semibold'
            )}
            onClick={() => onSelect(conv.conversation_id)}
          >
            {conv.question.slice(0, 40)}
          </li>
        ))}
      </ul>
    </aside>
  )
}
