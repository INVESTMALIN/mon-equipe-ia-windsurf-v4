// src/lib/PdfMenageBuilder.js
//
// Mise en page de la FICHE MÉNAGE (pdfmake, client-side, aucun backend, aucune photo).
//
// Le CONTENU vient de lib/ficheMenageContenu (module pur, testé) : ce fichier ne
// décide pas de ce qui sort, seulement de la forme. Le SYSTÈME VISUEL vient de
// lib/pdfTheme, partagé avec la Fiche Logement : même bandeau, même bloc meta, mêmes
// titres, mêmes tableaux, même pied de page. Les deux documents sont deux pièces du
// même dossier, pas deux produits.
//
// Ce que ce document ajoute au vocabulaire commun, parce que son usage le demande :
//   - des ENCADRÉS à filet latéral pour les consignes et les points de vigilance,
//     les deux informations que le prestataire doit voir avant tout le reste ;
//   - des CASES À COCHER dessinées (canvas) pour la liste des consommables à fournir,
//     qui est une checklist de mission, pas une énumération ;
//   - des SOUS-TITRES de pièce (Chambre 1, Cuisine…), protégés contre l'orphelinage
//     comme les titres de section.
//
// Aucune écriture en base : ce builder ne connaît ni le verrou, ni la preuve du PDF
// complet. La Fiche Ménage est remise au navigateur, et c'est tout.

import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import {
  Home, Key, Sparkles, Shirt, ShoppingBasket, Plug, DoorOpen, Trees, ShieldCheck,
} from 'lucide-react'
import { construireContenuMenage, INTRO_MENAGE } from './ficheMenageContenu.js'
import { livrerPdf } from './pdfLivraison.js'
import {
  PALETTE, PAGE_MARGINS, STYLES, DEFAULT_STYLE, TWO_COL_LAYOUT, META_LAYOUT,
  bandeauCouverture, separateurGold, titreSection, piedDePage, pageBreakBeforeRule,
} from './pdfTheme.js'

// Initialiser les polices pour pdfmake (même pattern robuste que PdfBuilder)
if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs
} else {
  pdfMake.vfs = pdfFonts
}

// Icônes des parties, par clé du modèle de contenu. Le modèle ne connaît pas lucide :
// c'est ici, et seulement ici, que la clé devient une icône.
const ICONES = {
  logement: Home,
  acces: Key,
  intervention: Sparkles,
  linge: Shirt,
  consommables: ShoppingBasket,
  equipements: Plug,
  pieces: DoorOpen,
  exterieur: Trees,
  securite: ShieldCheck,
}

// Styles PROPRES à ce document, ajoutés à ceux du thème (jamais à leur place).
const STYLES_MENAGE = {
  ...STYLES,
  sousTitre: { fontSize: 10.5, bold: true, color: PALETTE.ink },
  encadreLabelInfo: { fontSize: 9.5, bold: true, color: PALETTE.gold, margin: [0, 0, 0, 3] },
  encadreLabelAlerte: { fontSize: 9.5, bold: true, color: PALETTE.amber, margin: [0, 0, 0, 3] },
  encadreTexte: { fontSize: 9.5, color: PALETTE.ink },
  checklistText: { fontSize: 9.5, color: PALETTE.text },
}

const ENCADRE = {
  info: { filet: PALETTE.gold, fond: PALETTE.rowAlt, label: 'encadreLabelInfo' },
  alerte: { filet: PALETTE.amber, fond: '#fffbeb', label: 'encadreLabelAlerte' },
}

// Encadré à filet latéral : une table d'une cellule, dont seul le trait vertical
// gauche est dessiné (vLineWidth pour i === 0), sur fond teinté.
const encadreLayout = (ton) => ({
  fillColor: () => ENCADRE[ton].fond,
  hLineWidth: () => 0,
  vLineWidth: (i) => (i === 0 ? 3 : 0),
  vLineColor: () => ENCADRE[ton].filet,
  paddingLeft: () => 12,
  paddingRight: () => 12,
  paddingTop: () => 8,
  paddingBottom: () => 8,
})

