/**
 * Enhanced Document Controller - With Comprehensive Quiz Generation
 * @module controllers/document-enhanced
 * @description Enhanced document controller with bulk quiz generation after processing
 */

import '#docs/swagger/document-routes-docs.js';

import multer from 'multer';
import path from 'path';
import { HttpError } from '#exceptions/index.js';
import Document from '#models/document/Document.js';
import { 
  createDocument, 
  getUserDocuments, 
  getDocumentById as getDocumentByIdService,
  updateDocument as updateDocumentService,
  deleteDocument as deleteDocumentService 
} from '#services/document.service.js';
import { 
  processDocumentWithAI, 
  generateQuizFromDocument,
  generateCustomText,
  checkAIServiceStatus,
  generateComprehensiveQuizCollection ,
} from '#services/ai.service.js';
import { storeQuizCollection } from '#services/quizCollection.service.js';


// ==========================================
// MULTER CONFIGURATION FOR FILE UPLOAD
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new HttpError.badRequest('Only PDF and TXT files are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: fileFilter
});

// ==========================================
// DOCUMENT UPLOAD WITH ENHANCED PROCESSING
// ==========================================

/**
 * Upload document and trigger comprehensive processing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const uploadDocument = async (req, res, next) => {
  try {
    console.log('🔍 AUTH DEBUG:', { user: req.user, hasAuth: !!req.headers.authorization });

    
    console.log(`📤 Document upload started by user: ${req.user.userId}`)
    
    if (!req.file) {
      return next(HttpError.badRequest('No file uploaded'));
    }
    
    // Extract metadata from request body
    const documentData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,  // type must be determined by the ai
      category: req.body.category,
      difficulty: req.body.difficulty,
      tags: req.body.tags // tags must be determined by the ai
    };

    console.log(`📄 Uploaded file: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // Create document record
    const document = await createDocument(req.file, documentData, req.user.userId);
    console.log(`✅ Document created: ${document._id}`);
    
    // Check if immediate processing is requested
    const processImmediately = req.body.processImmediately === 'true';
    
    if (processImmediately) {
      console.log(`🚀 Starting immediate comprehensive processing...`);
      
      // Trigger comprehensive processing in background
      processDocumentComprehensively(document._id)
        .then(() => {
          console.log(`✅ Comprehensive processing completed for document: ${document._id}`);
        })
        .catch(error => {
          console.error(`❌ Comprehensive processing failed for document: ${document._id}`, error);
        });
    }
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        title: document.title,
        originalName: document.file.originalName,
        size: document.file.size,
        status: document.status,
        processing: processImmediately ? 'started' : 'pending'
      }
    });
    
  } catch (error) {
    console.error('❌ Document upload error:', error);
    next(error);
  }
};

// ==========================================
// COMPREHENSIVE DOCUMENT PROCESSING
// ==========================================

/**
 * 🔥 COMPREHENSIVE DOCUMENT PROCESSING
 * Process document with AI summarization + generate complete quiz collection
 * @param {string} documentId - Document ID to process
 * @returns {Promise<Object>} Processing result
 */
