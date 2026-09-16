import ImageCard from './ImageCard'

export default function ImageGallery({ images, isLoading, onDelete, onEdit, onPreview, onRefresh }) {
  return (
    <section className="gallery-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h2>Galeria de imagens</h2>
        </div>
        <button className="button button--ghost button--refresh" type="button" onClick={onRefresh}>
          Atualizar lista
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state"><span className="loader" /> Carregando imagens...</div>
      ) : images.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">▧</span>
          <strong>Sua galeria está vazia</strong>
          <span>Envie a primeira imagem para começar.</span>
        </div>
      ) : (
        <div className="image-grid">
          {images.map((image) => (
            <ImageCard
              key={image.name}
              image={image}
              onDelete={onDelete}
              onEdit={onEdit}
              onPreview={onPreview}
            />
          ))}
        </div>
      )}
    </section>
  )
}
