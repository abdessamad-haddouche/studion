/**
 * PATH: src/components/subscription/SubscriptionConfig.js
 */

export const SUBSCRIPTION_PLANS = ['free', 'plus', 'pro']

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
    description: 'Complete learning tools with 5 documents',
    documentsLimit: 5,
    strengthsWeaknesses: true,
    areasOfImprovement: true,
    prioritySupport: false,
    teamFeatures: false,
    advancedAnalytics: true,
    basicAnalytics: true,
    quizTypes: ['true_false', 'multiple_choice'],
    showExplanations: true, 
    showStrengthsWeaknesses: true,
    quizHistoryLimit: -1,
    advancedQuizAnalytics: true,
    personalizedFeedback: true,
    color: 'slate'
  },

  plus: {
    name: 'Plus',
    price: 150,
    currency: 'MAD',
    description: 'Enhanced learning with unlimited documents and premium features',
    documentsLimit: -1,
    strengthsWeaknesses: true,
    areasOfImprovement: true,
    prioritySupport: false,
    teamFeatures: false,
    advancedAnalytics: true,
    basicAnalytics: true,
    quizTypes: ['true_false', 'multiple_choice', 'fill_blank', 'short_answer'],
    showExplanations: true,
    showStrengthsWeaknesses: true,
    quizHistoryLimit: -1, // Unlimited
    advancedQuizAnalytics: true,
    personalizedFeedback: true,
    enhancedAI: true,
    color: 'purple',
    popular: true
  },

  pro: {
    name: 'Pro',
    price: 1000,
    currency: 'MAD',
    billing: 'year',
    description: 'Professional solution with unlimited documents and team features',
    documentsLimit: -1,
    strengthsWeaknesses: true,
    areasOfImprovement: true,
    prioritySupport: true,
    teamFeatures: true,
    advancedAnalytics: true,
    basicAnalytics: true,
    quizTypes: ['true_false', 'multiple_choice', 'fill_blank', 'short_answer', 'custom'],
    showExplanations: true,
    showStrengthsWeaknesses: true,
    quizHistoryLimit: -1,
    advancedQuizAnalytics: true,
    personalizedFeedback: true,
    enhancedAI: true,
    teamCollaboration: true,
    customIntegrations: true,
    apiAccess: true,
    customBranding: true,
    dedicatedSupport: true,
    color: 'emerald'
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

export const getAvailableQuizTypes = (planKey) => {
  return PLAN_FEATURES[planKey]?.quizTypes || ['true_false']
}

export const canShowExplanations = (planKey) => {
  return PLAN_FEATURES[planKey]?.showExplanations || false
}

export const canShowStrengthsWeaknesses = (planKey) => {
  return PLAN_FEATURES[planKey]?.showStrengthsWeaknesses || false
}

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
    return 'plus' // Default to plus
  }
  return SUBSCRIPTION_PLANS[planIndex + 1]
}


/**
 * Calculate points discount percentage
 * @param {number} userPoints - User's available points
 * @returns {Object} Discount information
 */
export const calculatePointsDiscount = (userPoints) => {
  const MAX_USABLE_POINTS = 3000
  const actualPoints = Math.min(userPoints, MAX_USABLE_POINTS)
  
  let discountPercentage = 0
  let pointsToUse = 0
  
  if (actualPoints >= 3000) {
    discountPercentage = 15 // Max 15%
    pointsToUse = 3000
  } else if (actualPoints >= 2000) {
    discountPercentage = 10 // 10% for 2000+ points
    pointsToUse = 2000
  } else if (actualPoints >= 1000) {
    discountPercentage = 5 // 5% for 1000+ points
    pointsToUse = 1000
  }
  
  return {
    discountPercentage,
    pointsToUse,
    maxUsablePoints: MAX_USABLE_POINTS,
    canUsePoints: actualPoints >= 1000,
    remainingPoints: userPoints - pointsToUse
  }
}

/**
 * Calculate final course price with points discount
 * @param {number} originalPrice - Course original price
 * @param {number} userPoints - User's available points
 * @returns {Object} Price calculation details
 */
export const calculateCoursePrice = (originalPrice, userPoints) => {
  const discount = calculatePointsDiscount(userPoints)
  
  if (!discount.canUsePoints) {
    return {
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      pointsUsed: 0,
      discountPercentage: 0,
      canUsePoints: false,
      message: 'Need at least 1000 points for discount'
    }
  }
  
  const discountAmount = (originalPrice * discount.discountPercentage) / 100
  const finalPrice = Math.max(0, originalPrice - discountAmount)
  
  return {
    originalPrice,
    discountAmount,
    finalPrice,
    pointsUsed: discount.pointsToUse,
    discountPercentage: discount.discountPercentage,
    canUsePoints: true,
    maxUsablePoints: discount.maxUsablePoints,
    remainingPoints: discount.remainingPoints,
    message: `Save ${discount.discountPercentage}% with ${discount.pointsToUse} points!`
  }
}

/**
 * Format price for premium display
 */
export const formatPlanPrice = (plan) => {
  if (plan.price === 0) return 'Free'
  
  const currency = plan.currency || 'MAD'
  const billing = plan.billing === 'year' ? '/year' : '/month'
  
  if (currency === 'MAD') {
    return `${plan.price} MAD${billing}`
  }
  
  return `${plan.price} ${currency}${billing}`
}

/**
 * Get points discount tiers for UI display
 */
export const getPointsDiscountTiers = () => {
  return [
    { points: 1000, discount: 5, label: '5% Off' },
    { points: 2000, discount: 10, label: '10% Off' },
    { points: 3000, discount: 15, label: '15% Off (Max)' }
  ]
}