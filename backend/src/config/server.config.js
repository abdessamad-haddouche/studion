/**
 * Server Configuration - FIXED FOR NETWORK ACCESS
 * @module config/server
 */

import { getEnvironmentDefaults } from '#lib/config/index.js';
import { getValidEnvironment } from '#lib/config/index.js';
import { parseInteger, parseBoolean } from '#lib/parsers/index.js';

const env = getValidEnvironment(process.env.NODE_ENV);
const defaults = getEnvironmentDefaults(env, 'server');

export const serverConfig = Object.freeze({
    port: parseInteger(process.env.PORT, defaults.PORT || 5000),
    host: process.env.HOST || '0.0.0.0', // ← CHANGED FROM 127.0.0.1 TO 0.0.0.0
    timeout: parseInteger(process.env.SERVER_TIMEOUT, defaults.TIMEOUT),
    maxConnections: parseInteger(process.env.MAX_CONNECTIONS, defaults.MAX_CONNECTIONS),
    keepAliveTimeout: parseInteger(process.env.KEEP_ALIVE_TIMEOUT, defaults.KEEP_ALIVE_TIMEOUT),
    bodyLimit: process.env.BODY_LIMIT || defaults.BODY_LIMIT,
    compression: parseBoolean(process.env.COMPRESSION, defaults.COMPRESSION)
});