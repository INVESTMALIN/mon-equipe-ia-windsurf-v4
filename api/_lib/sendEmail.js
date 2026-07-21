// Envoi d'emails transactionnels via Resend, depuis le domaine vérifié de l'app
// (im.outil-conciergerie.com). On envoie NOUS-MÊMES (au lieu du mailer Auth de Supabase)
// pour : ne pas dépendre de la config SMTP Auth, et sortir ces mails du domaine vérifié
// (meilleure délivrabilité / moins de spam).
//
// Le fichier commence par `_` → ignoré par Vercel comme fonction serverless (helper).

const RESEND_API_KEY = process.env.RESEND_API_KEY
// Expéditeur surchargeable par env, défaut sur le domaine vérifié.
const EMAIL_FROM = process.env.EMAIL_FROM || 'Mon Équipe IA <no-reply@im.outil-conciergerie.com>'

/**
 * Envoie un email via Resend. Lève une erreur si la clé manque ou si Resend répond
 * en erreur, pour que l'endpoint appelant remonte un échec explicite.
 * @param {{ to: string, subject: string, html: string, text?: string }} params
 * @returns {Promise<{ id: string }>}
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY manquante (env Vercel)')
  }
  if (!to || !subject || !html) {
    throw new Error('sendEmail: to, subject et html sont requis')
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html, text })
  })

  if (!res.ok) {
    let detail = ''
    try { detail = JSON.stringify(await res.json()) } catch { detail = await res.text().catch(() => '') }
    throw new Error(`Resend a répondu ${res.status}: ${detail}`)
  }

  return res.json()
}

// ───────────────────── Gabarits ─────────────────────

// Échappe le HTML : prenom vient d'une saisie utilisateur (EditProfileModal) et est
// injecté dans le corps des emails — on neutralise toute balise.
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Enveloppe HTML minimale et sobre, aux couleurs de la marque (#dbae61).
function wrap(title, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <h1 style="font-size:20px;color:#1a1a1a;margin:0 0 16px">${title}</h1>
    ${bodyHtml}
    <p style="font-size:12px;color:#999;margin-top:32px">Mon Équipe IA — Invest Malin</p>
  </div></body></html>`
}

function button(href, label) {
  return `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;background:#dbae61;color:#fff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:8px">${label}</a></p>
  <p style="font-size:12px;color:#666">Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br><span style="word-break:break-all">${href}</span></p>`
}

/** Invitation à définir son mot de passe (compte créé par l'admin). */
export function invitationEmail({ actionLink, prenom }) {
  const hello = prenom ? `Bonjour ${esc(prenom)},` : 'Bonjour,'
  return {
    subject: 'Votre accès à Mon Équipe IA',
    html: wrap('Bienvenue sur Mon Équipe IA', `
      <p style="font-size:14px;line-height:1.5">${hello}</p>
      <p style="font-size:14px;line-height:1.5">Un compte vient d'être créé pour vous. Cliquez ci-dessous pour définir votre mot de passe et accéder à votre espace.</p>
      ${button(actionLink, 'Définir mon mot de passe')}
    `),
    text: `${hello}\n\nUn compte vient d'être créé pour vous. Définissez votre mot de passe : ${actionLink}`
  }
}

/** Renvoi du lien de confirmation d'email. */
export function confirmationEmail({ actionLink, prenom }) {
  const hello = prenom ? `Bonjour ${esc(prenom)},` : 'Bonjour,'
  return {
    subject: 'Confirmez votre adresse email',
    html: wrap('Confirmez votre email', `
      <p style="font-size:14px;line-height:1.5">${hello}</p>
      <p style="font-size:14px;line-height:1.5">Pour activer votre accès, confirmez votre adresse email :</p>
      ${button(actionLink, 'Confirmer mon email')}
    `),
    text: `${hello}\n\nConfirmez votre adresse email : ${actionLink}`
  }
}

/** Renvoi du lien de réinitialisation de mot de passe. */
export function resetEmail({ actionLink, prenom }) {
  const hello = prenom ? `Bonjour ${esc(prenom)},` : 'Bonjour,'
  return {
    subject: 'Réinitialisez votre mot de passe',
    html: wrap('Réinitialisation du mot de passe', `
      <p style="font-size:14px;line-height:1.5">${hello}</p>
      <p style="font-size:14px;line-height:1.5">Vous pouvez définir un nouveau mot de passe en cliquant ci-dessous :</p>
      ${button(actionLink, 'Réinitialiser mon mot de passe')}
    `),
    text: `${hello}\n\nRéinitialisez votre mot de passe : ${actionLink}`
  }
}
