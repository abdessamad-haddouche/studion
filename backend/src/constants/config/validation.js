/**
  * Configuration Validation
  * @module constants/validation/config/app
  */

export const APP_VALIDATION = Object.freeze({
    PATTERNS: {
        // Application name: Alphanumeric, spaces, dashes, underscores
        APP_NAME: /^[a-zA-Z0-9\s\-_]+$/,
        // Semantic Versioning (e.g., 1.0.0, v2.1.3-beta)
        VERSION: /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/,
        // API Prefix: Starts with a slash, followed by alphanumeric characters, dashes, or underscores
        API_PREFIX: /^\/([a-zA-Z0-9\-_]+(\/[a-zA-Z0-9\-_]+)*)?$/
    },

    LIMITS: {
        APP_NAME: { MIN: 1, MAX: 50 },
        VERSION: { MIN: 5, MAX: 20 }, // e.g., "1.0.0" to "1.0.0-beta.1.2.3"
        API_PREFIX: { MIN: 1, MAX: 50 },
    },
});

export const SERVER_VALIDATION = Object.freeze({
    PATTERNS: {
        HOST: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
        PROTOCOL: /^https?$/
    },
  
    LIMITS: {
        PORT: { MIN: 0, MAX: 65535 },
        PRIVILEGED_PORT_THRESHOLD: 1024,
        TIMEOUT: { MIN: 1000, MAX: 300000 }, // 1s to 5min
        MAX_CONNECTIONS: { MIN: 1, MAX: 10000 },
        KEEP_ALIVE_TIMEOUT: { MIN: 1000, MAX: 120000 } // 1s to 2min
    },
});