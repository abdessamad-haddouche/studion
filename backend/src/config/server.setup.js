/**
 * Server Configuration Setup
 * @module config/server-setup
 */

import { serverConfig } from './server.config.js';

/**
 * Configure HTTP server instance with production settings
 * @param {http.Server} server - HTTP server instance
 */
export const configureServer = (server) => {
  // Connection timeouts
  server.timeout = serverConfig.timeout;
  server.keepAliveTimeout = serverConfig.keepAliveTimeout;
  
  // Connection limits
  server.maxConnections = serverConfig.maxConnections;
  
  // Future: Add monitoring, health checks, clustering here
};

/**
 * Setup graceful shutdown handlers
 * @param {http.Server} server - HTTP server instance
 */
export const setupGracefulShutdown = (server) => {
  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    
    // Close database connections first
    try {
      await DatabaseService.disconnect();
      console.log('Database disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting database:', error.message);
    }
    
    // Close HTTP server
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    
    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('Forcing shutdown...');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));
};
