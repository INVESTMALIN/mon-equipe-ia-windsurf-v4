import { ClipboardList, Sparkles, FileCheck2 } from 'lucide-react'
import { FL, DISPLAY_SANS, DISPLAY_SERIF } from '../lib/ficheLogementTheme'
import {
  Eyebrow,
  BrandHeader,
  BrandFooter,
  PrimaryCta,
  SecondaryCta,
  CheckItem,
  PlusItem,
  GhostNumber,
} from './FicheLogementBrand'
import { ProductPreview, FicheProgressPreview, AnnoncePreview } from './FicheLogementPreviews'

// Landing publique de l'univers Fiche Logement (cible : lien ThriveCart).
// Page vitrine pure : aucun appel réseau, aucune lecture de session. Les seuls
// chemins qu'elle produit sont /inscription-fiche-logement (parcours fiche_lite)
// et /connexion-fiche-logement (connexion de l'univers), plus les pages légales.

const SIGNUP_PATH = '/inscription-fiche-logement'

const HERO_PROOFS = ['Fiche complète', 'Annonce optimisée', 'Synthèse prête pour ton équipe']

const STRIP_ITEMS = [
  'Préparer avec méthode',
  'Ne rien oublier',
  'Titres et descriptions en un clic',
  'Synthèse prête pour ton équipe',
]

const FICHE_POINTS = [
  '24 sections guidées, des accès aux extérieurs',
  'Équipements, sécurité et réglementaire intégrés',
  'Rappels photos au bon moment',
  'PDF propre à partager à l’équipe ou au propriétaire',
]

const ASSISTANT_POINTS = [
  'Positionnement et angles de vente du logement',
  'Titres et descriptions adaptés à chaque plateforme',
  'Atouts hiérarchisés selon leur pouvoir de réservation',
  'Recommandations concrètes avant publication',
]

const EXPERTISE = [
  { n: '01', title: 'Hiérarchie des atouts', text: 'Les bons arguments, dans le bon ordre.' },
  { n: '02', title: 'Codes des plateformes', text: 'Un message adapté à Airbnb comme à Booking.' },
  { n: '03', title: 'Déclencheurs de choix', text: 'Ce qui aide le voyageur à se projeter.' },
  { n: '04', title: 'Conseils actionnables', text: 'Des améliorations utiles avant de publier.' },
]

const STEPS = [
  {
    n: '01',
    icon: ClipboardList,
    title: 'Prépare',
    text: 'Parcours les 24 sections, documente le logement et ne laisse aucun angle mort.',
  },
  {
    n: '02',
    icon: Sparkles,
    title: 'Génère',
    text: 'L’assistant analyse les données et rédige tes annonces selon les bonnes pratiques du marché.',
  },
  {
    n: '03',
    icon: FileCheck2,
    title: 'Finalise',
    text: 'Relis, affine et récupère des versions prêtes pour Airbnb et Booking.',
  },
]

