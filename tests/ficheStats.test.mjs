// Règles de calcul de /mes-statistiques (Fiche Logement Lite).
//
// Module pur : pas de Supabase, pas de réseau. Ces tests verrouillent les règles de
// cadrage faciles à casser : l'unité est la fiche (une régénération n'ajoute rien),
// les archivées comptent dans l'inventaire mais jamais dans la couverture ni dans
// « à compléter », brouillons + complétées + archivées = total, jamais de NaN, et
// une source absente donne `null` plutôt qu'un faux zéro.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  calculerStats,
  creationsParMois,
  statsCredits,
  activiteRecente,
  pourcentage,
  indexerAnnonces,
} from '../src/lib/ficheStats.js'

const NOW = new Date('2026-09-15T10:00:00Z').getTime()

const fiche = (id, extra = {}) => ({
  id,
  nom: `Fiche ${id}`,
  statut: 'Brouillon',
  created_at: '2026-09-01T08:00:00Z',
  updated_at: '2026-09-02T08:00:00Z',
  archived_at: null,
  pdf_generated_at: null,
  guide_genere_at: null,
  ...extra,
})

test('inventaire : brouillons actifs + complétées actives + archivées = total, une archivée ne compte qu’une fois', () => {
  const fiches = [
    fiche('a', { statut: 'Complété' }),
    fiche('b'),
    fiche('c', { statut: 'Complété', archived_at: '2026-09-10T00:00:00Z' }),
    fiche('d', { archived_at: '2026-09-10T00:00:00Z' }),
  ]
  const { inventaire } = calculerStats({ fiches, annonces: [], mouvements: [], now: NOW })
  assert.deepEqual(inventaire, { total: 4, actives: 2, archivees: 2, brouillonsActifs: 1, completeesActives: 1 })
  assert.equal(inventaire.brouillonsActifs + inventaire.completeesActives + inventaire.archivees, inventaire.total)
})

test('couverture : la fiche est l’unité, Airbnb + Booking = une seule fiche avec annonce, archivées exclues', () => {
  const fiches = [
    fiche('a', { pdf_generated_at: '2026-09-03T00:00:00Z', guide_genere_at: '2026-09-04T00:00:00Z' }),
    fiche('b', { pdf_generated_at: '2026-09-03T00:00:00Z' }),
    fiche('c'),
    fiche('z', { pdf_generated_at: '2026-09-03T00:00:00Z', archived_at: '2026-09-10T00:00:00Z' }),
  ]
  const annonces = [
    { fiche_id: 'a', plateforme: 'airbnb', generated_at: '2026-09-05T00:00:00Z' },
    { fiche_id: 'a', plateforme: 'booking', generated_at: '2026-09-06T00:00:00Z' },
    { fiche_id: 'z', plateforme: 'airbnb', generated_at: '2026-09-06T00:00:00Z' }, // archivée : ignorée
  ]
  const { couverture } = calculerStats({ fiches, annonces, mouvements: [], now: NOW })
  assert.deepEqual(couverture, {
    fichesActives: 3,
    pdf: 2,
    annonce: 1,
    airbnb: 1,
    booking: 1,
    guide: 1,
    troisFamilles: 1,
    aucun: 1,
    totalLivrables: 2 + 1 + 1 + 1,
  })
})

test('une régénération ne crée pas de livrable supplémentaire (deux lignes même plateforme = une annonce)', () => {
  const index = indexerAnnonces([
    { fiche_id: 'a', plateforme: 'airbnb', generated_at: '2026-09-01T00:00:00Z' },
    { fiche_id: 'a', plateforme: 'airbnb', generated_at: '2026-09-09T00:00:00Z' },
  ])
  assert.equal(index.get('a').airbnb, '2026-09-09T00:00:00Z') // la plus récente
  assert.equal(index.get('a').booking, null)
  const { couverture } = calculerStats({
    fiches: [fiche('a')],
    annonces: [
      { fiche_id: 'a', plateforme: 'airbnb', generated_at: '2026-09-01T00:00:00Z' },
      { fiche_id: 'a', plateforme: 'airbnb', generated_at: '2026-09-09T00:00:00Z' },
    ],
    mouvements: [],
    now: NOW,
  })
  assert.equal(couverture.airbnb, 1)
  assert.equal(couverture.totalLivrables, 1)
})

