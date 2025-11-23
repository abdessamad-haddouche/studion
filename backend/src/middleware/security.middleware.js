/**
 * NUCLEAR CORS FIX - BYPASSES ALL BROWSER SECURITY
 * @module middleware/security
 * @description This will work on ANY browser, ANY computer, NO exceptions
 */

import cors from 'cors';
import helmet from 'helmet';
import { isDevelopment } from '#lib/config/index.js';

/**
 * Apply security middleware to Express app
 * @param {express.Application} app - Express application
 */
export const setupSecurityMiddleware = (app) => {
    // DISABLE ALL HELMET SECURITY IN DEVELOPMENT
    if (isDevelopment()) {
        // No security headers in development
        console.log('🔥 DEVELOPMENT MODE: All security headers disabled');
    } else {
        // Only enable helmet in production
        app.use(helmet({
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: false,
            crossOriginResourcePolicy: { policy: "cross-origin" }
        }));
    }

    // NUCLEAR CORS CONFIGURATION - ALLOWS EVERYTHING
    app.use((req, res, next) => {
        // Set all possible CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Allow-Credentials', 'false'); // Changed to false to allow wildcard
        res.header('Access-Control-Max-Age', '86400');
        res.header('Access-Control-Expose-Headers', '*');
        
        // Additional headers for stubborn browsers
        res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
        res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');
        
        // Handle preflight requests immediately
        if (req.method === 'OPTIONS') {
            console.log('🚀 PREFLIGHT REQUEST for:', req.originalUrl);
            res.status(200).end();
            return;
        }
        
        console.log(`🚀 ${req.method} ${req.originalUrl}`);
        next();
    });
    
    // Backup CORS with cors package
    app.use(cors({
        origin: true, // Allow any origin
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['*'],
        exposedHeaders: ['*'],
        credentials: false, // Must be false with wildcard origin
        maxAge: 86400,
        preflightContinue: false,
        optionsSuccessStatus: 200
    }));
};

export default setupSecurityMiddleware;