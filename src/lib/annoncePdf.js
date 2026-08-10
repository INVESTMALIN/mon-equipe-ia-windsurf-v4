// src/lib/annoncePdf.js
// PDF simple et basique de l'annonce générée par l'agent (moteur Edge Function
// annonce-generate). Côté front uniquement (pdfmake, comme la fiche logement) :
// pas de serveur, pas de Puppeteer. Prend la sortie ASSEMBLÉE telle que renvoyée
// par la fonction (output_assemble.airbnb | output_assemble.booking) et la rend
// en PDF téléchargeable.

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { CHAMPS_ANNONCE, valeurChamp } from './annonceChamps'

// Initialisation des polices (même pattern robuste que PdfBuilder.js).
if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs
} else {
  pdfMake.vfs = pdfFonts
}

const DORE = '#dbae61'

const slug = (s) =>
  String(s || 'annonce')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'annonce'

/**
 * Champs de l'annonce → nœuds pdfmake, dans l'ordre du descripteur partagé
 * (lib/annonceChamps). La liste des champs est commune au récapitulatif du PDF de
 * fiche ; la MISE EN FORME ci-dessous reste propre à ce document.
 */
function contenuAnnonce(donnees, plateforme) {
  const content = []

  CHAMPS_ANNONCE[plateforme].forEach((champ) => {
    const valeur = valeurChamp(donnees, champ)
    if (valeur === null) return

    if (champ.type === 'liste_ordonnee') {
      content.push({ text: champ.libelle, style: 'h2', margin: [0, 4, 0, 4] })
      content.push({ ol: valeur, style: 'body' })
    } else if (champ.type === 'nombre') {
      content.push({ text: `${champ.libelle} : ${valeur}`, style: 'meta', margin: [0, 6, 0, 0] })
    } else if (champ.type === 'mentions') {
      content.push({ text: champ.libelle, style: 'h2', margin: [0, 12, 0, 4] })
      content.push({ ul: valeur, style: 'body' })
    } else {
      content.push({ text: champ.libelle, style: 'h2', margin: [0, 12, 0, 4] })
      content.push({ text: valeur, style: 'body' })
    }
  })

  return content
}

/**
 * Génère et télécharge le PDF de l'annonce.
 * @param {Object} outputAssemble - output_assemble renvoyé par annonce-generate
 *   ({ airbnb: {...} } ou { booking: {...} }).
 * @param {('airbnb'|'booking')} plateforme
 * @param {string} ficheNom - nom de la fiche (pour le nom de fichier).
 */
export function generateAnnoncePdf(outputAssemble, plateforme, ficheNom) {
  const estBooking = plateforme === 'booking'
  const data = estBooking ? outputAssemble?.booking : outputAssemble?.airbnb
  if (!data) throw new Error('Sortie d’annonce introuvable pour la plateforme ' + plateforme)

  const titrePlateforme = estBooking ? 'Annonce Booking' : 'Annonce Airbnb'
  const content = [
    {
      columns: [
        { text: titrePlateforme.toUpperCase(), style: 'logo' },
        {
          text: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
          style: 'date',
          alignment: 'right',
        },
      ],
      margin: [0, 0, 0, 6],
    },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.2, lineColor: DORE }], margin: [0, 0, 0, 12] },
    ...(ficheNom ? [{ text: ficheNom, style: 'sousTitre', margin: [0, 0, 0, 8] }] : []),
    ...contenuAnnonce(data, estBooking ? 'booking' : 'airbnb'),
  ]

  const docDef = {
    pageMargins: [40, 40, 40, 50],
    content,
    defaultStyle: { fontSize: 10, color: '#1f2937', lineHeight: 1.25 },
    styles: {
      logo: { fontSize: 16, bold: true, color: DORE },
      date: { fontSize: 9, color: '#6b7280' },
      sousTitre: { fontSize: 12, bold: true, color: '#374151' },
      h2: { fontSize: 11, bold: true, color: '#111827' },
      body: { fontSize: 10, color: '#1f2937' },
      meta: { fontSize: 9, italics: true, color: '#6b7280' },
    },
    footer: (currentPage, pageCount) => ({
      text: `Mon Équipe IA — ${titrePlateforme} — ${currentPage}/${pageCount}`,
      alignment: 'center',
      fontSize: 8,
      color: '#9ca3af',
      margin: [0, 10, 0, 0],
    }),
  }

  pdfMake.createPdf(docDef).download(`annonce-${plateforme}-${slug(ficheNom)}.pdf`)
}
