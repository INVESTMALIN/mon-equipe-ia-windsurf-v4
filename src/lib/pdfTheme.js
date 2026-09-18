// src/lib/pdfTheme.js
//
// Système visuel COMMUN aux documents PDF de Fiche Logement Lite : la Fiche Logement
// complète (PdfBuilder) et la Fiche Ménage (PdfMenageBuilder). Palette, styles de
// texte, layouts de tableau, bandeau, séparateur, pied de page et règle de saut de
// page vivent ici, en un seul exemplaire.
//
// Pourquoi un module à part : les deux documents doivent visiblement appartenir au
// même produit. Une copie de ces constantes dans chaque builder aurait fini par
// diverger — une couleur retouchée d'un côté, une taille de l'autre — sans que rien
// ne le signale. Ici, retoucher le thème retouche les deux documents.
//
// Les valeurs sont EXACTEMENT celles qu'utilisait PdfBuilder avant l'extraction :
// aucun changement de rendu pour la Fiche Logement.
//
// Module chargeable en Node (tests) : react-dom/server et lucide-react s'importent
// nativement, aucune dépendance à pdfmake ni à Supabase.

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FileText } from 'lucide-react'

// ── Palette ──────────────────────────────────────────────────────────────────
export const PALETTE = {
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
export const CONTENT_WIDTH = 515.28

export const PAGE_MARGINS = [40, 36, 40, 48]

// SVG lucide → string, couleur bakée (currentColor ne résout pas dans le PDF).
export const iconSvg = (Comp, color) =>
  renderToStaticMarkup(createElement(Comp || FileText, { color, size: 24, strokeWidth: 2 }))

// ── Styles & layouts pdfmake ─────────────────────────────────────────────────
export const STYLES = {
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

export const DEFAULT_STYLE = { font: 'Roboto', fontSize: 10, color: PALETTE.text, lineHeight: 1.15 }

export const BANNER_LAYOUT = {
  fillColor: () => PALETTE.slate,
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 18,
  paddingRight: () => 18,
  paddingTop: () => 16,
  paddingBottom: () => 16,
}

export const TWO_COL_LAYOUT = {
  fillColor: (rowIndex) => (rowIndex % 2 === 1 ? PALETTE.rowAlt : null),
  hLineWidth: () => 0.5,
  vLineWidth: () => 0,
  hLineColor: () => PALETTE.border,
  paddingLeft: () => 8,
  paddingRight: () => 8,
  paddingTop: () => 5,
  paddingBottom: () => 5,
}

export const META_LAYOUT = {
  fillColor: () => PALETTE.rowAlt,
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 12,
  paddingRight: () => 12,
  paddingTop: () => 6,
  paddingBottom: () => 6,
}

// ── Briques de mise en page partagées ────────────────────────────────────────

/** Bandeau de couverture : icône blanche + titre sur fond ardoise. */
export function bandeauCouverture(icone, titre) {
  return {
    table: {
      widths: ['*'],
      body: [[
        {
          columns: [
            { svg: iconSvg(icone, PALETTE.white), width: 22 },
            { text: titre, style: 'bannerTitle', margin: [10, 2, 0, 0] },
          ],
        },
      ]],
    },
    layout: BANNER_LAYOUT,
    margin: [0, 0, 0, 0],
  }
}

/** Filet gold sous un bandeau. */
export function separateurGold(margeBas = 12) {
  return {
    canvas: [{ type: 'rect', x: 0, y: 0, w: CONTENT_WIDTH, h: 3, color: PALETTE.gold }],
    margin: [0, 0, 0, margeBas],
  }
}

/**
 * Titre de section : icône gold + libellé coloré. headlineLevel=1 → protégé par
 * `pageBreakBeforeRule` pour ne jamais rester orphelin en bas de page.
 */
export function titreSection(icone, titre) {
  return {
    headlineLevel: 1,
    columns: [
      { svg: iconSvg(icone, PALETTE.gold), width: 15 },
      { text: titre, style: 'sectionTitle', margin: [7, 1, 0, 0] },
    ],
    margin: [0, 14, 0, 6],
  }
}

/** Pied de page numéroté : libellé du document à gauche, « Page n / N » à droite. */
export const piedDePage = (libelle) => (currentPage, pageCount) => ({
  columns: [
    { text: libelle, style: 'footerText', margin: [40, 0, 0, 0] },
    { text: `Page ${currentPage} / ${pageCount}`, style: 'footerText', alignment: 'right', margin: [0, 0, 40, 0] },
  ],
})

// Empêche un titre (headlineLevel 1 = section, 2 = sous-titre de la Fiche Ménage) de
// rester seul en bas de page : s'il n'est suivi d'aucun nœud sur la page (son contenu
// a débordé), on casse avant. La Fiche Logement n'a que des niveaux 1 : inchangée.
export const pageBreakBeforeRule = (currentNode, followingNodesOnPage) =>
  currentNode.headlineLevel >= 1 && followingNodesOnPage.length === 0
