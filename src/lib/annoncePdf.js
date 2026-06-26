// src/lib/annoncePdf.js
// PDF simple et basique de l'annonce générée par l'agent (moteur Edge Function
// annonce-generate). Côté front uniquement (pdfmake, comme la fiche logement) :
// pas de serveur, pas de Puppeteer. Prend la sortie ASSEMBLÉE telle que renvoyée
// par la fonction (output_assemble.airbnb | output_assemble.booking) et la rend
// en PDF téléchargeable.

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

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

/** Bloc « titre de section + corps », ignoré si le corps est vide. */
function bloc(titre, corps) {
  const texte = (corps == null ? '' : String(corps)).trim()
  if (!texte) return []
  return [
    { text: titre, style: 'h2', margin: [0, 12, 0, 4] },
    { text: texte, style: 'body' },
  ]
}

/** Mentions réglementaires (objet) → lignes lisibles, seulement si renseignées. */
function blocReglementation(m) {
  if (!m) return []
  const lignes = []
  if (m.numero_enregistrement) lignes.push(`Numéro d'enregistrement : ${m.numero_enregistrement}`)
  if (m.dpe_classe) lignes.push(`Classe DPE : ${m.dpe_classe}`)
  if (m.mention_consommation_excessive) lignes.push(m.mention_consommation_excessive)
  if (m.estimation_depenses_annuelles) lignes.push(m.estimation_depenses_annuelles)
  if (!lignes.length) return []
  return [
    { text: 'Mentions réglementaires', style: 'h2', margin: [0, 12, 0, 4] },
    { ul: lignes, style: 'body' },
  ]
}

function contenuAirbnb(a) {
  const content = []
  if (Array.isArray(a.titres) && a.titres.length) {
    content.push({ text: 'Titres proposés', style: 'h2', margin: [0, 4, 0, 4] })
    content.push({ ol: a.titres.filter(Boolean), style: 'body' })
  }
  if (a.nombre_voyageurs != null) {
    content.push({ text: `Nombre de voyageurs : ${a.nombre_voyageurs}`, style: 'meta', margin: [0, 6, 0, 0] })
  }
  content.push(
    ...bloc('Description', a.description),
    ...bloc('Le logement', a.logement),
    ...bloc('Accès des voyageurs', a.acces_voyageurs),
    ...bloc('Échanges avec les voyageurs', a.echanges_voyageurs),
    ...bloc('Le quartier', a.quartier),
    ...bloc('Comment se déplacer', a.comment_se_deplacer),
    ...bloc('Autres remarques', a.autres_remarques),
    ...blocReglementation(a.mentions_reglementaires),
    ...bloc("Note sur l'état", a.note_etat),
    ...bloc('Note sur le quartier', a.note_quartier),
  )
  return content
}

function contenuBooking(b) {
  return [
    ...bloc('Nom de l’hébergement', b.nom),
    ...bloc('À propos du logement', b.about_property),
    ...bloc('À propos du quartier', b.about_neighbourhood),
    ...bloc('À propos de l’hôte', b.about_host),
    ...blocReglementation(b.mentions_reglementaires),
    ...bloc("Note sur l'état", b.note_etat),
    ...bloc('Note sur le quartier', b.note_quartier),
    ...bloc('Caméra de surveillance', b.note_camera),
  ]
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
    ...(estBooking ? contenuBooking(data) : contenuAirbnb(data)),
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
