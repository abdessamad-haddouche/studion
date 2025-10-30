/**
 * Database Module Exports
 * @module lib/database
 * @description Central export point for all database utilities
 */

// ==========================================
// CONNECTION MANAGEMENT
// ==========================================

export { 
    connectDatabase, 
    disconnectDatabase, 
    getDatabaseStatus,
    setupGracefulShutdown
} from './connection.js';

// ==========================================
// DATABASE HELPERS
// ==========================================

export { 
    getDatabaseInfo, 
    validateDatabaseConfig 
} from './helpers.js';