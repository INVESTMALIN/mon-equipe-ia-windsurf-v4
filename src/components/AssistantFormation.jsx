import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bot, User } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function AssistantFormation() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dots, setDots] = useState('.')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const chatRef = useRef(null)
  const navigate = useNavigate()

  const welcome = "Salut ! Moi c’est Coach Malin 🧠. Pose-moi ta question sur la formation, je suis là pour t’aider."

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) navigate('/connexion')
    }
    checkAuth()
  }, [])

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setMessages([{ sender: 'bot', text: welcome.slice(0, i) }])
      if (i >= welcome.length) clearInterval(interval)
    }, 10)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (loading) {
        setDots((prev) => (prev.length < 3 ? prev + '.' : '.'))
      }
    }, 400)
    return () => clearInterval(interval)
  }, [loading])

  useEffect(() => {
    const container = chatRef.current
    if (!container) return
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50
    setShowScrollButton(!isAtBottom)
  }, [messages])

  const scrollToBottom = () => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage = { sender: 'user', text: input }
    setMessages((prev) => [...prev, newMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('https://hub.cardin.cloud/webhook/3bab9cc1-054f-4f06-b192-3baac53aa367', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      const data = await res.json()
      const reply = { sender: 'bot', text: data.output || 'Réponse indisponible.' }
      setMessages((prev) => [...prev, reply])
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Erreur lors de la connexion à l’agent.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-orange-600 mb-2">Coach Malin 🤖</h1>
      <p className="text-gray-700 mb-6">
        Je suis là pour t’accompagner pendant et après ta formation Invest Malin. Pose-moi tes questions, j’y réponds instantanément.
      </p>

      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 h-[500px] flex flex-col overflow-hidden relative">
        <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end flex-row-reverse' : ''}`}>
              {msg.sender === 'bot' && <Bot className="w-4 h-4 text-orange-500 mt-1" />}
              {msg.sender === 'user' && <User className="w-4 h-4 text-gray-400 mt-1" />}
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                  msg.sender === 'user'
                    ? 'bg-orange-100 text-right ml-auto'
                    : 'bg-gray-100 text-left'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-sm text-gray-500 italic flex items-center gap-1">
              <Bot className="w-4 h-4 text-orange-500" />
              Coach Malin réfléchit{dots}
            </div>
          )}
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-16 right-4 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-100"
            title="Aller en bas"
          >
            ↓
          </button>
        )}

        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Posez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            Envoyer
          </button>
        </form>
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <Link to="/mon-compte" className="text-orange-600 hover:underline">
          ← Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
