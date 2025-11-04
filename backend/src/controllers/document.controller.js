/**
 * Document Controller
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
  generateQuizFromDocument,
  generateCustomText,
  checkAIServiceStatus
} from '#services/ai.service.js';
import { FILE_VALIDATION } from '#constants/models/document/index.js';
import Document from '#models/document/Document.js';

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
    console.log(`🔄 Starting AI processing for document ${documentId}`);
    
    // Import Document model
    const { default: Document } = await import('#models/document/Document.js');
    
    // Update status to processing
    await Document.findByIdAndUpdate(documentId, {
      status: 'processing',
      'processing.stage': 'ai_analysis',
      'processing.startedAt': new Date()
    });

    console.log(`📁 Resolving file path: ${filePath}`);
    
    // Resolve file path
    const resolvedPath = resolveFilePath(filePath);
    console.log(`✅ File path resolved: ${resolvedPath}`);

    // ✅ STEP 1: EXTRACT TEXT AND GET BASIC METADATA (Non-AI)
    const { extractDocumentText } = await import('#services/documentProcessor.service.js');
    const extractionResult = await extractDocumentText(resolvedPath);
    
    if (!extractionResult.success) {
      throw new Error(`Text extraction failed: ${extractionResult.error}`);
    }

    console.log(`📖 Text extracted: ${extractionResult.text.length} chars, ${extractionResult.metadata.wordCount} words, ${extractionResult.metadata.pageCount} pages`);

    // ✅ STEP 2: AI PROCESSING WITH ENHANCED PROMPT
    const { processDocumentWithAI } = await import('#services/ai.service.js');
    console.log(`🤖 Calling AI service with enhanced prompts...`);
    
    // Call AI with enhanced processing
    const aiResults = await processDocumentWithAIEnhanced(resolvedPath, extractionResult.text);
    
    if (!aiResults.success) {
      throw new Error('AI processing failed');
    }

    console.log(`✅ AI processing successful`);
    console.log(`📊 Summary length: ${aiResults.summary?.length || 0} characters`);
    console.log(`📊 Complexity: ${aiResults.complexity}`);
    console.log(`📊 Quality: ${aiResults.quality}`);
    console.log(`📊 Tokens used: ${aiResults.metadata?.tokensUsed || 0}`);

    // ✅ STEP 3: DETECT LANGUAGE (Simple function)
    const detectedLanguage = detectLanguageSimple(extractionResult.text);

    // ✅ STEP 4: UPDATE DOCUMENT WITH ALL DATA
    const updateData = {
      status: 'completed',
      'processing.stage': 'completed',
      'processing.completedAt': new Date(),
      
      // ✅ CONTENT FIELDS
      'content.extractedText': extractionResult.text,
      'content.summary': aiResults.summary,
      'content.keyPoints': aiResults.keyPoints,
      'content.topics': aiResults.topics,
      
      // ✅ FILE METADATA (Non-AI, from extraction)
      'file.metadata.pageCount': extractionResult.metadata.pageCount,
      'file.metadata.wordCount': extractionResult.metadata.wordCount,
      'file.metadata.language': detectedLanguage,
      'file.metadata.complexity': aiResults.complexity,  // From AI
      'file.metadata.quality': aiResults.quality,        // From AI
      
      // ✅ AI METADATA
      'processing.aiMetadata.model': aiResults.metadata?.model,
      'processing.aiMetadata.tokensUsed': aiResults.metadata?.tokensUsed || 0,
      'processing.aiMetadata.processingTime': aiResults.metadata?.processingTime
    };

    await Document.findByIdAndUpdate(documentId, updateData);
    
    console.log(`✅ Document ${documentId} processing completed successfully`);
    console.log(`📊 Final stats: ${extractionResult.metadata.wordCount} words, ${extractionResult.metadata.pageCount} pages, ${detectedLanguage} language, ${aiResults.complexity} complexity`);
    
  } catch (error) {
    console.error(`❌ AI processing failed for document ${documentId}:`);
    console.error(`❌ Error message: ${error.message}`);
    
    try {
      const { default: Document } = await import('#models/document/Document.js');
      
      await Document.findByIdAndUpdate(documentId, {
        status: 'failed',
        'processing.stage': 'finalization',
        'processing.completedAt': new Date(),
        'processing.error': {
          type: 'ai_processing_error',
          message: error.message,
          occurredAt: new Date()
        }
      });
    } catch (updateError) {
      console.error(`❌ Failed to update document with error status:`, updateError);
    }
  }
};

/**
 * Enhanced AI processing with direct prompts for complexity and quality
 * @param {string} filePath - File path
 * @param {string} extractedText - Already extracted text
 * @returns {Promise<Object>} AI results with complexity and quality
 */
