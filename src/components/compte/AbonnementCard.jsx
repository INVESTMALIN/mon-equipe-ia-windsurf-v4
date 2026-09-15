import { Link } from 'react-router-dom'
import { CreditCard, AlertCircle } from 'lucide-react'
import { CARD } from './cardClass'

// Carte Abonnement de Mon Équipe IA (rôles user et admin). Bloc DÉPLACÉ tel quel depuis
// MonCompte.jsx (ex-`renderSubscriptionSection`) : même logique, mêmes libellés, même
// bouton « Gérer mon abonnement » vers le portail Stripe. Seule retouche : les corps de
// `case` sont mis entre accolades (lint `no-case-declarations`), sans effet sur le rendu.
//
// Jamais rendue pour un rôle fiche_lite : le parcours concierge n'a ni essai, ni
// abonnement, ni portail Stripe (cf. MonCompte).
export default function AbonnementCard({ loading, userProfile, onManageSubscription }) {
  if (loading) {
    return (
      <div className={CARD}>
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-[#dbae61]" />
          <h2 className="text-xl font-bold text-black">Abonnement</h2>
        </div>
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  const subscriptionStatus = userProfile?.subscription_status || 'free'
  const periodEnd = userProfile?.subscription_current_period_end
  const trialEnd = userProfile?.subscription_trial_end

  // Calculer les jours restants pour le trial
  const getDaysLeft = (endDate) => {
    if (!endDate) return null
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const renderStatusBadge = () => {
    const isCancelled = userProfile?.subscription_cancel_at_period_end

    // Si annulation programmée, afficher badge + alerte
    if (isCancelled && (subscriptionStatus === 'trial' || subscriptionStatus === 'premium')) {
      const endDate = subscriptionStatus === 'trial' ? trialEnd : periodEnd
      const dateStr = endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'bientôt'

      return (
        <div className="space-y-2">
          {/* Badge normal selon le statut */}
          {subscriptionStatus === 'trial' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✨ Essai gratuit ({getDaysLeft(trialEnd)} jour{getDaysLeft(trialEnd) > 1 ? 's' : ''} restant{getDaysLeft(trialEnd) > 1 ? 's' : ''})
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#dbae61] bg-opacity-20 text-[#8b7355]">Premium Actif</span>
          )}

          {/* Alerte annulation */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="text-sm text-orange-800">
              Annulation programmée - Accès jusqu'au {dateStr}
            </span>
          </div>
        </div>
      )
    }

    // Sinon, affichage normal
    switch (subscriptionStatus) {
      case 'free':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Gratuit</span>
      case 'trial': {
        const daysLeft = getDaysLeft(trialEnd)
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✨ Essai gratuit ({daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''})
          </span>
        )
      }
      case 'premium':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#dbae61] bg-opacity-20 text-[#8b7355]">Premium Actif</span>
      case 'expired':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Expiré</span>
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Inconnu</span>
    }
  }

  const renderStatusDetails = () => {
    switch (subscriptionStatus) {
      case 'free': {
        const hasUsedTrial = userProfile?.has_used_trial
        return (
          <div>
            <p className="text-gray-600 mb-4">
              Vous utilisez actuellement la version gratuite avec accès à l'Assistant Invest Malin.
            </p>
            <Link
              to="/upgrade"
              className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
            >
              {hasUsedTrial ? 'Commerncer l\'abonnement' : 'Démarrer l\'essai gratuit 30 jours'}
            </Link>
          </div>
        )
      }

      case 'trial': {
        const daysLeft = getDaysLeft(trialEnd)
        const trialEndDate = trialEnd ? new Date(trialEnd).toLocaleDateString('fr-FR') : 'Non définie'
        const isCancelled = userProfile?.subscription_cancel_at_period_end

        return (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-800 mb-1">🎉 Essai gratuit actif !</h4>
              <p className="text-green-700 text-sm">
                Profitez de tous les assistants premium jusqu'au <strong>{trialEndDate}</strong>
              </p>
              {!isCancelled && daysLeft <= 5 && (
                <p className="text-green-600 text-xs mt-1">
                  💡 Votre abonnement sera automatiquement activé à 19,99€/mois
                </p>
              )}
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><strong>Fin de l'essai :</strong> {trialEndDate}</p>
              {!isCancelled && <p><strong>Puis :</strong> 19,99€/mois</p>}
              {isCancelled && <p><strong>Puis :</strong> Pas de renouvellement (annulation programmée)</p>}
            </div>
            <button
              onClick={onManageSubscription}
              className="bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
            >
              {isCancelled ? 'Réactiver mon abonnement' : 'Gérer mon abonnement'}
            </button>
          </div>
        )
      }

      case 'premium': {
        const premiumEndDate = periodEnd ? new Date(periodEnd).toLocaleDateString('fr-FR') : 'Non définie'

        return (
          <div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><strong>Statut :</strong> Abonnement actif</p>
              <p><strong>Prochaine facturation :</strong> {premiumEndDate}</p>
              <p><strong>Prix :</strong> 19,99€/mois</p>
            </div>
            <button
              onClick={onManageSubscription}
              className="bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
            >
              {userProfile?.subscription_cancel_at_period_end ? 'Réactiver mon abonnement' : 'Gérer mon abonnement'}
            </button>
          </div>
        )
      }

      case 'expired':
        return (
          <div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-800 mb-1">Abonnement expiré</h4>
              <p className="text-red-700 text-sm">
                Votre accès aux assistants premium a été suspendu.
              </p>
            </div>
            <Link
              to="/upgrade"
              className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
            >
              Réactiver Premium
            </Link>
          </div>
        )

      default:
        return (
          <div>
            <p className="text-gray-600 mb-4">
              État de l'abonnement non reconnu. Contactez le support.
            </p>
          </div>
        )
    }
  }

  return (
    <div className={CARD}>
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-[#dbae61]" />
        <h2 className="text-xl font-bold text-black">Abonnement</h2>
      </div>

      <div className="mb-4">
        {renderStatusBadge()}
      </div>

      {renderStatusDetails()}
    </div>
  )
}
