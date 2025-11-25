/**
 * PATH: src/pages/documents/DocumentsPage.jsx
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

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
  fetchTotalDocumentsCount,
  fetchDocumentStats,
  setFilters,
  setLocalFilterResults,
  selectDocuments,
  selectDocumentsLoading,
  selectDocumentsError,
  selectPagination,
  selectFilters,
  selectTotalDocumentsCount,
  selectSearchState
} from '../../store/slices/documentsSlice'

import { 
  selectCurrentPlan,
  selectPlanFeatures,
  updateDocumentUsage
} from '../../store/slices/subscriptionSlice'

import { fetchUserStats } from '../../store/slices/userStatsSlice'

const DocumentsPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  
  // Redux state
  const { isAuthenticated } = useSelector(state => state.auth)
  const documents = useSelector(selectDocuments)
  const isLoading = useSelector(selectDocumentsLoading)
  const error = useSelector(selectDocumentsError)
  const pagination = useSelector(selectPagination)
  const filters = useSelector(selectFilters)
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)
  
  const totalDocumentsCount = useSelector(selectTotalDocumentsCount)
  const searchState = useSelector(selectSearchState)
  
  const [allDocuments, setAllDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [isLocalFiltering, setIsLocalFiltering] = useState(false)
  
  // Local state
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState([])
  const [isInitializing, setIsInitializing] = useState(true)
  const [currentSearch, setCurrentSearch] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get subscription limits
  const documentLimits = getDocumentLimits(currentPlan)
  const paginationSettings = getPaginationSettings(currentPlan)

  const filterDocumentsLocally = useCallback((allDocs, searchTerm, filterParams) => {
    let filteredDocs = [...allDocs]
    
    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filteredDocs = filteredDocs.filter(doc => {
        // Search in title
        const titleMatch = doc.title?.toLowerCase().includes(searchLower)
        
        // Search in description
        const descMatch = doc.description?.toLowerCase().includes(searchLower)
        
        // Search in category
        const categoryMatch = doc.classification?.category?.toLowerCase().includes(searchLower)
        
        // Search in file name
        const fileNameMatch = doc.file?.originalName?.toLowerCase().includes(searchLower)
        
        return titleMatch || descMatch || categoryMatch || fileNameMatch
      })
    }
    
    // Apply other filters
    if (filterParams.status) {
      filteredDocs = filteredDocs.filter(doc => doc.status === filterParams.status)
    }
    
    if (filterParams.category) {
      filteredDocs = filteredDocs.filter(doc => 
        doc.classification?.category === filterParams.category
      )
    }
    
    if (filterParams.difficulty) {
      filteredDocs = filteredDocs.filter(doc => 
        doc.classification?.difficulty === filterParams.difficulty
      )
    }
    
    return filteredDocs
  }, [])

  // Check if user has documents
  const hasDocuments = (isLocalFiltering ? filteredDocuments : documents) && (isLocalFiltering ? filteredDocuments : documents).length > 0

  const enabledComponents = getEnabledDocumentsComponents(hasDocuments, currentPlan, viewMode)

  const fetchDocuments = useCallback(async (searchParams = {}) => {
    try {
      console.log('📄 Fetching documents with params:', searchParams)
      
      // Check if we can use client-side filtering (search only, no other filters)
      const hasOnlySearch = searchParams.search && 
        !searchParams.status && 
        !searchParams.category && 
        !searchParams.difficulty
      
      if (hasOnlySearch && allDocuments.length > 0) {
        console.log('🔍 Using CLIENT-SIDE filtering for search:', searchParams.search)
        setIsLocalFiltering(true)
        
        const filtered = filterDocumentsLocally(allDocuments, searchParams.search, searchParams)
        setFilteredDocuments(filtered)
        
        // Update Redux with filtered results
        dispatch(setLocalFilterResults({
          documents: filtered,
          total: filtered.length,
          searchTerm: searchParams.search
        }))
        
        return
      }
      
      // Otherwise, use server-side filtering
      setIsLocalFiltering(false)
      
      if (searchParams.search && searchParams.search.trim()) {
        console.log('🔍 SERVER-SIDE SEARCH FETCH for:', searchParams.search)
      } else if (Object.keys(searchParams).some(key => searchParams[key] && key !== 'page' && key !== 'limit' && key !== 'search')) {
        console.log('🏷️ FILTER FETCH:', searchParams)
      } else {
        console.log('📋 FETCHING ALL DOCUMENTS (no search/filters)')
      }
      
      const cleanParams = { ...searchParams }
      if (cleanParams.search === '' || cleanParams.search === undefined || cleanParams.search === null) {
        delete cleanParams.search
        console.log('🧹 Removed empty search param, clean params:', cleanParams)
      }
      
      const response = await dispatch(fetchUserDocuments({
        page: 1,
        limit: paginationSettings.defaultPageSize,
        ...cleanParams
      }))
      
      // Store all documents when fetching without filters (for client-side filtering)
      if (!cleanParams.search && !cleanParams.status && !cleanParams.category && !cleanParams.difficulty) {
        const fetchedDocs = response.payload?.documents || []
        setAllDocuments(fetchedDocs)
        console.log('📦 Stored', fetchedDocs.length, 'documents for client-side filtering')
      }
      
      console.log('✅ Documents fetch completed')
    } catch (error) {
      console.error('❌ Error fetching documents:', error)
    }
  }, [dispatch, paginationSettings.defaultPageSize, allDocuments, filterDocumentsLocally])

  // INITIALIZATION
  useEffect(() => {
    const initializeDocumentsPage = async () => {
      if (!isAuthenticated) {
        setIsInitializing(false)
        return
      }

      try {
        console.log('📄 Initializing Documents page...')
        
        const response = await Promise.all([
          dispatch(fetchUserDocuments()),
          dispatch(fetchTotalDocumentsCount()),
          dispatch(fetchUserStats()),
          dispatch(fetchDocumentStats())
        ])
        
        // Store initial documents for client-side filtering
        const initialDocs = response[0]?.payload?.documents || []
        setAllDocuments(initialDocs)
        console.log('📦 Initial documents stored for filtering:', initialDocs.length)
        
        console.log('✅ Documents page initialized successfully')
      } catch (error) {
        console.error('❌ Documents page initialization error:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeDocumentsPage()
  }, [isAuthenticated, dispatch])

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/documents') {
      console.log('📄 DocumentsPage: User navigated to documents, refreshing stats for Header...')
      dispatch(fetchUserStats())
    }
  }, [dispatch, isAuthenticated, location.pathname])

  useEffect(() => {
    if (totalDocumentsCount !== undefined) {
      dispatch(updateDocumentUsage(totalDocumentsCount))
    }
  }, [totalDocumentsCount, dispatch])

  // EVENT HANDLERS
  const handleUploadClick = () => {
    setShowUploadModal(true)
  }

  const handleUploadSuccess = async (document) => {
    setShowUploadModal(false)
    
    setAllDocuments(prev => [document.document, ...prev])
    
    await Promise.all([
      fetchDocuments(filters),
      dispatch(fetchTotalDocumentsCount())
    ])
  }

  const handleDocumentUpdate = (updatedDocument) => {
    console.log('📝 Document updated:', updatedDocument)
    
    setAllDocuments(prev => 
      prev.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
    )
    
    // Update in Redux
    dispatch({
      type: 'documents/updateDocumentInList',
      payload: {
        documentId: updatedDocument.id,
        updates: updatedDocument
      }
    })
  }

  const handleDocumentDelete = async (documentId) => {
    console.log('🗑️ Document deleted:', documentId)
    
    // Remove from allDocuments
    setAllDocuments(prev => prev.filter(doc => doc.id !== documentId))
    
    // Remove from Redux
    dispatch({
      type: 'documents/removeDocumentFromList',
      payload: documentId
    })
    
    await dispatch(fetchTotalDocumentsCount())
  }

  const handleFilterChange = useCallback((newFilters) => {
    console.log('🔄 FILTER CHANGE EVENT:', {
      newFilters: newFilters,
      hasSearch: !!newFilters.search,
      searchValue: newFilters.search
    })
    
    setCurrentSearch(newFilters.search || '')
    dispatch(setFilters(newFilters))
    
    // Check if we can use client-side filtering
    const hasOnlySearch = newFilters.search && 
      !newFilters.status && 
      !newFilters.category && 
      !newFilters.difficulty
    
    if (hasOnlySearch && allDocuments.length > 0) {
      console.log('🔍 Using CLIENT-SIDE filtering')
      setIsLocalFiltering(true)
      
      const filtered = filterDocumentsLocally(allDocuments, newFilters.search, newFilters)
      setFilteredDocuments(filtered)
      
      // Update Redux with filtered results
      dispatch(setLocalFilterResults({
        documents: filtered,
        total: filtered.length,
        searchTerm: newFilters.search
      }))
    } else {
      // Use server-side filtering for complex queries
      setIsLocalFiltering(false)
      fetchDocuments(newFilters)
    }
  }, [dispatch, fetchDocuments, allDocuments, filterDocumentsLocally])

  const handleClearSearch = () => {
    console.log('🧹 Clearing search')
    setCurrentSearch('')
    setIsLocalFiltering(false)
    const newFilters = { ...filters }
    delete newFilters.search
    dispatch(setFilters(newFilters))
    fetchDocuments(newFilters)
  }

  const handleClearFilters = () => {
    console.log('🧹 Clearing all filters')
    setCurrentSearch('')
    setIsLocalFiltering(false)
    dispatch(setFilters({}))
    fetchDocuments({})
  }

  const handleSortChange = useCallback((sortBy, sortOrder) => {
    console.log('📊 SORT CHANGE EVENT:', { sortBy, sortOrder })
    
    // For now, sorting requires server-side
    setIsLocalFiltering(false)
    fetchDocuments({
      ...filters,
      sortBy,
      sortOrder
    })
  }, [filters, fetchDocuments])

  const handlePageChange = async (newPage) => {
    console.log('📄 PAGE CHANGE EVENT:', newPage)
    setIsLocalFiltering(false)
    await fetchDocuments({
      ...filters,
      page: newPage
    })
  }

  const handlePageSizeChange = async (newPageSize) => {
    console.log('📏 PAGE SIZE CHANGE EVENT:', newPageSize)
    setIsLocalFiltering(false)
    await fetchDocuments({
      ...filters,
      page: 1,
      limit: newPageSize
    })
  }

  const handleViewModeChange = (newViewMode) => {
    console.log('👁️ VIEW MODE CHANGE EVENT:', newViewMode)
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
    console.log('📦 BULK ACTION EVENT:', action, selectedDocuments)
    
    if (action === 'clear_selection') {
      setSelectedDocuments([])
      return
    }
    
    setSelectedDocuments([])
  }

  const handleRefreshDocuments = async () => {
    setIsRefreshing(true)
    
    try {
      console.log('🔄 Manual refresh triggered by user')
      
      // Clear local filtering state
      setIsLocalFiltering(false)
      setFilteredDocuments([])
      
      // Fetch fresh data from server
      await Promise.all([
        fetchDocuments({}), // Get all documents fresh
        dispatch(fetchTotalDocumentsCount()),
        dispatch(fetchDocumentStats()),
        dispatch(fetchUserStats())
      ])
      
      // Update allDocuments for client-side filtering
      const refreshedDocs = documents || []
      setAllDocuments(refreshedDocs)
      
      console.log('✅ Manual refresh completed')
      toast.success('Documents refreshed!')
      
    } catch (error) {
      console.error('❌ Refresh failed:', error)
      toast.error('Failed to refresh documents')
    } finally {
      setIsRefreshing(false)
    }
  }

  const displayedDocuments = isLocalFiltering ? filteredDocuments : documents

  const componentMap = {
    [DOCUMENTS_COMPONENTS.HEADER]: (
      <DocumentsHeader
        key="header"
        onUploadClick={handleUploadClick}
        onRefresh={handleRefreshDocuments}
        isRefreshing={isRefreshing}
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
        documents={displayedDocuments}
        selectedDocuments={selectedDocuments}
        onDocumentSelect={handleDocumentSelect}
        onDocumentUpdate={handleDocumentUpdate}
        onDocumentDelete={handleDocumentDelete}
        onUploadClick={handleUploadClick}
        searchState={{
          isSearchActive: !!(filters.search && filters.search.trim()),
          searchQuery: filters.search || ''
        }}
        filters={filters}
        currentSearchTerm={filters.search || ''}
        onClearSearch={handleClearSearch}
        onClearFilters={handleClearFilters}
        totalDocumentsCount={totalDocumentsCount || 0}
        className="mb-6"
      />
    ),

    [DOCUMENTS_COMPONENTS.TABLE]: (
      <DocumentsTable
        key="table"
        documents={displayedDocuments}
        selectedDocuments={selectedDocuments}
        onDocumentSelect={handleDocumentSelect}
        onDocumentUpdate={handleDocumentUpdate}
        onDocumentDelete={handleDocumentDelete}
        searchState={{
          isSearchActive: !!currentSearch.trim(),
          searchQuery: currentSearch
        }}
        filters={filters}
        currentSearchTerm={currentSearch}
        onClearSearch={handleClearSearch}
        onClearFilters={handleClearFilters}
        onUploadClick={handleUploadClick}
        totalDocumentsCount={totalDocumentsCount || 0}
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

  // LOADING STATES
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

  // ERROR STATE
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

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {enabledComponents.map(componentKey => componentMap[componentKey])}
          
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