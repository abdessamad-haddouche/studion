/**
 * Database Error Class - MVP Version
 * @module exceptions/database/DatabaseError
 * @description Base database error class for MongoDB operations
 */

import { BaseError } from '../base/BaseError.js';
import { DATABASE_ERROR_CODES } from '#constants/errors/index.js';

/**
 * Base database error class
 * Handles MongoDB-specific error context and formatting
 */
export class DatabaseError extends BaseError {
    /**
     * Create a DatabaseError
     * @param {string} message - Error message
     * @param {Object} options - Error options
     * @param {string} options.code - Database error code
     * @param {Object} options.mongoError - Original MongoDB error
     * @param {string} options.operation - Database operation that failed
     * @param {Object} options.context - Additional context
     * @param {boolean} options.isOperational - Whether error is operational
     */
    constructor(message, options = {}) {
        super(message, {
            code: options.code || DATABASE_ERROR_CODES.UNKNOWN_ERROR,
            context: options.context || {},
            isOperational: options.isOperational !== false // Default to true
        });
        
        // Database-specific properties
        this.mongoError = options.mongoError || null;
        this.operation = options.operation || null;
        
        // Extract basic info from MongoDB error
        if (this.mongoError) {
            this.mongoCode = this.mongoError.code;
            this.collection = this.mongoError.collection || null;
        }
    }
    
    /**
     * Get database-specific error information
     * @returns {Object} Database error details
     */
    toDatabaseFormat() {
        return {
            ...this.toJSON(),
            database: {
                operation: this.operation,
                mongoCode: this.mongoCode,
                collection: this.collection
            }
        };
    }
    
    /**
     * Check if error is a connection error (simplified)
     * @returns {boolean} Whether error is connection-related
     */
    isConnectionError() {
        const connectionCodes = [6, 7, 89, 91]; // Common MongoDB connection error codes
        return connectionCodes.includes(this.mongoCode) || 
               this.code === DATABASE_ERROR_CODES.CONNECTION_FAILED;
    }
    
    /**
     * Check if error is a timeout error (simplified)
     * @returns {boolean} Whether error is timeout-related
     */
    isTimeoutError() {
        return this.mongoCode === 50 || // MongoDB timeout code
               this.code === DATABASE_ERROR_CODES.OPERATION_TIMEOUT;
    }
    
    /**
     * Create database error from MongoDB error (simplified)
     * @param {Error} mongoError - MongoDB error object
     * @param {Object} options - Additional options
     * @returns {DatabaseError} New DatabaseError instance
     */
    static fromMongoError(mongoError, options = {}) {
        const message = mongoError.message || 'Database operation failed';
        
        // Simple error code mapping
        let code = DATABASE_ERROR_CODES.OPERATION_FAILED;
        
        if (mongoError.code) {
            if ([6, 7, 89, 91].includes(mongoError.code)) {
                code = DATABASE_ERROR_CODES.CONNECTION_FAILED;
            } else if (mongoError.code === 50) {
                code = DATABASE_ERROR_CODES.OPERATION_TIMEOUT;
            } else if (mongoError.code === 18) {
                code = DATABASE_ERROR_CODES.AUTHENTICATION_FAILED;
            }
        }
        
        return new DatabaseError(message, {
            code,
            mongoError,
            operation: options.operation,
            context: options.context,
            ...options
        });
    }
    
    /**
     * Create connection error
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     * @returns {DatabaseError} Connection error
     */
    static connectionFailed(message = 'Database connection failed', options = {}) {
        return new DatabaseError(message, {
            code: DATABASE_ERROR_CODES.CONNECTION_FAILED,
            isOperational: false,
            ...options
        });
    }
    
    /**
     * Create timeout error
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     * @returns {DatabaseError} Timeout error
     */
    static operationTimeout(message = 'Database operation timed out', options = {}) {
        return new DatabaseError(message, {
            code: DATABASE_ERROR_CODES.OPERATION_TIMEOUT,
            ...options
        });
    }
}

export default DatabaseError;