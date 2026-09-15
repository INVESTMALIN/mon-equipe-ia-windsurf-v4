import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
import { supabase } from '../../supabaseClient'

// En-tête commun des pages secondaires du parcours Fiche Logement Lite : /mes-credits,
// /mes-statistiques et la variante fiche_lite de /mon-compte. Un seul composant pour
// trois consommateurs, donc une seule largeur (celle du dashboard), une seule hauteur,
// une seule famille de boutons (h-11, arrondi xl, contour) et un seul comportement de
// déconnexion. Aucune marque Mon Équipe IA : cet en-tête n'est rendu qu'à un concierge.
//
// À gauche : titre + sous-titre propre à la page. À droite : « Tableau de bord » et la
// déconnexion, icône seule (44 × 44 px), nommée par `aria-label` et `title`.
//
// Déconnexion : on quitte la route AVANT le signOut, comme sur le dashboard.
// ProtectedRoute écoute SIGNED_OUT et renverrait sinon vers /connexion (la connexion
// générique Mon Équipe IA) avant que /connexion-fiche-logement ne s'affiche. En
// naviguant d'abord, ProtectedRoute est démonté quand l'événement arrive.

const BOUTON =
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbae61]'

export default function LitePageHeader({ titre, sousTitre }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    navigate('/connexion-fiche-logement')
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Mobile : le bloc titre prend la rangée, les actions passent en dessous
            (`flex-wrap`), aucune n'est cachée ni tronquée. Desktop : une seule rangée. */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{titre}</h1>
            {sousTitre && <p className="mt-1 text-gray-600">{sousTitre}</p>}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/dashboard" className={`${BOUTON} px-4`}>
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              Tableau de bord
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Se déconnecter"
              title="Se déconnecter"
              className={`${BOUTON} w-11 px-0`}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
