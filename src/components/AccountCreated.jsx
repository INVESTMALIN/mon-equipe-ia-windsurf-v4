import { Link } from 'react-router-dom'

export default function AccountCreated() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md border border-gray-200 text-center">
        <h1 className="text-2xl font-bold text-orange-600 mb-4">Compte créé avec succès 🎉</h1>
        <p className="text-gray-700 mb-6">
          Vous pouvez maintenant vous connecter pour accéder à votre espace personnel.
        </p>
        <Link
          to="/connexion"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          Se connecter
        </Link>
      </div>
    </div>
  )
}

