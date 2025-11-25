/**
 * Quiz Routes
 * @module routes/quiz
 * @description Quiz generation, attempt, and results management with bulk quiz support
 */

import express from 'express';
import {
  generateQuiz,
  getAllQuizzes,
  getQuizById,
  getAllQuizzesForDocument,
  getDocumentQuizStats,
  selectQuizForDocument,
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
// BULK QUIZ COLLECTION ROUTES (NEW)
// ==========================================

/**
 * @route GET /api/quizzes/document/:documentId
 * @description Get all generated quizzes for a specific document
 * @query {string} difficulty - Filter by difficulty (easy, medium, hard)
 * @query {string} questionType - Filter by question type (true_false, multiple_choice, fill_blank)
 * @query {boolean} excludeUsed - Exclude already attempted quizzes (default: false)
 * @query {number} limit - Number of quizzes to return (default: 20)
 * @access Private
 */
router.get('/document/:documentId', validateObjectId('documentId'), getAllQuizzesForDocument);

/**
 * @route GET /api/quizzes/document/:documentId/stats
 * @description Get quiz collection statistics for a document
 * @access Private
 */
router.get('/document/:documentId/stats', validateObjectId('documentId'), getDocumentQuizStats);

/**
 * @route POST /api/quizzes/document/:documentId/select
 * @description Select a random quiz from the document's pre-generated collection
 * @body {string} difficulty - Preferred difficulty (optional)
 * @body {string} questionType - Preferred question type (optional)
 * @access Private
 */
router.post('/document/:documentId/select', validateObjectId('documentId'), selectQuizForDocument);

// ==========================================
// QUIZ MANAGEMENT ROUTES
// ==========================================

/**
 * @route POST /api/quizzes/generate
 * @description Generate a custom quiz (for specific question counts, uses question pool)
 * @body {string} documentId - Document ID to generate quiz from (required)
 * @body {number} questionCount - Number of questions (1-20) (default: 10)
 * @body {string} difficulty - Quiz difficulty (easy, medium, hard) (default: medium)
 * @body {string} questionType - Question type (true_false, multiple_choice, fill_blank)
 * @body {string} title - Custom quiz title (optional)
 * @access Private
 */
router.post('/generate', generateQuiz);

/**
 * @route GET /api/quizzes
 * @description Get all user quizzes with optional filtering
 * @query {string} status - Filter by status (active, archived)
 * @query {string} difficulty - Filter by difficulty (easy, medium, hard)
 * @query {string} category - Filter by category
 * @query {string} documentId - Filter by document ID
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} sortBy - Sort field (default: createdAt)
 * @query {string} sortOrder - Sort order (asc/desc, default: desc)
 * @access Private
 */
router.get('/', getAllQuizzes);

/**
 * @route GET /api/quizzes/:id
 * @description Get a specific quiz by ID with questions
 * @access Private
 */
router.get('/:id', validateObjectId('id'), getQuizById);

// ==========================================
// QUIZ ATTEMPT ROUTES
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
 * @body {number} questionId - Question ID
 * @body {string} answer - User's answer
 * @body {number} timeSpent - Time spent on question (milliseconds)
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
 * @description Get detailed results for a completed quiz attempt
 * @access Private
 */
router.get('/:id/attempt/:attemptId/results', validateObjectId(['id', 'attemptId']), getQuizAttemptResults);

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
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} status - Filter by attempt status
 * @access Private
 */
router.get('/history', getQuizAttemptHistory);

export default router;