const processDocumentWithAIEnhanced = async (filePath, extractedText) => {
  try {
    const { callDeepSeekAPI } = await import('#services/ai.service.js');
    
    // ✅ DIRECT PROMPT - NO INTRODUCTIONS, JUST RESULTS
    const messages = [
      {
        role: 'user',
        content: `Analyze this document and provide exactly what is requested. Use the document's original language. NO introductions or explanations.

PROVIDE EXACTLY THIS FORMAT:
SUMMARY: [5-7 bullet points starting with •]
COMPLEXITY: [ONE WORD ONLY: very_simple, simple, moderate, complex, very_complex]
QUALITY: [ONE WORD ONLY: poor, fair, good, excellent]

Document:
${extractedText}`
      }
    ];

    const startTime = Date.now();
    
    // Call DeepSeek API directly
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 2048,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    
    const aiText = data.choices[0]?.message?.content || '';
    
    if (!aiText || aiText.length === 0) {
      throw new Error('DeepSeek returned empty response');
    }

    // ✅ PARSE THE STRUCTURED RESPONSE
    const parsed = parseStructuredAIResponse(aiText);
    
    return {
      success: true,
      summary: parsed.summary,
      keyPoints: parsed.keyPoints,
      topics: parsed.topics,
      complexity: parsed.complexity,  // NEW!
      quality: parsed.quality,        // NEW!
      metadata: {
        model: 'deepseek-chat',
        tokensUsed: data.usage?.total_tokens || 0,
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        processingTime: endTime - startTime
      }
    };

  } catch (error) {
    console.error('❌ Enhanced AI processing error:', error);
    throw error;
  }
};

/**
 * Simple language detection
 * @param {string} text - Document text
 * @returns {string} Language code
 */
const detectLanguageSimple = (text) => {
  if (!text || text.length < 50) {
    return 'en';
  }
  
  const textLower = text.toLowerCase();
  
  // French words
  const frenchWords = ['le', 'la', 'les', 'de', 'des', 'et', 'est', 'dans', 'pour', 'avec', 'que', 'qui', 'une', 'ce', 'cette'];
  const frenchCount = frenchWords.filter(word => textLower.includes(` ${word} `)).length;
  
  // Arabic detection
  const arabicPattern = /[\u0600-\u06FF]/g;
  const arabicMatches = text.match(arabicPattern);
  
  // Spanish words
  const spanishWords = ['el', 'la', 'los', 'las', 'de', 'del', 'y', 'es', 'en', 'para', 'con', 'por', 'que', 'su'];
  const spanishCount = spanishWords.filter(word => textLower.includes(` ${word} `)).length;
  
  if (arabicMatches && arabicMatches.length > 10) return 'ar';
  if (frenchCount >= 3) return 'fr';
  if (spanishCount >= 3) return 'es';
  return 'en';
};

/**
 * Parse structured AI response
 * @param {string} aiText - AI response text
 * @returns {Object} Parsed components
 */
const parseStructuredAIResponse = (aiText) => {
  const lines = aiText.split('\n').map(line => line.trim()).filter(line => line);
  
  let summary = '';
  let complexity = 'moderate';  // Default fallback
  let quality = 'good';         // Default fallback
  
  // Extract summary (everything between SUMMARY: and COMPLEXITY:)
  const summaryStartIndex = lines.findIndex(line => line.startsWith('SUMMARY:'));
  const complexityStartIndex = lines.findIndex(line => line.startsWith('COMPLEXITY:'));
  
  if (summaryStartIndex >= 0) {
    const summaryEndIndex = complexityStartIndex >= 0 ? complexityStartIndex : lines.length;
    const summaryLines = lines.slice(summaryStartIndex, summaryEndIndex);
    
    // Remove "SUMMARY:" from first line and join
    summaryLines[0] = summaryLines[0].replace('SUMMARY:', '').trim();
    summary = summaryLines.filter(line => line).join('\n');
  }
  
  // Extract complexity (single word after COMPLEXITY:)
  const complexityLine = lines.find(line => line.startsWith('COMPLEXITY:'));
  if (complexityLine) {
    const complexityMatch = complexityLine.match(/COMPLEXITY:\s*(\w+)/);
    if (complexityMatch) {
      const extracted = complexityMatch[1].toLowerCase();
      // Validate against enum values
      const validComplexity = ['very_simple', 'simple', 'moderate', 'complex', 'very_complex'];
      if (validComplexity.includes(extracted)) {
        complexity = extracted;
      }
    }
  }
  
  // Extract quality (single word after QUALITY:)
  const qualityLine = lines.find(line => line.startsWith('QUALITY:'));
  if (qualityLine) {
    const qualityMatch = qualityLine.match(/QUALITY:\s*(\w+)/);
    if (qualityMatch) {
      const extracted = qualityMatch[1].toLowerCase();
      // Validate against enum values
      const validQuality = ['poor', 'fair', 'good', 'excellent'];
      if (validQuality.includes(extracted)) {
        quality = extracted;
      }
    }
  }
  
  // Extract bullet points for keyPoints
  const bulletPoints = summary.split('\n').filter(line => 
    line.trim().startsWith('•') || 
    line.trim().startsWith('-') || 
    line.trim().startsWith('*')
  ).map(line => line.replace(/^[•\-*]\s*/, '').trim());
  
  // Extract topics (simple keyword extraction)
  const topics = extractTopicsSimple(summary);
  
  return {
    summary: summary,
    keyPoints: bulletPoints.length > 0 ? bulletPoints : [summary],
    topics: topics,
    complexity: complexity,
    quality: quality
  };
};

