import { useCallback, useEffect, useState } from 'react'
import ImageGallery from './components/ImageGallery'
import ImagePreviewModal from './components/ImagePreviewModal'
import ImageUploadForm from './components/ImageUploadForm'
import './App.css'

const API_URL = 'http://localhost:3000/api/images'

export default function App() {
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
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Não foi possível carregar as imagens.')

      setImages(await response.json())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadImages = async () => {
      await fetchImages()
    }

    loadImages()
  }, [fetchImages])

  const clearFeedback = () => {
    setError('')
    setNotice('')
  }

  const handleFileChange = (file) => {
    clearFeedback()
    setSelectedFile(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedFile) return

    setIsSaving(true)
    clearFeedback()

    const formData = new FormData()
    formData.append('image', selectedFile)
    const url = editingImage
      ? `${API_URL}/${encodeURIComponent(editingImage.name)}`
      : API_URL

    try {
      const response = await fetch(url, {
        method: editingImage ? 'PUT' : 'POST',
        body: formData,
      })

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}))
        throw new Error(responseData.error || 'Não foi possível salvar a imagem.')
      }

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
      const response = await fetch(`${API_URL}/${encodeURIComponent(image.name)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}))
        throw new Error(responseData.error || 'Não foi possível excluir a imagem.')
      }

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

  const cancelEditing = () => {
    setEditingImage(null)
    setSelectedFile(null)
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__content">
          <img className="hero__logo" src="/logo-vision.png" alt="Vision" />
          <div>
            <p className="eyebrow">Armazenamento em nuvem</p>
            <h1>Visualize suas imagens</h1>
            <p className="hero__description">
              Organize, visualize e atualize.
            </p>
          </div>
        </div>
        <div className="hero__stats">
          <strong>{images.length}</strong>
          <span>{images.length === 1 ? 'imagem armazenada' : 'imagens armazenadas'}</span>
        </div>
      </header>

      <main className="app-content">
        <ImageUploadForm
          editingImage={editingImage}
          selectedFile={selectedFile}
          isSaving={isSaving}
          onCancel={cancelEditing}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
        />

        {error && <div className="feedback feedback--error" role="alert">{error}</div>}
        {notice && <div className="feedback feedback--success" role="status">{notice}</div>}

        <ImageGallery
          images={images}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={startEditing}
          onPreview={setPreviewImage}
          onRefresh={fetchImages}
        />
      </main>

      {previewImage && (
        <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
      )}
    </div>
  )
}
