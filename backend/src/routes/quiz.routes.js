/**
 * Quiz Routes
 * @module routes/quiz
 * @description Quiz generation, attempt, and results management
 */

import express from 'express';

import {
  generateQuiz,
  getAllQuizzes,
  getQuizById,
  startQuizAttempt,
  submitQuizAnswer,
  completeQuizAttempt,
  getQuizAttemptResults,
  getUserQuizStats,
  getQuizAttemptHistory
} from '#controllers/index.js';

const router = express.Router();

// ==========================================
// QUIZ MANAGEMENT ROUTES
// ==========================================

/**
 * @route POST /api/quizzes/generate
 * @description Generate a quiz from a document
 * @access Private
 */
router.post('/generate', generateQuiz);

/**
 * @route GET /api/quizzes
 * @description Get all user quizzes with optional filtering
 * @access Private
 */
router.get('/', getAllQuizzes);

/**
 * @route GET /api/quizzes/:id
 * @description Get a specific quiz by ID
 * @access Private
 */
router.get('/:id', getQuizById);

// ==========================================
// QUIZ ATTEMPT ROUTES
// ==========================================

/**
 * @route POST /api/quizzes/:id/attempt
 * @description Start a new quiz attempt
 * @access Private
 */
router.post('/:id/attempt', startQuizAttempt);

/**
 * @route PUT /api/quizzes/:id/attempt/:attemptId
 * @description Submit answer for a quiz question
 * @access Private
 */
router.put('/:id/attempt/:attemptId', submitQuizAnswer);

/**
 * @route POST /api/quizzes/:id/attempt/:attemptId/complete
 * @description Complete a quiz attempt
 * @access Private
 */
router.post('/:id/attempt/:attemptId/complete', completeQuizAttempt);

/**
 * @route GET /api/quizzes/:id/attempt/:attemptId/results
 * @description Get results for a completed quiz attempt
 * @access Private
 */
router.get('/:id/attempt/:attemptId/results', getQuizAttemptResults);

// ==========================================
// QUIZ ANALYTICS ROUTES
// ==========================================

/**
 * @route GET /api/quizzes/stats
 * @description Get user's quiz performance statistics
 * @access Private
 */
router.get('/stats', getUserQuizStats);

/**
 * @route GET /api/quizzes/history
 * @description Get user's quiz attempt history
 * @access Private
 */
router.get('/history', getQuizAttemptHistory);

export default router;