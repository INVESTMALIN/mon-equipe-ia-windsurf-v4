// Ancienne case « Stores » des chambres : affichée seulement là où elle a été vue
// cochée pour la fiche courante (src/lib/storesHistorique.js).
//
// Ce qui est verrouillé :
//   - masquée si jamais cochée, affichée si cochée ;
//   - reste affichée après un décochage (pas de disparition sous le doigt) ;
//   - un nouveau chargement (état neuf) ne la montre plus si elle n'est plus cochée ;
//   - changement de fiche sans démontage (?id=A → ?id=B) : rien ne fuit de A vers B.
// Fiches synthétiques, aucune donnée réelle, aucun réseau.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  storesHistoriqueInitial,
  majStoresHistorique,
  afficherStoresHistorique
} from '../src/lib/storesHistorique.js'

const chambres = (valeurs) => Object.fromEntries(
  Object.entries(valeurs).map(([key, stores]) => [key, { equipements_stores: stores }])
)

test('masquée si jamais cochée, affichée si cochée', () => {
  const data = chambres({ chambre_1: null, chambre_2: true })
  const h = majStoresHistorique(storesHistoriqueInitial('A'), 'A', data)
  assert.equal(afficherStoresHistorique(h, 'A', data, 'chambre_1'), false)
  assert.equal(afficherStoresHistorique(h, 'A', data, 'chambre_2'), true)
})

test('reste affichée après décochage, disparaît au chargement suivant', () => {
  let h = majStoresHistorique(storesHistoriqueInitial('A'), 'A', chambres({ chambre_1: true }))
  const decochee = chambres({ chambre_1: null })
  h = majStoresHistorique(h, 'A', decochee)
  assert.equal(afficherStoresHistorique(h, 'A', decochee, 'chambre_1'), true)

  const rechargee = majStoresHistorique(storesHistoriqueInitial('A'), 'A', decochee)
  assert.equal(afficherStoresHistorique(rechargee, 'A', decochee, 'chambre_1'), false)
})

test('changement de fiche sans démontage : rien ne fuit de A vers B', () => {
  let h = majStoresHistorique(storesHistoriqueInitial('A'), 'A', chambres({ chambre_1: true }))
  const ficheB = chambres({ chambre_1: null })
  // Rendu intermédiaire : l'id a changé, l'effet n'a pas encore tourné
  assert.equal(afficherStoresHistorique(h, 'B', ficheB, 'chambre_1'), false)
  h = majStoresHistorique(h, 'B', ficheB)
  assert.equal(afficherStoresHistorique(h, 'B', ficheB, 'chambre_1'), false)
})

test('état inchangé renvoyé tel quel (pas de boucle de rendus)', () => {
  const data = chambres({ chambre_1: true })
  const h = majStoresHistorique(storesHistoriqueInitial('A'), 'A', data)
  assert.equal(majStoresHistorique(h, 'A', data), h)
})
