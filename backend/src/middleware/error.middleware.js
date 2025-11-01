/**
 * Error Handling Middleware
 * @module middleware/error
 * @description Error handling middleware
 */

import { HttpError, BaseError } from '#exceptions/index.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';
import { isDevelopment } from '#lib/config/index.js';

/**
 * Handle 404 errors - must be added after all routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const notFoundHandler = (req, res, next) => {
    const error = HttpError.notFound(`Route not found: ${req.method} ${req.originalUrl}`);
    next(error);
};

/**
 * Global error handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
    // Already have a response, skip
    if (res.headersSent) {
        return next(err);
    }
    
    // Convert to HttpError if not already
    let error = err;
    
    if (!(err instanceof HttpError)) {
        error = HttpError.internalServerError(
            isDevelopment() ? err.message : 'Internal server error',
            { cause: err }
        );
        
        // Log server errors
        console.error('❌ ERROR:', err);
        if (isDevelopment()) {
            console.error(err.stack);
        }
    }
    
    // Client errors are logged at a lower level
    if (error.isClientError()) {
        console.warn(`⚠️ ${error.statusCode} - ${error.message}`);
    }
    
    // Create response object
    const response = {
        success: false,
        error: {
            message: error.message,
            code: error.code
        }
    };
    
    // Add context data for client errors
    if (error.isClientError() && error.context) {
        response.error.context = error.context;
    }
    
    // Add stack trace in development
    if (isDevelopment()) {
        response.error.stack = err.stack;
    }
    
    res.status(error.statusCode || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json(response);
};

/**
 * Setup error handling middleware
 * @param {express.Application} app - Express application
 */
export const setupErrorMiddleware = (app) => {
    // 404 handler - must be after all routes
    app.use(notFoundHandler);
    
    // Global error handler - must be last
    app.use(errorHandler);
};

export default setupErrorMiddleware;