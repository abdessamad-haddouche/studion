/**
 * Document Model Constants Public API
 * @module constants/models/document
 * @description Central export point for all document-related constants
 */

// ==========================================
// VALIDATION CONSTANTS
// ==========================================
export {
  DOCUMENT_VALIDATION_RULES,
  FILE_VALIDATION,
  PROCESSING_VALIDATION,
  METADATA_VALIDATION,
  validateFileExtension,
  validateMimeType,
  validateFileSize,
  validateLanguageCode,
  validateTags
} from './validation.js';

// ==========================================
// ENUM CONSTANTS
// ==========================================
export {
  // Status & Processing
  DOCUMENT_STATUSES,
  COMPLETED_STATUSES,
  PROCESSING_STATUSES, 
  ERROR_STATUSES,
  INTERACTIVE_STATUSES,
  PROCESSING_STAGES,
  PROCESSING_ERROR_TYPES,
  
  // Classification
  DOCUMENT_TYPES,
  DOCUMENT_CATEGORIES,
  DIFFICULTY_LEVELS,
  
  // Language & Content
  SUPPORTED_DOCUMENT_LANGUAGES,
  CONTENT_COMPLEXITY,
  QUALITY_INDICATORS,
  
  // AI Processing
  AI_PROCESSING_QUALITY,
  SUMMARY_STYLES,

  // Defaults
  DOCUMENT_DEFAULTS,
  
  // Validation Helpers
  isValidDocumentStatus,
  isValidDocumentType,
  isValidDocumentCategory,
  isValidDifficultyLevel,
  isValidProcessingQuality
} from './enums.js';