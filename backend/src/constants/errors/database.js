/**
 * Database Error Constants
 * @module constants/errors/database
 * @description Error codes and constants for database operations
 */

/**
 * General database error codes
 */
export const DATABASE_ERROR_CODES = Object.freeze({
    CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
    OPERATION_TIMEOUT: 'DB_OPERATION_TIMEOUT',
    AUTHENTICATION_FAILED: 'DB_AUTH_FAILED',
    OPERATION_FAILED: 'DB_OPERATION_FAILED',
    TRANSACTION_FAILED: 'DB_TRANSACTION_FAILED',
    INDEX_ERROR: 'DB_INDEX_ERROR',
    UNKNOWN_ERROR: 'DB_UNKNOWN_ERROR'
});

/**
 * Validation error codes
 */
export const VALIDATION_ERROR_CODES = Object.freeze({
    SCHEMA_VALIDATION: 'VALIDATION_SCHEMA_ERROR',
    REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
    INVALID_TYPE: 'VALIDATION_INVALID_TYPE',
    INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
    VALUE_OUT_OF_RANGE: 'VALIDATION_VALUE_OUT_OF_RANGE',
    ENUM_VALIDATION: 'VALIDATION_ENUM_ERROR',
    CUSTOM_VALIDATION: 'VALIDATION_CUSTOM_ERROR'
});

/**
 * Duplicate error codes
 */
export const DUPLICATE_ERROR_CODES = Object.freeze({
    DUPLICATE_KEY: 'DUPLICATE_KEY_ERROR',
    DUPLICATE_EMAIL: 'DUPLICATE_EMAIL_ERROR',
    DUPLICATE_USERNAME: 'DUPLICATE_USERNAME_ERROR',
    DUPLICATE_INDEX: 'DUPLICATE_INDEX_ERROR'
});

/**
 * MongoDB error code mappings
 */
export const MONGO_ERROR_CODES = Object.freeze({
    // Connection errors
    CONNECTION_FAILED: [6, 7, 89, 91],
    
    // Timeout errors
    OPERATION_TIMEOUT: [50],
    
    // Authentication errors
    AUTHENTICATION_FAILED: [18],
    
    // Duplicate key error
    DUPLICATE_KEY: [11000],
    
    // Index errors
    INDEX_ERROR: [85, 86]
});

/**
 * Mongoose validation kind mappings
 */
export const MONGOOSE_VALIDATION_KINDS = Object.freeze({
    REQUIRED: 'required',
    ENUM: 'enum',
    MIN: 'min',
    MAX: 'max',
    MIN_LENGTH: 'minlength',
    MAX_LENGTH: 'maxlength',
    MATCH: 'match',
    USER_DEFINED: 'user defined'
});