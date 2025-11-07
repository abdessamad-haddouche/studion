/**
 * PATH: src/components/subscription/SubscriptionConfig.js
 * Subscription Configuration - Control which components to show
 */

export const SUBSCRIPTION_COMPONENTS = {
  PRICING_HEADER: 'pricing_header',
  PLAN_CARDS: 'plan_cards',
  FEATURE_COMPARISON: 'feature_comparison',
  FAQ_SECTION: 'faq_section',
  UPGRADE_CTA: 'upgrade_cta',
  TESTIMONIALS: 'testimonials'
}

export const SUBSCRIPTION_PLANS = Object.freeze([
  'free',
  'basic', 
  'premium',
  'pro',
  'enterprise'
])

// Plan features and limits configuration
export const PLAN_FEATURES = {
  free: {
    name: 'Free',
    price: 0,
    documentsLimit: 5,
    quizGeneration: true,
    basicAnalytics: true,
    strengthsWeaknesses: false,
    prioritySupport: false,
    customQuizTypes: false,
    teamFeatures: false,
    apiAccess: false,
    color: 'slate',
    popular: false,
    description: 'Perfect for trying out Studion'
  },
  basic: {
    name: 'Basic',
    price: 9.99,
    documentsLimit: 8,
    quizGeneration: true,
    basicAnalytics: true,
    strengthsWeaknesses: false,
    prioritySupport: false,
    customQuizTypes: true,
    teamFeatures: false,
    apiAccess: false,
    color: 'blue',
    popular: false,
    description: 'Great for regular learners'
  },
  premium: {
    name: 'Premium', 
    price: 19.99,
    documentsLimit: 25,
    quizGeneration: true,
    basicAnalytics: true,
    strengthsWeaknesses: true, // 🎯 Premium feature
    prioritySupport: true,
    customQuizTypes: true,
    teamFeatures: false,
    apiAccess: false,
    color: 'purple',
    popular: true,
    description: 'Most popular for serious students'
  },
  pro: {
    name: 'Pro',
    price: 39.99, 
    documentsLimit: 100,
    quizGeneration: true,
    basicAnalytics: true,
    strengthsWeaknesses: true,
    prioritySupport: true,
    customQuizTypes: true,
    teamFeatures: true,
    apiAccess: true,
    color: 'emerald',
    popular: false,
    description: 'Perfect for power users and tutors'
  },
  enterprise: {
    name: 'Enterprise',
    price: 99.99,
    documentsLimit: -1, // unlimited
    quizGeneration: true,
    basicAnalytics: true,
    strengthsWeaknesses: true,
    prioritySupport: true,
    customQuizTypes: true,
    teamFeatures: true,
    apiAccess: true,
    customBranding: true,
    ssoIntegration: true,
    dedicatedSupport: true,
    color: 'amber',
    popular: false,
    description: 'For schools and organizations'
  }
}

// Subscription page configuration - easily enable/disable components
export const subscriptionConfig = {
  [SUBSCRIPTION_COMPONENTS.PRICING_HEADER]: {
    enabled: true,
    showForCurrentPlan: true,
    showForOtherPlans: true,
    order: 1
  },
  
  [SUBSCRIPTION_COMPONENTS.PLAN_CARDS]: {
    enabled: true,
    showForCurrentPlan: true,
    showForOtherPlans: true,
    order: 2
  },
  
  [SUBSCRIPTION_COMPONENTS.FEATURE_COMPARISON]: {
    enabled: true,
    showForCurrentPlan: true,
    showForOtherPlans: true,
    order: 3
  },
  
  [SUBSCRIPTION_COMPONENTS.FAQ_SECTION]: {
    enabled: true,
    showForCurrentPlan: true,
    showForOtherPlans: true,
    order: 4
  },
  
  [SUBSCRIPTION_COMPONENTS.UPGRADE_CTA]: {
    enabled: false, // Can disable for now
    showForCurrentPlan: false,
    showForOtherPlans: true,
    order: 5
  },
  
  [SUBSCRIPTION_COMPONENTS.TESTIMONIALS]: {
    enabled: false, // Disable for MVP
    showForCurrentPlan: true,
    showForOtherPlans: true,
    order: 6
  }
}

/**
 * Get enabled components for subscription page
 * @param {string} currentPlan - User's current plan
 * @returns {Array} Sorted array of enabled components
 */
export const getEnabledSubscriptionComponents = (currentPlan) => {
  return Object.entries(subscriptionConfig)
    .filter(([key, config]) => {
      if (!config.enabled) return false
      if (currentPlan) return config.showForCurrentPlan
      return config.showForOtherPlans
    })
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key)
}

/**
 * Check if user can access feature
 * @param {string} userPlan - User's current plan
 * @param {string} feature - Feature to check
 * @returns {boolean} Can access feature
 */
export const canAccessFeature = (userPlan, feature) => {
  const plan = PLAN_FEATURES[userPlan] || PLAN_FEATURES.free
  return !!plan[feature]
}

/**
 * Check if user has reached upload limit
 * @param {string} userPlan - User's current plan  
 * @param {number} currentUploads - Current upload count
 * @returns {boolean} Has reached limit
 */
export const hasReachedUploadLimit = (userPlan, currentUploads) => {
  const plan = PLAN_FEATURES[userPlan] || PLAN_FEATURES.free
  if (plan.documentsLimit === -1) return false // unlimited
  return currentUploads >= plan.documentsLimit
}

/**
 * Get next plan suggestion for upgrade
 * @param {string} currentPlan - User's current plan
 * @returns {string} Next plan to suggest
 */
export const getNextPlanSuggestion = (currentPlan) => {
  const planIndex = SUBSCRIPTION_PLANS.indexOf(currentPlan)
  if (planIndex === -1 || planIndex === SUBSCRIPTION_PLANS.length - 1) {
    return 'premium' // Default to premium
  }
  return SUBSCRIPTION_PLANS[planIndex + 1]
}