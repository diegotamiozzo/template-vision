import { useCallback, useEffect, useState } from 'react'
import ImageGallery from '../components/gallery/ImageGallery'
import ImagePreviewModal from '../components/gallery/ImagePreviewModal'
import ImageUploadForm from '../components/gallery/ImageUploadForm'
import { useAuth } from '../context/useAuth'
import { deleteImage, listImages, saveImage } from '../services/imageService'

export default function GalleryPage() {
  const { session } = useAuth()
  const [images, setImages] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [editingImage, setEditingImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const fetchImages = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      setImages(await listImages(session.token))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }, [session.token])

  useEffect(() => {
    const loadImages = async () => {
      await fetchImages()
    }
    loadImages()
  }, [fetchImages])
  useEffect(() => {
    if (!notice) return undefined
    const timeoutId = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  const clearFeedback = () => { setError(''); setNotice('') }
  const cancelEditing = () => { setEditingImage(null); setSelectedFile(null) }
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedFile) return
    setIsSaving(true)
    clearFeedback()
    try {
      await saveImage(session.token, selectedFile, editingImage)
      setNotice(editingImage ? 'Imagem atualizada com sucesso.' : 'Imagem enviada com sucesso.')
      cancelEditing()
      await fetchImages()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }
  const handleDelete = async (image) => {
    if (!window.confirm(`Excluir "${image.name}"?`)) return
    clearFeedback()
    try {
      await deleteImage(session.token, image.name)
      setNotice('Imagem excluída com sucesso.')
      await fetchImages()
    } catch (requestError) {
      setError(requestError.message)
    }
  }
  const startEditing = (image) => {
    clearFeedback()
    setEditingImage(image)
    setSelectedFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.getElementById('image-upload')?.click()
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <p className="eyebrow">Armazenamento em nuvem</p>
          <h1>Galeria de imagens</h1>
          <p>Organize, visualize e atualize seus arquivos.</p>
        </div>
        <div className="page-stat"><strong>{images.length}</strong><span>{images.length === 1 ? 'imagem' : 'imagens'}</span></div>
      </header>
      <ImageUploadForm editingImage={editingImage} selectedFile={selectedFile} isSaving={isSaving} onCancel={cancelEditing} onFileChange={(file) => { clearFeedback(); setSelectedFile(file) }} onSubmit={handleSubmit} />
      {error && <div className="feedback feedback--error" role="alert">{error}</div>}
      {notice && <div className="feedback feedback--success" role="status">{notice}</div>}
      <ImageGallery images={images} isLoading={isLoading} onDelete={handleDelete} onEdit={startEditing} onPreview={setPreviewImage} onRefresh={fetchImages} />
      {previewImage && <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />}
    </div>
  )
}
