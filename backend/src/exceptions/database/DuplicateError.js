/**
 * Duplicate Error Class - MVP Version
 * @module exceptions/database/DuplicateError
 * @description Database duplicate key error class for unique constraint violations
 */

import { DatabaseError } from './DatabaseError.js';
import { DUPLICATE_ERROR_CODES} from '#constants/errors/index.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

/**
 * Database duplicate key error class
 * Handles MongoDB duplicate key errors (E11000)
 */
export class DuplicateError extends DatabaseError {
    /**
     * Create a DuplicateError
     * @param {string} message - Error message
     * @param {Object} options - Error options
     * @param {string} options.field - Field that has duplicate value
     * @param {*} options.value - Duplicate value
     * @param {string} options.collection - Collection where duplicate occurred
     * @param {Object} options.mongoError - Original MongoDB error
     * @param {Object} options.context - Additional context
     */
    constructor(message, options = {}) {
        super(message, {
            code: options.code || DUPLICATE_ERROR_CODES.DUPLICATE_KEY,
            mongoError: options.mongoError,
            operation: options.operation || 'insert',
            context: options.context || {},
            isOperational: true // Duplicate errors are always operational
        });
        
        // Duplicate-specific properties
        this.field = options.field || null;
        this.value = options.value || null;
        this.collection = options.collection || null;
        this.statusCode = HTTP_STATUS_CODES.CONFLICT;
    }
    
    /**
     * Get duplicate-specific error information
     * @returns {Object} Duplicate error details
     */
    toDuplicateFormat() {
        return {
            ...this.toJSON(),
            duplicate: {
                field: this.field,
                value: this.field ? this.value : undefined, // Only include value if field is specified
                collection: this.collection
            },
            statusCode: this.statusCode
        };
    }
    
    /**
     * Get client-safe duplicate error
     * @returns {Object} Client-safe duplicate error
     */
    toClientSafe() {
        const base = super.toClientSafe();
        
        return {
            ...base,
            field: this.field,
            statusCode: this.statusCode
            // Don't expose actual duplicate value for security
        };
    }
    
    /**
     * Create duplicate error from MongoDB E11000 error (simplified)
     * @param {Error} mongoError - MongoDB duplicate key error
     * @param {Object} options - Additional options
     * @returns {DuplicateError} New DuplicateError instance
     */
    static fromMongoError(mongoError, options = {}) {
        // Simple parsing - extract field from error message
        let field = null;
        let collection = null;
        
        if (mongoError.message) {
            // Try to extract field from common patterns
            const fieldMatch = mongoError.message.match(/dup key: \{ (\w+):/);
            if (fieldMatch) {
                field = fieldMatch[1];
            }
            
            // Try to extract collection
            const collectionMatch = mongoError.message.match(/collection: \w+\.(\w+)/);
            if (collectionMatch) {
                collection = collectionMatch[1];
            }
        }
        
        // Create user-friendly message
        const message = DuplicateError.buildUserFriendlyMessage(field);
        const code = DuplicateError.mapFieldToErrorCode(field);
        
        return new DuplicateError(message, {
            code,
            field,
            collection,
            mongoError,
            ...options
        });
    }
    
    /**
     * Build user-friendly error message (simplified)
     * @param {string} field - Field name
     * @returns {string} User-friendly message
     */
    static buildUserFriendlyMessage(field) {
        if (!field) {
            return 'A record with this information already exists';
        }
        
        // Simple field mapping
        const fieldMessages = {
            email: 'email already exists',
            username: 'Username already exists',
            phone: 'Phone number already exists'
        };
        
        return fieldMessages[field] || `${field} already exists`;
    }
    
    /**
     * Map field names to specific error codes (simplified)
     * @param {string} field - Field name
     * @returns {string} Specific error code
     */
    static mapFieldToErrorCode(field) {
        const fieldMap = {
            email: DUPLICATE_ERROR_CODES.DUPLICATE_EMAIL,
            username: DUPLICATE_ERROR_CODES.DUPLICATE_USERNAME
        };
        
        return fieldMap[field] || DUPLICATE_ERROR_CODES.DUPLICATE_KEY;
    }
    
    /**
     * Create duplicate email error
     * @param {string} email - Duplicate email
     * @param {Object} options - Additional options
     * @returns {DuplicateError} Duplicate email error
     */
    static duplicateEmail(email, options = {}) {
        return new DuplicateError('Email address already exists', {
            code: DUPLICATE_ERROR_CODES.DUPLICATE_EMAIL,
            field: 'email',
            value: email,
            ...options
        });
    }
    
    /**
     * Create duplicate username error
     * @param {string} username - Duplicate username
     * @param {Object} options - Additional options
     * @returns {DuplicateError} Duplicate username error
     */
    static duplicateUsername(username, options = {}) {
        return new DuplicateError('Username already exists', {
            code: DUPLICATE_ERROR_CODES.DUPLICATE_USERNAME,
            field: 'username',
            value: username,
            ...options
        });
    }
    
    /**
     * Check if MongoDB error is a duplicate key error
     * @param {Error} error - MongoDB error
     * @returns {boolean} Whether error is duplicate key error
     */
    static isDuplicateKeyError(error) {
        if (!error) {
            return false;
        }
        
        if (error.code === 11000) {
            return true;
        }
        
        if (error.message && error.message.includes('E11000')) {
            return true;
        }
        
        if (error.message && error.message.includes('duplicate key')) {
            return true;
        }
        
        return false;
    }
}

export default DuplicateError;