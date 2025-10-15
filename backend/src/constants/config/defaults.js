/**
 * Configuration Defaults
 * @module constants/config
 */

// Application Configuration Defaults
// Application Configuration Defaults
export const APP_DEFAULTS = Object.freeze({
    DEVELOPMENT: {
        APP_NAME: 'Studion',
        VERSION: '1.0.0-dev',
        API_PREFIX: '/api',
        // Feature flags
        FEATURE_API_DOCS: true,
        FEATURE_RATE_LIMITING: false, // Disabled in dev
        FEATURE_REQUEST_LOGGING: true
    },
  
    PRODUCTION: {
        APP_NAME: 'Studion',
        VERSION: '1.0.0',
        API_PREFIX: '/api',
        // Feature flags  
        FEATURE_API_DOCS: false, // Hidden in production
        FEATURE_RATE_LIMITING: true,
        FEATURE_REQUEST_LOGGING: true
    },
  
    TEST: {
        APP_NAME: 'Studion-Test',
        VERSION: '1.0.0-test',
        API_PREFIX: '/api',
        // Feature flags
        FEATURE_API_DOCS: false,
        FEATURE_RATE_LIMITING: false,
        FEATURE_REQUEST_LOGGING: false // Cleaner test output
    },
  
    COMMON: {
        APP_NAME: 'Studion',
        VERSION: '1.0.0',
        API_PREFIX: '/api',
        // Feature flags
        FEATURE_API_DOCS: false,
        FEATURE_RATE_LIMITING: true,
        FEATURE_REQUEST_LOGGING: true
    }
});

// Server Configuration Defaults
export const SERVER_DEFAULTS = Object.freeze({
    DEVELOPMENT: {
        PORT: 5000,
        HOST: 'localhost',
        TIMEOUT: 30000,
        MAX_CONNECTIONS: 100,
        KEEP_ALIVE_TIMEOUT: 5000,
        BODY_LIMIT: '10mb',
        COMPRESSION: true
    },
  
    PRODUCTION: {
        PORT: 5000,
        HOST: '0.0.0.0',
        TIMEOUT: 30000,
        MAX_CONNECTIONS: 1000,
        KEEP_ALIVE_TIMEOUT: 10000,
        BODY_LIMIT: '10mb',
        COMPRESSION: true
    },
  
    TEST: {
        PORT: 0, // Random available port
        HOST: 'localhost',
        TIMEOUT: 5000,
        MAX_CONNECTIONS: 10,
        KEEP_ALIVE_TIMEOUT: 1000,
        BODY_LIMIT: '1mb',
        COMPRESSION: false
    },
  
    COMMON: {
        PORT: 5000,
        HOST: '0.0.0.0',
        TIMEOUT: 30000,
        MAX_CONNECTIONS: 1000,
        KEEP_ALIVE_TIMEOUT: 5000,
        BODY_LIMIT: '10mb',
        COMPRESSION: true
    }
});