/**
 * Defaults Utility Functions
 * @module lib/config/defaults
 */

import { APP_DEFAULTS, SERVER_DEFAULTS } from '#constants/config/index.js';

const DEFAULTS_REGISTRY = Object.freeze({
    app: APP_DEFAULTS,
    server: SERVER_DEFAULTS
});

/**
 * Get environment-specific defaults for a config category
 */
export const getEnvironmentDefaults = (env, category) => {
    if (!env || typeof env !== 'string') {
        throw new Error('Environment must be a non-empty string');
    }
  
    if (!category || typeof category !== 'string') {
        throw new Error('Category must be a non-empty string');
    }
  
    const categoryDefaults = DEFAULTS_REGISTRY[category.toLowerCase()];
    if (!categoryDefaults) {
        const availableCategories = Object.keys(DEFAULTS_REGISTRY).join(', ');
        throw new Error(`Invalid category: ${category}. Available: ${availableCategories}`);
    }
  
    const normalizedEnv = env.toUpperCase();
    const envDefaults = categoryDefaults[normalizedEnv];
  
    if (!envDefaults) {
        const availableEnvs = Object.keys(categoryDefaults).filter(key => key !== 'COMMON');
        throw new Error(`Invalid environment: ${env}. Available: ${availableEnvs.join(', ')}`);
    }
  
    return envDefaults;
};