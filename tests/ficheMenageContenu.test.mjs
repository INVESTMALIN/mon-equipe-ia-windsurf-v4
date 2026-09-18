// Fiche Ménage — invariants du CONTENU (module pur, aucun PDF produit ici).
//
// Ce qui est verrouillé : ce qui SORT (code ménage, consignes, linge, consommables
// cochés, vigilance, repli des champs déplacés) et surtout ce qui ne sort JAMAIS
// (codes conciergerie / propriétaire / voyageur, coordonnées du propriétaire, accès
// plateformes, Wi-Fi, chauffage général, rappels média, verdicts d'inspection).
// Les fiches sont synthétiques (tests/fixtures/ficheMenage.mjs) : aucune donnée réelle.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { construireContenuMenage, texteIntegral } from '../src/lib/ficheMenageContenu.js'
import { initialFormData } from '../src/lib/formDefaults.js'
import { ficheRiche, fichePartielle, fichePresqueVide, ficheHeritee, SECRETS } from './fixtures/ficheMenage.mjs'

const contenuEtTexte = (fiche) => {
  const contenu = construireContenuMenage(fiche)
  return { contenu, texte: texteIntegral(contenu) }
}
const partie = (contenu, cle) => contenu.parties.find((p) => p.cle === cle)
const lignes = (p) =>
  (p?.blocs || []).filter((b) => b.type === 'champs').flatMap((b) => b.lignes)
const valeur = (p, label) => lignes(p).find(([k]) => k === label)?.[1]

// ── Ce qui sort ──────────────────────────────────────────────────────────────

test('le code ménage de la boîte déclarée est visible (TTlock, Igloohome, Masterlock)', () => {
  const riche = contenuEtTexte(ficheRiche())
  assert.equal(valeur(partie(riche.contenu, 'acces'), 'Code ménage'), '4521')
  assert.equal(valeur(partie(riche.contenu, 'acces'), 'Boîte à clés'), 'TTlock')

  const partielle = contenuEtTexte(fichePartielle())
  assert.equal(valeur(partie(partielle.contenu, 'acces'), 'Code ménage'), '9931')

  const masterlock = ficheRiche()
  masterlock.section_clefs.boiteType = 'Masterlock'
  masterlock.section_clefs.masterlock = { code: '1357' }
  assert.equal(valeur(partie(construireContenuMenage(masterlock), 'acces'), 'Code ménage'), '1357')
})

test('boîte « Autres » : le type précisé sort, sans code structuré', () => {
  const f = ficheRiche()
  f.section_clefs.boiteType = 'Autres'
  f.section_clefs.boiteType_autre_precision = 'Boîte magnétique'
  const acces = partie(construireContenuMenage(f), 'acces')
  assert.equal(valeur(acces, 'Boîte à clés'), 'Autres (Boîte magnétique)')
  assert.equal(valeur(acces, 'Code ménage'), undefined)
})

test('consignes, points de vigilance, produits et kit de bienvenue sont rendus', () => {
  const { contenu, texte } = contenuEtTexte(ficheRiche())
  const intervention = partie(contenu, 'intervention')
  const encadres = intervention.blocs.filter((b) => b.type === 'encadre')
  assert.deepEqual(
    encadres.map((b) => [b.ton, b.label]),
    [['alerte', 'Points de vigilance'], ['info', 'Consignes générales de ménage'], ['info', 'Produits et matériel']]
  )
  assert.equal(valeur(intervention, 'Type de 1er ménage'), 'Approfondi')
  assert.equal(valeur(intervention, 'Acheté par'), 'Prestataire de ménage')
  assert.match(texte, /Bien refermer le velux/)
  assert.match(texte, /mot de bienvenue/)
})

test('le linge sort avec son inventaire accordé, son état, son emplacement et son code', () => {
  const { contenu, texte } = contenuEtTexte(ficheRiche())
  const linge = partie(contenu, 'linge')
  assert.equal(valeur(linge, 'Linge fourni dans le logement'), 'Oui')
  assert.equal(valeur(linge, 'Code du cadenas / de la malle'), '2580')
  assert.match(texte, /Lits 140 × 200 : 1 couette, 2 oreillers, 2 draps-housse/)
  assert.match(texte, /6 grandes serviettes/)
  assert.doesNotMatch(texte, /\(s\)/, 'les marques de pluriel doivent être résolues')
})

