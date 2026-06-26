// Mapper fiche_lite brute → contrat d'entrée (transformation PURE).
// Transposition Lite du mapper FL : MÊME contrat de sortie (types.ts identique),
// seule la LECTURE change — colonnes JSONB par section au lieu de colonnes plates.
// Carte des chemins : docs/agent-annonce/gap-analysis-fiche.md.
//
// N'invente aucune règle : déplace/réconcilie des données de la fiche.
// Hors périmètre (volontaire) : aucun appel modèle, aucun assemblage de phrases
// (note_etat/note_quartier ne sont QUE des déclencheurs ici), pas d'écriture en
// base, et le bloc localisation est un placeholder (câblé à la génération).
//
// Différences Lite confirmées (cf. gap-analysis) prises en charge ici :
//   - `atouts_logement` / `types_voyageurs` = OBJETS de booléens (→ trueKeys).
//   - état du logement = GRILLE 9 critères (verdict recalculé), pas un champ unique.
//   - `climatisation_type` / `chauffage_type` = sélection SIMPLE (→ array 0/1).
//   - pas de `ventilateur` ni `seche_serviettes` au niveau équipements.
//   - animaux / fêtes / fumeurs vivent dans `section_equipements`.
//   - pas de bloc « local à vélo ».

import { arr, bool, boolish, type FicheLiteRow, isTrue, num, scanTrueKeys, type Section, section, trueKeys, txt } from './fiche.ts'
import type {
  ChambreContrat,
  CodeZone,
  Contrat,
  ModeleZone,
  SalleDeBainContrat,
} from './types.ts'

export const CONTRAT_SCHEMA_VERSION = 1

// Valeurs exactes stockées dans `section_securite.equipements` (cf. FicheSécurité.jsx).
const CAMERA_EXTERIEURE = 'Caméras de surveillance extérieures'
const CAMERA_INTERIEURE_COMMUNS = 'Caméras de surveillance intérieures (uniquement dans les espaces communs)'

// Types de lits = clés compteur de `section_chambres.chambre_N` (cf. FicheChambre.jsx).
const BED_TYPES: { col: string; label: string }[] = [
  { col: 'lit_simple_90_190', label: 'Lit simple 90×190' },
  { col: 'lit_double_140_190', label: 'Lit double 140×190' },
  { col: 'lit_queen_160_200', label: 'Lit Queen 160×200' },
  { col: 'lit_king_180_200', label: 'Lit King 180×200' },
  { col: 'canape_lit_simple', label: 'Canapé-lit simple' },
  { col: 'canape_lit_double', label: 'Canapé-lit double' },
  { col: 'lits_superposes_90_190', label: 'Lits superposés 90×190' },
  { col: 'lit_gigogne', label: 'Lit gigogne' },
]

// Grille d'évaluation objective (cf. lib/avisGrilleHelpers.js) : 9 critères notés
// 1-5 stockés en `section_avis.grille_${key}_note`. Le verdict global est RECALCULÉ
// ici (Lite ne le persiste pas), mêmes seuils et mêmes clés que le front — les clés
// de verdict (etat_moyen / etat_degrade / tres_mauvais_etat) pilotent note_etat.
const GRILLE_CRITERIA = [
  'proprete_generale', 'sols', 'murs_plafonds', 'cuisine', 'salle_bain',
  'equipements', 'menuiseries', 'odeurs', 'impression_generale',
]
const GRILLE_VERDICTS: { key: string; min: number }[] = [
  { key: 'excellent_etat', min: 40 },
  { key: 'bon_etat', min: 34 },
  { key: 'etat_moyen', min: 25 },
  { key: 'etat_degrade', min: 16 },
  { key: 'tres_mauvais_etat', min: 0 },
]

// ───────────────────── Réconciliations (partie 4) ─────────────────────

function isMaison(typePropriete: string | null): boolean {
  return /maison|villa/i.test(typePropriete || '')
}

/**
 * Étage/niveau : on choisit LA source selon le type de bien, jamais les deux.
 * Lite éclate l'accès selon le type : Appartement → `section_logement.appartement.*`,
 * Studio → `section_logement.studio.*`, Maison/Villa → `maison_niveau` /
 * `maison_nb_etages`. Loft (et autres) → aucun bloc d'accès collecté → null.
 * Source absente → null (jamais inventé).
 */
