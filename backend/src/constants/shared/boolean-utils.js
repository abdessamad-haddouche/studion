/**
 * Boolean Utility Functions
 * @module constants/shared/boolean-utils
 */

import { TRUTHY_VALUES, FALSY_VALUES, VALID_BOOLEAN_VALUES } from './booleans.js';

export const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined || value === '') return defaultValue;
    
    const normalizedValue = String(value).toLowerCase().trim();
    
    if (TRUTHY_VALUES.includes(normalizedValue)) return true;
    if (FALSY_VALUES.includes(normalizedValue)) return false;
    
    throw new Error(`Invalid boolean value: "${value}". Valid: ${VALID_BOOLEAN_VALUES.join(', ')}`);
};