test('les consommables rendus sont ceux COCHÉS, en checklist, jamais une liste figée', () => {
  const { contenu } = contenuEtTexte(ficheRiche())
  const conso = partie(contenu, 'consommables')
  const checklist = conso.blocs.find((b) => b.type === 'checklist')
  assert.equal(valeur(conso, 'Fournis au quotidien par'), 'Prestataire de ménage')
  assert.ok(checklist.items.includes('2 rouleaux de papier toilette par toilette'))
  assert.ok(checklist.items.includes('Filtres à café n° 4'), 'la précision « autre » remplace le libellé')
  // Non cochés dans la fixture : ne doivent pas apparaître.
  assert.ok(!checklist.items.some((i) => /vitres/i.test(i)))
  assert.ok(!checklist.items.some((i) => /salle de bain/i.test(i)))
  assert.doesNotMatch(texteIntegral(contenu), /OBLIGATOIREMENT/i)
})

test("le système d'eau chaude sort, et disjoncteur / vanne / poubelles avec lui", () => {
  const { contenu } = contenuEtTexte(ficheRiche())
  const eq = partie(contenu, 'equipements')
  assert.equal(valeur(eq, 'Eau chaude'), "Ballon d'eau chaude — Placard de la salle de bains")
  assert.equal(valeur(eq, 'Disjoncteur'), "Placard de l'entrée, en haut")
  assert.equal(valeur(eq, "Vanne d'arrêt d'eau"), "Sous l'évier de la cuisine")
  assert.equal(valeur(eq, 'Jours de ramassage'), 'Lundi et jeudi soir (bac jaune le mercredi)')
  assert.equal(valeur(eq, 'Aspirateur'), 'Sans fil')
})

test('pièce par pièce : lits accordés, « Draps fournis : Non » conservé, équipements cochés', () => {
  const { contenu } = contenuEtTexte(ficheRiche())
  const pieces = partie(contenu, 'pieces')
  const sousTitres = pieces.blocs.filter((b) => b.type === 'sousTitre').map((b) => b.texte)
  assert.deepEqual(sousTitres, [
    'Chambre 1 — Chambre parentale',
    'Chambre 2 — Chambre enfants',
    'Salle de bains 1 — Salle de bains principale',
    'Cuisine — électroménager',
    'Cuisine — vaisselle et ustensiles',
    'Salon / salle à manger',
  ])
  const lits = lignes(pieces).filter(([k]) => k === 'Lits').map(([, v]) => v)
  assert.deepEqual(lits, ['1 lit queen size 160 × 200', '2 lits simples 90 × 190'])
  const draps = lignes(pieces).filter(([k]) => k === 'Draps fournis').map(([, v]) => v)
  assert.deepEqual(draps, ['Oui', 'Non'], 'un « Non » sur les draps est une information utile')
})

test('les éléments abîmés signalés sont listés, pièce par pièce', () => {
  const { contenu } = contenuEtTexte(ficheRiche())
  const bloc = partie(contenu, 'intervention').blocs.find((b) => b.type === 'liste' && /abîmés/.test(b.label))
  assert.deepEqual(bloc.items, ['Chambre 1 — Chambre parentale', 'Salle à manger', 'Garage'])
})

test("entretien des espaces : « à la charge du prestataire » vs « assuré par », dans les deux sens", () => {
  const { contenu } = contenuEtTexte(ficheRiche())
  const ext = partie(contenu, 'exterieur')
  assert.equal(valeur(ext, "Entretien de l'espace extérieur"), 'À la charge du prestataire de ménage')
  assert.equal(valeur(ext, 'Entretien de la piscine'), 'Assuré par : Société AquaNet, le mardi')
  assert.equal(valeur(ext, 'Entretien des espaces communs'), 'Assuré par : Syndic de copropriété')
})

