// Tests des réconciliations du mapper Lite (lecture JSONB par section). Fixtures
// synthétiques, aucune donnée réelle. Lancer : `deno test mapper_test.ts`.
// Miroir des tests FL + cas spécifiques Lite (grille recalculée, objets-de-booléens,
// sélection simple climatisation/chauffage).

import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts'
import { mapFicheToContrat } from './mapper.ts'

Deno.test('RDC ne sort jamais d\'ascenseur (même si equipements.ascenseur=true)', () => {
  const c = mapFicheToContrat({
    section_logement: { type_propriete: 'Appartement', appartement: { acces: 'RDC' } },
    section_equipements: { ascenseur: true },
  })
  assertEquals(c.modele.identite.ascenseur, false)
})

Deno.test('Escalier → pas d\'ascenseur ; Ascenseur → ascenseur', () => {
  assertEquals(
    mapFicheToContrat({ section_logement: { type_propriete: 'Appartement', appartement: { acces: 'Escalier' } } }).modele.identite.ascenseur,
    false,
  )
  assertEquals(
    mapFicheToContrat({ section_logement: { type_propriete: 'Appartement', appartement: { acces: 'Ascenseur' } } }).modele.identite.ascenseur,
    true,
  )
})

Deno.test('Maison : niveau_maison rempli, etage_appartement null, ascenseur via équipement', () => {
  const c = mapFicheToContrat({
    section_logement: { type_propriete: 'Maison', maison_niveau: 'plain_pied', appartement: { etage: '2' } },
    section_equipements: { ascenseur: true },
  })
  assertEquals(c.modele.identite.niveau_maison, 'plain_pied')
  assertEquals(c.modele.identite.etage_appartement, null)
  assertEquals(c.modele.identite.ascenseur, true)
})

Deno.test('Studio : étage/accès lus dans le bloc studio (pas appartement)', () => {
  const c = mapFicheToContrat({
    section_logement: { type_propriete: 'Studio', studio: { acces: 'Ascenseur', etage: '3' } },
  })
  assertEquals(c.modele.identite.acces, 'Ascenseur')
  assertEquals(c.modele.identite.etage_appartement, '3')
  assertEquals(c.modele.identite.ascenseur, true)
})

Deno.test('Atout piscine sans section piscine ne crée pas de piscine', () => {
  const c = mapFicheToContrat({
    section_avis: { atouts_logement: { piscine: true } },
    section_equip_spe_exterieur: { dispose_piscine: false },
  })
  assertEquals(c.modele.equipements.piscine.present, false)
  assert(c.modele.atouts.atouts_logement.includes('piscine')) // reste un signal d'emphase
})

Deno.test('Consommables : positif élargi (toilette + ménage), café exclu, jamais de négatif', () => {
  const fourni = mapFicheToContrat({
    section_consommables: { fournis_par_prestataire: true, gel_douche: false, shampoing: true, pastilles_lave_vaisselle: true },
  })
  assertEquals(fourni.modele.equipements.consommables.produits, ['Shampoing', 'Pastilles lave-vaisselle'])
  // Café fourni → JAMAIS exposé (règle de prod), même si fourni=true.
  const cafe = mapFicheToContrat({ section_consommables: { fournis_par_prestataire: true, cafe_nespresso: true } })
  assertEquals(cafe.modele.equipements.consommables.produits, [])
  // Explicitement "non fourni" → aucune liste.
  const nonFourni = mapFicheToContrat({ section_consommables: { fournis_par_prestataire: false, gel_douche: true } })
  assertEquals(nonFourni.modele.equipements.consommables.produits, [])
  // Section non répondue → MÊME résultat, aucune absence.
  const inconnu = mapFicheToContrat({ section_consommables: { gel_douche: true } })
  assertEquals(inconnu.modele.equipements.consommables.produits, [])
  // Aucun booléen `fournis` exposé au modèle.
  assert(!('fournis' in fourni.modele.equipements.consommables))
})

