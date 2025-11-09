/**
 * PATH: src/store/slices/documentsSlice.js
 * FIXED Documents Redux Slice - Separates search results from total documents count
 * 
 * ✅ PROBLEM: Search results were overwriting total documents count
 * ✅ SOLUTION: Separate state for search results vs total uploaded documents
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
      
      // ✅ FIXED: Return metadata about whether this is a search or full fetch
      return {
        ...response,
        isSearchResult: !!(options.search && options.search.trim()), // Flag if this is a search
        searchQuery: options.search || null,
        hasFilters: !!(options.status || options.category || options.difficulty)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// ✅ NEW: Fetch total documents count (for subscription usage tracking)
export const fetchTotalDocumentsCount = createAsyncThunk(
  'documents/fetchTotalDocumentsCount',
  async (_, { rejectWithValue }) => {
    try {
      // This should call an endpoint that returns TOTAL user documents (not filtered)
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
    // Document lists
    documents: [], // ✅ Current displayed documents (could be search results or all)
    
    // ✅ FIXED: Separate state for tracking totals
    totalDocumentsCount: 0, // ✅ ALWAYS tracks total uploaded documents (for subscription)
    displayedDocumentsCount: 0, // ✅ Count of currently displayed documents (search results)
    
    currentDocument: null,
    
    // Pagination
    pagination: {
      page: 1,
      limit: 20,
      total: 0, // ✅ Total for current view (search or all)
      totalPages: 0
    },
    
    // Filters & Search
    filters: {
      status: null,
      category: null,
      difficulty: null,
      search: ''
    },
    
    // ✅ NEW: Search state tracking
    searchState: {
      isSearchActive: false,
      searchQuery: '',
      hasFilters: false,
      searchResultsCount: 0
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
      // ✅ FIXED: Reset search state when clearing filters
      state.searchState = {
        isSearchActive: false,
        searchQuery: '',
        hasFilters: false,
        searchResultsCount: 0
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
      
      // ✅ FIXED: Update both displayed and total counts
      state.displayedDocumentsCount = state.documents.length
      state.totalDocumentsCount = Math.max(0, state.totalDocumentsCount - 1)
      state.stats.total = state.totalDocumentsCount
    },
    
    // ✅ NEW: Update total documents count (for subscription tracking)
    updateTotalDocumentsCount: (state, action) => {
      state.totalDocumentsCount = action.payload
    },
    
    // Reset state
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
      // ==========================================
      // FETCH USER DOCUMENTS
      // ==========================================
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
        
        // ✅ FIXED: Always update displayed documents
        state.documents = documents
        state.displayedDocumentsCount = documents.length
        
        // ✅ FIXED: Update search state
        state.searchState = {
          isSearchActive: isSearchResult || hasFilters,
          searchQuery: searchQuery || '',
          hasFilters: hasFilters,
          searchResultsCount: isSearchResult ? documents.length : 0
        }
        
        // ✅ FIXED: Only update total count if this is NOT a search/filter
        if (!isSearchResult && !hasFilters) {
          state.totalDocumentsCount = total
          state.hasDocuments = total > 0
        }
        
        // Update pagination (this is for current view)
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
      
      // ==========================================
      // FETCH TOTAL DOCUMENTS COUNT
      // ==========================================
      .addCase(fetchTotalDocumentsCount.fulfilled, (state, action) => {
        state.totalDocumentsCount = action.payload
        state.hasDocuments = action.payload > 0
        console.log('📊 Total documents count updated:', action.payload)
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
        
        // ✅ FIXED: Always increment total count on successful upload
        state.totalDocumentsCount += 1
        state.hasDocuments = true
        state.stats.total = state.totalDocumentsCount
        
        // ✅ FIXED: Only add to displayed documents if not in search mode
        if (!state.searchState.isSearchActive) {
          state.documents.unshift(action.payload.document)
          state.displayedDocumentsCount = state.documents.length
        }
        
        // Update stats based on document status
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
      
      // ==========================================
      // DELETE DOCUMENT
      // ==========================================
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const documentId = action.payload
        
        // Remove from displayed documents
        state.documents = state.documents.filter(doc => doc.id !== documentId)
        state.displayedDocumentsCount = state.documents.length
        
        // ✅ FIXED: Always decrement total count
        state.totalDocumentsCount = Math.max(0, state.totalDocumentsCount - 1)
        state.stats.total = state.totalDocumentsCount
        state.hasDocuments = state.totalDocumentsCount > 0
        
        console.log('🗑️ Document deleted, total count:', state.totalDocumentsCount)
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
        // ✅ FIXED: Update total count from stats if available
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

// ✅ NEW: Selectors for proper count handling
export const selectTotalDocumentsCount = (state) => state.documents.totalDocumentsCount
export const selectDisplayedDocumentsCount = (state) => state.documents.displayedDocumentsCount
export const selectSearchState = (state) => state.documents.searchState

// ✅ NEW: Selector to determine which count to show for subscription
export const selectDocumentCountForSubscription = (state) => {
  // ALWAYS use total count for subscription tracking, not search results
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