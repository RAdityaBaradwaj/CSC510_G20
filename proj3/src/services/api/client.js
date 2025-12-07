// API Client - Abstraction layer for all API calls
// Easily swappable between mock and real API

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor (for auth tokens, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor (for error handling)
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          break
        case 404:
          throw new Error('Resource not found')
        case 500:
          throw new Error('Server error')
        default:
          throw new Error(error.response.data?.message || 'An error occurred')
      }
    }
    return Promise.reject(error)
  }
)

// API methods wrapper
export const api = {
  // Generic request methods
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),

  // Check if mock data is being used
  isMockMode: () => USE_MOCK_DATA
}

// Export axios instance for advanced use cases
export { apiClient }

export default api
