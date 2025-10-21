import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, User, ArrowLeft, Scale, Upload, FileText, X, Copy, Check } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import SidebarConversations from './SidebarConversations'
import useProgressiveLoading from '../hooks/useProgressiveLoading'


export default function AssistantJuridique() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [userId, setUserId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [copied, setCopied] = useState(false)
  const conversationIdRef = useRef(null)
  const { currentMessage, currentIcon: LoadingIcon, dots } = useProgressiveLoading(loading, selectedFile !== null)


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id)
    })

    let id = localStorage.getItem('conversation_id_juridique')
    if (!id) {
      id = uuidv4()
      localStorage.setItem('conversation_id_juridique', id)
    }
    conversationIdRef.current = id
  }, [])

  const welcome = "Salut ! Je suis votre Assistant LegalBNB IA. ⚖️"

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
    
    // Validation du type de fichier
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')
    
    if (!isPdf && !isDocx) {
      alert('Veuillez sélectionner un fichier PDF ou DocX uniquement.')
      e.target.value = ''
      return
    }
    
    // Validation de la taille (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('Le fichier est trop volumineux. Taille maximum autorisée : 10MB.')
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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ✅ FIX AUTO-SCROLL : Refs pour scroll intelligent
  const fileInputRef = useRef(null)
  const listRef = useRef(null)
  const endRef = useRef(null) 
  const shouldStickRef = useRef(true)

  // Helper pour détecter si on est proche du bas
  const isNearBottom = (el) => el ? (el.scrollHeight - el.scrollTop - el.clientHeight) < 40 : true

  // ✅ AUTO-SCROLL : Scroll quand messages changent si l'utilisateur était en bas
  useEffect(() => {
    if (shouldStickRef.current) {
      endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
    }
  }, [messages])

  // ✅ AUTO-SCROLL : Listener pour détecter le scroll utilisateur
  useEffect(() => {
    const el = listRef.current
    const onScroll = () => { 
      shouldStickRef.current = isNearBottom(el)
      setShowScrollButton(!shouldStickRef.current)
    }
    el?.addEventListener('scroll', onScroll)
    return () => el?.removeEventListener('scroll', onScroll)
  }, [])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !userId) return
  
    // Capturer l'état avant d'ajouter le message
    shouldStickRef.current = isNearBottom(listRef.current)
  
    const newMessage = { sender: 'user', text: input }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    const userInput = input
    setInput('')
    setLoading(true)
  
    try {
      let requestBody = {
        chatInput: userInput,
        sessionId: conversationIdRef.current
      }
  
      // Si un fichier est sélectionné, on l'ajoute
      if (selectedFile) {
        // Guards sur la taille du fichier
        if (selectedFile.size === 0) {
          throw new Error('HTTP 400 - Fichier vide')
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
          throw new Error('HTTP 413 - Fichier trop volumineux (max 10MB)')
        }
  
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
          mimeType: selectedFile.type || 'application/pdf'
        }]
      }
  
      // AbortController pour timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)
  
      const res = await fetch('https://hub.cardin.cloud/webhook/350f827a-6a1e-44ec-ad67-e8c46f84fa70/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
  
      clearTimeout(timeoutId)
  
      // Lire le corps d'erreur avant de throw
      if (!res.ok) {
        let errText = null
        try {
          errText = await res.text()
        } catch {}
        const tail = errText ? ` - ${errText.slice(0, 200)}` : ''
        throw new Error(`HTTP ${res.status}${tail}`)
      }
  
      // Gérer le cas JSON invalide
      let data
      try {
        data = await res.json()
      } catch (jsonError) {
        throw new Error(`Réponse invalide du serveur (JSON malformé)`)
      }
  
      const reply = { sender: 'bot', text: data.output || 'Réponse indisponible.' }
      setMessages((prev) => [...prev, reply])
  
      // Détecter si c'est le premier message utilisateur
      const isFirstUserMessage = messages.every(m => m.sender !== 'user')
      const title = isFirstUserMessage ? userInput.slice(0, 80) : undefined

      await supabase.from('conversations').insert({
        source: 'assistant-juridique',
        question: userInput,
        answer: reply.text,
        conversation_id: conversationIdRef.current,
        user_id: userId,
        ...(title ? { title } : {})   // Titre écrit dès l'INSERT du premier message
      })

      // Force le refresh de la sidebar immédiatement
      window.dispatchEvent(new CustomEvent('refreshSidebar'))
  
      // Reset fichier avec useRef
      setSelectedFile(null)
      fileInputRef.current && (fileInputRef.current.value = '')
  
    } catch (err) {
      console.error('Erreur sendMessage:', err)
      let errorText = 'Une erreur est survenue. Veuillez réessayer.'
      
      if (err.name === 'AbortError') {
        errorText = 'Délai d\'attente dépassé (2 minutes). Réessayez ou contactez le support.'
      } else if (err.message?.includes('HTTP 400')) {
        errorText = 'Fichier vide ou invalide. Veuillez sélectionner un fichier valide.'
      } else if (err.message?.includes('HTTP 413')) {
        errorText = 'Fichier trop volumineux (max 10MB). Réduisez la taille et réessayez.'
      } else if (err.message?.includes('HTTP 429')) {
        errorText = 'Trop de requêtes. Attendez quelques instants avant de réessayer.'
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        errorText = 'Problème de connexion réseau. Vérifiez votre connexion internet.'
      } else if (err.message?.includes('HTTP 5')) {
        errorText = 'Le serveur rencontre un problème temporaire. Réessayez dans quelques minutes.'
      } else if (err.message?.includes('JSON')) {
        errorText = 'Réponse serveur invalide. Contactez le support si le problème persiste.'
      }
  
      setMessages((prev) => [...prev, { sender: 'bot', text: errorText }])
    } finally {
      setLoading(false)
    }
  }

  const loadConversation = async (conversationId) => {
    if (!userId) return
  
    const { data, error } = await supabase
      .from('conversations')
      .select('question, answer, created_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .eq('source', 'assistant-juridique')
      .order('created_at', { ascending: true })
  
    if (error) {
      console.error(error)
      return
    }
  
    const loadedMessages = []
    data.forEach(row => {
      // ✅ Éviter de charger les placeholders
      if (row.question && row.question !== '(Nouvelle conversation)') {
        loadedMessages.push({ sender: 'user', text: row.question })
      }
      if (row.answer) {
        loadedMessages.push({ sender: 'bot', text: row.answer })
      }
    })
  
    setMessages(loadedMessages)
    conversationIdRef.current = conversationId
    localStorage.setItem('conversation_id_juridique', conversationId)
  }

  const createNewConversation = async () => {
    const newId = uuidv4()
    localStorage.setItem('conversation_id_juridique', newId)
    conversationIdRef.current = newId
    setMessages([{ sender: 'bot', text: welcome }])
  
    if (userId) {
      await supabase.from('conversations').insert({
        user_id: userId,
        source: 'assistant-juridique',
        conversation_id: newId,
        title: 'Nouvelle conversation',
        question: '',
        answer: ''
      })
      
      // ✅ FORCER le refresh de la sidebar immédiatement
      window.dispatchEvent(new CustomEvent('refreshSidebar'))
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarConversations
        activeId={conversationIdRef.current}
        onSelect={loadConversation}
        userId={userId}
        source="assistant-juridique"
        onNewConversation={createNewConversation}
      />

      <div className="flex-1 flex flex-col">
        {/* Header moderne unifié */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/assistants" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Assistant LegalBNB</h1>
                <p className="text-xs text-gray-500">Expert juridique location courte durée</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div ref={listRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end flex-row-reverse' : ''}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  msg.sender === 'user' ? 'bg-[#dbae61] bg-opacity-10 text-right ml-auto' : 'bg-gray-100 text-left'
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
                <LoadingIcon className="w-4 h-4 text-[#dbae61]" />
                <span>{currentMessage}{dots}</span>
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
              <div className="mb-3 p-3 bg-[#dbae61] bg-opacity-10 border border-[#dbae61] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#dbae61]" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button onClick={removeFile} className="text-[#dbae61] hover:text-[#c49a4f]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setInput("Puis-je sous-louer mon appartement ?")}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700 transition-colors"
              >
                Puis-je sous-louer mon appartement ?
              </button>
              <button
                onClick={() => setInput("Quelles sont mes obligations fiscales ?")}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700 transition-colors"
              >
                Quelles sont mes obligations fiscales ?
              </button>
              <button
                onClick={() => setInput("Règlement de copropriété et location courte durée")}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700 transition-colors"
              >
                Règlement de copropriété
              </button>
            </div>

            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Formats acceptés :</strong> PDF, DocX • <strong>Taille max :</strong> 10 MB
              </p>
            </div>

            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm transition-colors"
              >
                <Upload className="w-4 h-4" />
                Fichier
              </label>

              <input
                type="text"
                placeholder="Posez votre question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] disabled:bg-gray-100"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Réponses générées par IA, à vérifier. Ce service ne remplace pas un conseil juridique.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}