export const processDocumentComprehensively = async (documentId) => {
  let document;
  
  try {
    console.log(`🏭 Starting comprehensive processing for document: ${documentId}`);
    
    // Get document
    document = await Document.findById(documentId).select('+file.storagePath');
    if (!document) {
      throw HttpError.notFound('Document not found');
    }

    
    // Update status to processing
    document.status = 'processing';
    document.processing.stage = 'ai_analysis';
    document.processing.startedAt = new Date();
    await document.save();
    
    
    // STEP 1: Generate AI Summary
    const summaryResult = await processDocumentWithAI(document.file.storagePath);

    console.log(summaryResult);

    
    if (!summaryResult.success) {
      throw new Error(`AI summarization failed: ${summaryResult.error}`);
    }
    
    
    // Update document with summary
    document.content.extractedText = summaryResult.extractedText;
    document.content.summary = summaryResult.summary;
    document.content.keyPoints = summaryResult.keyPoints;
    document.content.topics = summaryResult.topics;

    // update file metadata
    document.file.metadata.pageCount = summaryResult.metadata.pageCount;
    document.file.metadata.wordCount = summaryResult.metadata.wordCount;
    // document.file.metadata.language = "";
    document.complexity = "";
    document.quality = "";



    // 🔥 DIRECT MONGODB TEST - BYPASS MONGOOSE
    try {
      console.log(`🧪 TESTING: Direct MongoDB update...`);
      
      const directResult = await Document.updateOne(
        { _id: document._id },
        { 
          $set: { 
            'content.extractedText': summaryResult.extractedText,
            'content.summary': summaryResult.summary 
          }
        }
      );
      
      console.log(`🧪 Direct update result:`, directResult);
      
      // Check if it worked
      const testDoc = await Document.findById(document._id);
      
    } catch (directError) {
      console.error(`❌ Direct update failed:`, directError);
    }
    
    document.processing.aiMetadata = summaryResult.metadata;
    document.processing.stage = 'processing';
    
    try {
      await document.save();
      console.log(`✅ Document saved successfully with extracted text`);
    } catch (saveError) {
      console.error(`❌ CRITICAL: Document save failed:`, saveError);
      console.error(`❌ Save error details:`, JSON.stringify(saveError, null, 2));
      throw saveError;
    }
    
    // STEP 2: Generate Comprehensive Quiz Collection
    const quizCollectionResult = await generateComprehensiveQuizCollection(document.file.storagePath);
    
    if (!quizCollectionResult.success) {
      throw new Error(`Quiz collection generation failed: ${quizCollectionResult.error}`);
    }
    
    
    // STEP 3: Store Individual Quizzes
    const storageResult = await storeQuizCollection(
      quizCollectionResult.quizCollection,
      document._id,
      document.userId
    );
    
    if (!storageResult.success) {
      throw new Error(`Quiz storage failed: ${storageResult.error}`);
    }
    
    
    // STEP 4: Mark document as completed
    document.status = 'completed';
    document.processing.stage = 'completed';
    document.processing.completedAt = new Date();
    
    // Add comprehensive processing metadata
    document.processing.comprehensiveMetadata = {
      summaryGenerated: true,
      quizCollectionGenerated: true,
      quizzesStored: storageResult.storedQuizzes.length,
      quizzesFailed: storageResult.failedQuizzes.length,
      totalQuestions: quizCollectionResult.quizCollection.metadata?.totalQuestions || 0,
      processingCompletedAt: new Date()
    };
    
    await document.save();
    
    console.log(`🎉 Comprehensive processing completed successfully for document: ${documentId}`);
    
    return {
      success: true,
      documentId: document._id,
      summary: {
        summaryGenerated: true,
        summaryLength: summaryResult.summary.length,
        keyPointsCount: summaryResult.keyPoints.length
      },
      quizCollection: {
        quizzesGenerated: quizCollectionResult.quizCollection.quizzes.length,
        quizzesStored: storageResult.storedQuizzes.length,
        quizzesFailed: storageResult.failedQuizzes.length,
        totalQuestions: quizCollectionResult.quizCollection.metadata?.totalQuestions || 0
      },
      processingTime: Date.now() - document.processing.startedAt.getTime()
    };
    
  } catch (error) {
    console.error(`❌ Comprehensive processing failed for document: ${documentId}`, error);
    
    // Mark document as failed
    if (document) {
      try {
        await document.markAsFailed('ai_processing_error', error.message, {
          stage: document.processing.stage,
          timestamp: new Date()
        });
      } catch (updateError) {
        console.error(`❌ Failed to update document status:`, updateError);
      }
    }
    
    throw error;
  }
};

// ==========================================
// MANUAL PROCESSING ENDPOINT
// ==========================================