/**
 * Simple topic extraction
 * @param {string} text - Text to analyze
 * @returns {Array} Topics array
 */
const extractTopicsSimple = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  
  const topicWords = words
    .filter(word => word.length > 4 && !stopWords.has(word))
    .filter(word => /^[a-zA-Z]+$/.test(word));
  
  const frequency = {};
  topicWords.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
};

/**
 * Detect document language from text content
 * @param {string} text - Extracted text
 * @returns {string} Language code
 */
const detectLanguage = (text) => {
  if (!text || text.length < 50) {
    return 'other';
  }
  
  // Simple language detection based on common words/patterns
  const textLower = text.toLowerCase();
  
  // French detection
  const frenchWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'est', 'dans', 'pour', 'avec', 'sur', 'par', 'que', 'qui', 'une', 'des', 'ce', 'cette'];
  const frenchCount = frenchWords.filter(word => textLower.includes(` ${word} `)).length;
  
  // Arabic detection (basic)
  const arabicPattern = /[\u0600-\u06FF]/g;
  const arabicMatches = text.match(arabicPattern);
  
  // Spanish detection
  const spanishWords = ['el', 'la', 'los', 'las', 'de', 'del', 'y', 'es', 'en', 'para', 'con', 'por', 'que', 'su', 'una', 'esta', 'este'];
  const spanishCount = spanishWords.filter(word => textLower.includes(` ${word} `)).length;
  
  // German detection
  const germanWords = ['der', 'die', 'das', 'und', 'ist', 'in', 'mit', 'auf', 'für', 'von', 'zu', 'bei', 'aus', 'nach', 'über'];
  const germanCount = germanWords.filter(word => textLower.includes(` ${word} `)).length;
  
  // Determine language
  if (arabicMatches && arabicMatches.length > 10) {
    return 'ar';
  } else if (frenchCount >= 5) {
    return 'fr';
  } else if (spanishCount >= 5) {
    return 'es';
  } else if (germanCount >= 5) {
    return 'de';
  } else {
    return 'en'; // Default to English
  }
};

/**
 * Analyze content complexity based on text characteristics
 * @param {string} text - Extracted text
 * @returns {string} Complexity level
 */
const analyzeComplexity = (text) => {
  if (!text || text.length < 100) {
    return 'very_simple';
  }
  
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate metrics
  const avgWordsPerSentence = words.length / sentences.length;
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Count complex indicators
  const technicalTerms = (text.match(/\b[A-Z]{2,}\b/g) || []).length; // Acronyms
  const longWords = words.filter(word => word.length > 8).length;
  const complexPunctuation = (text.match(/[;:()[\]{}]/g) || []).length;
  
  // Calculate complexity score
  let score = 0;
  
  if (avgWordsPerSentence > 20) score += 2;
  else if (avgWordsPerSentence > 15) score += 1;
  
  if (avgWordLength > 6) score += 2;
  else if (avgWordLength > 5) score += 1;
  
  if (technicalTerms > words.length * 0.02) score += 2; // More than 2% technical terms
  if (longWords > words.length * 0.1) score += 1; // More than 10% long words
  if (complexPunctuation > sentences.length * 0.5) score += 1;
  
  // Return complexity level
  if (score >= 6) return 'very_complex';
  if (score >= 4) return 'complex';
  if (score >= 2) return 'moderate';
  if (score >= 1) return 'simple';
  return 'very_simple';
};

/**
 * Assess document quality based on extraction results
 * @param {Object} extractionResult - Text extraction result
 * @returns {string} Quality indicator
 */
