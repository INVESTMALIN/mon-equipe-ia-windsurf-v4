import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const Navbar = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/connexion')
  }

  return (
    <nav className="bg-white shadow-md w-full z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/mon-compte" className="text-lg font-semibold text-orange-600">
          Mon Équipe IA
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/contact" className="text-sm text-gray-700 hover:text-orange-600">
            Contact
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
