/**
 * API CLIENT
 * @description 
 */

import axios from 'axios'

const detectBackendURL = () => {
  // Try environment variables first
  if (import.meta.env?.VITE_API_URL) {
    console.log('🎯 Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  if (process.env?.REACT_APP_API_URL) {
    console.log('🎯 Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback: Try to detect the correct port
  const currentHost = window.location.hostname;
  const possiblePorts = [5000, 8000, 3001, 4000];
  
  console.log(`🔍 No env vars found. Current host: ${currentHost}`);
  console.log('🎯 Using fallback URL: http://localhost:5000/api');
  
  return 'http://localhost:5000/api';
};

// Get the final API URL
const API_BASE_URL = detectBackendURL();

console.log('🚀 FINAL API BASE URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    
    // Show FULL URL being called
    const fullURL = `${config.baseURL}${config.url}`;
    console.log('🚀 Making request to FULL URL:', fullURL);
    console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set');
    } else {
      console.log('❌ No token - request will be unauthorized');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
)

// ===========================================
// RESPONSE INTERCEPTOR WITH ERROR HANDLING
// ===========================================

api.interceptors.response.use(
  (response) => {
    const fullURL = `${response.config.baseURL}${response.config.url}`;
    console.log('✅ Response received from:', fullURL, 'Status:', response.status);
    
    // Auto-save token on successful login
    if (response.config.url.includes('/auth/login') && response.data?.data?.tokens?.accessToken) {
      const token = response.data.data.tokens.accessToken;
      localStorage.setItem('accessToken', token);
      console.log('🔑 Token saved to localStorage');
    }
    
    return response;
  },
  (error) => {
    const fullURL = error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown URL';
    
    console.error('🚨 Response error from:', fullURL);
    console.error('🚨 Error status:', error.response?.status);
    console.error('🚨 Error message:', error.message);
    console.error('🚨 Error details:', error.response?.data || 'No response data');
    
    // Network/Connection errors
    if (!error.response) {
      console.error('🌐 NETWORK ERROR: Cannot connect to backend server');
      console.error('🔧 Check if backend is running on:', API_BASE_URL.replace('/api', ''));
      
      // Show user-friendly error
      alert(`❌ Cannot connect to server!\n\nPlease check:\n1. Backend is running (npm run dev)\n2. Backend URL: ${API_BASE_URL.replace('/api', '')}\n3. No firewall blocking the connection`);
    }
    
    // Authentication errors
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - clearing token');
      localStorage.removeItem('accessToken');
      
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        console.log('🔄 Redirecting to login page');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
)

// ===========================================
// API ENDPOINTS
// ===========================================

export const authAPI = {
  register: (userData) => {
    console.log('📝 Attempting registration for:', userData.email);
    return api.post('/auth/register', userData);
  },
  
  login: (credentials) => {
    console.log('🔐 Attempting login for:', credentials.email);
    return api.post('/auth/login', credentials);
  },
  
  logout: () => {
    console.log('👋 Logging out user');
    localStorage.removeItem('accessToken');
    return api.post('/auth/logout');
  },
  
  refreshToken: () => api.post('/auth/refresh-token'),
  verifyToken: () => api.get('/auth/verify'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password })
}

export const userAPI = {
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
  getPointsBalance: () => api.get('/users/me/points'),
  getPointsHistory: () => api.get('/users/me/points/history'),
}

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getFeatured: (limit = 6) => api.get('/courses/featured', { params: { limit } }),
  purchase: (id, data) => api.post(`/courses/${id}/purchase`, data),
  getPurchased: () => api.get('/courses/purchased'),
}

export const documentsAPI = {
  getAll: (params = {}) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id, params = {}) => api.delete(`/documents/${id}`, { params }),
}

export const quizzesAPI = {
  getAll: (params = {}) => api.get('/quizzes', { params }),
  getById: (id) => api.get(`/quizzes/${id}`),
  generate: (data) => api.post('/quizzes/generate', data),
  startAttempt: (id) => api.post(`/quizzes/${id}/attempt`),
  submitAnswer: (id, attemptId, data) => api.put(`/quizzes/${id}/attempt/${attemptId}`, data),
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

export const apiUtils = {
  isAuthenticated: () => !!localStorage.getItem('accessToken'),
  getToken: () => localStorage.getItem('accessToken'),
  clearAuth: () => {
    localStorage.removeItem('accessToken');
    console.log('🚨 Authentication cleared');
  },
  setToken: (token) => {
    localStorage.setItem('accessToken', token);
    console.log('🔑 Token set in localStorage');
  },
  
  // Test backend connection
  testConnection: async () => {
    try {
      console.log('🧪 Testing backend connection...');
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/status`);
      
      if (response.ok) {
        console.log('✅ Backend connection successful!');
        return true;
      } else {
        console.error('❌ Backend responded with error:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      return false;
    }
  }
}

export default api