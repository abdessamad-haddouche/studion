/**
 * Models Module Exports
 * @module models
 * @description Central export point for all models
 */

import { Document } from './document/index.js';
import { Student, Admin } from './users/index.js';

// Export individual models for direct importing
export { Document };
export { Student, Admin };

/**
 * Initialize models and attach them to Express app.locals
 * @param {express.Application} app - Express application
 */
export const initializeModels = (app) => {
    // Ensure app.locals exists
    if (!app.locals) {
        app.locals = {};
    }
    
    // Attach models to app.locals.models
    app.locals.models = {
        Document,
        Student,
        Admin
    };
    
    console.log('✅ Models initialized in app.locals');
};