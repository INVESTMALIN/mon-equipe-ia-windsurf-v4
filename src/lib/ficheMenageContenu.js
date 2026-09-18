// src/lib/ficheMenageContenu.js
//
// Contenu de la FICHE MÉNAGE — le document remis au prestataire de ménage d'une
// conciergerie indépendante. Module PUR : il reçoit la fiche en mémoire (formData)
// et rend un modèle de contenu (parties → blocs), sans pdfmake, sans React, sans
// Supabase. PdfMenageBuilder le met en page ; les tests le lisent directement.
//
// ── Pourquoi une SÉLECTION explicite, et non le rendu générique de PdfBuilder ──
// La Fiche Logement rend TOUTES les clés de TOUTES les sections : c'est le dossier
// complet du concierge. La Fiche Ménage est l'inverse : un extrait, hiérarchisé selon
// l'usage du prestataire, dont chaque information a été décidée. Tout champ absent
// d'ici est ABSENT du document — ajouter un champ au formulaire ne le fait pas
// apparaître ici, c'est volontaire. C'est aussi ce qui porte la confidentialité :
// on n'a pas à filtrer ce qu'on n'a jamais sélectionné (cf. audit dans la PR).
//
// ── Ce qui ne sort JAMAIS (rappel des invariants) ──
//   - téléphone et email du propriétaire (section_proprietaire.telephone / .email) ;
//   - masterpin conciergerie, code propriétaire, code voyageur (section_clefs.*) —
//     seul le code MÉNAGE (ttlock / igloohome) ou le code Masterlock est un accès
//     destiné au prestataire ;
//   - accès Airbnb / Booking, réglementation, exigences commerciales, avis ;
//   - Wi-Fi (SSID, mot de passe), TV, services de streaming, consoles ;
//   - chauffage GÉNÉRAL du logement (chauffage_type / chauffage_instructions) — à ne
//     pas confondre avec le système d'eau chaude, lui utile ;
//   - les rappels photo / vidéo (`photos_rappels.*_taken`) : Lite ne stocke aucun
//     média, ces booléens n'aident que le concierge pendant sa saisie ;
//   - les verdicts d'inspection (grille Avis, quantité suffisante, casseroles
//     testées) : ils s'adressent au concierge et au propriétaire, pas au ménage.
//
// ── Vides et défauts ──
// Chaque champ est lu par un lecteur typé (texte, nombre, oui/non, liste) qui ignore
// les valeurs vides ET les défauts de FormContext (case non cochée = false, radio
// tri-state = null, compteur = 0). Une réponse « Non » n'est rendue que là où elle
// apporte quelque chose au prestataire (ex. « Draps fournis : Non »). Un bloc sans
// contenu disparaît ; une partie sans bloc disparaît.

import { resolveInstructionsMenageLegacy } from './instructionsMenageLegacy.js'
import { resolveAnimauxLegacy } from './animauxLegacy.js'
import { buildConsommablesRecapLite } from './consommablesRecapLite.js'
import { getCountryLabel } from './countries.js'

// ── Lecteurs typés ────────────────────────────────────────────────────────────
const texte = (v) => {
  if (v === null || v === undefined) return null
  const t = String(v).trim()
  return t ? t : null
}

// Compteur saisi : 0, '', '0', null → non renseigné.
const nombre = (v) => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

const ouiNon = (v) => (v === true ? 'Oui' : v === false ? 'Non' : null)

const liste = (v) => (Array.isArray(v) ? v.map(texte).filter(Boolean) : [])

const objet = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {})

// « n libellé » avec accord : les libellés d'inventaire portent leurs marques de pluriel
// entre parenthèses — « couette(s) », « couteau(x) », « lit(s) simple(s) » — que l'on
// résout selon la quantité. Aucun libellé n'a donc à être écrit deux fois.
const quantifier = (n, label) =>
  `${n} ${label.replace(/\((s|x)\)/g, (_, marque) => (n > 1 ? marque : ''))}`

// ── Blocs ─────────────────────────────────────────────────────────────────────
// Chaque constructeur renvoie null quand il n'a rien à rendre : l'appelant les
// empile puis filtre les null, ce qui fait disparaître les vides sans condition
// dispersée dans le code métier.
const champs = (lignes) => {
  const gardees = lignes
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => [k, String(v)])
  return gardees.length ? { type: 'champs', lignes: gardees } : null
}
const paragraphe = (label, t) => (texte(t) ? { type: 'paragraphe', label, texte: texte(t) } : null)
const puces = (label, items) => (items.length ? { type: 'liste', label, items } : null)
const checklist = (label, items) => (items.length ? { type: 'checklist', label, items } : null)
const encadre = (ton, label, t) => (texte(t) ? { type: 'encadre', ton, label, texte: texte(t) } : null)
const sousTitre = (t) => ({ type: 'sousTitre', texte: t })

// Deux tableaux de champs qui se suivent n'en font qu'un : un lecteur n'a pas à
// deviner pourquoi une ligne blanche coupe une liste de libellés.
const fusionnerChamps = (blocs) =>
  blocs.reduce((acc, b) => {
    const prec = acc[acc.length - 1]
    if (b.type === 'champs' && prec?.type === 'champs') {
      acc[acc.length - 1] = { type: 'champs', lignes: [...prec.lignes, ...b.lignes] }
    } else {
      acc.push(b)
    }
    return acc
  }, [])

const partie = (cle, titre, icone, blocs) => {
  const gardes = fusionnerChamps(blocs.filter(Boolean))
  // Un sous-titre seul (pièce sans aucune information) ne justifie pas la partie.
  const utiles = gardes.filter((b) => b.type !== 'sousTitre')
  return utiles.length ? { cle, titre, icone, blocs: gardes } : null
}

