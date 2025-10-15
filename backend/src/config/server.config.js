/**
 * Server Configuration
 * @module config/server
 */

import { getEnvironmentDefaults } from '#lib/config/index.js';
import { getValidEnvironment } from '#lib/config/index.js';
import { parseInteger, parseBoolean } from '#lib/parsers/index.js';

const env = getValidEnvironment(process.env.NODE_ENV);
const defaults = getEnvironmentDefaults(env, 'server');

export const serverConfig = Object.freeze({
    port: parseInteger(process.env.PORT, defaults.PORT),
    host: process.env.HOST || defaults.HOST,
    timeout: parseInteger(process.env.SERVER_TIMEOUT, defaults.TIMEOUT),
    maxConnections: parseInteger(process.env.MAX_CONNECTIONS, defaults.MAX_CONNECTIONS),
    keepAliveTimeout: parseInteger(process.env.KEEP_ALIVE_TIMEOUT, defaults.KEEP_ALIVE_TIMEOUT),
    bodyLimit: process.env.BODY_LIMIT || defaults.BODY_LIMIT,
    compression: parseBoolean(process.env.COMPRESSION, defaults.COMPRESSION)
});