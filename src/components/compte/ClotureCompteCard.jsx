import { UserX, Mail } from 'lucide-react'
import { buildClotureMailto } from '../../lib/compteContact'
import { CARD } from './cardClass'

// Demande de clôture de compte, visible dans les deux mondes.
//
// Un simple lien `mailto:` vers l'adresse de contact (unique, cf. lib/compteContact),
// objet et corps préremplis avec le produit et l'email du compte. Aucun appel réseau,
// aucune suppression, aucune désactivation, aucune écriture : la demande est lue et
// traitée par un humain.
// La suppression automatique de compte fera l'objet d'un chantier dédié.
export default function ClotureCompteCard({ role, email }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-3 mb-6">
        <UserX className="w-6 h-6 text-[#dbae61]" />
        <h2 className="text-xl font-bold text-black">Clôturer mon compte</h2>
      </div>

      <p className="text-gray-700 leading-relaxed mb-6">
        Vous souhaitez fermer votre compte ? Envoyez-nous une demande par email : un membre de
        l'équipe la traite personnellement et revient vers vous. Rien n'est supprimé
        automatiquement.
      </p>

      <a
        href={buildClotureMailto({ role, email })}
        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
      >
        <Mail className="w-4 h-4" />
        Demander la clôture de mon compte
      </a>
    </div>
  )
}
