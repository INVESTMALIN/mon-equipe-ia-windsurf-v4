import { Link } from 'react-router-dom'
import { Sparkles, ArrowUpRight, Check } from 'lucide-react'
import { FL, DISPLAY_SERIF, LANDING_SHELL } from '../lib/ficheLogementTheme'

// Blocs visuels partagés de l'univers « Fiche Logement + Assistant IA », montés par
// la landing /fiche-logement, l'inscription dédiée et la connexion de cet univers.
// La palette, l'échelle typographique et les styles de champs vivent dans
// ../lib/ficheLogementTheme — ce fichier n'exporte que des composants, pour que le
// Fast Refresh de Vite continue de fonctionner dessus.
//
// Il ne contient AUCUNE logique métier : ni Supabase, ni Stripe, ni formulaire. Les
// pages gardent leur logique propre et n'empruntent ici que de la présentation.

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

// Filet doré + intitulé capitales espacées. Le rythme de toute la page repose dessus.
export function Eyebrow({ children, tone = 'dark', className = '' }) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {/* `items-start` + décalage fixe du filet : sur mobile l'intitulé passe souvent
          sur deux lignes, et un filet centré verticalement décrocherait de la
          première ligne. */}
      <span
        className="mt-[0.45rem] h-px w-8 shrink-0"
        style={{ backgroundColor: tone === 'dark' ? FL.goldDeep : FL.gold }}
      />
      <span
        className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em]"
        style={{ color: tone === 'dark' ? FL.goldDeep : FL.gold }}
      >
        {children}
      </span>
    </div>
  )
}

// Logo Invest Malin + signature. `tone` bascule le texte pour les fonds sombres.
export function BrandLockup({ tone = 'dark', className = '' }) {
  const ink = tone === 'dark' ? FL.ink : '#ffffff'
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <img src="/images/invest-malin-logo.png" alt="" aria-hidden="true" className="h-8 w-auto" />
      {/* Le nom est du texte, pas une image : pas de doublon `sr-only` à ajouter,
          et le logo est décoratif (alt vide). */}
      <span className="text-lg sm:text-xl tracking-[0.02em]" style={{ color: ink }}>
        <span className="font-extrabold">INVEST</span>
        <span className="font-light"> MALIN</span>
      </span>
    </span>
  )
}

// Pastille de nommage du produit, reprise à l'identique sur les trois surfaces.
export function UniversePill({ tone = 'dark', className = '' }) {
  const isDark = tone === 'dark'
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] ${className}`}
      style={{
        borderColor: isDark ? FL.line : FL.lineDark,
        color: isDark ? FL.ink : FL.goldLight,
        backgroundColor: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.04)',
      }}
    >
      <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: FL.gold }} />
      Fiche Logement + Assistant IA
    </span>
  )
}

// Gros chiffre fantôme des cartes (01 / 02). Décoratif : retiré de l'arbre a11y.
export function GhostNumber({ children, tone = 'dark' }) {
  return (
    <span
      aria-hidden="true"
      className="font-serif select-none pointer-events-none text-5xl sm:text-6xl leading-none"
      style={{ color: tone === 'dark' ? 'rgba(23,23,20,0.10)' : 'rgba(240,217,142,0.16)' }}
    >
      {children}
    </span>
  )
}

// CTA principal : pavé encre, flèche dorée. Rendu en <Link> ou en <a> d'ancre.
export function PrimaryCta({ to, href, children, className = '' }) {
  const classes = `group inline-flex max-w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-center text-base font-bold text-white transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#dbae61] sm:px-7 ${className}`
  const style = { backgroundColor: FL.ink, boxShadow: '0 14px 30px -18px rgba(23,23,20,0.9)' }
  const inner = (
    <>
      {children}
      <span
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-1"
        style={{ color: FL.gold }}
      >
        &#8594;
      </span>
    </>
  )
  if (href) {
    return (
      <a href={href} className={classes} style={style}>
        {inner}
      </a>
    )
  }
  return (
    <Link to={to} className={classes} style={style}>
      {inner}
    </Link>
  )
}

// CTA secondaire : contour discret sur papier crème.
export function SecondaryCta({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex max-w-full items-center justify-center gap-3 rounded-xl border bg-white/60 px-6 py-4 text-center text-base font-bold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#dbae61] sm:px-7"
      style={{ borderColor: FL.line, color: FL.ink }}
    >
      {children}
      <span aria-hidden="true" style={{ color: FL.goldDeep }}>&#8595;</span>
    </a>
  )
}

