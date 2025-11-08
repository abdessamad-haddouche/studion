/**
 * PATH: src/components/dashboard/ModularDashboard.jsx
 * COMPLETE Enhanced Modular Dashboard with Auto-Refresh - FULL CODE
 * 
 * ✅ ADDED:
 * - Check for quiz completion flag on mount
 * - Auto-refresh UserStats when dashboard loads
 * - Better organization of dashboard sections
 * - Conditional rendering based on user state
 * 
 * ✅ PRESERVED: All original functionality, subscription logic, usage indicators, component configuration
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { selectPlanFeatures } from '../../store/slices/subscriptionSlice'

// Configuration
import { DASHBOARD_COMPONENTS, getEnabledComponents } from './DashboardConfig'

// Components
import WelcomeHeader from './WelcomeHeader'
import UserStats from './UserStats'
import UsageIndicator from '../subscription/UsageIndicator'
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

import { updateDocumentUsage } from '../../store/slices/subscriptionSlice'

// ✅ NEW: Import user stats action
import { fetchUserStats } from '../../store/slices/authSlice'

const ModularDashboard = () => {
  const dispatch = useDispatch()
  
  // Redux state
  const { isAuthenticated } = useSelector(state => state.auth)
  const hasDocuments = useSelector(state => state.documents?.hasDocuments)
  const isLoading = useSelector(state => state.documents?.isLoading)
  const error = useSelector(state => state.documents?.error)
  const documents = useSelector(state => state.documents?.documents)
  const planFeatures = useSelector(selectPlanFeatures)

  const [forceRender, setForceRender] = useState(0)
  
  // Local state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const getDocumentsToShow = () => {
    const limit = planFeatures.documentsLimit
    if (limit === -1) return 12 // Unlimited - show more
    if (limit <= 5) return Math.min(limit, 6) // Free/small plans
    if (limit <= 25) return 9 // Premium
    return 12 // Pro/Enterprise
  }

  const documentsLimit = getDocumentsToShow()

  // ✅ ADDED: Check for quiz completion and refresh on mount
  useEffect(() => {
    if (isAuthenticated) {
      console.log('📊 ModularDashboard: Component mounted, checking for updates...')
      
      // Check if user just completed a quiz
      const quizCompleted = localStorage.getItem('quiz_completed')
      const dashboardShouldRefresh = localStorage.getItem('dashboard_should_refresh')
      
      if (quizCompleted) {
        console.log('🎯 ModularDashboard: Quiz completion detected, refreshing stats...')
        localStorage.removeItem('quiz_completed')
        
        // Small delay to ensure backend has processed the results
        setTimeout(() => {
          dispatch(fetchUserStats())
        }, 1000)
      }
      
      if (dashboardShouldRefresh) {
        console.log('🔄 ModularDashboard: Dashboard refresh requested, updating all data...')
        localStorage.removeItem('dashboard_should_refresh')
        
        dispatch(fetchUserStats())
        dispatch(fetchUserDocuments({ limit: 1000 }))
      }
    }
  }, [dispatch, isAuthenticated])

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!isAuthenticated) {
        console.log('❌ Not authenticated, skipping dashboard init')
        setIsInitializing(false)
        return
      }

      try {
        console.log('✅ Authenticated, initializing dashboard...')
        console.log(`📊 Loading ${documentsLimit} documents for ${planFeatures.name} plan`)
        
        await dispatch(checkHasDocuments()).unwrap()
        
        await Promise.all([
          dispatch(fetchUserDocuments({ limit: documentsLimit })).unwrap(),
          dispatch(fetchDocumentStats()).unwrap(),
          dispatch(fetchUserStats()).unwrap() // ✅ NEW: Fetch user stats
        ])
        
        console.log('✅ Dashboard initialized successfully')
      } catch (error) {
        console.error('❌ Dashboard initialization error:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeDashboard()
  }, [dispatch, isAuthenticated, documentsLimit])

  // Sync document count with subscription state
  useEffect(() => {
    if (documents && documents.length >= 0) {
      dispatch(updateDocumentUsage(documents.length))
      console.log('🔄 Updated document usage:', documents.length)
    }
  }, [documents, dispatch])

  // Handle upload modal
  const handleUploadClick = () => {
    setShowUploadModal(true)
  }

  /**
   * Fix the upload success flow and refresh user stats
   */
  const handleUploadSuccess = async (document) => {
    setShowUploadModal(false)
    toast.success('Document uploaded successfully! 🎉')
    
    try {
      await Promise.all([
        dispatch(fetchUserDocuments({ limit: documentsLimit })).unwrap(),
        dispatch(checkHasDocuments()).unwrap(),
        dispatch(fetchDocumentStats()).unwrap(),
        dispatch(fetchUserStats()).unwrap() // ✅ NEW: Refresh user stats after upload
      ])
      setForceRender(prev => prev + 1)
    } catch (error) {
      console.error('❌ Error refreshing dashboard:', error)
    }
  }

  useEffect(() => {
    console.log('📊 Dashboard State Update:', {
      hasDocuments,
      documentsCount: documents?.length,
      isLoading,
      forceRender
    })
  }, [hasDocuments, documents, isLoading, forceRender])

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
  const enabledComponents = getEnabledComponents(hasDocuments || (documents && documents.length > 0))

  // Component mapping with UsageIndicator
  const componentMap = {
    [DASHBOARD_COMPONENTS.WELCOME_HEADER]: (
      <WelcomeHeader key="welcome" className="mb-6" />
    ),
    [DASHBOARD_COMPONENTS.USER_STATS]: (
      <UserStats key="stats" className="mb-6" />
    ),
    [DASHBOARD_COMPONENTS.USAGE_INDICATOR]: (
      <UsageIndicator key="usage" className="mb-6" />
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
        maxDocuments={documentsLimit}
      />
    ),
    [DASHBOARD_COMPONENTS.QUICK_ACTIONS]: (
      <QuickActions 
        key="actions"
        onUploadClick={handleUploadClick}
        className="mb-6" 
      />
    )
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
            documentsCount: {documents?.length || 0} | 
            loading: {String(isLoading)}
          </span>
        </div>
      )}
    </div>
  )
}

export default ModularDashboard