import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, User, BarChart3, LogOut } from 'lucide-react'

// Menu utilisateur du dashboard Fiche Logement Lite : regroupe « Mon compte »,
// « Mes statistiques » et « Se déconnecter » derrière un seul déclencheur, pour que
// la barre d'actions ne porte que des actions métier (Nouvelle fiche, Recharger).
//
// Le déclencheur est une pastille à l'initiale du prénom. En desktop (≥ sm) il affiche
// aussi le prénom et un chevron ; en mobile il reste compact (pastille seule, 44 px de
// zone tactile) et vit à droite du titre, hors de la grille des actions.
//
// Fermeture : clic en dehors, Échap (focus rendu au déclencheur), ou choix d'une entrée.
export default function UserMenu({ prenom, email, onLogout, className = '' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Initiale du prénom, sinon de l'email, sinon une icône : le profil peut ne pas avoir
  // de prénom (inscription sans le renseigner).
  const label = (prenom || '').trim()
  const initial = (label || email || '').trim().charAt(0).toUpperCase()

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label ? `Menu de ${label}` : 'Menu utilisateur'}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbae61] w-11 sm:w-auto sm:rounded-xl sm:pl-1.5 sm:pr-3"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dbae61] bg-opacity-20 text-sm font-bold text-[#8b7355]"
        >
          {initial || <User className="h-4 w-4" />}
        </span>
        {label && <span className="hidden max-w-[10rem] truncate sm:inline">{label}</span>}
        <ChevronDown
          className={`hidden h-4 w-4 shrink-0 text-gray-400 transition-transform sm:inline ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {/* Rappel de l'identité : utile en mobile, où le déclencheur n'affiche pas le prénom. */}
          <div className="border-b border-gray-100 px-4 py-3">
            {label && <p className="truncate text-sm font-semibold text-gray-900">{label}</p>}
            {email && <p className="truncate text-xs text-gray-500">{email}</p>}
          </div>
          <Link
            to="/mon-compte"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <User className="h-4 w-4 text-gray-500" />
            Mon compte
          </Link>
          <Link
            to="/mes-statistiques"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <BarChart3 className="h-4 w-4 text-gray-500" />
            Mes statistiques
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4 text-gray-500" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}
