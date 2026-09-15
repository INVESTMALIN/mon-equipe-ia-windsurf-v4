// Calcul des statistiques de /mes-statistiques (Fiche Logement Lite).
//
// Module PUR : aucune requête, aucun accès réseau, aucune date implicite (l'instant
// de référence est passé en paramètre). Il reçoit les lignes déjà chargées et rend
// des nombres et des listes prêts à afficher. Toute la logique est ici, testée dans
// tests/ficheStats.test.mjs.
//
// ── L'unité est la FICHE, jamais la génération ─────────────────────────────────
// Un PDF régénéré cinq fois reste un PDF. La preuve de chaque livrable est celle des
// badges du dashboard, via lib/ficheLivrables.js : les deux écrans ne peuvent pas
// diverger sur ce qui compte comme livrable disponible.
//
// ── Archivées ──────────────────────────────────────────────────────────────────
// Une fiche archivée compte dans l'inventaire (elle existe) mais est exclue des
// indicateurs opérationnels (couverture des livrables, fiches à compléter). Son
// ancien statut Brouillon / Complété ne la fait jamais compter deux fois :
// brouillons actifs + complétées actives + archivées = total.
//
// ── Ce qui n'est PAS reconstruit ───────────────────────────────────────────────
// Les fiches supprimées et les régénérations remplacées n'existent plus en base :
// on ne les invente pas. « Créations sur 12 mois » compte les fiches PRÉSENTES par
// mois de création ; « Activité récente » n'affiche que les derniers horodatages
// connus.

import { livrablesDeFiche } from './ficheLivrables.js'

const estArchivee = (fiche) => Boolean(fiche?.archived_at)
const estCompletee = (fiche) => fiche?.statut === 'Complété'

// Indexe les annonces disponibles par fiche : { airbnb: iso|null, booking: iso|null }.
// Une ligne par couple (fiche, plateforme) : la PK de agent_outputs le garantit, on
// garde malgré tout la plus récente si un doublon arrivait.
export function indexerAnnonces(annonces) {
  // Valeur : l'horodatage ISO de la version conservée, '' si absent, null si aucune
  // annonce sur cette plateforme. La présence se teste donc avec `!== null`.
  const index = new Map()
  for (const ligne of annonces || []) {
    if (!ligne?.fiche_id || !ligne?.plateforme) continue
    const entree = index.get(ligne.fiche_id) || { airbnb: null, booking: null }
    if (!(ligne.plateforme in entree)) continue // plateforme inconnue : ignorée
    const nouveau = ligne.generated_at || ''
    const actuel = entree[ligne.plateforme]
    if (actuel === null || nouveau > actuel) entree[ligne.plateforme] = nouveau
    index.set(ligne.fiche_id, entree)
  }
  return index
}

// État des livrables d'une fiche, par famille et par plateforme.
export function etatLivrables(fiche, indexAnnonces) {
  const annoncesFiche = indexAnnonces?.get?.(fiche.id)
  const idsAvecAnnonce = new Set(annoncesFiche ? [fiche.id] : [])
  const base = livrablesDeFiche(fiche, idsAvecAnnonce)
  return {
    pdf: base.pdf,
    annonce: base.annonce,
    guide: base.guide,
    airbnb: Boolean(annoncesFiche && annoncesFiche.airbnb !== null),
    booking: Boolean(annoncesFiche && annoncesFiche.booking !== null),
  }
}

export function inventaire(fiches) {
  const actives = fiches.filter((f) => !estArchivee(f))
  return {
    total: fiches.length,
    actives: actives.length,
    archivees: fiches.length - actives.length,
    brouillonsActifs: actives.filter((f) => !estCompletee(f)).length,
    completeesActives: actives.filter(estCompletee).length,
  }
}

// Couverture des livrables sur les fiches ACTIVES.
export function couvertureLivrables(fichesActives, indexAnnonces) {
  const etats = fichesActives.map((f) => etatLivrables(f, indexAnnonces))
  const compter = (pred) => etats.filter(pred).length
  const pdf = compter((e) => e.pdf)
  const airbnb = compter((e) => e.airbnb)
  const booking = compter((e) => e.booking)
  const guide = compter((e) => e.guide)
  return {
    fichesActives: fichesActives.length,
    pdf,
    annonce: compter((e) => e.annonce),
    airbnb,
    booking,
    guide,
    troisFamilles: compter((e) => e.pdf && e.annonce && e.guide),
    aucun: compter((e) => !e.pdf && !e.annonce && !e.guide),
    // Livrables disponibles : chaque livrable existant compte UNE fois, une
    // régénération n'en ajoute jamais.
    totalLivrables: pdf + airbnb + booking + guide,
  }
}

// Fiches actives auxquelles il manque au moins une famille de livrables, avec la
// liste des manques. Ordre : les plus récemment modifiées d'abord.
export function fichesACompleter(fichesActives, indexAnnonces) {
  return fichesActives
    .map((fiche) => {
      const etat = etatLivrables(fiche, indexAnnonces)
      const manquants = ['pdf', 'annonce', 'guide'].filter((cle) => !etat[cle])
      return { fiche, etat, manquants }
    })
    .filter((entree) => entree.manquants.length > 0)
    .sort((a, b) => String(b.fiche.updated_at || '').localeCompare(String(a.fiche.updated_at || '')))
}