// ── Ce qui ne sort jamais ────────────────────────────────────────────────────

test('AUCUNE valeur confidentielle ne figure dans le document (fiche riche et partielle)', () => {
  for (const fiche of [ficheRiche(), fichePartielle()]) {
    const { texte } = contenuEtTexte(fiche)
    for (const [nom, secret] of Object.entries(SECRETS)) {
      assert.ok(!texte.includes(secret), `fuite : ${nom} (« ${secret} »)`)
    }
  }
})

test('masterpin, code propriétaire et code voyageur ne sortent pas — y compris les valeurs orphelines d\'un autre type de boîte', () => {
  const { texte } = contenuEtTexte(ficheRiche()) // boîte TTlock, sous-objet igloohome orphelin
  assert.doesNotMatch(texte, /SECRET_MASTERPIN/)
  assert.doesNotMatch(texte, /SECRET_PROPRIO/)
  assert.doesNotMatch(texte, /SECRET_VOYAGEUR/)
  assert.doesNotMatch(texte, /ORPHELIN_MENAGE_IG/, 'le code ménage d\'un type non déclaré est une valeur orpheline')
  assert.doesNotMatch(texte, /masterpin|codeProprietaire|codeVoyageur/i)
})

test('les coordonnées personnelles du propriétaire ne sortent pas (le nom, si)', () => {
  const { contenu, texte } = contenuEtTexte(ficheRiche())
  assert.equal(contenu.meta.find(([k]) => k === 'Propriétaire')[1], 'Camille Dupont')
  assert.ok(!texte.includes(SECRETS.telephone))
  assert.ok(!texte.includes(SECRETS.email))
  assert.doesNotMatch(texte, /@/)
})

test('les contacts de maintenance et le type de maintenance ne sortent pas', () => {
  const f = ficheRiche()
  // Lite ne porte pas ces champs ; une fiche importée pourrait. La sélection explicite
  // les ignore, comme toute clé non décidée.
  f.section_instructions_menage.a_contacts_maintenance = true
  f.section_instructions_menage.contacts_maintenance = [{ nom: 'SECRET_ARTISAN', telephone: '0600000000' }]
  const { texte } = contenuEtTexte(f)
  assert.doesNotMatch(texte, /SECRET_ARTISAN|0600000000/)
  assert.ok(!texte.includes(SECRETS.maintenance))
  assert.doesNotMatch(texte, /maintenance/i)
})

test('Wi-Fi, TV, consoles et accès aux plateformes ne sortent pas', () => {
  const { texte } = contenuEtTexte(ficheRiche())
  assert.doesNotMatch(texte, /SECRET_SSID|SECRET_WIFI_MDP|wifi|wi-fi/i)
  assert.doesNotMatch(texte, /Netflix|PlayStation|Écran plat/)
  assert.doesNotMatch(texte, /airbnb|booking/i)
})

