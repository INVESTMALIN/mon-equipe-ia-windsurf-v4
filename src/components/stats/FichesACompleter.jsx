import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ListChecks, Check, Minus, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Section, EtatIndisponible, EtatVide } from './Section'

// Bloc « Fiches à compléter » : les fiches ACTIVES à qui il manque au moins une famille
// de livrables, avec un lien direct vers chacune. Les états présents / manquants sont
// écrits en toutes lettres et portés par une icône distincte : la couleur n'est jamais
// la seule information.

const FAMILLES = [
  { cle: 'pdf', libelle: 'PDF' },
  { cle: 'annonce', libelle: 'Annonce' },
  { cle: 'guide', libelle: 'Guide d’accès' },
]

const FILTRES = [
  { cle: 'toutes', libelle: 'Toutes', garde: () => true },
  { cle: 'pdf', libelle: 'PDF manquant', garde: (e) => e.manquants.includes('pdf') },
  { cle: 'annonce', libelle: 'Annonce manquante', garde: (e) => e.manquants.includes('annonce') },
  { cle: 'guide', libelle: 'Guide manquant', garde: (e) => e.manquants.includes('guide') },
]

export default function FichesACompleter({ aCompleter, fichesActives, erreurAnnonces, onRetryAnnonces }) {
  const [filtre, setFiltre] = useState('toutes')

  let contenu
  if (erreurAnnonces) {
    contenu = (
      <EtatIndisponible
        message="Les annonces n’ont pas pu être lues : impossible de dire ce qu’il manque à chaque fiche."
        onRetry={onRetryAnnonces}
      />
    )
  } else if (fichesActives === 0) {
    contenu = <EtatVide titre="Aucune fiche active" texte="Rien à compléter tant qu’aucune fiche n’est en cours." />
  } else if (aCompleter.length === 0) {
    contenu = (
      <div className="flex items-start gap-3 rounded-xl border border-[#dbae61]/40 bg-[#dbae61]/10 px-5 py-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#8b7355]" aria-hidden="true" />
        <div>
          <p className="font-semibold text-gray-900">Toutes vos fiches actives ont leurs trois livrables.</p>
          <p className="mt-0.5 text-sm text-gray-600">PDF, annonce et guide d’accès : rien ne manque.</p>
        </div>
      </div>
    )
  } else {
    const actif = FILTRES.find((f) => f.cle === filtre) || FILTRES[0]
    const visibles = aCompleter.filter(actif.garde)
    contenu = (
      <>
        {/* Filtres : boutons à bascule, 44 px de haut, état porté par aria-pressed */}
        <div role="group" aria-label="Filtrer les fiches à compléter" className="flex flex-wrap gap-2">
          {FILTRES.map((f) => {
            const n = aCompleter.filter(f.garde).length
            const selectionne = f.cle === actif.cle
            return (
              <button
                key={f.cle}
                type="button"
                aria-pressed={selectionne}
                onClick={() => setFiltre(f.cle)}
                className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#dbae61] ${
                  selectionne ? 'bg-[#dbae61] text-white shadow-md' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.libelle}
                <span className={`rounded-full px-2 py-0.5 text-xs ${selectionne ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{n}</span>
              </button>
            )
          })}
        </div>

        {visibles.length === 0 ? (
          <p className="mt-5 text-sm text-gray-600">Aucune fiche ne correspond à ce filtre.</p>
        ) : (
          <ul className="mt-5 divide-y divide-gray-100">
            {visibles.map(({ fiche, etat }) => (
              <li key={fiche.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <Link
                      to={`/fiche?id=${fiche.id}`}
                      className="block min-w-0 truncate font-semibold text-gray-900 hover:text-[#8b7355] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbae61] rounded"
                    >
                      {fiche.nom}
                    </Link>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${fiche.statut === 'Complété' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {fiche.statut === 'Complété' ? 'Complété' : 'Brouillon'}
                    </span>
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {FAMILLES.map(({ cle, libelle }) =>
                      etat[cle] ? (
                        <li key={cle} className="inline-flex items-center gap-1 text-gray-600">
                          <Check className="h-4 w-4 shrink-0 text-[#8b7355]" aria-hidden="true" />
                          {libelle} présent{cle === 'annonce' ? 'e' : ''}
                        </li>
                      ) : (
                        <li key={cle} className="inline-flex items-center gap-1 font-semibold text-gray-900">
                          <Minus className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                          {libelle} manquant{cle === 'annonce' ? 'e' : ''}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <Link
                  to={`/fiche?id=${fiche.id}`}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbae61]"
                >
                  Ouvrir la fiche
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </>
    )
  }

  return (
    <Section icone={ListChecks} titre="Fiches à compléter" sousTitre="Vos fiches actives à qui il manque au moins un livrable">
      {contenu}
    </Section>
  )
}