// Clé de mois locale AAAA-MM d'une date ISO.
const cleMois = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Fiches présentes, regroupées par mois de CRÉATION sur les 12 derniers mois (mois
// courant inclus), zéros compris, ordre chronologique. `avantPeriode` permet de
// réconcilier avec le total : ces fiches existent mais sont plus anciennes.
export function creationsParMois(fiches, now) {
  const ref = new Date(now)
  const mois = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1)
    mois.push({
      cle: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      annee: d.getFullYear(),
      moisIndex: d.getMonth(),
      count: 0,
    })
  }
  const parCle = new Map(mois.map((m) => [m.cle, m]))
  let avantPeriode = 0
  let horsDate = 0
  for (const fiche of fiches) {
    const cle = cleMois(fiche.created_at)
    if (!cle) { horsDate++; continue }
    const m = parCle.get(cle)
    if (m) m.count++
    else if (cle < mois[0].cle) avantPeriode++
    else horsDate++ // création dans le futur : anomalie, non comptée dans la période
  }
  return { mois, avantPeriode, horsDate, max: Math.max(0, ...mois.map((m) => m.count)) }
}

// Agrégats du ledger. Les crédits offerts et les corrections participent au solde
// réel (RPC get_credit_balance, source d'autorité, PAS recalculé ici) mais ne sont
// ni des achats ni des rechargements : ils sont isolés pour expliquer un écart.
export function statsCredits(mouvements) {
  const stats = { achetes: 0, consommes: 0, rechargements: 0, offerts: 0, corrections: 0, autres: 0 }
  for (const m of mouvements || []) {
    const montant = Number(m?.amount) || 0
    switch (m?.type) {
      case 'achat':
        if (montant > 0) { stats.achetes += montant; stats.rechargements++ }
        else stats.autres += montant
        break
      case 'debit_fiche':
        stats.consommes += Math.abs(montant)
        break
      case 'offert':
        stats.offerts += montant
        break
      case 'correction':
        stats.corrections += Math.abs(montant)
        break
      default:
        stats.autres += montant
    }
  }
  return stats
}

// Provenance des dates de PDF. La reprise historique du 09/09/2026
// (docs/migrations/2026-09-09_backfill_pdf_generated_at.sql) a posé `pdf_generated_at`
// = `updated_at` sur les fiches verrouillées sans preuve : une date APPROXIMATIVE, bonne
// pour attester la présence du PDF, pas pour dire quand il a été généré. Toute valeur
// postérieure à la reprise vient d'une vraie génération (RPC fiche_lite_enregistrer_pdf).
// La chronologie n'affiche donc un « PDF généré » que pour ces dates-là ; la couverture
// des livrables, elle, ne regarde que la présence.
export const PDF_DATE_FIABLE_DEPUIS = '2026-09-09T05:42:00Z'

export const pdfDateFiable = (iso) => {
  const t = new Date(iso).getTime()
  return !Number.isNaN(t) && t > Date.parse(PDF_DATE_FIABLE_DEPUIS)
}

export const TYPES_ACTIVITE = {
  creation: 'Fiche créée',
  pdf: 'PDF généré',
  annonce_airbnb: 'Annonce Airbnb générée',
  annonce_booking: 'Annonce Booking générée',
  guide: 'Guide d’accès généré',
}

// Chronologie des derniers horodatages CONNUS, toutes fiches confondues (les
// archivées sont signalées). Une annonce régénérée n'a qu'une date : celle de la
// version conservée. Tri décroissant, limitée.
export function activiteRecente(fiches, annonces, limite = 8) {
  const parId = new Map(fiches.map((f) => [f.id, f]))
  const evenements = []
  const pousser = (fiche, type, date) => {
    if (!fiche || !date) return
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return
    evenements.push({ type, libelle: TYPES_ACTIVITE[type], fiche, date: d.toISOString(), archivee: estArchivee(fiche) })
  }
  for (const fiche of fiches) {
    pousser(fiche, 'creation', fiche.created_at)
    if (pdfDateFiable(fiche.pdf_generated_at)) pousser(fiche, 'pdf', fiche.pdf_generated_at)
    pousser(fiche, 'guide', fiche.guide_genere_at || fiche.section_guide_acces?.guide_genere_at)
  }
  for (const a of annonces || []) {
    const fiche = parId.get(a.fiche_id)
    if (a.plateforme === 'airbnb') pousser(fiche, 'annonce_airbnb', a.generated_at)
    if (a.plateforme === 'booking') pousser(fiche, 'annonce_booking', a.generated_at)
  }
  return evenements.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limite)
}

// Pourcentage entier sûr : jamais NaN, jamais > 100 ; null sans dénominateur.
export function pourcentage(part, total) {
  if (!total || total <= 0) return null
  return Math.min(100, Math.round((part / total) * 100))
}

// Point d'entrée : tout ce que la page affiche à partir des trois sources.
// `annonces` peut être `null` (chargement échoué) : les indicateurs qui en dépendent
// sont alors absents (`null`), jamais faux à zéro.
export function calculerStats({ fiches = [], annonces = null, mouvements = null, now = Date.now() }) {
  const inv = inventaire(fiches)
  const fichesActives = fiches.filter((f) => !estArchivee(f))
  const annoncesOk = Array.isArray(annonces)
  const index = annoncesOk ? indexerAnnonces(annonces) : null
  return {
    inventaire: inv,
    fichesActives,
    couverture: annoncesOk ? couvertureLivrables(fichesActives, index) : null,
    aCompleter: annoncesOk ? fichesACompleter(fichesActives, index) : null,
    creations: creationsParMois(fiches, now),
    credits: Array.isArray(mouvements) ? statsCredits(mouvements) : null,
    activite: activiteRecente(fiches, annoncesOk ? annonces : []),
    annoncesIndisponibles: !annoncesOk,
  }
}
