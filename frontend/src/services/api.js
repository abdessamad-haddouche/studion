/**
 * API Client Service
 * @description Axios-based HTTP client for backend communication
 */

import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response, message } = error

    if (response) {
      const { status, data } = response

      switch (status) {
        case 401:
          localStorage.removeItem('token')
          window.location.href = '/login'
          toast.error('Session expired. Please log in again.')
          break

        case 403:
          toast.error('Access denied.')
          break

        case 404:
          toast.error(data?.message || 'Resource not found')
          break

        case 422:
          if (data?.errors) {
            Object.values(data.errors).forEach(error => {
              toast.error(error)
            })
          } else {
            toast.error(data?.message || 'Validation failed')
          }
          break

        case 429:
          toast.error('Too many requests. Please slow down.')
          break

        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Server error. Please try again later.')
          break

        default:
          toast.error(data?.message || 'An unexpected error occurred')
      }
    } else if (message === 'Network Error') {
      toast.error('Network error. Check your connection.')
    } else if (message.includes('timeout')) {
      toast.error('Request timeout. Please try again.')
    } else {
      toast.error('An unexpected error occurred')
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
}

export const documentsAPI = {
  upload: (formData, onProgress) => apiClient.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  }),
  getAll: (params) => apiClient.get('/documents', { params }),
  getById: (id) => apiClient.get(`/documents/${id}`),
  update: (id, data) => apiClient.put(`/documents/${id}`, data),
  delete: (id) => apiClient.delete(`/documents/${id}`),
  getSummary: (id) => apiClient.get(`/documents/${id}/summary`),
}

export const quizzesAPI = {
  generate: (data) => apiClient.post('/quizzes/generate', data),
  getAll: (params) => apiClient.get('/quizzes', { params }),
  getById: (id) => apiClient.get(`/quizzes/${id}`),
  startAttempt: (id, data) => apiClient.post(`/quizzes/${id}/attempt`, data),
  submitAnswer: (quizId, attemptId, data) => apiClient.put(`/quizzes/${quizId}/attempt/${attemptId}`, data),
  completeAttempt: (quizId, attemptId) => apiClient.post(`/quizzes/${quizId}/attempt/${attemptId}/complete`),
  getResults: (quizId, attemptId) => apiClient.get(`/quizzes/${quizId}/attempt/${attemptId}/results`),
}

export default apiClient