import { useState } from 'react'

export default function TestStripe() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const testPortalSession = async () => {
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: 'test_without_customer', // On va tester sans customer d'abord
          return_url: window.location.origin + '/assistants'
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      // Récupérer la réponse en tant que texte d'abord
      const responseText = await response.text()
      console.log('Response text:', responseText)

      if (response.ok) {
        try {
          const data = JSON.parse(responseText)
          setResult('✅ API fonctionne ! URL: ' + data.url)
        } catch (e) {
          setResult('✅ Réponse OK mais JSON invalide: ' + responseText)
        }
      } else {
        setResult(`❌ Erreur ${response.status}: ${responseText}`)
      }
    } catch (error) {
      console.error('Network error:', error)
      setResult('❌ Erreur réseau: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Test API Stripe (Debug Mode)</h2>
      
      <button
        onClick={testPortalSession}
        disabled={loading}
        className="bg-[#dbae61] hover:bg-[#c49a4f] text-black font-bold px-6 py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Test en cours...' : 'Tester Portal Session'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Customer ID utilisé: cus_SlHT7tl0FqiMEB</p>
        <p>Vérifier aussi la console pour les logs détaillés</p>
      </div>
    </div>
  )
}