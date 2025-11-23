/**
 * Document Processing Service
 * @module services/documentProcessor
 * @description Document processing with text extraction capabilities and token management
 */

import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { HttpError } from '#exceptions/index.js';

/**
 * Document processing configuration - UPDATED for token management
 */
const PROCESSING_CONFIG = {
  // Maximum file size for processing (50MB)
  maxFileSize: 50 * 1024 * 1024,
  
  // 🔥 REDUCED Maximum text length to stay within AI API limits
  // Roughly 80,000 tokens worth of text (1 token ≈ 4 characters)
  // This leaves room for prompts and responses in AI calls
  maxTextLength: 320 * 1024, // 320KB instead of 1MB
  
  // Supported file types
  supportedTypes: ['.pdf', '.docx', '.txt'],
  
  // PDF processing options
  pdfOptions: {
    // Maximum pages to process (0 = all)
    max: 0,
    // Version compatibility
    version: 'default'
  }
};

/**
 * Document text extraction results interface
 */
class DocumentExtractionResult {
  constructor(data) {
    this.success = data.success || false;
    this.text = data.text || '';
    this.metadata = data.metadata || {};
    this.processingTime = data.processingTime || 0;
    this.error = data.error || null;
  }
}

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @param {Object} options - Processing options
 * @returns {Promise<DocumentExtractionResult>} Extraction result
 */
const extractTextFromPDF = async (filePath, options = {}) => {
  const startTime = Date.now();
  
  try {
    console.log(`📖 Extracting text from PDF: ${path.basename(filePath)}`);
    
    // Read PDF file
    const fileBuffer = fs.readFileSync(filePath);
    const fileStats = fs.statSync(filePath);
    
    console.log(`📊 PDF file size: ${fileStats.size} bytes (${(fileStats.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Check file size limit
    if (fileStats.size > PROCESSING_CONFIG.maxFileSize) {
      throw new Error(`File size exceeds limit of ${PROCESSING_CONFIG.maxFileSize / 1024 / 1024}MB`);
    }
    
    // Parse PDF with pdf-parse
    const pdfData = await pdfParse(fileBuffer, {
      ...PROCESSING_CONFIG.pdfOptions,
      ...options
    });
    
    const processingTime = Date.now() - startTime;
    
    // Validate extracted text
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }
    
    // 🔥 SMART TRUNCATION with better logging
    let extractedText = pdfData.text;
    let wasTruncated = false;
    
    if (extractedText.length > PROCESSING_CONFIG.maxTextLength) {
      console.log(`⚠️ Text length (${extractedText.length} chars) exceeds limit (${PROCESSING_CONFIG.maxTextLength} chars)`);
      console.log(`⚠️ Estimated tokens: ${Math.ceil(extractedText.length / 4)} (DeepSeek limit: ~131,000 tokens)`);
      
      // Try to find a good breaking point
      let breakPoint = PROCESSING_CONFIG.maxTextLength;
      
      // Look for paragraph break first (double newline)
      const paragraphBreak = extractedText.lastIndexOf('\n\n', PROCESSING_CONFIG.maxTextLength);
      if (paragraphBreak > PROCESSING_CONFIG.maxTextLength * 0.7) {
        breakPoint = paragraphBreak;
        console.log(`✂️ Using paragraph break at position ${breakPoint}`);
      } else {
        // Look for sentence break
        const sentenceBreak = extractedText.lastIndexOf('.', PROCESSING_CONFIG.maxTextLength);
        if (sentenceBreak > PROCESSING_CONFIG.maxTextLength * 0.8) {
          breakPoint = sentenceBreak + 1;
          console.log(`✂️ Using sentence break at position ${breakPoint}`);
        } else {
          console.log(`✂️ Using hard truncation at position ${breakPoint}`);
        }
      }
      
      extractedText = extractedText.substring(0, breakPoint).trim() + '\n\n[Content truncated for processing...]';
      wasTruncated = true;
      
      console.log(`✂️ Text truncated: ${pdfData.text.length} → ${extractedText.length} chars`);
      console.log(`✂️ Estimated tokens after truncation: ${Math.ceil(extractedText.length / 4)}`);
    }
    
    console.log(`✅ PDF text extracted successfully (${extractedText.length} characters, ${pdfData.numpages} pages)`);
    
    return new DocumentExtractionResult({
      success: true,
      text: extractedText,
      metadata: {
        pageCount: pdfData.numpages,
        wordCount: extractedText.split(/\s+/).length,
        characterCount: extractedText.length,
        originalSize: fileStats.size,
        originalTextLength: pdfData.text.length,
        wasTruncated: wasTruncated,
        truncationRatio: wasTruncated ? (extractedText.length / pdfData.text.length) : 1,
        estimatedTokens: Math.ceil(extractedText.length / 4),
        extractionMethod: 'pdf-parse',
        processingTime: processingTime
      },
      processingTime
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error(`❌ PDF text extraction failed: ${error.message}`);
    
    return new DocumentExtractionResult({
      success: false,
      text: '',
      metadata: {
        extractionMethod: 'pdf-parse',
        processingTime: processingTime
      },
      processingTime,
      error: error.message
    });
  }
};

/**
 * Extract text from DOCX file (placeholder for future implementation)
 * @param {string} filePath - Path to DOCX file
 * @param {Object} options - Processing options
 * @returns {Promise<DocumentExtractionResult>} Extraction result
 */
const extractTextFromDOCX = async (filePath, options = {}) => {
  const startTime = Date.now();
  
  try {
    console.log(`📖 Processing DOCX: ${path.basename(filePath)}`);
    
    // For MVP, we'll provide a placeholder
    // In production, you might want to use mammoth.js or similar
    const fileStats = fs.statSync(filePath);
    const processingTime = Date.now() - startTime;
    
    console.log(`⚠️ DOCX processing not yet implemented - using placeholder`);
    
    return new DocumentExtractionResult({
      success: true,
      text: `[DOCX Document - ${path.basename(filePath)}]\n\nThis DOCX document processing is not yet implemented. Please convert to PDF or TXT format for full text extraction.`,
      metadata: {
        pageCount: null,
        wordCount: null,
        characterCount: null,
        originalSize: fileStats.size,
        wasTruncated: false,
        estimatedTokens: 50, // Placeholder tokens
        extractionMethod: 'placeholder',
        processingTime: processingTime
      },
      processingTime
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error(`❌ DOCX processing failed: ${error.message}`);
    
    return new DocumentExtractionResult({
      success: false,
      text: '',
      metadata: {
        extractionMethod: 'placeholder',
        processingTime: processingTime
      },
      processingTime,
      error: error.message
    });
  }
};

/**
 * Extract text from TXT file
 * @param {string} filePath - Path to TXT file
 * @param {Object} options - Processing options
 * @returns {Promise<DocumentExtractionResult>} Extraction result
 */
const extractTextFromTXT = async (filePath, options = {}) => {
  const startTime = Date.now();
  
  try {
    console.log(`📖 Reading TXT file: ${path.basename(filePath)}`);
    
    const fileStats = fs.statSync(filePath);
    
    // Check file size limit
    if (fileStats.size > PROCESSING_CONFIG.maxFileSize) {
      throw new Error(`File size exceeds limit of ${PROCESSING_CONFIG.maxFileSize / 1024 / 1024}MB`);
    }
    
    // Read text file with UTF-8 encoding
    let text = fs.readFileSync(filePath, 'utf-8');
    const originalLength = text.length;
    let wasTruncated = false;
    
    // 🔥 SMART TRUNCATION for TXT files too
    if (text.length > PROCESSING_CONFIG.maxTextLength) {
      console.log(`⚠️ TXT text length (${text.length} chars) exceeds limit (${PROCESSING_CONFIG.maxTextLength} chars)`);
      
      // Try to find a good breaking point
      let breakPoint = PROCESSING_CONFIG.maxTextLength;
      
      // Look for paragraph break first (double newline)
      const paragraphBreak = text.lastIndexOf('\n\n', PROCESSING_CONFIG.maxTextLength);
      if (paragraphBreak > PROCESSING_CONFIG.maxTextLength * 0.7) {
        breakPoint = paragraphBreak;
      } else {
        // Look for sentence break
        const sentenceBreak = text.lastIndexOf('.', PROCESSING_CONFIG.maxTextLength);
        if (sentenceBreak > PROCESSING_CONFIG.maxTextLength * 0.8) {
          breakPoint = sentenceBreak + 1;
        }
      }
      
      text = text.substring(0, breakPoint).trim() + '\n\n[Content truncated for processing...]';
      wasTruncated = true;
      
      console.log(`✂️ TXT text truncated: ${originalLength} → ${text.length} chars`);
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ TXT file read successfully (${text.length} characters)`);
    
    return new DocumentExtractionResult({
      success: true,
      text: text,
      metadata: {
        pageCount: null, // TXT files don't have pages
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        originalSize: fileStats.size,
        originalTextLength: originalLength,
        wasTruncated: wasTruncated,
        truncationRatio: wasTruncated ? (text.length / originalLength) : 1,
        estimatedTokens: Math.ceil(text.length / 4),
        extractionMethod: 'utf8-read',
        processingTime: processingTime
      },
      processingTime
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error(`❌ TXT file reading failed: ${error.message}`);
    
    return new DocumentExtractionResult({
      success: false,
      text: '',
      metadata: {
        extractionMethod: 'utf8-read',
        processingTime: processingTime
      },
      processingTime,
      error: error.message
    });
  }
};

/**
 * Main document processing function - extracts text from various document types
 * @param {string} filePath - Path to document file
 * @param {Object} options - Processing options
 * @returns {Promise<DocumentExtractionResult>} Extraction result
 */
export const extractDocumentText = async (filePath, options = {}) => {
  try {
    // Validate file path
    if (!filePath || !fs.existsSync(filePath)) {
      throw HttpError.notFound(`Document file not found: ${filePath}`, {
        code: 'FILE_NOT_FOUND'
      });
    }
    
    // Get file extension
    const fileExtension = path.extname(filePath).toLowerCase();
    
    // Validate file type
    if (!PROCESSING_CONFIG.supportedTypes.includes(fileExtension)) {
      throw HttpError.badRequest(`Unsupported file type: ${fileExtension}`, {
        code: 'UNSUPPORTED_FILE_TYPE',
        context: { 
          fileExtension, 
          supportedTypes: PROCESSING_CONFIG.supportedTypes 
        }
      });
    }
    
    console.log(`🔍 Processing document: ${path.basename(filePath)} (${fileExtension})`);
    
    // Route to appropriate extraction method
    let result;
    switch (fileExtension) {
      case '.pdf':
        result = await extractTextFromPDF(filePath, options);
        break;
      case '.docx':
        result = await extractTextFromDOCX(filePath, options);
        break;
      case '.txt':
        result = await extractTextFromTXT(filePath, options);
        break;
      default:
        throw HttpError.badRequest(`Unsupported file type: ${fileExtension}`, {
          code: 'UNSUPPORTED_FILE_TYPE'
        });
    }
    
    // If extraction failed, throw error
    if (!result.success) {
      throw HttpError.internalServerError(`Document processing failed: ${result.error}`, {
        code: 'DOCUMENT_PROCESSING_ERROR',
        context: { 
          fileExtension,
          error: result.error,
          processingTime: result.processingTime
        }
      });
    }
    
    // 🔥 LOG TOKEN ESTIMATION
    const estimatedTokens = result.metadata.estimatedTokens || Math.ceil(result.text.length / 4);
    console.log(`🧮 Token estimation: ~${estimatedTokens} tokens (DeepSeek limit: 131,072 tokens)`);
    
    if (estimatedTokens > 100000) {
      console.log(`⚠️ High token count detected - may need chunking for AI processing`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Document processing error:`, error);
    
    // If it's already an HttpError, re-throw it
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Document processing failed: ${error.message}`, {
      code: 'DOCUMENT_PROCESSING_ERROR',
      context: { originalError: error.message }
    });
  }
};

/**
 * Get document processing statistics
 * @param {string} filePath - Path to document file
 * @returns {Promise<Object>} Document statistics
 */
export const getDocumentStats = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw HttpError.notFound(`Document file not found: ${filePath}`);
    }
    
    const fileStats = fs.statSync(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();
    
    return {
      fileName: path.basename(filePath),
      fileExtension: fileExtension,
      fileSize: fileStats.size,
      fileSizeFormatted: formatFileSize(fileStats.size),
      isSupported: PROCESSING_CONFIG.supportedTypes.includes(fileExtension),
      createdAt: fileStats.birthtime,
      modifiedAt: fileStats.mtime,
      // 🔥 ADD TOKEN ESTIMATION
      estimatedMaxTokens: Math.ceil((PROCESSING_CONFIG.maxTextLength / 4)), // Rough estimation
      tokenLimit: 131072 // DeepSeek limit
    };
    
  } catch (error) {
    console.error(`❌ Error getting document stats:`, error);
    throw error;
  }
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate document for processing
 * @param {string} filePath - Path to document file
 * @returns {Promise<boolean>} Whether document can be processed
 */
export const validateDocument = async (filePath) => {
  try {
    const stats = await getDocumentStats(filePath);
    
    // Check if file type is supported
    if (!stats.isSupported) {
      return false;
    }
    
    // Check file size
    if (stats.fileSize > PROCESSING_CONFIG.maxFileSize) {
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Document validation error:`, error);
    return false;
  }
};

export default {
  extractDocumentText,
  getDocumentStats,
  validateDocument,
  PROCESSING_CONFIG
};