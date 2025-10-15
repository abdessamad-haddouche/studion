/**
 * Application Configuration
 * @module config/app
 */

import { getEnvironmentDefaults } from '#lib/config/index.js';
import { getValidEnvironment } from '#lib/config/index.js';
import { parseBoolean } from '#lib/parsers/index.js';

const env = getValidEnvironment(process.env.NODE_ENV);
const defaults = getEnvironmentDefaults(env, 'app');

export const appConfig = Object.freeze({
    env,
    name: process.env.APP_NAME || defaults.APP_NAME,
    version: process.env.APP_VERSION || defaults.VERSION,
    apiPrefix: process.env.API_PREFIX || defaults.API_PREFIX,
    features: Object.freeze({
        apiDocs: parseBoolean(process.env.FEATURE_API_DOCS, defaults.FEATURE_API_DOCS),
        rateLimiting: parseBoolean(process.env.FEATURE_RATE_LIMITING, defaults.FEATURE_RATE_LIMITING),
        requestLogging: parseBoolean(process.env.FEATURE_REQUEST_LOGGING, defaults.FEATURE_REQUEST_LOGGING),
    }),
});