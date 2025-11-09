/**
 * PATH: src/store/slices/documentsSlice.js
 * ENHANCED with Local Filtering Support
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
      
      return {
        ...response,
        isSearchResult: !!(options.search && options.search.trim()),
        searchQuery: options.search || null,
        hasFilters: !!(options.status || options.category || options.difficulty)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchTotalDocumentsCount = createAsyncThunk(
  'documents/fetchTotalDocumentsCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentsService.getTotalDocumentsCount()
      return response.totalCount || 0
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
    documents: [],
    totalDocumentsCount: 0,
    displayedDocumentsCount: 0,
    currentDocument: null,
    
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    },
    
    filters: {
      status: null,
      category: null,
      difficulty: null,
      search: ''
    },
    
    searchState: {
      isSearchActive: false,
      searchQuery: '',
      hasFilters: false,
      searchResultsCount: 0
    },
    
    stats: {
      total: 0,
      processed: 0,
      processing: 0,
      pending: 0,
      failed: 0,
      categories: [],
      recentUploads: 0
    },
    
    hasDocuments: null,
    isLoading: false,
    isUploading: false,
    isProcessing: false,
    error: null,
    lastFetched: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    clearFilters: (state) => {
      state.filters = {
        status: null,
        category: null,
        difficulty: null,
        search: ''
      }
      state.searchState = {
        isSearchActive: false,
        searchQuery: '',
        hasFilters: false,
        searchResultsCount: 0
      }
    },
    
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload
    },
    
    clearCurrentDocument: (state) => {
      state.currentDocument = null
    },
    
    updateDocumentInList: (state, action) => {
      const { documentId, updates } = action.payload
      const index = state.documents.findIndex(doc => doc.id === documentId)
      if (index !== -1) {
        state.documents[index] = { ...state.documents[index], ...updates }
      }
    },
    
    removeDocumentFromList: (state, action) => {
      const documentId = action.payload
      state.documents = state.documents.filter(doc => doc.id !== documentId)
      
      state.displayedDocumentsCount = state.documents.length
      state.totalDocumentsCount = Math.max(0, state.totalDocumentsCount - 1)
      state.stats.total = state.totalDocumentsCount
    },
    
    updateTotalDocumentsCount: (state, action) => {
      state.totalDocumentsCount = action.payload
    },
    
    // ✅ NEW: Local filter results action
    setLocalFilterResults: (state, action) => {
      const { documents, total, searchTerm } = action.payload
      
      state.documents = documents
      state.displayedDocumentsCount = documents.length
      
      // Update search state
      state.searchState = {
        isSearchActive: true,
        searchQuery: searchTerm,
        hasFilters: false,
        searchResultsCount: documents.length
      }
      
      // Update pagination for local results
      state.pagination = {
        ...state.pagination,
        total: total,
        totalPages: Math.ceil(total / state.pagination.limit)
      }
      
      console.log('✅ Local filter results updated:', {
        count: documents.length,
        searchTerm: searchTerm
      })
    },
    
    resetDocuments: (state) => {
      state.documents = []
      state.currentDocument = null
      state.hasDocuments = null
      state.error = null
      state.lastFetched = null
      state.totalDocumentsCount = 0
      state.displayedDocumentsCount = 0
      state.searchState = {
        isSearchActive: false,
        searchQuery: '',
        hasFilters: false,
        searchResultsCount: 0
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDocuments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        
        const { 
          documents = [], 
          page = 1, 
          limit = 20, 
          total = 0, 
          totalPages = 0,
          isSearchResult = false,
          searchQuery = null,
          hasFilters = false
        } = action.payload
        
        state.documents = documents
        state.displayedDocumentsCount = documents.length
        
        state.searchState = {
          isSearchActive: isSearchResult || hasFilters,
          searchQuery: searchQuery || '',
          hasFilters: hasFilters,
          searchResultsCount: isSearchResult ? documents.length : 0
        }
        
        if (!isSearchResult && !hasFilters) {
          state.totalDocumentsCount = total
          state.hasDocuments = total > 0
        }
        
        state.pagination = { page, limit, total, totalPages }
        state.lastFetched = Date.now()
        
        console.log('📊 Documents state updated:', {
          displayedCount: state.displayedDocumentsCount,
          totalCount: state.totalDocumentsCount,
          isSearch: isSearchResult,
          hasFilters: hasFilters
        })
      })
      .addCase(fetchUserDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      .addCase(fetchTotalDocumentsCount.fulfilled, (state, action) => {
        state.totalDocumentsCount = action.payload
        state.hasDocuments = action.payload > 0
        console.log('📊 Total documents count updated:', action.payload)
      })
      
      .addCase(uploadDocument.pending, (state) => {
        state.isUploading = true
        state.error = null
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isUploading = false
        
        state.totalDocumentsCount += 1
        state.hasDocuments = true
        state.stats.total = state.totalDocumentsCount
        
        if (!state.searchState.isSearchActive) {
          state.documents.unshift(action.payload.document)
          state.displayedDocumentsCount = state.documents.length
        }
        
        if (action.payload.document.status === 'pending') {
          state.stats.pending += 1
        } else if (action.payload.document.status === 'processing') {
          state.stats.processing += 1
        }
        
        console.log('📤 Document uploaded, total count:', state.totalDocumentsCount)
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isUploading = false
        state.error = action.payload
      })
      
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const documentId = action.payload
        
        state.documents = state.documents.filter(doc => doc.id !== documentId)
        state.displayedDocumentsCount = state.documents.length
        
        state.totalDocumentsCount = Math.max(0, state.totalDocumentsCount - 1)
        state.stats.total = state.totalDocumentsCount
        state.hasDocuments = state.totalDocumentsCount > 0
        
        console.log('🗑️ Document deleted, total count:', state.totalDocumentsCount)
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload
      })
      
      .addCase(processDocument.pending, (state) => {
        state.isProcessing = true
        state.error = null
      })
      .addCase(processDocument.fulfilled, (state, action) => {
        state.isProcessing = false
        const { documentId } = action.payload
        
        const index = state.documents.findIndex(doc => doc.id === documentId)
        if (index !== -1) {
          state.documents[index].status = 'processing'
        }
        
        state.stats.processing += 1
        state.stats.pending = Math.max(0, state.stats.pending - 1)
      })
      .addCase(processDocument.rejected, (state, action) => {
        state.isProcessing = false
        state.error = action.payload
      })
      
      .addCase(checkHasDocuments.fulfilled, (state, action) => {
        state.hasDocuments = action.payload
      })
      .addCase(checkHasDocuments.rejected, (state) => {
        state.hasDocuments = false
      })
      
      .addCase(fetchDocumentStats.fulfilled, (state, action) => {
        state.stats = action.payload
        if (action.payload.total !== undefined) {
          state.totalDocumentsCount = action.payload.total
        }
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
  updateTotalDocumentsCount,
  setLocalFilterResults, // ✅ NEW ACTION
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

export const selectTotalDocumentsCount = (state) => state.documents.totalDocumentsCount
export const selectDisplayedDocumentsCount = (state) => state.documents.displayedDocumentsCount
export const selectSearchState = (state) => state.documents.searchState

export const selectDocumentCountForSubscription = (state) => {
  return state.documents.totalDocumentsCount
}

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