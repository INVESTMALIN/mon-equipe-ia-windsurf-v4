// Dérivation des livrables d'une fiche pour l'affichage du dashboard.
//
// Module PUR : aucune requête, aucun accès réseau. Il reçoit une ligne de fiche
// déjà chargée et l'ensemble des fiches pour lesquelles une annonce existe, et
// répond « quels badges afficher ». Toute la logique de preuve est ici, en un
// seul endroit, pour qu'elle soit testable et qu'on n'ait pas à la relire dans
// le JSX.
//
// ── Ce qui prouve chaque livrable ───────────────────────────────────────────
//
// GUIDE   `section_guide_acces.guide_genere_at`, ou à défaut un `guide_genere`
//         non vide. Le dashboard ne projette QUE l'horodatage : `guide_genere`
//         contient le texte intégral du guide, le charger pour chaque fiche de
//         la liste serait un gâchis de bande passante. Le repli sur le texte
//         sert aux appelants qui ont déjà l'objet complet (FormContext, jeux de
//         démonstration). AgentGuideAcces écrit toujours les deux ensemble, donc
//         l'horodatage seul ne rate rien en pratique.
//
// ANNONCE au moins une ligne `agent_outputs` avec `output_assemble` renseigné et
//         un statut différent de 'erreur'. Le filtrage se fait CÔTÉ SERVEUR en
//         une seule requête pour toute la liste (cf. getFichesAvecAnnonce) : pas
//         de requête par carte, et le JSON des annonces ne remonte jamais.
//
// PDF     `pdf_generated_at`, colonne dédiée (migration 20260909060000), écrite à
//         chaque génération réussie, TOUS RÔLES CONFONDUS.
//
//         `fields_locked` n'est PAS une preuve de PDF, pour deux raisons qui vont
//         dans le même sens :
//           - le verrou est RÉVERSIBLE. Un admin peut le retirer en service_role
//             (cf. 20260713170000_fiche_lite_field_lock.sql). Un déverrouillage ne
//             veut évidemment pas dire que le PDF n'a jamais existé : le fichier a
//             bien été émis. S'en servir de preuve ferait donc surtout DISPARAÎTRE
//             un badge pour un livrable toujours là — un faux négatif.
//           - le verrou ne concerne que le parcours fiche_lite. Les fiches premium
//             génèrent des PDF sans jamais être verrouillées, elles n'auraient donc
//             jamais de badge.
//         D'où une donnée dédiée, qui ne dit qu'une chose et la dit pour tout le
//         monde.

const rempli = (valeur) => typeof valeur === 'string' && valeur.trim() !== ''

// Ordre d'affichage des badges, du plus attendu au plus optionnel.
export const LIVRABLES = [
  { cle: 'pdf', libelle: 'PDF' },
  { cle: 'annonce', libelle: 'Annonce' },
  { cle: 'guide', libelle: 'Guide d’accès' },
]

export function aGuideGenere(fiche) {
  if (!fiche) return false
  const section = fiche.section_guide_acces
  return (
    rempli(fiche.guide_genere_at) ||
    rempli(section?.guide_genere_at) ||
    rempli(section?.guide_genere)
  )
}

export function aPdfGenere(fiche) {
  // Seule la PRÉSENCE compte : la date n'est jamais affichée, et celles issues de la
  // reprise historique du 09/09/2026 sont approximatives (cf. docs/migrations).
  return rempli(fiche?.pdf_generated_at)
}

// `idsAvecAnnonce` : Set des fiche_id retournés par getFichesAvecAnnonce.
export function livrablesDeFiche(fiche, idsAvecAnnonce) {
  return {
    pdf: aPdfGenere(fiche),
    annonce: Boolean(idsAvecAnnonce?.has?.(fiche?.id)),
    guide: aGuideGenere(fiche),
  }
}

// Liste ordonnée des livrables présents, prête à être parcourue par le rendu.
// Vide = on n'affiche RIEN : ni ligne, ni emplacement réservé.
export function livrablesPresents(fiche, idsAvecAnnonce) {
  const etat = livrablesDeFiche(fiche, idsAvecAnnonce)
  return LIVRABLES.filter(({ cle }) => etat[cle])
}
