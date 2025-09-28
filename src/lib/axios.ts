import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // CORRECTION: ajouter /api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 1 minute pour les uploads
})

// Interceptor pour ajouter le token d'auth si vous en avez un
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor pour logger les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    })
    return Promise.reject(error)
  }
)

export default api