// Puce de liste « validé » (fond clair).
export function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: FL.ink }}
      >
        <Check className="h-3 w-3" style={{ color: FL.goldLight }} strokeWidth={3} />
      </span>
      <span className="text-sm sm:text-[15px] font-medium" style={{ color: FL.ink }}>
        {children}
      </span>
    </li>
  )
}

// Puce de liste « ajout » (fond sombre).
export function PlusItem({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[13px] font-bold leading-none"
        style={{ backgroundColor: 'rgba(219,174,97,0.18)', color: FL.goldLight }}
        aria-hidden="true"
      >
        +
      </span>
      <span className="text-sm sm:text-[15px] font-medium text-white/90">{children}</span>
    </li>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// En-tête et pied de page de l'univers
// ─────────────────────────────────────────────────────────────────────────────

export function BrandHeader() {
  return (
    <header className="relative z-20 border-b" style={{ borderColor: FL.line }}>
      <div className={`${LANDING_SHELL} flex items-center justify-between gap-4 py-5`}>
        <Link to="/fiche-logement" className="shrink-0">
          <BrandLockup />
        </Link>

        <UniversePill className="hidden lg:inline-flex" />

        <Link
          to="/connexion-fiche-logement"
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-70"
          style={{ color: FL.ink }}
        >
          Se connecter
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ color: FL.goldDeep }}
          />
        </Link>
      </div>
    </header>
  )
}

export function BrandFooter() {
  return (
    <footer className="border-t" style={{ borderColor: FL.line, backgroundColor: FL.paper }}>
      <div className={`${LANDING_SHELL} py-12 text-center`}>
        <BrandLockup className="justify-center" />
        <p className="mt-4 text-sm" style={{ color: FL.muted }}>
          Fiche Logement + Assistant IA, l’outil métier des patrons de conciergerie.
        </p>
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
          <Link to="/mentions-legales" className="transition-colors hover:opacity-60" style={{ color: FL.ink }}>
            Mentions légales
          </Link>
          <Link to="/politique-confidentialite" className="transition-colors hover:opacity-60" style={{ color: FL.ink }}>
            Confidentialité
          </Link>
          <Link to="/conditions-utilisation" className="transition-colors hover:opacity-60" style={{ color: FL.ink }}>
            CGU
          </Link>
        </nav>
        <p className="mt-8 text-xs" style={{ color: FL.muted }}>
          © {new Date().getFullYear()} Invest Malin
        </p>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Colonne éditoriale partagée par /inscription-fiche-logement et
// /connexion-fiche-logement. Garantit que les deux écrans d'authentification de
// l'univers sont visuellement le même objet.
// ─────────────────────────────────────────────────────────────────────────────

export function AuthAside({ eyebrow, title, accent, text, points }) {
  return (
    <div
      className="relative hidden overflow-hidden lg:flex lg:w-[46%] lg:shrink-0 lg:flex-col lg:justify-between"
      style={{ backgroundColor: FL.ink }}
    >
      {/* Halo doré décoratif, purement visuel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 100% 0%, rgba(219,174,97,0.22) 0%, rgba(219,174,97,0) 60%), radial-gradient(90% 60% at 0% 100%, rgba(219,174,97,0.10) 0%, rgba(219,174,97,0) 55%)',
        }}
      />

      <div className="relative p-12 xl:p-16">
        <Link to="/fiche-logement" className="inline-block">
          <BrandLockup tone="light" />
        </Link>
      </div>

      <div className="relative px-12 pb-16 xl:px-16">
        <Eyebrow tone="light">{eyebrow}</Eyebrow>
        <h2 className={`mt-6 text-4xl xl:text-5xl text-white ${DISPLAY_SERIF}`}>
          {title}
          {accent && (
            <>
              <br />
              <em className="not-italic" style={{ color: FL.goldLight }}>
                {accent}
              </em>
            </>
          )}
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">{text}</p>
        {points?.length > 0 && (
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <PlusItem key={p}>{p}</PlusItem>
            ))}
          </ul>
        )}
      </div>

      <div className="relative border-t px-12 py-6 xl:px-16" style={{ borderColor: FL.lineDark }}>
        <UniversePill tone="light" />
      </div>
    </div>
  )
}
