/**
 * Subscription Model Validation Constants
 * @module constants/models/subscription/validation
 * @description Validation rules and patterns for subscription model
 */

// ==========================================
// SUBSCRIPTION VALIDATION RULES
// ==========================================

/**
 * Subscription validation rules
 */
export const SUBSCRIPTION_VALIDATION_RULES = Object.freeze({
  PAYMENT_ID: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9_\-\.]+$/,
    ERROR_MESSAGE: 'Payment ID can only contain letters, numbers, hyphens, underscores, and dots'
  },

  TRIAL_DAYS: {
    MIN: 0,
    MAX: 365,
    ERROR_MESSAGE: 'Trial days must be between 0 and 365'
  },

  GRACE_PERIOD_DAYS: {
    MIN: 0,
    MAX: 30,
    ERROR_MESSAGE: 'Grace period must be between 0 and 30 days'
  }
});

// ==========================================
// DATE VALIDATION RULES
// ==========================================

/**
 * Date validation rules for subscriptions
 */
export const DATE_VALIDATION_RULES = Object.freeze({
  START_DATE: {
    PAST_ALLOWED: true,
    FUTURE_LIMIT_DAYS: 30,
    ERROR_MESSAGE: 'Start date cannot be more than 30 days in the future'
  },

  END_DATE: {
    MIN_DURATION_DAYS: 1,
    MAX_DURATION_YEARS: 10,
    ERROR_MESSAGE: 'End date must be at least 1 day after start date and within 10 years'
  }
});

// ==========================================
// PAYMENT VALIDATION RULES
// ==========================================

/**
 * Payment-related validation rules
 */
export const PAYMENT_VALIDATION_RULES = Object.freeze({
  AMOUNT: {
    MIN: 0,
    MAX: 10000, // $10,000 max
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Payment amount must be between $0 and $10,000'
  },

  CURRENCY: {
    PATTERN: /^[A-Z]{3}$/,
    DEFAULT: 'USD',
    SUPPORTED: ['USD', 'EUR', 'GBP', 'MAD', 'CAD', 'AUD'],
    ERROR_MESSAGE: 'Currency must be a valid 3-letter ISO code'
  }
});

// ==========================================
// FEATURE VALIDATION RULES
// ==========================================

/**
 * Feature access validation rules
 */
export const FEATURE_VALIDATION_RULES = Object.freeze({
  FEATURES_ARRAY: {
    MAX_COUNT: 50,
    ERROR_MESSAGE: 'Cannot have more than 50 features'
  },

  CUSTOM_LIMITS: {
    DOCUMENTS_PER_MONTH: {
      MIN: -1, // -1 means unlimited
      MAX: 10000,
      ERROR_MESSAGE: 'Documents per month must be -1 (unlimited) or between 0 and 10,000'
    },

    QUIZZES_PER_MONTH: {
      MIN: -1, // -1 means unlimited
      MAX: 50000,
      ERROR_MESSAGE: 'Quizzes per month must be -1 (unlimited) or between 0 and 50,000'
    },

    STORAGE_GB: {
      MIN: 0,
      MAX: 1000, // 1TB max
      ERROR_MESSAGE: 'Storage must be between 0 and 1000 GB'
    },

    POINTS_MULTIPLIER: {
      MIN: 0.1,
      MAX: 10,
      DECIMAL_PLACES: 2,
      ERROR_MESSAGE: 'Points multiplier must be between 0.1 and 10'
    },

    COURSE_DISCOUNT_MAX: {
      MIN: 0,
      MAX: 100,
      ERROR_MESSAGE: 'Course discount maximum must be between 0% and 100%'
    }
  }
});

// ==========================================
// SUBSCRIPTION METADATA VALIDATION
// ==========================================

/**
 * Subscription metadata validation rules
 */
export const METADATA_VALIDATION_RULES = Object.freeze({
  CANCEL_REASON: {
    MAX_LENGTH: 500,
    ERROR_MESSAGE: 'Cancellation reason cannot exceed 500 characters'
  },

  NOTES: {
    MAX_LENGTH: 1000,
    ERROR_MESSAGE: 'Notes cannot exceed 1000 characters'
  },

  PROMO_CODE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[A-Z0-9_\-]+$/,
    ERROR_MESSAGE: 'Promo code can only contain uppercase letters, numbers, hyphens, and underscores'
  }
});

// ==========================================
// VALIDATION HELPER FUNCTIONS
// ==========================================

