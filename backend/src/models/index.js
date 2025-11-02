/**
 * Models Module Exports
 * @module models
 * @description Central export point for all models
 */

import { Document } from './document/index.js';
// Import other model groups as needed
// import { User, UserProfile } from './user/index.js';

// Export individual models for direct importing
export { Document };
// export { User, UserProfile };

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
        // Add other models as needed
        // User,
        // UserProfile,
    };
    
    console.log('✅ Models initialized in app.locals');
};