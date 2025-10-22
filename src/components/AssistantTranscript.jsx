import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, User, ArrowLeft, FileAudio, Upload, X, Copy, Check } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import SidebarConversations from './SidebarConversations'

export default function AssistantTranscript() {
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

    let id = localStorage.getItem('conversation_id_transcript')
    if (!id) {
      id = uuidv4()
      localStorage.setItem('conversation_id_transcript', id)
    }
    conversationIdRef.current = id
  }, [])

  const welcome = "Bonjour ! Je suis votre Assistant Transcription. Envoyez-moi un fichier audio ou vidéo et je le transcrirai automatiquement pour vous."

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
    
    // Validation du type de fichier (audio ET vidéo)
    const isMp4 = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')
    const isMp3 = file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')
    const isWebm = file.type === 'video/webm' || file.type === 'audio/webm' || file.name.toLowerCase().endsWith('.webm')
    const isWav = file.type === 'audio/wav' || file.type === 'audio/x-wav' || file.name.toLowerCase().endsWith('.wav')
    const isM4a = file.type === 'audio/mp4' || file.type === 'audio/x-m4a' || file.name.toLowerCase().endsWith('.m4a')
    
    if (!isMp4 && !isMp3 && !isWebm && !isWav && !isM4a) {
      alert('Veuillez sélectionner un fichier audio (MP3, WAV, M4A, WebM) ou vidéo (MP4, WebM) uniquement.')
      e.target.value = ''
      return
    }
    
    // Détection si c'est un fichier audio ou vidéo
    const isAudio = isMp3 || isWav || isM4a || (isWebm && file.type.startsWith('audio'))
    const maxSize = isAudio ? 10 * 1024 * 1024 : 350 * 1024 * 1024 // 10MB audio, 350MB vidéo
    
    if (file.size > maxSize) {
      const limitText = isAudio ? '10MB' : '350MB'
      alert(`Le fichier est trop volumineux. Taille maximum autorisée : ${limitText}.`)
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

    const userMessage = input.trim() || (selectedFile ? `[Fichier envoyé : ${selectedFile.name}]` : '')
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
          mimeType: selectedFile.type,
          fileSize: selectedFile.size
        }
      }
      
      console.log('📦 Payload envoyée:', payload) // <-- Ajoute ça


      const sessionId = `transcript_${conversationIdRef.current}`
      const payload = {
        sessionId,
        ...(input.trim() && { chatInput: userMessage }),
        ...(fileData && { files: [fileData] })
      }

      const res = await fetch('https://hub.cardin.cloud/webhook/396c1d02-5034-466e-865a-774764ccdaae', {
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
          source: 'assistant-transcript',
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
        errorMessage = 'La transcription a pris trop de temps (timeout 2 min). Essayez avec un fichier plus court.'
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
    localStorage.setItem('conversation_id_transcript', newId)
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
        .eq('source', 'assistant-transcript')
        .order('created_at', { ascending: true })

      if (error) throw error

      const loadedMessages = [{ sender: 'bot', text: welcome }]
      data.forEach(row => {
        loadedMessages.push({ sender: 'user', text: row.question })
        loadedMessages.push({ sender: 'bot', text: row.answer })
      })

      setMessages(loadedMessages)
      conversationIdRef.current = conversationId
      localStorage.setItem('conversation_id_transcript', conversationId)
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
    "Transcris ce fichier",
    "Transcription avec timestamps",
    "Résumé + transcription complète"
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarConversations
        activeId={conversationIdRef.current}
        onSelect={loadConversation}
        userId={userId}
        source="assistant-transcript"
        onNewConversation={handleNewConversation}
      />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/assistants" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] rounded-lg flex items-center justify-center">
                <FileAudio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Assistant Transcription</h1>
                <p className="text-xs text-gray-500">Transcrivez vos fichiers audio et vidéo</p>
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
                <FileAudio className="w-4 h-4 text-[#dbae61]" />
                <span>Transcription en cours...</span>
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
                  <FileAudio className="w-4 h-4 text-[#dbae61]" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button onClick={removeFile} className="text-[#dbae61] hover:text-[#c49a4f]">
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

            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Audio :</strong> MP3, WAV, M4A, WebM (10 MB max) • <strong>Vidéo :</strong> MP4, WebM (350 MB max)
              </p>
            </div>

            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".mp4,.mp3,.webm,.wav,.m4a,video/mp4,video/webm,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/webm"
                onChange={handleFileSelect}
                className="hidden"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm transition-colors"
              >
                <Upload className="w-4 h-4" />
                Fichier
              </label>

              <input
                type="text"
                placeholder="Ajoutez des instructions (optionnel)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] disabled:bg-gray-100"
              />

              <button
                type="submit"
                disabled={loading || (!input.trim() && !selectedFile)}
                className="px-6 py-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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