// src/components/fiche/FicheWizard.jsx
import { useForm } from '../FormContext'
import { useParams, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

// Import des sections (pour l'instant juste la première)
import FicheForm from './sections/FicheForm'
import SidebarMenu from './SidebarMenu'
import ProgressBar from './ProgressBar'
import FicheLogement from './sections/FicheLogement'
import FicheAvis from './sections/FicheAvis'
import FicheClefs from './sections/FicheClefs'
import FicheAirbnb from './sections/FicheAirbnb'
import FicheBooking from './sections/FicheBooking'
import FicheReglementation from './sections/FicheReglementation'
import FicheExigences from './sections/FicheExigences'
import FicheGestionLinge from './sections/FicheGestionLinge'
import FicheEquipements from './sections/FicheEquipements'
import FicheConsommables from './sections/FicheConsommables'
import FicheVisite from './sections/FicheVisite'
import FicheChambre from './sections/FicheChambre'
import FicheSalleDeBains from './sections/FicheSalleDeBains'
import FicheCuisine1 from './sections/FicheCuisine1'
import FicheCuisine2 from './sections/FicheCuisine2'
import FicheSalonSam from './sections/FicheSalonSam'
import FicheEquipExterieur from './sections/FicheEquipExterieur'
import FicheCommuns from './sections/FicheCommuns'
import FicheTeletravail from './sections/FicheTeletravail'
import FicheBebe from './sections/FicheBebe'
import FicheGuideAcces from './sections/FicheGuideAcces'
import FicheSécurité from './sections/FicheSécurité'
import FicheFinalisation from './sections/FicheFinalisation'



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

  const steps = [
    <FicheForm key="proprietaire" />,
    <FicheLogement key="logement" />,
    <FicheAvis key="avis" />,
    <FicheClefs key="clefs" />,
    <FicheAirbnb key="airbnb" />,
    <FicheBooking key="booking" />, 
    <FicheReglementation key="reglementation" />, 
    <FicheExigences key="exigences" />,  
    <FicheGestionLinge key="linge" />,
    <FicheEquipements key="equipements" />,
    <FicheConsommables key="consommables" />,
    <FicheVisite key="visite" />,
    <FicheChambre key="chambres" />,
    <FicheSalleDeBains key="sdb" />,
    <FicheCuisine1 key="cuisine-1" />,
    <FicheCuisine2 key="cuisine-2" />,
    <FicheSalonSam key="salon-sam" />,
    <FicheEquipExterieur key="exterieur" />,
    <FicheCommuns key="communs" />,
    <FicheTeletravail key="teletravail" />,
    <FicheBebe key="bebe" />,
    <FicheGuideAcces key="guide-acces" />,
    <FicheSécurité key="securite" title="Sécurité" sectionNumber="23" />,
    <FicheFinalisation key="finalisation" />
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