// Regroupe des blocs sous un sous-titre, en ne gardant le sous-titre que s'il
// introduit au moins un bloc réel.
const groupe = (titre, blocs) => {
  const gardes = blocs.filter(Boolean)
  return gardes.length ? [sousTitre(titre), ...gardes] : []
}

// ── Adresse et identité ───────────────────────────────────────────────────────
const formaterAdresse = (adresse) => {
  const a = objet(adresse)
  const parts = []
  if (texte(a.rue)) parts.push(texte(a.rue))
  if (texte(a.complement)) parts.push(texte(a.complement))
  const cp = texte(a.codePostal)
  const ville = texte(a.ville)
  if (cp && ville) parts.push(`${cp} ${ville}`)
  else if (cp) parts.push(cp)
  else if (ville) parts.push(ville)
  // Pays stocké en code à deux lettres (cf. countries) : libellé, pas « GB ».
  if (texte(a.pays)) parts.push(getCountryLabel(a.pays))
  return parts.length ? parts.join(', ') : null
}

const NIVEAU_MAISON = { plain_pied: 'De plain-pied', etage: 'À étage(s)' }

/**
 * Lignes du bloc d'identification, sous le bandeau. Le nom du propriétaire (sans
 * téléphone ni email) est conservé : c'est souvent ainsi que le prestataire nomme le
 * logement (boîte aux lettres, interphone). Les coordonnées, elles, ne le concernent
 * pas.
 */
function construireMeta(formData) {
  const prop = objet(formData.section_proprietaire)
  const log = objet(formData.section_logement)

  const proprietaire = [texte(prop.prenom), texte(prop.nom)].filter(Boolean).join(' ') || null

  const type = texte(log.type_propriete)
  const typeComplet = type === 'Autre' && texte(log.type_autre_precision)
    ? `${type} (${texte(log.type_autre_precision)})`
    : type
  const surface = nombre(log.surface) ? `${nombre(log.surface)} m²` : null
  const capacite = nombre(log.nombre_personnes_max) ? `${nombre(log.nombre_personnes_max)} pers. max` : null
  const lits = nombre(log.nombre_lits) ? quantifier(nombre(log.nombre_lits), 'lit(s)') : null
  const logement = [typeComplet, texte(log.typologie), surface, capacite, lits].filter(Boolean).join(' · ') || null

  return [
    ['Bien', texte(formData.nom) || 'Fiche logement'],
    ['Propriétaire', proprietaire],
    ['Adresse', formaterAdresse(prop.adresse)],
    ['Logement', logement],
  ].filter(([, v]) => v)
}

// ── Partie 1 — Le logement ────────────────────────────────────────────────────
const PIECES = [
  ['pieces_chambre', 'Chambre'],
  ['pieces_salon', 'Salon'],
  ['pieces_salle_bains', 'Salle de bains'],
  ['pieces_salon_prive', 'Salon privé'],
  ['pieces_kitchenette', 'Kitchenette'],
  ['pieces_cuisine', 'Cuisine'],
  ['pieces_salle_manger', 'Salle à manger'],
  ['pieces_bureau', 'Bureau'],
  ['pieces_salle_jeux', 'Salle de jeux'],
  ['pieces_salle_sport', 'Salle de sport'],
  ['pieces_buanderie', 'Buanderie'],
  ['pieces_terrasse', 'Terrasse'],
  ['pieces_balcon', 'Balcon'],
  ['pieces_jardin', 'Jardin'],
]

function composition(visite) {
  const v = objet(visite)
  const items = []
  PIECES.forEach(([key, label]) => {
    if (v[key] !== true) return
    if (key === 'pieces_chambre' && nombre(v.nombre_chambres)) {
      items.push(quantifier(nombre(v.nombre_chambres), 'chambre(s)'))
    } else if (key === 'pieces_salle_bains' && nombre(v.nombre_salles_bains)) {
      items.push(quantifier(nombre(v.nombre_salles_bains), 'salle(s) de bains'))
    } else {
      items.push(label)
    }
  })
  if (v.pieces_autre === true) items.push(texte(v.pieces_autre_details) || 'Autre pièce')
  return items.length ? items.join(', ') : null
}

function partieLogement(formData) {
  const log = objet(formData.section_logement)
  const type = texte(log.type_propriete)
  // Le sous-formulaire suit le type déclaré (même règle que l'écran FicheLogement) :
  // les valeurs orphelines d'un autre type ne sont pas relues.
  const sous = type === 'Appartement' ? objet(log.appartement) : type === 'Studio' ? objet(log.studio) : {}
  const animaux = resolveAnimauxLegacy(formData.section_exigences, formData.section_equipements)

  const niveaux = type === 'Maison' || type === 'Villa'
    ? [NIVEAU_MAISON[log.maison_niveau] || null, nombre(log.maison_nb_etages) ? quantifier(nombre(log.maison_nb_etages), 'étage(s)') : null]
        .filter(Boolean).join(', ') || null
    : null

  return partie('logement', 'Le logement', 'logement', [
    champs([
      ['Composition', composition(formData.section_visite)],
      ['Résidence', texte(sous.nom_residence)],
      ['Bâtiment', texte(sous.batiment)],
      ['Étage', texte(sous.etage)],
      ['Porte', texte(sous.numero_porte)],
      ['Niveaux', niveaux],
      ['Animaux acceptés', animaux.acceptes === 'oui' ? 'Oui' : animaux.acceptes === 'non' ? 'Non' : null],
    ]),
    paragraphe('Accès au logement', sous.acces),
    animaux.acceptes ? paragraphe('Précisions sur les animaux', animaux.commentaire) : null,
  ])
}

