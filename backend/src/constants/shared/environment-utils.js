/**
 * Environment Utility Functions
 * @module constants/shared/environment-utils
 */

import { ENVIRONMENTS, VALID_ENVIRONMENTS } from './environments.js';

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