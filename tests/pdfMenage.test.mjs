// Fiche Ménage — mise en page (pdfmake) et non-régression de la Fiche Logement.
//
// pdfmake, react-dom/server et lucide-react se chargent nativement en Node : ces tests
// construisent les VRAIS docDefinitions et vont jusqu'au rendu en mémoire (getBuffer),
// sans navigateur, sans téléchargement, sans écriture en base. Les fiches sont
// synthétiques (tests/fixtures/ficheMenage.mjs).

import { test } from 'node:test'
import assert from 'node:assert/strict'

import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'

import { buildDocDefinitionMenage, buildPdfMenageFilename } from '../src/lib/PdfMenageBuilder.js'
import { buildDocDefinition, buildPdfFilename } from '../src/lib/PdfBuilder.js'
import { PALETTE, PAGE_MARGINS, STYLES } from '../src/lib/pdfTheme.js'
import { initialFormData } from '../src/lib/formDefaults.js'
import { ficheRiche, fichePartielle, fichePresqueVide, ficheHeritee, SECRETS } from './fixtures/ficheMenage.mjs'

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts

const DATE = new Date('2026-09-18T10:00:00Z')

const rendre = (doc) => new Promise((resolve) => pdfMake.createPdf(doc).getBuffer((buf) => resolve(buf)))

// Tout le texte d'un docDefinition, quel que soit le nœud qui le porte.
const textes = (noeud, acc = []) => {
  if (noeud === null || noeud === undefined) return acc
  if (typeof noeud === 'string') acc.push(noeud)
  else if (Array.isArray(noeud)) noeud.forEach((n) => textes(n, acc))
  else if (typeof noeud === 'object') {
    if (typeof noeud.text === 'string') acc.push(noeud.text)
    for (const [k, v] of Object.entries(noeud)) if (k !== 'text' && k !== 'svg') textes(v, acc)
  }
  return acc
}

test('la Fiche Ménage se rend en PDF pour une fiche riche, partielle, presque vide et héritée', async () => {
  for (const [nom, fiche] of [['riche', ficheRiche()], ['partielle', fichePartielle()], ['vide', fichePresqueVide()], ['heritee', ficheHeritee()]]) {
    const doc = buildDocDefinitionMenage(fiche, { date: DATE })
    const buf = await rendre(doc)
    assert.ok(buf.length > 1000, `${nom} : PDF vide`)
    assert.equal(buf.subarray(0, 5).toString(), '%PDF-', `${nom} : en-tête PDF`)
  }
})

test('même système visuel que la Fiche Logement : bandeau, séparateur, meta, marges, pied de page', () => {
  const menage = buildDocDefinitionMenage(ficheRiche(), { date: DATE })
  const logement = buildDocDefinition(ficheRiche())

  assert.deepEqual(menage.pageMargins, PAGE_MARGINS)
  assert.deepEqual(logement.pageMargins, PAGE_MARGINS)
  assert.deepEqual(menage.defaultStyle, logement.defaultStyle)

  // Bandeau : même table, même layout (fond ardoise), titres différents.
  const bandeau = (doc) => doc.content[0]
  assert.equal(bandeau(menage).layout.fillColor(), PALETTE.slate)
  assert.equal(bandeau(logement).layout.fillColor(), PALETTE.slate)
  assert.equal(bandeau(menage).table.body[0][0].columns[1].text, 'Fiche Ménage')
  assert.equal(bandeau(logement).table.body[0][0].columns[1].text, 'Fiche Logement')

  // Séparateur gold identique.
  assert.deepEqual(menage.content[1].canvas, logement.content[1].canvas)

  // Styles du thème présents dans les deux, à l'identique.
  for (const cle of Object.keys(STYLES)) {
    assert.deepEqual(menage.styles[cle], STYLES[cle])
    assert.deepEqual(logement.styles[cle], STYLES[cle])
  }

  // Pied de page : même forme, libellé propre à chaque document.
  assert.equal(menage.footer(3, 7).columns[0].text, 'Fiche Ménage')
  assert.equal(menage.footer(3, 7).columns[1].text, 'Page 3 / 7')
  assert.equal(logement.footer(3, 7).columns[0].text, 'Fiche Logement')
})

test('bloc meta : bien, propriétaire (nom seul), adresse, logement, date', () => {
  const doc = buildDocDefinitionMenage(ficheRiche(), { date: DATE })
  const meta = doc.content[2].table.body.map(([k, v]) => [k.text, v.text])
  assert.deepEqual(meta, [
    ['Bien', 'Appartement Dupont — Vieux-Port'],
    ['Propriétaire', 'Camille Dupont'],
    ['Adresse', '12 quai du Port, Résidence Les Mouettes, 13002 Marseille, France'],
    ['Logement', 'Appartement · T3 · 68 m² · 5 pers. max · 3 lits'],
    ['Généré le', '18 septembre 2026'],
  ])
})

