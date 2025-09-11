// src/components/fiche/ProgressBar.jsx
import { useForm } from '../FormContext'

export default function ProgressBar() {
  const { currentStep, totalSteps, sections } = useForm()
  
  const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100)
  
  return (
    <div className="bg-white border-b border-gray-200 px-2 py-3 lg:px-4 lg:py-4">
      <div className="max-w-6xl mx-auto ml-12 lg:ml-auto"> {/* ml-12 pour laisser l'espace au hamburger sur mobile */}
        {/* Header avec pourcentage */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs lg:text-sm text-gray-600">
            Étape {currentStep + 1} sur {totalSteps}
          </div>
          <div className="text-xs lg:text-sm font-medium text-gray-900">
            {progressPercentage}% complété
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="relative">
          {/* Ligne de fond */}
          <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-200 rounded-full"></div>
          
          {/* Ligne de progression - couleur Mon Équipe IA */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 h-0.5 rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${progressPercentage}%`,
              background: 'linear-gradient(to right, #dbae61, #c19b4f)'
            }}
          ></div>
          
          {/* Points des étapes */}
          <div className="relative flex justify-between">
            {sections.map((section, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isUpcoming = index > currentStep
              
              let dotClasses = "w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full border-2 transition-all duration-200 "
              
              if (isCompleted) {
                // Étapes complétées - couleur Mon Équipe IA
                dotClasses += "border-transparent"
              } else if (isCurrent) {
                // Étape actuelle - anneau doré
                dotClasses += "bg-white border-2 ring-2 ring-opacity-30"
              } else {
                // Étapes à venir - gris
                dotClasses += "bg-white border-gray-300"
              }
              
              return (
                <div key={section} className="relative group">
                  <div 
                    className={dotClasses}
                    style={
                      isCompleted ? {
                        background: 'linear-gradient(to right, #dbae61, #c19b4f)'
                      } : isCurrent ? {
                        borderColor: '#dbae61',
                        ringColor: '#dbae61'
                      } : {}
                    }
                  ></div>
                  
                  {/* Tooltip au hover */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {index + 1}. {section}
                    </div>
                    {/* Flèche du tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Section actuelle */}
        <div className="mt-2 text-center">
          <span className="text-xs lg:text-sm font-medium text-gray-900">
            {currentStep + 1}. {sections[currentStep]}
          </span>
        </div>
      </div>
    </div>
  )
}