/**
 * Quiz Routes - ENHANCED WITH VALIDATION
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
import { validateObjectId } from '#middleware/index.js';

const router = express.Router();

// ==========================================
// QUIZ MANAGEMENT ROUTES
// ==========================================

/**
 * @route POST /api/quizzes/generate
 * @description Generate a quiz from a document using AI
 * @body {string} documentId - Document ID to generate quiz from (required)
 * @body {number} questionCount - Number of questions (5, 10, 15, 20) (default: 5)
 * @body {string} difficulty - Quiz difficulty (easy, medium, hard) (default: medium)
 * @body {string} title - Custom quiz title (optional)
 * @body {Array} categories - Quiz categories (optional)
 * @access Private
 */
router.post('/generate', generateQuiz);

/**
 * @route GET /api/quizzes
 * @description Get all user quizzes with optional filtering
 * @query {string} status - Filter by status (active, archived)
 * @query {string} difficulty - Filter by difficulty (easy, medium, hard)
 * @query {string} category - Filter by category
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} sortBy - Sort field (default: createdAt)
 * @query {string} sortOrder - Sort order (asc/desc, default: desc)
 * @access Private
 */
router.get('/', getAllQuizzes);

/**
 * @route GET /api/quizzes/:id
 * @description Get a specific quiz by ID
 * @access Private
 */
router.get('/:id', validateObjectId('id'), getQuizById);

// ==========================================
// QUIZ ATTEMPT ROUTES (PLACEHOLDER)
// ==========================================

/**
 * @route POST /api/quizzes/:id/attempt
 * @description Start a new quiz attempt
 * @access Private
 */
router.post('/:id/attempt', validateObjectId('id'), startQuizAttempt);

/**
 * @route PUT /api/quizzes/:id/attempt/:attemptId
 * @description Submit answer for a quiz question
 * @access Private
 */
router.put('/:id/attempt/:attemptId', validateObjectId(['id', 'attemptId']), submitQuizAnswer);

/**
 * @route POST /api/quizzes/:id/attempt/:attemptId/complete
 * @description Complete a quiz attempt
 * @access Private
 */
router.post('/:id/attempt/:attemptId/complete', validateObjectId(['id', 'attemptId']), completeQuizAttempt);

/**
 * @route GET /api/quizzes/:id/attempt/:attemptId/results
 * @description Get results for a completed quiz attempt
 * @access Private
 */
router.get('/:id/attempt/:attemptId/results', validateObjectId(['id', 'attemptId']), getQuizAttemptResults);

// ==========================================
// QUIZ ANALYTICS ROUTES (PLACEHOLDER)
// ==========================================

/**
 * @route GET /api/users/me/quiz-stats
 * @description Get user's quiz performance statistics
 * @access Private
 */
router.get('/stats', getUserQuizStats);

/**
 * @route GET /api/users/me/quiz-history
 * @description Get user's quiz attempt history
 * @access Private
 */
router.get('/history', getQuizAttemptHistory);

export default router;