/**
 * Validation Error Class - MVP Version
 * @module exceptions/database/ValidationError
 * @description Simplified database validation error class
 */

import { DatabaseError } from './DatabaseError.js';
import { VALIDATION_ERROR_CODES } from '#constants/errors/index.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

/**
 * Database validation error class
 * Handles MongoDB validation errors and schema violations
 */
export class ValidationError extends DatabaseError {
    /**
     * Create a ValidationError
     * @param {string} message - Error message
     * @param {Object} options - Error options
     * @param {string} options.field - Field that failed validation
     * @param {*} options.value - Value that failed validation
     * @param {string} options.validator - Type of validation that failed
     * @param {Array} options.errors - Array of validation errors for multiple fields
     * @param {Object} options.mongoError - Original MongoDB error
     * @param {Object} options.context - Additional context
     */
    constructor(message, options = {}) {
        super(message, {
            code: options.code || VALIDATION_ERROR_CODES.SCHEMA_VALIDATION,
            mongoError: options.mongoError,
            operation: options.operation || 'validation',
            context: options.context || {},
            isOperational: true // Validation errors are always operational
        });
        
        // Validation-specific properties
        this.field = options.field || null;
        this.value = 'value' in options ? options.value : null;
        this.validator = options.validator || null;
        this.errors = options.errors || [];
        this.statusCode = HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY;
    }
    
    /**
     * Get validation-specific error information
     * @returns {Object} Validation error details
     */
    toValidationFormat() {
        return {
            ...this.toJSON(),
            validation: {
                field: this.field,
                value: this.field ? this.value : undefined,
                validator: this.validator,
                errors: this.errors.length > 0 ? this.errors : undefined
            },
            statusCode: this.statusCode
        };
    }
    
    /**
     * Get client-safe validation error
     * @returns {Object} Client-safe validation error
     */
    toClientSafe() {
        const base = super.toClientSafe();
        
        return {
            ...base,
            field: this.field,
            validator: this.validator,
            errors: this.errors.map(error => ({
                field: error.field,
                message: error.message,
                validator: error.validator
            })),
            statusCode: this.statusCode
        };
    }
    
    /**
     * Create validation error from MongoDB/Mongoose error (Simplified)
     * @param {Error} mongoError - MongoDB/Mongoose validation error
     * @param {Object} options - Additional options
     * @returns {ValidationError} New ValidationError instance
     */
    static fromMongoError(mongoError, options = {}) {
        // Extract basic info and create error
        let message = mongoError.message || 'Validation failed';
        let field = null;
        let errors = [];
        
        // Handle Mongoose validation errors (simplified)
        if (mongoError.name === 'ValidationError' && mongoError.errors) {
            const firstError = Object.values(mongoError.errors)[0];
            
            // Extract field errors
            for (const [fieldName, error] of Object.entries(mongoError.errors)) {
                errors.push({
                    field: fieldName,
                    message: error.message,
                    validator: error.kind || 'validation'
                });
            }
            
            // Use first error for main properties
            if (firstError) {
                message = firstError.message;
                field = firstError.path;
            }
        }
        
        return new ValidationError(message, {
            code: VALIDATION_ERROR_CODES.SCHEMA_VALIDATION,
            field,
            errors,
            mongoError,
            ...options
        });
    }
    
    /**
     * Create required field error
     * @param {string} field - Required field name
     * @param {Object} options - Additional options
     * @returns {ValidationError} Required field error
     */
    static requiredField(field, options = {}) {
        return new ValidationError(`${field} is required`, {
            code: VALIDATION_ERROR_CODES.REQUIRED_FIELD,
            field,
            validator: 'required',
            ...options
        });
    }
    
    /**
     * Create invalid format error
     * @param {string} field - Field with invalid format
     * @param {*} value - Invalid value
     * @param {Object} options - Additional options
     * @returns {ValidationError} Invalid format error
     */
    static invalidFormat(field, value, options = {}) {
        return new ValidationError(`${field} has invalid format`, {
            code: VALIDATION_ERROR_CODES.INVALID_FORMAT,
            field,
            value,
            validator: 'format',
            ...options
        });
    }
    
    /**
     * Create invalid type error
     * @param {string} field - Field with invalid type
     * @param {*} value - Invalid value
     * @param {string} expectedType - Expected type
     * @param {Object} options - Additional options
     * @returns {ValidationError} Invalid type error
     */
    static invalidType(field, value, expectedType, options = {}) {
        return new ValidationError(`${field} must be ${expectedType}`, {
            code: VALIDATION_ERROR_CODES.INVALID_TYPE,
            field,
            value,
            validator: 'type',
            context: { expectedType },
            ...options
        });
    }
}

export default ValidationError;