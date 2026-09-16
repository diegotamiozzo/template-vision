import { useMemo, useState } from 'react'
import { getSession, login as loginRequest, logout as logoutRequest } from '../services/authService'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getSession)

  const value = useMemo(() => ({
    session,
    async login(username, password) {
      const nextSession = await loginRequest(username, password)
      setSession(nextSession)
    },
    logout() {
      logoutRequest()
      setSession(null)
    },
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