// ── Partie 2 — Accès et clés ──────────────────────────────────────────────────
/**
 * Boîte à clés : seul le code destiné au MÉNAGE sort, et seulement pour le type de
 * boîte DÉCLARÉ. Les sous-objets des autres types peuvent garder des valeurs
 * orphelines (l'utilisateur a changé de type) : on ne les relit pas.
 */
function boiteAcles(clefs) {
  const type = texte(clefs.boiteType)
  if (!type) return { type: null, code: null }
  if (type === 'TTlock') return { type, code: texte(objet(clefs.ttlock).codeMenage) }
  if (type === 'Igloohome') return { type, code: texte(objet(clefs.igloohome).codeMenage) }
  if (type === 'Masterlock') return { type, code: texte(objet(clefs.masterlock).code) }
  // « Autres » : le type précisé, aucun code structuré à afficher.
  const precision = texte(clefs.boiteType_autre_precision)
  return { type: precision ? `${type} (${precision})` : type, code: null }
}

function partieAcces(formData) {
  const clefs = objet(formData.section_clefs)
  const physiques = objet(clefs.clefs)
  const guide = objet(formData.section_guide_acces)
  const boite = boiteAcles(clefs)

  return partie('acces', 'Accès et clés', 'acces', [
    champs([
      ['Boîte à clés', boite.type],
      ['Emplacement de la boîte', texte(clefs.emplacementBoite)],
      ['Code ménage', boite.code],
      ['Interphone', ouiNon(clefs.interphone)],
      ['Tempo-gâche', ouiNon(clefs.tempoGache)],
      ['Digicode', ouiNon(clefs.digicode)],
      ['Clés reçues par le prestataire', ouiNon(physiques.prestataire)],
    ]),
    clefs.interphone === true ? paragraphe("Instructions pour l'interphone", clefs.interphoneDetails) : null,
    clefs.tempoGache === true ? paragraphe('Instructions pour le tempo-gâche', clefs.tempoGacheDetails) : null,
    clefs.digicode === true ? paragraphe('Code et instructions du digicode', clefs.digicodeDetails) : null,
    paragraphe('Précisions sur les clés', physiques.precision),
    paragraphe('Remise des clés', physiques.details),
    // Repère et parcours : les indications neutres du guide d'accès. Les conseils
    // voyageurs et le guide généré restent hors document (rédigés pour le voyageur).
    paragraphe('Point de repère', guide.point_repere_principal),
    paragraphe("Parcours jusqu'à la porte", guide.description_acces),
    puces("Difficultés d'accès signalées", liste(guide.difficultes_acces)),
  ])
}

// ── Partie 3 — Votre intervention ─────────────────────────────────────────────
const QUI = (v) => (v === true ? 'Prestataire de ménage' : v === false ? 'Propriétaire' : null)

// Pièces où un élément abîmé a été signalé pendant l'inspection. Le prestataire doit
// le savoir avant d'y toucher — et ne pas se le voir reprocher.
function elementsAbimes(formData) {
  const items = []
  const chambres = objet(formData.section_chambres)
  for (let i = 1; i <= 6; i++) {
    const ch = objet(chambres[`chambre_${i}`])
    if (ch.elements_abimes === true) items.push(nomPiece('Chambre', i, ch.nom_description))
  }
  const sdbs = objet(formData.section_salle_de_bains)
  for (let i = 1; i <= 6; i++) {
    const s = objet(sdbs[`salle_de_bain_${i}`])
    if (s.elements_abimes === true) items.push(nomPiece('Salle de bains', i, s.nom_description))
  }
  if (objet(formData.section_cuisine_1).elements_abimes === true) items.push('Cuisine')
  const salon = objet(formData.section_salon_sam)
  if (salon.salon_elements_abimes === true) items.push('Salon')
  if (salon.salle_manger_elements_abimes === true) items.push('Salle à manger')
  const ext = objet(formData.section_equip_spe_exterieur)
  if (ext.garage_elements_abimes === true) items.push('Garage')
  if (ext.buanderie_elements_abimes === true) items.push('Buanderie')
  if (ext.autres_pieces_elements_abimes === true) items.push('Autres pièces')
  return items
}

function partieIntervention(formData) {
  // Repli des champs déplacés depuis Avis : MÊME règle que l'écran et que la Fiche
  // Logement (module partagé). `type_premiere_maintenance` est résolu aussi, mais
  // n'est pas rendu : la maintenance n'est pas le travail du prestataire de ménage.
  const { instructions } = resolveInstructionsMenageLegacy(
    formData.section_instructions_menage,
    formData.section_avis
  )

  return partie('intervention', 'Votre intervention', 'intervention', [
    champs([
      ['Type de 1er ménage', texte(instructions.type_premier_menage)],
    ]),
    encadre('alerte', 'Points de vigilance', instructions.points_vigilance),
    encadre('info', 'Consignes générales de ménage', instructions.consignes_generales),
    encadre('info', 'Produits et matériel', instructions.produits_materiel),
    ...groupe('Kit de bienvenue', [
      champs([
        ['Acheté par', QUI(instructions.kit_achat_par_prestataire)],
        ['Mis en place par', QUI(instructions.kit_installation_par_prestataire)],
      ]),
      paragraphe('Composition et disposition', instructions.kit_composition),
    ]),
    puces("Éléments abîmés déjà signalés lors de l'inspection", elementsAbimes(formData)),
  ])
}

