import { ArrowLeft, ArrowRight, Save } from 'lucide-react'
import { useForm } from '../FormContext'

export default function NavigationButtons() {
  const { 
    next, 
    back, 
    currentStep, 
    totalSteps, 
    handleSave,
    saveStatus
  } = useForm()

  const handleSaveClick = async () => {
    await handleSave()
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      {/* Messages de sauvegarde */}
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

      {/* Boutons navigation - style exact de FicheForm */}
      <div className="flex justify-between items-center">
        <button 
          onClick={back} 
          disabled={currentStep === 0}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveClick}
            disabled={saveStatus.saving}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saveStatus.saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
          
          <button 
            onClick={next}
            disabled={currentStep === totalSteps - 1}
            className="flex items-center gap-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}