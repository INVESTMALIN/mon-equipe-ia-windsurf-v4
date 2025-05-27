export default function EmailConfirmation() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md border border-gray-200 text-center">
          <h1 className="text-2xl font-bold text-orange-600 mb-4">🎊 Email confirmé</h1>
          <p className="text-gray-700 mb-6">
            Votre adresse email a été vérifiée. Vous pouvez maintenant vous connecter à votre espace.
          </p>
          <a
            href="/connexion"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            Se connecter
          </a>
        </div>
      </div>
    )
  }
  