/**
 * Manually trigger comprehensive processing for a pending document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const processPendingDocument  = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    
    console.log(`🔧 Processing triggered for document: ${documentId}`);
    
    // Verify document ownership
    const document = await Document.findOne({
      _id: documentId,
      userId,
      deletedAt: null
    });
    
    if (!document) {
      return next(HttpError.notFound('Document not found'));
    }
    
    if (document.status !== 'pending' && document.status !== 'failed') {
      return next(HttpError.badRequest('Document is not in a processable state', {
        code: 'INVALID_DOCUMENT_STATUS',
        context: { currentStatus: document.status }
      }));
    }
    
    // Start comprehensive processing in background
    processDocumentComprehensively(documentId)
      .then((result) => {
        console.log(`✅ Manual processing completed for document: ${documentId}`, result);
      })
      .catch((error) => {
        console.error(`❌ Manual processing failed for document: ${documentId}`, error);
      });
    
    res.status(200).json({
      success: true,
      message: 'Comprehensive processing started',
      documentId: documentId,
      status: 'processing'
    });
    
  } catch (error) {
    console.error('❌ Manual processing initiation error:', error);
    next(error);
  }
};

// ==========================================
// EXISTING ENDPOINTS (Enhanced)
// ==========================================

/**
 * Get all documents for user with enhanced data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getAllDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const options = {
      status: req.query.status,
      category: req.query.category,
      difficulty: req.query.difficulty,
      searchTerm: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };
    
    const documents = await getUserDocuments(userId, options);
    
    // Enhance with quiz collection info
    const enhancedDocuments = await Promise.all(
      documents.map(async (doc) => {
        let quizInfo = null;
        
        if (doc.status === 'completed') {
          try {
            // Get quiz count for this document
            const quizCount = await Quiz.countDocuments({
              documentId: doc._id,
              status: 'active',
              deletedAt: null
            });
            
            quizInfo = {
              quizzesGenerated: quizCount,
              hasQuizzes: quizCount > 0
            };
          } catch (error) {
            console.error(`Error getting quiz info for document ${doc._id}:`, error);
          }
        }
        
        return {
          ...doc.toJSON(),
          quizInfo
        };
      })
    );
    
    res.status(200).json({
      success: true,
      documents: enhancedDocuments,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: enhancedDocuments.length
      }
    });
    
  } catch (error) {
    console.error('❌ Get documents error:', error);
    next(error);
  }
};

/**
 * Get document by ID with enhanced quiz information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getDocumentById = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    
    const document = await getDocumentByIdService(documentId, userId);
    
    // Get associated quiz information
    let quizInfo = null;
    if (document.status === 'completed') {
      try {
        const quizStats = await getQuizCollectionStats(documentId, userId);
        quizInfo = quizStats;
      } catch (error) {
        console.error(`Error getting quiz stats for document ${documentId}:`, error);
      }
    }
    
    res.status(200).json({
      success: true,
      document: {
        ...document.toJSON(),
        quizInfo
      }
    });
    
  } catch (error) {
    console.error('❌ Get document by ID error:', error);
    next(error);
  }
};

/**
 * Update document metadata
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;
    
    const updatedDocument = await updateDocumentService(documentId, updateData, userId);
    
    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      document: updatedDocument
    });
    
  } catch (error) {
    console.error('❌ Update document error:', error);
    next(error);
  }
};

/**
 * Delete document (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    
    const result = await deleteDocumentService(documentId, userId);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    console.error('❌ Delete document error:', error);
    next(error);
  }
};

/**
 * Get document summary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getDocumentSummary = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    
    const document = await getDocumentByIdService(documentId, userId);
    
    if (!document.content.summary) {
      return next(HttpError.notFound('Document summary not available'));
    }
    
    res.status(200).json({
      success: true,
      summary: {
        text: document.content.summary,
        keyPoints: document.content.keyPoints,
        topics: document.content.topics,
        metadata: document.processing.aiMetadata
      }
    });
    
  } catch (error) {
    console.error('❌ Get document summary error:', error);
    next(error);
  }
};

/**
 * Generate custom analysis of document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const generateCustomAnalysis = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    const { prompt } = req.body;
    
    if (!prompt) {
      return next(HttpError.badRequest('Custom prompt is required'));
    }
    
    const document = await getDocumentByIdService(documentId, userId);
    
    const analysisResult = await generateCustomText(document.file.storagePath, prompt);
    
    if (!analysisResult.success) {
      return next(HttpError.internalServerError('Custom analysis generation failed'));
    }
    
    res.status(200).json({
      success: true,
      analysis: {
        prompt: prompt,
        generatedText: analysisResult.generatedText,
        metadata: analysisResult.metadata
      }
    });
    
  } catch (error) {
    console.error('❌ Generate custom analysis error:', error);
    next(error);
  }
};

/**
 * Get document analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getDocumentAnalytics = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    
    const document = await getDocumentByIdService(documentId, userId);
    
    res.status(200).json({
      success: true,
      analytics: {
        views: document.analytics.viewCount,
        downloads: document.analytics.downloadCount,
        quizzesGenerated: document.analytics.quizGeneratedCount,
        lastViewed: document.analytics.lastViewedAt,
        lastDownloaded: document.analytics.lastDownloadedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Get document analytics error:', error);
    next(error);
  }
};

/**
 * Check AI service status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getAIServiceStatus = async (req, res, next) => {
  try {
    const statusResult = await checkAIServiceStatus();
    
    res.status(200).json({
      success: true,
      aiService: {
        status: statusResult.success ? 'operational' : 'error',
        model: 'deepseek-chat',
        available: statusResult.success,
        lastChecked: new Date().toISOString(),
        details: statusResult
      }
    });
    
  } catch (error) {
    console.error('❌ AI service status check error:', error);
    res.status(200).json({
      success: true,
      aiService: {
        status: 'error',
        model: 'deepseek-chat',
        available: false,
        lastChecked: new Date().toISOString(),
        error: error.message
      }
    });
  }
};

export default {
  upload,
  uploadDocument,
  processDocumentComprehensively,
  processPendingDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentSummary,
  generateCustomAnalysis,
  getDocumentAnalytics,
  getAIServiceStatus
};