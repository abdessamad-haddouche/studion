/**
 * Environment Constants
 * @module constants/shared/environments
 */

/**
 * Available application environments
 */
export const ENVIRONMENTS = Object.freeze({
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test',
    STAGING: 'staging'
});

/**
 * Valid environment values array
 */
export const VALID_ENVIRONMENTS = Object.freeze(
    Object.values(ENVIRONMENTS)
);