function reconcileEtageAcces(logement: Section, typePropriete: string | null) {
  const maison = isMaison(typePropriete)
  const accesObj: Section = typePropriete === 'Appartement'
    ? (logement.appartement || {})
    : typePropriete === 'Studio'
    ? (logement.studio || {})
    : {}
  return {
    etage_appartement: maison ? null : txt(accesObj, 'etage'),
    niveau_maison: maison ? txt(logement, 'maison_niveau') : null,
    nombre_etages_maison: maison ? txt(logement, 'maison_nb_etages') : null,
    acces: maison ? null : txt(accesObj, 'acces'),
  }
}

/**
 * Ascenseur réconcilié des deux sources, sans jamais en inventer un :
 * - acces 'Ascenseur' → true ; 'RDC'/'Escalier' → false (l'accès fait foi) ;
 * - acces absent (maison, Loft, ou non renseigné) → on retombe sur la case
 *   `section_equipements.ascenseur` (bool 3 états, null si rien).
 */
function reconcileAscenseur(equipements: Section, acces: string | null): boolean | null {
  if (acces === 'Ascenseur') return true
  if (acces === 'RDC' || acces === 'Escalier') return false
  return bool(equipements, 'ascenseur')
}

/**
 * Arrivée autonome déduite des 4 sources d'accès autonome (gap-analysis §3) :
 * boîte à clés / serrure connectée (`boiteType`), digicode, interphone,
 * tempo-gâche. On ne sort QUE le booléen (jamais le type de boîte, ni les codes,
 * ni l'emplacement).
 */
function deduceSelfCheckin(clefs: Section): boolean {
  return (
    !!txt(clefs, 'boiteType') ||
    isTrue(clefs, 'digicode') ||
    isTrue(clefs, 'interphone') ||
    isTrue(clefs, 'tempoGache')
  )
}

/** Doublon cinéma réconcilié en un seul signal. */
function reconcileSalleCinema(equipements: Section, ext: Section): boolean {
  return isTrue(equipements, 'cinema') || bool(ext, 'dispose_salle_cinema') === true
}

/**
 * PMR (zone modèle) : cas POSITIF uniquement, piloté par la case « accessible
 * mobilité réduite » des Équipements. accessible=true → exposé avec ses détails ;
 * false ou null → null (silence). La case ne déclenche AUCUN négatif (le « non
 * accessible PMR » vient de la grille Avis « inaccessible », zone code).
 *
 * Anti-contradiction : si l'immeuble est déclaré « inaccessible » (→ phrase canon
 * « non accessible PMR » en note_etat), on n'expose jamais le positif au modèle.
 */
function pmrPositif(avis: Section, equipements: Section): { accessible: true | null; details: string | null } {
  const immeubleInaccessible = txt(avis, 'immeuble_accessibilite') === 'inaccessible'
  const accessible = !immeubleInaccessible && bool(equipements, 'accessible_mobilite_reduite') === true
  return {
    accessible: accessible ? true : null,
    details: accessible ? txt(equipements, 'pmr_details') : null,
  }
}

/**
 * Verdict de la grille recalculé exactement comme `computeGrilleStats`
 * (avisGrilleHelpers.js) : le verdict n'existe QUE si les 9 critères sont notés.
 * Renvoie { verdict, total }. Verdict null tant que la grille est incomplète.
 */
function computeGrilleVerdict(avis: Section): { verdict: string | null; total: number; notes: Record<string, number | null> } {
  const notes: Record<string, number | null> = {}
  let total = 0
  let filled = 0
  for (const crit of GRILLE_CRITERIA) {
    const note = num(avis, `grille_${crit}_note`)
    notes[crit] = note
    if (note != null && note >= 1 && note <= 5) {
      total += note
      filled += 1
    }
  }
  const verdict = filled === GRILLE_CRITERIA.length
    ? (GRILLE_VERDICTS.find((v) => total >= v.min)?.key ?? null)
    : null
  return { verdict, total, notes }
}

// ───────────────────── Sous-mappers ─────────────────────

