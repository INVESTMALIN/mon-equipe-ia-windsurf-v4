// Enveloppe de livraison d'un PDF client-side, et forme de l'écriture qui la trace.
//
// Module PUR : aucune dépendance à pdfmake, à React ou à Supabase. Le rendu lui est
// injecté. C'est ce qui rend testable, sans jamais produire un vrai PDF ni toucher
// une fiche, les quatre issues qui comptent : remise normale, échec immédiat, rendu
// qui dépasse le délai sans jamais aboutir, et remise tardive après ce délai.

export const PDF_RENDU_TIMEOUT_MS = 120000

/**
 * Attend la livraison d'un PDF et trace cette livraison.
 *
 * @param demarrerRendu  (fini) => void — lance le rendu et appelle `fini` QUAND le
 *                       fichier a été remis. Peut lever de façon synchrone.
 * @param onDelivered    appelé depuis `fini`, avant la résolution. C'est le SEUL
 *                       endroit d'où la preuve est écrite.
 * @param timeoutMs      délai au-delà duquel on rend la main à l'interface.
 *
 * La promesse rejette avec une erreur portant `renduEnCours = true` quand le délai
 * expire. Ce délai n'annule PAS le rendu : il ne gouverne que l'affichage. Si le
 * fichier arrive ensuite, `onDelivered` est appelé quand même — un fichier remis en
 * retard reste un fichier remis, et sans cet appel le PDF partirait sans preuve.
 *
 * `onDelivered` n'est appelé qu'UNE fois : `fini` est neutralisé après son premier
 * passage, un rendu qui rappellerait deux fois n'écrirait pas deux preuves.
 */
export function livrerPdf({ demarrerRendu, onDelivered, timeoutMs = PDF_RENDU_TIMEOUT_MS }) {
  return new Promise((resolve, reject) => {
    let livre = false

    const garde = setTimeout(() => {
      if (livre) return
      const echec = new Error('La génération du PDF n’a pas abouti dans le délai imparti.')
      // L'appelant doit savoir que le rendu peut encore aboutir : il ne doit pas
      // relâcher trop tôt les garde-fous posés pour la durée de la génération, ni
      // présenter la situation comme un échec définitif.
      echec.renduEnCours = true
      reject(echec)
    }, timeoutMs)

    const fini = () => {
      if (livre) return
      livre = true
      clearTimeout(garde)
      // `resolve` après un rejet de délai est sans effet : la promesse est déjà
      // réglée. L'écriture, elle, a bien lieu.
      Promise.resolve(onDelivered?.()).then(resolve, resolve)
    }

    try {
      demarrerRendu(fini)
    } catch (e) {
      // Échec synchrone (document invalide, police manquante…) : définitif, le rendu
      // ne rappellera jamais. On rejette sans `renduEnCours`.
      clearTimeout(garde)
      livre = true
      reject(e)
    }
  })
}

// Délai de garde de l'ÉCRITURE de la preuve. Sans rapport avec celui du rendu :
// écrire deux colonnes est une requête courte, pas un calcul. supabase-js n'impose
// aucun délai à ses requêtes — sans cette borne, une écriture qui ne répond jamais
// laisse l'utilisateur devant un voile qu'il ne peut plus quitter, alors que son PDF
// est déjà téléchargé.
export const PDF_ENREGISTREMENT_TIMEOUT_MS = 15000

/**
 * Exécute l'écriture de la preuve en la bornant dans le temps.
 *
 * @param ecrire     (signal) => Promise<{ success, error }> — reçoit un AbortSignal.
 * @param timeoutMs  au-delà, on abandonne et on rend la main.
 *
 * La course est faite ICI et pas seulement via le signal : si l'écriture ignore le
 * signal ou ne se règle jamais, la promesse retournée se règle quand même. Ne rejette
 * jamais — l'appelant n'a qu'un seul chemin à traiter, et une écriture ratée n'est pas
 * une exception, c'est un résultat à afficher.
 */
export function enregistrerAvecDelai({ ecrire, timeoutMs = PDF_ENREGISTREMENT_TIMEOUT_MS }) {
  const controleur = new AbortController()
  return new Promise((resolve) => {
    const garde = setTimeout(() => {
      controleur.abort()
      resolve({ success: false, expire: true, error: 'délai d’enregistrement dépassé' })
    }, timeoutMs)

    Promise.resolve()
      .then(() => ecrire(controleur.signal))
      .then(
        (r) => { clearTimeout(garde); resolve(r || { success: false, error: 'réponse vide' }) },
        (e) => { clearTimeout(garde); resolve({ success: false, error: e?.message || String(e) }) }
      )
  })
}

/**
 * Écrit la preuve et annonce l'état à l'appelant.
 *
 * Le voile ne tombe qu'une fois la persistance CONFIRMÉE : si elle échoue, on passe à
 * un état d'échec explicite plutôt que de disparaître en silence. Sans cela,
 * l'utilisateur croirait tout enregistré alors que le badge PDF — et, côté Lite, le
 * verrou — manquent.
 *
 * @param onEtat  reçoit 'enregistrement' puis 'inactif' ou 'enregistrement_echoue'.
 */
export async function persisterPreuvePdf({ ecrire, onEtat, timeoutMs }) {
  onEtat?.('enregistrement')
  const resultat = await enregistrerAvecDelai({ ecrire, timeoutMs })
  onEtat?.(resultat?.success ? 'inactif' : 'enregistrement_echoue')
  return resultat
}

/**
 * Champs écrits sur la fiche après une génération réussie.
 *
 * `pdf_generated_at` est écrit pour TOUS LES RÔLES : c'est lui, et non le verrou,
 * qui prouve l'existence du PDF. `fields_locked` n'est ajouté que pour la première
 * génération d'un parcours fiche_lite — un premium n'est jamais verrouillé.
 *
 * Les deux champs partent dans le MÊME update : deux requêtes ouvriraient une
 * fenêtre où l'une aboutit sans l'autre.
 */
export function construirePatchPdf({ withLock = false, horodatage = new Date().toISOString() } = {}) {
  return withLock
    ? { pdf_generated_at: horodatage, fields_locked: true }
    : { pdf_generated_at: horodatage }
}
