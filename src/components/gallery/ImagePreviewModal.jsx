import { useEffect } from 'react'

export default function ImagePreviewModal({ image, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="image-modal" role="dialog" aria-modal="true" aria-label={image.name} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar visualização">×</button>
        <img src={image.url} alt={image.name} />
        <p>{image.name}</p>
      </div>
    </div>
  )
}
