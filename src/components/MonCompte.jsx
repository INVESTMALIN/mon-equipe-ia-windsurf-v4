import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { HelpCircle, User, ArrowLeft, ArrowRight, Users, Lock, LogOut, Mail } from 'lucide-react'
import { supabase } from '../supabaseClient'
import ChangePasswordModal from './ChangePasswordModal'
import EditProfileModal from './EditProfileModal'
import DeleteConversationsModal from './DeleteConversationsModal'
import AbonnementCard from './compte/AbonnementCard'
import CreditsCard from './compte/CreditsCard'
import DonneesCard from './compte/DonneesCard'
import ClotureCompteCard from './compte/ClotureCompteCard'
import { CARD } from './compte/cardClass'
import { CONTACT_EMAIL } from '../lib/compteContact'

// Page compte, route unique /mon-compte pour deux mondes étanches.
//
// Les deux mondes partagent l'authentification mais ne se croisent jamais ; le RÔLE
// décide de tout ce qui s'affiche :
//
//   - fiche_lite (concierge Fiche Logement Lite, crédits) : en-tête blanc et retour au
//     dashboard, carte Crédits, texte de confidentialité propre à ses fiches, support et
//     clôture par email, pied de page aux liens légaux de son univers.
//     Aucune trace de compte gratuit, d'essai, d'abonnement, de portail Stripe,
//     d'assistants ni de conversations — ni en contenu, ni en lien, ni dans une modale.
//
//   - user / admin (Mon Équipe IA) : en-tête noir, carte Abonnement et historique des
//     conversations inchangés, FAQ, pied de page Mon Équipe IA. L'admin garde en plus
//     son accès à l'espace admin.
//
// Socle commun : informations personnelles, mot de passe, données et vie privée,
// support, demande de clôture de compte.
//
// Les blocs « Accès rapide » (liens vers les assistants) et « Maximisez votre
// expérience » (conseils d'usage) ont été retirés pour tous les rôles : c'est de
// l'onboarding et de la navigation, pas de la gestion de compte.
export default function MonCompte() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const loadUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_status, stripe_customer_id, subscription_current_period_end, subscription_trial_end, subscription_cancel_at_period_end, has_used_trial, prenom, nom, role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erreur chargement profil:', error)
      } else {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadUserData = async () => {
      // Plus besoin de vérifier l'auth - ProtectedRoute s'en occupe
      const { data: { session } } = await supabase.auth.getSession()

      // L'utilisateur est forcément connecté ici
      setUser(session.user)
      await loadUserProfile(session.user.id)
    }
    loadUserData()
  }, [loadUserProfile])

  // Le rôle n'est connu qu'après lecture du profil. Tant qu'il ne l'est pas, la page ne
  // rend RIEN qui appartienne à un monde (fail-closed des deux côtés) : ni en-tête, ni
  // carte Abonnement ou Crédits, ni lien d'un univers — cf. l'écran d'attente plus bas.
  const role = userProfile?.role
  const roleKnown = !!role
  const isFicheLite = role === 'fiche_lite'
  const contactEmail = CONTACT_EMAIL

  const handleManageSubscription = async () => {
    try {
      // Récupérer le token d'authentification actuel
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('Erreur: Session expirée, veuillez vous reconnecter')
        return
      }

      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // ← NOUVEAU: Token auth
        },
        body: JSON.stringify({
          return_url: window.location.origin + '/mon-compte'
          // Plus besoin de customer_id - l'API le récupère via le token
        })
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = data.url
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur réseau: ' + error.message)
    }
  }

  const handleDeleteAllConversations = async () => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      alert('✅ Toutes vos conversations ont été supprimées avec succès.')
      setShowDeleteModal(false)

      // Rafraîchir la sidebar de tous les assistants
      window.dispatchEvent(new Event('refreshSidebar'))
    } catch (error) {
      console.error('Erreur suppression conversations:', error)
      alert('❌ Erreur lors de la suppression. Veuillez réessayer ou contacter le support.')
    } finally {
      setLoading(false)
    }
  }

  // Déconnexion vers la porte d'entrée de SON univers. Pour fiche_lite on navigue AVANT
  // le signOut, comme sur le dashboard : ProtectedRoute écoute SIGNED_OUT et renverrait
  // sinon vers /connexion (générique) avant que /connexion-fiche-logement ne s'affiche.
  const handleLogout = async () => {
    if (isFicheLite) {
      navigate('/connexion-fiche-logement')
      await supabase.auth.signOut()
      return
    }
    await supabase.auth.signOut()
    navigate('/connexion')
  }

  // Écran d'attente neutre tant que le rôle n'est pas lu : rien de ce qui suit ne doit
  // s'afficher, même une fraction de seconde, au mauvais public (l'en-tête noir
  // « MON ÉQUIPE IA » devant un concierge, par exemple). Si le profil est illisible, on
  // ne devine PAS un monde par défaut : on le dit et on propose de réessayer.
  if (!roleKnown) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dbae61] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre compte...</p>
          </div>
        ) : (
          <div className={`${CARD} max-w-md text-center`}>
            <p className="text-lg font-semibold text-gray-900 mb-2">Impossible de charger votre compte</p>
            <p className="text-gray-600 mb-6">Vérifiez votre connexion, puis réessayez.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isFicheLite ? (
        // En-tête de l'univers Fiche Logement Lite : même famille que /mes-credits et le
        // dashboard (blanc, titre, retour au tableau de bord). Aucune marque Mon Équipe IA.
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 md:px-20 py-6">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/dashboard"
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Tableau de bord</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Se déconnecter
              </button>
            </div>
          </div>
        </header>
      ) : (
        // En-tête Mon Équipe IA, inchangé.
        <header className="bg-black text-white px-6 md:px-20 py-4">
          <div className="flex items-center justify-between">
            <Link to="/assistants" className="flex items-center gap-3 hover:text-[#dbae61] transition-colors">
              <img
                src="/images/invest-malin-logo.png"
                alt="Invest Malin Logo"
                className="h-8"
              />
              <span className="text-lg font-bold">MON ÉQUIPE IA</span>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                to="/assistants"
                className="flex items-center gap-2 text-white hover:text-[#dbae61] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Retour</span>
              </Link>

              <button
                onClick={handleLogout}
                className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-6 md:px-20 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Mon compte</h1>
          <p className="text-gray-600">
            {isFicheLite
              ? 'Gérez vos informations, votre mot de passe et vos crédits'
              : 'Gérez vos informations et votre abonnement'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Informations personnelles (socle commun) */}
          <div className={CARD}>
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#dbae61]" />
              <h2 className="text-xl font-bold text-black">Informations</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Prénom</label>
                  <p className="text-gray-900 font-medium break-words">{userProfile?.prenom || 'Non renseigné'}</p>
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nom</label>
                  <p className="text-gray-900 font-medium break-words">{userProfile?.nom || 'Non renseigné'}</p>
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                <p className="text-gray-900 font-medium break-all">{user?.email || 'Chargement...'}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mot de passe</label>
                <p className="text-gray-400 font-mono text-sm">••••••••••••</p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  Modifier les informations
                </button>
                {/* Accès direct au mot de passe : un clic au lieu de deux (il reste aussi
                    accessible depuis la fenêtre de modification). */}
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Modifier le mot de passe
                </button>
              </div>
            </div>
          </div>

          {/* Deuxième carte selon le monde : Crédits (fiche_lite) ou Abonnement (Mon
              Équipe IA). */}
          {isFicheLite ? (
            <CreditsCard />
          ) : (
            <AbonnementCard
              loading={loading}
              userProfile={userProfile}
              onManageSubscription={handleManageSubscription}
            />
          )}
        </div>

        {/* Section Espace admin (visible uniquement pour les admins) */}
        {userProfile?.role === 'admin' && (
          <div className={`mt-12 ${CARD}`}>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-[#dbae61]" />
              <h2 className="text-xl font-bold text-black">Espace admin</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Vous avez accès à l'espace administrateur. Gérez les comptes utilisateurs, leurs abonnements et leurs accès.
            </p>

            <Link
              to="/admin/users"
              className="inline-block bg-[#dbae61] hover:bg-[#c49a4f] text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
            >
              Gérer les utilisateurs
            </Link>
          </div>
        )}

        {/* Données et vie privée : cadre commun, contenu par monde. */}
        <div className="mt-12">
          <DonneesCard
            isFicheLite={isFicheLite}
            contactEmail={contactEmail}
            onDeleteClick={() => setShowDeleteModal(true)}
            deleting={loading}
          />
        </div>

        {/* Demande de clôture de compte (socle commun) : un mailto vers l'adresse de contact
            du monde de l'utilisateur, aucune mutation. */}
        <div className="mt-8">
          <ClotureCompteCard role={role} email={user?.email} />
        </div>

        {/* Support : FAQ pour Mon Équipe IA (elle parle d'essai, d'abonnement et
            d'assistants), email pour Fiche Logement Lite (l'aide flottante du parcours
            est déjà présente en bas à droite de cette page). */}
        <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-200">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-4">
              <HelpCircle className="w-12 h-12 text-[#dbae61] mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Une question ?
            </h3>
            {isFicheLite ? (
              <>
                <p className="text-gray-600 mb-6">
                  Le bouton d'aide en bas à droite explique le parcours, les crédits et la génération
                  de vos annonces. Pour tout le reste, écrivez-nous : nous vous répondons rapidement.
                </p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-6 py-3 rounded-lg border-2 border-gray-200 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Nous écrire
                </a>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Consultez notre foire aux questions pour trouver rapidement des réponses sur votre compte, les assistants IA, et bien plus encore.
                </p>
                <Link
                  to="/faq"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-6 py-3 rounded-lg border-2 border-gray-200 transition-colors"
                >
                  Accéder à la FAQ
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Modal changement mot de passe */}
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />

        {/* Modal édition profil. `onPortalClick` (portail Stripe) n'est passé QUE hors
            fiche_lite : sans lui, le bouton « Gérer mon abonnement » n'existe pas. */}
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
          profile={userProfile}
          onPasswordClick={() => {
            setShowEditModal(false)
            setShowPasswordModal(true)
          }}
          onPortalClick={isFicheLite ? undefined : handleManageSubscription}
          onSaved={() => { if (user?.id) loadUserProfile(user.id) }}
        />

        {/* Modal suppression conversations (Mon Équipe IA uniquement : le bouton qui
            l'ouvre n'est pas rendu pour fiche_lite) */}
        <DeleteConversationsModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAllConversations}
          loading={loading}
        />

      </div>

      {/* Footer par monde. pb-24 : réserve la zone du bouton d'aide flottant (parcours
          Fiche Logement) pour qu'il ne recouvre pas les liens du footer sur mobile. */}
      <footer className="bg-white border-t border-gray-200 py-8 pb-24 px-6 md:px-20 text-sm text-gray-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {isFicheLite ? (
            <>
              <p>© {new Date().getFullYear()} Invest Malin</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/fiche-logement" className="hover:text-gray-700">Accueil</Link>
                <Link to="/mentions-legales" className="hover:text-gray-700">Mentions légales</Link>
                <Link to="/politique-confidentialite" className="hover:text-gray-700">Confidentialité</Link>
                <Link to="/conditions-utilisation" className="hover:text-gray-700">CGU</Link>
                <Link to="/conditions-vente" className="hover:text-gray-700">CGV</Link>
              </div>
            </>
          ) : (
            <>
              <p>© 2025 Mon Équipe IA. Tous droits réservés.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/" className="hover:text-gray-700">Accueil</Link>
                <Link to="/mentions-legales" className="hover:text-gray-700">Mentions légales</Link>
                <Link to="/politique-confidentialite" className="hover:text-gray-700">Confidentialité</Link>
                <Link to="/conditions-utilisation" className="hover:text-gray-700">Conditions d'utilisation</Link>
              </div>
            </>
          )}
        </div>
      </footer>
    </div>
  )
}
