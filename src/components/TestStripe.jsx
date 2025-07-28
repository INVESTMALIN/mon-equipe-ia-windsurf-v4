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
          customer_id: 'cus_SlHT7tl0FqiMEB',
          return_url: window.location.origin + '/assistants'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult('✅ API fonctionne ! URL: ' + data.url)
      } else {
        setResult('❌ Erreur: ' + data.error)
      }
    } catch (error) {
      setResult('❌ Erreur réseau: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Test API Stripe</h2>
      
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
    </div>
  )
}