// Jetons visuels de l'univers « Fiche Logement + Assistant IA ».
//
// SOURCE UNIQUE de la palette et des styles de champs partagés par les trois
// surfaces publiques de cet univers :
//   /fiche-logement               (landing)
//   /inscription-fiche-logement   (inscription dédiée fiche_lite)
//   /connexion-fiche-logement     (connexion, variante « fiche » de Login)
//
// Séparé des composants (FicheLogementBrand.jsx) pour que le Fast Refresh de Vite
// continue de fonctionner sur ce module : un fichier qui exporte à la fois des
// composants et des constantes casse le rechargement à chaud.
//
// L'univers général Mon Équipe IA (Home, /connexion, /inscription) n'importe rien
// d'ici : les deux identités restent volontairement étanches.

// Palette relevée sur la maquette de référence. Seule exception : l'or, aligné sur
// le doré de marque #dbae61 utilisé partout ailleurs dans Mon Équipe IA plutôt que
// sur le #d1a84e de la maquette (écart imperceptible, cohérence de marque gagnée).
//
// ⚠️ ARBITRAGE ASSUMÉ (09/09/2026, PR #61) — limite WCAG connue et acceptée.
// `goldDeep` sur les fonds clairs n'atteint pas le ratio de contraste 4.5:1 exigé
// pour du petit texte : 3.29:1 sur `paper`, 2.84:1 sur `cream` (`muted` sur `cream`
// est à 4.03:1, même cas). Sur fond `ink` en revanche, goldDeep est à 4.92:1.
// La palette est conservée TELLE QUELLE, conformément à la direction visuelle
// validée : ce n'est pas un oubli. Ne pas « corriger » ces valeurs sans arbitrage
// de Julien — un doré à #7d5a1c passerait partout (5.65:1 / 4.87:1) mais changerait
// l'identité des trois écrans de l'univers.
export const FL = {
  paper: '#f6f3eb',
  cream: '#ebe2cf',
  ink: '#171714',
  inkSoft: '#20201c',
  inkLift: '#2a2a25',
  gold: '#dbae61',
  goldDeep: '#a87f34',
  goldLight: '#f0d98e',
  muted: '#6f6d65',
  line: 'rgba(23, 23, 20, 0.12)',
  lineDark: 'rgba(240, 217, 142, 0.16)',
}

// Deux familles, deux rôles. Le sans (Montserrat, déjà chargé par l'app) porte les
// titres « produit » ; le serif (`font-serif`, pile système) porte les titres
// éditoriaux et l'accent du hero.
export const DISPLAY_SANS = 'font-extrabold tracking-[-0.035em] leading-[0.95]'
export const DISPLAY_SERIF = 'font-serif font-normal tracking-[-0.01em] leading-[1.1]'

// Champ de formulaire de l'univers : fond blanc, focus doré.
export const AUTH_FIELD_CLASS =
  'w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-[#171714] placeholder:text-[#a8a49a] transition-colors focus:outline-none focus:border-[#dbae61] focus:ring-1 focus:ring-[#dbae61]'

// Bouton de soumission de l'univers : pavé encre pleine largeur.
export const AUTH_SUBMIT_CLASS =
  'w-full rounded-xl bg-[#171714] px-6 py-3.5 font-bold text-white transition-colors hover:bg-[#2a2a25] disabled:cursor-not-allowed disabled:bg-[#8d8a82] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#dbae61]'