test('à compléter : uniquement les actives à qui il manque une famille, jamais les archivées ni les complètes', () => {
  const fiches = [
    fiche('complete', { pdf_generated_at: 'x', guide_genere_at: 'y', updated_at: '2026-09-09T00:00:00Z' }),
    fiche('sansGuide', { pdf_generated_at: 'x', updated_at: '2026-09-08T00:00:00Z' }),
    fiche('rien', { updated_at: '2026-09-10T00:00:00Z' }),
    fiche('archivee', { archived_at: '2026-09-10T00:00:00Z' }),
  ]
  const annonces = [
    { fiche_id: 'complete', plateforme: 'booking', generated_at: 'z' },
    { fiche_id: 'sansGuide', plateforme: 'airbnb', generated_at: 'z' },
  ]
  const { aCompleter } = calculerStats({ fiches, annonces, mouvements: [], now: NOW })
  assert.deepEqual(aCompleter.map((e) => e.fiche.id), ['rien', 'sansGuide']) // plus récemment modifiée d'abord
  assert.deepEqual(aCompleter[0].manquants, ['pdf', 'annonce', 'guide'])
  assert.deepEqual(aCompleter[1].manquants, ['guide'])
})

test('créations sur 12 mois : ordre chronologique, mois à zéro inclus, mois courant inclus, anciennes réconciliées', () => {
  const fiches = [
    fiche('a', { created_at: '2026-09-14T00:00:00Z' }),
    fiche('b', { created_at: '2026-09-02T00:00:00Z' }),
    fiche('c', { created_at: '2025-10-20T00:00:00Z' }), // premier mois de la fenêtre
    fiche('d', { created_at: '2025-09-30T00:00:00Z' }), // avant la fenêtre
    fiche('e', { created_at: 'pas une date' }),
  ]
  const { mois, avantPeriode, horsDate, max } = creationsParMois(fiches, NOW)
  assert.equal(mois.length, 12)
  assert.equal(mois[0].cle, '2025-10')
  assert.equal(mois[11].cle, '2026-09')
  assert.deepEqual(mois.map((m) => m.count), [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2])
  assert.equal(avantPeriode, 1)
  assert.equal(horsDate, 1)
  assert.equal(max, 2)
})

test('crédits : achetés / consommés / rechargements, offerts et corrections isolés, pas d’équation forcée', () => {
  const stats = statsCredits([
    { amount: 10, type: 'achat' },
    { amount: 1, type: 'achat' },
    { amount: -1, type: 'debit_fiche' },
    { amount: -1, type: 'debit_fiche' },
    { amount: 3, type: 'offert' },
    { amount: -1, type: 'correction' },
  ])
  assert.deepEqual(stats, { achetes: 11, consommes: 2, rechargements: 2, offerts: 3, corrections: 1, autres: 0 })
  // Le solde réel (RPC) vaut 11 - 2 + 3 - 1 = 11, pas « achetés − consommés » = 9.
  assert.notEqual(stats.achetes - stats.consommes, 11)
})

test('activité récente : derniers horodatages connus, tri décroissant, annonce = date de la version conservée, archivée signalée', () => {
  const fiches = [
    fiche('a', { created_at: '2026-09-01T00:00:00Z', pdf_generated_at: '2026-09-10T00:00:00Z', guide_genere_at: '2026-09-03T00:00:00Z' }),
    fiche('z', { created_at: '2026-08-01T00:00:00Z', archived_at: '2026-09-01T00:00:00Z' }),
  ]
  const annonces = [{ fiche_id: 'a', plateforme: 'airbnb', generated_at: '2026-09-12T00:00:00Z' }]
  const activite = activiteRecente(fiches, annonces, 3)
  assert.deepEqual(activite.map((e) => e.type), ['annonce_airbnb', 'pdf', 'guide'])
  assert.equal(activiteRecente(fiches, annonces, 10).find((e) => e.fiche.id === 'z').archivee, true)
})

test('pourcentage : jamais NaN ni > 100, null sans dénominateur', () => {
  assert.equal(pourcentage(0, 0), null)
  assert.equal(pourcentage(3, 0), null)
  assert.equal(pourcentage(1, 3), 33)
  assert.equal(pourcentage(5, 4), 100)
})

test('sans aucune fiche : inventaire à zéro, couverture sans NaN, rien à compléter, aucune activité', () => {
  const s = calculerStats({ fiches: [], annonces: [], mouvements: [], now: NOW })
  assert.equal(s.inventaire.total, 0)
  assert.equal(s.couverture.fichesActives, 0)
  assert.equal(pourcentage(s.couverture.pdf, s.couverture.fichesActives), null)
  assert.deepEqual(s.aCompleter, [])
  assert.deepEqual(s.activite, [])
  assert.equal(s.creations.mois.every((m) => m.count === 0), true)
})

test('source annonces absente : couverture et « à compléter » valent null, jamais un faux zéro', () => {
  const s = calculerStats({ fiches: [fiche('a')], annonces: null, mouvements: null, now: NOW })
  assert.equal(s.couverture, null)
  assert.equal(s.aCompleter, null)
  assert.equal(s.credits, null)
  assert.equal(s.annoncesIndisponibles, true)
  assert.equal(s.inventaire.total, 1) // l'inventaire, lui, reste calculable
})
