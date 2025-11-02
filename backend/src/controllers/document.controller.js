/**
 * Document Controller
 * @module controllers/document
 * @description Handles document upload, management, and processing
 */

import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { HttpError } from '#exceptions/index.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';
import {
  createDocument,
  getUserDocuments,
  getDocumentById as getDocumentByIdService,
  updateDocument as updateDocumentService,
  deleteDocument as deleteDocumentService,
  permanentlyDeleteDocument
} from '#services/document.service.js';
import { FILE_VALIDATION } from '#constants/models/document/index.js';

// Ensure upload directory exists
const getUploadPath = () => {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const documentsPath = path.join(process.cwd(), uploadDir, 'documents');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(documentsPath)) {
    fs.mkdirSync(documentsPath, { recursive: true });
  }
  
  return documentsPath;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, getUploadPath());
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter to allow only PDFs
const fileFilter = function (req, file, cb) {
  const allowedFileTypes = (process.env.ALLOWED_FILE_TYPES || 'application/pdf').split(',');
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new HttpError.badRequest(FILE_VALIDATION.INVALID_MIME_TYPE_ERROR), false);
  }
};

// Export configured multer for use in routes
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 //
  }
});

/**
 * @route POST /api/documents
 * @description Upload a new document
 * @access Private
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'No document file uploaded'
      });
    }

    // Process file upload
    const userId = req.user.userId;
    const documentData = req.body;
    
    const document = await createDocument(req.file, documentData, userId);

    res.status(HTTP_STATUS_CODES.CREATED).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/documents
 * @description Get all user documents with optional filtering
 * @access Private
 */
export const getAllDocuments = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Extract query parameters
    const { 
      status, 
      category, 
      difficulty, 
      search,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const documents = await getUserDocuments(userId, {
      status,
      category,
      difficulty,
      searchTerm: search,
      page,
      limit,
      sortBy,
      sortOrder
    });

    // Get total count for pagination (if search is not used)
    let total = 0;
    if (!search) {
      const query = { userId, deletedAt: null };
      if (status) query.status = status;
      if (category) query['classification.category'] = category;
      if (difficulty) query['classification.difficulty'] = difficulty;
      
      total = await req.app.locals.models.Document.countDocuments(query);
    } else {
      total = documents.length; // Approximation for search results
    }

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      count: documents.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/documents/:id
 * @description Get a specific document by ID
 * @access Private
 */
export const getDocumentById = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    
    const document = await getDocumentByIdService(documentId, userId);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/documents/:id
 * @description Update document metadata
 * @access Private
 */
export const updateDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    const updateData = req.body;
    
    const document = await updateDocumentService(documentId, updateData, userId);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/documents/:id
 * @description Delete a document
 * @access Private
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    
    // Check for permanent delete flag
    const { permanent } = req.query;
    
    let result;
    if (permanent === 'true') {
      result = await permanentlyDeleteDocument(documentId, userId);
    } else {
      result = await deleteDocumentService(documentId, userId);
    }

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentSummary = async (req, res, next) => {
  try {
    res.status(HTTP_STATUS_CODES.NOT_IMPLEMENTED).json({
      message: 'Get document summary endpoint not yet implemented'
    });
  } catch (error) {
    next(error);
  }
};

export const processPendingDocument = async (req, res, next) => {
  try {
    res.status(HTTP_STATUS_CODES.NOT_IMPLEMENTED).json({
      message: 'Process document endpoint not yet implemented'
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentAnalytics = async (req, res, next) => {
  try {
    res.status(HTTP_STATUS_CODES.NOT_IMPLEMENTED).json({
      message: 'Get document analytics endpoint not yet implemented'
    });
  } catch (error) {
    next(error);
  }
};