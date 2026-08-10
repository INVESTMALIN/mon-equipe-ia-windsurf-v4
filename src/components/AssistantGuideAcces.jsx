import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, User, ArrowLeft, Video, Upload, X, Copy, Check, FileText, Info } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import SidebarConversations from './SidebarConversations'
import ContextMenuButton from './ContextMenuButton'
import FicheSelector from './FicheSelector'
import { extractFicheContext } from '../lib/ficheContextHelper'
import HowItWorksDrawer from './HowItWorksDrawer'
import {
  GUIDE_ACCES_ACCEPT,
  GUIDE_ACCES_FORMATS_LABEL,
  GUIDE_ACCES_TAILLES_LABEL,
  genererGuideAcces,
  guideAccesErrorMessage,
  validateGuideAccesFile,
} from '../lib/guideAccesAgent'


export default function AssistantGuideAcces() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [userId, setUserId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showFicheSelector, setShowFicheSelector] = useState(false)
  const [selectedFiche, setSelectedFiche] = useState(null)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const conversationIdRef = useRef(null)

  useEffect(() => {
    const initConversation = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      let id = localStorage.getItem('conversation_id_annonce')
      
      // Vérifier si cet ID a déjà des messages en DB
      if (id && user) {
        const { data } = await supabase
          .from('conversations')
          .select('conversation_id')
          .eq('conversation_id', id)
          .eq('source', 'assistant-annonce')
          .eq('user_id', user.id)
          .limit(1)
        
        // Si conversation existe déjà, créer un nouvel ID
        if (data && data.length > 0) {
          id = uuidv4()
          localStorage.setItem('conversation_id_annonce', id)
        }
      }
      
      // Si pas d'ID du tout, en créer un nouveau
      if (!id) {
        id = uuidv4()
        localStorage.setItem('conversation_id_annonce', id)
      }
      
      conversationIdRef.current = id
    }
    
    initConversation()
  }, [])

  const welcome = "Bonjour ! Je suis votre Assistant Guide d'Accès.\n\nEnvoyez-moi une vidéo ou un audio où vous filmez et expliquez le chemin d'accès au logement : depuis un point identifiable dans la rue jusqu'à la porte de l'appartement. Parlez clairement et soyez explicite.\n\nVous pouvez aussi ajouter des détails dans le chat : parking, Wi-Fi, emplacement des clés, nombre de clés, étage, numéro d'appartement, etc.\n\nJe générerai ensuite un guide d'accès complet pour vos voyageurs."

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

    // Validation partagée avec le bloc inline de la fiche (cf. lib/guideAccesAgent) :
    // formats vidéo ET audio, plafonds de taille, fichier vide.
    const erreurFichier = validateGuideAccesFile(file)
    if (erreurFichier) {
      alert(erreurFichier)
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

    try {
      // Conversion base64 + appel webhook + lecture de la réponse : logique partagée
      // avec le bloc inline de la fiche (cf. lib/guideAccesAgent).
      const botResponse = await genererGuideAcces({
        sessionId: `guide_acces_${conversationIdRef.current}`,
        message: userMessage,
        file: selectedFile,
        context: selectedFiche ? extractFicheContext(selectedFiche) : null
      })

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
      setMessages(prev => [...prev, { sender: 'bot', text: guideAccesErrorMessage(error) }])
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

  const handleFicheSelect = () => {
    setShowFicheSelector(true)
  }

  const quickPrompts = [
    "Génère un guide d'accès depuis ce fichier",
    "Crée un guide avec une vidéo d'accès et les données de la fiche",
    "Enrichis le guide avec mes informations",
    "Crée un guide détaillé avec tout le contexte"
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
              <div className="w-10 h-10 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Assistant Guide d'Accès</h1>
                <p className="text-xs text-gray-500">Générez un guide depuis votre vidéo</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowHowItWorks(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-[#dbae61]"
            title="Comment ça marche ?"
          >
            <Info className="w-7 h-7" />
          </button>
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
                <Video className="w-4 h-4 text-[#dbae61]" />
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
              <div className="mb-3 p-3 bg-[#dbae61] bg-opacity-10 border border-[#dbae61] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#dbae61]" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button onClick={removeFile} className="text-[#dbae61] hover:text-[#c49a4f]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {showFicheSelector && (
              <FicheSelector 
                userId={userId}
                onSelect={(fiche) => {
                  setSelectedFiche(fiche)
                  setShowFicheSelector(false)
                }}
                onClose={() => setShowFicheSelector(false)}
              />
            )}

            {selectedFiche && (
              <div className="mb-3 p-3 bg-[#dbae61] bg-opacity-10 border border-[#dbae61] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#dbae61]" />
                  <span className="text-sm text-gray-700">Fiche: {selectedFiche.nom}</span>
                </div>
                <button 
                  onClick={() => setSelectedFiche(null)} 
                  className="text-[#dbae61] hover:text-[#c49a4f]"
                >
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
              <strong>Formats acceptés :</strong> {GUIDE_ACCES_FORMATS_LABEL} • <strong>Taille max :</strong> {GUIDE_ACCES_TAILLES_LABEL}              </p>
            </div>

            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept={GUIDE_ACCES_ACCEPT}
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
              />
              <ContextMenuButton 
                fileInputRef={fileInputRef}
                onFileSelect={handleFileSelect}
                onFicheSelect={handleFicheSelect}
              />

              <input
                type="text"
                placeholder="Décrivez ce que vous souhaitez..."
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
      <HowItWorksDrawer 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        activeAssistant="guide-acces"
      />
    </div>
  )
}