// ── Partie 4 — Linge ──────────────────────────────────────────────────────────
const TAILLES_LINGE = [
  ['inventaire_90x200', 'Lits 90 × 200'],
  ['inventaire_140x200', 'Lits 140 × 200'],
  ['inventaire_160x200', 'Lits 160 × 200'],
  ['inventaire_180x200', 'Lits 180 × 200'],
  ['inventaire_autres', 'Autre linge'],
]
const LINGE_LABELS = {
  couettes: 'couette(s)',
  oreillers: 'oreiller(s)',
  draps_housses: 'drap(s)-housse',
  housses_couette: 'housse(s) de couette',
  protections_matelas: 'protection(s) matelas',
  taies_oreillers: "taie(s) d'oreiller",
  draps_bain: 'grande(s) serviette(s)',
  petites_serviettes: 'petite(s) serviette(s)',
  tapis_bain: 'tapis de bain',
  torchons: 'torchon(s)',
  plaids: 'plaid(s)',
  oreillers_decoratifs: 'oreiller(s) décoratif(s)',
}
const ETATS_LINGE = [
  ['etat_neuf', 'Neuf'],
  ['etat_usage', 'Usagé'],
  ['etat_propre', 'Propre'],
  ['etat_sale', 'Sale'],
  ['etat_tache', 'Taché (taches incrustées mais propre)'],
]

function inventaireLinge(linge) {
  return TAILLES_LINGE.map(([key, label]) => {
    const inv = objet(linge[key])
    const items = Object.entries(LINGE_LABELS)
      .map(([k, lib]) => (nombre(inv[k]) ? quantifier(nombre(inv[k]), lib) : null))
      .filter(Boolean)
    return items.length ? `${label} : ${items.join(', ')}` : null
  }).filter(Boolean)
}

function partieLinge(formData) {
  const linge = objet(formData.section_gestion_linge)
  const etats = ETATS_LINGE.filter(([k]) => linge[k] === true).map(([, l]) => l)

  return partie('linge', 'Linge', 'linge', [
    champs([
      ['Linge fourni dans le logement', ouiNon(linge.dispose_de_linge)],
      ['État du linge', etats.length ? etats.join(', ') : null],
    ]),
    puces('Inventaire', inventaireLinge(linge)),
    paragraphe("Précisions sur l'état", linge.etat_informations),
    paragraphe('Emplacement du stock', linge.emplacement_description),
    champs([['Code du cadenas / de la malle', texte(linge.emplacement_code_cadenas)]]),
  ])
}

// ── Partie 5 — Consommables ───────────────────────────────────────────────────
// Ce que le concierge a réellement coché, présenté comme une checklist de mission —
// pas une liste figée d'obligations. Même source que l'écran (consommablesRecapLite).
function partieConsommables(formData) {
  const recap = buildConsommablesRecapLite(formData.section_consommables)
  const cuisine = objet(formData.section_cuisine_1)

  return partie('consommables', 'Consommables', 'consommables', [
    champs([
      ['Fournis au quotidien par', recap.quotidien],
      ['Café pour la cafetière', texte(cuisine.cafetiere_cafe_fourni)],
      ['Marque de café', texte(cuisine.cafetiere_marque_cafe)],
    ]),
    checklist('À fournir par le prestataire de ménage', recap.recommandes),
    puces('Sur demande', recap.surDemande),
    puces('Café', recap.cafe),
  ])
}

// ── Partie 6 — Équipements utiles ─────────────────────────────────────────────
const PARKING_TYPE = { rue: 'Dans la rue', sur_place: 'Sur place (gratuit)', payant: 'Payant' }

function parking(eq) {
  const type = PARKING_TYPE[eq.parking_type]
  if (!type) return { type: null, details: null }
  if (eq.parking_type === 'rue') return { type, details: texte(eq.parking_rue_details) }
  if (eq.parking_type === 'sur_place') {
    const types = liste(eq.parking_sur_place_types)
    return { type: types.length ? `${type} — ${types.join(', ')}` : type, details: texte(eq.parking_sur_place_details) }
  }
  const sousType = texte(eq.parking_payant_type)
  return { type: sousType ? `${type} — ${sousType}` : type, details: texte(eq.parking_payant_details) }
}

function partieEquipements(formData) {
  const eq = objet(formData.section_equipements)
  const park = parking(eq)
  const divers = [
    eq.fer_repasser === true ? 'Fer à repasser' : null,
    eq.etendoir === true ? 'Étendoir' : null,
    eq.ascenseur === true ? 'Ascenseur' : null,
    eq.compacteur_dechets === true ? 'Compacteur à déchets' : null,
  ].filter(Boolean)

  return partie('equipements', 'Équipements utiles', 'equipements', [
    ...groupe('Poubelles', [
      champs([
        ['Emplacement du local', texte(eq.poubelle_emplacement)],
        ['Jours de ramassage', texte(eq.poubelle_ramassage)],
      ]),
    ]),
    ...groupe('Coupures', [
      champs([
        ['Disjoncteur', texte(eq.disjoncteur_emplacement)],
        ["Vanne d'arrêt d'eau", texte(eq.vanne_eau_emplacement)],
        // Système d'EAU CHAUDE (chaudière / ballon) : utile au prestataire. Le chauffage
        // du logement (chauffage_type / chauffage_instructions) ne sort pas.
        ['Eau chaude', [texte(eq.systeme_chauffage_eau), texte(eq.chauffage_eau_emplacement)].filter(Boolean).join(' — ') || null],
      ]),
    ]),
    ...groupe('Lave-linge', eq.lave_linge === true ? [
      champs([['Emplacement', texte(eq.lave_linge_emplacement) || 'Présent']]),
      paragraphe('Instructions', eq.lave_linge_instructions),
    ] : []),
    ...groupe('Sèche-linge', eq.seche_linge === true ? [
      champs([['Emplacement', texte(eq.seche_linge_emplacement) || 'Présent']]),
      paragraphe('Instructions', eq.seche_linge_instructions),
    ] : []),
    ...groupe('Matériel de ménage sur place', [
      champs([
        ['Aspirateur', texte(eq.menage_aspirateur_type)],
        ['Serpillère', texte(eq.menage_serpillere_type)],
      ]),
      paragraphe('Autres éléments de nettoyage', eq.menage_autres_description),
    ]),
    puces('Également disponible', divers),
    ...groupe('Parking', [
      champs([['Stationnement', park.type]]),
      paragraphe('Précisions', park.details),
    ]),
  ])
}

