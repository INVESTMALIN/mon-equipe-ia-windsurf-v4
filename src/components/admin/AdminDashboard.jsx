import { Link } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white px-6 md:px-20 py-4">
        <div className="flex items-center justify-between">
          <Link to="/assistants" className="flex items-center gap-3 hover:text-[#dbae61] transition-colors">
            <img
              src="/images/invest-malin-logo.png"
              alt="Invest Malin Logo"
              className="h-8"
            />
            <span className="text-lg font-bold">MON ÉQUIPE IA</span>
          </Link>

          <Link
            to="/mon-compte"
            className="flex items-center gap-2 text-white hover:text-[#dbae61] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-20 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Espace admin</h1>
          <p className="text-gray-600">Gestion des utilisateurs</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-[#dbae61]" />
            <h2 className="text-xl font-bold text-black">Liste des utilisateurs</h2>
          </div>
          <p className="text-gray-600">À venir dans la prochaine itération.</p>
        </div>
      </div>
    </div>
  )
}
