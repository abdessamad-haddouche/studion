/**
 * PATH: src/components/subscription/SubscriptionConfig.js
 * Complete Subscription Configuration with Quiz Features
 * UPDATED: Added "Areas of Improvement" feature for premium plans
 */

// ✅ ADD THESE MISSING EXPORTS AT THE TOP
export const SUBSCRIPTION_PLANS = ['free', 'basic', 'premium', 'pro', 'enterprise']

export const SUBSCRIPTION_COMPONENTS = {
  PRICING_HEADER: 'PRICING_HEADER',
  PLAN_CARDS: 'PLAN_CARDS', 
  FEATURE_COMPARISON: 'FEATURE_COMPARISON',
  FAQ_SECTION: 'FAQ_SECTION',
  UPGRADE_CTA: 'UPGRADE_CTA',
  TESTIMONIALS: 'TESTIMONIALS'
}

export const PLAN_FEATURES = {
  free: {
    name: 'Free',
    price: 0,
    description: 'Get started with basic AI learning tools',
    documentsLimit: 5,
    strengthsWeaknesses: false,
    areasOfImprovement: false, // ✅ NEW FEATURE
    prioritySupport: false,
    teamFeatures: false,
    advancedAnalytics: false,
    // ✅ Quiz Features
    quizTypes: ['true_false'],
    showExplanations: false,
    showStrengthsWeaknesses: false,
    quizHistoryLimit: 5,
    advancedQuizAnalytics: false,
    personalizedFeedback: false,
    color: 'slate'
  },

  basic: {
    name: 'Basic',
    price: 9.99,
    description: 'Enhanced learning with more documents and features',
    documentsLimit: 8,
    strengthsWeaknesses: false,
    areasOfImprovement: false, // ✅ NEW FEATURE
    prioritySupport: false,
    teamFeatures: false,
    advancedAnalytics: false,
    // ✅ Quiz Features
    quizTypes: ['true_false', 'multiple_choice'],
    showExplanations: true,
    showStrengthsWeaknesses: false,
    quizHistoryLimit: 20,
    advancedQuizAnalytics: false,
    personalizedFeedback: false,
    color: 'blue'
  },

  premium: {
    name: 'Premium',
    price: 19.99,
    description: 'Advanced learning with analytics and insights',
    documentsLimit: 25,
    strengthsWeaknesses: true,
    areasOfImprovement: true, // ✅ NEW FEATURE - Premium gets this
    prioritySupport: false,
    teamFeatures: false,
    advancedAnalytics: true,
    // ✅ Quiz Features
    quizTypes: ['true_false', 'multiple_choice'],
    showExplanations: true,
    showStrengthsWeaknesses: true,
    quizHistoryLimit: -1, // Unlimited
    advancedQuizAnalytics: true,
    personalizedFeedback: true,
    color: 'purple'
  },

  pro: {
    name: 'Pro',
    price: 39.99,
    description: 'Professional tools for power users',
    documentsLimit: 100,
    strengthsWeaknesses: true,
    areasOfImprovement: true, // ✅ NEW FEATURE - Pro gets this
    prioritySupport: true,
    teamFeatures: true,
    advancedAnalytics: true,
    // ✅ Quiz Features
    quizTypes: ['true_false', 'multiple_choice'],
    showExplanations: true,
    showStrengthsWeaknesses: true,
    quizHistoryLimit: -1,
    advancedQuizAnalytics: true,
    personalizedFeedback: true,
    teamCollaboration: true,
    color: 'green'
  },

  enterprise: {
    name: 'Enterprise',
    price: 99.99,
    description: 'Complete solution for organizations',
    documentsLimit: -1, // Unlimited
    strengthsWeaknesses: true,
    areasOfImprovement: true, // ✅ NEW FEATURE - Enterprise gets this
    prioritySupport: true,
    teamFeatures: true,
    advancedAnalytics: true,
    // ✅ Quiz Features
    quizTypes: ['true_false', 'multiple_choice'],
    showExplanations: true,
    showStrengthsWeaknesses: true,
    quizHistoryLimit: -1,
    advancedQuizAnalytics: true,
    personalizedFeedback: true,
    teamCollaboration: true,
    customIntegrations: true,
    color: 'indigo'
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

// ✅ QUIZ-SPECIFIC HELPER FUNCTIONS
export const getAvailableQuizTypes = (planKey) => {
  return PLAN_FEATURES[planKey]?.quizTypes || ['true_false']
}

export const canShowExplanations = (planKey) => {
  return PLAN_FEATURES[planKey]?.showExplanations || false
}

export const canShowStrengthsWeaknesses = (planKey) => {
  return PLAN_FEATURES[planKey]?.showStrengthsWeaknesses || false
}

// ✅ NEW: Areas of Improvement helper
export const canShowAreasOfImprovement = (planKey) => {
  return PLAN_FEATURES[planKey]?.areasOfImprovement || false
}

export const getQuizHistoryLimit = (planKey) => {
  return PLAN_FEATURES[planKey]?.quizHistoryLimit || 5
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