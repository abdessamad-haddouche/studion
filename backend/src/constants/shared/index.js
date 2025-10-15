/**
 * Shared Constants and Utilities Public API
 * @module constants/shared
 */

// Environment constants
export { 
    ENVIRONMENTS, 
    VALID_ENVIRONMENTS 
} from './environments.js';

// Environment utilities
export { 
    isValidEnvironment, 
    getValidEnvironment 
} from './environment-utils.js';

// Boolean constants
export { 
    TRUTHY_VALUES, 
    FALSY_VALUES, 
    VALID_BOOLEAN_VALUES 
} from './booleans.js';

// Boolean utilities
export { 
    parseBoolean 
} from './boolean-utils.js';