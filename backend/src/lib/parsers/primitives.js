/**
 * Primitive Type Parsing Utilities
 * @module lib/parsers/primitives
 */

export const parseInteger = (value, fallback) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
};

export const parseFloat = (value, fallback) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
};