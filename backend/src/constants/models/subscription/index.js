/**
 * Subscription Model Constants Public API
 * @module constants/models/subscription
 * @description Central export point for all subscription-related constants
 */

// ==========================================
// ENUM CONSTANTS
// ==========================================
export {
  // Plan Types & Status
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  BILLING_CYCLES,
  PAYMENT_PROVIDERS,
  
  // Features & Limits
  SUBSCRIPTION_FEATURES,
  PLAN_LIMITS,
  PLAN_PRICING,
  
  // Defaults
  SUBSCRIPTION_DEFAULTS,
  
  // Validation Helpers
  isValidSubscriptionPlan,
  isValidSubscriptionStatus,
  isValidBillingCycle,
  hasFeatureAccess,
  getPlanLimits,
  getPlanPrice,
  isPaidPlan,
  getUpgradePath
} from './enums.js';

// ==========================================
// VALIDATION CONSTANTS
// ==========================================
export {
  // Validation Rules
  SUBSCRIPTION_VALIDATION_RULES,
  DATE_VALIDATION_RULES,
  PAYMENT_VALIDATION_RULES,
  FEATURE_VALIDATION_RULES,
  METADATA_VALIDATION_RULES,
  
  // Validation Helper Functions
  validateSubscriptionDates,
  validatePaymentAmount,
  validateCurrency,
  validateFeatureForPlan,
  validateCustomLimits,
  validateTrialPeriod,
  calculateEndDate
} from './validation.js';