import { getApiUrl, parseApiError } from './api'

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export async function listImages(token) {
  const response = await fetch(getApiUrl('/api/images'), { headers: authHeaders(token) })
  if (!response.ok) throw new Error(await parseApiError(response, 'Não foi possível carregar as imagens.'))
  return response.json()
}

export async function saveImage(token, file, editingImage) {
  const formData = new FormData()
  formData.append('image', file)
  const path = editingImage
    ? `/api/images/${encodeURIComponent(editingImage.name)}`
    : '/api/images'
  const response = await fetch(getApiUrl(path), {
    method: editingImage ? 'PUT' : 'POST',
    headers: authHeaders(token),
    body: formData,
  })
  if (!response.ok) throw new Error(await parseApiError(response, 'Não foi possível salvar a imagem.'))
  return response.json()
}

export async function deleteImage(token, imageName) {
  const response = await fetch(getApiUrl(`/api/images/${encodeURIComponent(imageName)}`), {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!response.ok) throw new Error(await parseApiError(response, 'Não foi possível excluir a imagem.'))
  return response.json()
}
