/**
 * Document Controller - UPDATED with AI Integration
 * @module controllers/document
 * @description Handles document upload, management, and AI processing
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
import {
  processDocumentWithAI,
  generateQuizFromDocument as generateQuizFromDocumentAI,
  generateCustomText,
  checkAIServiceStatus
} from '#services/ai.service.js';
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
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

/**
 * @route POST /api/documents
 * @description Upload a new document and optionally process with AI
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

    // Check if immediate AI processing is requested
    const { processImmediately } = req.body;
    
    if (processImmediately === 'true') {
      // Process document with AI in the background
      processDocumentAsync(document._id, req.file.path);
    }

    res.status(HTTP_STATUS_CODES.CREATED).json({
      success: true,
      message: 'Document uploaded successfully',
      document,
      processing: processImmediately === 'true' ? 'AI processing started' : 'Upload only'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Background function to process document with AI
 * @param {string} documentId - Document ID
 * @param {string} filePath - Path to uploaded file
 */
const processDocumentAsync = async (documentId, filePath) => {
  try {
    console.log(`Starting AI processing for document ${documentId}`);
    
    // Update document status to processing
    const Document = (await import('#models/document/Document.js')).default;
    await Document.findByIdAndUpdate(documentId, {
      status: 'processing',
      'processing.stage': 'ai_analysis',
      'processing.startedAt': new Date()
    });

    // Process with AI
    const aiResults = await processDocumentWithAI(filePath);
    
    if (aiResults.success) {
      // Update document with AI results
      await Document.findByIdAndUpdate(documentId, {
        status: 'completed',
        'processing.stage': 'completed',
        'processing.completedAt': new Date(),
        'content.summary': aiResults.summary,
        'content.keyPoints': aiResults.keyPoints,
        'content.topics': aiResults.topics,
        'processing.aiMetadata': aiResults.metadata
      });
      
      console.log(`AI processing completed for document ${documentId}`);
    } else {
      throw new Error('AI processing failed');
    }
    
  } catch (error) {
    console.error(`AI processing failed for document ${documentId}:`, error);
    
    // Update document with error status
    const Document = (await import('#models/document/Document.js')).default;
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      'processing.stage': 'failed',
      'processing.completedAt': new Date(),
      'processing.error': {
        type: 'ai_processing_error',
        message: error.message,
        occurredAt: new Date()
      }
    });
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

/**
 * @route GET /api/documents/:id/summary
 * @description Get document summary (from AI processing)
 * @access Private
 */
export const getDocumentSummary = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    
    const document = await getDocumentByIdService(documentId, userId);
    
    if (!document.content.summary) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Summary not available. Document may not be processed yet.'
      });
    }

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      summary: {
        text: document.content.summary,
        keyPoints: document.content.keyPoints || [],
        topics: document.content.topics || [],
        processedAt: document.processing.completedAt,
        aiMetadata: document.processing.aiMetadata
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/documents/:id/process
 * @description Manually trigger AI processing for a document
 * @access Private
 */
export const processPendingDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    
    // Get document
    const document = await getDocumentByIdService(documentId, userId);
    
    // Check if document can be processed
    if (document.status === 'completed') {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Document is already processed'
      });
    }
    
    if (document.status === 'processing') {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Document is currently being processed'
      });
    }

    // Get file path
    const filePath = document.file.storagePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Start background processing
    processDocumentAsync(documentId, filePath);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Document processing started',
      documentId: documentId,
      status: 'processing'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/documents/:id/analytics
 * @description Get document usage analytics
 * @access Private
 */
export const getDocumentAnalytics = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    
    const document = await getDocumentByIdService(documentId, userId);

    const analytics = {
      viewCount: document.analytics.viewCount || 0,
      downloadCount: document.analytics.downloadCount || 0,
      quizGeneratedCount: document.analytics.quizGeneratedCount || 0,
      lastViewedAt: document.analytics.lastViewedAt,
      lastDownloadedAt: document.analytics.lastDownloadedAt,
      createdAt: document.createdAt,
      fileSize: document.file.size,
      processingTime: document.processing.aiMetadata?.processingTime || null,
      tokensUsed: document.processing.aiMetadata?.tokensUsed || 0
    };

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/documents/:id/generate-quiz
 * @description Generate quiz questions from document using AI
 * @access Private
 */
export const generateDocumentQuiz = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    const { questionCount = 5, difficulty = 'intermediate' } = req.body;
    
    // Get document
    const document = await getDocumentByIdService(documentId, userId);
    
    // Check if document is processed
    if (document.status !== 'completed') {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Document must be processed before generating quiz'
      });
    }

    // Get file path
    const filePath = document.file.storagePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Generate quiz using AI
    const quizResults = await generateQuizFromDocumentAI(filePath, {
      questionCount: parseInt(questionCount),
      difficulty,
      questionTypes: ['multiple-choice']
    });

    // Update document analytics
    await document.recordQuizGeneration();

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz: {
        questions: quizResults.questions,
        metadata: quizResults.metadata,
        documentId: documentId,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/documents/:id/custom-analysis
 * @description Generate custom analysis of document using AI
 * @access Private
 */
export const generateCustomAnalysis = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Custom prompt is required'
      });
    }

    // Get document
    const document = await getDocumentByIdService(documentId, userId);
    
    // Get file path
    const filePath = document.file.storagePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Generate custom analysis using AI
    const analysisResults = await generateCustomText(filePath, prompt);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Custom analysis generated successfully',
      analysis: {
        prompt: prompt,
        result: analysisResults.generatedText,
        metadata: analysisResults.metadata,
        documentId: documentId,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/ai/status
 * @description Check AI service status
 * @access Private
 */
export const getAIServiceStatus = async (req, res, next) => {
  try {
    const status = await checkAIServiceStatus();
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      aiService: status
    });
  } catch (error) {
    next(error);
  }
};