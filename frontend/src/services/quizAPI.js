/**
 * PATH: src/services/quizAPI.js
 * Quiz API service for all quiz-related operations
 */

import api from './api'

export const quizAPI = {
  /**
   * Get available quizzes for a document
   */
  getDocumentQuizzes: async (documentId, options = {}) => {
    const { difficulty, questionType, excludeUsed = false, limit = 20 } = options
    
    console.log(`📊 Fetching quizzes for document: ${documentId}`)
    
    const params = new URLSearchParams()
    if (difficulty) params.append('difficulty', difficulty)
    if (questionType) params.append('questionType', questionType)
    if (excludeUsed) params.append('excludeUsed', 'true')
    params.append('limit', limit.toString())
    
    const response = await api.get(`/quizzes/document/${documentId}?${params}`)
    return response.data
  },
  
  /**
   * Get quiz statistics for a document
   */
  getDocumentQuizStats: async (documentId) => {
    console.log(`📈 Fetching quiz stats for document: ${documentId}`)
    const response = await api.get(`/quizzes/document/${documentId}/stats`)
    return response.data
  },
  
  /**
   * Select a random quiz from document's collection
   */
  selectQuiz: async (documentId, preferences = {}) => {
    console.log(`🎲 Selecting quiz for document: ${documentId}`, preferences)
    const response = await api.post(`/quizzes/document/${documentId}/select`, preferences)
    return response.data
  },
  
  /**
   * Generate custom quiz
   */
  generateCustomQuiz: async (options) => {
    console.log(`🎯 Generating custom quiz:`, options)
    const response = await api.post('/quizzes/generate', options)
    return response.data
  },
  
  // ==========================================
  // QUIZ ATTEMPTS
  // ==========================================
  
  /**
   * Start a new quiz attempt
   */
  startAttempt: async (quizId) => {
    console.log(`🚀 Starting quiz attempt for quiz: ${quizId}`)
    const response = await api.post(`/quizzes/${quizId}/attempt`)
    return response.data
  },
  
  /**
   * Submit answer for a question
   */
  submitAnswer: async (quizId, attemptId, answerData) => {
    console.log(`📝 Submitting answer:`, { quizId, attemptId, answerData })
    const response = await api.put(`/quizzes/${quizId}/attempt/${attemptId}`, answerData)
    return response.data
  },
  
  /**
   * Complete quiz attempt
   */
  completeQuiz: async (quizId, attemptId) => {
    console.log(`🏁 Completing quiz attempt: ${attemptId}`)
    const response = await api.post(`/quizzes/${quizId}/attempt/${attemptId}/complete`)
    return response.data
  },
  
  /**
   * Get quiz attempt results
   */
  getResults: async (quizId, attemptId) => {
    console.log(`📊 API: Fetching results for quiz: ${quizId}, attempt: ${attemptId}`)
    
    const response = await api.get(`/quizzes/${quizId}/attempt/${attemptId}/results`)
    
    console.log(`📊 RAW BACKEND RESPONSE:`, response.data)
    console.log(`📊 DETAILED RESULTS:`, response.data?.results?.detailedResults)
    console.log(`📊 FIRST QUESTION RAW:`, response.data?.results?.detailedResults?.[0])
    
    return response.data
  },
  
  // ==========================================
  // QUIZ MANAGEMENT
  // ==========================================
  
  /**
   * Get user's quizzes
   */
  getUserQuizzes: async (options = {}) => {
    const { page = 1, limit = 20, status, difficulty, documentId } = options
    
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    if (status) params.append('status', status)
    if (difficulty) params.append('difficulty', difficulty)
    if (documentId) params.append('documentId', documentId)
    
    const response = await api.get(`/quizzes?${params}`)
    return response.data
  },
  
  /**
   * Get quiz by ID
   */
  getQuizById: async (quizId) => {
    console.log(`🔍 Fetching quiz: ${quizId}`)
    const response = await api.get(`/quizzes/${quizId}`)
    return response.data
  },
  
  // ==========================================
  // ANALYTICS & HISTORY
  // ==========================================
  
  /**
   * Get user quiz statistics
   */
  getUserStats: async () => {
    console.log(`📈 Fetching user quiz statistics`)
    const response = await api.get('/quizzes/stats')
    return response.data
  },
  
  /**
   * Get quiz attempt history
   */
  getQuizHistory: async (options = {}) => {
    const { page = 1, limit = 20, status } = options
    
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    if (status) params.append('status', status)
    
    const response = await api.get(`/quizzes/history?${params}`)
    return response.data
  }
}

export default quizAPI