/**
 * Transaction Model Constants Public API
 * @module constants/models/transaction
 * @description Central export point for all transaction-related constants
 */

// ==========================================
// ENUM CONSTANTS
// ==========================================
export {
  // Transaction Types & Status
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  PAYMENT_METHODS,
  DISCOUNT_TYPES,
  
  // Currency & Points
  TRANSACTION_CURRENCIES,
  POINTS_EARNING_RATES,
  POINTS_SPENDING_RATES,
  
  // Defaults & Limits
  TRANSACTION_DEFAULTS,
  TRANSACTION_LIMITS,
  
  // Validation Helpers
  isValidTransactionType,
  isValidTransactionStatus,
  isValidPaymentMethod,
  isValidDiscountType,
  isValidCurrency,
  isPointsEarningTransaction,
  isPointsSpendingTransaction,
  isMonetaryTransaction,
  calculateQuizPoints,
  calculateDiscountFromPoints,
  getTransactionCategory
} from './enums.js';

// ==========================================
// VALIDATION CONSTANTS
// ==========================================
export {
  // Validation Rules
  TRANSACTION_VALIDATION_RULES,
  DISCOUNT_VALIDATION_RULES,
  PAYMENT_VALIDATION_RULES,
  POINTS_VALIDATION_RULES,
  METADATA_VALIDATION_RULES,
  
  // Validation Helper Functions
  validateTransactionAmount,
  validatePointsAmount,
  validateDiscountPercentage,
  validateDiscountAmount,
  validateReferenceId,
  validatePointsConversionRate,
  validateDailyPointsLimit,
  calculateFinalPrice,
  validateTransactionConsistency,
  generateTransactionReference,
  validateIpAddress
} from './validation.js';