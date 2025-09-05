import { useState } from 'react'

export default function TestAssistantJuridique() {
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

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
      setInput('')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#dbae61] mb-6">Test Assistant Juridique avec PDF</h1>
      
      <form onSubmit={sendMessage} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Votre question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#dbae61]"
        />
        
        <div className="flex gap-2">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="flex-1 text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-6 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
        
        {selectedFile && (
          <p className="text-sm text-gray-600">
            Fichier sélectionné: {selectedFile.name}
          </p>
        )}
      </form>

      {response && (
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Réponse:</h3>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  )
}