import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

const navigation = [
  { to: '/gallery', label: 'Gallery', icon: '▦' },
  { to: '/application', label: 'Application', icon: '◈' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function AppLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <img src="/logo-vision.png" alt="Vision" />
          <div>
            <strong>Vision</strong>
            <span>Workspace</span>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Navegação principal">
          <p className="sidebar__label">Workspace</p>
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
              key={item.to}
              to={item.to}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <span className="avatar">{session?.username?.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{session?.username}</strong>
              <span>Administrador</span>
            </div>
          </div>
          <button className="sidebar__logout" type="button" onClick={handleLogout}>
            <span aria-hidden="true">↪</span>
            Sair
          </button>
        </div>
      </aside>
      <main className="workspace-main">
        <Outlet />
      </main>
    </div>
  )
}
