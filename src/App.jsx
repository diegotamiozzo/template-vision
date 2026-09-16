import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/common/AppLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import GalleryPage from './pages/GalleryPage'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/gallery" replace />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/application" element={<PlaceholderPage title="Application" description="Área reservada para a próxima aplicação." />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" description="Gerencie as configurações do workspace." />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/gallery" replace />} />
      </Routes>
    </AuthProvider>
  )
}
