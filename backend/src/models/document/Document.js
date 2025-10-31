/**
 * Document Model
 * @module models/Document
 * @description Enterprise-grade document model for PDF processing and AI analysis
 */

import mongoose from 'mongoose';
import crypto from 'crypto';

// Import document constants
import {
  // Validation
  DOCUMENT_VALIDATION_RULES,
  FILE_VALIDATION,
  PROCESSING_VALIDATION,
  METADATA_VALIDATION,
  validateFileExtension,
  validateMimeType,
  validateFileSize,
  validateLanguageCode,
  
  // Enums
  DOCUMENT_STATUSES,
  PROCESSING_STAGES,
  DOCUMENT_TYPES,
  DOCUMENT_CATEGORIES,
  DIFFICULTY_LEVELS,
  SUPPORTED_DOCUMENT_LANGUAGES,
  AI_PROCESSING_QUALITY,
  SUMMARY_STYLES,
  CONTENT_COMPLEXITY,
  QUALITY_INDICATORS,
  PROCESSING_ERROR_TYPES,
  
  // Defaults
  DOCUMENT_DEFAULTS,
  COMPLETED_STATUSES,
  PROCESSING_STATUSES,
  ERROR_STATUSES,
} from '#constants/models/document/index.js';

// ==========================================
// SCHEMA CONFIGURATION
// ==========================================

const SCHEMA_OPTIONS = {
  collection: 'documents',
  timestamps: true,
  versionKey: false,
  
  // JSON transformation (security & optimization)
  toJSON: {
    transform: function(doc, ret) {
      // Transform _id to id for frontend consistency
      ret.id = ret._id;
      delete ret._id;
      
      // Remove sensitive processing data from client responses
      if (ret.processing) {
        delete ret.processing.internalLogs;
        delete ret.processing.errorDetails;
      }
      
      // Remove file storage internal paths
      if (ret.file && ret.file.storagePath) {
        delete ret.file.storagePath;
      }
      
      return ret;
    },
    virtuals: true
  },
  
  toObject: {
    virtuals: true
  }
};

// ==========================================
// DOCUMENT MODEL CONSTANTS
// ==========================================

const DOCUMENT_CONFIG = {
  FILE_ID_LENGTH: 32,
  MAX_TAGS: 20,
  CHECKSUM_ALGORITHM: 'sha256'
};

// ==========================================
// MAIN SCHEMA DEFINITION
// ==========================================