test('le chauffage général du logement ne fuit pas, le système d\'eau chaude reste', () => {
  const { texte } = contenuEtTexte(ficheRiche())
  assert.doesNotMatch(texte, /SECRET_CHAUFFAGE_GENERAL|thermostat/)
  assert.doesNotMatch(texte, /Central/)
  assert.match(texte, /Ballon d'eau chaude/)
  // Rien d'autre ne parle de chauffage dans cette fiche : le mot ne doit pas apparaître.
  assert.doesNotMatch(texte, /chauffage/i)

  // Un chauffage COCHÉ dans une pièce est un équipement à contrôler : il sort, seul.
  const f = ficheRiche()
  f.section_chambres.chambre_1.equipements_chauffage = true
  const avecChauffagePiece = texteIntegral(construireContenuMenage(f))
  assert.deepEqual(avecChauffagePiece.match(/chauffage/gi), ['Chauffage'])
})

test('les rappels photo / vidéo (aides de saisie) ne sortent pas', () => {
  const { texte } = contenuEtTexte(ficheRiche())
  assert.doesNotMatch(texte, /photo|vid[ée]o|_taken|rappel/i)
})

test('les verdicts d\'inspection (grille Avis, quantités, casseroles testées) ne sortent pas', () => {
  const { texte } = contenuEtTexte(ficheRiche())
  assert.doesNotMatch(texte, /SECRET_OBS_GRILLE|SECRET_QUANTITE_INSUFFISANTE|testées|Calme/)
  assert.doesNotMatch(texte, /SECRET_REGLES_PISCINE|SECRET_CONSEILS_VOYAGEURS|SECRET_GUIDE_VOYAGEURS/)
  assert.doesNotMatch(texte, /8 × 4/, 'les dimensions de piscine sont une info voyageur')
  assert.doesNotMatch(texte, /Supplément/, 'le tarif du lave-linge est une info voyageur')
})

// ── Repli des champs déplacés ────────────────────────────────────────────────

test('fiche héritée : type de 1er ménage lu dans Avis, animaux lus dans Équipements', () => {
  const { contenu, texte } = contenuEtTexte(ficheHeritee())
  assert.equal(valeur(partie(contenu, 'intervention'), 'Type de 1er ménage'), 'Remise en état')
  assert.equal(valeur(partie(contenu, 'logement'), 'Animaux acceptés'), 'Oui')
  assert.match(texte, /Chien du propriétaire présent parfois/)
  // L'ancien type de maintenance (valeur de ménage, hors liste) n'est ni repris ni rendu.
  assert.doesNotMatch(texte, /Approfondi/)
})

test('la nouvelle clé gagne sur la clé héritée', () => {
  const f = ficheHeritee()
  f.section_instructions_menage.type_premier_menage = 'Classique'
  f.section_exigences.animaux_acceptes = 'non'
  const contenu = construireContenuMenage(f)
  assert.equal(valeur(partie(contenu, 'intervention'), 'Type de 1er ménage'), 'Classique')
  assert.equal(valeur(partie(contenu, 'logement'), 'Animaux acceptés'), 'Non')
})

// ── Vides, défauts et réponses sans intérêt ──────────────────────────────────

test('fiche vierge : aucune partie, seul le nom dans le bloc meta', () => {
  const contenu = construireContenuMenage(structuredClone(initialFormData))
  assert.deepEqual(contenu.parties, [])
  assert.deepEqual(contenu.meta, [['Bien', 'Nouvelle fiche']])
})

test('fiche presque vide : aucune partie, pas de ligne fantôme', () => {
  const { contenu, texte } = contenuEtTexte(fichePresqueVide())
  assert.deepEqual(contenu.parties, [])
  assert.doesNotMatch(texte, /: Non|Non$/m)
})

test('fiche partielle : seules les parties renseignées existent, chacune sans bloc vide', () => {
  const { contenu } = contenuEtTexte(fichePartielle())
  assert.deepEqual(contenu.parties.map((p) => p.cle), ['logement', 'acces', 'intervention', 'consommables', 'equipements'])
  for (const p of contenu.parties) {
    for (const b of p.blocs) {
      if (b.type === 'champs') assert.ok(b.lignes.length > 0)
      if (b.items) assert.ok(b.items.length > 0)
      if (b.type === 'paragraphe' || b.type === 'encadre') assert.ok(b.texte.length > 0)
    }
  }
  // Consommables fournis par le propriétaire : pas de checklist « à fournir ».
  const conso = partie(contenu, 'consommables')
  assert.equal(valeur(conso, 'Fournis au quotidien par'), 'Propriétaire')
  assert.equal(conso.blocs.find((b) => b.type === 'checklist'), undefined)
})

test('les défauts de FormContext ne produisent ni « Non » ni « 0 »', () => {
  const f = ficheRiche()
  f.section_clefs.interphone = null
  f.section_clefs.tempoGache = null
  f.section_clefs.digicode = null
  f.section_equipements.compacteur_dechets = false
  f.section_chambres.chambre_1.equipements_draps_fournis = null
  f.section_chambres.chambre_2 = structuredClone(initialFormData.section_chambres.chambre_2)
  const contenu = construireContenuMenage(f)
  const acces = partie(contenu, 'acces')
  for (const label of ['Interphone', 'Tempo-gâche', 'Digicode']) assert.equal(valeur(acces, label), undefined)
  assert.equal(valeur(partie(contenu, 'equipements'), 'Compacteur à déchets'), undefined)
  assert.doesNotMatch(texteIntegral(contenu), /Compacteur/)
  const pieces = partie(contenu, 'pieces')
  assert.ok(!pieces.blocs.some((b) => b.type === 'sousTitre' && b.texte.startsWith('Chambre 2')), 'chambre aux défauts : absente')
  assert.equal(lignes(pieces).filter(([k]) => k === 'Draps fournis').length, 0)
})

test('seules les pièces DÉCLARÉES en Visite sortent : les enregistrements en surplus sont ignorés', () => {
  const f = ficheRiche()
  // Le concierge avait configuré 2 chambres, puis en déclare 1 : chambre_2 reste en
  // mémoire (l'écran la masque sans l'effacer) et ne doit pas sortir. Idem salle de
  // bains : 1 déclarée, une 2e configurée mais hors périmètre — même abîmée.
  f.section_visite.nombre_chambres = '1'
  f.section_salle_de_bains.salle_de_bain_2 = {
    ...f.section_salle_de_bains.salle_de_bain_2, nom_description: 'SDB fantôme', equipements_douche: true, elements_abimes: true,
  }
  const { contenu, texte } = contenuEtTexte(f)
  const sousTitres = partie(contenu, 'pieces').blocs.filter((b) => b.type === 'sousTitre').map((b) => b.texte)
  assert.ok(sousTitres.includes('Chambre 1 — Chambre parentale'))
  assert.ok(!sousTitres.some((t) => t.startsWith('Chambre 2')))
  assert.doesNotMatch(texte, /Chambre enfants|Veilleuse|SDB fantôme/)
  // Les éléments abîmés suivent le même périmètre.
  const abimes = partie(contenu, 'intervention').blocs.find((b) => b.type === 'liste' && /abîmés/.test(b.label))
  assert.deepEqual(abimes.items, ['Chambre 1 — Chambre parentale', 'Salle à manger', 'Garage'])
})

test('studio sans chambre déclarée : un « Espace nuit », même règle que l\'écran', () => {
  const f = ficheRiche()
  f.section_logement.typologie = 'Studio'
  f.section_visite.nombre_chambres = ''
  const { contenu } = contenuEtTexte(f)
  const sousTitres = partie(contenu, 'pieces').blocs.filter((b) => b.type === 'sousTitre').map((b) => b.texte)
  assert.equal(sousTitres[0], 'Espace nuit')
  assert.ok(!sousTitres.some((t) => /^Chambre/.test(t)))
})

test('linge : après un « Non », les anciens détails d\'inventaire ne sortent plus', () => {
  const f = ficheRiche() // inventaire, état, emplacement et code renseignés
  f.section_gestion_linge.dispose_de_linge = false
  const { contenu, texte } = contenuEtTexte(f)
  const linge = partie(contenu, 'linge')
  assert.equal(valeur(linge, 'Linge fourni dans le logement'), 'Non')
  assert.equal(linge.blocs.length, 1, 'une seule ligne : la réponse')
  assert.doesNotMatch(texte, /Malle en osier|2580|Lits 140|Usagé/)
  // Question jamais répondue : rien non plus, comme à l'écran.
  f.section_gestion_linge.dispose_de_linge = null
  assert.equal(partie(construireContenuMenage(f), 'linge'), undefined)
})

test('un sous-titre de pièce n\'est jamais rendu seul', () => {
  const f = fichePresqueVide()
  f.section_chambres.chambre_1.nom_description = 'Chambre bleue' // un nom, mais rien d'autre
  const contenu = construireContenuMenage(f)
  assert.equal(partie(contenu, 'pieces'), undefined)
})

test('le modèle ne mute pas la fiche reçue', () => {
  const f = ficheRiche()
  const avant = JSON.stringify(f)
  construireContenuMenage(f)
  assert.equal(JSON.stringify(f), avant)
})