// Case à cocher dessinée : un carré vide, à cocher au stylo par le prestataire.
const caseACocher = (texte) => ({
  columns: [
    {
      canvas: [{ type: 'rect', x: 0, y: 2, w: 8, h: 8, lineWidth: 0.8, lineColor: PALETTE.label }],
      width: 14,
    },
    { text: texte, style: 'checklistText' },
  ],
  margin: [0, 0, 0, 3],
})

// Un libellé de bloc ne doit pas rester seul en bas de page, son contenu sur la
// suivante. Les blocs courts sont rendus insécables ; les longs (grande liste, long
// texte) restent sécables, sinon un bloc plus haut que la place restante laisserait
// un grand blanc.
const LIMITE_INSECABLE_ITEMS = 10
const LIMITE_INSECABLE_CARACTERES = 600
const estCourt = (bloc) =>
  (bloc.items ? bloc.items.length <= LIMITE_INSECABLE_ITEMS : true) &&
  (bloc.texte ? bloc.texte.length <= LIMITE_INSECABLE_CARACTERES : true)

// ── Blocs → nœuds pdfmake ────────────────────────────────────────────────────
function noeudBloc(bloc) {
  switch (bloc.type) {
    case 'champs':
      return {
        table: {
          widths: ['35%', '65%'],
          // Lu sur table.* par pdfmake 0.2 (cf. PdfBuilder) : une ligne n'est jamais
          // coupée entre deux pages.
          dontBreakRows: true,
          body: bloc.lignes.map(([k, v]) => [
            { text: k, style: 'cellLabel' },
            { text: v, style: 'cellValue' },
          ]),
        },
        layout: TWO_COL_LAYOUT,
        margin: [0, 0, 0, 8],
      }

    case 'paragraphe':
      return {
        stack: [
          { text: bloc.label, style: 'blockLabel' },
          { text: bloc.texte, style: 'paragraphText' },
        ],
        unbreakable: estCourt(bloc),
        margin: [0, 0, 0, 8],
      }

    case 'liste':
      return {
        stack: [
          { text: bloc.label, style: 'blockLabel' },
          { ul: bloc.items, style: 'bulletText' },
        ],
        unbreakable: estCourt(bloc),
        margin: [0, 0, 0, 8],
      }

    case 'checklist':
      return {
        stack: [
          { text: bloc.label, style: 'blockLabel' },
          ...bloc.items.map(caseACocher),
        ],
        unbreakable: estCourt(bloc),
        margin: [0, 0, 0, 8],
      }

    case 'encadre':
      return {
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                { text: bloc.label, style: ENCADRE[bloc.ton].label },
                // Non justifié : une consigne est une suite de phrases courtes, que la
                // justification étirerait ligne à ligne.
                { text: bloc.texte, style: 'encadreTexte' },
              ],
            },
          ]],
        },
        layout: encadreLayout(bloc.ton),
        unbreakable: estCourt(bloc),
        margin: [0, 0, 0, 10],
      }

    case 'sousTitre':
      // headlineLevel 2 : même protection anti-orphelin que les titres de section.
      return { text: bloc.texte, style: 'sousTitre', headlineLevel: 2, margin: [0, 6, 0, 5] }

    default:
      return null
  }
}

