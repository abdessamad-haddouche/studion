/**
 * Quiz Model
 * @module models/Quiz
 * @description Quiz model for AI-generated quizzes from documents
 */

import mongoose from 'mongoose';

// Import quiz constants
import {
  // Validation
  QUIZ_VALIDATION_RULES,
  QUESTION_VALIDATION_RULES,
  validateQuestionByType,
  
  // Enums
  QUIZ_STATUSES,
  QUESTION_TYPES,
  QUIZ_DIFFICULTY_LEVELS,
  QUIZ_CATEGORIES,
  
  // Defaults
  QUIZ_DEFAULTS
} from '#constants/models/quiz/index.js';

// ==========================================
// SCHEMA CONFIGURATION
// ==========================================

const SCHEMA_OPTIONS = {
  collection: 'quizzes',
  timestamps: true,
  versionKey: false,
  
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
    virtuals: false // DISABLE virtuals to prevent circular refs
  },
  
  toObject: {
    virtuals: false // DISABLE virtuals to prevent circular refs
  }
};

// ==========================================
// MAIN QUIZ SCHEMA (NO SUBDOCUMENTS)
// ==========================================

const quizSchema = new mongoose.Schema({
  
  // ==========================================
  // RELATIONSHIPS
  // ==========================================
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: [true, 'Quiz must be linked to a document'],
    index: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'Quiz must belong to a user'],
    index: true
  },
  
  // ==========================================
  // BASIC INFORMATION
  // ==========================================
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    minlength: [QUIZ_VALIDATION_RULES.TITLE.MIN_LENGTH, QUIZ_VALIDATION_RULES.TITLE.ERROR_MESSAGE],
    maxlength: [QUIZ_VALIDATION_RULES.TITLE.MAX_LENGTH, QUIZ_VALIDATION_RULES.TITLE.ERROR_MESSAGE],
    validate: {
      validator: function(title) {
        return QUIZ_VALIDATION_RULES.TITLE.PATTERN.test(title);
      },
      message: QUIZ_VALIDATION_RULES.TITLE.ERROR_MESSAGE
    },
    index: 'text'
  },
  
  description: {
    type: String,
    trim: true,
    minlength: [QUIZ_VALIDATION_RULES.DESCRIPTION.MIN_LENGTH, QUIZ_VALIDATION_RULES.DESCRIPTION.ERROR_MESSAGE],
    maxlength: [QUIZ_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH, QUIZ_VALIDATION_RULES.DESCRIPTION.ERROR_MESSAGE],
    default: ''
  },
  
  // ==========================================
  // QUIZ QUESTIONS - SIMPLIFIED STRUCTURE
  // ==========================================
  questions: {
    type: [mongoose.Schema.Types.Mixed], // Simple mixed type to avoid subdocument issues
    required: [true, 'Quiz must have at least one question'],
    validate: {
      validator: function(questions) {
        return questions.length >= QUIZ_VALIDATION_RULES.QUESTIONS_COUNT.MIN && 
               questions.length <= QUIZ_VALIDATION_RULES.QUESTIONS_COUNT.MAX;
      },
      message: QUIZ_VALIDATION_RULES.QUESTIONS_COUNT.ERROR_MESSAGE
    }
  },
  
  // ==========================================
  // CLASSIFICATION & SETTINGS
  // ==========================================
  difficulty: {
    type: String,
    enum: {
      values: QUIZ_DIFFICULTY_LEVELS,
      message: 'Invalid difficulty level'
    },
    default: QUIZ_DEFAULTS.DIFFICULTY,
    index: true
  },
  
  category: {
    type: String,
    enum: {
      values: QUIZ_CATEGORIES,
      message: 'Invalid quiz category'
    },
    default: QUIZ_DEFAULTS.CATEGORY,
    index: true
  },
  
  estimatedTime: {
    type: Number, // in minutes
    min: [QUIZ_VALIDATION_RULES.ESTIMATED_TIME.MIN, QUIZ_VALIDATION_RULES.ESTIMATED_TIME.ERROR_MESSAGE],
    max: [QUIZ_VALIDATION_RULES.ESTIMATED_TIME.MAX, QUIZ_VALIDATION_RULES.ESTIMATED_TIME.ERROR_MESSAGE],
    default: QUIZ_DEFAULTS.TIME_LIMIT
  },
  
  passingScore: {
    type: Number, // percentage
    min: [QUIZ_VALIDATION_RULES.PASSING_SCORE.MIN, QUIZ_VALIDATION_RULES.PASSING_SCORE.ERROR_MESSAGE],
    max: [QUIZ_VALIDATION_RULES.PASSING_SCORE.MAX, QUIZ_VALIDATION_RULES.PASSING_SCORE.ERROR_MESSAGE],
    default: QUIZ_DEFAULTS.PASSING_SCORE
  },
  
  // ==========================================
  // STATUS & PROCESSING
  // ==========================================
  status: {
    type: String,
    enum: {
      values: QUIZ_STATUSES,
      message: 'Invalid quiz status'
    },
    default: QUIZ_DEFAULTS.STATUS,
    index: true
  },
  
  // ==========================================
  // AI GENERATION METADATA
  // ==========================================
  aiMetadata: {
    model: {
      type: String,
      default: null
    },
    questionType: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'mixed'],
      default: 'multiple_choice'
    },
    type: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'mixed'],
      default: 'multiple_choice'
    },
    generationType: {
      type: String,
      default: 'ai_generated'
    },
    originalQuizId: {
      type: String,
      default: null
    },
    
    // 🔧 ADD THESE NEW FIELDS FOR CORRECT ANSWER VALIDATION:
    hasCorrectAnswers: {
      type: Boolean,
      default: false,
      index: true  // For quick filtering
    },
    correctAnswersValidated: {
      type: Boolean,
      default: false
    },
    answerValidationErrors: {
      type: [String],
      default: []
    },
    questionValidationStats: {
      totalQuestions: { type: Number, default: 0 },
      questionsWithCorrectAnswers: { type: Number, default: 0 },
      questionsWithValidOptions: { type: Number, default: 0 },
      validationPercentage: { type: Number, default: 0 }
    },
    
    // Existing fields...
    tokensUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    generationTime: {
      type: Number,
      default: null,
      min: 0
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null
    },
    generatedAt: {
      type: Date,
      default: null
    }
  },
  
  // ==========================================
  // ANALYTICS
  // ==========================================
  analytics: {
    attemptCount: {
      type: Number,
      default: 0,
      min: 0
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageTime: {
      type: Number, // in minutes
      default: 0,
      min: 0
    },
    lastAttemptAt: {
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
// INDEXES
// ==========================================

quizSchema.index({ userId: 1, status: 1, deletedAt: 1 });
quizSchema.index({ documentId: 1, deletedAt: 1 });
quizSchema.index({ userId: 1, createdAt: -1, deletedAt: 1 });
quizSchema.index({ difficulty: 1, category: 1 });
quizSchema.index({ 'analytics.attemptCount': -1 });
quizSchema.index({ title: 'text', description: 'text' });
quizSchema.index({ 'aiMetadata.questionType': 1 });
quizSchema.index({ 'aiMetadata.type': 1 });

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

quizSchema.pre('validate', function(next) {
  // Auto-generate title if not provided
  if (!this.title && this.documentId) {
    this.title = `Quiz - ${new Date().toLocaleDateString()}`;
  }
  
  next();
});

// ==========================================
// INSTANCE METHODS
// ==========================================

/**
 * Mark quiz as active and ready for attempts
 */
quizSchema.methods.activate = function() {
  this.status = 'active';
  return this.save();
};

/**
 * Archive the quiz (soft archive)
 */
quizSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

/**
 * Update analytics after quiz attempt
 */
quizSchema.methods.updateAnalytics = function(percentage, timeInMinutes) {
  try {
    // Safely handle time calculation
    const safeTime = (!timeInMinutes || isNaN(timeInMinutes) || timeInMinutes <= 0) ? 5 : timeInMinutes;
    
    // Update analytics safely
    this.analytics.totalAttempts = (this.analytics.totalAttempts || 0) + 1;
    this.analytics.averageScore = percentage;
    this.analytics.averageTime = safeTime; // Use safe time value
    this.analytics.lastAttempt = new Date();
    
    return this.save();
  } catch (error) {
    console.error('❌ Analytics update error:', error);
    // Don't throw - just log and continue
    return Promise.resolve();
  }
};

/**
 * Soft delete quiz
 */
quizSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

/**
 * Restore soft deleted quiz
 */
quizSchema.methods.restore = function() {
  this.deletedAt = null;
  return this.save();
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Find quizzes by user with filters
 */
quizSchema.statics.findByUser = function(userId, options = {}) {
  const {
    status,
    difficulty,
    category,
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
  
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .populate('documentId', 'title')
    .limit(limit)
    .skip(skip)
    .sort(sort);
};

/**
 * Find quizzes for a specific document
 */
quizSchema.statics.findByDocument = function(documentId, options = {}) {
  const { includeDeleted = false } = options;
  
  const query = { documentId };
  
  if (!includeDeleted) {
    query.deletedAt = null;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 });
};

/**
 * Search quizzes by text
 */
quizSchema.statics.searchByText = function(userId, searchTerm, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({
    userId,
    deletedAt: null,
    status: 'active',
    $text: { $search: searchTerm }
  }, {
    score: { $meta: 'textScore' }
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit)
  .skip(skip);
};

/**
 * Get user quiz statistics
 */
quizSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        activeQuizzes: { 
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } 
        },
        totalAttempts: { $sum: '$analytics.attemptCount' },
        avgDifficulty: { $avg: { $cond: [
          { $eq: ['$difficulty', 'easy'] }, 1,
          { $cond: [{ $eq: ['$difficulty', 'medium'] }, 2, 3] }
        ]}},
        categoriesUsed: { $addToSet: '$category' }
      }
    }
  ]);
};

// ==========================================
// QUERY HELPERS
// ==========================================

quizSchema.query.active = function() {
  return this.where({ status: 'active', deletedAt: null });
};

quizSchema.query.byDifficulty = function(difficulty) {
  return this.where({ difficulty });
};

quizSchema.query.recent = function(days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.where({ createdAt: { $gte: cutoff } });
};

// ==========================================
// EXPORT MODEL
// ==========================================

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
export { quizSchema };