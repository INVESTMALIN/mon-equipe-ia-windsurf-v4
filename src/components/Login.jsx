import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Erreur de login:', error.message)
      alert('Connexion échouée : ' + error.message)
      return
    }

    // Si succès
    console.log('Login réussi:', data)
    window.location.href = '/mon-compte'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fefdfc]">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Form Section */}
        <div className="flex-1 p-10">
          <h1 className="text-3xl font-bold text-orange-600 mb-4">Bienvenue sur<br />Mon Équipe IA</h1>
          <p className="text-gray-700 mb-8">Connectez-vous pour accéder à vos assistants IA personnalisés</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Adresse Mail</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                placeholder="Entrez votre Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mot de Passe</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                placeholder="Entrez votre Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-semibold"
            >
              Connexion
            </button>
          </form>
        </div>

        {/* Illustration */}
        <div className="hidden md:block md:w-1/2 bg-[#fdf7ee] flex items-center justify-center">
          <img src="/images/login-illustration.png" alt="Illustration" className="max-w-full h-auto" />
        </div>
      </div>
    </div>
  )
}