test('aucune valeur confidentielle dans le docDefinition rendu', () => {
  const tout = textes(buildDocDefinitionMenage(ficheRiche(), { date: DATE }).content).join('\n')
  for (const [nom, secret] of Object.entries(SECRETS)) {
    assert.ok(!tout.includes(secret), `fuite dans le PDF : ${nom}`)
  }
  assert.match(tout, /4521/, 'le code ménage, lui, est bien là')
})

test('fiche presque vide : un seul message, aucune section, une seule page', async () => {
  const doc = buildDocDefinitionMenage(fichePresqueVide(), { date: DATE })
  const tout = textes(doc.content)
  assert.ok(tout.includes("Aucune information destinée au ménage n'est renseignée pour le moment."))
  assert.equal(doc.content.filter((n) => n.headlineLevel === 1 || n.stack?.[0]?.headlineLevel === 1).length, 0)
  const buf = await rendre(doc)
  assert.equal((buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length, 1)
})

test('les titres partent avec leur premier bloc (pile insécable) et les blocs courts sont insécables', () => {
  const doc = buildDocDefinitionMenage(ficheRiche(), { date: DATE })
  const piles = doc.content.filter((n) => n.stack && n.unbreakable && n.stack[0]?.headlineLevel >= 1)
  assert.ok(piles.length >= 9, 'chaque partie commence par un titre soudé à son premier bloc')
  // Titre seul + bloc → 2 nœuds ; titre + sous-titre de pièce + bloc → 3 nœuds. Jamais
  // un titre sans bloc derrière lui.
  for (const p of piles) {
    assert.ok(p.stack.length >= 2)
    assert.ok(!(p.stack[p.stack.length - 1].headlineLevel >= 1), 'le dernier nœud de la pile est un bloc')
  }
  const orphelins = doc.content.filter((n) => n.headlineLevel >= 1)
  assert.deepEqual(orphelins, [], 'aucun titre nu au niveau racine')
  // Un encadré court est insécable ; une checklist de 11 lignes ne l'est pas.
  const encadres = doc.content.filter((n) => n.table && n.layout?.vLineColor)
  assert.ok(encadres.length >= 3)
  assert.ok(encadres.every((n) => n.unbreakable === true))
  const checklist = doc.content.find((n) => n.stack?.some((s) => s.columns?.[0]?.canvas))
  assert.equal(checklist.unbreakable, false)
})

test('nom de fichier : fiche-menage-{bien}-{date}.pdf, distinct du PDF complet', () => {
  const f = ficheRiche()
  assert.equal(buildPdfMenageFilename(f, DATE), 'fiche-menage-appartement-dupont-vieux-port-2026-09-18.pdf')
  assert.match(buildPdfFilename(f), /^fiche-logement-appartement-dupont-vieux-port-\d{4}-\d{2}-\d{2}\.pdf$/)
  assert.equal(buildPdfMenageFilename({ nom: '' }, DATE), 'fiche-menage-sans-nom-2026-09-18.pdf')
})

// ── Non-régression de la Fiche Logement après extraction du thème ────────────

test('la Fiche Logement se construit et se rend toujours, sur les mêmes fiches', async () => {
  for (const [nom, fiche] of [['riche', ficheRiche()], ['vierge', structuredClone(initialFormData)]]) {
    const doc = buildDocDefinition(fiche, { annonces: [] })
    assert.equal(doc.pageSize, 'A4')
    assert.deepEqual(doc.pageMargins, [40, 36, 40, 48])
    assert.equal(doc.defaultStyle.font, 'Roboto')
    assert.equal(typeof doc.pageBreakBefore, 'function')
    // La règle de saut : un titre sans suite sur la page casse avant ; sinon non.
    assert.equal(doc.pageBreakBefore({ headlineLevel: 1 }, []), true)
    assert.equal(doc.pageBreakBefore({ headlineLevel: 1 }, [{}]), false)
    assert.equal(doc.pageBreakBefore({ text: 'x' }, []), false)
    const buf = await rendre(doc)
    assert.equal(buf.subarray(0, 5).toString(), '%PDF-', `${nom} : en-tête PDF`)
  }
})

test('la Fiche Logement complète, elle, contient bien les données que la Fiche Ménage exclut', () => {
  // Contrôle par contraste : ce n'est pas la fixture qui est vide, c'est la sélection
  // de la Fiche Ménage qui filtre.
  const tout = textes(buildDocDefinition(ficheRiche(), { annonces: [] }).content).join('\n')
  assert.ok(tout.includes(SECRETS.email))
  assert.ok(tout.includes(SECRETS.telephone))
  assert.ok(tout.includes(SECRETS.chauffageInstructions))
  // (le SSID y est aussi, mais reformaté par l'humanisation des valeurs enum : « Secret ssid »)
  assert.match(tout, /Secret ssid/)
})