function mapChambres(f: FicheLiteRow): ChambreContrat[] {
  const visite = section(f, 'section_visite')
  const logement = section(f, 'section_logement')
  const chambres = section(f, 'section_chambres')
  const count = Math.min(6, Math.max(0, num(visite, 'nombre_chambres') ?? 0))
  // Studio : le formulaire (FicheChambre) force 1 "Espace nuit" (chambre_1) même
  // quand nombre_chambres = 0 → on lit chambre_1 pour ne pas perdre le couchage.
  const isStudio = txt(logement, 'typologie') === 'Studio'
  const n = isStudio && count === 0 ? 1 : count
  const out: ChambreContrat[] = []
  for (let i = 1; i <= n; i++) {
    const sub: Section = chambres[`chambre_${i}`] || {}
    const lits = BED_TYPES
      .map((b) => ({ type: b.label, nombre: num(sub, b.col) ?? 0 }))
      .filter((l) => l.nombre > 0)
    out.push({ nom: txt(sub, 'nom_description'), lits, autre_type_lit: txt(sub, 'autre_type_lit') })
  }
  return out
}

// Set positif "produits toilette + ménage" exposable (présence seule). Le café
// (`cafe_*`) est VOLONTAIREMENT absent : règle de prod (un consommable offert
// n'est jamais affiché, le prestataire pourrait l'oublier) ; la machine à café
// reste exposée comme équipement (cuisine.cafetiere).
const CONSOMMABLES: { col: string; label: string }[] = [
  { col: 'gel_douche', label: 'Gel douche' },
  { col: 'shampoing', label: 'Shampoing' },
  { col: 'apres_shampoing', label: 'Après-shampoing' },
  { col: 'pastilles_lave_vaisselle', label: 'Pastilles lave-vaisselle' },
]

/**
 * Consommables (zone modèle) : QUE du positif, et uniquement si le prestataire
 * fournit explicitement (`fournis_par_prestataire === true`). Section non répondue
 * OU "non fourni" → aucune liste, aucun signal. Pas de booléen `fournis` côté
 * modèle → le modèle ne reçoit jamais d'absence sur les consommables.
 */
function mapConsommables(f: FicheLiteRow): { produits: string[] } {
  const conso = section(f, 'section_consommables')
  if (!isTrue(conso, 'fournis_par_prestataire')) return { produits: [] }
  const produits = CONSOMMABLES.filter((c) => isTrue(conso, c.col)).map((c) => c.label)
  // "Autre consommable" : présence + libellé saisi (sinon l'item n'a aucun sens).
  if (isTrue(conso, 'autre_consommable')) {
    const detail = txt(conso, 'autre_consommable_details')
    produits.push(detail ? `Autre : ${detail}` : 'Autre consommable')
  }
  return { produits }
}

// Règles calculées : "non" par défaut, "oui" SEULEMENT si la fiche le dit
// explicitement (=== true). Le modèle reçoit le RÉSULTAT (zone modèle), il ne
// décide jamais ; le calcul reste déterministe ici. Source Lite : section_equipements.
const fetesAutorisees = (equipements: Section): boolean => isTrue(equipements, 'fetes_autorisees')
const fumeursAcceptes = (equipements: Section): boolean => isTrue(equipements, 'fumeurs_acceptes')

/**
 * Équipement bébé. La présence vient de la VRAIE source : la case cochée dans le
 * tableau `bebe.equipements`. Les sous-détails (type, dispo, prix) sont optionnels
 * → ne jamais déduire une présence de leur seul remplissage (ex. "Chaise haute"
 * cochée mais type vide = état valide).
 */
function mapBebe(f: FicheLiteRow): ModeleZone['cible_voyageurs']['bebe'] {
  const bebe = section(f, 'section_bebe')
  const equipements = arr(bebe, 'equipements')
  return {
    equipements,
    jouets_tranches_age: arr(bebe, 'jouets_tranches_age'),
    lit_bebe_type: txt(bebe, 'lit_bebe_type'),
    // Source = case cochée ; le type n'est qu'un détail optionnel (OR pour garder le signal).
    chaise_haute: equipements.includes('Chaise haute') || !!txt(bebe, 'chaise_haute_type'),
    stores_occultants: bool(bebe, 'lit_stores_occultants'),
  }
}

function mapSallesDeBains(f: FicheLiteRow): SalleDeBainContrat[] {
  const visite = section(f, 'section_visite')
  const sdb = section(f, 'section_salle_de_bains')
  const n = Math.min(6, Math.max(0, num(visite, 'nombre_salles_bains') ?? 0))
  const out: SalleDeBainContrat[] = []
  for (let i = 1; i <= n; i++) {
    const sub: Section = sdb[`salle_de_bain_${i}`] || {}
    // "Douche et baignoire combinées" = baignoire avec douche → le voyageur a les
    // DEUX. On l'ajoute aux deux pour qu'une SDB combinée ne ressorte jamais en
    // tout-false (sinon on perd le seul équipement de bain de cette pièce).
    const combine = isTrue(sub, 'equipements_douche_baignoire_combinees')
    out.push({
      nom: txt(sub, 'nom_description'),
      acces: txt(sub, 'acces'),
      seche_cheveux: isTrue(sub, 'equipements_seche_cheveux'),
      baignoire: isTrue(sub, 'equipements_baignoire') || combine,
      douche: isTrue(sub, 'equipements_douche') || combine,
    })
  }
  return out
}