export default function FicheLogementLanding() {
  return (
    <div className="overflow-x-hidden" style={{ backgroundColor: FL.paper, color: FL.ink }}>
      <BrandHeader />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(70% 55% at 78% 10%, ${FL.cream} 0%, rgba(235,226,207,0) 70%)`,
          }}
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <Eyebrow>L’outil métier des patrons de conciergerie</Eyebrow>

            <h1 className="mt-6">
              <span
                className={`block ${DISPLAY_SANS}`}
                style={{ fontSize: 'clamp(2.5rem, 6.4vw, 4rem)' }}
              >
                Prépare tes logements
              </span>
              <span
                className={`mt-1 block italic ${DISPLAY_SERIF}`}
                style={{ fontSize: 'clamp(2.5rem, 6.4vw, 4rem)', color: FL.goldDeep }}
              >
                comme un pro
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: FL.muted }}>
              N’oublie rien lors de la préparation de tes logements et transforme tes informations
              terrain en annonces Airbnb et Booking optimisées par notre assistant IA.
            </p>

            <div
              className="mt-8 inline-flex max-w-lg items-center gap-4 rounded-2xl border bg-white/70 p-3 pr-5"
              style={{ borderColor: FL.line }}
            >
              <span
                className="shrink-0 rounded-xl px-3 py-2 text-base font-extrabold"
                style={{ backgroundColor: FL.ink, color: FL.goldLight }}
              >
                3 565
              </span>
              <span className="text-sm leading-snug" style={{ color: FL.muted }}>
                annonces Airbnb parmi les plus performantes analysées pour calibrer notre assistant
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryCta to={SIGNUP_PATH}>Créer ma première fiche</PrimaryCta>
              <SecondaryCta href="#outil">Voir comment ça marche</SecondaryCta>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {HERO_PROOFS.map((proof) => (
                <li key={proof} className="flex items-center gap-2 text-sm font-semibold" style={{ color: FL.muted }}>
                  <span aria-hidden="true" style={{ color: FL.goldDeep }}>
                    &#10003;
                  </span>
                  {proof}
                </li>
              ))}
            </ul>
          </div>

          <ProductPreview />
        </div>
      </section>

      {/* ─────────────────── Bandeau de rappel ─────────────────── */}
      <section style={{ backgroundColor: FL.ink }}>
        <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-5 py-6 sm:px-8">
          {STRIP_ITEMS.map((item, i) => (
            <li key={item} className="flex items-center gap-5">
              {i > 0 && (
                <span aria-hidden="true" className="text-[7px]" style={{ color: FL.goldDeep }}>
                  &#9670;
                </span>
              )}
              <span className="text-sm font-semibold text-white/85">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ──────────────────── Les deux missions ──────────────────── */}
      <section id="outil" className="scroll-mt-8">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <Eyebrow>Un seul outil. Deux missions critiques.</Eyebrow>
          <h2
            className={`mt-6 max-w-3xl ${DISPLAY_SERIF}`}
            style={{ fontSize: 'clamp(2rem, 4.6vw, 3.1rem)' }}
          >
            De la porte d’entrée
            <br className="hidden sm:block" /> au clic de réservation.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: FL.muted }}>
            Tu ne fais pas une simple préparation de logement. Tu poses les fondations d’un logement
            prêt à être exploité. Puis tu transformes chaque information utile en une annonce qui
            donne envie de réserver.
          </p>

          {/* Carte 01 — la fiche */}
          <article
            className="relative mt-12 overflow-hidden rounded-3xl border bg-white"
            style={{ borderColor: FL.line, boxShadow: '0 30px 60px -50px rgba(23,23,20,0.5)' }}
          >
            {/* Numéro fantôme calé sur le coin de la carte, pas sur la colonne de texte. */}
            <span className="absolute right-6 top-5 sm:right-10 sm:top-8">
              <GhostNumber>01</GhostNumber>
            </span>
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
              <div>
                <Eyebrow>Une fiche logement professionnelle</Eyebrow>
                <h3
                  className={`mt-5 ${DISPLAY_SANS}`}
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}
                >
                  Prépare chaque bien avec le même niveau d’exigence.
                </h3>
                <p className="mt-5 text-base leading-relaxed" style={{ color: FL.muted }}>
                  Un parcours guidé, éprouvé par notre équipe, pièce par pièce, pour centraliser tout
                  ce qu’il faut vérifier, documenter et transmettre.
                </p>
                <ul className="mt-7 space-y-3">
                  {FICHE_POINTS.map((point) => (
                    <CheckItem key={point}>{point}</CheckItem>
                  ))}
                </ul>
              </div>

              <FicheProgressPreview />
            </div>
          </article>

          {/* Carte 02 — l'assistant */}
          <article
            className="relative mt-8 overflow-hidden rounded-3xl"
            style={{ backgroundColor: FL.ink, boxShadow: '0 40px 70px -55px rgba(23,23,20,0.9)' }}
          >
            <span className="absolute right-6 top-5 sm:right-10 sm:top-8">
              <GhostNumber tone="light">02</GhostNumber>
            </span>
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
              <div>
                <Eyebrow tone="light">Assistant de création d’annonces IA</Eyebrow>
                <h3
                  className={`mt-5 text-white ${DISPLAY_SANS}`}
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}
                >
                  Génère mieux qu’un texte générique.
                </h3>
                <p className="mt-5 text-base leading-relaxed text-white/65">
                  L’assistant exploite les informations de la fiche et applique les meilleures
                  pratiques identifiées sur les annonces performantes de la courte durée.
                </p>
                <ul className="mt-7 space-y-3">
                  {ASSISTANT_POINTS.map((point) => (
                    <PlusItem key={point}>{point}</PlusItem>
                  ))}
                </ul>
              </div>

              <AnnoncePreview />
            </div>
          </article>
        </div>
      </section>

      {/* ─────────────────── L'expertise derrière ─────────────────── */}
      <section style={{ backgroundColor: FL.ink }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div
            className="relative overflow-hidden rounded-3xl border p-8 sm:p-12"
            style={{ borderColor: FL.lineDark }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(100% 120% at 90% 0%, rgba(219,174,97,0.22) 0%, rgba(219,174,97,0) 62%)',
              }}
            />
            <div className="relative">
              <Eyebrow tone="light">Étude Airbnb France 2025</Eyebrow>
              <p className="mt-6 leading-none">
                <span className={`text-white ${DISPLAY_SANS}`} style={{ fontSize: 'clamp(3.5rem, 9vw, 6rem)' }}>
                  3
                </span>
                <span
                  className="font-serif"
                  style={{ fontSize: 'clamp(2.5rem, 6.5vw, 4.4rem)', color: FL.goldLight }}
                >
                  565
                </span>
              </p>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
                annonces parmi celles qui convertissent le mieux, analysées sur quatre marchés
                représentatifs
              </p>
            </div>
          </div>

          <div className="mt-14">
            <Eyebrow tone="light">L’expertise derrière l’assistant</Eyebrow>
            <h2
              className={`mt-6 max-w-3xl text-white ${DISPLAY_SERIF}`}
              style={{ fontSize: 'clamp(2rem, 4.6vw, 3.1rem)' }}
            >
              Pas une IA qui improvise.
              <br className="hidden sm:block" /> Une méthode qui sait quoi chercher.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              Nous avons étudié les 3 565 annonces qui convertissent le mieux pour comprendre ce qui
              capte l’attention, rassure et transforme une visite en réservation.
            </p>

            {/* Hairlines obtenues par `gap-px` sur un fond doré translucide : pas de
                bordure conditionnelle à gérer selon la position dans la grille. */}
            <div
              className="mt-10 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-2"
              style={{ backgroundColor: FL.lineDark }}
            >
              {EXPERTISE.map(({ n, title, text }) => (
                <div key={n} className="p-6 sm:p-8" style={{ backgroundColor: FL.ink }}>
                  <span className="text-xs font-bold tracking-[0.16em]" style={{ color: FL.goldDeep }}>
                    {n}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-white sm:text-lg">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── Le parcours ─────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <Eyebrow>Simple à utiliser. Difficile à oublier.</Eyebrow>
          <h2
            className={`mt-6 max-w-3xl ${DISPLAY_SERIF}`}
            style={{ fontSize: 'clamp(2rem, 4.6vw, 3.1rem)' }}
          >
            Un nouveau bien en ligne.
            <br className="hidden sm:block" /> Sans effort.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: FL.muted }}>
            L’outil accompagne le passage du terrain à la mise en ligne. Prépare. Génère. Finalise.
            Conçu par des patrons de conciergerie.
          </p>

          <div className="mt-12 grid gap-px overflow-hidden sm:grid-cols-3" style={{ backgroundColor: FL.line }}>
            {STEPS.map((step) => (
              <div key={step.n} className="p-6 sm:p-8" style={{ backgroundColor: FL.paper }}>
                <div className="flex items-start justify-between gap-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: FL.ink }}
                  >
                    <step.icon className="h-5 w-5" style={{ color: FL.goldLight }} />
                  </span>
                  <span aria-hidden="true" className="text-xs font-bold tracking-[0.16em]" style={{ color: FL.goldDeep }}>
                    {step.n}
                  </span>
                </div>
                <h3 className={`mt-6 text-2xl ${DISPLAY_SERIF}`}>{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: FL.muted }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA final ───────────────────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: FL.cream }}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-serif leading-none"
          style={{ fontSize: 'clamp(11rem, 26vw, 20rem)', color: 'rgba(23,23,20,0.045)' }}
        >
          IM
        </span>

        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <Eyebrow className="justify-center">Fiche Logement + Assistant IA</Eyebrow>
          <h2 className={`mt-6 ${DISPLAY_SERIF}`} style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
            Prêt à démarrer la préparation de ton nouveau logement ?
          </h2>
          <p className="mt-5 text-base sm:text-lg" style={{ color: FL.muted }}>
            Crée ton compte et lance ta première fiche dès maintenant.
          </p>
          <div className="mt-9 flex justify-center">
            <PrimaryCta to={SIGNUP_PATH}>Créer mon compte et lancer ma première fiche</PrimaryCta>
          </div>
        </div>
      </section>

      <BrandFooter />
    </div>
  )
}
