// src/lib/PdfBuilder.js
//
// Rendu PDF client-side de Fiche Logement Lite (aucun backend, aucune photo).
// Refonte "pro" : bandeau header générique « Fiche Logement » (aucune référence
// Letahost), bloc meta encadré, séparateur gold, sections avec icône + titre
// coloré, tableaux 2 colonnes / puces / paragraphes, pied de page numéroté.
//
// Choix techniques (cf. PR) :
//  - Lib : pdfmake (déjà en place, rendu VECTORIEL, Roboto embarqué → accents FR
//    OK et 100% offline). Le rendu « Word » d'avant venait du code, pas de la lib.
//  - Icônes : SVG lucide générés via renderToStaticMarkup (net, vectoriel, offline,
//    aucune police emoji à embarquer). 1 icône par section.
//  - Palette : ardoise (#1f2937) + gold raffiné (#c8974b) + neutres gris.
//  - La logique de humanisation (labels sections/champs, formatage valeurs/enums/
//    checklists) est RÉUTILISÉE telle quelle (bas de fichier).

import { formatForPdf } from './PdfFormatter'
import { livrerPdf } from './pdfLivraison'
import { initialFormData, NOUVELLE_FICHE_PRESELECTIONS } from './formDefaults'
import { getCountryLabel } from './countries'
import { CHAMPS_ANNONCE, PLATEFORME_LABEL, valeurChamp } from './annonceChamps'
import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  User, Home, Star, Key, Building2, Globe, Scale, ClipboardCheck, Shirt, Plug,
  ShoppingBasket, Sparkles, DoorOpen, BedDouble, Bath, Refrigerator, Utensils, Sofa, Trees,
  Building, Laptop, Baby, MapPin, ShieldCheck, FileText, Wand2,
} from 'lucide-react'

// Initialiser les polices pour pdfmake (version robuste)
if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs
} else {
  pdfMake.vfs = pdfFonts
}

// ── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = {
  slate: '#1f2937',   // bandeau header, texte fort
  gold: '#c8974b',    // accent : titres de section, séparateur, icônes
  ink: '#111827',
  text: '#374151',    // valeurs
  label: '#6b7280',   // libellés
  border: '#e5e7eb',
  rowAlt: '#f9fafb',   // zébrage tableaux + fond meta
  white: '#ffffff',
  amber: '#b45309',    // éléments abîmés
  footer: '#9ca3af',
}

// Largeur utile A4 (595.28) - marges L/R (40 + 40)
const CONTENT_WIDTH = 515.28

// 1 icône lucide par section. Fallback FileText si non mappée.
const SECTION_ICON = {
  section_proprietaire: User,
  section_logement: Home,
  section_avis: Star,
  section_clefs: Key,
  section_airbnb: Building2,
  section_booking: Globe,
  section_reglementation: Scale,
  section_exigences: ClipboardCheck,
  section_gestion_linge: Shirt,
  section_equipements: Plug,
  section_consommables: ShoppingBasket,
  section_instructions_menage: Sparkles,
  section_visite: DoorOpen,
  section_chambres: BedDouble,
  section_salle_de_bains: Bath,
  section_cuisine_1: Refrigerator,
  section_cuisine_2: Utensils,
  section_salon_sam: Sofa,
  section_equip_spe_exterieur: Trees,
  section_communs: Building,
  section_teletravail: Laptop,
  section_bebe: Baby,
  section_guide_acces: MapPin,
  section_securite: ShieldCheck,
}

// SVG lucide → string, couleur bakée (currentColor ne résout pas dans le PDF).
const iconSvg = (Comp, color) =>
  renderToStaticMarkup(createElement(Comp || FileText, { color, size: 24, strokeWidth: 2 }))

// ── Styles & layouts pdfmake ─────────────────────────────────────────────────
const STYLES = {
  bannerTitle: { fontSize: 22, bold: true, color: PALETTE.white },
  sectionTitle: { fontSize: 13, bold: true, color: PALETTE.gold },
  metaKey: { fontSize: 9, bold: true, color: PALETTE.label },
  metaVal: { fontSize: 10, color: PALETTE.ink },
  cellLabel: { fontSize: 9.5, bold: true, color: PALETTE.label },
  cellValue: { fontSize: 9.5, color: PALETTE.text },
  blockLabel: { fontSize: 9.5, bold: true, color: PALETTE.label, margin: [0, 0, 0, 3] },
  bulletText: { fontSize: 9.5, color: PALETTE.text },
  paragraphText: { fontSize: 9.5, color: PALETTE.text, alignment: 'justify' },
  damagedLabel: { fontSize: 9.5, bold: true, color: PALETTE.amber, margin: [0, 0, 0, 3] },
  damagedText: { fontSize: 9.5, color: PALETTE.amber },
  footerText: { fontSize: 8, color: PALETTE.footer },
  empty: { fontSize: 11, italics: true, color: PALETTE.label, alignment: 'center' },
  // Récapitulatif final : même palette et mêmes tailles que la fiche. Le bandeau est
  // plus discret que celui de couverture — c'est une partie du document, pas sa une.
  recapBannerTitle: { fontSize: 16, bold: true, color: PALETTE.white },
  recapIntro: { fontSize: 9, italics: true, color: PALETTE.label },
  recapGuide: { fontSize: 9.5, color: PALETTE.text },
}

const BANNER_LAYOUT = {
  fillColor: () => PALETTE.slate,
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 18,
  paddingRight: () => 18,
  paddingTop: () => 16,
  paddingBottom: () => 16,
}

