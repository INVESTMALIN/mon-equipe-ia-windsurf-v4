import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, User, ArrowLeft, Brain, Sparkles, Upload, FileText, X } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import SidebarConversations from './SidebarConversations'
import useProgressiveLoading from '../hooks/useProgressiveLoading'

export default function AssistantAnnonce() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [userId, setUserId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const conversationIdRef = useRef(null)
  const { currentMessage, currentIcon: LoadingIcon, dots } = useProgressiveLoading(loading, selectedFile !== null)


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
  
      const res = await fetch('https://hub.cardin.cloud/webhook/00297790-8d18-44ff-b1ce-61b8980d9a46/chat', {
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
        source: 'assistant-annonce',
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
      console.error('Erreur webhook:', err)
      
      let errorMessage = "Une erreur est survenue, merci de réessayer dans quelques instants."
      
      if (err.name === 'AbortError') {
        errorMessage = "La requête a expiré (30s). Merci de réessayer."
      } else if (err.message?.includes('HTTP 504')) {
        errorMessage = "L'assistant prend plus de temps que prévu à analyser votre demande. Merci de réessayer dans quelques instants.\n\nSi le problème persiste, contactez le support : contact@invest-malin.com"
      } else if (err.message?.includes('HTTP 500') || err.message?.includes('HTTP 502') || err.message?.includes('HTTP 503')) {
        errorMessage = "Une erreur technique s'est produite côté serveur. Notre équipe technique a été notifiée automatiquement.\n\nMerci de réessayer dans quelques instants."
      } else if (err.message?.includes('HTTP 413')) {
        errorMessage = "Le fichier est trop volumineux. Merci d'utiliser un fichier de moins de 10MB."
      } else if (err.message?.includes('HTTP 400')) {
        errorMessage = "Problème avec votre demande. Vérifiez le fichier sélectionné et réessayez."
      } else if (err.message?.includes('HTTP 401') || err.message?.includes('HTTP 403')) {
        errorMessage = "Problème d'autorisation. Merci de vous reconnecter ou de contacter le support."
      } else if (err.message?.includes('JSON malformé')) {
        errorMessage = "Erreur de communication avec le serveur. Merci de réessayer."
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        errorMessage = "Problème de connexion réseau. Vérifiez votre connexion internet et réessayez."
      }
      
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: errorMessage 
      }])
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

          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <SidebarConversations
            activeId={conversationIdRef.current}
            onSelect={loadConversation}
            userId={userId}
            source="assistant-annonce"
            onNewConversation={createNewConversation}
        />
        
        <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full">
          {/* Titre avec même style qu'Assistant Formation */}
          <h1 className="text-3xl font-bold text-[#dbae61] mb-1">Assistant Annonce IA</h1>
          <p className="text-gray-700 mb-6">Créez des annonces optimisées qui maximisent vos réservations. Réponses instantanées assurées.</p>

          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 h-[600px] flex flex-col overflow-hidden relative">
            <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end flex-row-reverse' : ''}`}>
                  {msg.sender === 'bot' && <Bot className="w-4 h-4 text-[#dbae61] mt-1" />}
                  {msg.sender === 'user' && <User className="w-4 h-4 text-gray-400 mt-1" />}
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
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
                  ref={fileInputRef}
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer text-sm transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Pièce jointe
                </label>
                <span className="text-xs text-gray-500">Fiche logement, règlements...</span>
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