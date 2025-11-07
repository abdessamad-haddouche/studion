/**
 * Error Constants Module Exports
 * @module constants/errors
 * @description Central export point for all error-related constants
 */

// ==========================================
// DATABASE ERROR CONSTANTS
// ==========================================
export {
    DATABASE_ERROR_CODES,
    VALIDATION_ERROR_CODES,
    DUPLICATE_ERROR_CODES,
    MONGO_ERROR_CODES,
    MONGOOSE_VALIDATION_KINDS
} from './database.js';

// ==========================================
// BUSINESS LOGIC ERROR CONSTANTS
// ==========================================

/**
 * Course-specific error codes
 */
export const COURSE_ERROR_CODES = Object.freeze({
    COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
    COURSE_ALREADY_EXISTS: 'COURSE_ALREADY_EXISTS',
    COURSE_NOT_AVAILABLE: 'COURSE_NOT_AVAILABLE',
    COURSE_DELETED: 'COURSE_DELETED',
    INSUFFICIENT_POINTS: 'INSUFFICIENT_POINTS',
    INVALID_PRICING: 'INVALID_PRICING',
    PURCHASE_FAILED: 'PURCHASE_FAILED',
    DISCOUNT_NOT_APPLICABLE: 'DISCOUNT_NOT_APPLICABLE',
    POINTS_LIMIT_EXCEEDED: 'POINTS_LIMIT_EXCEEDED'
});

/**
 * User/Authentication specific error codes
 */
export const USER_ERROR_CODES = Object.freeze({
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
    INVALID_USER_TYPE: 'INVALID_USER_TYPE'
});

/**
 * General business error codes
 */
export const BUSINESS_ERROR_CODES = Object.freeze({
    OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
    RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE'
});