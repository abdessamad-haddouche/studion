/**
 * Transaction Model Enums
 * @module constants/models/transaction/enums
 * @description Enumerated values for transaction model fields
 */

// ==========================================
// TRANSACTION TYPES
// ==========================================

/**
 * Transaction types for points and payments
 */
export const TRANSACTION_TYPES = Object.freeze([
  // Points earning transactions
  'quiz_completion',        // Points earned from completing quizzes
  'document_upload',        // Points earned from uploading documents
  'daily_login',           // Points for daily login streak
  'referral_bonus',        // Points from referring other users
  'achievement_bonus',     // Points from achievements/milestones
  'admin_adjustment',      // Manual points adjustment by admin
  
  // Points spending transactions
  'course_discount',       // Points used for course discounts
  'premium_feature',       // Points used to unlock premium features
  'bonus_content',         // Points used for bonus content access
  
  // Course purchase transactions
  'course_purchase',       // Direct course purchase
  'course_refund',         // Course purchase refund
  
  // Subscription transactions
  'subscription_payment',  // Subscription plan payment
  'subscription_refund',   // Subscription refund
  
  // Other transactions
  'withdrawal',           // Points/money withdrawal (future feature)
  'credit',               // Credit addition
  'debit'                 // Debit/charge
]);

// ==========================================
// TRANSACTION STATUS
// ==========================================

/**
 * Transaction status values
 */
export const TRANSACTION_STATUSES = Object.freeze([
  'pending',              // Transaction initiated but not completed
  'processing',           // Transaction is being processed
  'completed',            // Transaction successfully completed
  'failed',               // Transaction failed
  'cancelled',            // Transaction was cancelled
  'refunded',             // Transaction was refunded
  'expired'               // Transaction expired (for pending transactions)
]);

// ==========================================
// PAYMENT METHODS
// ==========================================

/**
 * Payment methods for transactions
 */
export const PAYMENT_METHODS = Object.freeze([
  'points',               // Paid using points
  'credit_card',          // Credit card payment
  'debit_card',           // Debit card payment
  'paypal',               // PayPal payment
  'stripe',               // Stripe payment
  'bank_transfer',        // Bank transfer
  'crypto',               // Cryptocurrency payment
  'free',                 // Free transaction (no payment)
  'admin'                 // Admin-initiated transaction
]);

// ==========================================
// DISCOUNT TYPES
// ==========================================

/**
 * Types of discounts available
 */
export const DISCOUNT_TYPES = Object.freeze([
  'percentage',           // Percentage discount (e.g., 20% off)
  'fixed_amount',         // Fixed amount discount (e.g., $10 off)
  'points',               // Points-based discount
  'free',                 // Free/100% discount
  'bogo',                 // Buy one get one free
  'bundle'                // Bundle discount
]);

// ==========================================
// CURRENCIES
// ==========================================

/**
 * Supported currencies for transactions
 */
export const TRANSACTION_CURRENCIES = Object.freeze([
  'USD',  // US Dollar
  'EUR',  // Euro
  'GBP',  // British Pound
  'MAD',  // Moroccan Dirham
  'CAD',  // Canadian Dollar
  'AUD',  // Australian Dollar
  'JPY',  // Japanese Yen
  'INR'   // Indian Rupee
]);

// ==========================================
// POINTS CONFIGURATION
// ==========================================

/**
 * Points earning rates for different activities
 */
export const POINTS_EARNING_RATES = Object.freeze({
  QUIZ_COMPLETION: {
    base: 10,               // Base points per quiz
    difficultyMultiplier: {
      easy: 1,
      medium: 1.5,
      hard: 2
    },
    performanceBonus: {
      excellent: 1.5,       // 90%+ score
      good: 1.2,           // 80-89% score
      average: 1,          // 70-79% score
      below_average: 0.8,  // 60-69% score
      poor: 0.5           // <60% score
    }
  },
  
  DOCUMENT_UPLOAD: {
    base: 5,                // Base points per document upload
    processingBonus: 5      // Bonus when AI processing completes
  },
  
  DAILY_LOGIN: {
    base: 2,                // Points for daily login
    streakMultiplier: {
      week: 1.5,            // 7-day streak bonus
      month: 2,             // 30-day streak bonus
      quarter: 3            // 90-day streak bonus
    }
  },
  
  REFERRAL_BONUS: {
    referrer: 50,           // Points for person who referred
    referee: 25             // Points for new user
  },
  
  ACHIEVEMENT_BONUS: {
    first_quiz: 20,
    first_document: 15,
    ten_quizzes: 100,
    hundred_points: 50
  }
});

/**
 * Points spending rates and conversion
 */
