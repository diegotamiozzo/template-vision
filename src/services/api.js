const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://template-vision.onrender.com'

export function getApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

export async function parseApiError(response, fallbackMessage) {
  const responseData = await response.json().catch(() => ({}))
  return responseData.detail || responseData.error || fallbackMessage
}