// ── Partie 7 — Pièce par pièce ────────────────────────────────────────────────
const nomPiece = (base, i, nom) => (texte(nom) ? `${base} ${i} — ${texte(nom)}` : `${base} ${i}`)

const LITS = [
  ['lit_simple_90_190', 'lit(s) simple(s) 90 × 190'],
  ['lit_double_140_190', 'lit(s) double(s) 140 × 190'],
  ['lit_queen_160_200', 'lit(s) queen size 160 × 200'],
  ['lit_king_180_200', 'lit(s) king size 180 × 200'],
  ['canape_lit_simple', 'canapé(s)-lit simple(s)'],
  ['canape_lit_double', 'canapé(s)-lit double(s)'],
  ['lits_superposes_90_190', 'lit(s) superposé(s) 90 × 190'],
  ['lit_gigogne', 'lit(s) gigogne'],
]
// Équipements de chambre : ce que le prestataire remet en place ou contrôle.
const EQUIP_CHAMBRE = [
  ['equipements_climatisation', 'Climatisation'],
  ['equipements_ventilateur_plafond', 'Ventilateur de plafond'],
  ['equipements_espace_rangement', 'Espace de rangement (placard, armoire)'],
  ['equipements_lit_bebe_60_120', 'Lit pour bébé (60 × 120)'],
  ['equipements_stores', 'Stores'],
  ['equipements_television', 'Télévision'],
  ['equipements_oreillers_couvertures_sup', 'Oreillers et couvertures supplémentaires'],
  ['equipements_chauffage', 'Chauffage'],
  ['equipements_cintres', 'Cintres'],
  ['equipements_moustiquaire', 'Moustiquaire'],
  ['equipements_lit_parapluie_60_120', 'Lit parapluie (60 × 120)'],
  ['equipements_systeme_audio', 'Système audio'],
  ['equipements_coffre_fort', 'Coffre-fort'],
]
const EQUIP_SDB = [
  ['equipements_douche', 'Douche'],
  ['equipements_baignoire', 'Baignoire'],
  ['equipements_douche_baignoire_combinees', 'Douche et baignoire combinées'],
  ['equipements_double_vasque', 'Double vasque'],
  ['equipements_wc', 'WC'],
  ['equipements_bidet', 'Bidet'],
  ['equipements_chauffage', 'Chauffage'],
  ['equipements_lave_linge', 'Lave-linge'],
  ['equipements_seche_serviette', 'Sèche-serviette'],
  ['equipements_seche_cheveux', 'Sèche-cheveux'],
]
const EQUIP_SALON = [
  ['equipements_table_manger', 'Table à manger'],
  ['equipements_chaises', 'Chaises'],
  ['equipements_canape', 'Canapé'],
  ['equipements_canape_lit', 'Canapé-lit'],
  ['equipements_fauteuils', 'Fauteuils'],
  ['equipements_table_basse', 'Table basse'],
  ['equipements_television', 'Télévision'],
  ['equipements_cheminee', 'Cheminée'],
  ['equipements_jeux_societe', 'Jeux de société'],
  ['equipements_livres_magazines', 'Livres et magazines'],
  ['equipements_livres_jouets_enfants', 'Livres et jouets pour enfants'],
  ['equipements_climatisation', 'Climatisation'],
  ['equipements_chauffage', 'Chauffage'],
]
const ELECTROMENAGER = [
  ['refrigerateur', 'Réfrigérateur'],
  ['congelateur', 'Congélateur'],
  ['mini_refrigerateur', 'Mini réfrigérateur'],
  ['cuisiniere', 'Cuisinière'],
  ['plaque_cuisson', 'Plaque de cuisson'],
  ['four', 'Four'],
  ['micro_ondes', 'Four à micro-ondes'],
  ['lave_vaisselle', 'Lave-vaisselle'],
  ['cafetiere', 'Cafetière'],
  ['bouilloire', 'Bouilloire électrique'],
  ['grille_pain', 'Grille-pain'],
  ['hotte', 'Hotte'],
  ['blender', 'Blender'],
  ['cuiseur_riz', 'Cuiseur à riz'],
  ['machine_pain', 'Machine à pain'],
  ['lave_linge', 'Lave-linge'],
]
const TYPES_CAFETIERE = [
  ['cafetiere_type_filtre', 'filtre'],
  ['cafetiere_type_expresso', 'expresso'],
  ['cafetiere_type_piston', 'piston'],
  ['cafetiere_type_keurig', 'Keurig'],
  ['cafetiere_type_nespresso', 'Nespresso'],
  ['cafetiere_type_manuelle', 'manuelle'],
  ['cafetiere_type_bar_grain', 'bar à grain'],
  ['cafetiere_type_bar_moulu', 'bar à café moulu'],
]
// Inventaire de la cuisine : ce que le prestataire contrôle après chaque séjour.
const INVENTAIRE_CUISINE = [
  ['Vaisselle', [
    ['vaisselle_assiettes_plates', 'assiette(s) plate(s)'],
    ['vaisselle_assiettes_dessert', 'assiette(s) à dessert'],
    ['vaisselle_assiettes_creuses', 'assiette(s) creuse(s)'],
    ['vaisselle_bols', 'bol(s)'],
  ]],
  ['Verres et couverts', [
    ['couverts_verres_eau', 'verre(s) à eau'],
    ['couverts_verres_vin', 'verre(s) à vin'],
    ['couverts_tasses', 'tasse(s)'],
    ['couverts_flutes_champagne', 'flûte(s) à champagne'],
    ['couverts_mugs', 'mug(s)'],
    ['couverts_couteaux_table', 'couteau(x) de table'],
    ['couverts_fourchettes', 'fourchette(s)'],
    ['couverts_couteaux_steak', 'couteau(x) à steak'],
    ['couverts_cuilleres_soupe', 'cuillère(s) à soupe'],
    ['couverts_cuilleres_cafe', 'cuillère(s) à café'],
    ['couverts_cuilleres_dessert', 'cuillère(s) à dessert'],
  ]],
  ['Ustensiles', [
    ['ustensiles_poeles_differentes_tailles', 'poêle(s)'],
    ['ustensiles_casseroles_differentes_tailles', 'casserole(s)'],
    ['ustensiles_faitouts', 'faitout(s)'],
    ['ustensiles_wok', 'wok'],
    ['ustensiles_cocotte_minute', 'cocotte-minute'],
    ['ustensiles_couvercle_anti_eclaboussures', 'couvercle(s) anti-éclaboussures'],
    ['ustensiles_robot_cuisine', 'robot de cuisine'],
    ['ustensiles_batteur_electrique', 'batteur électrique'],
    ['ustensiles_couteaux_cuisine', 'couteau(x) de cuisine'],
    ['ustensiles_spatules', 'spatule(s)'],
    ['ustensiles_ecumoire', 'écumoire'],
    ['ustensiles_ouvre_boite', 'ouvre-boîte'],
    ['ustensiles_rape', 'râpe'],
    ['ustensiles_tire_bouchon', 'tire-bouchon'],
    ['ustensiles_econome', 'économe'],
    ['ustensiles_passoire', 'passoire'],
    ['ustensiles_planche_decouper', 'planche(s) à découper'],
    ['ustensiles_rouleau_patisserie', 'rouleau à pâtisserie'],
    ['ustensiles_ciseaux_cuisine', 'ciseaux de cuisine'],
    ['ustensiles_balance_cuisine', 'balance de cuisine'],
    ['ustensiles_bac_glacon', 'bac(s) à glaçons'],
    ['ustensiles_pince_cuisine', 'pince(s) de cuisine'],
    ['ustensiles_couteau_huitre', 'couteau à huître'],
    ['ustensiles_verre_mesureur', 'verre mesureur'],
    ['ustensiles_presse_agrume_manuel', 'presse-agrume'],
    ['ustensiles_pichet', 'pichet(s)'],
    ['ustensiles_fouet', 'fouet'],
    ['ustensiles_louche', 'louche'],
    ['ustensiles_pic_fondue', 'pic(s) à fondue'],
  ]],
  ['Plats et accessoires', [
    ['plats_dessous_plat', 'dessous de plat'],
    ['plats_plateau', 'plateau(x)'],
    ['plats_saladiers', 'saladier(s)'],
    ['plats_a_four', 'plat(s) à four'],
    ['plats_carafes', 'carafe(s)'],
    ['plats_moules', 'moule(s)'],
    ['plats_theiere', 'théière'],
    ['plats_cafetiere_piston_filtre', 'cafetière (piston ou filtre)'],
    ['plats_ustensiles_barbecue', 'ustensiles de barbecue'],
    ['plats_gants_cuisine', 'gant(s) de cuisine'],
    ['plats_maniques', 'manique(s)'],
  ]],
]

