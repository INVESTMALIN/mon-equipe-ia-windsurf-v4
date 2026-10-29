// Assistant Transcription, étape 2 : le fichier est dans R2, on lance la transcription.
// POST { cle, filename } (jeton Supabase) → { job }
// Ordre voulu :
//   1. contrôles (abonnement, propriété de la clé, taille réelle, quota du jour) ;
//   2. copie du fichier vers `traitement/` (l'utilisateur ne peut plus le remplacer),
//      effacement du dépôt ;
//   3. ligne d'historique en état « lancement » AVANT d'appeler AssemblyAI : son
//      rappel ne peut pas arriver sur une ligne absente ;
//   4. lancement AssemblyAI, puis passage en « en cours » avec son identifiant.

import {
  utilisateur, tailleObjet, urlLecture, lancerTranscription, db, WEBHOOK_SECRET, effacerObjet,
  copierObjet, profilAcces, lancementsDuJour, noterLancement,
} from './_lib/transcriptionService.js'
import {
  estCleDe, jobDeCle, cleTraitement, etatSigne, accesAutorise,
  MAX_BYTES, MAX_PAR_JOUR, MESSAGE_EN_COURS, MESSAGE_ERREUR,
} from './_lib/transcription.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await utilisateur(req, res)
  if (!user) return

  const { cle, filename } = req.body || {}
  const job = jobDeCle(cle)
  if (!job || !estCleDe(user.id, cle)) return res.status(400).json({ error: 'Demande invalide' })
  const nom = String(filename || 'fichier').slice(0, 200)

  let lanceeEnBase = false
  const traitement = cleTraitement(user.id, cle)
  try {
    if (!accesAutorise(await profilAcces(user.id))) {
      return res.status(403).json({ error: 'L\'Assistant Transcription est réservé aux abonnés.' })
    }
    if (await db.lire(job)) return res.status(409).json({ error: 'Transcription déjà lancée' })

    const taille = await tailleObjet(cle)
    if (taille === null) return res.status(400).json({ error: 'Fichier introuvable : l\'envoi n\'est pas allé au bout, réessayez.' })
    if (taille > MAX_BYTES) {
      await effacerObjet(cle).catch(() => {})
      return res.status(400).json({ error: 'Le fichier est trop volumineux (1 Go maximum).' })
    }
    if ((await lancementsDuJour(user.id)) >= MAX_PAR_JOUR) {
      await effacerObjet(cle).catch(() => {})
      return res.status(429).json({ error: `Limite de ${MAX_PAR_JOUR} transcriptions par jour atteinte, réessayez demain.` })
    }

    await copierObjet(cle, traitement)
    await effacerObjet(cle)
    await noterLancement(user.id, job)

    const titreLancement = etatSigne(WEBHOOK_SECRET, { etat: 'lancement', aai: '', cle: traitement, job })
    await db.creer({
      user_id: user.id,
      conversation_id: job,
      question: `[Fichier envoyé : ${nom}]`,
      answer: MESSAGE_EN_COURS,
      title: titreLancement,
    })
    lanceeEnBase = true

    const aai = await lancerTranscription({ audioUrl: await urlLecture(traitement), job })
    await db.majSiInchangee(job, titreLancement, {
      title: etatSigne(WEBHOOK_SECRET, { etat: 'en_cours', aai, cle: traitement, job }),
    })
    return res.status(200).json({ job })
  } catch (err) {
    console.error('[transcript-start]', job, err?.message)
    // La ligne existe mais AssemblyAI n'a pas démarré : on la referme en échec.
    if (lanceeEnBase) {
      const ligne = await db.lire(job).catch(() => null)
      if (ligne) {
        await db.majSiInchangee(job, ligne.title, {
          answer: MESSAGE_ERREUR,
          title: etatSigne(WEBHOOK_SECRET, { etat: 'erreur', aai: '', cle: traitement, job }),
        }).catch(() => {})
      }
      await effacerObjet(traitement).catch(() => {})
    }
    return res.status(500).json({ error: 'La transcription n\'a pas pu être lancée, réessayez.' })
  }
}