function mapEquipements(f: FicheLiteRow): ModeleZone['equipements'] {
  const equipements = section(f, 'section_equipements')
  const ext = section(f, 'section_equip_spe_exterieur')
  const cuisine1 = section(f, 'section_cuisine_1')
  const cuisine2 = section(f, 'section_cuisine_2')
  const salon = section(f, 'section_salon_sam')
  const linge = section(f, 'section_gestion_linge')
  const clefs = section(f, 'section_clefs')
  const exterieurEquip = arr(ext, 'exterieur_equipements')
  // Lite stocke une sélection SIMPLE pour climatisation/chauffage → array 0/1.
  const climType = txt(equipements, 'climatisation_type')
  const chauffType = txt(equipements, 'chauffage_type')
  return {
    climatisation: bool(equipements, 'climatisation'),
    climatisation_types: climType ? [climType] : [],
    chauffage: bool(equipements, 'chauffage'),
    chauffage_types: chauffType ? [chauffType] : [],
    // Non collectés en Lite (cf. gap-analysis §4) → neutres, jamais une absence inventée.
    ventilateur: null,
    ventilateur_types: [],
    lave_linge: bool(equipements, 'lave_linge'),
    seche_linge: bool(equipements, 'seche_linge'),
    seche_serviettes: null,
    fer_repasser: bool(equipements, 'fer_repasser'),
    etendoir: bool(equipements, 'etendoir'),
    tv: {
      present: bool(equipements, 'tv'),
      type: txt(equipements, 'tv_type'),
      taille: txt(equipements, 'tv_taille'),
      services: arr(equipements, 'tv_services'),
      consoles: arr(equipements, 'tv_consoles'),
    },
    coffre_fort: bool(equipements, 'coffre_fort'),
    tourne_disque: bool(equipements, 'tourne_disque'),
    piano: { present: bool(equipements, 'piano'), type: txt(equipements, 'piano_type') },
    compacteur_dechets: bool(equipements, 'compacteur_dechets'),
    pmr: pmrPositif(section(f, 'section_avis'), equipements),
    wifi_present: txt(equipements, 'wifi_statut') === 'oui',
    parking: {
      type: txt(equipements, 'parking_type'),
      sur_place_types: arr(equipements, 'parking_sur_place_types'),
      payant_type: txt(equipements, 'parking_payant_type'),
    },
    cuisine: {
      four: isTrue(cuisine1, 'equipements_four'),
      plaque_cuisson: isTrue(cuisine1, 'equipements_plaque_cuisson'),
      cuisiniere: isTrue(cuisine1, 'equipements_cuisiniere'),
      micro_ondes: isTrue(cuisine1, 'equipements_micro_ondes'),
      lave_vaisselle: isTrue(cuisine1, 'equipements_lave_vaisselle'),
      refrigerateur: isTrue(cuisine1, 'equipements_refrigerateur'),
      congelateur: isTrue(cuisine1, 'equipements_congelateur'),
      cafetiere: isTrue(cuisine1, 'equipements_cafetiere'),
      cafetiere_types: scanTrueKeys(cuisine1, 'cafetiere_type_'),
      bouilloire: isTrue(cuisine1, 'equipements_bouilloire'),
      grille_pain: isTrue(cuisine1, 'equipements_grille_pain'),
      vaisselle_complete:
        (num(cuisine2, 'vaisselle_assiettes_plates') ?? 0) > 0 ||
        (num(cuisine2, 'couverts_verres_eau') ?? 0) > 0,
      verres_a_vin: (num(cuisine2, 'couverts_verres_vin') ?? 0) > 0,
      // Équipement cuisine « autre » saisi en libre : exposé seulement si la case
      // est cochée ET le libellé renseigné. Le modèle peut le mentionner (reformulé).
      autre: isTrue(cuisine1, 'equipements_autre') ? txt(cuisine1, 'equipements_autre_details') : null,
    },
    salles_de_bains: mapSallesDeBains(f),
    linge_fourni: bool(linge, 'dispose_de_linge'),
    consommables: mapConsommables(f),
    table_a_manger: {
      present: isTrue(salon, 'equipements_table_manger'),
      nombre_places: num(salon, 'nombre_places_table'),
    },
    canape_lit: isTrue(salon, 'equipements_canape_lit'),
    exterieur: {
      present: bool(ext, 'dispose_exterieur'),
      types_espace: arr(ext, 'exterieur_type_espace'),
      equipements: exterieurEquip,
      acces: txt(ext, 'exterieur_type_acces'),
      barbecue: {
        present: !!txt(ext, 'barbecue_type') || exterieurEquip.some((e) => /barbecue/i.test(e)),
        type: txt(ext, 'barbecue_type'),
      },
    },
    piscine: {
      // FAIT = section structurée (jamais l'atout coché seul).
      present: bool(ext, 'dispose_piscine'),
      type: txt(ext, 'piscine_type'),
      acces: txt(ext, 'piscine_acces'),
      dimensions: txt(ext, 'piscine_dimensions'),
      caracteristiques: arr(ext, 'piscine_caracteristiques'),
      disponibilite: txt(ext, 'piscine_disponibilite'),
      periode_disponibilite: txt(ext, 'piscine_periode_disponibilite'),
      periode_chauffage: txt(ext, 'piscine_periode_chauffage'),
    },
    jacuzzi: {
      present: bool(ext, 'dispose_jacuzzi'),
      acces: txt(ext, 'jacuzzi_acces'),
      taille: txt(ext, 'jacuzzi_taille'),
    },
    sauna: { present: bool(ext, 'dispose_sauna'), acces: txt(ext, 'sauna_acces') },
    hammam: { present: bool(ext, 'dispose_hammam'), acces: txt(ext, 'hammam_acces') },
    cuisine_exterieure: {
      present: bool(ext, 'dispose_cuisine_exterieure'),
      type: txt(ext, 'cuisine_ext_type'),
      superficie: txt(ext, 'cuisine_ext_superficie'),
      caracteristiques: arr(ext, 'cuisine_ext_caracteristiques'),
    },
    salle_sport: bool(ext, 'dispose_salle_sport'),
    salle_cinema: reconcileSalleCinema(equipements, ext),
    salle_jeux: {
      present: bool(ext, 'dispose_salle_jeux'),
      equipements: arr(ext, 'salle_jeux_equipements'),
    },
    // Pas de bloc « local à vélo » collecté en Lite (gap-analysis §6) → neutre.
    local_velo: { present: null, acces: null },
    self_checkin: deduceSelfCheckin(clefs),
  }
}

