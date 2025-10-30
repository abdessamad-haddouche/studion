/**
 * Server Initialization Functions
 * @module lib/server/initializers
 * @description Server and database initialization utilities
 */

import app from '#app';
import { serverConfig, configureServer, setupGracefulShutdown as setupServerShutdown } from '#config/index.js';
import { connectDatabase, validateDatabaseConfig, setupGracefulShutdown as setupDbShutdown } from '#lib/database/index.js';

// ==========================================
// INITIALIZATION FUNCTIONS
// ==========================================

/**
 * Initialize database connection
 */
export const initializeDatabase = async () => {
    console.log('\n🔧 Database Initialization:');
    
    // Validate configuration
    console.log('   ⏳ Validating configuration...');
    validateDatabaseConfig();
    console.log('   ✅ Configuration valid');
    
    // Connect to database
    console.log('   ⏳ Connecting to database...');
    await connectDatabase();
    console.log('   ✅ Database connected');
};

/**
 * Initialize HTTP server
 * @returns {Promise<Object>} HTTP server instance
 */
export const initializeServer = async () => {
    console.log('\n🌐 Server Initialization:');
    
    return new Promise((resolve, reject) => {
        console.log('   ⏳ Starting HTTP server...');
        
        const server = app.listen(serverConfig.port, serverConfig.host, (error) => {
            if (error) {
                reject(error);
                return;
            }
            
            console.log('   ✅ HTTP server started');
            resolve(server);
        });

        // Handle server errors
        server.on('error', reject);
    });
};

/**
 * Setup server configuration and graceful shutdown
 * @param {Object} server - HTTP server instance
 */
export const setupServerManagement = (server) => {
    console.log('\n⚙️ Server Management:');
    
    console.log('   ⏳ Configuring server settings...');
    configureServer(server);
    console.log('   ✅ Server configured');
    
    console.log('   ⏳ Setting up graceful shutdown...');
    setupServerShutdown(server);
    setupDbShutdown();
    console.log('   ✅ Graceful shutdown configured');
};