const TWO_COL_LAYOUT = {
  fillColor: (rowIndex) => (rowIndex % 2 === 1 ? PALETTE.rowAlt : null),
  hLineWidth: () => 0.5,
  vLineWidth: () => 0,
  hLineColor: () => PALETTE.border,
  paddingLeft: () => 8,
  paddingRight: () => 8,
  paddingTop: () => 5,
  paddingBottom: () => 5,
}

const META_LAYOUT = {
  fillColor: () => PALETTE.rowAlt,
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 12,
  paddingRight: () => 12,
  paddingTop: () => 6,
  paddingBottom: () => 6,
}

// ── Construction du document ─────────────────────────────────────────────────
const isEmptyValue = (v) =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)

// Distingue une valeur SAISIE d'une valeur laissée au défaut de FormContext.
// FormContext initialise chaque champ (checkbox → false, texte → '', nombre → 0,
// radio Oui/Non tri-state → null). Ces défauts ne doivent PAS être rendus : sinon
// une fiche vierge afficherait « Non » partout ET un faux taux de complétion.
// Règle : valeur ÉGALE à son défaut → non renseignée (ignorée) ; différente →
// saisie (rendue). Ça sépare une checkbox non cochée (défaut false, valeur false
// → ignorée) d'un radio répondu « Non » (défaut null, valeur false → conservé).
const isSameAsDefault = (a, b) => {
  if (a === b) return true
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b)
  }
  return false
}

// Champs stockés dans une section mais VOLONTAIREMENT absents du rendu générique des
// sections. buildSectionNodes rend TOUTES les clés d'une section : sans cette liste,
// toute nouvelle clé peuplée sort dans le document sans que personne l'ait décidé.
//
// Le guide d'accès généré est rendu — mais UNIQUEMENT dans le récapitulatif final
// (cf. buildRecapNodes), avec une mise en page choisie. C'est cette liste qui garantit
// qu'il n'apparaît pas AUSSI, brut, au milieu de la section « Guide d'accès ».
const CHAMPS_HORS_PDF = {
  section_guide_acces: ['guide_genere', 'guide_genere_at'],
}

const isDefaultValue = (sectionKey, field, value) => {
  const sectionDefaults = initialFormData?.[sectionKey]
  if (!sectionDefaults || !(field in sectionDefaults)) return false
  if (isSameAsDefault(value, sectionDefaults[field])) return true

  // Valeur laissee a sa PRE-SELECTION de creation (ex. pays = France) : affichee a
  // l'ecran, mais pas saisie. Sans ce test, une fiche vierge sortirait une section
  // « Proprietaire » contenant la seule France, et compterait comme renseignee.
  //
  // DEUX formes a reconnaitre, parce que buildSectionNodes est alimente par
  // formatForPdf, dont cleanFormData retire recursivement les chaines vides :
  //   - forme NETTOYEE (le cas reel) : { pays: 'FR' }
  //   - forme BRUTE (appel direct)   : { rue: '', ..., pays: 'FR' }
  // Ne comparer qu'a la forme brute laissait passer la fiche vierge (cf. review Codex).
  const preselection = NOUVELLE_FICHE_PRESELECTIONS?.[sectionKey]?.[field]
  if (preselection) {
    if (isSameAsDefault(value, preselection)) return true
    const defaut = sectionDefaults[field]
    if (defaut && typeof defaut === 'object' && !Array.isArray(defaut)) {
      // Fusion PAR-DESSUS le defaut : l'ordre des cles est conserve, ce dont depend
      // la comparaison par JSON.stringify.
      return isSameAsDefault(value, { ...defaut, ...preselection })
    }
  }

  return false
}

// Aplati un objet imbriqué (sous-formulaire type chambre_1, ou checklist) en puces
// lisibles, en gardant TOUS les champs saisis (pas seulement les booléens cochés) :
//   - booléen true / 'Oui'          → le libellé seul (style checklist)
//   - booléen false / 'Non' non-défaut → « Libellé : Non » (radio répondu « Non »)
//   - tableau                        → « Libellé : a, b, c »
//   - objet imbriqué                 → récursion, préfixée du libellé parent
//   - scalaire (string/number)       → « Libellé : valeur »
// Les valeurs vides ou égales au défaut FormContext (`defaults[k]`) sont ignorées.
// Sans ça, une chambre remplie uniquement de scalaires (nom, nb de lits) donnerait
// une liste vide → section Chambres omise et complétion sous-comptée (cf. round 4).
const flattenObjectToItems = (obj, defaults, isPhoto) => {
  const items = []
  for (const [k, v] of Object.entries(obj)) {
    if (isEmptyValue(v)) continue
    if (isSameAsDefault(v, defaults ? defaults[k] : undefined)) continue

    if (v === true || v === 'Oui' || v === 'oui') {
      items.push(isPhoto ? cleanPhotoKey(k) : formatEnumValue(humanizeKey(k)))
    } else if (v === false || v === 'Non' || v === 'non') {
      items.push(`${humanizeKey(k)} : Non`)
    } else if (Array.isArray(v)) {
      const joined = v.map((it) => (typeof it === 'string' ? formatEnumValue(it) : String(it))).join(', ')
      items.push(`${humanizeKey(k)} : ${joined}`)
    } else if (typeof v === 'object') {
      const sub = flattenObjectToItems(v, defaults ? defaults[k] : undefined, k.includes('photo'))
      sub.forEach((s) => items.push(`${humanizeKey(k)} — ${s}`))
    } else {
      items.push(`${humanizeKey(k)} : ${formatFieldValue(v, k)}`)
    }
  }
  return items
}

