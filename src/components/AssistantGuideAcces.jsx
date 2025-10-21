import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, User, ArrowLeft, Video, Upload, X, Copy, Check } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import SidebarConversations from './SidebarConversations'

export default function AssistantGuideAcces() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [userId, setUserId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [copied, setCopied] = useState(false)
  const conversationIdRef = useRef(null)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id)
    })

    let id = localStorage.getItem('conversation_id_guide_acces')
    if (!id) {
      id = uuidv4()
      localStorage.setItem('conversation_id_guide_acces', id)
    }
    conversationIdRef.current = id
  }, [])

  const welcome = "Bonjour ! Je suis votre Assistant Guide d'Accès. Envoyez-moi une vidéo de votre logement et je générerai un guide d'accès détaillé pour vos voyageurs."

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setMessages([{ sender: 'bot', text: welcome.slice(0, i) }])
      if (i >= welcome.length) clearInterval(interval)
    }, 10)
    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    
    if (!file) return
    
    // Validation du type de fichier (vidéos uniquement)
    const isMp4 = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')
    const isWebm = file.type === 'video/webm' || file.name.toLowerCase().endsWith('.webm')
    const isMov = file.type === 'video/quicktime' || file.name.toLowerCase().endsWith('.mov')
    
    if (!isMp4 && !isWebm && !isMov) {
      alert('Veuillez sélectionner une vidéo (MP4, WebM ou MOV) uniquement.')
      e.target.value = ''
      return
    }
    
    // Validation de la taille (200MB max)
    const maxSize = 200 * 1024 * 1024 // 200MB
    if (file.size > maxSize) {
      alert('Le fichier est trop volumineux. Taille maximum autorisée : 200MB.')
      e.target.value = ''
      return
    }
    
    // Validation fichier vide
    if (file.size === 0) {
      alert('Le fichier sélectionné est vide.')
      e.target.value = ''
      return
    }
    
    setSelectedFile(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
    document.querySelector('input[type="file"]').value = ''
  }

  const fileInputRef = useRef(null)
  const listRef = useRef(null)
  const endRef = useRef(null) 
  const shouldStickRef = useRef(true)

  const isNearBottom = (el) => el ? el.scrollHeight - el.scrollTop - el.clientHeight < 100 : false

  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const handleScroll = () => {
      shouldStickRef.current = isNearBottom(list)
      setShowScrollButton(!shouldStickRef.current)
    }

    list.addEventListener('scroll', handleScroll)
    return () => list.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (shouldStickRef.current) {
      scrollToBottom()
    }
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if ((!input.trim() && !selectedFile) || loading) return

    const userMessage = input.trim() || (selectedFile ? `[Vidéo envoyée : ${selectedFile.name}]` : '')
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }])
    setInput('')
    setLoading(true)

    abortControllerRef.current = new AbortController()
    const timeoutId = setTimeout(() => abortControllerRef.current.abort(), 120000)

    try {
      let fileData = null
      if (selectedFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })

        fileData = {
          data: base64,
          fileName: selectedFile.name,
          mimeType: selectedFile.type
        }
      }

      const sessionId = `guide_acces_${conversationIdRef.current}`
      const payload = {
        sessionId,
        chatInput: userMessage,
        ...(fileData && { files: [fileData] })
      }

      const res = await fetch('https://hub.cardin.cloud/webhook/5ebcffdd-fee8-4525-85f1-33f57ce4d28d/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`)
      }

      const data = await res.json()
      const botResponse = data.output || data.response || 'Aucune réponse reçue.'

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }])

      if (userId) {
        await supabase.from('conversations').insert({
          user_id: userId,
          source: 'assistant-guide-acces',
          question: userMessage,
          answer: botResponse,
          conversation_id: conversationIdRef.current
        })
      }

      removeFile()
    } catch (error) {
      clearTimeout(timeoutId)
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.'
      
      if (error.name === 'AbortError') {
        errorMessage = 'La génération du guide a pris trop de temps (timeout 2 min). Essayez avec une vidéo plus courte.'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
      }

      setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }])
    } finally {
      setLoading(false)
    }
  }

  const handleNewConversation = () => {
    const newId = uuidv4()
    localStorage.setItem('conversation_id_guide_acces', newId)
    conversationIdRef.current = newId
    setMessages([{ sender: 'bot', text: welcome }])
    setInput('')
    setSelectedFile(null)
  }

  const loadConversation = async (conversationId) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('question, answer, created_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .eq('source', 'assistant-guide-acces')
        .order('created_at', { ascending: true })

      if (error) throw error

      const loadedMessages = [{ sender: 'bot', text: welcome }]
      data.forEach(row => {
        loadedMessages.push({ sender: 'user', text: row.question })
        loadedMessages.push({ sender: 'bot', text: row.answer })
      })

      setMessages(loadedMessages)
      conversationIdRef.current = conversationId
      localStorage.setItem('conversation_id_guide_acces', conversationId)
    } catch (error) {
      console.error('Erreur chargement conversation:', error)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const quickPrompts = [
    "Génère un guide d'accès détaillé",
    "Crée un guide étape par étape",
    "Guide d'accès avec points de repère"
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarConversations
        activeId={conversationIdRef.current}
        onSelect={loadConversation}
        userId={userId}
        source="assistant-guide-acces"
        onNewConversation={handleNewConversation}
      />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/assistants" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Assistant Guide d'Accès</h1>
                <p className="text-xs text-gray-500">Générez un guide depuis votre vidéo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end flex-row-reverse' : ''}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  msg.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'
                }`}>
                  {msg.text}
                  {msg.sender === 'bot' && idx > 0 && (
                    <button
                      onClick={() => handleCopy(msg.text)}
                      className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors inline-flex items-center gap-1"
                      title="Copier"
                    >
                      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-500" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="text-sm text-gray-500 italic flex items-center gap-2 animate-pulse">
                <Video className="w-4 h-4 text-blue-600" />
                <span>Génération du guide en cours...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-24 right-8 bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              title="Aller en bas"
            >
              ↓
            </button>
          )}

          <div className="border-t border-gray-200 bg-white p-4">
            {selectedFile && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">{selectedFile.name}</span>
                  <span className="text-xs text-blue-500">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button onClick={removeFile} className="text-blue-600 hover:text-blue-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm transition-colors"
              >
                <Upload className="w-4 h-4" />
                Vidéo
              </label>

              <input
                type="text"
                placeholder="Décrivez ce que vous souhaitez..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />

              <button
                type="submit"
                disabled={loading || (!input.trim() && !selectedFile)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}