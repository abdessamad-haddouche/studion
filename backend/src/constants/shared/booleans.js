/**
 * Common Parsing Constants and Utilities
 * @module constants/shared/booleans
 */

/**
 * Values that evaluate to true in boolean parsing
 */
export const TRUTHY_VALUES = Object.freeze([
    'true', '1', 'yes', 'on', 'enabled'
]);

/**
 * Values that evaluate to false in boolean parsing
 */
export const FALSY_VALUES = Object.freeze([
    'false', '0', 'no', 'off', 'disabled'
]);

/**
 * All valid boolean string values
 */
export const VALID_BOOLEAN_VALUES = Object.freeze([
    ...TRUTHY_VALUES,
    ...FALSY_VALUES
]);

