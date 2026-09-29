// src/lib/storesHistorique.js
//
// Ancienne case « Stores » des chambres (remplacée par les cases détaillées de Fiche
// Logement, #74). Elle n'est plus affichée que dans les chambres où elle a été vue
// cochée depuis l'ouverture de la section Chambres :
//   - un décochage ne la fait pas disparaître sous le doigt du concierge ;
//   - au prochain chargement, elle ne revient que si elle est toujours cochée.
// Aucune donnée n'est modifiée ni convertie (manuel ou électrique ? on ne sait pas).
//
// La mémoire est rattachée à l'id de la fiche : le wizard recharge une autre fiche
// (?id=A → ?id=B) sans démonter la section, sinon les chambres de A fuiraient sur B.

const CLE = 'equipements_stores'

export const storesHistoriqueInitial = (ficheId) => ({ ficheId, vus: new Set() })

// Renvoie `prev` inchangé s'il n'y a rien de nouveau (évite une boucle de rendus).
export function majStoresHistorique(prev, ficheId, chambres) {
  const cochees = Object.keys(chambres || {}).filter((key) => chambres[key]?.[CLE] === true)
  if (prev.ficheId !== ficheId) return { ficheId, vus: new Set(cochees) }
  if (cochees.every((key) => prev.vus.has(key))) return prev
  return { ficheId, vus: new Set([...prev.vus, ...cochees]) }
}

export function afficherStoresHistorique(historique, ficheId, chambres, chambreKey) {
  if (chambres?.[chambreKey]?.[CLE] === true) return true
  return historique.ficheId === ficheId && historique.vus.has(chambreKey)
}
