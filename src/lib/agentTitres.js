// src/lib/agentTitres.js
//
// Dérivation PURE du titre affiché en tête des cartes d'agent (Annonce, Guide d'accès)
// à partir des résultats DÉJÀ persistés. Aucun appel, aucune génération : si les données
// ne contiennent pas de titre exploitable, on renvoie '' et la carte n'affiche pas de
// titre — jamais un titre inventé.
//
// Séparé des composants (fiche/AgentCard.jsx, fiche/AnnonceAgentCard.jsx) pour deux
// raisons : le Fast Refresh de Vite se casse sur un fichier qui exporte à la fois des
// composants et des fonctions, et ces fonctions se testent en Node sans navigateur
// (tests/agentTitres.test.mjs).

export const PLATEFORME_LABEL = { airbnb: 'Airbnb', booking: 'Booking' }

const propre = (v) => (v == null ? '' : String(v)).trim()

/**
 * Titre enregistré de l'annonce pour la plateforme affichée.
 *
 * Chaque ligne d'agent_outputs ne porte que la clé de SA plateforme (`airbnb` ou
 * `booking`) : lire par `plateforme` garantit que le titre correspond au sélecteur.
 *   - Airbnb  : première proposition non vide de `airbnb.titres[]` ;
 *   - Booking : `booking.nom`, le nom de l'hébergement tenant lieu de titre.
 */
export function titreAnnonce(output, plateforme) {
  if (!output) return ''
  if (plateforme === 'airbnb') {
    const titres = Array.isArray(output.airbnb?.titres) ? output.airbnb.titres : []
    return titres.map(propre).find(Boolean) || ''
  }
  return propre(output.booking?.nom)
}

// Amorces d'une phrase conversationnelle plutôt que d'un titre. Le moteur du guide
// répond parfois par un préambule (« Je vais analyser… », « Voici… ») avant le guide
// lui-même, et il arrive qu'une réponse de clarification soit enregistrée telle quelle.
const AMORCES_CONVERSATION = /^(je|j['’]|vous|voici|voilà|bonjour|merci|d['’]accord|ok\b)/i

/**
 * Titre exploitable d'un guide d'accès, s'il en existe un dans le texte enregistré.
 *
 * Le guide est un texte libre sans structure garantie. On ne retient la première
 * ligne non vide comme titre QUE si elle en a la forme :
 *   - débarrassée des marqueurs de liste ou de titre (#, -, *, •, >) ;
 *   - courte (80 caractères au plus) ;
 *   - sans ponctuation finale de phrase (. ! ?) ;
 *   - ne commençant pas par une amorce conversationnelle.
 * Sinon '' : la carte se contente du message « prêt », sans inventer.
 *
 * Une ligne entièrement en capitales est ramenée en casse de phrase pour l'affichage
 * (le serif en capitales est illisible) ; c'est une transformation de présentation,
 * le texte enregistré n'est pas touché.
 */
export function titreGuide(texte) {
  const premiere = String(texte || '').split(/\r?\n/).map((l) => l.trim()).find(Boolean) || ''
  const nettoye = premiere.replace(/^[#\-*•>\s]+/, '').replace(/[\s:]+$/, '').trim()
  if (!nettoye || nettoye.length > 80) return ''
  if (/[.!?]$/.test(nettoye)) return ''
  if (AMORCES_CONVERSATION.test(nettoye)) return ''
  const toutEnCapitales = nettoye === nettoye.toUpperCase() && /[A-ZÀ-Ý]/.test(nettoye)
  if (toutEnCapitales) {
    const bas = nettoye.toLowerCase()
    return bas.charAt(0).toUpperCase() + bas.slice(1)
  }
  return nettoye
}