const assessDocumentQuality = (extractionResult) => {
  if (!extractionResult || !extractionResult.text) {
    return 'poor';
  }
  
  const text = extractionResult.text;
  const wordCount = extractionResult.metadata.wordCount || 0;
  
  // Quality indicators
  let qualityScore = 0;
  
  // Text length check
  if (wordCount > 1000) qualityScore += 2;
  else if (wordCount > 500) qualityScore += 1;
  
  // Character quality check
  const totalChars = text.length;
  const validChars = (text.match(/[a-zA-Z0-9\u0080-\uFFFF\s]/g) || []).length;
  const validRatio = validChars / totalChars;
  
  if (validRatio > 0.95) qualityScore += 2;
  else if (validRatio > 0.9) qualityScore += 1;
  
  // Sentence structure check
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const properSentences = sentences.filter(s => /^[A-Z\u00C0-\u017F]/.test(s.trim())).length;
  const sentenceQuality = properSentences / sentences.length;
  
  if (sentenceQuality > 0.8) qualityScore += 1;
  
  // OCR error indicators (repeated characters, weird spacing)
  const ocrErrors = (text.match(/(.)\1{3,}/g) || []).length; // Repeated chars
  const weirdSpacing = (text.match(/\s{3,}/g) || []).length; // Multiple spaces
  
  if (ocrErrors > 5 || weirdSpacing > 10) qualityScore -= 1;
  
  // Return quality level
  if (qualityScore >= 4) return 'excellent';
  if (qualityScore >= 2) return 'good';
  if (qualityScore >= 1) return 'fair';
  return 'poor';
};

/**
 * File path resolution helper (same as in AI service)
 */
const resolveFilePath = (filePath) => {
  if (path.isAbsolute(filePath) && fs.existsSync(filePath)) {
    return filePath;
  }
  
  const backendDir = process.cwd();
  const filename = path.basename(filePath);
  const correctPath = path.join(backendDir, 'uploads', 'documents', filename);
  
  if (fs.existsSync(correctPath)) {
    return correctPath;
  }
  
  throw new Error(`File not found: ${filename}`);
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
    
    // 🔥 EXTRACT ALL PARAMETERS INCLUDING QUESTION TYPES
    const { 
      questionCount = 5, 
      difficulty = 'medium',
      questionTypes = ['multiple_choice'] // 🔥 NOW FROM REQUEST BODY
    } = req.body;

    console.log(`🎯 Quiz request: ${questionCount} questions, ${difficulty} difficulty, types: ${questionTypes.join(', ')}`);
    
    // ✅ Explicitly select the storagePath field
    const document = await Document.findOne({
      _id: documentId,
      userId,
      deletedAt: null
    }).select('+file.storagePath');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check if document is processed
    if (document.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Document must be processed before generating quiz'
      });
    }

    // Get file path
    const filePath = document.file.storagePath;
    
    console.log(`🔍 Using file path for quiz: ${filePath}`);
    
    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'Document file path not found'
      });
    }

    // 🔥 CALL THE ENHANCED AI FUNCTION WITH ALL PARAMETERS
    const quizResults = await generateQuizFromDocument(filePath, {
      questionCount: parseInt(questionCount),
      difficulty,
      questionTypes // 🔥 PASS THE ACTUAL QUESTION TYPES
    });

    // Update document analytics
    await document.recordQuizGeneration();

    // 🔥 RETURN COMPLETE QUIZ DATA
    res.status(200).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz: {
        questions: quizResults.questions,
        metadata: quizResults.metadata,
        documentId: documentId,
        generatedAt: new Date()
      },
      rawResponse: quizResults.rawResponse // 🔥 INCLUDE RAW RESPONSE FOR DEBUGGING
    });
  } catch (error) {
    console.error('❌ Quiz generation controller error:', error);
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
      return res.status(400).json({
        success: false,
        message: 'Custom prompt is required'
      });
    }

    // ✅ FIX: Explicitly select the storagePath field
    const document = await Document.findOne({
      _id: documentId,
      userId,
      deletedAt: null
    }).select('+file.storagePath'); // ✅ ADD THIS LINE
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Get file path - NOW IT WILL EXIST
    const filePath = document.file.storagePath;
    
    console.log(`🔍 Using file path for analysis: ${filePath}`); // Debug log
    
    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'Document file path not found'
      });
    }

    // Generate custom analysis using AI
    const analysisResults = await generateCustomText(filePath, prompt);

    res.status(200).json({
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

export {
  processDocumentAsync,
  processDocumentWithAIEnhanced,
  parseStructuredAIResponse,
  detectLanguageSimple,
  extractTopicsSimple
};