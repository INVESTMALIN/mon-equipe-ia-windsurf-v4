// Détection du customer Stripe appartenant à l'AUTRE compte.
//
// Le sandbox et le live sont deux comptes distincts, alors que la base Supabase est
// partagée et ne stocke qu'UN `stripe_customer_id` par utilisateur. Un identifiant créé
// dans un compte est donc introuvable dans l'autre, et Stripe répond `resource_missing`
// sur le paramètre `customer`.
//
// Ce module ne fait que NOMMER cette situation. Il ne la corrige pas, volontairement :
// recréer le customer écraserait en base l'identifiant de l'autre compte. Sur le parcours
// crédits c'est acceptable et déjà en place ; sur les parcours abonnement et portail, cela
// remplacerait le customer LIVE d'un utilisateur réel par un customer sandbox — donc la
// perte du lien vers son abonnement payant. Le stockage d'un identifiant par compte est
// une évolution de schéma, hors périmètre de ce portage (voir la PR).
//
// À la place, ces deux parcours répondent une erreur explicite : le mode de défaillance
// devient diagnosticable au lieu d'un 500 opaque.

export function isCustomerFromOtherStripeAccount(err) {
  return err?.code === 'resource_missing' && err?.param === 'customer'
}

// 409 et non 500 : la requête est valide, c'est l'état stocké qui est incompatible avec
// le compte Stripe courant. Aucune donnée n'est modifiée.
export const OTHER_ACCOUNT_STATUS = 409

export const OTHER_ACCOUNT_BODY = {
  error: "Le client Stripe enregistré appartient à un autre compte Stripe (sandbox / live).",
  hint: "Utiliser un compte de test dédié au sandbox, jamais un utilisateur réel : sa correspondance Stripe live serait perdue.",
  code: 'stripe_customer_account_mismatch',
}