Deno.test('Self check-in déduit des 4 sources (sans la mécanique)', () => {
  assertEquals(mapFicheToContrat({ section_clefs: { boiteType: 'TTlock' } }).modele.equipements.self_checkin, true)
  assertEquals(mapFicheToContrat({ section_clefs: { digicode: true } }).modele.equipements.self_checkin, true)
  assertEquals(mapFicheToContrat({ section_clefs: { interphone: true } }).modele.equipements.self_checkin, true)
  assertEquals(mapFicheToContrat({ section_clefs: { tempoGache: true } }).modele.equipements.self_checkin, true)
  assertEquals(mapFicheToContrat({}).modele.equipements.self_checkin, false)
})

Deno.test('Doublon cinéma réconcilié en un seul signal', () => {
  assertEquals(mapFicheToContrat({ section_equipements: { cinema: true } }).modele.equipements.salle_cinema, true)
  assertEquals(mapFicheToContrat({ section_equip_spe_exterieur: { dispose_salle_cinema: true } }).modele.equipements.salle_cinema, true)
  assertEquals(mapFicheToContrat({}).modele.equipements.salle_cinema, false)
})

Deno.test('PMR : la case Équipements ne sert qu\'au positif, jamais de négatif', () => {
  const oui = mapFicheToContrat({ section_equipements: { accessible_mobilite_reduite: true, pmr_details: 'Rampe + ascenseur' } })
  assertEquals(oui.modele.equipements.pmr.accessible, true)
  assertEquals(oui.modele.equipements.pmr.details, 'Rampe + ascenseur')
  const non = mapFicheToContrat({ section_equipements: { accessible_mobilite_reduite: false } })
  assertEquals(non.modele.equipements.pmr.accessible, null)
  const inconnu = mapFicheToContrat({})
  assertEquals(inconnu.modele.equipements.pmr.accessible, null)
})

Deno.test('PMR anti-contradiction : immeuble inaccessible → positif jamais exposé au modèle', () => {
  const c = mapFicheToContrat({
    section_equipements: { accessible_mobilite_reduite: true, pmr_details: 'Rampe' },
    section_avis: { immeuble_accessibilite: 'inaccessible' },
  })
  assertEquals(c.modele.equipements.pmr.accessible, null)
  assertEquals(c.modele.equipements.pmr.details, null)
})

Deno.test('Parking : le détail libre opérationnel n\'est jamais exposé en zone modèle', () => {
  const c = mapFicheToContrat({
    section_equipements: { parking_type: 'rue', parking_rue_details: 'Places rue de la Gare, badge résident requis' },
  })
  assert(!('details' in c.modele.equipements.parking))
  assertEquals(c.modele.equipements.parking.type, 'rue')
  assert(!JSON.stringify(c.modele).includes('badge résident'))
})

Deno.test('Cuisine : équipement "autre" libre exposé seulement si coché ET renseigné, trimmé', () => {
  assertEquals(
    mapFicheToContrat({ section_cuisine_1: { equipements_autre: true, equipements_autre_details: 'Robot Kenwood' } }).modele.equipements.cuisine.autre,
    'Robot Kenwood',
  )
  assertEquals(mapFicheToContrat({ section_cuisine_1: { equipements_autre: true } }).modele.equipements.cuisine.autre, null)
  assertEquals(
    mapFicheToContrat({ section_cuisine_1: { equipements_autre: true, equipements_autre_details: '   ' } }).modele.equipements.cuisine.autre,
    null,
  )
  assertEquals(
    mapFicheToContrat({ section_cuisine_1: { equipements_autre: true, equipements_autre_details: '  Robot Kenwood  ' } }).modele.equipements.cuisine.autre,
    'Robot Kenwood',
  )
  // Libellé présent mais case non cochée → null.
  assertEquals(
    mapFicheToContrat({ section_cuisine_1: { equipements_autre_details: 'Robot Kenwood' } }).modele.equipements.cuisine.autre,
    null,
  )
})