/**
 * Transforme les champs d'une section en nœuds pdfmake :
 *  - scalaires → un tableau 2 colonnes label/valeur
 *  - tableaux / checklists / inventaires → puces
 *  - texte long → paragraphe
 *  - *_elements_abimes actifs → bloc « Éléments abîmés signalés »
 * Renvoie [] si la section n'a finalement aucun contenu affichable (→ ignorée).
 */
function buildSectionNodes(sectionKey, donnees) {
  const scalarRows = []
  const bulletBlocks = []
  const paragraphBlocks = []
  const damaged = []

  for (const [field, value] of Object.entries(donnees)) {
    // Champ volontairement hors PDF (cf. CHAMPS_HORS_PDF) : filtré AVANT tout autre
    // test, pour qu'aucune valeur ne puisse le contourner.
    if (CHAMPS_HORS_PDF[sectionKey]?.includes(field)) continue
    if (isEmptyValue(value)) continue
    // Valeur laissée au défaut FormContext (checkbox false, nombre 0, etc.) → non
    // renseignée, on ne la rend pas (cf. isDefaultValue).
    if (isDefaultValue(sectionKey, field, value)) continue

    // Éléments abîmés : regroupés dans un bloc dédié en fin de section.
    if (field.includes('elements_abimes')) {
      if (value === true || value === 'Oui' || value === 'oui') {
        // Champ préfixé (ex. salon_elements_abimes) → on garde le lieu. Champ « nu »
        // (elements_abimes, ex. radio de Cuisine 1) → le strip donne '' : on retombe
        // sur le titre de la section pour NE PAS perdre l'info signalée.
        const stripped = field.replace(/_?elements_abimes/g, '').replace(/_/g, ' ').trim()
        damaged.push(stripped ? formatGenericKey(stripped) : humanizeSectionTitle(sectionKey))
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value)
          .filter(([, v]) => v === true || v === 'Oui' || v === 'oui')
          .forEach(([k]) => damaged.push(formatEnumValue(humanizeKey(k))))
      }
      continue
    }

    const label = humanizeKey(field)

    if (typeof value === 'boolean') {
      scalarRows.push([label, value ? 'Oui' : 'Non'])
    } else if (typeof value === 'number') {
      scalarRows.push([label, String(value)])
    } else if (typeof value === 'string') {
      // Texte long → paragraphe pleine largeur, sinon ligne de tableau.
      if (value.length > 120) paragraphBlocks.push({ label, text: value })
      else scalarRows.push([label, String(formatFieldValue(value, field))])
    } else if (Array.isArray(value)) {
      // formatEnumValue sur TOUS les items string (même sans underscore) pour une
      // casse homogène : « lumineux » et « proche_transports » → « Lumineux »,
      // « Proche transports ».
      const items = value.map((it) => (typeof it === 'string' ? formatEnumValue(it) : String(it)))
      bulletBlocks.push({ label, items })
    } else if (typeof value === 'object') {
      if (field.includes('adresse')) {
        scalarRows.push([label, formatAddress(value)])
      } else if (field.includes('inventaire')) {
        const items = Object.entries(value)
          .filter(([, v]) => v && v !== '0' && v !== 0)
          .map(([k, v]) => `${humanizeKey(k)} : ${v}`)
        if (items.length) bulletBlocks.push({ label, items })
      } else {
        // Objet générique : checklist plate (booléens) OU sous-formulaire imbriqué
        // (ex. chambre_1 avec des scalaires). On aplati en gardant TOUS les champs
        // saisis, pas seulement les booléens cochés (cf. flattenObjectToItems).
        const subDefaults = initialFormData?.[sectionKey]?.[field]
        const items = flattenObjectToItems(value, subDefaults, field.includes('photo'))
        if (items.length) bulletBlocks.push({ label, items })
      }
    }
  }

  const hasContent =
    scalarRows.length || bulletBlocks.length || paragraphBlocks.length || damaged.length
  if (!hasContent) return []

  const nodes = []

  // En-tête de section : icône + titre coloré. headlineLevel=1 → géré par
  // pageBreakBefore pour ne jamais laisser un titre orphelin en bas de page.
  nodes.push({
    headlineLevel: 1,
    columns: [
      { svg: iconSvg(SECTION_ICON[sectionKey], PALETTE.gold), width: 15 },
      { text: humanizeSectionTitle(sectionKey), style: 'sectionTitle', margin: [7, 1, 0, 0] },
    ],
    margin: [0, 14, 0, 6],
  })

  if (scalarRows.length) {
    nodes.push({
      table: {
        widths: ['35%', '65%'],
        // pdfmake 0.2 lit ce flag sur table.* (cf. tableProcessor) : au niveau du
        // nœud content il serait ignoré → une ligne ne serait pas protégée.
        dontBreakRows: true,
        body: scalarRows.map(([k, v]) => [
          { text: k, style: 'cellLabel' },
          { text: v, style: 'cellValue' },
        ]),
      },
      layout: TWO_COL_LAYOUT,
      margin: [0, 0, 0, 8],
    })
  }

  bulletBlocks.forEach(({ label, items }) => {
    nodes.push({
      stack: [
        { text: label, style: 'blockLabel' },
        { ul: items, style: 'bulletText' },
      ],
      margin: [0, 0, 0, 8],
    })
  })

  paragraphBlocks.forEach(({ label, text }) => {
    nodes.push({
      stack: [
        { text: label, style: 'blockLabel' },
        { text, style: 'paragraphText' },
      ],
      margin: [0, 0, 0, 8],
    })
  })

  if (damaged.length) {
    nodes.push({
      stack: [
        { text: 'Éléments abîmés signalés', style: 'damagedLabel' },
        { ul: damaged, style: 'damagedText' },
      ],
      margin: [0, 0, 0, 8],
    })
  }

  return nodes
}