function mapModele(f: FicheLiteRow): ModeleZone {
  const logement = section(f, 'section_logement')
  const avis = section(f, 'section_avis')
  const ext = section(f, 'section_equip_spe_exterieur')
  const teletravail = section(f, 'section_teletravail')
  const equipements = section(f, 'section_equipements')
  const proprietaire = section(f, 'section_proprietaire')
  const securite = section(f, 'section_securite')
  const typePropriete = txt(logement, 'type_propriete')
  const eta = reconcileEtageAcces(logement, typePropriete)
  // L'adresse vit dans la fiche propriétaire ; on n'en prend QUE la ville (la rue
  // est réservée au géocodage côté code, jamais dans une annonce publique).
  const adresse: Section = (proprietaire.adresse && typeof proprietaire.adresse === 'object') ? proprietaire.adresse : {}
  const atoutsLogement = avis.atouts_logement
  return {
    identite: {
      type_propriete: typePropriete,
      type_precision: txt(logement, 'type_autre_precision'),
      typologie: txt(logement, 'typologie'),
      surface_m2: num(logement, 'surface'),
      nombre_chambres: num(section(f, 'section_visite'), 'nombre_chambres'),
      chambres: mapChambres(f),
      nombre_personnes_max: num(logement, 'nombre_personnes_max'),
      etage_appartement: eta.etage_appartement,
      niveau_maison: eta.niveau_maison,
      nombre_etages_maison: eta.nombre_etages_maison,
      acces: eta.acces,
      ascenseur: reconcileAscenseur(equipements, eta.acces),
    },
    localisation: {
      ville: txt(adresse, 'ville'),
      // POSITIFS uniquement : "quartier_defavorise" part en disclosure (zone code).
      quartier_types: arr(avis, 'quartier_types').filter((k) => k !== 'quartier_defavorise'),
      enrichissement: null,
    },
    equipements: mapEquipements(f),
    atouts: {
      // Clés cochées = signal d'emphase. JAMAIS un fait : aucun équipement n'est
      // déduit d'un atout (les faits viennent des sections structurées).
      atouts_logement: trueKeys(atoutsLogement),
      atouts_autre: txt(avis, 'atouts_logement_autre'),
      vue_types: arr(avis, 'vue_types'),
      exterieur_description: txt(ext, 'exterieur_description_generale'),
      renove: trueKeys(atoutsLogement).includes('renove'),
    },
    cible_voyageurs: {
      types_voyageurs: trueKeys(avis.types_voyageurs),
      types_voyageurs_autre: txt(avis, 'types_voyageurs_autre'),
      teletravail: {
        equipements: arr(teletravail, 'equipements'),
        debit: { speedtest: txt(teletravail, 'speedtest_resultat'), ethernet: bool(teletravail, 'ethernet_disponible') },
      },
      bebe: mapBebe(f),
    },
    regles_internes: {
      animaux_acceptes: boolish(equipements, 'animaux_acceptes'),
      animaux_commentaire: txt(equipements, 'animaux_commentaire'),
      // Résultats calculés (mêmes valeurs qu'en zone code) : le modèle les habille.
      fetes_autorisees: fetesAutorisees(equipements),
      fumeurs_acceptes: fumeursAcceptes(equipements),
      // Équipements sécurité HORS caméras (les caméras = zone code, déterministe).
      securite_rassurante: arr(securite, 'equipements').filter(
        (e) => e !== CAMERA_EXTERIEURE && e !== CAMERA_INTERIEURE_COMMUNS,
      ),
    },
  }
}

