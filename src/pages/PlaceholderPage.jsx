export default function PlaceholderPage({ title, description }) {
  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      <section className="placeholder-card">
        <span className="placeholder-card__icon">◈</span>
        <h2>Em breve</h2>
        <p>Esta área está preparada para receber a próxima aplicação.</p>
      </section>
    </div>
  )
}
