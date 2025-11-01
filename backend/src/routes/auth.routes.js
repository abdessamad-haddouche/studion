/**
 * Authentication Routes
 * @module routes/auth
 * @description User authentication and account management routes
 */

import express from 'express';
import { authenticateJWT } from '#middleware/auth.middleware.js';

import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
} from '#controllers/index.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * @description Login a user and get tokens
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/auth/refresh-token
 * @description Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh-token', refreshToken);

/**
 * @route GET /api/auth/verify-email/:token
 * @description Verify user email with verification token
 * @access Public
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @route POST /api/auth/forgot-password
 * @description Request password reset link
 * @access Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route POST /api/auth/reset-password/:token
 * @description Reset password with token
 * @access Public
 */
router.post('/reset-password/:token', resetPassword);

// ==========================================
// PROTECTED ROUTES
// ==========================================

/**
 * @route POST /api/auth/logout
 * @description Logout a user (invalidate token)
 * @access Private
 */
router.post('/logout', authenticateJWT, logout);

/**
 * @route PUT /api/auth/change-password
 * @description Change user password
 * @access Private
 */
router.put('/change-password', authenticateJWT, changePassword);

export default router;