function mapCode(f: FicheLiteRow): CodeZone {
  const avis = section(f, 'section_avis')
  const logement = section(f, 'section_logement')
  const equipements = section(f, 'section_equipements')
  const reglementation = section(f, 'section_reglementation')
  const securite = section(f, 'section_securite')

  const grille = computeGrilleVerdict(avis)
  const securiteDangers = arr(avis, 'securite_dangers')
  const securiteEquip = arr(securite, 'equipements')

  return {
    nombre_voyageurs: num(logement, 'nombre_personnes_max'),
    reglementation: {
      numero_declaration: txt(reglementation, 'numero_declaration'),
      classe_dpe: txt(reglementation, 'classe_dpe'),
      dpe_depenses_min: num(reglementation, 'dpe_depenses_min'),
      dpe_depenses_max: num(reglementation, 'dpe_depenses_max'),
    },
    note_etat_triggers: {
      immeuble_etat_general: txt(avis, 'immeuble_etat_general'),
      immeuble_proprete: txt(avis, 'immeuble_proprete'),
      immeuble_accessibilite: txt(avis, 'immeuble_accessibilite'),
      immeuble_niveau_sonore: txt(avis, 'immeuble_niveau_sonore'),
      grille_verdict: grille.verdict,
      grille_score_total: grille.verdict ? grille.total : null,
      grille_notes: grille.notes,
      securite_dangers: securiteDangers,
      securite_danger_detecte: securiteDangers.length > 0,
    },
    note_quartier_triggers: {
      quartier_securite: txt(avis, 'quartier_securite'),
      quartier_perturbations: txt(avis, 'quartier_perturbations'),
      quartier_perturbations_details: txt(avis, 'quartier_perturbations_details'),
      quartier_defavorise: arr(avis, 'quartier_types').includes('quartier_defavorise'),
    },
    cameras: {
      exterieures: securiteEquip.includes(CAMERA_EXTERIEURE),
      interieures_communs: securiteEquip.includes(CAMERA_INTERIEURE_COMMUNS),
    },
    regles_calculees: {
      // Source déterministe ; le résultat est aussi exposé en zone modèle (regles_internes).
      fetes_autorisees: fetesAutorisees(equipements),
      fumeurs_acceptes: fumeursAcceptes(equipements),
    },
  }
}

/** Transforme une ligne brute `fiche_lite` en contrat d'entrée propre (pur). */
export function mapFicheToContrat(fiche: FicheLiteRow): Contrat {
  return {
    schema_version: CONTRAT_SCHEMA_VERSION,
    fiche_id: txt(fiche, 'id'),
    modele: mapModele(fiche),
    code: mapCode(fiche),
  }
}
