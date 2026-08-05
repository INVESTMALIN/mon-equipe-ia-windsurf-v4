// src/lib/consommablesRecapLite.js
//
// Source unique des libellés de la section Consommables (Lite), et construction du
// rappel affiché en lecture seule dans la section Instructions Ménage.
//
// ⚠️ Le rappel ne stocke RIEN. Aucune colonne, aucune copie, aucune synchronisation.
// Il est recalculé à chaque rendu depuis `section_consommables`, donc une modification
// côté Consommables se voit immédiatement, sans sauvegarde.
//
// Ce module est importé par FicheConsommables (la saisie) et par FicheInstructionsMenage
// (le rappel) : les deux écrans ne peuvent pas afficher des libellés différents.
//
// ⚠️ ÉCART ASSUMÉ AVEC LES COORDINATEURS. Le module homonyme côté coordinateurs
// (`consommablesRecap.js`) n'a pas la même forme, et c'est voulu :
//   - Lite n'a pas de champ « 1er panier » (pas de `premier_panier_par_prestataire`) ;
//   - la liste que le prestataire fournit est ici une série de CASES À COCHER, alors
//     que les coordinateurs affichent une liste figée en dur. Le rappel doit donc
//     reprendre ce qui est réellement coché dans Lite, pas une liste théorique.

// Ce que le prestataire accepte de fournir — cases à cocher, visibles seulement quand
// les consommables du quotidien sont à sa charge. Libellés repris du modèle de contrat.
export const CONSOMMABLES_RECOMMANDES = [
  { key: 'papier_toilette', label: '2 rouleaux de papier toilette par toilette' },
  { key: 'savon_mains', label: '1 savon pour les mains par lavabo' },
  { key: 'produit_vaisselle', label: '1 produit vaisselle par cuisine' },
  { key: 'eponge_cuisine', label: '1 éponge par cuisine (en bon état)' },
  { key: 'sel_poivre_sucre', label: 'Sel, poivre, sucre (en quantité adéquate)' },
  { key: 'cafe_the', label: 'Café et thé (1 sachet par personne)' },
  { key: 'essuie_tout', label: 'Essuie-tout/Sopalin' },
  { key: 'sac_poubelle', label: 'Sac poubelle' },
  { key: 'produit_vitres', label: 'Produit vitres' },
  { key: 'produit_sol', label: 'Produit sol' },
  { key: 'produit_salle_bain', label: 'Produit salle de bain/multi-surfaces ou vinaigre ménager' },
  { key: 'produit_wc_javel', label: 'Produit WC / Javel' },
  {
    key: 'consommables_recommandes_autre',
    label: 'Autre (précisez)',
    detailsKey: 'consommables_recommandes_autre_details'
  }
]

// Consommables « sur demande » — cochés au cas par cas pour ce logement.
export const CONSOMMABLES_SUR_DEMANDE = [
  { key: 'gel_douche', label: 'Gel douche' },
  { key: 'shampoing', label: 'Shampoing' },
  { key: 'apres_shampoing', label: 'Après Shampoing' },
  { key: 'pastilles_lave_vaisselle', label: 'Pastilles, sel et liquide de rinçage pour lave-vaisselle' },
  { key: 'autre_consommable', label: 'Autre (précisez)', detailsKey: 'autre_consommable_details' }
]

export const CONSOMMABLES_CAFE = [
  { key: 'cafe_nespresso', label: 'Nespresso' },
  { key: 'cafe_senseo', label: 'Senseo' },
  { key: 'cafe_tassimo', label: 'Tassimo' },
  { key: 'cafe_soluble', label: 'Café soluble' },
  { key: 'cafe_moulu', label: 'Café moulu' },
  { key: 'cafe_grain', label: 'Café grain' },
  { key: 'cafe_autre', label: 'Autre (précisez)', detailsKey: 'cafe_autre_details' }
]

// `fournis_par_prestataire` : true = prestataire de ménage, false = propriétaire,
// null/"" = question non répondue.
export const labelFournisseur = (value) => {
  if (value === true) return 'Prestataire de ménage'
  if (value === false) return 'Propriétaire'
  return null
}

// Développe une liste de cases à cocher en libellés, en substituant la précision libre
// quand la case « Autre » est cochée ET renseignée.
const cochesToLabels = (options, data) =>
  options
    .filter(({ key }) => data[key] === true)
    .map(({ label, detailsKey }) => {
      const details = detailsKey ? (data[detailsKey] || '').trim() : ''
      return details || label
    })

/**
 * Construit le rappel des consommables à partir de `section_consommables`.
 * Fonction pure : mêmes entrées → mêmes sorties, aucun effet de bord.
 *
 * @param {Object} sectionConsommables — formData.section_consommables
 * @returns {{
 *   quotidien: string|null,
 *   fournisApplicables: boolean,
 *   recommandes: string[],
 *   surDemande: string[],
 *   cafe: string[],
 *   isEmpty: boolean
 * }}
 */
export function buildConsommablesRecapLite(sectionConsommables) {
  const data = sectionConsommables || {}

  const quotidien = labelFournisseur(data.fournis_par_prestataire)

  // Les listes « recommandés » et « sur demande » ne sont saisissables que si le
  // quotidien est à la charge du prestataire — même condition que dans FicheConsommables.
  const fournisApplicables = data.fournis_par_prestataire === true

  const recommandes = fournisApplicables ? cochesToLabels(CONSOMMABLES_RECOMMANDES, data) : []
  const surDemande = fournisApplicables ? cochesToLabels(CONSOMMABLES_SUR_DEMANDE, data) : []

  // Le café est toujours saisissable, quel que soit le fournisseur.
  const cafe = cochesToLabels(CONSOMMABLES_CAFE, data)

  return {
    quotidien,
    fournisApplicables,
    recommandes,
    surDemande,
    cafe,
    isEmpty:
      !quotidien &&
      recommandes.length === 0 &&
      surDemande.length === 0 &&
      cafe.length === 0
  }
}
