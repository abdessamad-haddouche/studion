/**
 * Express Application Factory
 * @module app
 */

import express from 'express';
import { configureApp } from './src/config/express.config.js';
// import { setupMiddleware } from './src/middleware/index.js';
// import { setupRoutes } from './src/routes/index.js';
// import { setupErrorHandlers } from './src/middleware/errorHandlers.js';

/**
 * Create and configure Express application
 * @returns {express.Application} Configured Express app
 */
const createApp = () => {
    const app = express();

    // ==========================================
    // Application Configuration
    // ==========================================
    configureApp(app);

    // ==========================================
    // Middleware Setup
    // ==========================================
    // setupMiddleware(app);

    // ==========================================
    // Routes Setup
    // ==========================================
    // setupRoutes(app);

    // ==========================================
    // Error Handling (must be last)
    // ==========================================
    // setupErrorHandlers(app);

    return app;
};

export default createApp();