// ══════════════════════════════════════════════════════════════════════════════
// Récapitulatif final — contenus produits par les agents.
//
// Partie DISTINCTE des sections d'inspection : elle démarre sur une nouvelle page,
// sous son propre bandeau. Ce n'est pas une 25e section de la fiche, c'est ce que le
// concierge a fait produire pour ce bien.
//
// Les deux sources ne sont pas rangées au même endroit :
//   - le guide d'accès vit DANS la fiche (section_guide_acces.guide_genere) ;
//   - les annonces vivent dans la table agent_outputs, une ligne par fiche ×
//     plateforme, donc chargées en amont et passées à buildDocDefinition (qui reste
//     pure et synchrone — cf. sa doc).
// ══════════════════════════════════════════════════════════════════════════════

/** En-tête de sous-partie du récap : même traitement que les titres de section. */
function enTeteRecap(icone, titre) {
  return {
    headlineLevel: 1,
    columns: [
      { svg: iconSvg(icone, PALETTE.gold), width: 15 },
      { text: titre, style: 'sectionTitle', margin: [7, 1, 0, 0] },
    ],
    margin: [0, 14, 0, 6],
  }
}

/** Champs d'une annonce → nœuds, dans l'ordre du descripteur partagé. */
function noeudsAnnonce(donnees, plateforme) {
  const nodes = []

  CHAMPS_ANNONCE[plateforme].forEach((champ) => {
    const valeur = valeurChamp(donnees, champ)
    if (valeur === null) return

    if (champ.type === 'liste_ordonnee') {
      nodes.push({
        stack: [
          { text: champ.libelle, style: 'blockLabel' },
          { ol: valeur, style: 'bulletText' },
        ],
        margin: [0, 0, 0, 8],
      })
    } else if (champ.type === 'nombre') {
      nodes.push({
        text: [
          { text: `${champ.libelle} : `, style: 'blockLabel' },
          { text: String(valeur), style: 'bulletText' },
        ],
        margin: [0, 0, 0, 8],
      })
    } else if (champ.type === 'mentions') {
      nodes.push({
        stack: [
          { text: champ.libelle, style: 'blockLabel' },
          { ul: valeur, style: 'bulletText' },
        ],
        margin: [0, 0, 0, 8],
      })
    } else {
      nodes.push({
        stack: [
          { text: champ.libelle, style: 'blockLabel' },
          { text: valeur, style: 'paragraphText' },
        ],
        margin: [0, 0, 0, 8],
      })
    }
  })

  return nodes
}

/**
 * Construit le récapitulatif. Renvoie [] si RIEN n'a été généré pour ce bien : pas
 * d'annonce, pas de guide → pas de partie récap, pas de page en plus.
 *
 * @param {Array<{plateforme: string, output_assemble: Object}>} annonces
 * @param {string} guide - texte du guide d'accès généré
 */
function buildRecapNodes(annonces, guide) {
  const blocs = []

  // Ordre fixe airbnb puis booking, quel que soit l'ordre de chargement : deux PDF
  // de la même fiche doivent se ressembler.
  const ordre = ['airbnb', 'booking']
  ordre.forEach((plateforme) => {
    const ligne = (annonces || []).find((a) => a?.plateforme === plateforme)
    const donnees = ligne?.output_assemble?.[plateforme]
    if (!donnees) return
    const nodes = noeudsAnnonce(donnees, plateforme)
    if (!nodes.length) return
    blocs.push(
      enTeteRecap(plateforme === 'booking' ? Globe : Building2, `Annonce ${PLATEFORME_LABEL[plateforme]}`),
      ...nodes
    )
  })

  const texteGuide = (guide == null ? '' : String(guide)).trim()
  if (texteGuide) {
    // « Guide d'accès voyageurs » et non « Guide d'accès » : ce dernier est DÉJÀ le
    // titre de la section d'inspection (cf. humanizeSectionTitle). Deux parties
    // homonymes dans le même document, ce serait au lecteur de deviner laquelle est
    // laquelle.
    blocs.push(enTeteRecap(MapPin, "Guide d'accès voyageurs"), {
      // Non justifié, contrairement aux paragraphes de la fiche : le guide est une
      // suite d'étapes courtes, que la justification étirerait ligne à ligne.
      text: texteGuide,
      style: 'recapGuide',
      margin: [0, 0, 0, 8],
    })
  }

  if (!blocs.length) return []

  return [
    // Bandeau de partie, sur une page neuve : c'est ce qui sépare visuellement le
    // récapitulatif des sections d'inspection.
    {
      pageBreak: 'before',
      table: {
        widths: ['*'],
        body: [[
          {
            columns: [
              { svg: iconSvg(Wand2, PALETTE.white), width: 20 },
              { text: 'Contenus générés', style: 'recapBannerTitle', margin: [10, 1, 0, 0] },
            ],
          },
        ]],
      },
      layout: BANNER_LAYOUT,
      margin: [0, 0, 0, 0],
    },
    {
      canvas: [{ type: 'rect', x: 0, y: 0, w: CONTENT_WIDTH, h: 3, color: PALETTE.gold }],
      margin: [0, 0, 0, 10],
    },
    {
      text: "Contenus produits par les agents pour ce bien, à partir de la fiche d'inspection.",
      style: 'recapIntro',
      margin: [0, 0, 0, 4],
    },
    ...blocs,
  ]
}

