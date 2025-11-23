/**
 * PATH: src/components/subscription/PlanCard.jsx
 * Updated Plan Card with MAD Currency - NO MORE DOLLARS!
 */

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Check, Star, Zap, Crown, Building, Lock } from 'lucide-react'
import Button from '../ui/Button'
import { changePlan, selectCurrentPlan } from '../../store/slices/subscriptionSlice'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import { PLAN_FEATURES } from './SubscriptionConfig'
import toast from 'react-hot-toast'

const PlanCard = ({ planKey, highlighted = false, className = '' }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentPlan = useSelector(selectCurrentPlan)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const plan = PLAN_FEATURES[planKey]
  
  if (!plan) return null
  
  const isCurrentPlan = currentPlan === planKey
  const isUpgrade = PLAN_FEATURES[currentPlan]?.price < plan.price
  
  // Icon mapping
  const iconMap = {
    free: <Star className="w-6 h-6" />,
    basic: <Check className="w-6 h-6" />,
    premium: <Zap className="w-6 h-6" />,
    plus: <Crown className="w-6 h-6" />,
    pro: <Building className="w-6 h-6" />,
    enterprise: <Building className="w-6 h-6" />
  }
  
  // Color mapping
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
  
  // ✅ FIXED: Format price in MAD currency
  const formatPlanPrice = (planData) => {
    if (planData.price === 0) return 'Free'
    
    // Handle numeric prices - display in MAD
    if (typeof planData.price === 'number') {
      const billing = planData.billing === 'year' ? '/year' : '/month'
      return `${planData.price} MAD${billing}`
    }
    
    // Handle string prices
    if (typeof planData.price === 'string') {
      // If already contains MAD, keep it
      if (planData.price.includes('MAD')) {
        return planData.price
      }
      // Convert any dollar signs to MAD
      if (planData.price.includes('$')) {
        const amount = planData.price.replace('$', '').replace('/month', '').replace('/mo', '')
        const billing = planData.billing === 'year' ? '/year' : '/month'
        return `${amount} MAD${billing}`
      }
      return planData.price
    }
    
    return 'Free'
  }
  
  // Handle plan change with authentication check
  const handlePlanChange = () => {
    if (isCurrentPlan) return
    
    // Check authentication first
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
    
    // Manual plan selection: Ask for confirmation before upgrading
    const confirmMessage = isUpgrade 
      ? `Upgrade to ${plan.name} plan for ${formatPlanPrice(plan)}?`
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
  
  // Features list
  const features = [
    `${plan.documentsLimit === -1 ? 'Unlimited' : plan.documentsLimit} documents`,
    plan.quizGeneration && 'AI Quiz Generation',
    plan.basicAnalytics && 'Basic Analytics',
    plan.strengthsWeaknesses && 'Strengths & Weaknesses Analysis',
    plan.areasOfImprovement && 'Areas of Improvement',
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
      
      {/* ✅ FIXED: Price in MAD */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          {plan.price === 0 ? (
            <span className="text-5xl font-bold text-slate-900">Free</span>
          ) : (
            <>
              <span className="text-5xl font-bold text-slate-900">
                {typeof plan.price === 'number' ? plan.price : plan.price.replace(/[^\d]/g, '')}
              </span>
              <span className="text-slate-500 ml-2">
                MAD{plan.billing === 'year' ? '/year' : '/month'}
              </span>
            </>
          )}
        </div>
        {plan.price > 0 && (
          <p className="text-slate-500 text-sm mt-2">
            Billed {plan.billing === 'year' ? 'annually' : 'monthly'}
          </p>
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