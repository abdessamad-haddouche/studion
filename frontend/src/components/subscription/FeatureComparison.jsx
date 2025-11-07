/**
 * PATH: src/components/subscription/FeatureComparison.jsx
 * Feature Comparison Table Component
 */

import React from 'react'
import { Check, X, Crown, Zap } from 'lucide-react'
import { PLAN_FEATURES, SUBSCRIPTION_PLANS } from './SubscriptionConfig'

const FeatureComparison = ({ className = '' }) => {
  
  // Define features to compare
  const comparisonFeatures = [
    {
      category: 'Core Features',
      features: [
        { key: 'documentsLimit', label: 'Document Uploads', type: 'limit' },
        { key: 'quizGeneration', label: 'AI Quiz Generation', type: 'boolean' },
        { key: 'basicAnalytics', label: 'Basic Analytics', type: 'boolean' },
        { key: 'strengthsWeaknesses', label: 'Strengths & Weaknesses Analysis', type: 'boolean' }
      ]
    },
    {
      category: 'Advanced Features',
      features: [
        { key: 'customQuizTypes', label: 'Custom Quiz Types', type: 'boolean' },
        { key: 'prioritySupport', label: 'Priority Support', type: 'boolean' },
        { key: 'apiAccess', label: 'API Access', type: 'boolean' },
        { key: 'teamFeatures', label: 'Team Collaboration', type: 'boolean' }
      ]
    },
    {
      category: 'Enterprise Features',
      features: [
        { key: 'customBranding', label: 'Custom Branding', type: 'boolean' },
        { key: 'ssoIntegration', label: 'SSO Integration', type: 'boolean' },
        { key: 'dedicatedSupport', label: 'Dedicated Support', type: 'boolean' }
      ]
    }
  ]
  
  const renderFeatureValue = (planKey, feature) => {
    const plan = PLAN_FEATURES[planKey]
    const value = plan[feature.key]
    
    if (feature.type === 'limit') {
      if (feature.key === 'documentsLimit') {
        return value === -1 ? 'Unlimited' : `${value} docs`
      }
      return value
    }
    
    if (feature.type === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-600 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-slate-300 mx-auto" />
      )
    }
    
    return value || '-'
  }
  
  const getPlanIcon = (planKey) => {
    switch (planKey) {
      case 'premium':
        return <Crown className="w-4 h-4 text-purple-600" />
      case 'pro':
        return <Zap className="w-4 h-4 text-emerald-600" />
      default:
        return null
    }
  }
  
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Feature Comparison</h2>
        <p className="text-slate-600 text-center mt-2">Compare all plans side by side</p>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-slate-900">Features</th>
              {SUBSCRIPTION_PLANS.map(planKey => {
                const plan = PLAN_FEATURES[planKey]
                return (
                  <th key={planKey} className="text-center py-4 px-4 min-w-[120px]">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        {getPlanIcon(planKey)}
                        <span className="font-semibold text-slate-900 capitalize">{plan.name}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        ${plan.price}/mo
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {comparisonFeatures.map((category, categoryIndex) => (
              <React.Fragment key={category.category}>
                {/* Category Header */}
                <tr className="bg-slate-50">
                  <td 
                    colSpan={SUBSCRIPTION_PLANS.length + 1} 
                    className="py-3 px-6 font-semibold text-slate-700 text-sm border-t border-slate-200"
                  >
                    {category.category}
                  </td>
                </tr>
                
                {/* Category Features */}
                {category.features.map((feature, featureIndex) => (
                  <tr 
                    key={feature.key}
                    className={`
                      border-b border-slate-100 hover:bg-slate-50 transition-colors
                      ${featureIndex === category.features.length - 1 ? 'border-b-slate-200' : ''}
                    `}
                  >
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {feature.label}
                    </td>
                    {SUBSCRIPTION_PLANS.map(planKey => (
                      <td key={planKey} className="py-4 px-4 text-center">
                        {renderFeatureValue(planKey, feature)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer Note */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
        <p className="text-sm text-slate-600 text-center">
          ✨ All plans include AI-powered document analysis and quiz generation
        </p>
      </div>
    </div>
  )
}

export default FeatureComparison