import { Link } from 'react-router-dom'

// Message affiché quand une inscription cible un email déjà présent en base.
// Sobre volontairement : on ne révèle rien de plus que l'existence du compte
// (ni rôle, ni ancienneté) pour ne pas exposer d'info exploitable.
// Partagé par les deux flux d'inscription (concierge + fiche_lite) pour garantir
// une formulation et des CTA STRICTEMENT identiques des deux côtés.
export default function AccountExistsNotice() {
  return (
    <div className="bg-[#dbae61] bg-opacity-10 border border-[#dbae61] rounded-lg p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-800">
        Un compte existe déjà avec cette adresse e-mail.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Link
          to="/connexion"
          className="flex-1 text-center bg-[#dbae61] hover:bg-[#c49a4f] text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Se connecter
        </Link>
        <Link
          to="/mot-de-passe-oublie"
          className="flex-1 text-center border border-[#dbae61] text-[#a07c32] hover:bg-[#dbae61] hover:bg-opacity-10 text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Réinitialiser mon mot de passe
        </Link>
      </div>
    </div>
  )
}