function metaBox(nomBien, dateStr, filledCount, totalSections) {
  const rows = [
    [{ text: 'Bien', style: 'metaKey' }, { text: nomBien, style: 'metaVal' }],
    [{ text: 'Généré le', style: 'metaKey' }, { text: dateStr, style: 'metaVal' }],
    [
      { text: 'Complétion', style: 'metaKey' },
      { text: `${filledCount}/${totalSections} sections renseignées`, style: 'metaVal' },
    ],
  ]
  return {
    table: { widths: ['auto', '*'], body: rows },
    layout: META_LAYOUT,
    margin: [0, 0, 0, 14],
  }
}

/**
 * Construit le docDefinition pdfmake (fonction PURE, sans effet de bord).
 * Isolée du téléchargement pour permettre une génération headless (tests).
 *
 * @param {Object} formData
 * @param {Object} [options]
 * @param {Array<{plateforme: string, output_assemble: Object}>} [options.annonces]
 *   Lignes agent_outputs de la fiche. Passées EN PARAMÈTRE et non lues ici : les
 *   annonces vivent en base, la lecture est asynchrone, et cette fonction doit rester
 *   pure et synchrone (c'est ce qui permet de vérifier le PDF headless). Omises → le
 *   récapitulatif ne portera que le guide d'accès, s'il existe.
 */
export const buildDocDefinition = (formData, options = {}) => {
  const pdfData = formatForPdf(formData)
  const nomBien =
    (formData?.nom || pdfData.sections?.section_logement?.donnees?.nom_logement || '')
      .toString()
      .trim() || 'Fiche logement'
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  // On construit d'abord les sections et on ne garde que celles qui produisent
  // RÉELLEMENT du contenu (après filtrage des défauts). Le taux de complétion
  // dérive de ce résultat — cohérent avec ce qui est rendu — et non du count brut
  // de metadata (qui compte toute section ayant des clés, donc 24/24 sur une fiche
  // vierge puisque FormContext initialise chaque section).
  const renderedSections = []
  Object.entries(pdfData.sections).forEach(([key, section]) => {
    if (section?.meta_section?.vide) return
    const nodes = buildSectionNodes(key, section.donnees || {})
    if (nodes.length) renderedSections.push(...nodes)
  })
  const filledCount = renderedSections.filter((n) => n.headlineLevel === 1).length
  const totalSections = pdfData.metadata?.total_sections || 24

  const content = []

  // Bandeau header
  content.push({
    table: {
      widths: ['*'],
      body: [[
        {
          columns: [
            { svg: iconSvg(Home, PALETTE.white), width: 22 },
            { text: 'Fiche Logement', style: 'bannerTitle', margin: [10, 2, 0, 0] },
          ],
        },
      ]],
    },
    layout: BANNER_LAYOUT,
    margin: [0, 0, 0, 0],
  })

  // Séparateur gold
  content.push({
    canvas: [{ type: 'rect', x: 0, y: 0, w: CONTENT_WIDTH, h: 3, color: PALETTE.gold }],
    margin: [0, 0, 0, 12],
  })

  // Bloc meta (complétion = nombre de sections réellement rendues)
  content.push(metaBox(nomBien, dateStr, filledCount, totalSections))

  // Sections (ou état vide si aucune donnée réelle)
  if (renderedSections.length) {
    content.push(...renderedSections)
  } else {
    content.push({ text: 'Aucune donnée saisie pour le moment.', style: 'empty', margin: [0, 24, 0, 0] })
  }

  // Récapitulatif final des contenus générés. Le guide d'accès n'est rendu QU'ICI :
  // il est exclu du rendu générique des sections (cf. CHAMPS_HORS_PDF), sans quoi il
  // sortirait deux fois — une fois dans « Guide d'accès », une fois ici.
  content.push(...buildRecapNodes(options.annonces, formData?.section_guide_acces?.guide_genere))

  return {
    pageSize: 'A4',
    pageMargins: [40, 36, 40, 48],
    content,
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: 'Fiche Logement', style: 'footerText', margin: [40, 0, 0, 0] },
        { text: `Page ${currentPage} / ${pageCount}`, style: 'footerText', alignment: 'right', margin: [0, 0, 40, 0] },
      ],
    }),
    // Empêche un titre de section (headlineLevel=1) de rester seul en bas de page :
    // s'il n'est suivi d'aucun nœud sur la page (son contenu a débordé), on casse avant.
    pageBreakBefore: (currentNode, followingNodesOnPage) =>
      currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0,
    styles: STYLES,
    defaultStyle: { font: 'Roboto', fontSize: 10, color: PALETTE.text, lineHeight: 1.15 },
  }
}

// Nom de fichier lisible : fiche-logement-{nom-du-bien}-{AAAA-MM-JJ}.pdf
const slugify = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'sans-nom'

export const buildPdfFilename = (formData) => {
  const nomBien = formData?.nom || formData?.section_logement?.nom_logement || 'fiche'
  return `fiche-logement-${slugify(nomBien)}-${new Date().toISOString().slice(0, 10)}.pdf`
}

/**
 * Génère le PDF et déclenche le téléchargement.
 * `options` est transmis tel quel à buildDocDefinition (cf. options.annonces).
 */
