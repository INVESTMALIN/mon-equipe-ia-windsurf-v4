// Configuration partagée des fonctions serverless.
//
// Ce module existe pour deux raisons :
//
// 1. L'URL publique de l'application était répétée en dur dans cinq fichiers
//    (`https://www.mon-equipe-ia.com`). Sur un environnement de staging, chacune de ces
//    occurrences renvoyait l'utilisateur vers la PRODUCTION au beau milieu d'un parcours
//    de paiement. Une seule définition, surchargeable par environnement.
//
// 2. Les identifiants de produit et de prix de l'abonnement étaient écrits en dur. Le
//    sandbox et le live sont deux comptes Stripe DISTINCTS : ces identifiants y sont
//    différents, donc le parcours abonnement était par construction intestable ailleurs
//    qu'en production. Ils viennent maintenant de l'environnement.

// Défaut volontairement conservé : sans lui, un environnement où APP_URL n'est pas
// définie construirait des URLs `undefined/mon-compte`. Le défaut vaut la production,
// donc le comportement est strictement identique à l'existant quand la variable est
// absente. Ce n'est pas un secret, juste l'adresse publique du site.
export const APP_URL = process.env.APP_URL || 'https://www.mon-equipe-ia.com'

// Échoue au CHARGEMENT du module, pas au premier appel : on veut qu'une configuration
// incomplète soit visible au démarrage (Railway : healthcheck en échec, donc l'ancien
// conteneur reste en ligne) plutôt qu'à la première requête d'un vrai utilisateur.
export function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. ` +
      `Elle doit être définie sur chaque environnement (les valeurs diffèrent entre le ` +
      `compte Stripe sandbox et le compte live).`
    )
  }
  return value
}
