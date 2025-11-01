/**
 * Subscription Model Enums
 * @module constants/models/subscription/enums
 * @description Enumerated values for subscription model fields
 */

// ==========================================
// SUBSCRIPTION PLAN TYPES
// ==========================================

/**
 * Available subscription plans
 */
export const SUBSCRIPTION_PLANS = Object.freeze([
  'free',           // Free tier with limited features
  'basic',          // Basic paid plan
  'premium',        // Premium plan with all features
  'pro',            // Professional plan for power users
  'enterprise'      // Enterprise plan for organizations
]);

// ==========================================
// SUBSCRIPTION STATUS
// ==========================================

/**
 * Subscription status values
 */
export const SUBSCRIPTION_STATUSES = Object.freeze([
  'active',         // Active subscription
  'inactive',       // Inactive/expired subscription
  'cancelled',      // User cancelled subscription
  'suspended',      // Temporarily suspended
  'pending',        // Payment pending
  'trial'           // Trial period
]);

// ==========================================
// BILLING CYCLES
// ==========================================

/**
 * Billing frequency options
 */
export const BILLING_CYCLES = Object.freeze([
  'monthly',        // Monthly billing
  'quarterly',      // Every 3 months
  'yearly',         // Annual billing
  'lifetime'        // One-time lifetime payment
]);

// ==========================================
// PAYMENT PROVIDERS
// ==========================================

/**
 * Supported payment providers
 */
export const PAYMENT_PROVIDERS = Object.freeze([
  'stripe',         // Stripe payment processor
  'paypal',         // PayPal payments
  'razorpay',       // Razorpay (for Indian market)
  'manual',         // Manual/offline payments
  'free'            // Free tier (no payment)
]);

// ==========================================
// SUBSCRIPTION FEATURES
// ==========================================

/**
 * Available subscription features
 */
export const SUBSCRIPTION_FEATURES = Object.freeze([
  'pdf_upload',             // PDF document upload
  'ai_summarization',       // AI-powered document summarization
  'quiz_generation',        // AI quiz generation
  'unlimited_documents',    // Unlimited document uploads
  'unlimited_quizzes',      // Unlimited quiz generation
  'performance_analytics',  // Advanced performance analytics
  'course_recommendations', // AI course recommendations
  'points_system',          // Points earning and redemption
  'course_discounts',       // Course purchase discounts
  'priority_support',       // Priority customer support
  'custom_branding',        // Custom branding options
  'api_access',             // API access for integrations
  'bulk_operations',        // Bulk document/quiz operations
  'advanced_reporting'      // Advanced analytics and reporting
]);

// ==========================================
// PLAN LIMITS
// ==========================================

/**
 * Resource limits for different plans
 */
export const PLAN_LIMITS = Object.freeze({
  free: {
    documentsPerMonth: 5,
    quizzesPerMonth: 10,
    storageGB: 1,
    pointsMultiplier: 1,
    courseDiscountMax: 10, // max 10% discount
    features: ['pdf_upload', 'ai_summarization', 'quiz_generation', 'points_system']
  },
  
  basic: {
    documentsPerMonth: 50,
    quizzesPerMonth: 100,
    storageGB: 10,
    pointsMultiplier: 1.5,
    courseDiscountMax: 25, // max 25% discount
    features: [
      'pdf_upload', 'ai_summarization', 'quiz_generation', 
      'performance_analytics', 'points_system', 'course_discounts'
    ]
  },
  
  premium: {
    documentsPerMonth: 200,
    quizzesPerMonth: 500,
    storageGB: 50,
    pointsMultiplier: 2,
    courseDiscountMax: 50, // max 50% discount
    features: [
      'pdf_upload', 'ai_summarization', 'quiz_generation',
      'unlimited_documents', 'unlimited_quizzes', 'performance_analytics',
      'course_recommendations', 'points_system', 'course_discounts',
      'priority_support'
    ]
  },
  
  pro: {
    documentsPerMonth: -1, // unlimited
    quizzesPerMonth: -1,   // unlimited
    storageGB: 100,
    pointsMultiplier: 2.5,
    courseDiscountMax: 75, // max 75% discount
    features: [
      'pdf_upload', 'ai_summarization', 'quiz_generation',
      'unlimited_documents', 'unlimited_quizzes', 'performance_analytics',
      'course_recommendations', 'points_system', 'course_discounts',
      'priority_support', 'advanced_reporting', 'bulk_operations'
    ]
  },
  
  enterprise: {
    documentsPerMonth: -1, // unlimited
    quizzesPerMonth: -1,   // unlimited
    storageGB: 500,
    pointsMultiplier: 3,
    courseDiscountMax: 90, // max 90% discount
    features: [
      'pdf_upload', 'ai_summarization', 'quiz_generation',
      'unlimited_documents', 'unlimited_quizzes', 'performance_analytics',
      'course_recommendations', 'points_system', 'course_discounts',
      'priority_support', 'advanced_reporting', 'bulk_operations',
      'custom_branding', 'api_access'
    ]
  }
});

// ==========================================
// PLAN PRICING
// ==========================================

/**
 * Pricing for subscription plans (in USD)
 */
export const PLAN_PRICING = Object.freeze({
  free: {
    monthly: 0,
    yearly: 0
  },
  
  basic: {
    monthly: 9.99,
    yearly: 99.99  // 2 months free
  },
  
  premium: {
    monthly: 19.99,
    yearly: 199.99 // 2 months free
  },
  
  pro: {
    monthly: 39.99,
    yearly: 399.99 // 2 months free
  },
  
  enterprise: {
    monthly: 99.99,
    yearly: 999.99 // 2 months free
  }
});

// ==========================================
// SUBSCRIPTION DEFAULTS
// ==========================================

/**
 * Default values for subscription fields
 */
export const SUBSCRIPTION_DEFAULTS = Object.freeze({
  PLAN: 'free',
  STATUS: 'active',
  BILLING_CYCLE: 'monthly',
  AUTO_RENEW: true,
  TRIAL_DAYS: 14,
  GRACE_PERIOD_DAYS: 3
});

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Check if value is valid subscription plan
 */
export const isValidSubscriptionPlan = (plan) => {
  return SUBSCRIPTION_PLANS.includes(plan);
};

/**
 * Check if value is valid subscription status
 */
export const isValidSubscriptionStatus = (status) => {
  return SUBSCRIPTION_STATUSES.includes(status);
};

/**
 * Check if value is valid billing cycle
 */
export const isValidBillingCycle = (cycle) => {
  return BILLING_CYCLES.includes(cycle);
};

/**
 * Check if user has feature access
 */
export const hasFeatureAccess = (userPlan, feature) => {
  const limits = PLAN_LIMITS[userPlan];
  return limits && limits.features.includes(feature);
};

/**
 * Get plan limits for a subscription plan
 */
export const getPlanLimits = (plan) => {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};

/**
 * Get plan pricing
 */
export const getPlanPrice = (plan, cycle = 'monthly') => {
  const pricing = PLAN_PRICING[plan];
  return pricing ? pricing[cycle] : 0;
};

/**
 * Check if plan is paid
 */
export const isPaidPlan = (plan) => {
  return plan !== 'free';
};

/**
 * Get plan upgrade path
 */
export const getUpgradePath = (currentPlan) => {
  const planHierarchy = ['free', 'basic', 'premium', 'pro', 'enterprise'];
  const currentIndex = planHierarchy.indexOf(currentPlan);
  
  if (currentIndex === -1 || currentIndex === planHierarchy.length - 1) {
    return null;
  }
  
  return planHierarchy[currentIndex + 1];
};