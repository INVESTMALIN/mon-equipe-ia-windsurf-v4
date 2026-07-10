// Prédicat de filtrage de la liste des fiches — isolé et pur, pour être testable
// et partagé entre l'affichage et les compteurs d'onglets (une seule source de vérité :
// un compteur ne peut pas diverger de ce qui est réellement listé).

export const FICHE_STATUS_FILTERS = ['Tous', 'Complété', 'Brouillon', 'Archivé']

// `archived_at` : NULL = fiche active, horodatage = fiche rangée.
export const isArchived = (fiche) => Boolean(fiche.archived_at)

// « Archiver, c'est ranger, pas étiqueter » : une fiche archivée n'apparaît QUE sous le
// filtre « Archivé ». Elle est exclue de Tous / Complété / Brouillon, et donc de leurs
// compteurs. Son `statut` d'origine est conservé intact, ce qui lui permet de reprendre
// sa place exacte au désarchivage.
export const matchesFicheFilter = (fiche, filter) =>
  filter === 'Archivé'
    ? isArchived(fiche)
    : !isArchived(fiche) && (filter === 'Tous' || fiche.statut === filter)
