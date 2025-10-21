import { useState } from 'react'
import { ImageIcon, ExternalLink } from 'lucide-react'

export default function SafeImage({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon = ImageIcon,
  showLink = false,
  linkText = "Voir l'image"
}) {
  const [imageError, setImageError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const FallbackIcon = fallbackIcon

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageClick = (e) => {
    e.preventDefault()
    if (showLink) {
      setShowModal(true)
    }
  }

  if (imageError || !src) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-8 ${className}`}>
        <FallbackIcon className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500 text-sm text-center">{alt || 'Image non disponible'}</p>
        {showLink && src && (
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{linkText}</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={`relative overflow-hidden rounded-lg ${className}`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onError={handleImageError}
          onClick={handleImageClick}
          onContextMenu={(e) => e.preventDefault()} // Empêcher le clic droit
          draggable={false} // Empêcher le drag & drop
        />
        {showLink && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <ExternalLink className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal pour afficher l'image */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{alt}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-96 object-contain mx-auto"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
              <div className="mt-4 text-center">
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Ouvrir dans un nouvel onglet</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
