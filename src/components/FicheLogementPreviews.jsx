import { Sparkles, Check, Home, Bath } from 'lucide-react'
import { FL } from '../lib/ficheLogementTheme'

// Aperçus produit de la landing /fiche-logement.
//
// Ce sont des MAQUETTES : du HTML/CSS reconstruit dans l'app, pas des captures et
// pas d'images distantes. Aucune donnée réelle, aucun appel réseau. Elles sont
// entièrement décoratives, donc marquées `aria-hidden` : un lecteur d'écran n'a
// rien à gagner à énoncer « Villa Horizon · 78 % », et le texte utile de chaque
// section porte déjà la promesse.

// Barre de fenêtre (trois pastilles + titre + progression).
function WindowBar({ title, progress }) {
  return (
    <div
      className="flex items-center gap-3 border-b px-4 py-3"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <span className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: FL.gold }} />
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.22)' }} />
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.22)' }} />
      </span>
      <span className="flex-1 truncate text-center text-[11px] font-semibold text-white/80 sm:text-xs">
        {title}
      </span>
      <span className="text-[11px] font-bold sm:text-xs" style={{ color: FL.goldLight }}>
        {progress}
      </span>
    </div>
  )
}

// Ligne d'atout du panneau principal.
function AtoutRow({ icon, title, text }) {
  // `Icon` en variable locale plutôt qu en renommage de paramètre : le lint du repo
  // n a pas le plugin react et ne voit pas les usages en BALISE JSX ; il signalerait
  // un paramètre inutilisé. En variable, `varsIgnorePattern: ^[A-Z_]` le couvre.
  const Icon = icon
  return (
    <div
      className="flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5"
      style={{ borderColor: FL.line }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'rgba(219,174,97,0.16)' }}
      >
        <Icon className="h-4 w-4" style={{ color: FL.goldDeep }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-bold sm:text-[13px]" style={{ color: FL.ink }}>
          {title}
        </span>
        <span className="block truncate text-[10px] sm:text-[11px]" style={{ color: FL.muted }}>
          {text}
        </span>
      </span>
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: FL.ink }}
      >
        <Check className="h-3 w-3" style={{ color: FL.goldLight }} strokeWidth={3} />
      </span>
    </div>
  )
}

// Aperçu principal du hero : la fiche en cours de préparation, l'assistant en bas.
export function ProductPreview() {
  const sections = [
    { n: '01', label: 'Identité', active: true },
    { n: '02', label: 'Équipements' },
    { n: '03', label: 'Sécurité' },
    { n: '04', label: 'Photos' },
  ]

  return (
    // `pt-10` en mobile, et non `pt-6` : la pastille « 24 sections guidées » fait
    // 36 px de haut et, avec un retrait de 24 px, son bas recouvrait la barre de
    // titre de la fenêtre (« Villa Horizon · Annecy », « 78 % »). À 40 px elle passe
    // juste au-dessus. Au-delà de `sm` la barre est plus basse, 32 px suffisent.
    <div aria-hidden="true" className="relative w-full select-none pt-10 sm:pt-8">
      {/* Fenêtre applicative */}
      <div
        className="overflow-hidden rounded-2xl sm:rounded-3xl"
        style={{ backgroundColor: FL.ink, boxShadow: '0 40px 80px -50px rgba(23,23,20,0.85)' }}
      >
        <WindowBar title="Villa Horizon · Annecy" progress="78 %" />

        <div className="flex">
          {/* Rail des sections — masqué sous sm pour laisser le panneau respirer */}
          <div className="hidden w-36 shrink-0 flex-col gap-1 p-4 sm:flex lg:w-40">
            <span className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
              Préparation
            </span>
            {sections.map(({ n, label, active }) => (
              <span
                key={n}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px]"
                style={active ? { backgroundColor: FL.inkLift } : undefined}
              >
                <span className="font-bold" style={{ color: active ? FL.gold : 'rgba(255,255,255,0.3)' }}>
                  {n}
                </span>
                <span className={active ? 'font-bold text-white' : 'text-white/50'}>{label}</span>
              </span>
            ))}
            <span className="my-3 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.10)' }} />
            <span className="flex items-center gap-2 px-2.5 text-[11px] font-bold" style={{ color: FL.gold }}>
              <Sparkles className="h-3 w-3" />
              Annonce IA
            </span>
          </div>

          {/* Panneau principal */}
          <div className="min-w-0 flex-1 p-4 sm:rounded-tl-2xl sm:p-5" style={{ backgroundColor: FL.paper }}>
            <span className="block text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: FL.goldDeep }}>
              Section 18 sur 24
            </span>
            <span className="mt-1.5 block font-serif text-lg sm:text-xl" style={{ color: FL.ink }}>
              Les atouts du logement
            </span>

            <div className="mt-4 space-y-2">
              <AtoutRow icon={Home} title="Vue lac panoramique" text="Visible depuis le salon et la suite parentale" />
              <AtoutRow icon={Bath} title="Spa privatif 4 places" text="Accessible toute l’année sur la terrasse" />
            </div>

            {/* Encart assistant */}
            <div
              className="mt-3 rounded-xl border p-3"
              style={{ borderColor: 'rgba(219,174,97,0.45)', backgroundColor: 'rgba(219,174,97,0.10)' }}
            >
              <span className="flex items-center gap-2">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-md"
                  style={{ backgroundColor: FL.ink }}
                >
                  <Sparkles className="h-3 w-3" style={{ color: FL.goldLight }} />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: FL.goldDeep }}>
                  Assistant IA
                </span>
              </span>
              <span className="mt-2 block text-[10px] font-semibold sm:text-[11px]" style={{ color: FL.muted }}>
                6 arguments de réservation détectés
              </span>
              <span className="mt-2 block font-serif text-[15px] leading-snug sm:text-base" style={{ color: FL.ink }}>
                Échappée au bord du lac · Spa &amp; vue panoramique
              </span>
              <span className="mt-3 flex gap-2">
                <span
                  className="rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                  style={{ backgroundColor: FL.ink, color: FL.goldLight }}
                >
                  Airbnb
                </span>
                <span
                  className="rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                  style={{ borderColor: FL.line, color: FL.muted }}
                >
                  Booking
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pastilles flottantes — contenues dans le padding du conteneur, jamais hors cadre */}
      <span
        className="absolute right-3 top-0 flex items-center gap-2 rounded-full bg-white px-3 py-2 sm:right-6"
        style={{ boxShadow: '0 12px 28px -16px rgba(23,23,20,0.55)' }}
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
          style={{ backgroundColor: FL.ink, color: FL.goldLight }}
        >
          24
        </span>
        <span className="text-[11px] font-bold sm:text-xs" style={{ color: FL.ink }}>
          sections guidées
        </span>
      </span>

      {/* Réservée à `lg`, et c'est une contrainte de place mesurée, pas un choix de
          confort : la bulle fait ~167 px de large. En dessous de `lg` elle mordrait
          sur le panneau clair et recouvrirait le titre d'annonce — sous `sm` le rail
          sombre n'existe même plus. À partir de `lg` elle déborde de 28 px dans la
          gouttière de la grille et son reste tient dans les 160 px du rail : elle
          chevauche le bord du cadre comme sur la maquette, sans rien recouvrir, et
          la fenêtre garde toute la largeur de sa colonne. */}
      <span
        className="absolute bottom-12 -left-7 hidden items-center gap-2 rounded-full bg-white px-3 py-2 lg:flex"
        style={{ boxShadow: '0 12px 28px -16px rgba(23,23,20,0.55)' }}
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: FL.ink }}
        >
          <Sparkles className="h-3 w-3" style={{ color: FL.goldLight }} />
        </span>
        <span className="text-[11px] font-bold sm:text-xs" style={{ color: FL.ink }}>
          Annonce optimisée
        </span>
      </span>
    </div>
  )
}

