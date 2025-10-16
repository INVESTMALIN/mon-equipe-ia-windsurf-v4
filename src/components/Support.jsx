import { Link, useNavigate } from 'react-router-dom'
import { HelpCircle, Bug, Mail, ChevronDown, ChevronUp, AlertTriangle, Shield, FileText } from 'lucide-react'
import { useState } from 'react'

export default function Support() {
  const navigate = useNavigate() 
  const [openAccordion, setOpenAccordion] = useState(null)
  const [showBugModal, setShowBugModal] = useState(false)
  const [bugForm, setBugForm] = useState({
    email: '',
    name: '',
    page: '',
    description: '',
    expectedBehavior: '',
    errorMessage: '',
    frequency: '',
    device: '',
    browser: '',
    triedRefresh: '',
    priority: '3',
    comments: ''
  })

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  const handleBugFormChange = (field, value) => {
    setBugForm(prev => ({ ...prev, [field]: value }))
  }

  const handleBugSubmit = (e) => {
    e.preventDefault()
    
    const subject = encodeURIComponent('[Bug] Signalement depuis Mon Équipe IA')
    const body = encodeURIComponent(`Bonjour,

SIGNALEMENT DE BUG

CONTACT
Email: ${bugForm.email}
Nom: ${bugForm.name || 'Non renseigné'}

DÉTAILS
Page: ${bugForm.page}
Description: ${bugForm.description}
Attendu: ${bugForm.expectedBehavior}
Erreur: ${bugForm.errorMessage || 'Aucune'}
Fréquence: ${bugForm.frequency}

TECHNIQUE
Appareil: ${bugForm.device}
Navigateur: ${bugForm.browser}
Cache vidé: ${bugForm.triedRefresh}

IMPACT
Priorité: ${bugForm.priority}/5

COMMENTAIRES
${bugForm.comments || 'Aucun'}

Merci !`)

    const mailtoLink = `mailto:julien@invest-malin.com?subject=${subject}&body=${body}`
    
    const link = document.createElement('a')
    link.href = mailtoLink
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setShowBugModal(false)
    setBugForm({
      email: '',
      name: '',
      page: '',
      description: '',
      expectedBehavior: '',
      errorMessage: '',
      frequency: '',
      device: '',
      browser: '',
      triedRefresh: '',
      priority: '3',
      comments: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 md:px-20 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/images/invest-malin-logo.png" 
              alt="Invest Malin Logo" 
              className="h-8"
            />
            <span className="text-xl font-bold text-black">MON ÉQUIPE IA</span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Retour
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-20 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#dbae61] rounded-full mb-6">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Centre d'aide</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Trouvez rapidement l'aide dont vous avez besoin pour utiliser Mon Équipe IA
        </p>
      </section>

      {/* Main Cards Section */}
      <section className="px-6 md:px-20 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* FAQ Card */}
          <Link
            to="/faq"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-[#dbae61] transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <HelpCircle className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Questions fréquentes</h3>
              <p className="text-gray-600 mb-4">
                Consultez notre FAQ pour trouver des réponses aux questions courantes
              </p>
              <span className="text-[#dbae61] font-semibold group-hover:underline">
                Accéder à la FAQ →
              </span>
            </div>
          </Link>

          {/* Bug Report Card */}
          <button
            onClick={() => setShowBugModal(true)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-[#dbae61] transition-all duration-300 group text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                <Bug className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Signaler un bug</h3>
              <p className="text-gray-600 mb-4">
                Un problème technique ? Aidez-nous à améliorer la plateforme
              </p>
              <span className="text-[#dbae61] font-semibold group-hover:underline">
                Signaler un problème →
              </span>
            </div>
          </button>

          {/* Contact Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nous contacter</h3>
              <p className="text-gray-600 mb-4">
                Une question ? Notre équipe vous répond rapidement
              </p>
              <a
                href="mailto:contact@invest-malin.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                Envoyer un email
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Important Information Section */}
      <section className="px-6 md:px-20 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations importantes</h2>
          
          <div className="space-y-4">
            
            {/* Disclaimer IA */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleAccordion('disclaimer')}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <span className="font-semibold text-gray-900 text-left">
                    Utilisation des assistants IA
                  </span>
                </div>
                {openAccordion === 'disclaimer' ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {openAccordion === 'disclaimer' && (
                <div className="px-6 pb-6 text-gray-700 space-y-3">
                  <p>
                    <strong>Les assistants IA sont des outils d'aide à la décision</strong>, mais ils peuvent contenir des erreurs ou approximations.
                  </p>
                  <p>
                    Les réponses fournies ne constituent <strong>pas des conseils juridiques, fiscaux ou professionnels</strong>. Pour toute décision importante, nous vous recommandons de consulter un professionnel qualifié.
                  </p>
                  <p className="text-sm text-gray-600">
                    En utilisant nos assistants IA, vous reconnaissez avoir pris connaissance de ces limitations et acceptez d'utiliser les informations fournies à vos propres risques.
                  </p>
                </div>
              )}
            </div>

            {/* RGPD */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleAccordion('rgpd')}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-gray-900 text-left">
                    Protection de vos données (RGPD)
                  </span>
                </div>
                {openAccordion === 'rgpd' ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {openAccordion === 'rgpd' && (
                <div className="px-6 pb-6 text-gray-700 space-y-3">
                  <p>
                    Vos données personnelles sont traitées conformément au <strong>Règlement Général sur la Protection des Données (RGPD)</strong>.
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>• Vos conversations sont conservées pour améliorer nos services</li>
                    <li>• Après 12 mois, elles sont automatiquement anonymisées</li>
                    <li>• Vous pouvez supprimer votre historique à tout moment depuis votre compte</li>
                    <li>• Vos données ne sont jamais vendues à des tiers</li>
                  </ul>
                  <Link 
                    to="/politique-confidentialite"
                    className="inline-block mt-4 text-[#dbae61] hover:underline font-semibold"
                  >
                    Consulter notre politique de confidentialité →
                  </Link>
                </div>
              )}
            </div>

            {/* CGU */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleAccordion('cgu')}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <span className="font-semibold text-gray-900 text-left">
                    Conditions générales d'utilisation
                  </span>
                </div>
                {openAccordion === 'cgu' ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {openAccordion === 'cgu' && (
                <div className="px-6 pb-6 text-gray-700 space-y-3">
                  <p>
                    En utilisant Mon Équipe IA, vous acceptez nos conditions générales d'utilisation qui définissent :
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>• Les droits et responsabilités des utilisateurs</li>
                    <li>• Les règles d'utilisation de la plateforme</li>
                    <li>• Les conditions d'abonnement et de résiliation</li>
                    <li>• Les limitations de responsabilité</li>
                  </ul>
                  <div className="flex gap-4 mt-4">
                    <Link 
                      to="/conditions-utilisation"
                      className="text-[#dbae61] hover:underline font-semibold"
                    >
                      Lire les CGU →
                    </Link>
                    <Link 
                      to="/mentions-legales"
                      className="text-[#dbae61] hover:underline font-semibold"
                    >
                      Mentions légales →
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 md:px-20 text-sm text-gray-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 Mon Équipe IA. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-gray-700">Accueil</Link>
            <Link to="/mentions-legales" className="hover:text-gray-700">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-gray-700">Confidentialité</Link>
            <Link to="/conditions-utilisation" className="hover:text-gray-700">Conditions d'utilisation</Link>
          </div>
        </div>
      </footer>

      {/* Bug Report Modal */}
      {showBugModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Bug className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Signaler un bug</h2>
              </div>
              <button
                onClick={() => setShowBugModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBugSubmit} className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informations de contact</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse e-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={bugForm.email}
                    onChange={(e) => handleBugFormChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom / Prénom (optionnel)
                  </label>
                  <input
                    type="text"
                    value={bugForm.name}
                    onChange={(e) => handleBugFormChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              {/* Détails du bug */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Détails du bug</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sur quelle page ou assistant as-tu rencontré le problème ? <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={bugForm.page}
                    onChange={(e) => handleBugFormChange('page', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Mon Compte">Mon Compte</option>
                    <option value="Assistant Invest Malin">Assistant Invest Malin</option>
                    <option value="Assistant Juridique">Assistant Juridique</option>
                    <option value="Assistant Négociateur">Assistant Négociateur</option>
                    <option value="Assistant Annonce">Assistant Annonce</option>
                    <option value="Fiche Logement">Fiche Logement</option>
                    <option value="Page d'accueil">Page d'accueil</option>
                    <option value="Connexion / Inscription">Connexion / Inscription</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Décris ce qu'il s'est passé <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={bugForm.description}
                    onChange={(e) => handleBugFormChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                    placeholder="Ex: Quand je clique sur 'Gérer mon abonnement', la page reste vide..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Que devais-tu faire à ce moment-là ? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={bugForm.expectedBehavior}
                    onChange={(e) => handleBugFormChange('expectedBehavior', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                    placeholder="Ex: Je voulais accéder à mon profil pour modifier mes informations..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    As-tu un message d'erreur affiché ?
                  </label>
                  <input
                    type="text"
                    value={bugForm.errorMessage}
                    onChange={(e) => handleBugFormChange('errorMessage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                    placeholder="Ex: Error 404, Impossible de charger..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Le problème se produit à chaque fois ? <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={bugForm.frequency}
                    onChange={(e) => handleBugFormChange('frequency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Oui, à chaque tentative">Oui, à chaque tentative</option>
                    <option value="Parfois">Parfois</option>
                    <option value="Une seule fois">Une seule fois</option>
                  </select>
                </div>
              </div>

              {/* Contexte technique */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Contexte technique</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sur quel appareil ? <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={bugForm.device}
                      onChange={(e) => handleBugFormChange('device', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Ordinateur">Ordinateur</option>
                      <option value="Smartphone">Smartphone</option>
                      <option value="Tablette">Tablette</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quel navigateur ? <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={bugForm.browser}
                      onChange={(e) => handleBugFormChange('browser', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Chrome">Chrome</option>
                      <option value="Safari">Safari</option>
                      <option value="Firefox">Firefox</option>
                      <option value="Edge">Edge</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    As-tu essayé d'actualiser ou de vider le cache ? <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={bugForm.triedRefresh}
                    onChange={(e) => handleBugFormChange('triedRefresh', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Oui, et le problème persiste">Oui, et le problème persiste</option>
                    <option value="Oui, et ça a résolu le problème">Oui, et ça a résolu le problème</option>
                    <option value="Non, pas encore">Non, pas encore</option>
                  </select>
                </div>
              </div>

              {/* Priorité */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Impact</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    À quel point ce bug t'empêche d'utiliser Mon Équipe IA ? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Petit détail</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={bugForm.priority}
                      onChange={(e) => handleBugFormChange('priority', e.target.value)}
                      className="flex-1"
                      style={{ accentColor: '#dbae61' }}
                    />
                    <span className="text-sm text-gray-600">Bloquant</span>
                    <span className="text-lg font-bold text-[#dbae61] w-8 text-center">{bugForm.priority}</span>
                  </div>
                </div>
              </div>

              {/* Commentaires additionnels */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Autres commentaires</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autre chose à signaler ?
                  </label>
                  <textarea
                    value={bugForm.comments}
                    onChange={(e) => handleBugFormChange('comments', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dbae61] focus:border-transparent"
                    placeholder="Informations complémentaires, suggestions..."
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBugModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold rounded-lg transition-colors"
                >
                  Envoyer le signalement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}