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

import app from '#app'; // Import your Express app directly

// ==========================================
// STARTUP SEQUENCE
// ==========================================

const startServer = async () => {
    try {
        displayStartupBanner();
        
        await initializeDatabase();
        displayDatabaseConfig();
        
        const server = await initializeServer();
        
        displayServerInfo(server);
        setupServerManagement(server);
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