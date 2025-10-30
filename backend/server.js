/**
 * Studion Server
 * @module server
 * @description Clean, modular server entry point
 */

import 'dotenv/config';
import {
    displayStartupBanner,
    displayDatabaseConfig,
    displayServerInfo,
    displaySuccessMessage,
    initializeDatabase,
    initializeServer,
    setupServerManagement
} from '#lib/server/index.js';

// ==========================================
// STARTUP SEQUENCE
// ==========================================

/**
 * Main server startup function
 */
const startServer = async () => {
    try {
        // Display startup banner
        displayStartupBanner();
        
        // Initialize database
        await initializeDatabase();
        displayDatabaseConfig();
        
        // Initialize HTTP server
        const server = await initializeServer();
        displayServerInfo(server);
        
        // Setup server management
        setupServerManagement(server);
        
        // Display success message
        displaySuccessMessage();
        
        return server;
        
    } catch (error) {
        console.error('\n❌ Server startup failed:');
        console.error(`   Error: ${error.message}`);
        console.error('\n💡 Please check your configuration and try again.\n');
        process.exit(1);
    }
};

// ==========================================
// ERROR HANDLING
// ==========================================

process.on('uncaughtException', (error) => {
    console.error('\n❌ Uncaught Exception:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('\n❌ Unhandled Rejection:', reason);
    process.exit(1);
});

// ==========================================
// SERVER STARTUP
// ==========================================

const server = await startServer();

export default server;