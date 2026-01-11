import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileAudio, Upload, X, CheckCircle, Clock, AlertCircle, Info } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import HowItWorksDrawer from './HowItWorksDrawer'

export default function AssistantTranscript() {
  const [userId, setUserId] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [sendHistory, setSendHistory] = useState([])
  const [toast, setToast] = useState(null)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('email')
          .eq('id', user.id)
          .single()
        
        if (!error && userProfile) {
          setUserEmail(userProfile.email)
        }

        // Charger l'historique des envois
        loadSendHistory(user.id)
      }
    }
    
    initUser()
  }, [])

  const loadSendHistory = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('question, answer, created_at')
        .eq('user_id', uid)
        .eq('source', 'assistant-transcript')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setSendHistory(data)
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error)
    }
  }

  const clearHistory = async () => {
    if (!userId) return
    
    const confirmed = window.confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')
    if (!confirmed) return
  
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', userId)
        .eq('source', 'assistant-transcript')
  
      if (!error) {
        setSendHistory([])
        showToast('Historique effacé', 'success')
      }
    } catch (error) {
      console.error('Erreur suppression historique:', error)
      showToast('Erreur lors de la suppression', 'error')
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const handleFileSelect = (file) => {
    if (!file) return
    
    // Validation du type de fichier (audio ET vidéo)
    const isMp4 = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')
    const isMp3 = file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')
    const isWebm = file.type === 'video/webm' || file.type === 'audio/webm' || file.name.toLowerCase().endsWith('.webm')
    const isWav = file.type === 'audio/wav' || file.type === 'audio/x-wav' || file.name.toLowerCase().endsWith('.wav')
    const isM4a = file.type === 'audio/mp4' || file.type === 'audio/x-m4a' || file.name.toLowerCase().endsWith('.m4a')
    const isMov = file.type === 'video/quicktime' || file.name.toLowerCase().endsWith('.mov')
  
    if (!isMp4 && !isMp3 && !isWebm && !isWav && !isM4a && !isMov) {
      showToast('Veuillez sélectionner un fichier audio (MP3, WAV, M4A, WebM) ou vidéo (MP4, MOV, WebM) uniquement.', 'error')
      return
    }
    
  // Limite Railway : 500 Mo
  if (file.size > 500 * 1024 * 1024) {
    showToast('Le fichier est trop volumineux (max 500 Mo). Veuillez compresser votre vidéo.', 'error')
    return
  }
    
    // Détection si c'est un fichier audio ou vidéo
    const isAudio = isMp3 || isWav || isM4a || (isWebm && file.type.startsWith('audio'))
    const maxSize = isAudio ? 10 * 1024 * 1024 : 350 * 1024 * 1024 // 10MB audio, 350MB vidéo
    
    if (file.size > maxSize) {
      const limitText = isAudio ? '10MB' : '350MB'
      showToast(`Le fichier est trop volumineux. Taille maximum autorisée : ${limitText}.`, 'error')
      return
    }
    
    // Validation fichier vide
    if (file.size === 0) {
      showToast('Le fichier sélectionné est vide.', 'error')
      return
    }
    
    setSelectedFile(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const sendFile = async () => {
    if (!selectedFile || loading) return
  
    setLoading(true)
  
    try {
      const sessionId = uuidv4()
      const formData = new FormData()
      formData.append('sessionId', sessionId)
      if (userEmail) formData.append('userEmail', userEmail)
      formData.append('file', selectedFile)
  
      console.log('📦 Envoi fichier:', selectedFile.name, selectedFile.size, 'bytes')
  
      // ✅ ATTENDRE la réponse au lieu de "fire and forget"
      const response = await fetch('https://video-compressor-production.up.railway.app/extract-and-transcript', {
        method: 'POST',
        body: formData
      })
  
      const responseText = await response.text().catch(() => '')
      console.log('📬 Réponse serveur:', response.status, response.statusText, responseText)
  
      // ✅ Vérifier si ça a vraiment marché
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
  
      const successMessage = `Fichier envoyé avec succès ! Vous recevrez la transcription par email à : ${userEmail}`
  

      // Sauvegarder dans l'historique
      if (userId) {
        await supabase.from('conversations').insert({
          user_id: userId,
          source: 'assistant-transcript',
          question: `[Fichier envoyé : ${selectedFile.name}]`,
          answer: successMessage,
          conversation_id: sessionId
        })

        // Recharger l'historique
        loadSendHistory(userId)
      }

      // Afficher le toast de succès
      showToast(successMessage, 'success')

      removeFile()
    } catch (error) {
      console.error('Erreur:', error)
      showToast('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
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
        
        <button
          onClick={() => setShowHowItWorks(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Comment ça marche ?"
        >
          <Info className="w-6 h-6 text-gray-600 hover:text-[#dbae61]" />
        </button>
      </div>
    </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Comment ça marche ?</h2>
          <ol className="space-y-2 text-sm text-gray-600 mb-4">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#dbae61]">1.</span>
              <span>Glissez-déposez votre fichier audio ou vidéo dans la zone ci-dessous, ou cliquez pour sélectionner un fichier</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#dbae61]">2.</span>
              <span>Cliquez sur "Envoyer pour transcription"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-[#dbae61]">3.</span>
              <span>Recevez votre transcription par email à l'adresse : <strong className="text-gray-900">{userEmail}</strong></span>
            </li>
          </ol>
        </div>

        {/* Upload Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 transition-all ${
              dragActive 
                ? 'border-[#dbae61] bg-[#dbae61] bg-opacity-5' 
                : selectedFile 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-[#dbae61] hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleInputChange}
              accept=".mp4,.mov,.mp3,.webm,.wav,.m4a,video/mp4,video/quicktime,video/webm,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/webm"
              className="hidden"
              id="file-upload"
            />

            {!selectedFile ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#dbae61] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-[#dbae61]" />
                </div>
                <p className="text-gray-900 font-medium mb-2">
                  Glissez-déposez votre fichier ici
                </p>
                <p className="text-sm text-gray-500 mb-4">ou</p>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg cursor-pointer font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Sélectionner un fichier
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  <strong>Audio :</strong> MP3, WAV, M4A, WebM (10 MB max) • <strong>Vidéo :</strong> MP4, WebM (350 MB max)
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-900 font-medium mb-1">Fichier sélectionné</p>
                <p className="text-sm text-gray-600 mb-1">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mb-4">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={sendFile}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Envoyer pour transcription
                      </>
                    )}
                  </button>
                  <button
                    onClick={removeFile}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delay warning */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Temps de traitement</p>
              <p className="text-blue-700">
                Le délai de transcription varie en fonction de la taille et de la durée de votre fichier. 
                Comptez quelques minutes pour les fichiers courts, jusqu'à 10 minutes pour les fichiers lourds.
              </p>
            </div>
          </div>

          {/* Divider */}
          {sendHistory.length > 0 && (
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 px-4 text-sm text-gray-500">Vos 10 derniers envois</span>
              </div>
            </div>
          )}

        {/* Send History */}
        {sendHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#dbae61]" />
                Historique
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-red-600 hover:text-red-700 hover:underline"
              >
                Tout effacer
              </button>
            </h2>
            <div className="space-y-3">
              {sendHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="w-8 h-8 bg-[#dbae61] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileAudio className="w-4 h-4 text-[#dbae61]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.question}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      <CheckCircle className="w-3 h-3" />
                      Envoyé
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-md ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`flex-shrink-0 ${
              toast.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                toast.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className={`flex-shrink-0 ${
                toast.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <HowItWorksDrawer 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        activeAssistant="guide-acces"
      />
    </div>
  )
}