/**
 * Middleware Module Exports
 * @module middleware
 * @description Central export point for all middleware
 */

import compression from 'compression';
import { setupCoreMiddleware } from './core.middleware.js';
import { setupSecurityMiddleware } from './security.middleware.js';
import { setupErrorMiddleware } from './error.middleware.js';
import { serverConfig } from '#config/index.js';

/**
 * Apply all middleware to Express app
 * @param {express.Application} app - Express application
 */
export const setupMiddleware = (app) => {
    // Apply core middleware first
    setupCoreMiddleware(app);
    
    // Apply security middleware
    setupSecurityMiddleware(app);
    
    // Apply compression if enabled
    if (serverConfig.compression) {
        app.use(compression());
    }
};

/**
 * Apply error handling middleware to Express app
 * @param {express.Application} app - Express application
 */
export const setupErrorHandlers = (app) => {
    setupErrorMiddleware(app);
};

// Export individual middleware
export { default as authMiddleware } from './auth.middleware.js';
export { default as adminMiddleware } from './admin.middleware.js';
export { validateObjectId, validateObjectIds } from './validation.middleware.js';

// Export setup functions
export { setupCoreMiddleware } from './core.middleware.js';
export { setupSecurityMiddleware } from './security.middleware.js';
export { setupErrorMiddleware } from './error.middleware.js';