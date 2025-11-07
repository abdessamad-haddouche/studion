/**
 * PATH: src/components/dashboard/ModularDashboard.jsx
 * Main Modular Dashboard Component - Fixed auth state
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

// Configuration
import { DASHBOARD_COMPONENTS, getEnabledComponents } from './DashboardConfig'

// Components
import WelcomeHeader from './WelcomeHeader'
import UserStats from './UserStats'
import UploadCTA from './UploadCTA'
import DocumentsGrid from './DocumentsGrid'
import QuickActions from './QuickActions'
import UploadModal from './UploadModal'
import LoadingSpinner from '../ui/LoadingSpinner'

// Redux
import {
  fetchUserDocuments,
  fetchDocumentStats,
  checkHasDocuments,
  clearError
} from '../../store/slices/documentsSlice'

const ModularDashboard = () => {
  const dispatch = useDispatch()
  
  // Redux state - ADD isAuthenticated here
  const { isAuthenticated } = useSelector(state => state.auth) // ← ADD THIS LINE
  const hasDocuments = useSelector(state => state.documents?.hasDocuments)
  const isLoading = useSelector(state => state.documents?.isLoading)
  const error = useSelector(state => state.documents?.error)
  
  // Local state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      // Only fetch if authenticated
      if (!isAuthenticated) {
        console.log('❌ Not authenticated, skipping dashboard init')
        setIsInitializing(false)
        return
      }

      try {
        console.log('✅ Authenticated, initializing dashboard...')
        
        // First check if user has documents (quick check)
        await dispatch(checkHasDocuments()).unwrap()
        
        // Then fetch detailed data
        await Promise.all([
          dispatch(fetchUserDocuments({ limit: 6 })).unwrap(),
          dispatch(fetchDocumentStats()).unwrap()
        ])
        
        console.log('✅ Dashboard initialized successfully')
      } catch (error) {
        console.error('❌ Dashboard initialization error:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeDashboard()
  }, [dispatch, isAuthenticated]) // Add isAuthenticated as dependency

  // Handle upload modal
  const handleUploadClick = () => {
    setShowUploadModal(true)
  }

  const handleUploadSuccess = (document) => {
    setShowUploadModal(false)
    toast.success('Document uploaded successfully! 🎉')
    
    // Refresh dashboard data
    dispatch(fetchUserDocuments({ limit: 6 }))
    dispatch(fetchDocumentStats())
  }

  const handleUploadModalClose = () => {
    setShowUploadModal(false)
  }

  // Clear error on mount
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && hasDocuments === null) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="text-red-500 mb-4">⚠️</div>
        <h3 className="font-semibold text-slate-900 mb-2">Unable to load dashboard</h3>
        <p className="text-slate-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  // Get enabled components based on user state
  const enabledComponents = getEnabledComponents(hasDocuments)

  // Component mapping
  const componentMap = {
    [DASHBOARD_COMPONENTS.WELCOME_HEADER]: (
      <WelcomeHeader key="welcome" className="mb-6" />
    ),
    [DASHBOARD_COMPONENTS.USER_STATS]: (
      <UserStats key="stats" className="mb-6" />
    ),
    [DASHBOARD_COMPONENTS.UPLOAD_CTA]: (
      <UploadCTA 
        key="upload" 
        onUploadClick={handleUploadClick}
        className="mb-6" 
      />
    ),
    [DASHBOARD_COMPONENTS.DOCUMENTS_GRID]: (
      <DocumentsGrid 
        key="documents"
        onUploadClick={handleUploadClick}
        className="mb-6" 
      />
    ),
    [DASHBOARD_COMPONENTS.QUICK_ACTIONS]: (
      <QuickActions 
        key="actions"
        onUploadClick={handleUploadClick}
        className="mb-6" 
      />
    )
    // Add more components here as needed
  }

  return (
    <div className="space-y-0">
      {/* Render enabled components in order */}
      {enabledComponents.map(componentKey => componentMap[componentKey])}
      
      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={handleUploadModalClose}
        onSuccess={handleUploadSuccess}
      />
      
      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-slate-100 rounded-lg text-xs text-slate-600">
          <strong>Dashboard Debug:</strong> 
          <span className="ml-2">
            isAuthenticated: {String(isAuthenticated)} | 
            hasDocuments: {String(hasDocuments)} | 
            enabledComponents: {enabledComponents.length} | 
            loading: {String(isLoading)}
          </span>
        </div>
      )}
    </div>
  )
}

export default ModularDashboard