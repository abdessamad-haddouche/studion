/**
 * Security Middleware
 * @module middleware/security
 * @description Security-related middleware
 */

import cors from 'cors';
import helmet from 'helmet';
import { isDevelopment } from '#lib/config/index.js';

/**
 * Apply security middleware to Express app
 * @param {express.Application} app - Express application
 */
export const setupSecurityMiddleware = (app) => {
    // Basic security headers
    app.use(helmet());

    // CORS configuration - restrict in production
    const corsOptions = {
        origin: isDevelopment() 
            ? '*' 
            : process.env.FRONTEND_URL || 'https://studion.vercel.app',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400 // 24 hours
    };
    
    app.use(cors(corsOptions));
};

export default setupSecurityMiddleware;