const cochees = (descripteur, data) =>
  descripteur.filter(([k]) => data[k] === true).map(([, label]) => label)

function blocsChambre(ch, i) {
  const lits = LITS.map(([k, l]) => (nombre(ch[k]) ? quantifier(nombre(ch[k]), l) : null)).filter(Boolean)
  if (texte(ch.autre_type_lit)) lits.push(texte(ch.autre_type_lit))
  const equipements = cochees(EQUIP_CHAMBRE, ch)
  if (ch.equipements_autre === true && texte(ch.equipements_autre_details)) {
    equipements.push(texte(ch.equipements_autre_details))
  }
  return groupe(nomPiece('Chambre', i, ch.nom_description), [
    champs([
      ['Lits', lits.length ? lits.join(', ') : null],
      // Un « Non » compte ici : le prestataire doit savoir s'il apporte le linge.
      ['Draps fournis', ouiNon(ch.equipements_draps_fournis)],
    ]),
    puces('Équipements à contrôler', equipements),
  ])
}

function blocsSalleDeBains(s, i) {
  const equipements = cochees(EQUIP_SDB, s)
  if (s.equipements_autre === true && texte(s.equipements_autre_details)) {
    equipements.push(texte(s.equipements_autre_details))
  }
  return groupe(nomPiece('Salle de bains', i, s.nom_description), [
    champs([
      ['Accès', s.acces === 'privee' ? 'Privée' : s.acces === 'partagee' ? 'Partagée' : null],
      ['WC séparés', s.equipements_wc === true ? ouiNon(s.wc_separe) : null],
    ]),
    puces('Équipements à contrôler', equipements),
  ])
}

