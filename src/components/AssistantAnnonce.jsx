import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, User, ArrowLeft, Plus, Upload, FileText, X } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import SidebarConversations from './SidebarConversations'

export default function AssistantAnnonce() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dots, setDots] = useState('.')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [userId, setUserId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const chatRef = useRef(null)
  const conversationIdRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id)
    })

    let id = localStorage.getItem('conversation_id_annonce')
    if (!id) {
      id = uuidv4()
      localStorage.setItem('conversation_id_annonce', id)
    }
    conversationIdRef.current = id
  }, [])

  const welcome = "Salut ! Je suis votre Assistant Annonce IA 🏡. Envoyez-moi votre fiche logement en PDF et je créerai une annonce optimisée pour maximiser vos réservations !"

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Veuillez sélectionner un fichier PDF uniquement.')
      e.target.value = ''
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    document.querySelector('input[type="file"]').value = ''
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !userId) return

    const newMessage = { sender: 'user', text: input }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    const userInput = input
    setInput('')
    setLoading(true)

    try {
      let requestBody = {
        chatInput: userInput,
        sessionId: `session_${Date.now()}_annonce`
      }

      // Si un PDF est sélectionné, on l'ajoute
      if (selectedFile) {
        const base64Promise = new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })

        const base64Data = await base64Promise
        requestBody.files = [{
          data: base64Data,
          fileName: selectedFile.name,
          mimeType: 'application/pdf'
        }]
      }

      const res = await fetch('https://hub.cardin.cloud/webhook/00297790-8d18-44ff-b1ce-61b8980d9a46/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await res.json()
      const reply = { sender: 'bot', text: data.output || 'Réponse indisponible.' }
      setMessages((prev) => [...prev, reply])

      await supabase.from('conversations').insert({
        source: 'assistant-annonce',
        question: userInput,
        answer: reply.text,
        conversation_id: conversationIdRef.current,
        user_id: userId
      })

      // Reset le fichier après envoi
      setSelectedFile(null)
      document.querySelector('input[type="file"]').value = ''

    } catch (err) {
      console.error('Erreur webhook:', err)
      
      let errorMessage = "Une erreur est survenue, merci de réessayer dans quelques instants."
      
      if (err.message?.includes('504')) {
        errorMessage = "L'assistant prend plus de temps que prévu à analyser votre demande. Merci de réessayer dans quelques instants.\n\nSi le problème persiste, contactez le support : contact@invest-malin.com"
      } else if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
        errorMessage = "La connexion semble lente. Merci de vérifier votre connexion et de réessayer."
      } else if (err.message?.includes('500') || err.message?.includes('502') || err.message?.includes('503')) {
        errorMessage = "Une erreur technique s'est produite. Notre équipe technique a été notifiée automatiquement.\n\nMerci de réessayer dans quelques instants."
      }
      
      setMessages((prev) => [...prev, { sender: 'bot', text: errorMessage }])
    } finally {
      setLoading(false)
    }
  }

  const loadConversation = async (conversationId) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('question, answer, created_at')
      .eq('conversation_id', conversationId)
      .eq('source', 'assistant-annonce')
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
    localStorage.setItem('conversation_id_annonce', conversationId)
  }

  const createNewConversation = async () => {
    const newId = uuidv4()
    localStorage.setItem('conversation_id_annonce', newId)
    conversationIdRef.current = newId
    setMessages([{ sender: 'bot', text: welcome }])

    if (userId) {
      await supabase.from('conversations').insert({
        user_id: userId,
        source: 'assistant-annonce',
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

      <div className="flex-1 flex overflow-hidden">
        <SidebarConversations
            activeId={conversationIdRef.current}
            onSelect={loadConversation}
            userId={userId}
            source="assistant-annonce"
        />
        
        <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full">
          {/* Titre avec même style qu'Assistant Formation */}
          <h1 className="text-3xl font-bold text-[#dbae61] mb-1">Assistant Annonce IA</h1>
          <p className="text-gray-700 mb-6">Créez des annonces optimisées qui maximisent vos réservations. Réponses instantanées assurées.</p>

          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 h-[600px] flex flex-col overflow-hidden relative">
            <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end flex-row-reverse' : ''}`}>
                  {msg.sender === 'bot' && <Bot className="w-4 h-4 text-[#dbae61] mt-1" />}
                  {msg.sender === 'user' && <User className="w-4 h-4 text-gray-400 mt-1" />}
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-orange-100 text-right ml-auto'
                        : 'bg-gray-100 tet-left'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-sm text-gray-500 italic flex items-center gap-1">
                  <Bot className="w-4 h-4 text-[#dbae61]" />
                  L'IA analyse votre demande{dots}
                </div>
              )}
            </div>

            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-20 right-4 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-100"
                title="Aller en bas"
              >
                ↓
              </button>
            )}

            {/* Upload PDF */}
            {selectedFile && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">{selectedFile.name}</span>
                </div>
                <button onClick={removeFile} className="text-green-600 hover:text-green-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={sendMessage} className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer text-sm transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Joindre PDF
                </label>
                <span className="text-xs text-gray-500">Fiche logement, documents...</span>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Posez votre question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#dbae61]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-[#dbae61] hover:bg-[#c49a4f] text-white text-sm font-semibold px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}