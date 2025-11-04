/**
 * Document Model Enums
 * @module constants/models/document/enums
 * @description Enumerated values for document model fields
 * 
 */

// ==========================================
// DOCUMENT STATUS ENUMS
// ==========================================

/**
 * Document processing status values
 */
export const DOCUMENT_STATUSES = Object.freeze([
  'pending',      // Just uploaded, waiting for processing
  'processing',   // Currently being processed by AI
  'completed',    // Successfully processed
  'failed',       // Processing failed
  'corrupted',    // File is corrupted/unreadable
  'archived'      // User archived the document
]);

// ==========================================
// STATUS GROUPS (DERIVED CONSTANTS)
// ==========================================

/**
 * Statuses that indicate completed processing
 */
export const COMPLETED_STATUSES = Object.freeze(['completed', 'archived']);

/**
 * Statuses that indicate active processing
 */
export const PROCESSING_STATUSES = Object.freeze(['pending', 'processing']);

/**
 * Statuses that indicate processing errors
 */
export const ERROR_STATUSES = Object.freeze(['failed', 'corrupted']);

/**
 * Statuses that allow user interaction
 */
export const INTERACTIVE_STATUSES = Object.freeze(['completed', 'archived']);

/**
 * Document processing stages
 */
export const PROCESSING_STAGES = Object.freeze([
  'upload',           // File upload stage
  'ai_analysis',
  'processing',
  'quiz_generation',
  'validation',       // File validation stage
  'text_extraction',  // PDF text extraction stage
  'summarization',    // AI summarization stage
  'metadata_analysis', // Document analysis stage
  'finalization',      // Final processing stage
  'completed',
]);

// ==========================================
// DOCUMENT TYPES & CATEGORIES
// ==========================================

/**
 * Document type classifications
 */
export const DOCUMENT_TYPES = Object.freeze([
  'academic',         // Academic papers, research
  'textbook',         // Educational textbooks
  'article',          // Articles, blog posts
  'manual',           // User manuals, guides
  'report',           // Business reports
  'presentation',     // Presentation slides converted to PDF
  'other'             // Other document types
]);

/**
 * Subject/category classifications
 */
export const DOCUMENT_CATEGORIES = Object.freeze([
  'mathematics',
  'science',
  'technology',
  'engineering',
  'medicine',
  'business',
  'law',
  'history',
  'literature',
  'psychology',
  'sociology',
  'education',
  'art',
  'music',
  'philosophy',
  'economics',
  'political_science',
  'other'
]);

/**
 * Academic difficulty levels
 */
export const DIFFICULTY_LEVELS = Object.freeze([
  'beginner',         // High school level
  'intermediate',     // Undergraduate level
  'advanced',         // Graduate level
  'expert'            // PhD/Research level
]);

// ==========================================
// LANGUAGE & LOCALIZATION
// ==========================================

/**
 * Supported document languages for processing
 */
export const SUPPORTED_DOCUMENT_LANGUAGES = Object.freeze([
  'en',    // English
  'es',    // Spanish
  'fr',    // French
  'de',    // German
  'it',    // Italian
  'pt',    // Portuguese
  'ru',    // Russian
  'zh',    // Chinese
  'ja',    // Japanese
  'ko',    // Korean
  'ar',    // Arabic
  'hi',    // Hindi
  'other'  // Other languages
]);

// ==========================================
// AI PROCESSING OPTIONS
// ==========================================

/**
 * AI processing quality levels
 */
export const AI_PROCESSING_QUALITY = Object.freeze([
  'fast',        // Quick processing, basic summary
  'balanced',    // Standard processing, good summary
  'detailed',    // Thorough processing, detailed summary
  'premium'      // Advanced processing, comprehensive analysis
]);

/**
 * Summary generation styles
 */
export const SUMMARY_STYLES = Object.freeze([
  'bullet_points',   // Bullet point format
  'paragraph',       // Paragraph format
  'outline',         // Structured outline
  'key_concepts',    // Focus on key concepts
  'qa_format'        // Question and answer format
]);

// ==========================================
// CONTENT ANALYSIS
// ==========================================

/**
 * Content complexity indicators
 */
export const CONTENT_COMPLEXITY = Object.freeze([
  'very_simple',     // Elementary level
  'simple',          // Middle school level
  'moderate',        // High school level
  'complex',         // College level
  'very_complex'     // Graduate/Professional level
]);

/**
 * Document quality indicators
 */
export const QUALITY_INDICATORS = Object.freeze([
  'poor',           // Low quality scan/text
  'fair',           // Acceptable quality
  'good',           // Good quality
  'excellent'       // High quality document
]);

// ==========================================
// ERROR TYPES
// ==========================================

/**
 * Processing error types
 */
export const PROCESSING_ERROR_TYPES = Object.freeze([
  'ai_processing_error',
  'file_corrupted',         // File is corrupted
  'unsupported_format',     // File format not supported
  'extraction_failed',      // Text extraction failed
  'ai_service_error',       // AI service unavailable/error
  'timeout',                // Processing timeout
  'insufficient_content',   // Not enough content to process
  'language_unsupported',   // Document language not supported
  'quota_exceeded',         // User quota exceeded
  'network_error',          // Network connectivity issues
  'unknown_error'           // Unexpected error
]);

// ==========================================
// DOCUMENT DEFAULTS
// ==========================================

/**
 * Default values for document fields
 */
export const DOCUMENT_DEFAULTS = Object.freeze({
  LANGUAGE: 'en',
  TYPE: 'other',
  CATEGORY: 'other',
  DIFFICULTY: 'intermediate',
  STATUS: 'pending',
  PROCESSING_QUALITY: 'balanced',
  SUMMARY_STYLE: 'paragraph'
});


// ==========================================
// ENUM VALIDATION HELPERS
// ==========================================

/**
 * Check if value is valid document status
 * @param {string} status - Status to validate
 * @returns {boolean} Whether status is valid
 */
export const isValidDocumentStatus = (status) => {
  return DOCUMENT_STATUSES.includes(status);
};

/**
 * Check if value is valid document type
 * @param {string} type - Type to validate
 * @returns {boolean} Whether type is valid
 */
export const isValidDocumentType = (type) => {
  return DOCUMENT_TYPES.includes(type);
};

/**
 * Check if value is valid document category
 * @param {string} category - Category to validate
 * @returns {boolean} Whether category is valid
 */
export const isValidDocumentCategory = (category) => {
  return DOCUMENT_CATEGORIES.includes(category);
};

/**
 * Check if value is valid difficulty level
 * @param {string} level - Difficulty level to validate
 * @returns {boolean} Whether level is valid
 */
export const isValidDifficultyLevel = (level) => {
  return DIFFICULTY_LEVELS.includes(level);
};

/**
 * Check if value is valid AI processing quality
 * @param {string} quality - Quality level to validate
 * @returns {boolean} Whether quality is valid
 */
export const isValidProcessingQuality = (quality) => {
  return AI_PROCESSING_QUALITY.includes(quality);
};
