import { Palette, Edit, Sparkles } from 'lucide-react'

export default function CharterSummaryCard({ charter, onEdit }) {
  if (!charter) return null

  // Helper pour afficher les arrays proprement
  const formatArray = (arr) => {
    if (!arr || arr.length === 0) return null
    return arr.join(', ')
  }

  // Helper pour les couleurs
  const displayColors = charter.color_palette?.colors || []

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Votre identité de marque</h3>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {/* Nom conciergerie */}
            {charter.conciergerie_name && (
              <div>
                <span className="text-gray-600">{charter.conciergerie_name}</span>
              </div>
            )}
            
            {/* Style visuel */}
            {charter.visual_style && charter.visual_style.length > 0 && (
              <div>
                <span className="text-gray-600">Style:</span>{' '}
                <span className="font-medium text-gray-900">{formatArray(charter.visual_style)}</span>
              </div>
            )}
            
            {/* Ton */}
            {charter.tone_of_voice && charter.tone_of_voice.length > 0 && (
              <div>
                <span className="text-gray-600">Ton:</span>{' '}
                <span className="font-medium text-gray-900">{formatArray(charter.tone_of_voice)}</span>
              </div>
            )}
            
            {/* Couleurs */}
            {displayColors.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Couleurs:</span>
                {displayColors.slice(0, 3).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {displayColors.length > 3 && (
                  <span className="text-gray-500">+{displayColors.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Edit className="w-3 h-3" />
          Modifier
        </button>
      </div>
    </div>
  )
}