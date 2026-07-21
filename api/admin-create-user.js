import { verifyAdmin, supabaseAdmin } from './_lib/verifyAdmin.js'
import { sendEmail, invitationEmail } from './_lib/sendEmail.js'

// Création d'un compte par l'admin, AVEC choix du monde (deux mondes étanches) :
//   - world 'fiche_lite'     → rôle fiche_lite, démarre à ZÉRO crédit (aucune ligne
//                              ledger, comme par la porte ThriveCart), pas d'abonnement ;
//   - world 'mon_equipe_ia'  → rôle 'user' ou 'admin', abonnement free/premium optionnel.
//
// Le compte ne reçoit PAS de mot de passe : on génère un lien de définition de mot de
// passe (generateLink recovery) et on l'envoie NOUS-MÊMES via Resend (indépendant du
// SMTP Auth). Le service_role bypasse la whitelist de rôle du trigger handle_new_user,
// donc on peut poser 'admin' directement dans le profil.

const APP_URL = process.env.APP_URL || 'https://www.mon-equipe-ia.com'

function addMonths(date, months) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req, res)
  if (!auth) return

  try {
    const {
      email,
      prenom,
      nom,
      world,
      role: reqRole,
      subscription_status,
      months,
      custom_end_date
    } = req.body || {}

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email requis' })
    }
    if (!['fiche_lite', 'mon_equipe_ia'].includes(world)) {
      return res.status(400).json({ error: 'Monde invalide (fiche_lite | mon_equipe_ia)' })
    }

    // Détermine rôle + abonnement selon le monde.
    let role
    let status = 'free'
    let period_end = null

    if (world === 'fiche_lite') {
      role = 'fiche_lite'
      // Pas d'abonnement, pas de crédits (zéro par absence de ligne ledger).
    } else {
      // Monde Mon Équipe IA : user ou admin.
      if (!['user', 'admin'].includes(reqRole)) {
        return res.status(400).json({ error: 'Rôle invalide (user | admin)' })
      }
      role = reqRole
      if (!['free', 'premium'].includes(subscription_status)) {
        return res.status(400).json({ error: 'Statut invalide (free | premium)' })
      }
      status = subscription_status
      if (status === 'premium') {
        if (custom_end_date) {
          const d = new Date(custom_end_date)
          if (Number.isNaN(d.getTime()) || d <= new Date()) {
            return res.status(400).json({ error: "Date d'expiration invalide (doit être dans le futur)" })
          }
          period_end = d.toISOString()
        } else {
          const m = parseInt(months, 10)
          if (!m || m <= 0) {
            return res.status(400).json({ error: 'Durée invalide' })
          }
          period_end = addMonths(new Date(), m).toISOString()
        }
      }
    }

    // 1. Crée l'utilisateur auth SANS mot de passe (défini plus tard via le lien).
    //    email_confirm: true → l'email est marqué confirmé, on va droit à la définition
    //    du mot de passe.
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      email_confirm: true
    })

    if (authErr) {
      console.error('admin-create-user: createUser failed:', authErr)
      return res.status(400).json({ error: authErr.message || 'Erreur création compte auth' })
    }

    const newUserId = authData.user.id

    // 2. Upsert du profil (service_role → bypass whitelist de rôle du trigger).
    const profileData = {
      id: newUserId,
      prenom: prenom?.trim() || null,
      nom: nom?.trim() || null,
      role,
      subscription_status: status,
      subscription_current_period_end: period_end,
      subscription_trial_end: null,
      subscription_cancel_at_period_end: false,
      has_used_trial: false,
      disabled_at: null
    }

    const { error: upsertErr } = await supabaseAdmin
      .from('users')
      .upsert(profileData, { onConflict: 'id' })

    if (upsertErr) {
      console.error('admin-create-user: profile upsert failed, rolling back auth user:', upsertErr)
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      return res.status(500).json({ error: 'Erreur création profil', details: upsertErr.message })
    }

    // 3. Génère le lien de définition de mot de passe (sans envoyer via Auth).
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: { redirectTo: `${APP_URL}/nouveau-mot-de-passe` }
    })

    if (linkErr || !linkData?.properties?.action_link) {
      // Le compte existe mais l'email d'invitation n'a pas pu partir : ne pas rollback
      // (l'admin peut renvoyer l'invitation), mais signaler.
      console.error('admin-create-user: generateLink failed:', linkErr)
      return res.status(200).json({
        user: { id: newUserId, email: authData.user.email, ...profileData },
        email_sent: false,
        warning: "Compte créé, mais le lien d'invitation n'a pas pu être généré. Utilise « Renvoyer l'invitation »."
      })
    }

    // 4. Envoie l'email d'invitation via Resend.
    let email_sent = true
    let warning
    try {
      const tpl = invitationEmail({ actionLink: linkData.properties.action_link, prenom: profileData.prenom })
      await sendEmail({ to: email.trim(), subject: tpl.subject, html: tpl.html, text: tpl.text })
    } catch (mailErr) {
      console.error('admin-create-user: sendEmail failed:', mailErr)
      email_sent = false
      warning = "Compte créé, mais l'email d'invitation n'a pas pu être envoyé. Utilise « Renvoyer l'invitation »."
    }

    return res.status(200).json({
      user: { id: newUserId, email: authData.user.email, ...profileData },
      email_sent,
      warning
    })
  } catch (err) {
    console.error('admin-create-user: unexpected error:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
