/**
 * PATH: src/services/documents.service.js
 */

import { documentsAPI } from './api'

export const documentsService = {
  // ==========================================
  // DOCUMENT MANAGEMENT
  // ==========================================

  /**
   * Get all user documents with filtering/pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Documents with pagination info
   */
  async getUserDocuments(options = {}) {
    try {
      const response = await documentsAPI.getAll({
        params: {
          status: options.status,
          category: options.category,
          difficulty: options.difficulty,
          search: options.search,
          page: options.page || 1,
          limit: options.limit || 20,
          sortBy: options.sortBy || 'createdAt',
          sortOrder: options.sortOrder || 'desc'
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Get document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Document object
   */
  async getDocumentById(documentId) {
    try {
      const response = await documentsAPI.getById(documentId)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Upload new document
   * @param {File} file - Document file
   * @param {Object} metadata - Document metadata
   * @param {boolean} processImmediately - Start AI processing
   * @returns {Promise<Object>} Created document
   */
  async uploadDocument(file, metadata = {}, processImmediately = false) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add metadata fields
      if (metadata.title) formData.append('title', metadata.title)
      if (metadata.description) formData.append('description', metadata.description)
      if (metadata.category) formData.append('category', metadata.category)
      if (metadata.difficulty) formData.append('difficulty', metadata.difficulty)
      if (metadata.tags) formData.append('tags', metadata.tags)
      
      // Add processing flag
      formData.append('processImmediately', processImmediately.toString())

      const response = await documentsAPI.upload(formData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Update document metadata
   * @param {string} documentId - Document ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated document
   */
  async updateDocument(documentId, updateData) {
    try {
      const response = await documentsAPI.update(documentId, updateData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Delete document
   * @param {string} documentId - Document ID
   * @param {boolean} permanent - Permanently delete
   * @returns {Promise<Object>} Success message
   */
  async deleteDocument(documentId, permanent = false) {
    try {
      const response = await documentsAPI.delete(documentId, { permanent })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // ==========================================
  // AI PROCESSING
  // ==========================================

  /**
   * Get document summary
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Document summary
   */
  async getDocumentSummary(documentId) {
    try {
      const response = await documentsAPI.getSummary(documentId)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Trigger AI processing for document
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Processing status
   */
  async processDocument(documentId) {
    try {
      const response = await documentsAPI.process(documentId)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Generate quiz from document
   * @param {string} documentId - Document ID
   * @param {Object} options - Quiz options
   * @returns {Promise<Object>} Generated quiz
   */
  async generateQuiz(documentId, options = {}) {
    try {
      const response = await documentsAPI.generateQuiz(documentId, {
        questionCount: options.questionCount || 5,
        difficulty: options.difficulty || 'intermediate'
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Generate custom analysis
   * @param {string} documentId - Document ID
   * @param {string} prompt - Custom prompt
   * @returns {Promise<Object>} Analysis result
   */
  async generateCustomAnalysis(documentId, prompt) {
    try {
      const response = await documentsAPI.customAnalysis(documentId, { prompt })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Get document analytics
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Document analytics
   */
  async getDocumentAnalytics(documentId) {
    try {
      const response = await documentsAPI.getAnalytics(documentId)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Check if user has any documents
   * @returns {Promise<boolean>} Has documents
   */
  async hasDocuments() {
    try {
      const response = await this.getUserDocuments({ limit: 1 })
      return response.count > 0
    } catch (error) {
      console.error('Error checking documents:', error)
      return false
    }
  },

  /**
   * Get user document statistics
   * @returns {Promise<Object>} Document stats
   */
  async getDocumentStats() {
    try {
      const response = await this.getUserDocuments({ limit: 1000 }) // Get all for stats
      const documents = response.documents || []
      
      return {
        total: documents.length,
        processed: documents.filter(doc => doc.status === 'completed').length,
        processing: documents.filter(doc => doc.status === 'processing').length,
        pending: documents.filter(doc => doc.status === 'pending').length,
        failed: documents.filter(doc => doc.status === 'failed').length,
        categories: [...new Set(documents.map(doc => doc.classification?.category).filter(Boolean))],
        recentUploads: documents.filter(doc => {
          const uploadDate = new Date(doc.createdAt)
          const daysDiff = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff <= 7
        }).length
      }
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * @returns {Promise<Object>} Total documents count
   */
  async getTotalDocumentsCount() {
    try {
      // Get just the count without fetching all documents
      const response = await this.getUserDocuments({ limit: 1 })
      return {
        totalCount: response.pagination?.total || response.total || response.count || 0
      }
    } catch (error) {
      console.error('Error getting total documents count:', error)
      return { totalCount: 0 }
    }
  },

  /**
   * Handle API errors consistently
   * @param {Error} error - API error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    const status = error.response?.status || 500
    
    const formattedError = new Error(message)
    formattedError.status = status
    formattedError.isApiError = true
    
    return formattedError
  }
}

export default documentsService