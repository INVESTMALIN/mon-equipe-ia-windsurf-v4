import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, User, ArrowLeft, Plus } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import SidebarConversations from './SidebarConversations'

export default function AssistantFormationWithHistoryV3() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dots, setDots] = useState('.')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [userId, setUserId] = useState(null)
  const chatRef = useRef(null)
  const conversationIdRef = useRef(null)


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id)
    })

    let id = localStorage.getItem('conversation_id')
    if (!id) {
      id = uuidv4()
      localStorage.setItem('conversation_id', id)
    }
    conversationIdRef.current = id
  }, [])

  const welcome = "Salut ! Moi c'est Coach Malin 🧠. Pose-moi ta question sur la formation, je suis là pour t'aider."

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
    if (!input.trim() || !userId) return

    const newMessage = { sender: 'user', text: input }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    const contextMessages = updatedMessages.slice(-10)
    const fullPrompt = contextMessages
      .map((msg) => `${msg.sender === 'user' ? 'Utilisateur' : 'Assistant'} : ${msg.text}`)
      .join('\n')

    try {
      const res = await fetch('https://hub.cardin.cloud/webhook/3bab9cc1-054f-4f06-b192-3baac53aa367', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: fullPrompt })
      })

      const data = await res.json()
      const reply = { sender: 'bot', text: data.output || 'Réponse indisponible.' }
      setMessages((prev) => [...prev, reply])

      await supabase.from('conversations').insert({
        source: 'assistant-formation',
        question: input,
        answer: reply.text,
        conversation_id: conversationIdRef.current,
        user_id: userId
      })
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Erreur lors de la connexion à l\'agent.' }])
    } finally {
      setLoading(false)
    }
  }

  const loadConversation = async (conversationId) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('question, answer, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    const loadedMessages = []
    data.forEach(row => {
      if (row.question) loadedMessages.push({ sender: 'user', text: row.question })
      if (row.answer) loadedMessages.push({ sender: 'bot', text: row.answer })
    })

    setMessages(loadedMessages)
    conversationIdRef.current = conversationId
    localStorage.setItem('conversation_id', conversationId)
  }

  const createNewConversation = async () => {
    const newId = uuidv4()
    localStorage.setItem('conversation_id', newId)
    conversationIdRef.current = newId
    setMessages([{ sender: 'bot', text: welcome }])

    if (userId) {
      await supabase.from('conversations').insert({
        user_id: userId,
        source: 'assistant-formation',
        question: '(Nouvelle conversation)',
        answer: '',
        conversation_id: newId
      })
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">

      {/* Header noir responsive */}
      <div className="bg-black text-white py-4 z-50">
        {/* Header mobile */}
        <div className="px-4 flex md:hidden items-center justify-between">
          <div></div> {/* Espace vide pour centrer le logo */}
          
            <Link
              to="/assistants"
              className="flex items-center gap-2 hover:text-[#dbae61] transition-colors duration-200 cursor-pointer"
              title="Aller à Assistants"
            >
              <img 
                src="/images/invest-malin-logo.png" 
                alt="Invest Malin Logo" 
                className="h-6 hover:scale-105 transition-transform duration-200"
              />
              <span className="text-sm font-bold">MON ÉQUIPE IA</span>
            </Link>
          
          <div className="flex items-center gap-1">
            <Link
              to="/assistants"
              className="p-2 text-white hover:text-[#dbae61] transition-colors border border-white/80 hover:border-[#dbae61] rounded-md"
              title="Retour"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <button
              onClick={createNewConversation}
              className="p-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-md transition-colors"
              title="Nouvelle conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Header desktop - comme avant */}
        <div className="hidden md:flex px-6 md:px-20 items-center justify-between">
          <Link
            to="/assistants"
            className="flex items-center gap-3 hover:text-[#dbae61] transition-colors duration-200 cursor-pointer"
            title="Aller à Assistants"
          >
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-8 hover:scale-105 transition-transform duration-200"
            />
            <span className="text-lg font-bold">MON ÉQUIPE IA</span>
          </Link>

          
          <div className="flex items-center gap-4">
            <Link
              to="/assistants"
              className="flex items-center gap-2 text-white hover:text-[#dbae61] transition-colors border-2 border-white/80 hover:border-[#dbae61] px-3 py-2 rounded-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Retour</span>
            </Link>
            
            <button
              onClick={createNewConversation}
              className="flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Conversation
            </button>
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar conversations */}
        <SidebarConversations
          activeId={conversationIdRef.current}
          onSelect={loadConversation}
          userId={userId}
        />

        {/* Zone de chat principale */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[#dbae61] mb-1">Assistant Formation</h1>
            <p className="text-gray-700 mb-6">Posez vos questions sur la formation Invest Malin. Réponses instantanées assurées.</p>

            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col overflow-hidden relative h-[calc(100vh-220px)]">
            <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end flex-row-reverse' : ''}`}>
                    {msg.sender === 'bot' && <Bot className="w-4 h-4 text-[#dbae61] mt-1" />}
                    {msg.sender === 'user' && <User className="w-4 h-4 text-gray-400 mt-1" />}
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#dbae61] text-white text-right ml-auto'
                          : 'bg-gray-100 text-left'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="text-sm text-gray-500 italic flex items-center gap-1">
                    <Bot className="w-4 h-4 text-[#dbae61]" />
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
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#dbae61]"
                />
                <button
                  type="submit"
                  className="bg-[#dbae61] hover:bg-[#c49a4f] text-white text-sm font-semibold px-4 py-2 rounded-md"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}