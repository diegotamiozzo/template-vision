export default function ImageCard({ image, onDelete, onEdit, onPreview }) {
  const handleImageError = (event) => {
    event.currentTarget.style.display = 'none'
    event.currentTarget.parentElement.classList.add('image-card__preview--error')
  }

  return (
    <article className="image-card">
      <button className="image-card__preview" type="button" onClick={() => onPreview(image)}>
        <img src={image.url} alt={image.name} loading="lazy" onError={handleImageError} />
        <span>Ver imagem</span>
      </button>
      <div className="image-card__body">
        <div>
          <h3 title={image.name}>{image.name}</h3>
          <p>{image.updated ? `Atualizada em ${new Date(image.updated).toLocaleDateString('pt-BR')}` : 'Imagem armazenada'}</p>
        </div>
        <div className="image-card__actions">
          <button className="icon-button" type="button" onClick={() => onEdit(image)} aria-label={`Atualizar ${image.name}`}>Editar</button>
          <button className="icon-button icon-button--danger" type="button" onClick={() => onDelete(image)} aria-label={`Excluir ${image.name}`}>Excluir</button>
        </div>
      </div>
    </article>
  )
}
