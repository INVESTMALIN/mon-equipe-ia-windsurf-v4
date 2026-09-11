// Titres affichés en tête des cartes d'agent (Annonce, Guide d'accès).
//
// Le module testé est pur : pas de Supabase, pas de génération, rien à simuler.
// Deux règles à verrouiller : le titre de l'annonce suit TOUJOURS la plateforme
// sélectionnée (jamais le titre Airbnb sous le libellé Booking), et le guide ne reçoit
// un titre QUE si son texte en contient un exploitable — jamais un titre inventé.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { titreAnnonce, titreGuide, PLATEFORME_LABEL } from '../src/lib/agentTitres.js'

// ─── Annonce ────────────────────────────────────────────────────────────────

test('titreAnnonce : Airbnb prend la première proposition non vide', () => {
  const output = { airbnb: { titres: ['', '  ', 'Villa élégante piscine vue mer Sailly', 'Autre'] } }
  assert.equal(titreAnnonce(output, 'airbnb'), 'Villa élégante piscine vue mer Sailly')
})

test('titreAnnonce : Booking prend le nom de l’hébergement', () => {
  const output = { booking: { nom: '  T2 Vue Montagne - 4 pers - Balcon - Annemasse ' } }
  assert.equal(titreAnnonce(output, 'booking'), 'T2 Vue Montagne - 4 pers - Balcon - Annemasse')
})

test('titreAnnonce : le titre suit la plateforme, pas la clé présente', () => {
  // Une ligne agent_outputs Airbnb ne porte que la clé airbnb : sous Booking, rien.
  const ligneAirbnb = { airbnb: { titres: ['Loft charmant Lourmarin'] } }
  assert.equal(titreAnnonce(ligneAirbnb, 'booking'), '')
  const ligneBooking = { booking: { nom: 'Loft Lourmarin' } }
  assert.equal(titreAnnonce(ligneBooking, 'airbnb'), '')
})

test('titreAnnonce : sortie absente ou malformée → chaîne vide, jamais d’exception', () => {
  assert.equal(titreAnnonce(null, 'airbnb'), '')
  assert.equal(titreAnnonce({}, 'airbnb'), '')
  assert.equal(titreAnnonce({ airbnb: { titres: 'pas un tableau' } }, 'airbnb'), '')
  assert.equal(titreAnnonce({ airbnb: { titres: [null, undefined, 42] } }, 'airbnb'), '42')
  assert.equal(titreAnnonce({ booking: {} }, 'booking'), '')
})

test('PLATEFORME_LABEL couvre exactement les deux plateformes', () => {
  assert.deepEqual(Object.keys(PLATEFORME_LABEL).sort(), ['airbnb', 'booking'])
})

// ─── Guide d'accès ──────────────────────────────────────────────────────────

test('titreGuide : une ligne de titre marquée est reprise, nettoyée de son marqueur', () => {
  assert.equal(titreGuide("# Guide d'accès — Villa Horizon\n\nAdresse : …"), "Guide d'accès — Villa Horizon")
  assert.equal(titreGuide('  Guide d’arrivée :\ntexte'), 'Guide d’arrivée')
})

test('titreGuide : une ligne tout en capitales est ramenée en casse de phrase', () => {
  // Format réellement observé en base.
  assert.equal(titreGuide("- GUIDE D'ACCES COMPLET AU LOGEMENT\n\nAdresse : 1 rue X"), "Guide d'acces complet au logement")
})

test('titreGuide : un préambule conversationnel n’est PAS un titre', () => {
  // Formats réellement observés en base : le moteur commence parfois par se raconter.
  assert.equal(titreGuide("Je vais analyser le transcript de votre vidéo d'arrivée et…"), '')
  assert.equal(titreGuide('Je vois que vous souhaitez créer un guide d’accès complet. Cependant…'), '')
  assert.equal(titreGuide('Voici le guide d’accès de votre logement'), '')
  assert.equal(titreGuide('Bonjour, voici votre guide'), '')
})

test('titreGuide : une phrase (ponctuation finale) ou une ligne trop longue n’est pas un titre', () => {
  assert.equal(titreGuide('Le logement se trouve au deuxième étage.'), '')
  assert.equal(titreGuide('Tournez à gauche après la boulangerie !'), '')
  assert.equal(titreGuide('A'.repeat(81)), '')
  assert.equal(titreGuide('A'.repeat(80)), 'A'.repeat(80).charAt(0) + 'a'.repeat(79))
})

test('titreGuide : texte vide, nul ou fait de lignes blanches → chaîne vide', () => {
  assert.equal(titreGuide(''), '')
  assert.equal(titreGuide(null), '')
  assert.equal(titreGuide(undefined), '')
  assert.equal(titreGuide('\n\n   \n'), '')
  assert.equal(titreGuide('---\n'), '')
})

test('titreGuide : la première ligne NON VIDE décide, les lignes blanches en tête sont ignorées', () => {
  assert.equal(titreGuide('\n\n  Accès au studio Bellevue\nSuite…'), 'Accès au studio Bellevue')
})
