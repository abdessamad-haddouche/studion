/**
 * PATH: src/services/api.js
 * Enhanced API client with complete document endpoints
 */

import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  verifyToken: () => api.get('/auth/verify'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password })
}

// Documents API - Complete endpoints
export const documentsAPI = {
  // Basic CRUD
  getAll: (config = {}) => api.get('/documents', config),
  upload: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getById: (id) => api.get(`/documents/${id}`),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id, params = {}) => api.delete(`/documents/${id}`, { params }),
  
  // AI Processing endpoints
  getSummary: (id) => api.get(`/documents/${id}/summary`),
  process: (id) => api.post(`/documents/${id}/process`),
  generateQuiz: (id, data) => api.post(`/documents/${id}/generate-quiz`, data),
  customAnalysis: (id, data) => api.post(`/documents/${id}/custom-analysis`, data),
  getAnalytics: (id) => api.get(`/documents/${id}/analytics`)
}

// Quizzes API
export const quizzesAPI = {
  getAll: () => api.get('/quizzes'),
  generate: (documentId, options) => api.post('/quizzes/generate', { documentId, ...options }),
  submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),
  getResults: (attemptId) => api.get(`/quiz-attempts/${attemptId}`)
}

// Courses API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  purchase: (id) => api.post(`/courses/${id}/purchase`)
}

// User Profile API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getAnalytics: () => api.get('/user/analytics'),
  getPoints: () => api.get('/user/points')
}

export default api