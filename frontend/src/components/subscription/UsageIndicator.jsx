/**
 * PATH: src/components/subscription/UsageIndicator.jsx
 * COMPACT & PROFESSIONAL - FIXED navigation to correct scroll anchors
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
  TrendingUp // ✅ NEW ICON for Areas of Improvement
} from 'lucide-react'
import Button from '../ui/Button'
import { 
  selectCurrentPlan, 
  selectPlanFeatures, 
  selectUploadProgress 
} from '../../store/slices/subscriptionSlice'

const UsageIndicator = ({ className = '' }) => {
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)
  const uploadProgress = useSelector(selectUploadProgress)

  // Get compact feature list for current plan
  const getPlanFeatures = (plan) => {
    const baseFeatures = {
      free: [
        { name: 'True/False Quizzes', available: true, icon: Brain },
        { name: 'Basic Upload', available: true, icon: FileText },
        { name: '5 Documents', available: true, icon: FileText },
        { name: 'Multiple Choice', available: false, icon: Brain },
        { name: 'Explanations', available: false, icon: Lightbulb },
        { name: 'Analytics', available: false, icon: BarChart3 }
      ],
      basic: [
        { name: 'All Quiz Types', available: true, icon: Brain },
        { name: 'Explanations', available: true, icon: Lightbulb },
        { name: '8 Documents', available: true, icon: FileText },
        { name: 'Enhanced AI', available: true, icon: Zap },
        { name: 'Analytics', available: false, icon: BarChart3 },
        { name: 'Improvement Areas', available: false, icon: TrendingUp } // ✅ NEW
      ],
      premium: [
        { name: 'All Quizzes', available: true, icon: Brain },
        { name: 'Explanations', available: true, icon: Lightbulb },
        { name: 'Strengths/Weaknesses', available: true, icon: Target },
        { name: 'Improvement Areas', available: true, icon: TrendingUp }, // ✅ NEW
        { name: '25 Documents', available: true, icon: FileText },
        { name: 'Analytics', available: true, icon: BarChart3 }
      ],
      pro: [
        { name: 'All Premium', available: true, icon: Crown },
        { name: '100 Documents', available: true, icon: FileText },
        { name: 'Priority Support', available: true, icon: Shield },
        { name: 'Team Features', available: true, icon: Users },
        { name: 'Improvement Areas', available: true, icon: TrendingUp }, // ✅ NEW
        { name: 'Advanced Analytics', available: true, icon: BarChart3 }
      ],
      enterprise: [
        { name: 'All Pro Features', available: true, icon: Crown },
        { name: 'Unlimited Docs', available: true, icon: FileText },
        { name: 'API Access', available: true, icon: Shield },
        { name: 'Dedicated Support', available: true, icon: Shield },
        { name: 'Improvement Areas', available: true, icon: TrendingUp }, // ✅ NEW
        { name: 'Custom Security', available: true, icon: Shield }
      ]
    }

    return baseFeatures[plan] || baseFeatures.free
  }

  const features = getPlanFeatures(currentPlan)
  
  // Get plan colors
  const getPlanColor = (plan) => {
    const colors = {
      free: 'slate',
      basic: 'blue', 
      premium: 'purple',
      pro: 'green',
      enterprise: 'indigo'
    }
    return colors[plan] || 'slate'
  }

  const planColor = getPlanColor(currentPlan)

  // ✅ FIXED: Handle different navigation targets with smooth scrolling
  const handleViewPlans = () => {
    const isOnSubscriptionPage = window.location.pathname === '/subscription' || window.location.pathname === '/subscription/'
    
    if (isOnSubscriptionPage) {
      // If already on subscription page, just scroll to the section
      const element = document.getElementById('plan-cards')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // Navigate to subscription page and scroll to plan cards
      window.location.href = '/subscription#plan-cards'
    }
  }

  const handleCompareAllPlans = () => {
    const isOnSubscriptionPage = window.location.pathname === '/subscription' || window.location.pathname === '/subscription/'
    
    if (isOnSubscriptionPage) {
      // If already on subscription page, just scroll to the section
      const element = document.getElementById('feature-comparison')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // Navigate to subscription page and scroll to feature comparison
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
            planColor === 'blue' ? 'bg-blue-100 text-blue-600' :
            planColor === 'purple' ? 'bg-purple-100 text-purple-600' :
            planColor === 'green' ? 'bg-green-100 text-green-600' :
            'bg-indigo-100 text-indigo-600'
          }`}>
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900 capitalize text-sm">
              {planFeatures.name} Plan
            </h3>
            <p className="text-xs text-slate-500">
              {currentPlan === 'free' ? 'Free' : `$${planFeatures.price}/mo`}
            </p>
          </div>
        </div>

        {/* Upgrade Button */}
        {currentPlan !== 'enterprise' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewPlans} // ✅ FIXED: Goes to plan cards section
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

      {/* ✅ HORIZONTAL FEATURE LAYOUT */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-slate-700">Features</h4>
        
        {/* Feature Grid - 2 rows of 3 */}
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

        {/* ✅ COMPACT UPGRADE PROMPT */}
        {features.some(f => !f.available) && currentPlan !== 'enterprise' && (
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
                  Enhanced learning tools and analytics
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleViewPlans} // ✅ FIXED: Goes to plan cards section
                className="ml-2 text-xs px-2 py-1 h-6"
              >
                <span className="text-xs">View Plans</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Compact Footer */}
      {currentPlan !== 'enterprise' && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <button 
            onClick={handleCompareAllPlans} // ✅ FIXED: Goes to feature comparison section
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