Deno.test('Fêtes/fumeurs : "non" par défaut, "oui" si explicite, exposés en code ET modèle', () => {
  const vide = mapFicheToContrat({})
  assertEquals(vide.code.regles_calculees.fetes_autorisees, false)
  assertEquals(vide.code.regles_calculees.fumeurs_acceptes, false)
  assertEquals(vide.modele.regles_internes.fetes_autorisees, false)
  const oui = mapFicheToContrat({ section_equipements: { fetes_autorisees: true, fumeurs_acceptes: true } })
  assertEquals(oui.code.regles_calculees.fetes_autorisees, true)
  assertEquals(oui.modele.regles_internes.fetes_autorisees, true)
  assertEquals(oui.modele.regles_internes.fumeurs_acceptes, true)
})

Deno.test('Caméras : détectées en zone code, exclues de securite_rassurante', () => {
  const c = mapFicheToContrat({
    section_securite: { equipements: ['Caméras de surveillance extérieures', 'Détecteur de fumée'] },
  })
  assertEquals(c.code.cameras.exterieures, true)
  assert(!c.modele.regles_internes.securite_rassurante.includes('Caméras de surveillance extérieures'))
  assert(c.modele.regles_internes.securite_rassurante.includes('Détecteur de fumée'))
})

Deno.test('Caméra intérieure espaces communs détectée en zone code', () => {
  const c = mapFicheToContrat({
    section_securite: { equipements: ['Caméras de surveillance intérieures (uniquement dans les espaces communs)'] },
  })
  assertEquals(c.code.cameras.interieures_communs, true)
})

Deno.test('Quartier défavorisé : exclu des positifs (modèle), trigger en zone code', () => {
  const c = mapFicheToContrat({ section_avis: { quartier_types: ['quartier_central', 'quartier_defavorise'] } })
  assert(!c.modele.localisation.quartier_types.includes('quartier_defavorise'))
  assert(c.modele.localisation.quartier_types.includes('quartier_central'))
  assertEquals(c.code.note_quartier_triggers.quartier_defavorise, true)
})

Deno.test('La rue n\'entre jamais dans la zone modèle (seule la ville sort)', () => {
  const c = mapFicheToContrat({ section_proprietaire: { adresse: { rue: '5 Rue de l\'Eau', ville: 'Colmar' } } })
  assert(!JSON.stringify(c.modele).includes('Rue de l\'Eau'))
  assertEquals(c.modele.localisation.ville, 'Colmar')
})

Deno.test('animaux_acceptes : booléen natif Lite (et tolérance radio texte)', () => {
  assertEquals(mapFicheToContrat({ section_equipements: { animaux_acceptes: false } }).modele.regles_internes.animaux_acceptes, false)
  assertEquals(mapFicheToContrat({ section_equipements: { animaux_acceptes: true } }).modele.regles_internes.animaux_acceptes, true)
  assertEquals(mapFicheToContrat({ section_equipements: { animaux_acceptes: 'non' } }).modele.regles_internes.animaux_acceptes, false)
})

Deno.test('Studio : couchage de l\'espace nuit lu même si nombre_chambres=0', () => {
  const studio = mapFicheToContrat({
    section_logement: { typologie: 'Studio' },
    section_visite: { nombre_chambres: '0' },
    section_chambres: { chambre_1: { lit_double_140_190: 1 } },
  })
  assertEquals(studio.modele.identite.chambres.length, 1)
  assertEquals(studio.modele.identite.chambres[0].lits, [{ type: 'Lit double 140×190', nombre: 1 }])
  // L'override est studio-spécifique : un non-studio à 0 chambre ne lit pas chambre_1.
  const t2 = mapFicheToContrat({
    section_logement: { typologie: 'T2' },
    section_visite: { nombre_chambres: '0' },
    section_chambres: { chambre_1: { lit_double_140_190: 1 } },
  })
  assertEquals(t2.modele.identite.chambres.length, 0)
})

