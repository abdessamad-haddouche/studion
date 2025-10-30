/**
 * Environment Helper Functions
 * @module lib/config/environment
 * @description Utility functions for environment detection and configuration
 */

import { ENVIRONMENTS, VALID_ENVIRONMENTS } from '#constants/shared/environments.js';

export const isValidEnvironment = (env) => {
    return typeof env === 'string' && VALID_ENVIRONMENTS.includes(env.toLowerCase());
};

export const getValidEnvironment = (env, fallback = ENVIRONMENTS.DEVELOPMENT) => {
    if (!env) return fallback;
    
    const normalizedEnv = env.toLowerCase();
    
    if (!VALID_ENVIRONMENTS.includes(normalizedEnv)) {
        if (fallback && VALID_ENVIRONMENTS.includes(fallback)) {
            return fallback;
        }
        throw new Error(`Invalid environment: ${env}. Valid: ${VALID_ENVIRONMENTS.join(', ')}`);
    }
    
    return normalizedEnv;
};

export const getCurrentEnvironment = () => {
    return process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;
};

export const isDevelopment = () => getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT;
export const isProduction = () => getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION;
export const isTest = () => getCurrentEnvironment() === ENVIRONMENTS.TEST;

/**
 * Get normalized environment name (uppercase) for database defaults
 * @returns {string} Normalized environment name
 */
export const getNormalizedEnvironment = () => getCurrentEnvironment().toUpperCase();

/**
 * Get environment-specific value with fallback
 * @param {Object} envValues - Object with environment-specific values
 * @param {*} defaultValue - Default value if environment not found
 * @returns {*} Environment-specific value or default
 */
export const getEnvValue = (envValues, defaultValue = null) => {
    const env = getNormalizedEnvironment();
    return envValues[env] || envValues.COMMON || defaultValue;
};

/**
 * Check if feature flag is enabled
 * @param {string} flagName - Feature flag name from environment variables
 * @param {boolean} defaultValue - Default value if not set
 * @returns {boolean} Feature flag status
 */
export const isFeatureEnabled = (flagName, defaultValue = false) => {
    const value = process.env[flagName];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
};

/**
 * Get numeric environment variable with validation
 * @param {string} varName - Environment variable name
 * @param {number} defaultValue - Default value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Validated numeric value
 */
export const getNumericEnv = (varName, defaultValue, min = 0, max = Infinity) => {
    const value = parseInt(process.env[varName]);
    if (isNaN(value)) return defaultValue;
    return Math.min(Math.max(value, min), max);
};

// ==========================================
// EXPORT ENVIRONMENT INFO
// ==========================================

export const environmentInfo = Object.freeze({
    current: getCurrentEnvironment(),
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    isTest: isTest(),
    normalized: getNormalizedEnvironment(),
    valid: VALID_ENVIRONMENTS
});