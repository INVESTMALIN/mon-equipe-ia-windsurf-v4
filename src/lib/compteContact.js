// Canal de contact de la page compte, par monde.
//
// Les deux univers partagent l'authentification Supabase mais pas leur adresse de
// contact : un concierge Fiche Logement Lite écrit à Invest Malin (adresse déjà
// utilisée par l'aide flottante, les CGV et les mentions légales), un utilisateur
// Mon Équipe IA écrit à l'adresse de la FAQ Mon Équipe IA. Un rôle ne doit jamais
// voir l'adresse de l'autre monde.
//
// La demande de clôture est un simple `mailto:` avec objet et corps préremplis.
// Elle n'exécute AUCUNE suppression, désactivation ni mutation de données : c'est
// une demande adressée à un humain, qui la traite à la main.

export const CONTACT_EMAIL_FICHE_LITE = 'contact@invest-malin.com'
export const CONTACT_EMAIL_MON_EQUIPE_IA = 'contact@mon-equipe-ia.com'

export function contactEmailForRole(role) {
  return role === 'fiche_lite' ? CONTACT_EMAIL_FICHE_LITE : CONTACT_EMAIL_MON_EQUIPE_IA
}

// Lien mailto de la demande de clôture. `email` est l'email du compte connecté : c'est
// la seule information nécessaire pour retrouver le compte côté support.
export function buildClotureMailto({ role, email }) {
  const produit = role === 'fiche_lite' ? 'Fiche Logement Lite' : 'Mon Équipe IA'
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
  return `mailto:${contactEmailForRole(role)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