/**
 * Génère le PDF et le remet au navigateur.
 *
 * ⚠️ Retourne une PROMESSE, à attendre. `download()` de pdfmake n'est PAS
 * synchrone : il appelle `getBlob()` puis rend la main immédiatement, et ce n'est
 * que dans le callback, après `saveAs`, que le fichier est réellement produit.
 * Considérer le retour de cette fonction comme une réussite écrirait donc une
 * preuve de génération — et, pour un fiche_lite, poserait le verrou d'identité —
 * alors que le rendu peut encore échouer derrière.
 *
 * La promesse est résolue depuis le callback de pdfmake, donc APRÈS la remise du
 * fichier au navigateur. C'est le signal le plus fort disponible côté client :
 * savoir si l'utilisateur a effectivement enregistré le fichier sur son disque
 * n'est pas observable depuis une page web.
 */
export const generatePdfClientSide = (formData, { onDelivered, ...options } = {}) => {
  const docDefinition = buildDocDefinition(formData, options)
  // `download()` de pdfmake n'est PAS synchrone : il lance `getBlob()` et rend la
  // main, le `saveAs` n'ayant lieu que dans son callback. C'est donc ce callback,
  // et lui seul, qui atteste la remise du fichier — d'où l'enveloppe `livrerPdf`,
  // qui en fait une promesse et gère le délai de garde et la remise tardive.
  return livrerPdf({
    demarrerRendu: (fini) => pdfMake.createPdf(docDefinition).download(buildPdfFilename(formData), fini),
    onDelivered,
  })
}

// ══════════════════════════════════════════════════════════════════════════════
// Helpers de humanisation — RÉUTILISÉS de la version précédente (inchangés).
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Formate une adresse de manière lisible
 */
const formatAddress = (adresse) => {
  if (!adresse) return 'Non renseignée'
  if (typeof adresse === 'string') return adresse

  const parts = []
  if (adresse.rue) parts.push(adresse.rue)
  if (adresse.complement) parts.push(adresse.complement)
  if (adresse.codePostal && adresse.ville) {
    parts.push(`${adresse.codePostal} ${adresse.ville}`)
  } else {
    if (adresse.codePostal) parts.push(adresse.codePostal)
    if (adresse.ville) parts.push(adresse.ville)
  }
  // Le pays est stocké en code à deux lettres : on rend le libellé, pas "GB".
  // Les fiches créées avant ce champ n'ont pas la clé : leur adresse est inchangée.
  if (adresse.pays) parts.push(getCountryLabel(adresse.pays))

  return parts.join(', ') || 'Adresse incomplète'
}

/**
 * Humanise les titres de sections (GESTION_LINGE -> Gestion du linge)
 */
const humanizeSectionTitle = (sectionKey) => {
  const mapping = {
    section_proprietaire: 'Propriétaire',
    section_logement: 'Logement',
    section_avis: 'Avis et évaluation',
    section_clefs: 'Gestion des clés',
    section_airbnb: 'Configuration Airbnb',
    section_booking: 'Configuration Booking',
    section_reglementation: 'Réglementation',
    section_exigences: 'Exigences',
    section_gestion_linge: 'Gestion du linge',
    section_equipements: 'Équipements',
    section_consommables: 'Consommables',
    section_instructions_menage: 'Instructions ménage',
    section_visite: 'Visite du logement',
    section_chambres: 'Chambres',
    section_salle_de_bains: 'Salle de bains',
    section_cuisine_1: 'Cuisine - Électroménager',
    section_cuisine_2: 'Cuisine - Ustensiles',
    section_salon_sam: 'Salon',
    section_equip_spe_exterieur: 'Équipements extérieurs',
    section_communs: 'Parties communes',
    section_teletravail: 'Télétravail',
    section_bebe: 'Équipements bébé',
    section_guide_acces: 'Guide d\'accès',
    section_securite: 'Sécurité',
  }

  return mapping[sectionKey] || formatGenericKey(sectionKey.replace('section_', ''))
}

const humanizeKey = (key) => {
  const mapping = {
    // Champs spéciaux avec logique contextuelle
    photos_rappels: 'Photos prises',
    atouts_logement: 'Atouts du logement',
    quartier_types: 'Types de quartier',
    types_voyageurs: 'Voyageurs ciblés',

    // Documents
    assurance_pno: 'Assurance PNO',
    acte_propriete: 'Acte de propriété',
    carte_identite: 'Carte d\'identité',

    // État et propreté
    immeuble_proprete: 'Propreté immeuble',
    logement_proprete: 'Propreté logement',
    immeuble_etat_general: 'État général immeuble',
    logement_etat_general: 'État général logement',
    logement_etat_details: 'Détails état logement',

    // Quartier et environnement
    quartier_securite: 'Sécurité quartier',
    quartier_perturbations: 'Perturbations quartier',
    immeuble_accessibilite: 'Accessibilité immeuble',
    immeuble_niveau_sonore: 'Niveau sonore immeuble',

    // Logement
    logement_ambiance: 'Ambiance logement',
    logement_vis_a_vis: 'Vis-à-vis logement',

    // Photos rappels individuelles
    vis_a_vis_taken: 'vis-à-vis',
    video_globale_taken: 'vidéo globale',
    clefs_taken: 'clefs',

    // Équipements courants
    wifi_statut: 'WiFi',
    parking_type: 'Type de parking',
    piscine: 'Piscine',
    jacuzzi: 'Jacuzzi',

    // Propriétaire
    nom_proprietaire: 'Nom du propriétaire',
    email: 'Email',
    telephone: 'Téléphone',

    // Logement de base
    nom_logement: 'Nom du logement',
    type_propriete: 'Type de propriété',
    nb_chambres: 'Nombre de chambres',
    nb_lits: 'Nombre de lits',
    superficie: 'Superficie',

    // Instructions ménage — libellés métier, pour que le PDF (document client) ne dise
    // pas « Kit achat par prestataire : Oui » là où la question est « qui achète ? ».
    type_premier_menage: 'Type de 1er ménage',
    type_premiere_maintenance: 'Type de 1re maintenance',
    consignes_generales: 'Consignes générales de ménage',
    produits_materiel: 'Produits et matériel',
    kit_achat_par_prestataire: 'Kit de bienvenue acheté par le prestataire de ménage',
    kit_installation_par_prestataire: 'Kit de bienvenue installé par le prestataire de ménage',
    kit_composition: 'Composition du kit de bienvenue',
    points_vigilance: 'Points de vigilance',

    // Autres champs courants
    types_voyageurs_autre: 'Autres voyageurs',
    explication_adaptation: 'Explication adaptation',
    autres_caracteristiques: 'Autres caractéristiques',
  }

  return mapping[key] || formatGenericKey(key)
}

