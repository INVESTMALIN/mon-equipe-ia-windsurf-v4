import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'

const NotFound = () => {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
      <div
        className={`max-w-lg w-full p-10 bg-white rounded-xl shadow-2xl border border-gray-200 text-center space-y-6 transform transition-all duration-700 ${
          animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex justify-center animate-bounce-slow">
          <AlertTriangle className="text-[#dbae61] w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-black">Oups !</h1>
        <p className="text-gray-700 text-lg">
          La page que vous cherchez n’existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-block mt-4 px-6 py-3 bg-[#dbae61] text-white font-semibold rounded-full shadow transition-all duration-300 hover:bg-black hover:text-[#dbae61]"
        >
          Retour à l’accueil
        </Link>

      </div>

      <style>
        {`
          .animate-bounce-slow {
            animation: bounce-slow 2s infinite;
          }

          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}
      </style>
    </div>
  )
}

export default NotFound