const documentSchema = new mongoose.Schema({
  
  // ==========================================
  // OWNERSHIP & IDENTIFICATION
  // ==========================================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'Document must belong to a user'],
    index: true
  },

  // ==========================================
  // DOCUMENT METADATA
  // ==========================================
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    minlength: [DOCUMENT_VALIDATION_RULES.TITLE.MIN_LENGTH, 'Title is too short'],
    maxlength: [DOCUMENT_VALIDATION_RULES.TITLE.MAX_LENGTH, 'Title is too long'],
    validate: {
      validator: function(title) {
        return DOCUMENT_VALIDATION_RULES.TITLE.PATTERN.test(title);
      },
      message: DOCUMENT_VALIDATION_RULES.TITLE.ERROR_MESSAGE
    },
    index: 'text' // Text search index
  },

  description: {
    type: String,
    trim: true,
    maxlength: [DOCUMENT_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH, DOCUMENT_VALIDATION_RULES.DESCRIPTION.ERROR_MESSAGE],
    default: ''
  },

  // ==========================================
  // FILE INFORMATION
  // ==========================================
  file: {
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
      minlength: [DOCUMENT_VALIDATION_RULES.ORIGINAL_FILE_NAME.MIN_LENGTH, 'File name is too short'],
      maxlength: [DOCUMENT_VALIDATION_RULES.ORIGINAL_FILE_NAME.MAX_LENGTH, 'File name is too long'],
      validate: {
        validator: function(fileName) {
          return validateFileExtension(fileName) && 
                 DOCUMENT_VALIDATION_RULES.ORIGINAL_FILE_NAME.PATTERN.test(fileName);
        },
        message: 'Invalid file name or unsupported file type'
      }
    },

    storagePath: {
      type: String,
      required: [true, 'Storage path is required'],
      select: false // Hide from client queries
    },

    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [DOCUMENT_VALIDATION_RULES.FILE_SIZE.MIN_SIZE, 'File is too small'],
      max: [DOCUMENT_VALIDATION_RULES.FILE_SIZE.MAX_SIZE, 'File is too large'],
      validate: {
        validator: validateFileSize,
        message: DOCUMENT_VALIDATION_RULES.FILE_SIZE.ERROR_MESSAGE
      }
    },

    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      validate: {
        validator: validateMimeType,
        message: FILE_VALIDATION.INVALID_MIME_TYPE_ERROR
      }
    },

    checksum: {
      type: String,
      required: false,
      unique: true,
      index: true
    },

    // File metadata
    metadata: {
      pageCount: {
        type: Number,
        min: [METADATA_VALIDATION.PAGE_COUNT.MIN, METADATA_VALIDATION.PAGE_COUNT.ERROR_MESSAGE],
        max: [METADATA_VALIDATION.PAGE_COUNT.MAX, METADATA_VALIDATION.PAGE_COUNT.ERROR_MESSAGE],
        default: null
      },
      wordCount: {
        type: Number,
        min: [METADATA_VALIDATION.WORD_COUNT.MIN, METADATA_VALIDATION.WORD_COUNT.ERROR_MESSAGE],
        max: [METADATA_VALIDATION.WORD_COUNT.MAX, METADATA_VALIDATION.WORD_COUNT.ERROR_MESSAGE],
        default: null
      },
      language: {
        type: String,
        enum: {
          values: SUPPORTED_DOCUMENT_LANGUAGES,
          message: 'Unsupported document language'
        },
        default: DOCUMENT_DEFAULTS.LANGUAGE,
        validate: {
          validator: validateLanguageCode,
          message: METADATA_VALIDATION.LANGUAGE_CODE.ERROR_MESSAGE
        }
      },
      complexity: {
        type: String,
        enum: {
          values: CONTENT_COMPLEXITY,
          message: 'Invalid content complexity level'
        },
        default: null
      },
      quality: {
        type: String,
        enum: {
          values: QUALITY_INDICATORS,
          message: 'Invalid quality indicator'
        },
        default: null
      }
    }
  },

  // ==========================================
  // CONTENT & PROCESSING
  // ==========================================

  content: {
    extractedText: {
      type: String,
      minlength: [DOCUMENT_VALIDATION_RULES.EXTRACTED_TEXT.MIN_LENGTH, 'Extracted text is too short'],
      maxlength: [DOCUMENT_VALIDATION_RULES.EXTRACTED_TEXT.MAX_LENGTH, 'Extracted text is too long'],
      default: null,
      index: 'text' // Full text search
    },

    summary: {
      type: String,
      minlength: [DOCUMENT_VALIDATION_RULES.SUMMARY.MIN_LENGTH, 'Summary is too short'],
      maxlength: [DOCUMENT_VALIDATION_RULES.SUMMARY.MAX_LENGTH, 'Summary is too long'],
      default: null,
      index: 'text' // Text search on summary
    },

    keyPoints: [{
      type: String,
      maxlength: 500
    }],

    topics: [{
      type: String,
      maxlength: 100
    }]
  },

  // ==========================================
  // CLASSIFICATION & ORGANIZATION
  // ==========================================
  classification: {
    type: {
      type: String,
      enum: {
        values: DOCUMENT_TYPES,
        message: 'Invalid document type'
      },
      default: DOCUMENT_DEFAULTS.TYPE
    },

    category: {
      type: String,
      enum: {
        values: DOCUMENT_CATEGORIES,
        message: 'Invalid document category'
      },
      default: DOCUMENT_DEFAULTS.CATEGORY,
      index: true
    },

    difficulty: {
      type: String,
      enum: {
        values: DIFFICULTY_LEVELS,
        message: 'Invalid difficulty level'
      },
      default: DOCUMENT_DEFAULTS.DIFFICULTY,
      index: true
    },

    tags: [{
      type: String,
      trim: true,
      minlength: [DOCUMENT_VALIDATION_RULES.TAGS.MIN_TAG_LENGTH, 'Tag is too short'],
      maxlength: [DOCUMENT_VALIDATION_RULES.TAGS.MAX_TAG_LENGTH, 'Tag is too long'],
      validate: {
        validator: function(tag) {
          return DOCUMENT_VALIDATION_RULES.TAGS.PATTERN.test(tag);
        },
        message: DOCUMENT_VALIDATION_RULES.TAGS.ERROR_MESSAGE
      }
    }]
  },

  // ==========================================
  // PROCESSING STATUS & TRACKING
  // ==========================================
  status: {
    type: String,
    enum: {
      values: DOCUMENT_STATUSES,
      message: 'Invalid document status'
    },
    default: DOCUMENT_DEFAULTS.STATUS,
    index: true
  },

  processing: {
    stage: {
      type: String,
      enum: {
        values: PROCESSING_STAGES,
        message: 'Invalid processing stage'
      },
      default: 'upload'
    },

    quality: {
      type: String,
      enum: {
        values: AI_PROCESSING_QUALITY,
        message: 'Invalid processing quality'
      },
      default: DOCUMENT_DEFAULTS.PROCESSING_QUALITY
    },

    summaryStyle: {
      type: String,
      enum: {
        values: SUMMARY_STYLES,
        message: 'Invalid summary style'
      },
      default: DOCUMENT_DEFAULTS.SUMMARY_STYLE
    },

    startedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: PROCESSING_VALIDATION.RETRY_ATTEMPTS
    },

    error: {
      type: {
        type: String,
        enum: {
          values: PROCESSING_ERROR_TYPES,
          message: 'Invalid error type'
        },
        default: null
      },
      message: {
        type: String,
        maxlength: 1000,
        default: null
      },
      details: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
        select: false // Hide error details from client
      },
      occurredAt: {
        type: Date,
        default: null
      }
    },

    // AI service metadata
    aiMetadata: {
      model: {
        type: String,
        default: null
      },
      tokensUsed: {
        type: Number,
        default: 0,
        min: 0
      },
      confidence: {
        type: Number,
        min: [METADATA_VALIDATION.CONFIDENCE_SCORE.MIN, METADATA_VALIDATION.CONFIDENCE_SCORE.ERROR_MESSAGE],
        max: [METADATA_VALIDATION.CONFIDENCE_SCORE.MAX, METADATA_VALIDATION.CONFIDENCE_SCORE.ERROR_MESSAGE],
        default: null
      },
      processingTime: {
        type: Number, // in milliseconds
        min: 0,
        default: null
      }
    }
  },

  // ==========================================
  // ANALYTICS & USAGE
  // ==========================================
  analytics: {
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0
    },
    quizGeneratedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastViewedAt: {
      type: Date,
      default: null
    },
    lastDownloadedAt: {
      type: Date,
      default: null
    }
  },

  // ==========================================
  // SOFT DELETE
  // ==========================================
  deletedAt: {
    type: Date,
    default: null,
    index: true
  }

}, SCHEMA_OPTIONS);