// Aperçu de la carte 01 : l'avancement d'une fiche, section par section.
export function FicheProgressPreview() {
  const rows = [
    { label: 'Pièce de vie', note: '12 éléments renseignés', state: 'done' },
    { label: 'Équipements', note: 'Photos ajoutées', state: 'done' },
    { label: 'Atouts du logement', note: 'En cours', state: 'current', n: '18' },
    { label: 'Informations voyageurs', note: 'À contrôler', state: 'todo', n: '19' },
  ]

  return (
    <div
      aria-hidden="true"
      className="select-none rounded-2xl border bg-white p-4 sm:p-5"
      style={{ borderColor: FL.line, boxShadow: '0 24px 48px -40px rgba(23,23,20,0.6)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold sm:text-[13px]" style={{ color: FL.ink }}>
          Fiche du logement
        </span>
        <span className="text-[12px] font-bold sm:text-[13px]" style={{ color: FL.goldDeep }}>
          18/24
        </span>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: FL.cream }}>
        <div
          className="h-full rounded-full"
          style={{ width: '75%', background: `linear-gradient(90deg, ${FL.goldDeep}, ${FL.gold})` }}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        {rows.map(({ label, note, state, n }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg px-1 py-1.5">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
              style={
                state === 'done'
                  ? { backgroundColor: FL.ink, color: FL.goldLight }
                  : state === 'current'
                    ? { backgroundColor: FL.gold, color: FL.ink }
                    : { backgroundColor: FL.cream, color: FL.muted }
              }
            >
              {state === 'done' ? <Check className="h-3 w-3" strokeWidth={3} /> : n}
            </span>
            <span
              className="min-w-0 flex-1 truncate text-[12px] font-semibold sm:text-[13px]"
              style={{ color: state === 'todo' ? FL.muted : FL.ink }}
            >
              {label}
            </span>
            <span className="shrink-0 text-[10px] sm:text-[11px]" style={{ color: FL.muted }}>
              {note}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Aperçu de la carte 02 : l'annonce produite par l'assistant.
export function AnnoncePreview() {
  return (
    <div
      aria-hidden="true"
      className="select-none rounded-2xl border p-4 sm:p-5"
      style={{ borderColor: FL.lineDark, backgroundColor: 'rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: FL.gold }}
        >
          <Sparkles className="h-3.5 w-3.5" style={{ color: FL.ink }} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: FL.gold }}>
            Assistant IA
          </span>
          <span className="block text-[11px] font-semibold text-white/70 sm:text-xs">
            Ton annonce est prête
          </span>
        </span>
        <span className="shrink-0 text-[10px] text-white/40">2 min</span>
      </div>

      <span className="mt-4 block text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: FL.goldDeep }}>
        Airbnb · titre recommandé
      </span>
      <span className="mt-1.5 block font-serif text-lg leading-snug text-white sm:text-xl">
        Escapade au lac · Spa privé &amp; coucher de soleil
      </span>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ['Clarté', '96 %'],
          ['Attractivité', '94 %'],
        ].map(([label, value]) => (
          <span
            key={label}
            className="rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold text-white/60 sm:text-[11px]"
            style={{ borderColor: FL.lineDark }}
          >
            {label} <span style={{ color: FL.goldLight }}>{value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