function blocsCuisineElectromenager(c) {
  const blocs = []
  ELECTROMENAGER.forEach(([key, label]) => {
    if (c[`equipements_${key}`] !== true) return
    const details = [texte(c[`${key}_type`]), nombre(c[`${key}_nombre_feux`]) ? `${nombre(c[`${key}_nombre_feux`])} feux` : null]
    if (key === 'cafetiere') {
      const types = TYPES_CAFETIERE.filter(([k]) => c[k] === true).map(([, l]) => l)
      if (types.length) details.push(types.join(', '))
    }
    const ligne = [label, ...details.filter(Boolean)].join(' — ')
    const instructions = texte(c[`${key}_instructions`])
    blocs.push(instructions ? `${ligne} : ${instructions}` : ligne)
  })
  if (c.equipements_autre === true && texte(c.equipements_autre_details)) blocs.push(texte(c.equipements_autre_details))
  return blocs
}

function inventaireCuisine(c) {
  return INVENTAIRE_CUISINE.map(([groupeLabel, items]) => {
    const presents = items.map(([k, l]) => (nombre(c[k]) ? quantifier(nombre(c[k]), l) : null)).filter(Boolean)
    return presents.length ? `${groupeLabel} : ${presents.join(', ')}` : null
  }).filter(Boolean)
}

function blocsSalon(salon) {
  const equipements = cochees(EQUIP_SALON, salon)
  if (salon.equipements_autre === true && texte(salon.equipements_autre_details)) {
    equipements.push(texte(salon.equipements_autre_details))
  }
  const canapeLit = salon.equipements_canape_lit === true
    ? [
        salon.canape_lit_simple === true ? 'simple' : null,
        salon.canape_lit_double === true ? 'double' : null,
        salon.canape_lit_autre_type === true ? (texte(salon.canape_lit_autre_type_details) || 'autre type') : null,
      ].filter(Boolean).join(', ').replace(/^./, (c) => c.toUpperCase()) || null
    : null

  return groupe('Salon / salle à manger', [
    paragraphe('Description', salon.description_generale),
    champs([
      ['Canapé-lit', canapeLit],
      ['Cheminée', salon.equipements_cheminee === true ? texte(salon.cheminee_type) : null],
      ['Places à table', nombre(salon.nombre_places_table)],
    ]),
    puces('Équipements à contrôler', equipements),
    paragraphe('Autres équipements', salon.autres_equipements_details),
  ])
}

function partiePieces(formData) {
  const chambres = objet(formData.section_chambres)
  const sdbs = objet(formData.section_salle_de_bains)
  const cuisine1 = objet(formData.section_cuisine_1)
  const cuisine2 = objet(formData.section_cuisine_2)

  const blocs = []
  for (let i = 1; i <= 6; i++) blocs.push(...blocsChambre(objet(chambres[`chambre_${i}`]), i))
  for (let i = 1; i <= 6; i++) blocs.push(...blocsSalleDeBains(objet(sdbs[`salle_de_bain_${i}`]), i))
  blocs.push(...groupe('Cuisine — électroménager', [
    puces('Appareils présents et instructions', blocsCuisineElectromenager(cuisine1)),
  ]))
  blocs.push(...groupe('Cuisine — vaisselle et ustensiles', [
    puces('Inventaire à contrôler', inventaireCuisine(cuisine2)),
    paragraphe('Autres ustensiles', cuisine2.autres_ustensiles),
  ]))
  blocs.push(...blocsSalon(objet(formData.section_salon_sam)))

  return partie('pieces', 'Pièce par pièce', 'pieces', blocs)
}

// ── Partie 8 — Extérieurs et espaces communs ──────────────────────────────────
// Entretien d'un espace : « Le prestataire doit-il gérer l'entretien … ? » — la
// réponse concerne directement le lecteur, dans les deux sens.
function entretien(data, prefixe, libelle) {
  // section_communs n'a pas de préfixe (entretien_prestataire) ; les espaces de
  // section_equip_spe_exterieur en ont un (piscine_entretien_prestataire…).
  const cle = (suffixe) => (prefixe ? `${prefixe}_entretien_${suffixe}` : `entretien_${suffixe}`)
  const v = data[cle('prestataire')]
  if (v === true) {
    return champs([
      [`Entretien ${libelle}`, 'À la charge du prestataire de ménage'],
      ['Fréquence', texte(data[cle('frequence')])],
      ['Prestation attendue', texte(data[cle('type_prestation')])],
    ])
  }
  if (v === false) {
    const qui = texte(data[cle('qui')])
    return champs([[`Entretien ${libelle}`, qui ? `Assuré par : ${qui}` : 'Non à la charge du prestataire de ménage']])
  }
  return null
}

