import { Link } from 'react-router-dom'

export default function AssistantFormation() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Assistant Formation</h1>
      <p className="mb-6 text-gray-700">
        Bienvenue sur votre assistant IA pour la formation Invest Malin. Posez vos questions sur la formation et recevez des réponses instantanées.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Cette fonctionnalité sera bientôt disponible.
      </p>
      <Link to="/mon-compte" className="text-orange-600 hover:underline">
        ← Retour au tableau de bord
      </Link>
    </div>
  )
}

