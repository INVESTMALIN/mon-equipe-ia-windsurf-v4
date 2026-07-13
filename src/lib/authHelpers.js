// Détection d'une inscription qui cible un email DÉJÀ présent en base.
//
// Piège Supabase Auth : pour éviter l'énumération d'emails, un signup sur un
// email existant ne renvoie PAS d'erreur quand la confirmation email est
// activée (notre cas). Supabase répond "success" avec un user factice dont le
// tableau `identities` est VIDE — alors qu'un vrai nouvel email a toujours au
// moins une identité. (À noter : `session` est null aussi bien pour un nouvel
// email que pour un existant, donc ce n'est PAS un discriminant fiable ;
// `identities` vide, si.)
//
// On couvre aussi le cas où la confirmation serait désactivée : Supabase renvoie
// alors une vraie erreur "User already registered".
//
// Fail-safe vers le happy path : au moindre doute (identities absent, forme
// inattendue), on renvoie false pour ne JAMAIS bloquer une inscription légitime.
export function signupIndicatesExistingEmail(data, error) {
  if (error) {
    const msg = (error.message || '').toLowerCase()
    return (
      error.code === 'user_already_exists' ||
      msg.includes('already registered') ||
      msg.includes('already exists') ||
      msg.includes('already been registered')
    )
  }

  const identities = data?.user?.identities
  return Array.isArray(identities) && identities.length === 0
}
