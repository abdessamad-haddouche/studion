/**
 * HTTP Error Class
 * @module exceptions/base/HttpError
 * @description Clean HTTP-aware error class with status codes
 */

import { BaseError } from './BaseError.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';
import { StatusCodeHelpers } from '#lib/http/index.js';

/**
 * HTTP error class for REST API errors
 */
export class HttpError extends BaseError {
    /**
     * Create an HttpError
     * @param {string} message - Error message
     * @param {Object} options - Error options
     * @param {number} options.statusCode - HTTP status code
     * @param {string} options.code - Error code
     * @param {Object} options.context - Additional context
     * @param {boolean} options.isOperational - Whether error is operational
     */
    constructor(message, options = {}) {
        super(message, options);
        
        this.statusCode = options.statusCode || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
        
        // Set operational based on status code if not explicitly set
        if (options.isOperational === undefined) {
            this.isOperational = StatusCodeHelpers.isClientError(this.statusCode);
        }
    }
    
    /**
     * Get error information for HTTP response
     * @returns {Object} HTTP response-ready error object
     */
    toHttpResponse() {
        return {
            success: false,
            error: {
                name: this.name,
                message: this.message,
                code: this.code,
                statusCode: this.statusCode,
                timestamp: this.timestamp,
                ...(StatusCodeHelpers.isClientError(this.statusCode) && { context: this.context })
            }
        };
    }
    
    /**
     * Check if error is a client error (4xx)
     * @returns {boolean} Whether error is client error
     */
    isClientError() {
        return StatusCodeHelpers.isClientError(this.statusCode);
    }
    
    /**
     * Check if error is a server error (5xx)
     * @returns {boolean} Whether error is server error
     */
    isServerError() {
        return StatusCodeHelpers.isServerError(this.statusCode);
    }
    
    /**
     * Create 400 Bad Request error
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     * @returns {HttpError} Bad Request error
     */
    static badRequest(message = 'Bad Request', options = {}) {
        return new HttpError(message, {
            statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
            code: 'BAD_REQUEST',
            ...options
        });
    }
    
    /**
     * Create 401 Unauthorized error
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     * @returns {HttpError} Unauthorized error
     */
    static unauthorized(message = 'Unauthorized', options = {}) {
        return new HttpError(message, {
            statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
            code: 'UNAUTHORIZED',
            ...options
        });
    }
    
    /**
     * Create 403 Forbidden error
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     * @returns {HttpError} Forbidden error
     */
    static forbidden(message = 'Forbidden', options = {}) {
        return new HttpError(message, {
            statusCode: HTTP_STATUS_CODES.FORBIDDEN,
            code: 'FORBIDDEN',
            ...options
        });
    }
    
    /**
     * Create 404 Not Found error
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     * @returns {HttpError} Not Found error
     */
    static notFound(message = 'Not Found', options = {}) {
        return new HttpError(message, {
            statusCode: HTTP_STATUS_CODES.NOT_FOUND,
            code: 'NOT_FOUND',
            ...options
        });
    }
    
    /**
     * Create 409 Conflict error
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     * @returns {HttpError} Conflict error
     */
    static conflict(message = 'Conflict', options = {}) {
        return new HttpError(message, {
            statusCode: HTTP_STATUS_CODES.CONFLICT,
            code: 'CONFLICT',
            ...options
        });
    }
    
    /**
     * Create 422 Unprocessable Entity error
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     * @returns {HttpError} Unprocessable Entity error
     */
    static unprocessableEntity(message = 'Unprocessable Entity', options = {}) {
        return new HttpError(message, {
            statusCode: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
            code: 'UNPROCESSABLE_ENTITY',
            ...options
        });
    }
    
    /**
     * Create 500 Internal Server Error
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     * @returns {HttpError} Internal Server Error
     */
    static internalServerError(message = 'Internal Server Error', options = {}) {
        return new HttpError(message, {
            statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            code: 'INTERNAL_SERVER_ERROR',
            isOperational: false,
            ...options
        });
    }
}

export default HttpError;