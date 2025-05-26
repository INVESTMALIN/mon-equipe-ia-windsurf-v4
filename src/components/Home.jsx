import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">Bienvenue sur Mon Équipe IA</h1>
        <p className="text-gray-700 mb-6">Connectez-vous pour accéder à vos assistants IA personnalisés.</p>
        <Link
          to="/connexion"
          className="inline-block bg-orange-500 text-white font-semibold px-6 py-3 rounded hover:bg-orange-600"
        >
          Connexion
        </Link>
      </div>
    </div>
  )
}

