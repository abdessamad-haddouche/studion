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
  manageFocusTimer,
  addUserPoints,
  deductUserPoints,
  transferUserPoints,
  batchUserPointsOperations,
  getDetailedPointsSummary
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
// POINTS SYSTEM ROUTES (EXISTING + NEW)
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

/**
 * @route GET /api/users/me/points/summary
 * @description Get detailed points summary with statistics
 * @access Private
 */
router.get('/me/points/summary', getDetailedPointsSummary);

/**
 * @route POST /api/users/me/points/add
 * @description Add points to current user
 * @access Private
 */
router.post('/me/points/add', addUserPoints);

/**
 * @route POST /api/users/me/points/deduct
 * @description Deduct points from current user
 * @access Private
 */
router.post('/me/points/deduct', deductUserPoints);

/**
 * @route POST /api/users/me/points/transfer
 * @description Transfer points to another user
 * @access Private
 */
router.post('/me/points/transfer', transferUserPoints);

/**
 * @route POST /api/users/me/points/batch
 * @description Perform batch points operations
 * @access Private
 */
router.post('/me/points/batch', batchUserPointsOperations);

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