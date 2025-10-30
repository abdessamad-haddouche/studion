/**
 * Server Startup Utilities
 * @module lib/server/startup
 * @description Modular server startup functions
 */

import { appConfig } from '#config/index.js';
import { getDatabaseInfo } from '#lib/database/index.js';

// ==========================================
// DISPLAY FUNCTIONS
// ==========================================

/**
 * Display server startup banner
 */
export const displayStartupBanner = () => {
    console.log('🚀 Starting Studion Server');
    console.log('=' .repeat(50));
};

/**
 * Display database configuration
 */
export const displayDatabaseConfig = () => {
    const dbInfo = getDatabaseInfo();
    
    console.log('\n📊 Database Configuration:');
    console.log(`   Environment: ${dbInfo.environment}`);
    console.log(`   Database: ${dbInfo.database}`);
    console.log(`   URI: ${dbInfo.uri}`);
    console.log(`   Pool Size: ${dbInfo.poolSize}`);
    console.log(`   Timeout: ${dbInfo.timeout}ms`);
    console.log(`   Debug: ${dbInfo.debug ? 'ON' : 'OFF'}`);
};

/**
 * Display server information
 * @param {Object} server - HTTP server instance
 */
export const displayServerInfo = (server) => {
    const address = server.address();
    const host = address.address === '::' ? 'localhost' : address.address;
    
    console.log('\n🌐 Server Information:');
    console.log(`   Name: ${appConfig.name} v${appConfig.version}`);
    console.log(`   URL: http://${host}:${address.port}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   API Prefix: ${appConfig.apiPrefix}`);
    console.log(`   PID: ${process.pid}`);
};

/**
 * Display startup success message
 */
export const displaySuccessMessage = () => {
    console.log('\n✅ Startup Complete!');
    console.log('=' .repeat(50));
    console.log('🎯 Server ready for connections!\n');
};