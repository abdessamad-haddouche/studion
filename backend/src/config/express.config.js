/**
 * Express Application Configuration
 * @module config/express
 */

import { appConfig } from './app.config.js';
import { isDevelopment } from '#lib/config/index.js';

export const configureApp = (app) => {
    app.set('env', appConfig.env);
    app.set('trust proxy', !isDevelopment());
    app.disable('x-powered-by');
    app.set('case sensitive routing', true);
    app.set('strict routing', false);
};