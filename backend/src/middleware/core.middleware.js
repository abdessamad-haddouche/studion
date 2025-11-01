/**
 * Core Middleware
 * @module middleware/core
 * @description Basic processing middleware
 */

import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { serverConfig, appConfig } from '#config/index.js';
import { isDevelopment } from '#lib/config/index.js';

/**
 * Apply core middleware to Express app
 * @param {express.Application} app - Express application
 */
export const setupCoreMiddleware = (app) => {
    // Body parsers
    app.use(express.json({ limit: serverConfig.bodyLimit }));
    app.use(express.urlencoded({ extended: true, limit: serverConfig.bodyLimit }));
    app.use(cookieParser())
    
    // Request logging - simple dev logging in development, minimal in production
    if (appConfig.features.requestLogging) {
        app.use(morgan(isDevelopment() ? 'dev' : 'tiny'));
    }
};

export default setupCoreMiddleware;