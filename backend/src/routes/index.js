/**
 * Routes Module
 * @module routes
 * @description Central export point for all API routes
 */

import express from 'express';
import authRoutes from './auth.routes.js';
import documentRoutes from './document.routes.js';
import quizRoutes from './quiz.routes.js';
import userRoutes from './user.routes.js';
import courseRoutes from './course.routes.js';
import { authenticateJWT } from '#middleware/auth.middleware.js';

/**
 * Setup all API routes
 * @param {express.Application} app - Express application
 */
export const setupRoutes = (app) => {
  // API version prefix
  const apiPrefix = process.env.API_PREFIX || '/api';
  
  // Auth routes (public)
  app.use(`${apiPrefix}/auth`, authRoutes);
  
  // Protected routes
  app.use(`${apiPrefix}/documents`, authenticateJWT, documentRoutes);
  app.use(`${apiPrefix}/quizzes`, authenticateJWT, quizRoutes);
  app.use(`${apiPrefix}/users`, authenticateJWT, userRoutes);
  app.use(`${apiPrefix}/courses`, courseRoutes);
  
  // API Status Route
  app.get(`${apiPrefix}/status`, (req, res) => {
    res.status(200).json({
      status: 'operational',
      version: process.env.APP_VERSION || '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
};

export default {
  setupRoutes
};