/**
 * Validate subscription date range
 */
export const validateSubscriptionDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  // End date must be after start date
  if (end <= start) {
    return false;
  }

  // Check minimum duration (1 day)
  const durationDays = (end - start) / (1000 * 60 * 60 * 24);
  if (durationDays < DATE_VALIDATION_RULES.END_DATE.MIN_DURATION_DAYS) {
    return false;
  }

  // Check maximum duration (10 years)
  const maxDurationMs = DATE_VALIDATION_RULES.END_DATE.MAX_DURATION_YEARS * 365 * 24 * 60 * 60 * 1000;
  if ((end - start) > maxDurationMs) {
    return false;
  }

  return true;
};

/**
 * Validate payment amount
 */
export const validatePaymentAmount = (amount) => {
  if (typeof amount !== 'number') {
    return false;
  }

  const rules = PAYMENT_VALIDATION_RULES.AMOUNT;
  return amount >= rules.MIN && amount <= rules.MAX;
};

/**
 * Validate currency code
 */
export const validateCurrency = (currency) => {
  if (!currency || typeof currency !== 'string') {
    return false;
  }

  return PAYMENT_VALIDATION_RULES.CURRENCY.PATTERN.test(currency) &&
         PAYMENT_VALIDATION_RULES.CURRENCY.SUPPORTED.includes(currency.toUpperCase());
};

/**
 * Validate feature access for plan
 */
export const validateFeatureForPlan = (plan, feature) => {
  // This will be imported from enums
  return true; // Simplified for MVP
};

/**
 * Validate custom plan limits
 */
export const validateCustomLimits = (limits) => {
  if (!limits || typeof limits !== 'object') {
    return true; // Custom limits are optional
  }

  const rules = FEATURE_VALIDATION_RULES.CUSTOM_LIMITS;

  // Validate documents per month
  if (limits.documentsPerMonth !== undefined) {
    const docRules = rules.DOCUMENTS_PER_MONTH;
    if (limits.documentsPerMonth !== -1 && 
        (limits.documentsPerMonth < 0 || limits.documentsPerMonth > docRules.MAX)) {
      return false;
    }
  }

  // Validate quizzes per month
  if (limits.quizzesPerMonth !== undefined) {
    const quizRules = rules.QUIZZES_PER_MONTH;
    if (limits.quizzesPerMonth !== -1 && 
        (limits.quizzesPerMonth < 0 || limits.quizzesPerMonth > quizRules.MAX)) {
      return false;
    }
  }

  // Validate storage
  if (limits.storageGB !== undefined) {
    const storageRules = rules.STORAGE_GB;
    if (limits.storageGB < storageRules.MIN || limits.storageGB > storageRules.MAX) {
      return false;
    }
  }

  // Validate points multiplier
  if (limits.pointsMultiplier !== undefined) {
    const pointsRules = rules.POINTS_MULTIPLIER;
    if (limits.pointsMultiplier < pointsRules.MIN || limits.pointsMultiplier > pointsRules.MAX) {
      return false;
    }
  }

  // Validate course discount max
  if (limits.courseDiscountMax !== undefined) {
    const discountRules = rules.COURSE_DISCOUNT_MAX;
    if (limits.courseDiscountMax < discountRules.MIN || limits.courseDiscountMax > discountRules.MAX) {
      return false;
    }
  }

  return true;
};

/**
 * Validate trial period
 */
export const validateTrialPeriod = (trialDays) => {
  if (trialDays === undefined || trialDays === null) {
    return true; // Trial is optional
  }

  if (typeof trialDays !== 'number') {
    return false;
  }

  const rules = SUBSCRIPTION_VALIDATION_RULES.TRIAL_DAYS;
  return trialDays >= rules.MIN && trialDays <= rules.MAX;
};

/**
 * Calculate subscription end date based on billing cycle
 */
export const calculateEndDate = (startDate, billingCycle) => {
  const start = new Date(startDate);
  
  switch (billingCycle) {
    case 'monthly':
      start.setMonth(start.getMonth() + 1);
      break;
    case 'quarterly':
      start.setMonth(start.getMonth() + 3);
      break;
    case 'yearly':
      start.setFullYear(start.getFullYear() + 1);
      break;
    case 'lifetime':
      start.setFullYear(start.getFullYear() + 100); // 100 years for "lifetime"
      break;
    default:
      start.setMonth(start.getMonth() + 1); // Default to monthly
  }
  
  return start;
};