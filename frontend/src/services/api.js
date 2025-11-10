/**
 * PATH: src/services/api.js
 * Enhanced API client with detailed debugging
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
    
    console.log('🚀 Making request to:', config.url)
    console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Authorization header set')
    } else {
      console.log('❌ No token - request will be unauthorized')
    }
    
    return config
  },
  (error) => {
    console.log('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status, response.config.url)
    
    // ✅ ADD THIS - Log response data for documents endpoint
    if (response.config.url.includes('/documents')) {
      console.log('📄 Documents API Response Data:', response.data)
      console.log('📄 Documents Array:', response.data.data || response.data.documents || response.data)
    }
    
    return response
  },
  (error) => {
    console.log('🚨 Response error:', error.response?.status, error.config?.url)
    
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - clearing token and redirecting')
      localStorage.removeItem('accessToken')
      
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 Redirecting to login page')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => {
    console.log('🔐 Attempting login...')
    return api.post('/auth/login', credentials)
  },
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  verifyToken: () => api.get('/auth/verify'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password })
}

// Documents API
export const documentsAPI = {
  getAll: (config = {}) => {
    console.log('📄 Fetching documents with config:', config.params)
    return api.get('/documents', config)
  },
  upload: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getById: (id) => api.get(`/documents/${id}`),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id, params = {}) => api.delete(`/documents/${id}`, { params }),
  getSummary: (id) => api.get(`/documents/${id}/summary`),
  process: (id) => api.post(`/documents/${id}/process`),
  generateQuiz: (id, data) => api.post(`/documents/${id}/generate-quiz`, data),
  customAnalysis: (id, data) => api.post(`/documents/${id}/custom-analysis`, data),
  getAnalytics: (id) => api.get(`/documents/${id}/analytics`)
}

export const quizzesAPI = {
  getAll: () => api.get('/quizzes'),
  generate: (documentId, options) => api.post('/quizzes/generate', { documentId, ...options }),
  submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),
  getResults: (attemptId) => api.get(`/quiz-attempts/${attemptId}`)
}

export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  purchase: (id) => api.post(`/courses/${id}/purchase`)
}

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getAnalytics: () => api.get('/user/analytics'),
  getPoints: () => api.get('/user/points'),
  
  // ✅ FIXED: Change from '/user/stats' to '/users/me/stats'
  getStats: () => {
    console.log('📊 Fetching user stats from /users/me/stats')
    return api.get('/users/me/stats')
  },
  
  // ✅ NEW: Added getCurrentUser method
  getCurrentUser: () => {
    console.log('👤 Fetching current user from /users/me')
    return api.get('/users/me')
  },
  
  // ✅ ADD: Other endpoints matching your backend routes
  getDocumentStats: () => api.get('/users/me/stats/documents'),
  getQuizStats: () => api.get('/users/me/stats/quizzes'),
  getPointsBalance: () => api.get('/users/me/points'),
  getPointsHistory: () => api.get('/users/me/points/history'),
}

export default api