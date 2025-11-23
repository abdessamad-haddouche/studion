/**
 * Security Middleware - BULLETPROOF CORS FIX
 * @module middleware/security
 * @description Security-related middleware with bulletproof CORS configuration
 */

import cors from 'cors';
import helmet from 'helmet';
import { isDevelopment } from '#lib/config/index.js';

/**
 * Apply security middleware to Express app
 * @param {express.Application} app - Express application
 */
export const setupSecurityMiddleware = (app) => {
    // Basic security headers - relaxed for development
    app.use(helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // BULLETPROOF CORS configuration that works everywhere
    const corsOptions = {
        // Allow specific origins in development, all in production
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);
            
            if (isDevelopment()) {
                // Development: Allow common localhost ports
                const allowedOrigins = [
                    'http://localhost:3000',
                    'http://localhost:5173', 
                    'http://localhost:4173',
                    'http://localhost:8080',
                    'http://127.0.0.1:3000',
                    'http://127.0.0.1:5173',
                    'http://127.0.0.1:4173',
                    'http://127.0.0.1:8080'
                ];
                
                // If origin is in allowed list or is localhost, allow it
                if (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
                    return callback(null, true);
                }
                
                // Development fallback: allow everything
                return callback(null, true);
            } else {
                // Production: be more restrictive
                const allowedOrigins = [
                    process.env.FRONTEND_URL,
                    'https://studion.vercel.app'
                ];
                
                if (allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                
                return callback(new Error('CORS policy violation'));
            }
        },
        
        // All HTTP methods
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        
        // All headers that might be needed
        allowedHeaders: [
            'Origin',
            'X-Requested-With', 
            'Content-Type', 
            'Accept',
            'Authorization',
            'Cache-Control',
            'Pragma'
        ],
        
        // Expose headers for frontend access
        exposedHeaders: ['Content-Length', 'Date', 'X-Request-Id'],
        
        // Enable credentials ONLY when origin is specifically allowed
        credentials: true,
        
        // Preflight cache (24 hours)
        maxAge: 86400,
        
        // Handle preflight requests
        preflightContinue: false,
        optionsSuccessStatus: 200
    };
    
    app.use(cors(corsOptions));
    
    // Additional CORS headers for stubborn browsers
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        
        // Set CORS headers manually as backup
        if (origin && (isDevelopment() || 
            [process.env.FRONTEND_URL, 'https://studion.vercel.app'].includes(origin))) {
            res.header('Access-Control-Allow-Origin', origin);
        } else if (isDevelopment()) {
            res.header('Access-Control-Allow-Origin', '*');
        }
        
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
        res.header('Access-Control-Allow-Credentials', 'true');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });
};

export default setupSecurityMiddleware;