Deno.test('SDB combinée douche/baignoire → douche ET baignoire présentes (jamais tout-false)', () => {
  const c = mapFicheToContrat({
    section_visite: { nombre_salles_bains: '1' },
    section_salle_de_bains: {
      salle_de_bain_1: { acces: 'privee', equipements_douche_baignoire_combinees: true, equipements_douche: false, equipements_baignoire: false },
    },
  })
  assertEquals(c.modele.equipements.salles_de_bains[0].douche, true)
  assertEquals(c.modele.equipements.salles_de_bains[0].baignoire, true)
  assertEquals(c.modele.equipements.salles_de_bains[0].acces, 'privee') // privé/partagé forwardé
})

Deno.test('Complétude : type "Autre" → précision concrète conservée', () => {
  const c = mapFicheToContrat({ section_logement: { type_propriete: 'Autre', type_autre_precision: 'Chalets' } })
  assertEquals(c.modele.identite.type_propriete, 'Autre')
  assertEquals(c.modele.identite.type_precision, 'Chalets')
})

Deno.test('Complétude : piscine saisonnière → période + période de chauffage', () => {
  const c = mapFicheToContrat({
    section_equip_spe_exterieur: {
      dispose_piscine: true,
      piscine_disponibilite: 'Disponible à certaines périodes',
      piscine_periode_disponibilite: 'Mai à septembre',
      piscine_caracteristiques: ['Chauffée'],
      piscine_periode_chauffage: 'Juin à août',
    },
  })
  assertEquals(c.modele.equipements.piscine.periode_disponibilite, 'Mai à septembre')
  assertEquals(c.modele.equipements.piscine.periode_chauffage, 'Juin à août')
})

Deno.test('Bébé : chaise haute dérivée de la case cochée, pas du seul type optionnel', () => {
  assertEquals(mapFicheToContrat({ section_bebe: { equipements: ['Chaise haute'] } }).modele.cible_voyageurs.bebe.chaise_haute, true)
  assertEquals(mapFicheToContrat({ section_bebe: { chaise_haute_type: 'Pliante' } }).modele.cible_voyageurs.bebe.chaise_haute, true)
  assertEquals(mapFicheToContrat({ section_bebe: { equipements: ['Lit bébé'] } }).modele.cible_voyageurs.bebe.chaise_haute, false)
})

Deno.test('Localisation enrichie = placeholder (câblée à la génération)', () => {
  assertEquals(mapFicheToContrat({}).modele.localisation.enrichissement, null)
})

// ───────────────────── Cas spécifiques Lite ─────────────────────

Deno.test('Grille : verdict recalculé seulement si les 9 critères sont notés', () => {
  const notes = (v: number) => ({
    grille_proprete_generale_note: v, grille_sols_note: v, grille_murs_plafonds_note: v,
    grille_cuisine_note: v, grille_salle_bain_note: v, grille_equipements_note: v,
    grille_menuiseries_note: v, grille_odeurs_note: v, grille_impression_generale_note: v,
  })
  // 9 × 5 = 45 → excellent_etat (positif : pas de note_etat en aval).
  const excellent = mapFicheToContrat({ section_avis: notes(5) })
  assertEquals(excellent.code.note_etat_triggers.grille_verdict, 'excellent_etat')
  assertEquals(excellent.code.note_etat_triggers.grille_score_total, 45)
  // 9 × 2 = 18 → etat_degrade (≥16).
  const degrade = mapFicheToContrat({ section_avis: notes(2) })
  assertEquals(degrade.code.note_etat_triggers.grille_verdict, 'etat_degrade')
  // Grille incomplète (8/9) → verdict null, score null (pas de déclenchement).
  const incomplet = mapFicheToContrat({
    section_avis: { ...notes(3), grille_impression_generale_note: undefined },
  })
  assertEquals(incomplet.code.note_etat_triggers.grille_verdict, null)
  assertEquals(incomplet.code.note_etat_triggers.grille_score_total, null)
})

Deno.test('atouts_logement / types_voyageurs : objets-de-booléens → clés cochées', () => {
  const c = mapFicheToContrat({
    section_avis: {
      atouts_logement: { lumineux: true, renove: true, charmant: false },
      types_voyageurs: { tribus_familiales: true, duo_amoureux: false },
    },
  })
  assertEquals(c.modele.atouts.atouts_logement.sort(), ['lumineux', 'renove'])
  assertEquals(c.modele.atouts.renove, true)
  assert(c.modele.cible_voyageurs.types_voyageurs.includes('tribus_familiales'))
  assert(!c.modele.cible_voyageurs.types_voyageurs.includes('duo_amoureux'))
})

