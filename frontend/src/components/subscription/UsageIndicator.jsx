/**
 * PATH: src/components/subscription/UsageIndicator.jsx
 * Usage Indicator Component - Shows plan limits and usage
 */

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AlertTriangle, Crown, TrendingUp } from 'lucide-react'
import Button from '../ui/Button'
import { 
  selectCurrentPlan,
  selectPlanFeatures,
  selectUploadProgress,
  changePlan 
} from '../../store/slices/subscriptionSlice'
import { selectDocuments } from '../../store/slices/documentsSlice'
import { PLAN_FEATURES, getNextPlanSuggestion } from './SubscriptionConfig'
import toast from 'react-hot-toast'

const UsageIndicator = ({ 
  showUpgradeButton = true,
  compact = false,
  className = '' 
}) => {
  const dispatch = useDispatch()
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)
  const uploadProgress = useSelector(selectUploadProgress)
  const documents = useSelector(selectDocuments)
  
  // Update usage count to match actual documents
  const actualUsage = documents?.length || 0
  const limit = planFeatures.documentsLimit
  const isUnlimited = limit === -1
  
  // Calculate progress
  const percentage = isUnlimited ? 0 : Math.min((actualUsage / limit) * 100, 100)
  const remaining = isUnlimited ? Infinity : Math.max(limit - actualUsage, 0)
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100
  
  const nextPlan = getNextPlanSuggestion(currentPlan)
  const nextPlanInfo = PLAN_FEATURES[nextPlan]
  
  const handleUpgrade = () => {
    window.location.href = '/pricing'
    
    // ✅ Optional: Show helpful message
    toast.info('Choose the perfect plan for your needs')
  }
  
  // Compact version for dashboard cards
  if (compact) {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 p-3 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Document Usage</span>
          {isAtLimit && <AlertTriangle className="w-4 h-4 text-red-500" />}
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex-1 bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isAtLimit ? 'bg-red-500' : 
                isNearLimit ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600">
            {isUnlimited ? '∞' : `${actualUsage}/${limit}`}
          </span>
        </div>
        
        {isAtLimit && showUpgradeButton && (
          <Button
            variant="premium"
            size="sm"
            onClick={handleUpgrade}
            className="w-full text-xs"
          >
            Upgrade for More
          </Button>
        )}
      </div>
    )
  }
  
  // Full version
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Document Usage</h3>
          <p className="text-sm text-slate-600 capitalize">{currentPlan} Plan</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentPlan === 'premium' || currentPlan === 'pro' ? (
            <Crown className="w-5 h-5 text-purple-500" />
          ) : null}
          {isAtLimit && <AlertTriangle className="w-5 h-5 text-red-500" />}
        </div>
      </div>
      
      {/* Usage Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">
            {isUnlimited ? 'Unlimited uploads' : `${actualUsage} of ${limit} documents used`}
          </span>
          {!isUnlimited && (
            <span className={`text-sm font-medium ${
              isAtLimit ? 'text-red-600' : 
              isNearLimit ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {remaining} remaining
            </span>
          )}
        </div>
        
        {!isUnlimited && (
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                isAtLimit ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                isNearLimit ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
      </div>
      
      {/* Status Messages */}
      {isAtLimit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Upload limit reached</p>
              <p className="text-xs text-red-600 mt-1">
                Upgrade to upload more documents and unlock premium features
              </p>
            </div>
          </div>
        </div>
      )}
      
      {isNearLimit && !isAtLimit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <TrendingUp className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Approaching limit</p>
              <p className="text-xs text-yellow-600 mt-1">
                Consider upgrading to avoid interruptions
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Upgrade Button */}
      {(isAtLimit || isNearLimit) && showUpgradeButton && currentPlan !== 'enterprise' && (
        <div className="space-y-2">
          <Button
            variant="premium"
            onClick={handleUpgrade}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade to {nextPlanInfo.name}</span>
            <span className="text-xs opacity-75">
              ({nextPlanInfo.documentsLimit === -1 ? 'Unlimited' : nextPlanInfo.documentsLimit} docs)
            </span>
          </Button>
          
          <div className="text-center">
            <a 
              href="/pricing" 
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Compare all plans
            </a>
          </div>
        </div>
      )}
      
      {/* Plan Features Summary */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Current Plan Features:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div>✓ AI Quiz Generation</div>
          <div>✓ Basic Analytics</div>
          {planFeatures.strengthsWeaknesses && <div>✓ Strengths & Weaknesses</div>}
          {planFeatures.prioritySupport && <div>✓ Priority Support</div>}
          {planFeatures.teamFeatures && <div>✓ Team Features</div>}
          {planFeatures.apiAccess && <div>✓ API Access</div>}
        </div>
      </div>
    </div>
  )
}

export default UsageIndicator