// src/lib/annonceChamps.js
//
// DESCRIPTEUR des champs d'une annonce générée (output_assemble de l'Edge Function
// annonce-generate) : quels champs, dans quel ordre, sous quel libellé.
//
// Module de DONNÉES PUR — aucun rendu, aucune dépendance. Deux rendus le consomment,
// chacun avec SA mise en forme :
//   - lib/annoncePdf.js  → PDF autonome de l'annonce (téléchargement individuel)
//   - lib/PdfBuilder.js  → récapitulatif en fin de PDF de la fiche
// Sans ce module, les deux listes de champs divergeraient au premier champ ajouté par
// l'agent : l'un l'afficherait, l'autre le perdrait en silence.
//
// ⚠️ L'aperçu écran de FicheFinalisation garde encore sa propre liste (JSX, un composant
// par champ). À rebrancher ici le jour où on y touche.

/**
 * type :
 *   'texte'           → chaîne libre, rendue en paragraphe (ignorée si vide)
 *   'liste_ordonnee'  → tableau de chaînes, rendu en liste numérotée
 *   'nombre'          → valeur affichée en ligne de détail (rendue même si 0)
 *   'mentions'        → objet de mentions réglementaires, cf. lignesMentionsReglementaires
 */
export const CHAMPS_ANNONCE = {
  airbnb: [
    { cle: 'titres', libelle: 'Titres proposés', type: 'liste_ordonnee' },
    { cle: 'nombre_voyageurs', libelle: 'Nombre de voyageurs', type: 'nombre' },
    { cle: 'description', libelle: 'Description', type: 'texte' },
    { cle: 'logement', libelle: 'Le logement', type: 'texte' },
    { cle: 'acces_voyageurs', libelle: 'Accès des voyageurs', type: 'texte' },
    { cle: 'echanges_voyageurs', libelle: 'Échanges avec les voyageurs', type: 'texte' },
    { cle: 'quartier', libelle: 'Le quartier', type: 'texte' },
    { cle: 'comment_se_deplacer', libelle: 'Comment se déplacer', type: 'texte' },
    { cle: 'autres_remarques', libelle: 'Autres remarques', type: 'texte' },
    { cle: 'mentions_reglementaires', libelle: 'Mentions réglementaires', type: 'mentions' },
    { cle: 'note_etat', libelle: "Note sur l'état", type: 'texte' },
    { cle: 'note_quartier', libelle: 'Note sur le quartier', type: 'texte' },
  ],
  booking: [
    { cle: 'nom', libelle: 'Nom de l’hébergement', type: 'texte' },
    { cle: 'about_property', libelle: 'À propos du logement', type: 'texte' },
    { cle: 'about_neighbourhood', libelle: 'À propos du quartier', type: 'texte' },
    { cle: 'about_host', libelle: 'À propos de l’hôte', type: 'texte' },
    { cle: 'mentions_reglementaires', libelle: 'Mentions réglementaires', type: 'mentions' },
    { cle: 'note_etat', libelle: "Note sur l'état", type: 'texte' },
    { cle: 'note_quartier', libelle: 'Note sur le quartier', type: 'texte' },
    { cle: 'note_camera', libelle: 'Caméra de surveillance', type: 'texte' },
  ],
}

export const PLATEFORME_LABEL = { airbnb: 'Airbnb', booking: 'Booking' }

/** Mentions réglementaires (objet) → lignes lisibles, uniquement celles renseignées. */
export function lignesMentionsReglementaires(mentions) {
  if (!mentions) return []
  const lignes = []
  if (mentions.numero_enregistrement) lignes.push(`Numéro d'enregistrement : ${mentions.numero_enregistrement}`)
  if (mentions.dpe_classe) lignes.push(`Classe DPE : ${mentions.dpe_classe}`)
  if (mentions.mention_consommation_excessive) lignes.push(mentions.mention_consommation_excessive)
  if (mentions.estimation_depenses_annuelles) lignes.push(mentions.estimation_depenses_annuelles)
  return lignes
}

/**
 * Valeur d'un champ prête à rendre, ou `null` si le champ n'a rien à afficher.
 * Centralise la règle « vide » pour que les deux rendus masquent EXACTEMENT les mêmes
 * champs : un champ absent d'un PDF et présent dans l'autre serait incompréhensible.
 */
export function valeurChamp(donnees, champ) {
  const brut = donnees?.[champ.cle]

  if (champ.type === 'liste_ordonnee') {
    const items = Array.isArray(brut) ? brut.filter(Boolean) : []
    return items.length ? items : null
  }

  if (champ.type === 'nombre') {
    return brut == null ? null : brut
  }

  if (champ.type === 'mentions') {
    const lignes = lignesMentionsReglementaires(brut)
    return lignes.length ? lignes : null
  }

  const texte = (brut == null ? '' : String(brut)).trim()
  return texte || null
}

/** true si l'annonce contient au moins un champ à afficher. */
export function annonceANonVide(donnees, plateforme) {
  const champs = CHAMPS_ANNONCE[plateforme]
  if (!champs || !donnees) return false
  return champs.some((champ) => valeurChamp(donnees, champ) !== null)
}
