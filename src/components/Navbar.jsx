import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/connexion" className="text-lg font-semibold text-orange-600">
            Mon Équipe IA
          </Link>
          <Link to="/connexion" className="text-gray-700 hover:text-orange-600 font-medium">
            Connexion
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