// Accents des mots dérivés des clés du formulaire. Les clés sont écrites sans
// accent en base (snake_case ASCII) : sans cette table, le PDF — un document
// client — sort « frequence », « disponibilite », « periode ».
// Partagée par formatGenericKey (libellés) et formatEnumValue (valeurs), qui
// visaient déjà le même rendu mais dupliquaient chacune sa liste.
// Remplacements par mot entier (\b…\b) → pas de faux positif dans un autre mot.
// Volontairement absents : « sale » (souillé, correct sans accent) et « tache »
// (une tache de linge, pas une tâche).
const ACCENTS = {
  abimes: 'abîmés',
  acceptes: 'acceptés',
  apres: 'après',
  arret: 'arrêt',
  batiment: 'bâtiment',
  bloquees: 'bloquées',
  cafe: 'café',
  cafetiere: 'cafetière',
  canape: 'canapé',
  caracteristiques: 'caractéristiques',
  cheminee: 'cheminée',
  cinema: 'cinéma',
  combinees: 'combinées',
  cuilleres: 'cuillères',
  cuisiniere: 'cuisinière',
  dechets: 'déchets',
  declaration: 'déclaration',
  decoratifs: 'décoratifs',
  decoration: 'décoration',
  decouper: 'découper',
  depenses: 'dépenses',
  desarmement: 'désarmement',
  details: 'détails',
  differentes: 'différentes',
  difficultes: 'difficultés',
  disponibilite: 'disponibilité',
  eclaboussures: 'éclaboussures',
  econome: 'économe',
  ecumoire: 'écumoire',
  electrique: 'électrique',
  elegant: 'élégant',
  elements: 'éléments',
  eponge: 'éponge',
  etages: 'étages',
  experience: 'expérience',
  exterieure: 'extérieure',
  flutes: 'flûtes',
  frequence: 'fréquence',
  gache: 'gâche',
  generales: 'générales',
  glacon: 'glaçon',
  huitre: 'huître',
  independants: 'indépendants',
  materiel: 'matériel',
  menage: 'ménage',
  mobilite: 'mobilité',
  numeriques: 'numériques',
  patisserie: 'pâtisserie',
  periode: 'période',
  personnalisee: 'personnalisée',
  pieces: 'pièces',
  precision: 'précision',
  precisions: 'précisions',
  premiere: 'première',
  prive: 'privé',
  proprietaire: 'propriétaire',
  quantite: 'quantité',
  rape: 'râpe',
  recommandes: 'recommandés',
  reduite: 'réduite',
  regles: 'règles',
  renove: 'rénové',
  repere: 'repère',
  reseau: 'réseau',
  residence: 'résidence',
  resultat: 'résultat',
  separe: 'séparé',
  serpillere: 'serpillère',
  societe: 'société',
  superposes: 'superposés',
  systeme: 'système',
  theiere: 'théière',
  velo: 'vélo',
  video: 'vidéo',
  videos: 'vidéos',
}

/**
 * Formate une clé générique en transformant snake_case en libellé lisible
 */
const formatGenericKey = (key) => {
  if (!key) return ''

  let cleaned = key
    .replace(/_/g, ' ') // snake_case -> espaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // casse collée -> séparée
    .toLowerCase()
    .trim()

  // corrections ciblées (accents, termes connus). Remplacements par mot entier
  // (\b…\b, ASCII) → pas de faux positif à l'intérieur d'un autre mot.
  // ACCENTS d'abord : les entrées ci-dessous (expressions, casse des marques)
  // restent prioritaires.
  const replacements = {
    ...ACCENTS,
    'a four': 'à four',
    poeles: 'poêles',
    testees: 'testées',
    'elements abimes': 'éléments abîmés',
    linge: 'linge',
    'salle manger': 'salle à manger',
    'vis a vis': 'vis-à-vis',
    wifi: 'WiFi',
    pno: 'PNO',
    airbnb: 'Airbnb',
    booking: 'Booking',
    // Accents des labels dérivés des clés (rendu client-facing plus propre)
    prenom: 'prénom',
    cles: 'clés',
    cle: 'clé',
    boite: 'boîte',
    fetes: 'fêtes',
    autorises: 'autorisés',
    autorisee: 'autorisée',
    autorisees: 'autorisées',
    refrigerateur: 'réfrigérateur',
    congelateur: 'congélateur',
    'micro ondes': 'micro-ondes',
    seche: 'sèche',
    detecteur: 'détecteur',
    fumee: 'fumée',
    etage: 'étage',
    debit: 'débit',
    adapte: 'adapté',
    teletravail: 'télétravail',
    acces: 'accès',
    numero: 'numéro',
    securite: 'sécurité',
    equipement: 'équipement',
    equipements: 'équipements',
    electromenager: 'électroménager',
    exterieur: 'extérieur',
    interieur: 'intérieur',
    proprete: 'propreté',
    etat: 'état',
    general: 'général',
    generale: 'générale',
    reglementation: 'réglementation',
    television: 'télévision',
    bebe: 'bébé',
  }

  Object.entries(replacements).forEach(([wrong, right]) => {
    cleaned = cleaned.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right)
  })

  // Mettre juste la première lettre en majuscule (phrase case)
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/**
 * Nettoie les clés _taken pour les photos (photos_equipements_bebe_taken -> équipements bébé)
 */
