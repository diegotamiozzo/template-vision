import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function LoginPage() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session) return <Navigate to="/gallery" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(username, password)
      navigate(location.state?.from?.pathname || '/gallery', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="login-card__brand">
          <img src="/logo-vision.png" alt="Vision"/>
          <div>
            <strong>Vision Computer</strong>
            <span>Cloud workspace</span>
          </div>
        </div>
        <p className="eyebrow">Acesso privado</p>
        <h1>Bem-vindo</h1>
        <p className="login-card__description">Entre com suas credenciais.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Usuário
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </label>
          {error && <div className="feedback feedback--error" role="alert">{error}</div>}
          <button className="button button--primary login-form__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
