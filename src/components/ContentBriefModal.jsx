import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'

export default function ContentBriefModal({
  visible,
  onClose,
  onSubmit,
  onResponse,
  onReset,
  contentTypeLabel = 'contenu',
  aiText,
  aiImageUrl,
}) {
  const [theme, setTheme] = useState('')
  const [visualIdea, setVisualIdea] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    onReset?.()     
    onClose()           
    setTheme('')
    setVisualIdea('')
    setLoading(false)
  }
  
  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Appelle la fonction parent (qui gère le webhook)
      await onSubmit?.({ theme, visual_idea: visualIdea })
      
      // Reset les inputs une fois la génération lancée
      setTheme('')
      setVisualIdea('')
      
    } catch (error) {
      console.error('Erreur lors de la génération de contenu:', error)
      alert('Erreur lors de la génération. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour télécharger l'image base64
  const handleDownloadImage = () => {
    if (!aiImageUrl) return

    try {
      // Extraire le base64 pur (enlever le préfixe data:image/png;base64,)
      const base64Data = aiImageUrl.includes('base64,') 
        ? aiImageUrl.split('base64,')[1] 
        : aiImageUrl

      // Convertir base64 en blob
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })

      // Créer un lien temporaire et déclencher le download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `visuel-${contentTypeLabel}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Erreur téléchargement image:', error)
      alert('Erreur lors du téléchargement de l\'image')
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
        {/* Close button */}
        <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
            <X className="w-5 h-5" />
        </button>


        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Générer un {contentTypeLabel}
            </h2>
            <p className="text-sm text-gray-500">
              Indiquez un thème ou une idée visuelle (facultatif)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quel est le thème de cette publication ?
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex : mise en avant d’un témoignage client"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#dbae61]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avez-vous une idée visuelle ?
            </label>
            <input
              type="text"
              value={visualIdea}
              onChange={(e) => setVisualIdea(e.target.value)}
              placeholder="Ex : photo du salon, logo avec fond pastel…"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#dbae61]"
            />
          </div>

          <div className="text-sm text-gray-500 italic">
            🧠 Si vous ne remplissez rien, l’IA générera un contenu basé sur votre identité de marque.
          </div>

          {loading && (
            <div className="text-center text-sm text-gray-600 italic">
              ⏳ Génération en cours...
            </div>
          )}

          {(aiText || aiImageUrl) && (
            <div className="mt-6 space-y-4 border-t pt-4">
              {aiText && (
                <div>
                  <label className="text-sm font-medium">Texte généré</label>
                  <div className="mt-2 relative">
                    <textarea
                      className="w-full p-2 rounded-md border text-sm bg-gray-50"
                      rows={6}
                      readOnly
                      value={aiText}
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(aiText)}
                      className="absolute top-2 right-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              )}

              {aiImageUrl && (
                <div>
                  <label className="text-sm font-medium block mb-2">Visuel généré</label>
                  <img
                    src={aiImageUrl}
                    alt="Visuel généré"
                    className="rounded-md max-w-full border"
                  />
                <button
                    onClick={handleDownloadImage}
                    className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                    Télécharger le visuel
                </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-4 w-full ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#dbae61] hover:bg-[#c49a4f]'} text-white py-2 px-4 rounded-lg font-medium transition-colors`}
          >
            {loading ? 'Génération...' : 'Générer le contenu'}
          </button>
        </div>
      </div>
    </div>
  )
}