export const POINTS_SPENDING_RATES = Object.freeze({
  COURSE_DISCOUNT: {
    rate: 0.01,             // 1 point = 1% discount
    minPoints: 10,          // Minimum points to use
    maxPoints: 1000,        // Maximum points per transaction
    maxDiscountPercent: 50  // Maximum discount percentage
  },
  
  PREMIUM_FEATURE: {
    rate: 1,                // 1 point = $0.01 value
    minSpend: 100           // Minimum points to spend
  }
});

// ==========================================
// TRANSACTION DEFAULTS
// ==========================================

/**
 * Default values for transaction fields
 */
export const TRANSACTION_DEFAULTS = Object.freeze({
  STATUS: 'pending',
  CURRENCY: 'USD',
  PAYMENT_METHOD: 'points',
  DISCOUNT_TYPE: 'points',
  POINTS_USED: 0,
  AMOUNT: 0
});

// ==========================================
// TRANSACTION LIMITS
// ==========================================

/**
 * Transaction limits and constraints
 */
export const TRANSACTION_LIMITS = Object.freeze({
  MAX_AMOUNT: 10000,      // $10,000 maximum transaction
  MIN_AMOUNT: 0,          // $0 minimum (free transactions allowed)
  MAX_POINTS_PER_TRANSACTION: 10000,
  MAX_DISCOUNT_PERCENTAGE: 100,
  
  // Daily limits
  DAILY_POINTS_EARN_LIMIT: 1000,
  DAILY_POINTS_SPEND_LIMIT: 5000,
  DAILY_TRANSACTION_LIMIT: 50,
  
  // Description limits
  DESCRIPTION_MAX_LENGTH: 500,
  NOTES_MAX_LENGTH: 1000
});

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Check if value is valid transaction type
 */
export const isValidTransactionType = (type) => {
  return TRANSACTION_TYPES.includes(type);
};

/**
 * Check if value is valid transaction status
 */
export const isValidTransactionStatus = (status) => {
  return TRANSACTION_STATUSES.includes(status);
};

/**
 * Check if value is valid payment method
 */
export const isValidPaymentMethod = (method) => {
  return PAYMENT_METHODS.includes(method);
};

/**
 * Check if value is valid discount type
 */
export const isValidDiscountType = (type) => {
  return DISCOUNT_TYPES.includes(type);
};

/**
 * Check if currency is supported
 */
export const isValidCurrency = (currency) => {
  return TRANSACTION_CURRENCIES.includes(currency);
};

/**
 * Check if transaction type is points earning
 */
export const isPointsEarningTransaction = (type) => {
  const earningTypes = [
    'quiz_completion', 'document_upload', 'daily_login', 
    'referral_bonus', 'achievement_bonus', 'admin_adjustment'
  ];
  return earningTypes.includes(type);
};

/**
 * Check if transaction type is points spending
 */
export const isPointsSpendingTransaction = (type) => {
  const spendingTypes = [
    'course_discount', 'premium_feature', 'bonus_content'
  ];
  return spendingTypes.includes(type);
};

/**
 * Check if transaction type is monetary
 */
export const isMonetaryTransaction = (type) => {
  const monetaryTypes = [
    'course_purchase', 'course_refund', 
    'subscription_payment', 'subscription_refund'
  ];
  return monetaryTypes.includes(type);
};

/**
 * Calculate points for quiz completion
 */
export const calculateQuizPoints = (difficulty, performanceLevel) => {
  const config = POINTS_EARNING_RATES.QUIZ_COMPLETION;
  const basePoints = config.base;
  const difficultyMultiplier = config.difficultyMultiplier[difficulty] || 1;
  const performanceBonus = config.performanceBonus[performanceLevel] || 1;
  
  return Math.round(basePoints * difficultyMultiplier * performanceBonus);
};

/**
 * Calculate discount amount from points
 */
export const calculateDiscountFromPoints = (points, coursePrice) => {
  const config = POINTS_SPENDING_RATES.COURSE_DISCOUNT;
  
  // Limit points to maximum allowed
  const usablePoints = Math.min(points, config.maxPoints);
  
  // Calculate discount percentage
  const discountPercent = Math.min(usablePoints * config.rate, config.maxDiscountPercent);
  
  // Calculate discount amount
  const discountAmount = Math.min((coursePrice * discountPercent) / 100, coursePrice);
  
  return {
    pointsUsed: usablePoints,
    discountPercent,
    discountAmount,
    finalPrice: coursePrice - discountAmount
  };
};

/**
 * Get transaction type category
 */
export const getTransactionCategory = (type) => {
  if (isPointsEarningTransaction(type)) return 'points_earning';
  if (isPointsSpendingTransaction(type)) return 'points_spending';
  if (isMonetaryTransaction(type)) return 'monetary';
  return 'other';
};