/**
 * Transaction Model Validation Constants
 * @module constants/models/transaction/validation
 * @description Validation rules and patterns for transaction model
 */

// ==========================================
// TRANSACTION VALIDATION RULES
// ==========================================

/**
 * Transaction validation rules
 */
export const TRANSACTION_VALIDATION_RULES = Object.freeze({
  AMOUNT: {
    MIN: 0,
    MAX: 100000, // $100,000 maximum
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Transaction amount must be between $0 and $100,000'
  },

  POINTS_USED: {
    MIN: 0,
    MAX: 50000, // 50,000 points maximum per transaction
    ERROR_MESSAGE: 'Points used must be between 0 and 50,000'
  },

  POINTS_EARNED: {
    MIN: 0,
    MAX: 10000, // 10,000 points maximum per transaction
    ERROR_MESSAGE: 'Points earned must be between 0 and 10,000'
  },

  DESCRIPTION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
    ERROR_MESSAGE: 'Description must be between 1 and 500 characters'
  },

  REFERENCE_ID: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9_\-\.]+$/,
    ERROR_MESSAGE: 'Reference ID can only contain letters, numbers, hyphens, underscores, and dots'
  },

  NOTES: {
    MAX_LENGTH: 1000,
    ERROR_MESSAGE: 'Notes cannot exceed 1000 characters'
  }
});

// ==========================================
// DISCOUNT VALIDATION RULES
// ==========================================

/**
 * Discount validation rules
 */
export const DISCOUNT_VALIDATION_RULES = Object.freeze({
  PERCENTAGE: {
    MIN: 0,
    MAX: 100,
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Discount percentage must be between 0% and 100%'
  },

  AMOUNT: {
    MIN: 0,
    MAX: 10000, // $10,000 maximum discount
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Discount amount must be between $0 and $10,000'
  },

  CODE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[A-Z0-9_\-]+$/,
    ERROR_MESSAGE: 'Discount code can only contain uppercase letters, numbers, hyphens, and underscores'
  }
});

// ==========================================
// PAYMENT VALIDATION RULES
// ==========================================

/**
 * Payment validation rules
 */
export const PAYMENT_VALIDATION_RULES = Object.freeze({
  PAYMENT_ID: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9_\-\.]+$/,
    ERROR_MESSAGE: 'Payment ID format is invalid'
  },

  GATEWAY_RESPONSE: {
    MAX_LENGTH: 2000,
    ERROR_MESSAGE: 'Gateway response cannot exceed 2000 characters'
  },

  TRANSACTION_FEE: {
    MIN: 0,
    MAX: 1000, // $1,000 maximum fee
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Transaction fee must be between $0 and $1,000'
  }
});

// ==========================================
// POINTS CALCULATION RULES
// ==========================================

/**
 * Points calculation and validation rules
 */
export const POINTS_VALIDATION_RULES = Object.freeze({
  RATE_LIMITS: {
    DAILY_EARN_MAX: 1000,
    DAILY_SPEND_MAX: 5000,
    TRANSACTION_MAX: 10000,
    ERROR_MESSAGE: 'Points transaction exceeds daily or transaction limits'
  },

  CONVERSION_RATES: {
    POINTS_TO_CURRENCY: {
      MIN: 0.001, // 1 point = $0.001 minimum
      MAX: 1,     // 1 point = $1 maximum
      DEFAULT: 0.01, // 1 point = $0.01 default
      ERROR_MESSAGE: 'Points conversion rate must be between $0.001 and $1 per point'
    }
  },

  MULTIPLIERS: {
    MIN: 0.1,
    MAX: 10,
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Points multiplier must be between 0.1 and 10'
  }
});

// ==========================================
// METADATA VALIDATION RULES
// ==========================================

/**
 * Transaction metadata validation rules
 */
export const METADATA_VALIDATION_RULES = Object.freeze({
  IP_ADDRESS: {
    PATTERN: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
    ERROR_MESSAGE: 'Invalid IP address format'
  },

  USER_AGENT: {
    MAX_LENGTH: 500,
    ERROR_MESSAGE: 'User agent cannot exceed 500 characters'
  },

  DEVICE_INFO: {
    MAX_LENGTH: 200,
    ERROR_MESSAGE: 'Device info cannot exceed 200 characters'
  }
});

// ==========================================
// VALIDATION HELPER FUNCTIONS
// ==========================================

/**
 * Validate transaction amount
 */
export const validateTransactionAmount = (amount) => {
  if (typeof amount !== 'number') {
    return false;
  }

  const rules = TRANSACTION_VALIDATION_RULES.AMOUNT;
  return amount >= rules.MIN && amount <= rules.MAX;
};

/**
 * Validate points amount
 */
