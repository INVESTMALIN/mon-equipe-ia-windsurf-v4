import { Link } from 'react-router-dom'
import {
  BrandHeader,
  BrandFooter,
  Eyebrow,
  PrimaryCta,
} from './FicheLogementBrand'
import { FL, DISPLAY_SANS, DISPLAY_SERIF, LANDING_SHELL } from '../lib/ficheLogementTheme'

// Page tarifaire PUBLIQUE des packs de crédits Fiche Logement.
//
// Pourquoi elle existe : jusqu'ici le prix des crédits n'était visible nulle part sans
// créer un compte et atteindre /mes-credits. Un visiteur doit pouvoir consulter les prix
// avant de s'engager.
//
// Route DISTINCTE de /tarifs, qui reste la page de l'abonnement Premium Mon Équipe IA.
// Les deux offres coexistent volontairement : cette page ne parle QUE des crédits.
//
// ⚠️ Les montants ci-dessous sont un AFFICHAGE, au même titre que ceux de MesCredits.jsx.
// Le montant réellement facturé est toujours celui du Price Stripe résolu par lookup_key
// côté serveur (api/create-credit-checkout-session.js) : rien ici n'est envoyé au serveur
// et rien ici ne détermine un prix. Les deux listes restent volontairement séparées,
// leur unification n'entrant pas dans le périmètre de cette page.
const PACKS = [
  { credits: 1, prix: 5, unite: 5, libelle: 'Pack découverte' },
  { credits: 10, prix: 25, unite: 2.5, libelle: 'Pack 10 fiches' },
  { credits: 20, prix: 40, unite: 2, libelle: 'Pack 20 fiches' },
  { credits: 50, prix: 50, unite: 1, libelle: 'Pack 50 fiches', meilleur: true },
]

// Format euro FR : entier sans décimale (5 €), sinon deux décimales (2,50 €).
const eur = (n) =>
  n.toLocaleString('fr-FR', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })

// Puce de liste éditoriale, propre à cette page (pastille dorée + texte).
function Point({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: FL.goldDeep }}
      />
      <span>{children}</span>
    </li>
  )
}

export default function FicheLogementTarifs() {
  return (
    <div className="overflow-x-hidden" style={{ backgroundColor: FL.paper, color: FL.ink }}>
      <BrandHeader />

      {/* ───────────────────────── En-tête éditorial ───────────────────────── */}
      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(70% 55% at 78% 10%, ${FL.cream} 0%, rgba(235,226,207,0) 70%)`,
          }}
        />

        <div className={`${LANDING_SHELL} relative py-14 text-center sm:py-20`}>
          <div className="mx-auto max-w-3xl">
            <Eyebrow className="justify-center">Tarifs Fiche Logement</Eyebrow>

            <h1 className="mt-6">
              <span className={`block ${DISPLAY_SANS}`} style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}>
                Tu paies à la fiche,
              </span>
              <span
                className={`mt-1 block italic ${DISPLAY_SERIF}`}
                style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', color: FL.goldDeep }}
              >
                pas à l’abonnement
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg" style={{ color: FL.muted }}>
              Un crédit vaut une fiche logement. Tu achètes le nombre de crédits dont tu as
              besoin, tu les utilises quand tu veux.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Les quatre packs ───────────────────────── */}
      <section className={`${LANDING_SHELL} pb-4`}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PACKS.map((pack) => (
            <div
              key={pack.credits}
              className="relative flex flex-col rounded-2xl border bg-white p-6 text-center"
              style={{
                borderColor: pack.meilleur ? FL.gold : FL.line,
                boxShadow: pack.meilleur ? `0 0 0 1px ${FL.gold}` : 'none',
              }}
            >
              {pack.meilleur && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
                  style={{ backgroundColor: FL.goldDeep }}
                >
                  Meilleur prix
                </span>
              )}

              <p className="text-sm font-medium" style={{ color: FL.muted }}>
                {pack.libelle}
              </p>

              <p className="mt-2 text-3xl font-extrabold" style={{ color: FL.ink }}>
                {pack.credits}
                <span className="ml-1 text-lg font-semibold" style={{ color: FL.muted }}>
                  crédit{pack.credits > 1 ? 's' : ''}
                </span>
              </p>

              <p className="mt-5 text-4xl font-extrabold" style={{ color: FL.goldDeep }}>
                {eur(pack.prix)} €
              </p>

              <p className="mt-2 text-xs" style={{ color: FL.muted }}>
                soit {eur(pack.unite)} € par fiche
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm font-medium" style={{ color: FL.muted }}>
          TVA non applicable.
        </p>
      </section>

      {/* ───────────────────────── Ce qu’un crédit permet ───────────────────────── */}
      <section className={`${LANDING_SHELL} py-14 sm:py-20`}>
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Ce qu’il faut savoir</Eyebrow>

          <ul className="mt-6 space-y-4 text-base">
            <Point>
              <strong className="font-bold">Un crédit permet de créer une fiche logement.</strong>{' '}
              Depuis cette fiche, tu génères le PDF, les annonces pour les plateformes de
              location et le guide d’accès, et tu peux les régénérer sans payer de crédit
              supplémentaire.
            </Point>
            <Point>
              <strong className="font-bold">Le crédit est débité à la création de la fiche</strong>,
              et c’est le seul moment où tu es débité. Compléter la fiche ne coûte rien de plus.
            </Point>
            <Point>
              <strong className="font-bold">Supprimer une fiche ne restitue pas le crédit.</strong>{' '}
              Pour la retirer de ta liste sans la détruire, tu disposes de l’archivage.
            </Point>
            <Point>
              <strong className="font-bold">Les crédits n’expirent pas.</strong> Ils restent
              disponibles sur ton compte aussi longtemps que tu ne les utilises pas.
            </Point>
          </ul>

          <p className="mt-8 text-sm" style={{ color: FL.muted }}>
            Le détail complet figure dans les{' '}
            <Link
              to="/conditions-vente"
              className="font-semibold underline underline-offset-4 transition-colors hover:opacity-70"
              style={{ color: FL.goldDeep }}
            >
              conditions générales de vente
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ───────────────────────── Appel à l’action ───────────────────────── */}
      <section style={{ backgroundColor: FL.cream }}>
        <div className={`${LANDING_SHELL} py-16 text-center sm:py-20`}>
          <div className="mx-auto max-w-3xl">
            <h2 className={DISPLAY_SERIF} style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              Prêt à préparer ton premier logement ?
            </h2>
            <p className="mt-5 text-base sm:text-lg" style={{ color: FL.muted }}>
              Crée ton compte, choisis ton pack, lance ta première fiche.
            </p>
            <div className="mt-9 flex justify-center">
              <PrimaryCta to="/inscription-fiche-logement">Créer mon compte</PrimaryCta>
            </div>
          </div>
        </div>
      </section>

      <BrandFooter />
    </div>
  )
}
