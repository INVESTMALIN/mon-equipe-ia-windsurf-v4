import { useState, useRef, useEffect } from 'react'
import { Upload, Paperclip, Video, Mic, FileText } from 'lucide-react'

export default function ContextMenuButton({ onFileSelect, onFicheSelect, fileInputRef }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Fermer le menu si click en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleVideoClick = () => {
    fileInputRef.current?.click()
    setIsOpen(false)
  }

  const handleFicheClick = () => {
    onFicheSelect()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
      >
        <Paperclip className="w-4 h-4" />
        Ajouter
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
          <button
            type="button"
            onClick={handleVideoClick}
            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
          >
            <Video className="w-4 h-4 text-gray-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Ajouter une vidéo</div>
              <div className="text-xs text-gray-500">MP4, WebM, MOV (max 350MB)</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleVideoClick}
            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors border-t border-gray-100"
          >
            <Mic className="w-4 h-4 text-gray-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Ajouter un audio</div>
              <div className="text-xs text-gray-500">MP3, WAV, M4A (max 10MB)</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleFicheClick}
            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors border-t border-gray-100"
          >
            <FileText className="w-4 h-4 text-[#dbae61]" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Sélectionner une fiche</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Enrichir avec vos données</span>
                <span className="px-1.5 py-0.5 bg-[#dbae61] text-white text-[10px] font-bold rounded uppercase tracking-wide animate-bounce">
                  NEW
                </span>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}