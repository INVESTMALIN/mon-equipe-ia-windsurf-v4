import { Pencil, Lock, FileText, Sparkles, KeyRound } from 'lucide-react'
import { livrablesPresents } from '../../lib/ficheLivrables'

// Deux repères ajoutés aux cartes du dashboard : l'état d'édition de la fiche,
// et les livrables déjà produits. Présentation uniquement — la logique de preuve
// vit dans src/lib/ficheLivrables.js.

const ICONES = {
  pdf: FileText,
  annonce: Sparkles,
  guide: KeyRound,
}

// État d'édition, posé À CÔTÉ DU NOM et volontairement PAS sous forme de badge :
// la carte a déjà une pastille de statut, une deuxième pastille entrerait en
// concurrence avec elle. Une icône discrète se lit sans ajouter de niveau de
// lecture. Le sens passe par `title` (survol) et `aria-label` (lecteur d'écran),
// jamais par la seule forme de l'icône.
export function EtatEditionIcone({ locked, className = '' }) {
  const Icone = locked ? Lock : Pencil
  const libelle = locked
    ? 'Identité verrouillée après génération du PDF'
    : 'Identité du bien modifiable'

  return (
    <span
      title={libelle}
      aria-label={libelle}
      role="img"
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <Icone
        className={`h-4 w-4 ${locked ? 'text-gray-500' : 'text-gray-400'}`}
        aria-hidden="true"
      />
    </span>
  )
}

// Badges des livrables réellement produits.
//
// Rend `null` quand il n'y en a aucun : pas de ligne vide, pas de placeholder,
// pas de hauteur réservée. Les cartes d'une même rangée gardent une hauteur
// cohérente parce que la grille les étire, pas parce qu'on leur réserve une
// fausse zone (cf. Dashboard : `items-stretch` + `h-full` sur la carte).
// `wrapperClassName` porte l'habillage propre à l'appelant (filet séparateur en
// vue grille, simple espacement en vue liste). Il est rendu PAR ce composant et
// non autour de lui : l'appelant n'a donc pas à retester s'il y a des livrables,
// et il ne peut pas rester un filet orphelin au-dessus d'une ligne vide.
export function BadgesLivrables({ fiche, idsAvecAnnonce, className = '', wrapperClassName }) {
  const presents = livrablesPresents(fiche, idsAvecAnnonce)
  if (presents.length === 0) return null

  const liste = (
    <ul className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <li className="sr-only">Livrables générés :</li>
      {presents.map(({ cle, libelle }) => {
        const Icone = ICONES[cle]
        return (
          <li
            key={cle}
            title={`${libelle} généré`}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600 whitespace-nowrap"
          >
            <Icone className="h-3 w-3 shrink-0 text-[#dbae61]" aria-hidden="true" />
            {libelle}
          </li>
        )
      })}
    </ul>
  )

  return wrapperClassName ? <div className={wrapperClassName}>{liste}</div> : liste
}
