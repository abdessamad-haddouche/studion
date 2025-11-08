/**
 * PATH: src/components/subscription/PlanCard.jsx
 * Updated Plan Card with Authentication Check
 */

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom' // ← ADD THIS
import { Check, Star, Zap, Crown, Building, Lock } from 'lucide-react'
import Button from '../ui/Button'
import { changePlan, selectCurrentPlan } from '../../store/slices/subscriptionSlice'
import { selectIsAuthenticated } from '../../store/slices/authSlice' // ← ADD THIS
import { PLAN_FEATURES } from './SubscriptionConfig'
import toast from 'react-hot-toast'

const PlanCard = ({ planKey, highlighted = false, className = '' }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate() // ← ADD THIS
  const currentPlan = useSelector(selectCurrentPlan)
  const isAuthenticated = useSelector(selectIsAuthenticated) // ← ADD THIS
  const plan = PLAN_FEATURES[planKey]
  
  if (!plan) return null
  
  const isCurrentPlan = currentPlan === planKey
  const isUpgrade = PLAN_FEATURES[currentPlan]?.price < plan.price
  
  // Icon mapping (same as before)
  const iconMap = {
    free: <Star className="w-6 h-6" />,
    basic: <Check className="w-6 h-6" />,
    premium: <Zap className="w-6 h-6" />,
    pro: <Crown className="w-6 h-6" />,
    enterprise: <Building className="w-6 h-6" />
  }
  
  // Color mapping (same as before)
  const colorMap = {
    slate: {
      bg: 'from-slate-50 to-slate-100',
      border: 'border-slate-200',
      icon: 'bg-slate-100 text-slate-600',
      button: 'secondary'
    },
    blue: {
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      button: 'primary'
    },
    purple: {
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
      icon: 'bg-purple-100 text-purple-600',
      button: 'premium'
    },
    emerald: {
      bg: 'from-emerald-50 to-green-50',
      border: 'border-emerald-200',
      icon: 'bg-emerald-100 text-emerald-600',
      button: 'success'
    },
    amber: {
      bg: 'from-amber-50 to-yellow-50',
      border: 'border-amber-200',
      icon: 'bg-amber-100 text-amber-600',
      button: 'secondary'
    }
  }
  
  const colors = colorMap[plan.color] || colorMap.slate
  
  // ✅ UPDATED: Handle plan change with authentication check
  /**
   * PATH: src/components/subscription/PlanCard.jsx
   * Update to show current plan and allow manual selection
   */
  const handlePlanChange = () => {
    if (isCurrentPlan) return
    
    // ✅ CHECK AUTHENTICATION FIRST
    if (!isAuthenticated) {
      toast.error('Please log in to upgrade your plan')
      navigate('/login', { 
        state: { 
          from: '/pricing',
          message: 'Please log in to upgrade your plan'
        }
      })
      return
    }
    
    // ✅ MANUAL PLAN SELECTION: Ask for confirmation before upgrading
    const confirmMessage = isUpgrade 
      ? `Upgrade to ${plan.name} plan for $${plan.price}/month?`
      : `Switch to ${plan.name} plan?`
    
    if (window.confirm(confirmMessage)) {
      dispatch(changePlan({ 
        plan: planKey, 
        reason: isUpgrade ? 'upgrade' : 'downgrade' 
      }))
      
      const message = isUpgrade 
        ? `🎉 Upgraded to ${plan.name}! Enjoy your new features!`
        : `✅ Switched to ${plan.name} plan`
      
      toast.success(message)
    }
  }
  
  // Features list (same as before)
  const features = [
    `${plan.documentsLimit === -1 ? 'Unlimited' : plan.documentsLimit} documents`,
    plan.quizGeneration && 'AI Quiz Generation',
    plan.basicAnalytics && 'Basic Analytics',
    plan.strengthsWeaknesses && 'Strengths & Weaknesses Analysis',
    plan.prioritySupport && 'Priority Support',
    plan.customQuizTypes && 'Custom Quiz Types',
    plan.teamFeatures && 'Team Collaboration',
    plan.apiAccess && 'API Access',
    plan.customBranding && 'Custom Branding',
    plan.ssoIntegration && 'SSO Integration',
    plan.dedicatedSupport && 'Dedicated Support'
  ].filter(Boolean)
  
  return (
    <div 
      className={`
        relative rounded-2xl p-6 transition-all duration-300 transform hover:scale-105
        ${highlighted ? 'ring-2 ring-blue-500 shadow-2xl' : 'shadow-lg hover:shadow-xl'}
        ${isCurrentPlan ? `bg-gradient-to-br ${colors.bg} border-2 ${colors.border}` : 'bg-white border border-slate-200'}
        ${className}
      `}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </div>
        </div>
      )}
      
      {/* Current Plan Badge */}
      {isCurrentPlan && isAuthenticated && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Current Plan
          </div>
        </div>
      )}
      
      {/* Login Required Badge */}
      {!isAuthenticated && planKey !== 'free' && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>Login Required</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-6">
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${colors.icon}`}>
          {iconMap[planKey]}
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
        <p className="text-slate-600 text-sm">{plan.description}</p>
      </div>
      
      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          <span className="text-5xl font-bold text-slate-900">
            ${plan.price}
          </span>
          <span className="text-slate-500 ml-2">/month</span>
        </div>
        {plan.price > 0 && (
          <p className="text-slate-500 text-sm mt-2">Billed monthly</p>
        )}
      </div>
      
      {/* Features */}
      <div className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-slate-700 text-sm">{feature}</span>
          </div>
        ))}
      </div>
      
      {/* Action Button */}
      <Button
        variant={isCurrentPlan ? 'ghost' : colors.button}
        className="w-full"
        onClick={handlePlanChange}
        disabled={isCurrentPlan && isAuthenticated}
      >
        {isCurrentPlan && isAuthenticated ? (
          'Current Plan'
        ) : !isAuthenticated && planKey !== 'free' ? (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Login to Upgrade
          </>
        ) : (
          isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`
        )}
      </Button>
    </div>
  )
}

export default PlanCard