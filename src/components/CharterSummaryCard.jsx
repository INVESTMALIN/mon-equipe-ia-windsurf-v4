import { Palette, Edit } from 'lucide-react'

export default function CharterSummaryCard({ charter, onEdit }) {
  if (!charter) return null

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Votre identité de marque</h3>
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs">
            <div>
              <span className="text-gray-600">Style:</span>{' '}
              <span className="font-medium text-gray-900">{charter.brand_style}</span>
            </div>
            <div>
              <span className="text-gray-600">Ton:</span>{' '}
              <span className="font-medium text-gray-900">{charter.tone_of_voice}</span>
            </div>
            {charter.color_palette && charter.color_palette.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Couleurs:</span>
                {charter.color_palette.slice(0, 3).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
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