// ==========================================
// PERFORMANCE INDEXES
// ==========================================

// Core indexes for common queries
documentSchema.index({ userId: 1, status: 1, deletedAt: 1 });
documentSchema.index({ userId: 1, 'classification.category': 1, deletedAt: 1 });
documentSchema.index({ userId: 1, createdAt: -1, deletedAt: 1 });
documentSchema.index({ 'file.checksum': 1 }, { unique: true });
documentSchema.index({ status: 1, 'processing.stage': 1 });

// Search indexes
documentSchema.index({ 
  title: 'text', 
  'content.summary': 'text', 
  'classification.tags': 'text' 
}, {
  weights: { 
    title: 10, 
    'content.summary': 5, 
    'classification.tags': 3 
  }
});

// Analytics indexes
documentSchema.index({ 'analytics.viewCount': -1 });
documentSchema.index({ 'analytics.lastViewedAt': -1 });

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

documentSchema.pre('validate', function(next) {
  // Validate tags array length
  if (this.classification.tags && this.classification.tags.length > DOCUMENT_VALIDATION_RULES.TAGS.MAX_COUNT) {
    return next(new Error(`Cannot have more than ${DOCUMENT_VALIDATION_RULES.TAGS.MAX_COUNT} tags`));
  }
  
  // Auto-generate title from filename if not provided
  if (!this.title && this.file.originalName) {
    this.title = this.file.originalName.replace(/\.[^/.]+$/, ''); // Remove extension
  }
  
  next();
});

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