function partieExterieur(formData) {
  const ext = objet(formData.section_equip_spe_exterieur)
  const communs = objet(formData.section_communs)

  const espaces = liste(ext.exterieur_type_espace).filter((e) => e !== 'Aucun')
  const equipements = liste(ext.exterieur_equipements).map((e) => {
    const nCl = nombre(ext.exterieur_nombre_chaises_longues)
    const nPa = nombre(ext.exterieur_nombre_parasols)
    if (e === 'Chaises longues' && nCl) return `${nCl} chaise${nCl > 1 ? 's' : ''} longue${nCl > 1 ? 's' : ''}`
    if (e === 'Parasol' && nPa) return `${nPa} parasol${nPa > 1 ? 's' : ''}`
    if (e === 'Autre') return texte(ext.exterieur_equipements_autre_details) || 'Autre'
    return e
  })

  const blocs = []
  if (ext.dispose_exterieur === true) {
    blocs.push(...groupe('Espace extérieur', [
      champs([
        ['Espaces', espaces.length ? espaces.join(', ') : null],
        ["Type d'accès", ext.exterieur_type_acces === 'Autre'
          ? (texte(ext.exterieur_type_acces_autre_details) || 'Autre')
          : texte(ext.exterieur_type_acces)],
      ]),
      paragraphe('Description', ext.exterieur_description_generale),
      paragraphe('Accès', ext.exterieur_acces),
      puces('Équipements à contrôler', equipements),
      entretien(ext, 'exterieur', "de l'espace extérieur"),
    ]))
    if (equipements.some((e) => /barbecue/i.test(e)) || texte(ext.barbecue_type) || texte(ext.barbecue_instructions)) {
      blocs.push(...groupe('Barbecue', [
        champs([
          ['Type', texte(ext.barbecue_type)],
          ['Combustible fourni', ouiNon(ext.barbecue_combustible_fourni)],
          ['Ustensiles fournis', ouiNon(ext.barbecue_ustensiles_fournis)],
        ]),
        paragraphe('Instructions', ext.barbecue_instructions),
      ]))
    }
  }
  if (ext.dispose_piscine === true) {
    blocs.push(...groupe('Piscine', [
      champs([['Accès', texte(ext.piscine_acces)]]),
      entretien(ext, 'piscine', 'de la piscine'),
    ]))
  }
  if (ext.dispose_jacuzzi === true) {
    blocs.push(...groupe('Jacuzzi', [
      champs([['Accès', texte(ext.jacuzzi_acces)]]),
      entretien(ext, 'jacuzzi', 'du jacuzzi'),
      paragraphe('Instructions', ext.jacuzzi_instructions),
    ]))
  }
  if (ext.dispose_cuisine_exterieure === true) {
    blocs.push(...groupe('Cuisine extérieure', [
      champs([['Équipements', liste(ext.cuisine_ext_caracteristiques).join(', ') || null]]),
      entretien(ext, 'cuisine_ext', 'de la cuisine extérieure'),
    ]))
  }
  if (ext.dispose_sauna === true) {
    blocs.push(...groupe('Sauna', [
      entretien(ext, 'sauna', 'du sauna'),
      paragraphe('Instructions', ext.sauna_instructions),
    ]))
  }
  if (ext.dispose_hammam === true) {
    blocs.push(...groupe('Hammam', [
      entretien(ext, 'hammam', 'du hammam'),
      paragraphe('Instructions', ext.hammam_instructions),
    ]))
  }
  if (ext.dispose_local_velo === true) {
    blocs.push(...groupe('Local vélo', [
      champs([['Accès', ext.local_velo_type_acces === 'avec_cle' ? 'Avec clé' : ext.local_velo_type_acces === 'libre' ? 'Libre' : null]]),
    ]))
  }
  if (communs.dispose_espaces_communs === true) {
    blocs.push(...groupe('Espaces communs', [
      paragraphe('Description', communs.description_generale),
      entretien(communs, '', 'des espaces communs'),
    ]))
  }

  return partie('exterieur', 'Extérieurs et espaces communs', 'exterieur', blocs)
}

// ── Partie 9 — Sécurité ───────────────────────────────────────────────────────
function partieSecurite(formData) {
  const sec = objet(formData.section_securite)
  const equipements = liste(sec.equipements).map((e) =>
    e === 'Autre (veuillez préciser)' ? (texte(sec.equipements_autre_details) || 'Autre') : e
  )
  return partie('securite', 'Sécurité', 'securite', [
    puces('Équipements de sécurité présents', equipements),
    paragraphe("Désarmement de l'alarme", sec.alarme_desarmement),
  ])
}

/**
 * Modèle de contenu de la Fiche Ménage.
 *
 * @param {Object} formData — la fiche en mémoire (FormContext), jamais relue en base.
 * @returns {{ nomBien: string, meta: Array<[string, string]>, parties: Array<Object> }}
 *   `parties` ne contient que les parties ayant au moins un bloc réel ; vide quand la
 *   fiche ne porte encore rien d'utile au ménage.
 */
export function construireContenuMenage(formData) {
  const data = objet(formData)
  // Ordre = ordre de lecture du prestataire : où j'interviens, comment j'entre, ce
  // qu'on attend de moi, puis ce dont je dispose et ce que je contrôle.
  const parties = [
    partieLogement(data),
    partieAcces(data),
    partieIntervention(data),
    partieLinge(data),
    partieConsommables(data),
    partieEquipements(data),
    partiePieces(data),
    partieExterieur(data),
    partieSecurite(data),
  ].filter(Boolean)

  return {
    nomBien: texte(data.nom) || 'Fiche logement',
    meta: construireMeta(data),
    parties,
  }
}

// Pour les tests : le texte intégral du modèle, pour vérifier qu'une valeur
// confidentielle n'y figure NULLE PART, quel que soit le bloc.
export function texteIntegral(contenu) {
  const morceaux = []
  const visiter = (v) => {
    if (v === null || v === undefined) return
    if (Array.isArray(v)) v.forEach(visiter)
    else if (typeof v === 'object') Object.values(v).forEach(visiter)
    else morceaux.push(String(v))
  }
  visiter(contenu)
  return morceaux.join('\n')
}

// Phrase d'introduction sous le bandeau. Sans instruction inventée : on décrit ce
// qu'est le document, rien de plus.
export const INTRO_MENAGE =
  "Document destiné au prestataire de ménage. Il reprend les informations de la fiche utiles à l'intervention ; " +
  'les points à vérifier suivent vos procédures habituelles.'
