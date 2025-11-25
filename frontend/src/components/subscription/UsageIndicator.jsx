/**
 * PATH: src/components/subscription/UsageIndicator.jsx
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { 
  Crown, 
  FileText, 
  Brain, 
  BarChart3, 
  Users, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  Target,
  Zap,
  TrendingUp
} from 'lucide-react'
import Button from '../ui/Button'
import { 
  selectCurrentPlan, 
  selectPlanFeatures, 
  selectUploadProgress 
} from '../../store/slices/subscriptionSlice'

import { PLAN_FEATURES } from './SubscriptionConfig'

const UsageIndicator = ({ className = '' }) => {
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)
  const uploadProgress = useSelector(selectUploadProgress)

  const getPlanFeatures = (planKey) => {
    const plan = PLAN_FEATURES[planKey] || PLAN_FEATURES.free
    
    const features = []
    
    // Document limit
    features.push({
      name: plan.documentsLimit === -1 ? 'Unlimited Docs' : `${plan.documentsLimit} Documents`,
      available: true,
      icon: FileText
    })
    
    // Quiz types
    if (plan.quizTypes?.includes('multiple_choice')) {
      features.push({
        name: 'Multiple Choice',
        available: true,
        icon: Brain
      })
    } else {
      features.push({
        name: 'Multiple Choice',
        available: false,
        icon: Brain
      })
    }
    
    // Explanations
    features.push({
      name: 'Explanations',
      available: !!plan.showExplanations,
      icon: Lightbulb
    })
    
    // Analytics
    features.push({
      name: 'Analytics',
      available: !!(plan.basicAnalytics || plan.advancedAnalytics),
      icon: BarChart3
    })
    
    // Enhanced AI (Plus/Pro)
    if (plan.enhancedAI) {
      features.push({
        name: 'Enhanced AI',
        available: true,
        icon: Zap
      })
    }
    
    // Areas of Improvement  
    features.push({
      name: 'Improvement Areas',
      available: !!plan.areasOfImprovement,
      icon: TrendingUp
    })
    
    // Team Features (Pro only)
    if (planKey === 'pro') {
      features.push({
        name: 'Team Features',
        available: !!plan.teamFeatures,
        icon: Users
      })
    }
    
    // Priority Support (Pro only)
    if (planKey === 'pro') {
      features.push({
        name: 'Priority Support',
        available: !!plan.prioritySupport,
        icon: Shield
      })
    }
    
    return features.slice(0, 6) // Show max 6 features
  }

  const features = getPlanFeatures(currentPlan)
  
  // Get plan colors
  const getPlanColor = (plan) => {
    const colors = {
      free: 'slate',
      plus: 'purple', 
      pro: 'emerald'
    }
    return colors[plan] || 'slate'
  }

  const planColor = getPlanColor(currentPlan)

  const formatPrice = (price, billing) => {
    if (price === 0) return 'Free'
    
    if (typeof price === 'number') {
      const period = billing === 'year' ? '/yr' : '/mo'
      return `${price} MAD${period}`
    }
    
    if (typeof price === 'string') {
      if (price.includes('MAD')) {
        return price.replace('/month', '/mo').replace('/year', '/yr')
      }
      // Convert dollar format to MAD
      const amount = price.replace(/[$]/g, '').replace('/month', '').replace('/mo', '')
      const period = billing === 'year' ? '/yr' : '/mo'
      return `${amount} MAD${period}`
    }
    
    return 'Free'
  }

  // Handle navigation with smooth scrolling
  const handleViewPlans = () => {
    const isOnSubscriptionPage = window.location.pathname === '/subscription' || window.location.pathname === '/subscription/'
    
    if (isOnSubscriptionPage) {
      const element = document.getElementById('plan-cards')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      window.location.href = '/subscription#plan-cards'
    }
  }

  const handleCompareAllPlans = () => {
    const isOnSubscriptionPage = window.location.pathname === '/subscription' || window.location.pathname === '/subscription/'
    
    if (isOnSubscriptionPage) {
      const element = document.getElementById('feature-comparison')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      window.location.href = '/subscription#feature-comparison'
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            planColor === 'slate' ? 'bg-slate-100 text-slate-600' :
            planColor === 'purple' ? 'bg-purple-100 text-purple-600' :
            'bg-emerald-100 text-emerald-600'
          }`}>
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900 capitalize text-sm">
              {planFeatures.name} Plan
            </h3>
            <p className="text-xs text-slate-500">
              {formatPrice(planFeatures.price, planFeatures.billing)}
            </p>
          </div>
        </div>

        {/* Upgrade Button */}
        {currentPlan !== 'pro' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewPlans}
            className="flex items-center space-x-1 text-xs px-3 py-1.5"
          >
            <Crown className="w-3 h-3" />
            <span>Upgrade</span>
          </Button>
        )}
      </div>

      {/* Document Usage Progress (if limited) */}
      {planFeatures.documentsLimit !== -1 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-600">Documents</span>
            <span className="text-xs text-slate-500">
              {uploadProgress.current}/{uploadProgress.limit}
            </span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all ${
                uploadProgress.percentage < 70 ? 'bg-green-500' :
                uploadProgress.percentage < 90 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(uploadProgress.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-xs font-medium text-slate-700">Features</h4>
        
        <div className="grid grid-cols-3 gap-2">
          {features.slice(0, 6).map((feature, index) => (
            <div key={index} className="flex items-center space-x-1.5">
              <div className={`flex-shrink-0 w-3 h-3 ${
                feature.available ? 'text-green-500' : 'text-slate-300'
              }`}>
                {feature.available ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
              </div>
              
              <span className={`text-xs truncate ${
                feature.available ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>

        {/* Compact upgrade prompt */}
        {features.some(f => !f.available) && currentPlan !== 'pro' && (
          <div className="mt-3 p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5 mb-1">
                  <Crown className="w-3 h-3 text-purple-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-800">
                    Unlock {features.filter(f => !f.available).length} More Features
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {currentPlan === 'free' ? 'Enhanced learning tools with unlimited uploads' : 'Team features and priority support'}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleViewPlans}
                className="ml-2 text-xs px-2 py-1 h-6"
              >
                <span className="text-xs">View Plans</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Compact Footer */}
      {currentPlan !== 'pro' && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <button 
            onClick={handleCompareAllPlans}
            className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Compare All Plans →
          </button>
        </div>
      )}
    </div>
  )
}

export default UsageIndicator