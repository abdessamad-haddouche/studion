/**
 * Base Error Class
 * @module exceptions/base/BaseError
 * @description Foundation error class
 */

/**
 * Base error class for all application errors
 */
export class BaseError extends Error {
    /**
     * Create a BaseError
     * @param {string} message - Error message
     * @param {Object} options - Error options
     * @param {string} options.code - Error code for programmatic handling
     * @param {Object} options.context - Additional context information
     * @param {boolean} options.isOperational - Whether error is operational (expected)
     */
    constructor(message, options = {}) {
        super(message);
        
        // Set error name to class name
        this.name = this.constructor.name;
        
        // Core properties
        this.code = options.code || 'UNKNOWN_ERROR';
        this.context = options.context || {};
        this.isOperational = options.isOperational !== false; // Default to true
        this.timestamp = new Date().toISOString();
        
        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    
    /**
     * Get error information as JSON
     * @returns {Object} Error information
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp,
            isOperational: this.isOperational
        };
    }
    
    /**
     * Get safe error information for client responses
     * @returns {Object} Client-safe error object
     */
    toClientSafe() {
        return {
            error: this.name,
            message: this.message,
            code: this.code,
            timestamp: this.timestamp
        };
    }
    
    /**
     * Check if error is operational (expected/handled)
     * @param {Error} error - Error to check
     * @returns {boolean} Whether error is operational
     */
    static isOperational(error) {
        if (error instanceof BaseError) {
            return error.isOperational;
        }
        return false;
    }
}

export default BaseError;