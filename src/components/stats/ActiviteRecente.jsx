import { Link } from 'react-router-dom'
import { History, FilePlus2, FileText, Megaphone, KeyRound } from 'lucide-react'
import { Section, EtatVide } from './Section'

// Bloc « Activité récente » : chronologie des derniers horodatages CONNUS. Ce n'est pas
// un historique complet et il ne se présente pas comme tel : une annonce régénérée
// n'a qu'une date, celle de la version conservée ; les fiches supprimées ont disparu.

const ICONES = {
  creation: FilePlus2,
  pdf: FileText,
  annonce_airbnb: Megaphone,
  annonce_booking: Megaphone,
  guide: KeyRound,
}

const formatDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const formatHeure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

export default function ActiviteRecente({ activite, annoncesIndisponibles }) {
  return (
    <Section
      icone={History}
      titre="Activité récente"
      sousTitre="Dernières dates connues. Une annonce régénérée n’affiche que la date de sa version actuelle."
    >
      {annoncesIndisponibles && (
        <p className="mb-4 text-sm text-red-700" role="status">
          Les annonces n’ont pas pu être lues : elles n’apparaissent pas dans cette liste.
        </p>
      )}
      {activite.length === 0 ? (
        <EtatVide titre="Aucune activité pour l’instant" texte="Vos créations de fiches et vos générations apparaîtront ici." />
      ) : (
        <ol className="divide-y divide-gray-100">
          {activite.map((evt) => {
            const Icone = ICONES[evt.type] || FileText
            const d = new Date(evt.date)
            return (
              <li key={`${evt.type}-${evt.fiche.id}-${evt.date}`} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dbae61]/15">
                  <Icone className="h-4 w-4 text-[#8b7355]" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{evt.libelle}</p>
                  <p className="truncate text-sm text-gray-600">
                    <Link to={`/fiche?id=${evt.fiche.id}`} className="hover:text-[#8b7355] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dbae61] rounded">
                      {evt.fiche.nom}
                    </Link>
                    {evt.archivee && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">archivée</span>}
                  </p>
                </div>
                <time dateTime={evt.date} className="shrink-0 text-right text-xs text-gray-500">
                  {formatDate.format(d)}
                  <span className="block">{formatHeure.format(d)}</span>
                </time>
              </li>
            )
          })}
        </ol>
      )}
    </Section>
  )
}
