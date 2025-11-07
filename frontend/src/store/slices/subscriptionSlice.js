/**
 * PATH: src/store/slices/subscriptionSlice.js
 * Subscription Redux Slice - Frontend-only with localStorage persistence
 */

import { createSlice } from '@reduxjs/toolkit'
import { SUBSCRIPTION_PLANS, PLAN_FEATURES } from '../../components/subscription/SubscriptionConfig'

// Get initial plan from localStorage or default to free
const getInitialPlan = () => {
  try {
    const savedPlan = localStorage.getItem('userSubscriptionPlan')
    if (savedPlan && SUBSCRIPTION_PLANS.includes(savedPlan)) {
      return savedPlan
    }
  } catch (error) {
    console.error('Error reading subscription plan from localStorage:', error)
  }
  return 'free' // Default plan
}

// Get subscription history from localStorage
const getSubscriptionHistory = () => {
  try {
    const history = localStorage.getItem('subscriptionHistory')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Error reading subscription history:', error)
    return []
  }
}

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    // Current subscription state
    currentPlan: getInitialPlan(),
    planFeatures: PLAN_FEATURES[getInitialPlan()],
    
    // Usage tracking
    documentsUploaded: 0, // This will be synced with documents count
    
    // Subscription history
    history: getSubscriptionHistory(),
    
    // UI state
    isUpgrading: false,
    showUpgradeModal: false,
    upgradeReason: null, // 'limit_reached', 'feature_locked', etc.
    
    // Plan comparison
    comparingPlans: [],
    
    // Last updated
    lastUpdated: Date.now()
  },
  reducers: {
    // ==========================================
    // PLAN MANAGEMENT
    // ==========================================
    
    /**
     * Upgrade/Change plan (instant for MVP)
     */
    changePlan: (state, action) => {
      const newPlan = action.payload.plan
      const reason = action.payload.reason || 'user_initiated'
      
      if (!SUBSCRIPTION_PLANS.includes(newPlan)) {
        console.error('Invalid subscription plan:', newPlan)
        return
      }
      
      const oldPlan = state.currentPlan
      state.currentPlan = newPlan
      state.planFeatures = PLAN_FEATURES[newPlan]
      state.lastUpdated = Date.now()
      
      // Add to history
      const historyEntry = {
        id: Date.now(),
        from: oldPlan,
        to: newPlan,
        reason,
        timestamp: Date.now(),
        method: 'frontend_simulation' // For MVP
      }
      
      state.history.unshift(historyEntry)
      
      // Keep only last 10 history entries
      if (state.history.length > 10) {
        state.history = state.history.slice(0, 10)
      }
      
      // Persist to localStorage
      try {
        localStorage.setItem('userSubscriptionPlan', newPlan)
        localStorage.setItem('subscriptionHistory', JSON.stringify(state.history))
      } catch (error) {
        console.error('Error saving subscription to localStorage:', error)
      }
      
      console.log(`🚀 Plan changed from ${oldPlan} to ${newPlan} (${reason})`)
    },
    
    /**
     * Update document usage count
     */
    updateDocumentUsage: (state, action) => {
      state.documentsUploaded = action.payload
    },
    
    /**
     * Reset to free plan
     */
    resetToFreePlan: (state) => {
      state.currentPlan = 'free'
      state.planFeatures = PLAN_FEATURES.free
      state.lastUpdated = Date.now()
      
      // Add to history
      const historyEntry = {
        id: Date.now(),
        from: state.currentPlan,
        to: 'free',
        reason: 'reset',
        timestamp: Date.now(),
        method: 'frontend_simulation'
      }
      state.history.unshift(historyEntry)
      
      // Persist
      try {
        localStorage.setItem('userSubscriptionPlan', 'free')
        localStorage.setItem('subscriptionHistory', JSON.stringify(state.history))
      } catch (error) {
        console.error('Error saving reset to localStorage:', error)
      }
    },
    
    // ==========================================
    // UI STATE MANAGEMENT
    // ==========================================
    
    /**
     * Show upgrade modal with reason
     */
    showUpgradePrompt: (state, action) => {
      state.showUpgradeModal = true
      state.upgradeReason = action.payload.reason
      state.comparingPlans = action.payload.suggestedPlans || ['premium']
    },
    
    /**
     * Hide upgrade modal
     */
    hideUpgradePrompt: (state) => {
      state.showUpgradeModal = false
      state.upgradeReason = null
      state.comparingPlans = []
    },
    
    /**
     * Set comparing plans for comparison view
     */
    setComparingPlans: (state, action) => {
      state.comparingPlans = action.payload
    },
    
    /**
     * Clear comparing plans
     */
    clearComparingPlans: (state) => {
      state.comparingPlans = []
    }
  }
})

// ==========================================
// ACTIONS EXPORT
// ==========================================

export const {
  changePlan,
  updateDocumentUsage,
  resetToFreePlan,
  showUpgradePrompt,
  hideUpgradePrompt,
  setComparingPlans,
  clearComparingPlans
} = subscriptionSlice.actions

// ==========================================
// SELECTORS
// ==========================================

export const selectCurrentPlan = (state) => state.subscription.currentPlan
export const selectPlanFeatures = (state) => state.subscription.planFeatures
export const selectDocumentUsage = (state) => state.subscription.documentsUploaded
export const selectSubscriptionHistory = (state) => state.subscription.history
export const selectUpgradeModal = (state) => state.subscription.showUpgradeModal
export const selectUpgradeReason = (state) => state.subscription.upgradeReason
export const selectComparingPlans = (state) => state.subscription.comparingPlans

// Advanced selectors
export const selectCanUploadMoreDocuments = (state) => {
  const features = state.subscription.planFeatures
  const usage = state.subscription.documentsUploaded
  
  if (features.documentsLimit === -1) return true // unlimited
  return usage < features.documentsLimit
}

export const selectUploadProgress = (state) => {
  const features = state.subscription.planFeatures
  const usage = state.subscription.documentsUploaded
  
  if (features.documentsLimit === -1) return { percentage: 0, isUnlimited: true }
  
  const percentage = Math.min((usage / features.documentsLimit) * 100, 100)
  return {
    percentage,
    isUnlimited: false,
    current: usage,
    limit: features.documentsLimit,
    remaining: Math.max(features.documentsLimit - usage, 0)
  }
}

export const selectCanAccessFeature = (feature) => (state) => {
  return !!state.subscription.planFeatures[feature]
}

export default subscriptionSlice.reducer