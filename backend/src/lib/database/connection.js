/**
 * Database Connection Manager
 * @module lib/database/connection
 * @description Clean MongoDB connection
 */

import mongoose from 'mongoose';
import { databaseConfig } from '#config/index.js';

// ==========================================
// CONNECTION STATE
// ==========================================

let isConnected = false;

// ==========================================
// CONNECTION FUNCTION
// ==========================================

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export const connectDatabase = async () => {
    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(databaseConfig.uri, databaseConfig.options);
        isConnected = true;
        
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
};

/**
 * Disconnect from MongoDB database
 * @returns {Promise<void>}
 */
export const disconnectDatabase = async () => {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('✅ MongoDB disconnected');
    } catch (error) {
        console.error('❌ MongoDB disconnection failed:', error.message);
        throw error;
    }
};

/**
 * Get connection status
 * @returns {boolean}
 */
export const getDatabaseStatus = () => {
    return {
        isConnected,
        readyState: mongoose.connection.readyState
    };
};

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

/**
 * Setup graceful shutdown handlers
 */
export const setupGracefulShutdown = () => {
    const shutdown = async (signal) => {
        console.log(`\n🔄 Received ${signal}. Closing MongoDB connection...`);
        
        try {
            await disconnectDatabase();
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during shutdown:', error.message);
            process.exit(1);
        }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('SIGUSR2', shutdown); // nodemon restart
};

export default connectDatabase;