/**
 * Check if document is processed successfully
 */
documentSchema.virtual('isProcessed').get(function() {
  return this.status === 'completed' && !!this.content.summary;
});

/**
 * Check if document processing failed
 */
documentSchema.virtual('hasFailed').get(function() {
  return ERROR_STATUSES.includes(this.status);
});

/**
 * Check if document is currently being processed
 */
documentSchema.virtual('isProcessing').get(function() {
  return PROCESSING_STATUSES.includes(this.status);
});

/**
 * Get processing duration in milliseconds
 */
documentSchema.virtual('processingDuration').get(function() {
  if (!this.processing.startedAt || !this.processing.completedAt) {
    return null;
  }
  return this.processing.completedAt - this.processing.startedAt;
});

/**
 * Get human-readable file size
 */
documentSchema.virtual('fileSizeFormatted').get(function() {
  const size = this.file.size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
});

/**
 * Get file extension
 */
documentSchema.virtual('fileExtension').get(function() {
  const match = this.file.originalName.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : null;
});

/**
 * Check if document is owned by user
 */
documentSchema.virtual('isOwner').get(function() {
  return function(userId) {
    return this.userId.toString() === userId.toString();
  }.bind(this);
});

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================


documentSchema.pre('save', function(next) {
  try {
    // Generate checksum if not exists
    if (this.isNew && !this.file.checksum) {
      this.file.checksum = crypto.randomBytes(DOCUMENT_CONFIG.FILE_ID_LENGTH).toString('hex');
    }
    
    // Update processing timestamps
    if (this.isModified('status')) {
      if (this.status === 'processing' && !this.processing.startedAt) {
        this.processing.startedAt = new Date();
      }
      
      if (COMPLETED_STATUSES.includes(this.status) && !this.processing.completedAt) {
        this.processing.completedAt = new Date();
      }
    }
    
    // Clean up tags (remove duplicates, empty strings)
    if (this.classification.tags) {
      this.classification.tags = [...new Set(
        this.classification.tags
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0)
      )];
    }
    
    next();
  } catch (error) {
    next(error);
  }
});


// ==========================================
// INSTANCE METHODS
// ==========================================


/**
 * Mark document as processed with AI results
 */
documentSchema.methods.markAsProcessed = function(aiResults) {
  this.status = 'completed';
  this.processing.completedAt = new Date();
  this.processing.stage = 'finalization';
  
  if (aiResults.summary) {
    this.content.summary = aiResults.summary;
  }
  
  if (aiResults.keyPoints) {
    this.content.keyPoints = aiResults.keyPoints;
  }
  
  if (aiResults.topics) {
    this.content.topics = aiResults.topics;
  }
  
  if (aiResults.metadata) {
    Object.assign(this.processing.aiMetadata, aiResults.metadata);
  }
  
  return this.save();
};

/**
 * Mark document processing as failed
 */
