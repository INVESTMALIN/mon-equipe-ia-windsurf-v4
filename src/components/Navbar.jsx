import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link to="/" className="flex items-center py-4">
                <span className="font-semibold text-gray-500 text-lg">Mon Équipe IA</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/connexion" className="py-4 px-2 text-gray-500 hover:text-gray-900">Connexion</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
