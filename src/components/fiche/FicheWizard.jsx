// src/components/fiche/FicheWizard.jsx
import { useForm } from '../FormContext'
import { useParams, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

// Import des sections (pour l'instant juste la première)
import FicheForm from './sections/FicheForm'
import SidebarMenu from './SidebarMenu'
import ProgressBar from './ProgressBar'
import FicheLogement from './sections/FicheLogement'

// Composant placeholder pour les sections pas encore créées
function PlaceholderSection({ title, sectionNumber }) {
  const { next, back, currentStep, totalSteps, handleSave, saveStatus } = useForm()
  
  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        {/* Barre de progression en haut */}
        <ProgressBar />
        
        {/* Contenu principal */}
        <div className="flex-1 p-6 bg-gray-100">
          {/* Messages sauvegarde */}
          {saveStatus.saving && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              ⏳ Sauvegarde en cours...
            </div>
          )}
          {saveStatus.saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              ✅ Sauvegardé avec succès !
            </div>
          )}
          {saveStatus.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              ❌ {saveStatus.error}
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">{title}</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">{sectionNumber}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
                <p className="text-gray-600 mb-6">
                  Cette section sera implémentée prochainement.
                </p>
                <p className="text-sm text-gray-500">
                  Section {currentStep + 1} sur {totalSteps}
                </p>
              </div>
            </div>
            
            {/* Boutons navigation */}
            <div className="mt-8 flex justify-between items-center">
              <button 
                onClick={back} 
                disabled={currentStep === 0}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Retour
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saveStatus.saving}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {saveStatus.saving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
                
                <button 
                  onClick={next}
                  disabled={currentStep === totalSteps - 1}
                  className="flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FicheWizard() {
  const { currentStep, sections, loadFicheData } = useForm()
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  // 🔥 Chargement des données si ID présent
  useEffect(() => {
    const ficheId = id || searchParams.get('id')
    
    if (ficheId) {
      console.log('FicheWizard - Chargement fiche ID:', ficheId)
      loadFicheData(ficheId)
    }
  }, [id, searchParams, loadFicheData])

  // 🔥 Définition des sections (étendre au fur et à mesure)
  const steps = [
    <FicheForm key="proprietaire" />,
    <FicheLogement key="logement" title="Logement" sectionNumber="2" />,
    <PlaceholderSection key="avis" title="Avis" sectionNumber="3" />,
    <PlaceholderSection key="clefs" title="Clefs" sectionNumber="4" />,
    <PlaceholderSection key="airbnb" title="Airbnb" sectionNumber="5" />,
    <PlaceholderSection key="booking" title="Booking" sectionNumber="6" />,
    <PlaceholderSection key="reglementation" title="Réglementation" sectionNumber="7" />,
    <PlaceholderSection key="exigences" title="Exigences" sectionNumber="8" />,
    <PlaceholderSection key="linge" title="Gestion Linge" sectionNumber="9" />,
    <PlaceholderSection key="equipements" title="Équipements" sectionNumber="10" />,
    <PlaceholderSection key="consommables" title="Consommables" sectionNumber="11" />,
    <PlaceholderSection key="visite" title="Visite" sectionNumber="12" />,
    <PlaceholderSection key="chambres" title="Chambres" sectionNumber="13" />,
    <PlaceholderSection key="sdb" title="Salle de Bains" sectionNumber="14" />,
    <PlaceholderSection key="cuisine-1" title="Cuisine 1" sectionNumber="15" />,
    <PlaceholderSection key="cuisine-2" title="Cuisine 2" sectionNumber="16" />,
    <PlaceholderSection key="salon-sam" title="Salon SAM" sectionNumber="17" />,
    <PlaceholderSection key="exterieur" title="Équip. Extérieur" sectionNumber="18" />,
    <PlaceholderSection key="communs" title="Communs" sectionNumber="19" />,
    <PlaceholderSection key="teletravail" title="Télétravail" sectionNumber="20" />,
    <PlaceholderSection key="bebe" title="Bébé" sectionNumber="21" />,
    <PlaceholderSection key="guide-acces" title="Guide Accès" sectionNumber="22" />,
    <PlaceholderSection key="securite" title="Sécurité" sectionNumber="23" />
  ]

  // Vérification de sécurité
  if (currentStep < 0 || currentStep >= steps.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Étape invalide</h2>
          <p className="text-gray-600">Étape {currentStep + 1} non trouvée</p>
        </div>
      </div>
    )
  }

  return steps[currentStep]
}