documentSchema.methods.markAsFailed = function(errorType, errorMessage, errorDetails = null) {
  this.status = 'failed';
  this.processing.completedAt = new Date();
  this.processing.error = {
    type: errorType,
    message: errorMessage,
    details: errorDetails,
    occurredAt: new Date()
  };
  
  return this.save();
};

/**
 * Increment processing attempts
 */
documentSchema.methods.incrementAttempts = function() {
  this.processing.attempts += 1;
  return this.save();
};


/**
 * Update analytics counters
 */
documentSchema.methods.recordView = function() {
  return this.updateOne({
    $inc: { 'analytics.viewCount': 1 },
    $set: { 'analytics.lastViewedAt': new Date() }
  });
};

documentSchema.methods.recordDownload = function() {
  return this.updateOne({
    $inc: { 'analytics.downloadCount': 1 },
    $set: { 'analytics.lastDownloadedAt': new Date() }
  });
};

documentSchema.methods.recordQuizGeneration = function() {
  return this.updateOne({
    $inc: { 'analytics.quizGeneratedCount': 1 }
  });
};

/**
 * Soft delete document
 */
documentSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

/**
 * Restore soft deleted document
 */
documentSchema.methods.restore = function() {
  this.deletedAt = null;
  return this.save();
};


// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Find documents by user with optional filters
 */
documentSchema.statics.findByUser = function(userId, options = {}) {
  const {
    status,
    category,
    difficulty,
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 },
    includeDeleted = false
  } = options;
  
  const query = { userId };
  
  if (!includeDeleted) {
    query.deletedAt = null;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (category) {
    query['classification.category'] = category;
  }
  
  if (difficulty) {
    query['classification.difficulty'] = difficulty;
  }
  
  return this.find(query)
    .limit(limit)
    .skip(skip)
    .sort(sort);
};

/**
 * Search documents by text
 */
documentSchema.statics.searchByText = function(userId, searchTerm, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({
    userId,
    deletedAt: null,
    $text: { $search: searchTerm }
  }, {
    score: { $meta: 'textScore' }
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit)
  .skip(skip);
};

/**
 * Get documents needing processing
 */
documentSchema.statics.findNeedingProcessing = function(limit = 10) {
  return this.find({
    status: { $in: ['pending', 'processing'] },
    'processing.attempts': { $lt: PROCESSING_VALIDATION.RETRY_ATTEMPTS },
    deletedAt: null
  })
  .sort({ createdAt: 1 })
  .limit(limit);
};


/**
 * Get user's document statistics
 */
documentSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        processedDocuments: { 
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
        },
        failedDocuments: { 
          $sum: { $cond: [{ $in: ['$status', ERROR_STATUSES] }, 1, 0] } 
        },
        totalViews: { $sum: '$analytics.viewCount' },
        totalQuizzes: { $sum: '$analytics.quizGeneratedCount' },
        categoriesUsed: { $addToSet: '$classification.category' }
      }
    }
  ]);
};

/**
 * Find similar documents by tags or category
 */
documentSchema.statics.findSimilar = function(documentId, userId, limit = 5) {
  return this.findById(documentId)
    .then(doc => {
      if (!doc) return [];
      
      return this.find({
        _id: { $ne: documentId },
        userId,
        deletedAt: null,
        status: 'completed',
        $or: [
          { 'classification.category': doc.classification.category },
          { 'classification.tags': { $in: doc.classification.tags } }
        ]
      })
      .limit(limit)
      .sort({ 'analytics.viewCount': -1, createdAt: -1 });
    });
};

// ==========================================
// QUERY HELPERS
// ==========================================

documentSchema.query.active = function() {
  return this.where({ deletedAt: null });
};

documentSchema.query.processed = function() {
  return this.where({ status: 'completed' });
};

documentSchema.query.byCategory = function(category) {
  return this.where({ 'classification.category': category });
};

documentSchema.query.recent = function(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.where({ createdAt: { $gte: cutoff } });
};

// ==========================================
// EXPORT MODEL
// ==========================================

const Document = mongoose.model('Document', documentSchema);

export default Document;
export { documentSchema };
