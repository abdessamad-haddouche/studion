/**
 * PATH: src/components/documents/DocumentsHeader.jsx
 * Page Header - Separates search results from total documents count
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  FileText, 
  Upload, 
  Home, 
  ChevronRight, 
  Plus,
  Crown,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react'
import Button from '../ui/Button'
import { 
  selectCurrentPlan,
  selectPlanFeatures 
} from '../../store/slices/subscriptionSlice'
import { 
  selectTotalDocumentsCount,
  selectDisplayedDocumentsCount,
  selectSearchState,
  selectDocumentStats
} from '../../store/slices/documentsSlice'
import { hasReachedUploadLimit } from './DocumentsPageConfig'

const DocumentsHeader = ({ 
  onUploadClick,
  onRefresh,
  isRefreshing,
  className = '' 
}) => {
  const navigate = useNavigate()
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)
  
  const totalDocumentsCount = useSelector(selectTotalDocumentsCount) // For subscription limits
  const displayedDocumentsCount = useSelector(selectDisplayedDocumentsCount) // For current view
  const searchState = useSelector(selectSearchState)
  const documentStats = useSelector(selectDocumentStats)
  
  const documentsLimit = planFeatures.documentsLimit
  
  const hasReachedLimit = hasReachedUploadLimit(currentPlan, totalDocumentsCount)
  const isUnlimited = documentsLimit === -1
  const remainingUploads = isUnlimited ? 'Unlimited' : Math.max(documentsLimit - totalDocumentsCount, 0)
  const usagePercentage = isUnlimited ? 0 : Math.min((totalDocumentsCount / documentsLimit) * 100, 100)

  // Get plan display info
  const getPlanInfo = () => {
    const planColors = {
      free: 'text-slate-600',
      basic: 'text-blue-600', 
      premium: 'text-purple-600',
      pro: 'text-green-600',
      enterprise: 'text-orange-600'
    }
    
    return {
      color: planColors[currentPlan] || planColors.free,
      name: currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)
    }
  }

  const planInfo = getPlanInfo()

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      {/* Main Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          
          {/* Left: Title and Breadcrumbs */}
          <div className="flex-1">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-2">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center hover:text-blue-600 transition-colors"
              >
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 font-medium">Documents</span>
            </nav>

            {/* Title and Description */}
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
                <p className="text-slate-600">
                  Manage and organize your AI-processed documents
                </p>
              </div>
            </div>

            {/* Plan Badge and Document Counts */}
            <div className="flex items-center space-x-4">
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-slate-100 text-xs font-medium ${planInfo.color}`}>
                {currentPlan !== 'free' && <Crown className="w-3 h-3" />}
                <span>{planInfo.name} Plan</span>
              </div>
              
              {searchState.isSearchActive ? (
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Search className="w-3 h-3" />
                  <span>
                    Showing {displayedDocumentsCount} of {totalDocumentsCount} documents
                    {searchState.searchQuery && ` for "${searchState.searchQuery}"`}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  {isUnlimited ? (
                    <span>{totalDocumentsCount} documents uploaded</span>
                  ) : (
                    <span>{totalDocumentsCount} of {documentsLimit} documents used</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Upload Button and Stats */}
          <div className="flex items-center space-x-4">
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-4 text-sm">
              
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="font-semibold text-slate-900">{totalDocumentsCount}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
              
              {/* Show current view count if different from total */}
              {searchState.isSearchActive && displayedDocumentsCount !== totalDocumentsCount && (
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mb-1">
                    <Search className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="font-semibold text-slate-900">{displayedDocumentsCount}</div>
                  <div className="text-xs text-slate-500">Showing</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="font-semibold text-slate-900">{documentStats.processed || 0}</div>
                <div className="text-xs text-slate-500">Processed</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mb-1">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="font-semibold text-slate-900">{documentStats.processing || 0}</div>
                <div className="text-xs text-slate-500">Processing</div>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex flex-col items-end space-y-2">
              {hasReachedLimit ? (
                <Button
                  onClick={() => navigate('/pricing')}
                  variant="premium"
                  className="flex items-center space-x-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade to Upload More</span>
                </Button>
              ) : (
                <Button
                  onClick={onUploadClick}
                  variant="primary"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Upload Document</span>
                </Button>
              )}
              
              {/* Upload limit indicator */}
              {!isUnlimited && (
                <div className="text-xs text-slate-500 text-right">
                  {hasReachedLimit ? (
                    <span className="text-red-600 font-medium">Upload limit reached</span>
                  ) : (
                    <span>{remainingUploads} uploads remaining</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isUnlimited && (
        <div className="px-6 py-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Storage Usage</span>
            <span className="font-medium text-slate-900">
              {totalDocumentsCount}/{documentsLimit} documents
            </span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage >= 90 ? 'bg-red-500' :
                usagePercentage >= 70 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          
          {usagePercentage >= 80 && (
            <div className="mt-2 text-xs text-amber-600 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>
                {usagePercentage >= 90 
                  ? 'Almost out of storage space' 
                  : 'Running low on storage space'
                }
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DocumentsHeader