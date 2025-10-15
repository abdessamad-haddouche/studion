/**
 * Validation Utility Functions
 * @module lib/config/validation
 */

import { APP_VALIDATION, SERVER_VALIDATION } from '#constants/config/validation.js';

const VALIDATION_REGISTRY = Object.freeze({
    app: APP_VALIDATION,
    server: SERVER_VALIDATION
});

/**
 * Get validation rules for a config category
 */
export const getConfigValidation = (category) => {
    if (!category || typeof category !== 'string') {
        throw new Error('Category must be a non-empty string');
    }
  
    const validation = VALIDATION_REGISTRY[category.toLowerCase()];
    if (!validation) {
        const availableCategories = Object.keys(VALIDATION_REGISTRY).join(', ');
        throw new Error(`Invalid category: ${category}. Available: ${availableCategories}`);
    }
  
    return validation;
};

/**
 * Validate config value against rules
 */
export const validateConfigValue = (category, field, value) => {
    const validation = getConfigValidation(category);
  
    if (validation.PATTERNS?.[field]) {
        if (!validation.PATTERNS[field].test(String(value))) {
            throw new Error(`Invalid ${field} format`);
        }
    }
  
    if (validation.LIMITS?.[field]) {
        const limits = validation.LIMITS[field];
        if (typeof value === 'string' && (value.length < limits.MIN || value.length > limits.MAX)) {
            throw new Error(`${field} length must be between ${limits.MIN} and ${limits.MAX}`);
        }
    }
  
    return value;
};