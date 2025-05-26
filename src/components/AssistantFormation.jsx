import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BotIcon, UserIcon } from 'lucide-react'

export default function AssistantFormation() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Message de bienvenue local (pas lié à n8n)
    setMessages([{ sender: 'bot', text: 'Bienvenue ! Posez-moi votre question sur la formation Invest Malin.' }])
  }, [])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage = { sender: 'user', text: input }
    setMessages((prev) => [...prev, newMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('https://hub.cardin.cloud/webhook-test/3bab9cc1-054f-4f06-b192-3baac53aa367', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      const data = await res.json()
      const reply = { sender: 'bot', text: data.output || 'Réponse indisponible.' }
      setMessages((prev) => [...prev, reply])
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Erreur lors de la connexion à l’agent.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Assistant Formation</h1>
      <p className="text-gray-700 mb-6">Posez vos questions sur la formation Invest Malin. Réponses instantanées assurées.</p>

      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 h-[500px] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && <BotIcon className="w-5 h-5 text-orange-500 mr-2 mt-1" />}
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${msg.sender === 'user'
                  ? 'bg-orange-100 text-right'
                  : 'bg-gray-100 text-left'}`}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && <UserIcon className="w-5 h-5 text-gray-500 ml-2 mt-1" />}
            </div>
          ))}
          {loading && (
            <div className="text-sm text-gray-500 italic">L’IA réfléchit...</div>
          )}
        </div>

        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Posez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            Envoyer
          </button>
        </form>
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <Link to="/mon-compte" className="text-orange-600 hover:underline">
          ← Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
