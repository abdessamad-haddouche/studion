/**
 * PATH: src/components/subscription/FeatureGate.jsx
 * Feature Gate Component - Controls access to premium features
 */

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Crown, Lock, Zap, ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import { 
  selectCurrentPlan, 
  selectCanAccessFeature,
  changePlan,
  showUpgradePrompt 
} from '../../store/slices/subscriptionSlice'
import { PLAN_FEATURES } from './SubscriptionConfig'
import toast from 'react-hot-toast'

const FeatureGate = ({ 
  feature,
  requiredPlan = 'premium',
  children,
  fallback = null,
  showUpgradePrompt: showPrompt = true,
  className = ''
}) => {
  const dispatch = useDispatch()
  const currentPlan = useSelector(selectCurrentPlan)
  const canAccess = useSelector(selectCanAccessFeature(feature))
  
  // If user can access feature, render children
  if (canAccess) {
    return children
  }
  
  // If no upgrade prompt needed, just render fallback
  if (!showPrompt) {
    return fallback
  }
  
  const requiredPlanInfo = PLAN_FEATURES[requiredPlan]
  
  const handleUpgrade = () => {
    dispatch(changePlan({ 
      plan: requiredPlan, 
      reason: 'feature_unlock' 
    }))
    
    toast.success(`🎉 Upgraded to ${requiredPlanInfo.name}! Feature unlocked!`)
  }
  
  const handleShowDetails = () => {
    dispatch(showUpgradePrompt({
      reason: 'feature_locked',
      suggestedPlans: [requiredPlan, 'pro']
    }))
  }
  
  // Render upgrade prompt
  return (
    <div className={`relative ${className}`}>
      {/* Blurred/Disabled Content */}
      <div className="relative">
        <div className="filter blur-sm pointer-events-none opacity-50">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Premium Feature
            </h3>
            
            <p className="text-slate-600 mb-4 text-sm">
              Unlock <strong>{feature.replace(/([A-Z])/g, ' $1').toLowerCase()}</strong> with 
              <span className="font-semibold text-purple-600"> {requiredPlanInfo.name}</span> plan
            </p>
            
            <div className="space-y-3">
              <Button
                variant="premium"
                size="sm"
                onClick={handleUpgrade}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Upgrade to {requiredPlanInfo.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <button
                onClick={handleShowDetails}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Compare all plans
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureGate