/**
 * Document Routes - UPDATED with AI Integration
 * @module routes/document
 * @description Document management routes with AI processing capabilities
 */

import express from 'express';
import { 
  upload, 
  uploadDocument, 
  getAllDocuments, 
  getDocumentById, 
  updateDocument, 
  deleteDocument, 
  getDocumentSummary, 
  processPendingDocument, 
  getDocumentAnalytics,
  generateDocumentQuiz,
  generateCustomAnalysis,
  getAIServiceStatus
} from '#controllers/document.controller.js';
import { validateObjectId } from '#middleware/index.js';

const router = express.Router();

// ==========================================
// DOCUMENT MANAGEMENT ROUTES
// ==========================================

/**
 * @route POST /api/documents
 * @description Upload a new document (with optional AI processing)
 * @body {file} file - PDF document file
 * @body {string} title - Document title (optional)
 * @body {string} description - Document description (optional)
 * @body {string} category - Document category (optional)
 * @body {string} difficulty - Document difficulty (optional)
 * @body {string} tags - Comma-separated tags (optional)
 * @body {boolean} processImmediately - Start AI processing immediately (optional)
 * @access Private
 */
router.post('/', upload.single('file'), uploadDocument);

/**
 * @route GET /api/documents
 * @description Get all user documents with optional filtering
 * @query {string} status - Filter by status (pending, processing, completed, failed)
 * @query {string} category - Filter by category
 * @query {string} difficulty - Filter by difficulty
 * @query {string} search - Search in title, summary, and tags
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} sortBy - Sort field (default: createdAt)
 * @query {string} sortOrder - Sort order (asc/desc, default: desc)
 * @access Private
 */
router.get('/', getAllDocuments);

/**
 * @route GET /api/documents/:id
 * @description Get a specific document by ID
 * @access Private
 */
router.get('/:id', validateObjectId('id'), getDocumentById);

/**
 * @route PUT /api/documents/:id
 * @description Update document metadata
 * @body {string} title - Document title (optional)
 * @body {string} description - Document description (optional)
 * @body {string} classification.category - Document category (optional)
 * @body {string} classification.difficulty - Document difficulty (optional)
 * @body {string} classification.tags - Comma-separated tags (optional)
 * @access Private
 */
router.put('/:id', validateObjectId('id'), updateDocument);

/**
 * @route DELETE /api/documents/:id
 * @description Delete a document (soft delete by default)
 * @query {boolean} permanent - Permanently delete if true (optional)
 * @access Private
 */
router.delete('/:id', validateObjectId('id'), deleteDocument);

// ==========================================
// AI PROCESSING ROUTES
// ==========================================

/**
 * @route GET /api/documents/:id/summary
 * @description Get AI-generated document summary
 * @access Private
 */
router.get('/:id/summary', getDocumentSummary);

/**
 * @route POST /api/documents/:id/process
 * @description Manually trigger AI processing for a pending document
 * @access Private
 */
router.post('/:id/process', processPendingDocument);

/**
 * @route POST /api/documents/:id/generate-quiz
 * @description Generate quiz questions from document using AI
 * @body {number} questionCount - Number of questions (default: 5, max: 20)
 * @body {string} difficulty - Question difficulty (easy, intermediate, hard)
 * @access Private
 */
router.post('/:id/generate-quiz', generateDocumentQuiz);

/**
 * @route POST /api/documents/:id/custom-analysis
 * @description Generate custom analysis of document using AI
 * @body {string} prompt - Custom prompt for analysis (required)
 * @access Private
 */
router.post('/:id/custom-analysis', generateCustomAnalysis);

// ==========================================
// ANALYTICS & STATUS ROUTES
// ==========================================

/**
 * @route GET /api/documents/:id/analytics
 * @description Get document usage analytics
 * @access Private
 */
router.get('/:id/analytics', getDocumentAnalytics);

/**
 * @route GET /api/ai/status
 * @description Check AI service status and health
 * @access Private
 */
router.get('/ai/status', getAIServiceStatus);

export default router;