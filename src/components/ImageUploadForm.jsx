import { useEffect, useMemo, useRef } from 'react'

export default function ImageUploadForm({
  editingImage,
  selectedFile,
  isSaving,
  onCancel,
  onFileChange,
  onSubmit,
}) {
  const inputRef = useRef(null)
  const localPreview = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile],
  )

  useEffect(() => {
    if (!selectedFile && inputRef.current) {
      inputRef.current.value = ''
    }
  }, [selectedFile])

  useEffect(() => {
    if (!editingImage) return

    inputRef.current?.focus()
  }, [editingImage])

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  const handleCancel = () => {
    onCancel()
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="upload-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{editingImage ? 'Modo de edição' : 'Novo upload'}</p>
          <h2>{editingImage ? 'Atualizar imagem' : 'Adicionar imagem'}</h2>
        </div>
        <span className="upload-panel__badge">JPG, PNG ou WEBP</span>
      </div>

      {editingImage && (
        <div className="editing-notice">
          <img src={editingImage.url} alt="" />
          <span>Substituindo <strong>{editingImage.name}</strong></span>
        </div>
      )}

      <form className="upload-form" onSubmit={onSubmit}>
        <label className="file-dropzone" htmlFor="image-upload">
          <span className="file-dropzone__icon">↑</span>
          <span className="file-dropzone__title">
            {selectedFile ? selectedFile.name : 'Escolha uma imagem para enviar'}
          </span>
          <span className="file-dropzone__hint">
            {selectedFile ? 'Clique para escolher outro arquivo' : editingImage ? 'Escolha a nova imagem que substituirá a atual' : 'ou arraste o arquivo para esta área'}
          </span>
          <input
            ref={inputRef}
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => onFileChange(event.target.files[0] || null)}
          />
        </label>

        {localPreview && (
          <div className="upload-preview">
            <img src={localPreview} alt="Pré-visualização da imagem selecionada" />
            <div>
              <span>Pré-visualização</span>
              <strong>{selectedFile.name}</strong>
            </div>
          </div>
        )}

        <div className="upload-form__actions">
          {editingImage && (
            <button className="button button--ghost" type="button" onClick={handleCancel}>
              Cancelar
            </button>
          )}
          <button className="button button--primary" type="submit" disabled={!selectedFile || isSaving}>
            {isSaving ? 'Salvando...' : editingImage ? 'Salvar alteração' : 'Enviar imagem'}
          </button>
        </div>
      </form>
    </section>
  )
}
