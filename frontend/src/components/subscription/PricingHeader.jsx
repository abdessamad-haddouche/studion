/**
 * PATH: src/components/subscription/PricingHeader.jsx
 * Pricing Page Header Component
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { Sparkles, Zap, Crown } from 'lucide-react'
import { selectCurrentPlan, selectPlanFeatures } from '../../store/slices/subscriptionSlice'
import { PLAN_FEATURES } from './SubscriptionConfig'

const PricingHeader = ({ className = '' }) => {
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)
  
  return (
    <div className={`text-center ${className}`}>
      {/* Current Plan Indicator */}
      {currentPlan && (
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">
                Currently on <span className="font-semibold text-blue-600 capitalize">{currentPlan}</span> plan
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Header */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          Choose Your Learning Plan
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
          Unlock the full power of AI-driven learning. From basic document analysis to advanced 
          analytics and team collaboration - find the perfect plan for your needs.
        </p>
        
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 text-sm">AI-Powered</h3>
              <p className="text-xs text-slate-600">Smart analysis & quizzes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 text-sm">Instant Upgrade</h3>
              <p className="text-xs text-slate-600">Switch plans anytime</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 text-sm">Premium Features</h3>
              <p className="text-xs text-slate-600">Advanced analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingHeader