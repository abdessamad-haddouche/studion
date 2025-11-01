/**
 * User Routes
 * @module routes/user
 * @description User profile, preferences, and account management
 */

import express from 'express';

import {
  getCurrentUser,
  updateUserProfile,
  updateUserPreferences,
  getUserStats,
  getUserPointsBalance,
  getUserPointsHistory,
  getUserDocumentsStats,
  getUserQuizStats,
  updateUserAvatar,
  updateAcademicInfo,
  manageFocusTimer
} from '#controllers/index.js';

const router = express.Router();

// ==========================================
// USER PROFILE ROUTES
// ==========================================

/**
 * @route GET /api/users/me
 * @description Get current user profile
 * @access Private
 */
router.get('/me', getCurrentUser);

/**
 * @route PUT /api/users/me
 * @description Update user profile information
 * @access Private
 */
router.put('/me', updateUserProfile);

/**
 * @route PUT /api/users/me/avatar
 * @description Update user avatar
 * @access Private
 */
router.put('/me/avatar', updateUserAvatar);

/**
 * @route PUT /api/users/me/preferences
 * @description Update user app preferences
 * @access Private
 */
router.put('/me/preferences', updateUserPreferences);

/**
 * @route PUT /api/users/me/academic
 * @description Update user academic information
 * @access Private
 */
router.put('/me/academic', updateAcademicInfo);

// ==========================================
// USER STATS & ANALYTICS ROUTES
// ==========================================

/**
 * @route GET /api/users/me/stats
 * @description Get user's learning statistics
 * @access Private
 */
router.get('/me/stats', getUserStats);

/**
 * @route GET /api/users/me/stats/documents
 * @description Get user's document usage statistics
 * @access Private
 */
router.get('/me/stats/documents', getUserDocumentsStats);

/**
 * @route GET /api/users/me/stats/quizzes
 * @description Get user's quiz performance statistics
 * @access Private
 */
router.get('/me/stats/quizzes', getUserQuizStats);

// ==========================================
// POINTS SYSTEM ROUTES
// ==========================================

/**
 * @route GET /api/users/me/points
 * @description Get user's points balance
 * @access Private
 */
router.get('/me/points', getUserPointsBalance);

/**
 * @route GET /api/users/me/points/history
 * @description Get user's points transaction history
 * @access Private
 */
router.get('/me/points/history', getUserPointsHistory);

// ==========================================
// FOCUS TIMER ROUTES
// ==========================================

/**
 * @route POST /api/users/me/focus-timer
 * @description Manage focus timer sessions
 * @access Private
 */
router.post('/me/focus-timer', manageFocusTimer);

export default router;