const cleanPhotoKey = (key) => {
  if (!key.endsWith('_taken')) return formatEnumValue(humanizeKey(key))

  // Supprimer photos_ et _taken
  let cleaned = key.replace(/^photos?_/, '').replace(/_taken$/, '')

  // Mapping spécifique pour les photos
  const photoMapping = {
    equipements_bebe: 'équipements bébé',
    salon_sam: 'salon/salle à manger',
    salle_manger_elements_abimes: 'éléments abîmés salle à manger',
    vis_a_vis: 'vis-à-vis',
    video_globale: 'vidéo globale',
    clefs: 'clés',
    linge: 'linge',
    emplacement: 'emplacement',
    // Instructions ménage
    etat_logement_video: "vidéo de l'état du logement",
    consignes_videos: 'vidéos des consignes de ménage',
    kit_photos: 'photos du kit de bienvenue',
  }

  return photoMapping[cleaned] || formatGenericKey(cleaned)
}

/**
 * Formate les valeurs enum (quartier_central -> Quartier central)
 */
const formatEnumValue = (value) => {
  if (typeof value !== 'string') return value

  let cleaned = value.replace(/_/g, ' ').toLowerCase().trim()

  // corrections pour accents et termes fréquents (valeurs enum). Mêmes corrections
  // d'accents que les labels (ACCENTS), pour un rendu homogène côté valeurs.
  const replacements = {
    ...ACCENTS,
    defavorise: 'défavorisé',
    tres: 'très',
    epure: 'épuré',
    degagee: 'dégagée',
    'bon etat': 'bon état',
    'excellent etat': 'excellent état',
    'mauvais etat': 'mauvais état',
    'zone risques': 'zone à risques',
    // accents des valeurs sélectionnables (checklists, atouts, équipements…)
    detecteur: 'détecteur',
    fumee: 'fumée',
    canape: 'canapé',
    cles: 'clés',
    cle: 'clé',
    fenetre: 'fenêtre',
    fenetres: 'fenêtres',
    televiseur: 'téléviseur',
    television: 'télévision',
    refrigerateur: 'réfrigérateur',
    congelateur: 'congélateur',
    equipement: 'équipement',
    equipements: 'équipements',
    securite: 'sécurité',
    exterieur: 'extérieur',
    interieur: 'intérieur',
    proprete: 'propreté',
    etat: 'état',
    etage: 'étage',
    acces: 'accès',
    numero: 'numéro',
    bebe: 'bébé',
  }

  Object.entries(replacements).forEach(([wrong, right]) => {
    cleaned = cleaned.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right)
  })

  // Première lettre majuscule
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/**
 * Formate les valeurs pour affichage humain (version améliorée)
 */
const formatFieldValue = (value, fieldKey = '') => {
  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non'
  }

  if (typeof value === 'string') {
    // Nettoyage des valeurs forcées
    const cleaned = value.trim()
    if (cleaned.toUpperCase() === 'OUI' || cleaned === 'Oui') return 'Oui'
    // « Non communiqué » (classe DPE) est une valeur d'énumération explicite, pas un
    // booléen : on ne la réduit pas à « Non », sinon la distinction est perdue au PDF.
    if (cleaned.toUpperCase().startsWith('NON') && cleaned.toUpperCase() !== 'NON COMMUNIQUÉ') return 'Non'

    // Formatage des enums
    if (cleaned.includes('_') && !cleaned.includes(' ')) {
      return formatEnumValue(cleaned)
    }

    return value
  }

  if (Array.isArray(value)) {
    // Formatage des arrays avec enums
    return value
      .map((item) => (typeof item === 'string' && item.includes('_') ? formatEnumValue(item) : item))
      .join(', ')
  }

  if (typeof value === 'object' && value !== null) {
    // Cas spécial pour inventaires (liste d'articles)
    if (fieldKey.includes('inventaire_')) {
      return formatInventory(value)
    }

    // Cas spécial pour photos_rappels : format plus lisible
    if (fieldKey === 'photos_rappels') {
      const actives = Object.entries(value)
        .filter(([k, v]) => v === true || v === 'Oui' || v === 'oui')
        .map(([k]) => cleanPhotoKey(k))

      return actives.length > 0 ? actives.join(', ') : 'Aucune'
    }

    // Cas des checklists classiques (documents, équipements, etc.)
    const actives = Object.entries(value)
      .filter(([k, v]) => v === true || v === 'Oui' || v === 'oui')
      .map(([k]) => formatEnumValue(humanizeKey(k)))

    return actives.length > 0 ? actives.join(', ') : 'Aucun'
  }

  return value
}

/**
 * Formate les inventaires sous forme de liste lisible
 */
const formatInventory = (inventory) => {
  if (!inventory || typeof inventory !== 'object') return 'Aucun'

  const items = Object.entries(inventory)
    .filter(([key, value]) => value && value !== '0' && value !== 0)
    .map(([key, value]) => `${humanizeKey(key)} : ${value}`)

  return items.length > 0 ? '\n• ' + items.join('\n• ') : 'Aucun'
}
