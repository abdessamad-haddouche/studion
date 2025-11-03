/**
 * PATH: src/store/slices/documentsSlice.js
 * Documents Redux Slice - Complete state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import documentsService from '../../services/documents.service'

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchUserDocuments = createAsyncThunk(
  'documents/fetchUserDocuments',
  async (options = {}, { rejectWithValue }) => {
    try {
      const response = await documentsService.getUserDocuments(options)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ file, metadata, processImmediately }, { rejectWithValue }) => {
    try {
      const response = await documentsService.uploadDocument(file, metadata, processImmediately)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async ({ documentId, permanent }, { rejectWithValue }) => {
    try {
      await documentsService.deleteDocument(documentId, permanent)
      return documentId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const processDocument = createAsyncThunk(
  'documents/processDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await documentsService.processDocument(documentId)
      return { documentId, ...response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const checkHasDocuments = createAsyncThunk(
  'documents/checkHasDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const hasDocuments = await documentsService.hasDocuments()
      return hasDocuments
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchDocumentStats = createAsyncThunk(
  'documents/fetchDocumentStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await documentsService.getDocumentStats()
      return stats
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// ==========================================
// DOCUMENTS SLICE
// ==========================================

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    // Document lists
    documents: [],
    currentDocument: null,
    
    // Pagination
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    },
    
    // Filters
    filters: {
      status: null,
      category: null,
      difficulty: null,
      search: ''
    },
    
    // Stats
    stats: {
      total: 0,
      processed: 0,
      processing: 0,
      pending: 0,
      failed: 0,
      categories: [],
      recentUploads: 0
    },
    
    // UI State
    hasDocuments: null, // null = unknown, true/false = determined
    isLoading: false,
    isUploading: false,
    isProcessing: false,
    error: null,
    
    // Last updated timestamp
    lastFetched: null
  },
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    
    // Update filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: null,
        category: null,
        difficulty: null,
        search: ''
      }
    },
    
    // Set current document
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload
    },
    
    // Clear current document
    clearCurrentDocument: (state) => {
      state.currentDocument = null
    },
    
    // Update document in list (for real-time updates)
    updateDocumentInList: (state, action) => {
      const { documentId, updates } = action.payload
      const index = state.documents.findIndex(doc => doc.id === documentId)
      if (index !== -1) {
        state.documents[index] = { ...state.documents[index], ...updates }
      }
    },
    
    // Remove document from list
    removeDocumentFromList: (state, action) => {
      const documentId = action.payload
      state.documents = state.documents.filter(doc => doc.id !== documentId)
      state.stats.total = Math.max(0, state.stats.total - 1)
    },
    
    // Reset state
    resetDocuments: (state) => {
      state.documents = []
      state.currentDocument = null
      state.hasDocuments = null
      state.error = null
      state.lastFetched = null
    }
  },
  extraReducers: (builder) => {
    builder
      // ==========================================
      // FETCH USER DOCUMENTS
      // ==========================================
      .addCase(fetchUserDocuments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        state.documents = action.payload.documents || []
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0
        }
        state.hasDocuments = state.documents.length > 0
        state.lastFetched = Date.now()
      })
      .addCase(fetchUserDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.hasDocuments = false
      })
      
      // ==========================================
      // UPLOAD DOCUMENT
      // ==========================================
      .addCase(uploadDocument.pending, (state) => {
        state.isUploading = true
        state.error = null
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isUploading = false
        state.documents.unshift(action.payload.document)
        state.hasDocuments = true
        state.stats.total += 1
        
        // Update stats based on document status
        if (action.payload.document.status === 'pending') {
          state.stats.pending += 1
        } else if (action.payload.document.status === 'processing') {
          state.stats.processing += 1
        }
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isUploading = false
        state.error = action.payload
      })
      
      // ==========================================
      // DELETE DOCUMENT
      // ==========================================
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const documentId = action.payload
        state.documents = state.documents.filter(doc => doc.id !== documentId)
        state.stats.total = Math.max(0, state.stats.total - 1)
        state.hasDocuments = state.documents.length > 0
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // ==========================================
      // PROCESS DOCUMENT
      // ==========================================
      .addCase(processDocument.pending, (state) => {
        state.isProcessing = true
        state.error = null
      })
      .addCase(processDocument.fulfilled, (state, action) => {
        state.isProcessing = false
        const { documentId } = action.payload
        
        // Update document status in list
        const index = state.documents.findIndex(doc => doc.id === documentId)
        if (index !== -1) {
          state.documents[index].status = 'processing'
        }
        
        // Update stats
        state.stats.processing += 1
        state.stats.pending = Math.max(0, state.stats.pending - 1)
      })
      .addCase(processDocument.rejected, (state, action) => {
        state.isProcessing = false
        state.error = action.payload
      })
      
      // ==========================================
      // CHECK HAS DOCUMENTS
      // ==========================================
      .addCase(checkHasDocuments.fulfilled, (state, action) => {
        state.hasDocuments = action.payload
      })
      .addCase(checkHasDocuments.rejected, (state) => {
        state.hasDocuments = false
      })
      
      // ==========================================
      // FETCH DOCUMENT STATS
      // ==========================================
      .addCase(fetchDocumentStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
  }
})

// ==========================================
// ACTIONS EXPORT
// ==========================================

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentDocument,
  clearCurrentDocument,
  updateDocumentInList,
  removeDocumentFromList,
  resetDocuments
} = documentsSlice.actions

// ==========================================
// SELECTORS
// ==========================================

export const selectDocuments = (state) => state.documents.documents
export const selectCurrentDocument = (state) => state.documents.currentDocument
export const selectHasDocuments = (state) => state.documents.hasDocuments
export const selectDocumentStats = (state) => state.documents.stats
export const selectDocumentsLoading = (state) => state.documents.isLoading
export const selectDocumentsError = (state) => state.documents.error
export const selectPagination = (state) => state.documents.pagination
export const selectFilters = (state) => state.documents.filters

// Advanced selectors
export const selectDocumentsByStatus = (state) => {
  const documents = state.documents.documents
  return {
    pending: documents.filter(doc => doc.status === 'pending'),
    processing: documents.filter(doc => doc.status === 'processing'),
    completed: documents.filter(doc => doc.status === 'completed'),
    failed: documents.filter(doc => doc.status === 'failed')
  }
}

export const selectRecentDocuments = (state) => {
  const documents = state.documents.documents
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
  return documents.filter(doc => new Date(doc.createdAt).getTime() > sevenDaysAgo)
}

export const selectProcessingDocuments = (state) => {
  return state.documents.documents.filter(doc => 
    doc.status === 'processing' || doc.status === 'pending'
  )
}

export default documentsSlice.reducer