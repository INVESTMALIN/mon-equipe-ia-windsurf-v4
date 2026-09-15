import { Link } from 'react-router-dom'
import { FileText, Megaphone, KeyRound, CheckCircle2, Circle } from 'lucide-react'
import { Section, EtatIndisponible, EtatVide } from './Section'
import { pourcentage } from '../../lib/ficheStats'

// Bloc « Mes livrables » : couverture des trois familles sur les fiches ACTIVES,
// en formulation humaine (« 8 fiches sur 10 ont leur PDF »), barre sobre, pourcentage
// en complément de la fraction, jamais à sa place.

const FAMILLES = [
  { cle: 'pdf', icone: FileText, phrase: (n, t) => `${n} fiche${n > 1 ? 's' : ''} sur ${t} ${n > 1 ? 'ont' : 'a'} ${n > 1 ? 'leur' : 'son'} PDF` },
  { cle: 'annonce', icone: Megaphone, phrase: (n, t) => `${n} fiche${n > 1 ? 's' : ''} sur ${t} ${n > 1 ? 'ont' : 'a'} une annonce` },
  { cle: 'guide', icone: KeyRound, phrase: (n, t) => `${n} fiche${n > 1 ? 's' : ''} sur ${t} ${n > 1 ? 'ont' : 'a'} ${n > 1 ? 'leur' : 'son'} guide d’accès` },
]

export default function CouvertureLivrables({ couverture, erreurAnnonces, onRetryAnnonces }) {
  return (
    <Section icone={FileText} titre="Mes livrables" sousTitre="Sur vos fiches actives, les archivées ne sont pas comptées">
      {erreurAnnonces ? (
        <EtatIndisponible
          message="Les annonces n’ont pas pu être lues : la couverture des livrables ne peut pas être calculée."
          onRetry={onRetryAnnonces}
        />
      ) : couverture.fichesActives === 0 ? (
        <EtatVide
          titre="Aucune fiche active"
          texte="Créez une fiche pour commencer à produire vos PDF, annonces et guides d’accès."
          action={
            <Link to="/dashboard" className="inline-flex h-11 items-center rounded-xl bg-[#dbae61] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#c49a4f] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#dbae61]">
              Aller au tableau de bord
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-5">
            {FAMILLES.map(({ cle, icone, phrase }) => {
              const Icone = icone
              const n = couverture[cle]
              const t = couverture.fichesActives
              const pct = pourcentage(n, t)
              return (
                <li key={cle}>
                  <div className="flex items-start justify-between gap-4">
                    <p className="flex items-center gap-2 font-semibold text-gray-900">
                      <Icone className="h-4 w-4 shrink-0 text-[#dbae61]" aria-hidden="true" />
                      {phrase(n, t)}
                    </p>
                    <span className="shrink-0 text-sm font-semibold text-gray-500">{pct ?? 0} %</span>
                  </div>
                  <div
                    className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={t}
                    aria-valuenow={n}
                    aria-label={phrase(n, t)}
                  >
                    <div className="h-full rounded-full bg-[#dbae61]" style={{ width: `${pct ?? 0}%` }} />
                  </div>
                  {cle === 'annonce' && (
                    <p className="mt-1.5 text-sm text-gray-500">
                      Airbnb : {couverture.airbnb} · Booking : {couverture.booking}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>

          <ul className="mt-6 grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2">
            <li className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#dbae61]" aria-hidden="true" />
              <p>
                <span className="block text-2xl font-extrabold leading-none text-gray-900">{couverture.troisFamilles}</span>
                <span className="mt-1 block text-sm text-gray-600">
                  fiche{couverture.troisFamilles > 1 ? 's' : ''} avec les trois familles de livrables
                </span>
              </p>
            </li>
            <li className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
              <p>
                <span className="block text-2xl font-extrabold leading-none text-gray-900">{couverture.aucun}</span>
                <span className="mt-1 block text-sm text-gray-600">
                  fiche{couverture.aucun > 1 ? 's' : ''} sans aucun livrable
                </span>
              </p>
            </li>
          </ul>
        </>
      )}
    </Section>
  )
}
