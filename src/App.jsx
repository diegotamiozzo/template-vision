import './App.css'
import logoMarca from '/logo-vision.png'
function App() {
  return (
    <main>
      <img src={logoMarca} alt="Logo do Projeto" className="logo" />
      <h1>Meu Projeto</h1>
      <p>Ambiente limpo e pronto para começar!</p>
    </main>
  )
}

export default App