/**
 * Database Configuration
 * @module config/database
 * @description MongoDB connection configuration with environment-specific settings
 */

import { DATABASE_DEFAULTS } from '#constants/config/defaults.js';
import { 
    getCurrentEnvironment, 
    getNormalizedEnvironment, 
    isDevelopment, 
    isProduction, 
    isTest 
} from '#lib/config/environment.js';

// ==========================================
// ENVIRONMENT DETECTION
// ==========================================

const env = getCurrentEnvironment();
const normalizedEnv = getNormalizedEnvironment();

// ==========================================
// GET ENVIRONMENT DEFAULTS
// ==========================================

const getEnvironmentDefaults = () => {
    return DATABASE_DEFAULTS[normalizedEnv] || DATABASE_DEFAULTS.COMMON;
};

const defaults = getEnvironmentDefaults();


// ==========================================
// DATABASE CONFIGURATION
// ==========================================

/**
 * Main database configuration object
 */
export const databaseConfig = Object.freeze({
    // Connection URI
    uri: process.env.MONGODB_URI || defaults.MONGODB_URI,

    // Database name (from .env)
    dbName: process.env.MONGODB_DB_NAME || defaults.MONGODB_DB_NAME,

    // Connection options optimized by environment
    options: {
        // Basic connection settings
        maxPoolSize: process.env.DB_MAX_POOL_SIZE ? 
            parseInt(process.env.DB_MAX_POOL_SIZE) : 
            defaults.CONNECTION_POOL_SIZE,
        
        minPoolSize: isProduction() ? Math.floor(defaults.CONNECTION_POOL_SIZE * 0.1) : 2,
        maxIdleTimeMS: 30000,
        
        // Timeout settings
        serverSelectionTimeoutMS: defaults.CONNECTION_TIMEOUT,
        socketTimeoutMS: 45000,
        connectTimeoutMS: defaults.CONNECTION_TIMEOUT,
        
        // Write and read preferences
        w: 'majority',
        retryWrites: true,
        retryReads: true,
        
        // Environment-specific settings
        ...(isDevelopment() && {
            autoIndex: defaults.AUTO_INDEX,
        }),
        
        ...(isProduction() && {
            autoIndex: defaults.AUTO_INDEX,
            readPreference: 'secondaryPreferred',
        }),
        
        ...(isTest() && {
            autoIndex: defaults.AUTO_INDEX,
            bufferCommands: false,
        }),
    },
    
    // Logging and debugging
    debug: {
        enabled: process.env.DB_DEBUG === 'true' || defaults.DEBUG_MODE,
        logQueries: isDevelopment(),
        logConnections: !isProduction(),
        logErrors: true,
    },
    
    // Health check settings
    healthCheck: {
        enabled: true,
        interval: isProduction() ? 60000 : 30000, // 60s prod, 30s dev
        timeout: 5000,
        retries: 3,
    },
    
    // Connection retry settings
    retry: {
        maxRetries: isProduction() ? 10 : 5,
        initialDelay: 1000,
        maxDelay: isProduction() ? 60000 : 30000,
        backoffFactor: 2,
    },
    
    // Connection pool monitoring
    monitoring: {
        enabled: isProduction(),
        logInterval: 300000, // 5 minutes
    }
});