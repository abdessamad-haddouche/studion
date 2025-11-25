/**
 * PATH: src/components/documents/DocumentsStats.jsx
 * Documents Statistics Component
 */

import React from 'react'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Crown,
  Zap,
  BarChart3
} from 'lucide-react'
import Button from '../ui/Button'
import { getDocumentLimits } from './DocumentsPageConfig'

const DocumentsStats = ({
  currentPlan,
  documentsCount = 0,
  documentsLimit = 5,
  className = ''
}) => {
  const limits = getDocumentLimits(currentPlan)
  const isUnlimited = documentsLimit === -1
  const usagePercentage = isUnlimited ? 0 : Math.min((documentsCount / documentsLimit) * 100, 100)
  const remainingDocs = isUnlimited ? 'Unlimited' : Math.max(documentsLimit - documentsCount, 0)

  // Mock processing stats (in real app, these would come from Redux)
  const processingStats = {
    completed: Math.floor(documentsCount * 0.8), // 80% completed
    processing: Math.floor(documentsCount * 0.15), // 15% processing
    pending: Math.floor(documentsCount * 0.05) // 5% pending
  }

  const getPlanColor = () => {
    const colors = {
      free: 'text-slate-600',
      basic: 'text-blue-600',
      premium: 'text-purple-600',
      pro: 'text-green-600',
      enterprise: 'text-orange-600'
    }
    return colors[currentPlan] || colors.free
  }

  const getUpgradeRecommendation = () => {
    if (usagePercentage >= 90) {
      return {
        level: 'urgent',
        message: 'Almost out of storage! Upgrade now to continue uploading.',
        action: 'Upgrade Now',
        color: 'bg-red-50 border-red-200 text-red-800'
      }
    } else if (usagePercentage >= 70) {
      return {
        level: 'warning',
        message: 'Running low on storage space. Consider upgrading soon.',
        action: 'View Plans',
        color: 'bg-amber-50 border-amber-200 text-amber-800'
      }
    } else if (currentPlan === 'free' && documentsCount >= 3) {
      return {
        level: 'suggestion',
        message: 'Unlock more storage and advanced features with Premium.',
        action: 'Upgrade',
        color: 'bg-blue-50 border-blue-200 text-blue-800'
      }
    }
    return null
  }

  const upgradeRec = getUpgradeRecommendation()

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Document Statistics</h3>
            <p className="text-sm text-slate-600">Your usage and processing overview</p>
          </div>
        </div>
        
        {/* Plan Badge */}
        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 text-sm font-medium ${getPlanColor()}`}>
          {currentPlan !== 'free' && <Crown className="w-4 h-4" />}
          <span className="capitalize">{currentPlan}</span>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Total Documents */}
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">{documentsCount}</div>
          <div className="text-sm text-slate-600">
            {isUnlimited ? 'Documents' : `of ${documentsLimit}`}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isUnlimited ? 'Unlimited storage' : `${remainingDocs} remaining`}
          </div>
        </div>

        {/* Processing Status */}
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">{processingStats.completed}</div>
          <div className="text-sm text-slate-600">Processed</div>
          <div className="text-xs text-slate-500 mt-1">Ready for quizzes</div>
        </div>

        {/* Processing Queue */}
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {processingStats.processing + processingStats.pending}
          </div>
          <div className="text-sm text-slate-600">Processing</div>
          <div className="text-xs text-slate-500 mt-1">In queue</div>
        </div>
      </div>

      {/* Usage Bar */}
      {!isUnlimited && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Storage Usage</span>
            <span className="font-medium text-slate-900">{usagePercentage.toFixed(1)}%</span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                usagePercentage >= 90 ? 'bg-red-500' :
                usagePercentage >= 70 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{documentsCount} used</span>
            <span>{documentsLimit} limit</span>
          </div>
        </div>
      )}

      {/* Plan Features Summary */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-slate-900 mb-3">Your Plan Features</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-slate-700">
              {isUnlimited ? 'Unlimited' : documentsLimit} Documents
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-slate-700">
              {limits.maxFileSize}MB File Size
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-slate-700">
              {limits.allowedFormats.length} File Types
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-slate-700">
              {limits.features.includes('advanced_search') ? 'Advanced' : 'Basic'} Search
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade Recommendation */}
      {upgradeRec && (
        <div className={`rounded-lg p-4 border ${upgradeRec.color}`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {upgradeRec.level === 'urgent' ? (
                <AlertCircle className="w-5 h-5" />
              ) : upgradeRec.level === 'warning' ? (
                <Clock className="w-5 h-5" />
              ) : (
                <TrendingUp className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">
                {upgradeRec.level === 'urgent' ? 'Storage Full!' :
                 upgradeRec.level === 'warning' ? 'Storage Warning' :
                 'Upgrade Available'}
              </p>
              <p className="text-sm opacity-90 mb-3">{upgradeRec.message}</p>
              <Button
                variant={upgradeRec.level === 'urgent' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => window.location.href = '/pricing'}
                className="flex items-center space-x-2"
              >
                {upgradeRec.level !== 'suggestion' && <Zap className="w-4 h-4" />}
                <span>{upgradeRec.action}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="text-sm text-slate-600">
          Last updated: just now
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/analytics'}
            className="text-slate-600"
          >
            View Analytics
          </Button>
          {currentPlan === 'free' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.href = '/pricing'}
              className="flex items-center space-x-1"
            >
              <Crown className="w-3 h-3" />
              <span>Upgrade</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentsStats