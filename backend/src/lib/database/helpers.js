/**
 * Database Helper Functions
 * @module lib/database/helpers
 */

import { databaseConfig } from '#config/index.js';
import { getCurrentEnvironment, isProduction } from '#lib/config/index.js';

/**
 * Get database connection info for logging (without credentials)
 */
export const getDatabaseInfo = () => {
    const uri = databaseConfig.uri;
    const safeUri = uri.replace(/\/\/.*:.*@/, '//***:***@');
    
    return {
        environment: getCurrentEnvironment(),
        database: databaseConfig.dbName,
        uri: safeUri,
        poolSize: databaseConfig.options.maxPoolSize,
        timeout: databaseConfig.options.serverSelectionTimeoutMS,
        debug: databaseConfig.debug.enabled,
    };
};

/**
 * Validate database configuration
 */
export const validateDatabaseConfig = () => {
    if (!databaseConfig.uri) {
        throw new Error('Database URI is required. Set MONGODB_URI environment variable.');
    }
    
    if (!databaseConfig.dbName) {
        throw new Error('Database name is required. Set MONGODB_DB_NAME environment variable.');
    }
    
    if (isProduction() && databaseConfig.uri.includes('localhost')) {
        console.warn('⚠️ WARNING: Using localhost in production');
    }
};