import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { Section, EtatVide } from './Section'

// Bloc « Mes fiches » : inventaire actuel + répartition en barre segmentée + créations
// par mois. Les valeurs numériques sont toujours écrites à côté des graphiques : la
// couleur et la hauteur des barres ne sont jamais la seule façon de lire la donnée.

const MOIS_COURTS = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc']
const MOIS_LONGS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

// Trois segments, trois textures distinctes ET une légende chiffrée : lisible sans la
// couleur (les archivées sont hachurées).
const SEGMENTS = [
  { cle: 'brouillonsActifs', libelle: 'Brouillons actifs', singulier: 'brouillon actif', plurielLabel: 'brouillons actifs', classe: 'bg-[#f0d98e]' },
  { cle: 'completeesActives', libelle: 'Complétées actives', singulier: 'complétée active', plurielLabel: 'complétées actives', classe: 'bg-[#dbae61]' },
  { cle: 'archivees', libelle: 'Archivées', singulier: 'archivée', plurielLabel: 'archivées', classe: 'bg-gray-300 bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(255,255,255,0.6)_4px,rgba(255,255,255,0.6)_8px)]' },
]

const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`

// Libellé accordé d'un segment de la légende : « 1 brouillon actif », « 0 brouillons
// actifs », « 2 brouillons actifs » (singulier pour 1 exactement, pluriel sinon).
const libelleAccorde = (segment, n) => (n === 1 ? segment.singulier : segment.plurielLabel)

export default function InventaireFiches({ inventaire, creations }) {
  const { total } = inventaire

  return (
    <Section icone={ClipboardList} titre="Mes fiches" sousTitre="Ce que vous avez aujourd’hui, brouillons et archives compris">
      {total === 0 ? (
        <EtatVide
          titre="Aucune fiche pour l’instant"
          texte="Créez votre première fiche logement depuis le tableau de bord."
          action={
            <Link to="/dashboard" className="inline-flex h-11 items-center rounded-xl bg-[#dbae61] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#c49a4f] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#dbae61]">
              Aller au tableau de bord
            </Link>
          }
        />
      ) : (
        <>
          {/* Inventaire chiffré */}
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Chiffre libelle="Fiches existantes" valeur={total} />
            <Chiffre libelle="Brouillons actifs" valeur={inventaire.brouillonsActifs} />
            <Chiffre libelle="Complétées actives" valeur={inventaire.completeesActives} />
            <Chiffre libelle="Archivées" valeur={inventaire.archivees} />
          </dl>

          {/* Répartition : barre segmentée + légende chiffrée */}
          <div className="mt-6">
            <div
              role="img"
              aria-label={`Répartition de ${pluriel(total, 'fiche')} : ${SEGMENTS.map((s) => `${inventaire[s.cle]} ${libelleAccorde(s, inventaire[s.cle])}`).join(', ')}`}
              className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100"
            >
              {SEGMENTS.map((s) => {
                const part = inventaire[s.cle]
                if (!part) return null
                return (
                  <div
                    key={s.cle}
                    className={`${s.classe} h-full`}
                    style={{ width: `${(part / total) * 100}%` }}
                    title={`${s.libelle} : ${part}`}
                  />
                )
              })}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
              {SEGMENTS.map((s) => (
                <li key={s.cle} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-sm ${s.classe}`} />
                  <span>
                    <span className="font-semibold text-gray-900">{inventaire[s.cle]}</span> {libelleAccorde(s, inventaire[s.cle])}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Créations par mois */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-900">Créations sur les 12 derniers mois</h3>
            <p className="mt-1 text-sm text-gray-500">
              Fiches présentes aujourd’hui, par mois de création. Les fiches supprimées n’apparaissent pas.
              {creations.avantPeriode > 0 && ` ${pluriel(creations.avantPeriode, 'fiche')} plus ancienne${creations.avantPeriode > 1 ? 's' : ''} n’${creations.avantPeriode > 1 ? 'entrent' : 'entre'} pas dans cette période.`}
            </p>
            <GraphiqueMensuel mois={creations.mois} max={creations.max} />
          </div>
        </>
      )}
    </Section>
  )
}

function Chiffre({ libelle, valeur }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{libelle}</dt>
      <dd className="mt-1 text-2xl font-extrabold leading-none text-gray-900">{valeur}</dd>
    </div>
  )
}

// Histogramme simple en CSS : une colonne par mois, la valeur écrite au-dessus de
// chaque barre, le mois en dessous. Le mois de janvier porte l'année pour situer la
// période sans légende. Une liste hors écran donne la même information aux lecteurs
// d'écran.
function GraphiqueMensuel({ mois, max }) {
  const hauteurMax = 112 // px, hauteur de la zone des barres
  return (
    <div className="mt-4">
      <ul className="sr-only">
        {mois.map((m) => (
          <li key={m.cle}>{MOIS_LONGS[m.moisIndex]} {m.annee} : {m.count} fiche{m.count > 1 ? 's' : ''} créée{m.count > 1 ? 's' : ''}</li>
        ))}
      </ul>
      <div aria-hidden="true" className="flex items-end gap-1 sm:gap-2" style={{ height: hauteurMax + 44 }}>
        {mois.map((m) => {
          const h = max > 0 ? Math.round((m.count / max) * hauteurMax) : 0
          return (
            <div key={m.cle} className="flex min-w-0 flex-1 flex-col items-center justify-end" title={`${MOIS_LONGS[m.moisIndex]} ${m.annee} : ${m.count}`}>
              <span className={`mb-1 text-[11px] font-semibold ${m.count ? 'text-gray-900' : 'text-gray-400'}`}>{m.count}</span>
              <div
                className={`w-full max-w-[28px] rounded-t-md ${m.count ? 'bg-[#dbae61]' : 'bg-gray-200'}`}
                style={{ height: Math.max(h, 3) }}
              />
              <span className="mt-2 text-[10px] leading-tight text-gray-500 sm:text-xs">
                {MOIS_COURTS[m.moisIndex]}
                {m.moisIndex === 0 && <span className="block text-[9px] text-gray-400 sm:text-[10px]">{m.annee}</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
