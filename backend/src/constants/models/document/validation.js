/**
 * Document Model Validation Constants - FIXED VERSION
 * @module constants/models/document/validation
 */

// ==========================================
// VALIDATION RULES - FIXED
// ==========================================

/**
 * Document validation rules
 */
export const DOCUMENT_VALIDATION_RULES = Object.freeze({
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
    PATTERN: /^[a-zA-Z0-9\s\-_.,()[\]]+$/,
    ERROR_MESSAGE: 'Title can only contain letters, numbers, spaces, and common punctuation'
  },

  ORIGINAL_FILE_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255,
    PATTERN: /^[^<>:"/\\|?*\x00-\x1f]+$/,
    ERROR_MESSAGE: 'Invalid file name format'
  },

  FILE_SIZE: {
    MIN_SIZE: 1024, // 1KB minimum
    MAX_SIZE: 50 * 1024 * 1024, // 50MB maximum
    ERROR_MESSAGE: 'File size must be between 1KB and 50MB'
  },

  EXTRACTED_TEXT: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 2000000,  // 2MB text limit
    ERROR_MESSAGE: 'Extracted text cannot exceed 2MB'
  },

  SUMMARY: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 10000,
    ERROR_MESSAGE: 'Summary cannot exceed 10,000 characters'
  },

  DESCRIPTION: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 1000,
    ERROR_MESSAGE: 'Description cannot exceed 1,000 characters'
  },

  TAGS: {
    MAX_COUNT: 20,
    MAX_TAG_LENGTH: 50,
    MIN_TAG_LENGTH: 2,
    PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
    ERROR_MESSAGE: 'Tags can only contain letters, numbers, spaces, hyphens, and underscores'
  }
});

// ==========================================
// FILE VALIDATION - FIXED TO SUPPORT MULTIPLE FORMATS
// ==========================================

/**
 * Supported file types and validation - FIXED
 */
export const FILE_VALIDATION = Object.freeze({
  ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.txt'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  
  // File validation patterns - UPDATED
  EXTENSION_PATTERN: /\.(pdf|docx|txt)$/i,
  
  // Error messages - UPDATED
  INVALID_EXTENSION_ERROR: 'Only PDF, DOCX, and TXT files are supported',
  INVALID_MIME_TYPE_ERROR: 'Invalid file type. Only PDF, DOCX, and TXT files are allowed',
  FILE_CORRUPTED_ERROR: 'File appears to be corrupted or invalid'
});

/**
 * Processing-related validation rules - RELAXED FOR AI PROCESSING
 */
export const PROCESSING_VALIDATION = Object.freeze({
  PROCESSING_TIMEOUT: 10 * 60 * 1000,
  RETRY_ATTEMPTS: 3,
  MIN_PROCESSING_TIME: 1000, // 1 second minimum
  
  // Text extraction limits - RELAXED
  MIN_EXTRACTABLE_CHARS: 0,
  MAX_EXTRACTABLE_CHARS: 1000000, // 1MB text
  
  // Summary generation limits - RELAXED
  MIN_TEXT_FOR_SUMMARY: 0,
  SUMMARY_RATIO: 0.2, // Summary should be ~20% of original
  
  // Error messages
  EXTRACTION_FAILED_ERROR: 'Failed to extract text from document',
  SUMMARY_FAILED_ERROR: 'Failed to generate document summary',
  PROCESSING_TIMEOUT_ERROR: 'Document processing timed out'
});

// ==========================================
// METADATA VALIDATION - RELAXED
// ==========================================

/**
 * Document metadata validation - RELAXED FOR PROCESSING
 */
export const METADATA_VALIDATION = Object.freeze({
  PAGE_COUNT: {
    MIN: 0,
    MAX: 1000,
    ERROR_MESSAGE: 'Document must have between 1 and 1,000 pages'
  },

  LANGUAGE_CODE: {
    PATTERN: /^[a-z]{2}(-[A-Z]{2})?$/,
    DEFAULT: 'en',
    ERROR_MESSAGE: 'Invalid language code format (e.g., en, en-US)'
  },

  WORD_COUNT: {
    MIN: 0,
    MAX: 1000000,
    ERROR_MESSAGE: 'Document can contain up to 1,000,000 words'
  },

  CONFIDENCE_SCORE: {
    MIN: 0,
    MAX: 1,
    ERROR_MESSAGE: 'Confidence score must be between 0 and 1'
  }
});

// ==========================================
// VALIDATION HELPER FUNCTIONS - UPDATED
// ==========================================

/**
 * Validate file extension - UPDATED TO SUPPORT MULTIPLE FORMATS
 * @param {string} fileName - File name to validate
 * @returns {boolean} Whether extension is valid
 */
export const validateFileExtension = (fileName) => {
  if (!fileName || typeof fileName !== 'string') {
    return false;
  }
  return FILE_VALIDATION.EXTENSION_PATTERN.test(fileName);
};

/**
 * Validate MIME type - UPDATED TO SUPPORT MULTIPLE FORMATS
 * @param {string} mimeType - MIME type to validate
 * @returns {boolean} Whether MIME type is valid
 */
export const validateMimeType = (mimeType) => {
  if (!mimeType || typeof mimeType !== 'string') {
    return false;
  }
  return FILE_VALIDATION.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {boolean} Whether size is valid
 */
export const validateFileSize = (size) => {
  if (typeof size !== 'number' || size < 0) {
    return false;
  }
  return size >= DOCUMENT_VALIDATION_RULES.FILE_SIZE.MIN_SIZE && 
         size <= DOCUMENT_VALIDATION_RULES.FILE_SIZE.MAX_SIZE;
};

/**
 * Validate language code format
 * @param {string} langCode - Language code to validate
 * @returns {boolean} Whether language code is valid
 */
export const validateLanguageCode = (langCode) => {
  if (!langCode || typeof langCode !== 'string') {
    return false;
  }
  return METADATA_VALIDATION.LANGUAGE_CODE.PATTERN.test(langCode);
};

/**
 * Validate tag format and constraints
 * @param {Array<string>} tags - Array of tags to validate
 * @returns {boolean} Whether tags are valid
 */
export const validateTags = (tags) => {
  if (!Array.isArray(tags)) {
    return false;
  }
  
  if (tags.length > DOCUMENT_VALIDATION_RULES.TAGS.MAX_COUNT) {
    return false;
  }
  
  return tags.every(tag => {
    if (typeof tag !== 'string') return false;
    if (tag.length < DOCUMENT_VALIDATION_RULES.TAGS.MIN_TAG_LENGTH) return false;
    if (tag.length > DOCUMENT_VALIDATION_RULES.TAGS.MAX_TAG_LENGTH) return false;
    return DOCUMENT_VALIDATION_RULES.TAGS.PATTERN.test(tag);
  });
};

// ==========================================
// ADDITIONAL HELPER FOR PROCESSING STATES
// ==========================================

/**
 * Check if content validation should be relaxed during processing
 * @param {string} processingStage - Current processing stage
 * @returns {boolean} Whether to relax validation
 */
export const shouldRelaxValidation = (processingStage) => {
  const relaxedStages = ['upload', 'ai_analysis', 'processing'];
  return relaxedStages.includes(processingStage);
};