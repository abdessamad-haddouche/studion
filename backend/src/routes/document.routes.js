/**
 * Document Routes
 * @module routes/document
 * @description Document management routes (upload, process, retrieve)
 */

import express from 'express';
import multer from 'multer';

// Import controllers
// These will be implemented later - placeholders for now
import {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentSummary,
  updateDocument,
  processPendingDocument,
  getDocumentAnalytics
} from '#controllers/index.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==========================================
// DOCUMENT MANAGEMENT ROUTES
// ==========================================

/**
 * @route POST /api/documents
 * @description Upload a new document
 * @access Private
 */
router.post('/', upload.single('document'), uploadDocument);

/**
 * @route GET /api/documents
 * @description Get all user documents with optional filtering
 * @access Private
 */
router.get('/', getAllDocuments);

/**
 * @route GET /api/documents/:id
 * @description Get a specific document by ID
 * @access Private
 */
router.get('/:id', getDocumentById);

/**
 * @route PUT /api/documents/:id
 * @description Update document metadata
 * @access Private
 */
router.put('/:id', updateDocument);

/**
 * @route DELETE /api/documents/:id
 * @description Delete a document
 * @access Private
 */
router.delete('/:id', deleteDocument);

// ==========================================
// DOCUMENT PROCESSING ROUTES
// ==========================================

/**
 * @route GET /api/documents/:id/summary
 * @description Get document summary
 * @access Private
 */
router.get('/:id/summary', getDocumentSummary);

/**
 * @route POST /api/documents/:id/process
 * @description Manually trigger processing for a pending document
 * @access Private
 */
router.post('/:id/process', processPendingDocument);

/**
 * @route GET /api/documents/:id/analytics
 * @description Get document usage analytics
 * @access Private
 */
router.get('/:id/analytics', getDocumentAnalytics);

export default router;