import { useEffect, useState } from 'react'
import { Bot, FileText, Brain, Sparkles } from 'lucide-react'

// Hook personnalisé pour les messages progressifs
const useProgressiveLoading = (loading, hasFile = false) => {
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentIcon, setCurrentIcon] = useState(Bot)
  const [dots, setDots] = useState('.')

  // Messages selon le contexte
  const messages = hasFile ? [
    { text: "L'IA analyse votre document", icon: FileText, duration: 8000 },
    { text: "Extraction des informations en cours", icon: Brain, duration: 12000 },
    { text: "Génération de la réponse personnalisée", icon: Sparkles, duration: 20000 },
    { text: "Finalisation de l'analyse", icon: Bot, duration: 60000 }
  ] : [
    { text: "L'IA analyse votre demande", icon: Bot, duration: 5000 },
    { text: "Recherche des informations pertinentes", icon: Brain, duration: 15000 },
    { text: "Génération de la réponse", icon: Sparkles, duration: 30000 },
    { text: "Finalisation en cours", icon: Bot, duration: 60000 }
  ]

  useEffect(() => {
    if (!loading) {
      setCurrentMessage('')
      return
    }

    let messageIndex = 0
    setCurrentMessage(messages[0].text)
    setCurrentIcon(messages[0].icon)

    const intervals = []

    // Timer pour changer les messages
    messages.forEach((msg, index) => {
      if (index > 0) {
        const timeout = setTimeout(() => {
          if (loading) { // Vérifier que loading est toujours true
            setCurrentMessage(msg.text)
            setCurrentIcon(msg.icon)
          }
        }, msg.duration)
        intervals.push(timeout)
      }
    })

    return () => {
      intervals.forEach(timeout => clearTimeout(timeout))
    }
  }, [loading, hasFile])

  // Animation des points
  useEffect(() => {
    const interval = setInterval(() => {
      if (loading) {
        setDots((prev) => (prev.length < 3 ? prev + '.' : '.'))
      }
    }, 500)
    return () => clearInterval(interval)
  }, [loading])

  return { currentMessage, currentIcon, dots }
}

export default useProgressiveLoading