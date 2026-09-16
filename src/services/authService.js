import { getApiUrl, parseApiError } from './api'

const TOKEN_KEY = 'vision-auth-token'
const USERNAME_KEY = 'vision-auth-username'

export async function login(username, password) {
  const response = await fetch(getApiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Não foi possível entrar.'))
  }

  const data = await response.json()
  sessionStorage.setItem(TOKEN_KEY, data.token)
  sessionStorage.setItem(USERNAME_KEY, data.username)
  return data
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USERNAME_KEY)
}

export function getSession() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const username = sessionStorage.getItem(USERNAME_KEY)
  return token && username ? { token, username } : null
}
