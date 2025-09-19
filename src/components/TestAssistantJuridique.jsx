import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function TestAssistantJuridique() {
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Référence pour l'ID de conversation
  const conversationIdRef = useRef(null)
  
  // Générer un ID de conversation au montage du composant
  useEffect(() => {
    conversationIdRef.current = uuidv4()
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Veuillez sélectionner un fichier PDF uniquement.')
      e.target.value = ''
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
  
    setLoading(true)
    setResponse('')
  
    try {
      let requestBody = { 
        chatInput: input,
        sessionId: conversationIdRef.current
      }
      
      // Si un PDF est sélectionné, on l'ajoute dans le format attendu par n8n
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
  
      const res = await fetch('https://hub.cardin.cloud/webhook/350f827a-6a1e-44ec-ad67-e8c46f84fa70/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
  
      const data = await res.json()
      setResponse(data.output || 'Réponse indisponible.')
      
      // Reset le fichier après envoi
      setSelectedFile(null)
      document.querySelector('input[type="file"]').value = ''
      
    } catch (err) {
      console.error('Erreur:', err)
      setResponse('Erreur lors de la connexion à l\'agent.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Assistant Juridique</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Question juridique
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question juridique..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Document PDF (optionnel)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-1">
                  Fichier sélectionné: {selectedFile.name}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </form>
        </div>
        
        {response && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Réponse de l'Assistant</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm">{response}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}