Deno.test('Climatisation/chauffage : sélection simple Lite → array 0/1', () => {
  const c = mapFicheToContrat({
    section_equipements: { climatisation: true, climatisation_type: 'Centralisée', chauffage: true, chauffage_type: 'Électrique' },
  })
  assertEquals(c.modele.equipements.climatisation, true)
  assertEquals(c.modele.equipements.climatisation_types, ['Centralisée'])
  assertEquals(c.modele.equipements.chauffage_types, ['Électrique'])
  // Vide → array vide, jamais [null] ni [''].
  assertEquals(mapFicheToContrat({ section_equipements: { climatisation: true } }).modele.equipements.climatisation_types, [])
})

Deno.test('Vue : vue_types passé tel quel, ventilateur/sèche-serviettes neutres (non collectés Lite)', () => {
  const c = mapFicheToContrat({ section_avis: { vue_types: ['vue_mer', 'vue_montagne'] } })
  assertEquals(c.modele.atouts.vue_types, ['vue_mer', 'vue_montagne'])
  assertEquals(c.modele.equipements.ventilateur, null)
  assertEquals(c.modele.equipements.ventilateur_types, [])
  assertEquals(c.modele.equipements.seche_serviettes, null)
})

Deno.test('Vue : le sentinelle vue_aucune n\'est jamais exposé au modèle', () => {
  // "Aucune vue à mettre en avant" est exclusif côté formulaire → filtré.
  assertEquals(mapFicheToContrat({ section_avis: { vue_types: ['vue_aucune'] } }).modele.atouts.vue_types, [])
  // Mélange défensif (ne devrait pas arriver) : on garde les vues concrètes, on jette le sentinelle.
  assertEquals(
    mapFicheToContrat({ section_avis: { vue_types: ['vue_mer', 'vue_aucune'] } }).modele.atouts.vue_types,
    ['vue_mer'],
  )
})

Deno.test('Vaisselle complète : le verdict explicite quantite_suffisante prime sur les compteurs', () => {
  // Insuffisant explicite → jamais "complète", même si des assiettes sont comptées.
  assertEquals(
    mapFicheToContrat({ section_cuisine_2: { quantite_suffisante: false, vaisselle_assiettes_plates: 8 } }).modele.equipements.cuisine.vaisselle_complete,
    false,
  )
  // Suffisant explicite → complète, même sans compteur.
  assertEquals(
    mapFicheToContrat({ section_cuisine_2: { quantite_suffisante: true } }).modele.equipements.cuisine.vaisselle_complete,
    true,
  )
  // Pas de verdict → repli sur les compteurs (parité FL).
  assertEquals(
    mapFicheToContrat({ section_cuisine_2: { couverts_verres_eau: 6 } }).modele.equipements.cuisine.vaisselle_complete,
    true,
  )
  assertEquals(mapFicheToContrat({ section_cuisine_2: {} }).modele.equipements.cuisine.vaisselle_complete, false)
})

Deno.test('DPE : classe + dépenses lues en zone code (chaînes numériques tolérées)', () => {
  const c = mapFicheToContrat({
    section_reglementation: { classe_dpe: 'F', dpe_depenses_min: '1500', dpe_depenses_max: '2030', numero_declaration: '12345' },
  })
  assertEquals(c.code.reglementation.classe_dpe, 'F')
  assertEquals(c.code.reglementation.dpe_depenses_min, 1500)
  assertEquals(c.code.reglementation.dpe_depenses_max, 2030)
  assertEquals(c.code.reglementation.numero_declaration, '12345')
})

Deno.test('fiche_id remonté du champ top-level id', () => {
  assertEquals(mapFicheToContrat({ id: 'abc-123' }).fiche_id, 'abc-123')
  assertEquals(mapFicheToContrat({}).fiche_id, null)
})