// Un titre (de partie ou de pièce) part avec le bloc qu'il introduit : les deux sont
// soudés dans une pile insécable. La règle `pageBreakBefore` du thème ne suffit pas
// quand le bloc suivant est un tableau dont la première ligne ne tient plus sur la
// page : pdfmake considère le tableau « présent » sur la page du titre, alors que
// ses lignes (dontBreakRows) sont déjà parties sur la suivante — titre orphelin.
function souderTitres(noeuds) {
  const resultat = []
  let i = 0
  while (i < noeuds.length) {
    if (!(noeuds[i].headlineLevel >= 1)) {
      resultat.push(noeuds[i])
      i++
      continue
    }
    // Une suite de titres (titre de partie puis sous-titre de pièce, par exemple) est
    // soudée AVEC le premier bloc qui la suit : sans cela, le titre de partie resterait
    // seul en bas de page pendant que le sous-titre partirait, soudé, sur la suivante.
    const pile = []
    while (i < noeuds.length && noeuds[i].headlineLevel >= 1) pile.push(noeuds[i++])
    if (i < noeuds.length) pile.push(noeuds[i++])
    resultat.push(pile.length > 1 ? { stack: pile, unbreakable: true } : pile[0])
  }
  return resultat
}

function metaBox(lignes) {
  return {
    table: {
      widths: ['auto', '*'],
      body: lignes.map(([k, v]) => [
        { text: k, style: 'metaKey' },
        { text: v, style: 'metaVal' },
      ]),
    },
    layout: META_LAYOUT,
    margin: [0, 0, 0, 10],
  }
}

/**
 * Construit le docDefinition pdfmake de la Fiche Ménage (fonction PURE).
 * Isolée du téléchargement pour permettre une génération headless (tests, preuve
 * visuelle) — même découpage que buildDocDefinition pour la Fiche Logement.
 *
 * @param {Object} formData — la fiche en mémoire
 * @param {Object} [options]
 * @param {Date}   [options.date] — date affichée dans le bloc meta (tests)
 */
export const buildDocDefinitionMenage = (formData, options = {}) => {
  const contenu = construireContenuMenage(formData)
  const date = options.date instanceof Date ? options.date : new Date()
  const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const content = [
    bandeauCouverture(Sparkles, 'Fiche Ménage'),
    separateurGold(12),
    metaBox([...contenu.meta, ['Généré le', dateStr]]),
    { text: INTRO_MENAGE, style: 'recapIntro', margin: [0, 0, 0, 4] },
  ]

  if (contenu.parties.length) {
    contenu.parties.forEach((partie) => {
      const noeuds = [titreSection(ICONES[partie.icone], partie.titre)]
      partie.blocs.forEach((bloc) => {
        const noeud = noeudBloc(bloc)
        if (noeud) noeuds.push(noeud)
      })
      content.push(...souderTitres(noeuds))
    })
  } else {
    content.push({
      text: "Aucune information destinée au ménage n'est renseignée pour le moment.",
      style: 'empty',
      margin: [0, 24, 0, 0],
    })
  }

  return {
    pageSize: 'A4',
    pageMargins: PAGE_MARGINS,
    content,
    footer: piedDePage('Fiche Ménage'),
    pageBreakBefore: pageBreakBeforeRule,
    styles: STYLES_MENAGE,
    defaultStyle: DEFAULT_STYLE,
  }
}

// Nom de fichier lisible : fiche-menage-{nom-du-bien}-{AAAA-MM-JJ}.pdf
const slugify = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'sans-nom'

export const buildPdfMenageFilename = (formData, date = new Date()) =>
  `fiche-menage-${slugify(formData?.nom)}-${date.toISOString().slice(0, 10)}.pdf`

/**
 * Génère la Fiche Ménage et la remet au navigateur.
 *
 * Retourne une PROMESSE résolue APRÈS la remise du fichier (cf. livrerPdf) : `download()`
 * de pdfmake rend la main avant d'avoir produit le fichier, et rejette avec
 * `renduEnCours = true` si le délai de garde expire alors que le rendu peut encore
 * aboutir. Aucune écriture en base n'est déclenchée ici, ni par `onDelivered` : ce
 * document ne laisse aucune trace et ne pose aucun verrou.
 */
export const generateFicheMenagePdf = (formData, { onDelivered } = {}) => {
  const docDefinition = buildDocDefinitionMenage(formData)
  return livrerPdf({
    demarrerRendu: (fini) => pdfMake.createPdf(docDefinition).download(buildPdfMenageFilename(formData), fini),
    onDelivered,
  })
}
