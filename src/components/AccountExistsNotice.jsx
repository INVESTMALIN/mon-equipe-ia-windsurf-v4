import { Link } from 'react-router-dom'

// Message affiché quand une inscription cible un email déjà présent en base.
// Sobre volontairement : on ne révèle rien de plus que l'existence du compte
// (ni rôle, ni ancienneté) pour ne pas exposer d'info exploitable.
// Ton "info actionnable", pas "erreur bloquante" : fond très légèrement teinté,
// bordure douce, texte normal, CTA en boutons ghost (pas de remplissage plein
// qui dupliquerait le CTA principal du formulaire).
// Partagé par les deux flux d'inscription (concierge + fiche_lite) pour garantir
// une formulation et des CTA STRICTEMENT identiques des deux côtés.
export default function AccountExistsNotice() {
  return (
    <div className="bg-[#dbae61] bg-opacity-5 border border-[#dbae61] border-opacity-25 rounded-lg p-4">
      <p className="text-sm text-gray-700 mb-3">
        Un compte existe déjà avec cette adresse e-mail.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Link
          to="/connexion"
          className="flex-1 flex items-center justify-center text-center border border-[#dbae61] text-[#a07c32] hover:bg-[#dbae61] hover:bg-opacity-10 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Se connecter
        </Link>
        <Link
          to="/mot-de-passe-oublie"
          className="flex-1 flex items-center justify-center text-center border border-[#dbae61] text-[#a07c32] hover:bg-[#dbae61] hover:bg-opacity-10 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Réinitialiser mon mot de passe
        </Link>
      </div>
    </div>
  )
}
