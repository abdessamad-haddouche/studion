/**
 * PATH: src/pages/documents/DocumentsPage.jsx
 * FIXED DocumentsPage - INFINITE LOOP RESOLVED
 * 
 * ✅ PROBLEM: handleFilterChange and handleSortChange were causing infinite re-renders
 * ✅ SOLUTION: Simplified the handlers and prevent unnecessary re-fetching
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// Configuration
import { 
  DOCUMENTS_COMPONENTS,
  VIEW_MODES,
  getEnabledDocumentsComponents,
  getDocumentLimits,
  getPaginationSettings
} from '../../components/documents/DocumentsPageConfig'

// Components
import DocumentsHeader from '../../components/documents/DocumentsHeader'
import DocumentsToolbar from '../../components/documents/DocumentsToolbar'
import DocumentsGrid from '../../components/documents/DocumentsGrid'
import DocumentsTable from '../../components/documents/DocumentsTable'
import DocumentsPagination from '../../components/documents/DocumentsPagination'
import DocumentsEmptyState from '../../components/documents/DocumentsEmptyState'
import UploadModal from '../../components/dashboard/UploadModal'

// Redux
import { 
  fetchUserDocuments,
  setFilters,
  selectDocuments,
  selectDocumentsLoading,
  selectDocumentsError,
  selectPagination,
  selectFilters
} from '../../store/slices/documentsSlice'

import { 
  selectCurrentPlan,
  selectPlanFeatures,
  updateDocumentUsage
} from '../../store/slices/subscriptionSlice'

const DocumentsPage = () => {
  const dispatch = useDispatch()
  
  // Redux state
  const { isAuthenticated } = useSelector(state => state.auth)
  const documents = useSelector(selectDocuments)
  const isLoading = useSelector(selectDocumentsLoading)
  const error = useSelector(selectDocumentsError)
  const pagination = useSelector(selectPagination)
  const filters = useSelector(selectFilters)
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)
  
  // Local state
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState([])
  const [isInitializing, setIsInitializing] = useState(true)

  // Get subscription limits
  const documentLimits = getDocumentLimits(currentPlan)
  const paginationSettings = getPaginationSettings(currentPlan)

  // Check if user has documents
  const hasDocuments = documents && documents.length > 0

  // Get enabled components based on current state
  const enabledComponents = getEnabledDocumentsComponents(hasDocuments, currentPlan, viewMode)

  // ✅ FIX: Memoize the fetch function to prevent unnecessary calls
  const fetchDocuments = useCallback(async (searchParams = {}) => {
    try {
      console.log('📄 Fetching documents with params:', searchParams)
      await dispatch(fetchUserDocuments({
        page: 1,
        limit: paginationSettings.defaultPageSize,
        ...searchParams
      }))
    } catch (error) {
      console.error('❌ Error fetching documents:', error)
    }
  }, [dispatch, paginationSettings.defaultPageSize])

  // ==========================================
  // INITIALIZATION
  // ==========================================

  useEffect(() => {
    const initializeDocumentsPage = async () => {
      if (!isAuthenticated) {
        setIsInitializing(false)
        return
      }

      try {
        console.log('📄 Initializing Documents page...')
        await fetchDocuments()
        console.log('✅ Documents page initialized successfully')
      } catch (error) {
        console.error('❌ Documents page initialization error:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeDocumentsPage()
  }, [isAuthenticated, fetchDocuments])

  // Update document usage count for subscription tracking
  useEffect(() => {
    if (documents) {
      dispatch(updateDocumentUsage(documents.length))
    }
  }, [documents, dispatch])

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleUploadClick = () => {
    setShowUploadModal(true)
  }

  const handleUploadSuccess = async (document) => {
    setShowUploadModal(false)
    // Refresh documents list
    await fetchDocuments(filters)
  }

  // ✅ FIX: Simplified filter handler - no infinite loop
  const handleFilterChange = useCallback((newFilters) => {
    console.log('🔍 Filter changed:', newFilters)
    
    // Update filters in Redux (this won't trigger re-fetch)
    dispatch(setFilters(newFilters))
    
    // Fetch documents with new filters
    fetchDocuments(newFilters)
  }, [dispatch, fetchDocuments])

  // ✅ FIX: Simplified sort handler
  const handleSortChange = useCallback((sortBy, sortOrder) => {
    console.log('📊 Sort changed:', { sortBy, sortOrder })
    
    // Fetch documents with current filters + new sort
    fetchDocuments({
      ...filters,
      sortBy,
      sortOrder
    })
  }, [filters, fetchDocuments])

  const handlePageChange = async (newPage) => {
    console.log('📄 Page changed:', newPage)
    await fetchDocuments({
      ...filters,
      page: newPage
    })
  }

  const handlePageSizeChange = async (newPageSize) => {
    console.log('📄 Page size changed:', newPageSize)
    await fetchDocuments({
      ...filters,
      page: 1,
      limit: newPageSize
    })
  }

  const handleViewModeChange = (newViewMode) => {
    console.log('👁️ View mode changed:', newViewMode)
    setViewMode(newViewMode)
  }

  const handleDocumentSelect = (documentId, isSelected) => {
    if (isSelected) {
      setSelectedDocuments(prev => [...prev, documentId])
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId))
    }
  }

  const handleBulkAction = async (action) => {
    console.log('📦 Bulk action:', action, selectedDocuments)
    
    if (action === 'clear_selection') {
      setSelectedDocuments([])
      return
    }
    
    // TODO: Implement other bulk actions (delete, export, etc.)
    setSelectedDocuments([])
  }

  // ==========================================
  // COMPONENT MAPPING
  // ==========================================

  const componentMap = {
    [DOCUMENTS_COMPONENTS.HEADER]: (
      <DocumentsHeader
        key="header"
        onUploadClick={handleUploadClick}
        documentsCount={documents?.length || 0}
        documentsLimit={documentLimits.documentsLimit}
        className="mb-6"
      />
    ),

    [DOCUMENTS_COMPONENTS.TOOLBAR]: (
      <DocumentsToolbar
        key="toolbar"
        currentPlan={currentPlan}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        selectedCount={selectedDocuments.length}
        onBulkAction={handleBulkAction}
        className="mb-6"
      />
    ),

    [DOCUMENTS_COMPONENTS.GRID]: (
      <DocumentsGrid
        key="grid"
        documents={documents}
        selectedDocuments={selectedDocuments}
        onDocumentSelect={handleDocumentSelect}
        onUploadClick={handleUploadClick}
        className="mb-6"
      />
    ),

    [DOCUMENTS_COMPONENTS.TABLE]: (
      <DocumentsTable
        key="table"
        documents={documents}
        selectedDocuments={selectedDocuments}
        onDocumentSelect={handleDocumentSelect}
        className="mb-6"
      />
    ),

    [DOCUMENTS_COMPONENTS.PAGINATION]: (
      <DocumentsPagination
        key="pagination"
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        pageSizeOptions={paginationSettings.pageSizeOptions}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        className="mb-6"
      />
    ),

    [DOCUMENTS_COMPONENTS.EMPTY_STATE]: (
      <DocumentsEmptyState
        key="empty-state"
        currentPlan={currentPlan}
        onUploadClick={handleUploadClick}
        className="mb-6"
      />
    )
  }

  // ==========================================
  // LOADING STATES
  // ==========================================

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-700">Please Login</p>
              <p className="text-sm text-slate-500">You need to be logged in to view your documents</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (isInitializing) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-700">Loading Documents</p>
              <p className="text-sm text-slate-500">Preparing your document library...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-red-500 mb-4">⚠️</div>
              <h3 className="font-semibold text-slate-900 mb-2">Unable to load documents</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Render enabled components in configured order */}
          {enabledComponents.map(componentKey => componentMap[componentKey])}
          
          {/* Loading overlay for content updates */}
          {isLoading && hasDocuments && (
            <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <LoadingSpinner size="sm" />
                  <span className="text-slate-700">Updating documents...</span>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </Layout>
  )
}

export default DocumentsPage