export const validatePointsAmount = (points, type = 'used') => {
  if (typeof points !== 'number' || points < 0) {
    return false;
  }

  const rules = type === 'earned' 
    ? TRANSACTION_VALIDATION_RULES.POINTS_EARNED
    : TRANSACTION_VALIDATION_RULES.POINTS_USED;

  return points >= rules.MIN && points <= rules.MAX;
};

/**
 * Validate discount percentage
 */
export const validateDiscountPercentage = (percentage) => {
  if (typeof percentage !== 'number') {
    return false;
  }

  const rules = DISCOUNT_VALIDATION_RULES.PERCENTAGE;
  return percentage >= rules.MIN && percentage <= rules.MAX;
};

/**
 * Validate discount amount against original price
 */
export const validateDiscountAmount = (discountAmount, originalAmount) => {
  if (typeof discountAmount !== 'number' || typeof originalAmount !== 'number') {
    return false;
  }

  // Discount cannot be negative or exceed original amount
  return discountAmount >= 0 && discountAmount <= originalAmount;
};

/**
 * Validate transaction reference ID
 */
export const validateReferenceId = (refId) => {
  if (!refId || typeof refId !== 'string') {
    return false;
  }

  const rules = TRANSACTION_VALIDATION_RULES.REFERENCE_ID;
  return refId.length >= rules.MIN_LENGTH && 
         refId.length <= rules.MAX_LENGTH && 
         rules.PATTERN.test(refId);
};

/**
 * Validate points conversion rate
 */
export const validatePointsConversionRate = (rate) => {
  if (typeof rate !== 'number') {
    return false;
  }

  const rules = POINTS_VALIDATION_RULES.CONVERSION_RATES.POINTS_TO_CURRENCY;
  return rate >= rules.MIN && rate <= rules.MAX;
};

/**
 * Validate daily points limits
 */
export const validateDailyPointsLimit = (points, type = 'earn') => {
  if (typeof points !== 'number' || points < 0) {
    return false;
  }

  const limits = POINTS_VALIDATION_RULES.RATE_LIMITS;
  const maxLimit = type === 'earn' ? limits.DAILY_EARN_MAX : limits.DAILY_SPEND_MAX;
  
  return points <= maxLimit;
};

/**
 * Calculate final price after discount
 */
export const calculateFinalPrice = (originalPrice, discountType, discountValue) => {
  if (typeof originalPrice !== 'number' || originalPrice < 0) {
    return originalPrice;
  }

  switch (discountType) {
    case 'percentage':
      if (validateDiscountPercentage(discountValue)) {
        return originalPrice * (1 - discountValue / 100);
      }
      break;
    
    case 'fixed_amount':
      if (validateDiscountAmount(discountValue, originalPrice)) {
        return Math.max(0, originalPrice - discountValue);
      }
      break;
    
    case 'points':
      // This would use points conversion rate
      // Simplified for MVP
      return originalPrice;
    
    case 'free':
      return 0;
    
    default:
      return originalPrice;
  }

  return originalPrice;
};

/**
 * Validate transaction consistency
 */
export const validateTransactionConsistency = (transaction) => {
  // Skip validation if basic required fields are missing (let Mongoose handle it)
  if (!transaction.type || !transaction.userId) {
    return true;
  }

  // Check if transaction type matches payment method
  if (transaction.type === 'course_discount' && transaction.payment && transaction.payment.method !== 'points') {
    return false;
  }

  // Check if monetary transactions have valid amounts
  if (['course_purchase', 'subscription_payment'].includes(transaction.type)) {
    if (!transaction.amount || transaction.amount <= 0) {
      return false;
    }
  }

  // Check if points transactions have valid points
  if (['quiz_completion', 'course_discount'].includes(transaction.type)) {
    if (transaction.type === 'quiz_completion' && transaction.pointsEarned !== undefined && transaction.pointsEarned <= 0) {
      return false;
    }
    if (transaction.type === 'course_discount' && transaction.pointsUsed !== undefined && transaction.pointsUsed <= 0) {
      return false;
    }
  }

  // Check discount consistency
  if (transaction.discountUsed && transaction.discountUsed.amount > 0) {
    if (!validateDiscountAmount(transaction.discountUsed.amount, transaction.amount)) {
      return false;
    }
  }

  return true;
};

/**
 * Generate transaction reference ID
 */
export const generateTransactionReference = (type, userId) => {
  const timestamp = Date.now();
  const userSuffix = userId ? userId.toString().slice(-4) : '0000';
  const typeSuffix = type ? type.replace(/_/g, '').toUpperCase().slice(0, 4) : 'UNKN';
  
  return `TXN_${typeSuffix}_${userSuffix}_${timestamp}`;
};

/**
 * Validate IP address format
 */
export const validateIpAddress = (ip) => {
  if (!ip || typeof ip !== 'string') {
    return false;
  }

  return METADATA_VALIDATION_RULES.IP_ADDRESS.PATTERN.test(ip);
};