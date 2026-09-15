// Canal de contact de la page compte.
//
// UNE seule adresse pour tous les rôles et tous les produits : `invest-malin.com` est
// le seul domaine du groupe qui reçoive réellement du courrier (enregistrement MX
// Google Workspace). `mon-equipe-ia.com` et `invest-malin.fr` n'en ont aucun : les
// adresses `contact@mon-equipe-ia.com`, `dpo@mon-equipe-ia.com`, `support@invest-malin.fr`
// qui traînaient dans l'application étaient des impasses. Arbitrage de Julien (15/09/2026,
// PR #66) : `contact@invest-malin.com` partout. Ne pas réintroduire une adresse par monde
// sans avoir vérifié qu'elle reçoit du courrier.
//
// La demande de clôture est un simple `mailto:` avec objet et corps préremplis.
// Elle n'exécute AUCUNE suppression, désactivation ni mutation de données : c'est
// une demande adressée à un humain, qui la traite à la main. Le produit est nommé
// dans l'objet pour que le support sache d'emblée de quel monde vient la demande.

export const CONTACT_EMAIL = 'contact@invest-malin.com'

export function produitForRole(role) {
  return role === 'fiche_lite' ? 'Fiche Logement Lite' : 'Mon Équipe IA'
}

// Lien mailto de la demande de clôture. `email` est l'email du compte connecté : c'est
// la seule information nécessaire pour retrouver le compte côté support.
export function buildClotureMailto({ role, email }) {
  const produit = produitForRole(role)
  const subject = `Demande de clôture de compte - ${produit}`
  const body = [
    'Bonjour,',
    '',
    'Je souhaite demander la clôture de mon compte.',
    '',
    `Email du compte : ${email || ''}`,
    `Produit : ${produit}`,
    '',
    'Merci de me confirmer la prise en compte de ma demande.',
  ].join('\n')
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
