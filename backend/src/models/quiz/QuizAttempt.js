/**
 * QuizAttempt Model
 * @module models/QuizAttempt
 * @description Quiz attempt model for tracking user quiz sessions and scoring
 */

import mongoose from 'mongoose';

// Import quiz constants
import {
  // Validation
  QUIZ_ATTEMPT_VALIDATION_RULES,
  ANSWER_VALIDATION,
  calculatePointsEarned,
  
  // Enums
  QUIZ_ATTEMPT_STATUSES,
  PERFORMANCE_LEVELS,
  SUBJECT_AREAS,
  getPerformanceLevel,
  
  // Defaults
  QUIZ_ATTEMPT_DEFAULTS
} from '#constants/models/quiz/index.js';

// ==========================================
// SCHEMA CONFIGURATION
// ==========================================

const SCHEMA_OPTIONS = {
  collection: 'quiz_attempts',
  timestamps: true,
  versionKey: false,
  
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
    virtuals: true
  },
  
  toObject: {
    virtuals: true
  }
};

// ==========================================
// ANSWER SUB-SCHEMA
// ==========================================

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Question ID is required']
  },
  
  userAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'User answer is required']
  },
  
  isCorrect: {
    type: Boolean,
    required: [true, 'Answer correctness must be determined']
  },
  
  pointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  
  timeSpent: {
    type: Number, // milliseconds spent on this question
    default: 0,
    min: 0
  }
}, { _id: false });

// ==========================================
// STRENGTH/WEAKNESS SUB-SCHEMA
// ==========================================

const performanceAreaSchema = new mongoose.Schema({
  area: {
    type: String,
    enum: {
      values: SUBJECT_AREAS,
      message: 'Invalid subject area'
    },
    required: [true, 'Performance area is required']
  },
  
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: [true, 'Performance score is required']
  },
  
  totalQuestions: {
    type: Number,
    min: 0,
    required: [true, 'Total questions for this area is required']
  },
  
  correctAnswers: {
    type: Number,
    min: 0,
    required: [true, 'Correct answers for this area is required']
  }
}, { _id: false });

// ==========================================
// MAIN QUIZ ATTEMPT SCHEMA
// ==========================================

const quizAttemptSchema = new mongoose.Schema({
  
  // ==========================================
  // RELATIONSHIPS
  // ==========================================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'Quiz attempt must belong to a user'],
    index: true
  },
  
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz attempt must reference a quiz'],
    index: true
  },
  
  // ==========================================
  // ATTEMPT STATUS & TIMING
  // ==========================================
  status: {
    type: String,
    enum: {
      values: QUIZ_ATTEMPT_STATUSES,
      message: 'Invalid quiz attempt status'
    },
    default: QUIZ_ATTEMPT_DEFAULTS.STATUS,
    index: true
  },
  
  startedAt: {
    type: Date,
    default: Date.now,
    required: [true, 'Start time is required']
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  timeSpent: {
    type: Number, // total time in milliseconds
    default: QUIZ_ATTEMPT_DEFAULTS.TIME_SPENT,
    min: [QUIZ_ATTEMPT_VALIDATION_RULES.TIME_SPENT.MIN, QUIZ_ATTEMPT_VALIDATION_RULES.TIME_SPENT.ERROR_MESSAGE],
    max: [QUIZ_ATTEMPT_VALIDATION_RULES.TIME_SPENT.MAX, QUIZ_ATTEMPT_VALIDATION_RULES.TIME_SPENT.ERROR_MESSAGE]
  },
  
  // ==========================================
  // ANSWERS & RESPONSES
  // ==========================================
  answers: {
    type: [answerSchema],
    default: []
  },
  
  // ==========================================
  // SCORING & PERFORMANCE
  // ==========================================
  score: {
    type: Number,
    default: QUIZ_ATTEMPT_DEFAULTS.SCORE,
    min: [QUIZ_ATTEMPT_VALIDATION_RULES.SCORE.MIN, QUIZ_ATTEMPT_VALIDATION_RULES.SCORE.ERROR_MESSAGE]
  },
  
  percentage: {
    type: Number,
    default: QUIZ_ATTEMPT_DEFAULTS.PERCENTAGE,
    min: [QUIZ_ATTEMPT_VALIDATION_RULES.PERCENTAGE.MIN, QUIZ_ATTEMPT_VALIDATION_RULES.PERCENTAGE.ERROR_MESSAGE],
    max: [QUIZ_ATTEMPT_VALIDATION_RULES.PERCENTAGE.MAX, QUIZ_ATTEMPT_VALIDATION_RULES.PERCENTAGE.ERROR_MESSAGE]
  },
  
  pointsEarned: {
    type: Number,
    default: QUIZ_ATTEMPT_DEFAULTS.POINTS_EARNED,
    min: [QUIZ_ATTEMPT_VALIDATION_RULES.POINTS_EARNED.MIN, QUIZ_ATTEMPT_VALIDATION_RULES.POINTS_EARNED.ERROR_MESSAGE],
    max: [QUIZ_ATTEMPT_VALIDATION_RULES.POINTS_EARNED.MAX, QUIZ_ATTEMPT_VALIDATION_RULES.POINTS_EARNED.ERROR_MESSAGE]
  },
  
  // ==========================================
  // PERFORMANCE ANALYSIS
  // ==========================================
  strengths: {
    type: [performanceAreaSchema],
    default: []
  },
  
  weaknesses: {
    type: [performanceAreaSchema],
    default: []
  },
  
  performanceLevel: {
    type: String,
    enum: {
      values: PERFORMANCE_LEVELS,
      message: 'Invalid performance level'
    },
    default: null
  },
  
  // ==========================================
  // FEEDBACK & RECOMMENDATIONS
  // ==========================================
  feedback: {
    overall: {
      type: String,
      maxlength: [QUIZ_ATTEMPT_VALIDATION_RULES.FEEDBACK.MAX_LENGTH, QUIZ_ATTEMPT_VALIDATION_RULES.FEEDBACK.ERROR_MESSAGE],
      default: ''
    },
    
    improvements: [{
      area: String,
      suggestion: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }],
    
    nextSteps: [{
      action: String,
      description: String,
      estimatedTime: Number // in minutes
    }]
  },
  
  // ==========================================
  // METADATA
  // ==========================================
  metadata: {
    userAgent: {
      type: String,
      default: null
    },
    
    ipAddress: {
      type: String,
      default: null,
      select: false // Hidden for privacy
    },
    
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown'
    },
    
    pauseCount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    hintsUsed: {
      type: Number,
      default: 0,
      min: 0
    }
  }
  
}, SCHEMA_OPTIONS);

// ==========================================
// INDEXES
// ==========================================

quizAttemptSchema.index({ userId: 1, createdAt: -1 });
quizAttemptSchema.index({ quizId: 1, createdAt: -1 });
quizAttemptSchema.index({ userId: 1, status: 1 });
quizAttemptSchema.index({ userId: 1, percentage: -1 });
quizAttemptSchema.index({ userId: 1, pointsEarned: -1 });
quizAttemptSchema.index({ status: 1, startedAt: 1 }); // For cleanup jobs

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

/**
 * Get time spent in a human-readable format
 */
quizAttemptSchema.virtual('timeSpentFormatted').get(function() {
  const minutes = Math.floor(this.timeSpent / (1000 * 60));
  const seconds = Math.floor((this.timeSpent % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
});

/**
 * Check if attempt was completed successfully
 */
quizAttemptSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' && this.completedAt;
});

/**
 * Check if attempt is still in progress
 */
quizAttemptSchema.virtual('isInProgress').get(function() {
  return this.status === 'in_progress' && !this.completedAt;
});

/**
 * Check if user passed the quiz
 */
quizAttemptSchema.virtual('hasPassed').get(function() {
  // This will be calculated based on quiz passing score
  return this.percentage >= 70; // Default passing score
});

/**
 * Get accuracy rate
 */
quizAttemptSchema.virtual('accuracy').get(function() {
  if (this.answers.length === 0) return 0;
  const correct = this.answers.filter(answer => answer.isCorrect).length;
  return (correct / this.answers.length) * 100;
});

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================

quizAttemptSchema.pre('save', function(next) {
  // Calculate percentage if score is set
  if (this.isModified('score') && this.answers.length > 0) {
    this.percentage = (this.score / this.answers.length) * 100;
  }
  
  // Set performance level based on percentage
  if (this.isModified('percentage')) {
    this.performanceLevel = getPerformanceLevel(this.percentage);
  }
  
  // Calculate time spent if completing
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    this.timeSpent = this.completedAt - this.startedAt;
  }
  
  next();
});

// ==========================================
// INSTANCE METHODS
// ==========================================

/**
 * Submit an answer for a question
 */
quizAttemptSchema.methods.submitAnswer = function(questionId, userAnswer, isCorrect, pointsEarned = 0, timeSpent = 0) {
  // Check if answer already exists
  const existingIndex = this.answers.findIndex(a => a.questionId.toString() === questionId.toString());
  
  const answerData = {
    questionId,
    userAnswer,
    isCorrect,
    pointsEarned,
    timeSpent
  };
  
  if (existingIndex !== -1) {
    // Update existing answer
    this.answers[existingIndex] = answerData;
  } else {
    // Add new answer
    this.answers.push(answerData);
  }
  
  // Recalculate score
  this.score = this.answers.filter(a => a.isCorrect).length;
  
  return this.save();
};

/**
 * Complete the quiz attempt
 */
quizAttemptSchema.methods.complete = function(quiz) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.timeSpent = this.completedAt - this.startedAt;
  
  // Calculate final percentage
  if (this.answers.length > 0) {
    this.percentage = (this.score / this.answers.length) * 100;
  }
  
  // Calculate points earned
  if (quiz) {
    this.pointsEarned = calculatePointsEarned(
      this.score,
      this.answers.length,
      quiz.difficulty,
      this.timeSpent,
      quiz.estimatedTime * 60 * 1000 // Convert minutes to milliseconds
    );
  }
  
  return this.save();
};

/**
 * Abandon the quiz attempt
 */
quizAttemptSchema.methods.abandon = function() {
  this.status = 'abandoned';
  this.completedAt = new Date();
  this.timeSpent = this.completedAt - this.startedAt;
  
  return this.save();
};

/**
 * Analyze performance and set strengths/weaknesses
 */
quizAttemptSchema.methods.analyzePerformance = function(quiz) {
  const performanceByArea = {};
  
  // Group answers by subject area (this would be enhanced with actual question categorization)
  this.answers.forEach(answer => {
    const question = quiz.questions.find(q => q._id.toString() === answer.questionId.toString());
    if (question) {
      // For MVP, we'll use simple categorization based on question type
      let area = 'factual_recall';
      switch (question.type) {
        case 'multiple_choice':
          area = 'factual_recall';
          break;
        case 'true_false':
          area = 'conceptual_understanding';
          break;
        case 'fill_in_blank':
          area = 'procedural_knowledge';
          break;
        case 'short_answer':
          area = 'analytical_thinking';
          break;
      }
      
      if (!performanceByArea[area]) {
        performanceByArea[area] = { correct: 0, total: 0 };
      }
      
      performanceByArea[area].total++;
      if (answer.isCorrect) {
        performanceByArea[area].correct++;
      }
    }
  });
  
  // Calculate strengths (>75% accuracy) and weaknesses (<60% accuracy)
  this.strengths = [];
  this.weaknesses = [];
  
  Object.entries(performanceByArea).forEach(([area, stats]) => {
    const score = (stats.correct / stats.total) * 100;
    const areaData = {
      area,
      score,
      totalQuestions: stats.total,
      correctAnswers: stats.correct
    };
    
    if (score >= 75) {
      this.strengths.push(areaData);
    } else if (score < 60) {
      this.weaknesses.push(areaData);
    }
  });
  
  return this.save();
};

/**
 * Generate feedback based on performance
 */
quizAttemptSchema.methods.generateFeedback = function() {
  const performance = this.performanceLevel;
  const percentage = this.percentage;
  
  // Generate overall feedback
  let overallFeedback = '';
  if (percentage >= 90) {
    overallFeedback = 'Excellent work! You demonstrated outstanding understanding of the material.';
  } else if (percentage >= 80) {
    overallFeedback = 'Great job! You have a solid grasp of most concepts with room for minor improvements.';
  } else if (percentage >= 70) {
    overallFeedback = 'Good effort! You understand the basics but could benefit from reviewing some areas.';
  } else if (percentage >= 60) {
    overallFeedback = 'You\'re making progress, but there are several areas that need more attention.';
  } else {
    overallFeedback = 'This material requires more study. Focus on understanding the fundamental concepts.';
  }
  
  this.feedback.overall = overallFeedback;
  
  // Generate improvement suggestions based on weaknesses
  this.feedback.improvements = this.weaknesses.map(weakness => ({
    area: weakness.area,
    suggestion: `Focus on improving your ${weakness.area.replace('_', ' ')} skills through targeted practice.`,
    priority: weakness.score < 40 ? 'high' : 'medium'
  }));
  
  return this.save();
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Find attempts by user with filters
 */
quizAttemptSchema.statics.findByUser = function(userId, options = {}) {
  const {
    status,
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 },
    includeAbandoned = false
  } = options;
  
  const query = { userId };
  
  if (status) {
    query.status = status;
  }
  
  if (!includeAbandoned) {
    query.status = { $ne: 'abandoned' };
  }
  
  return this.find(query)
    .populate('quizId', 'title difficulty estimatedTime')
    .limit(limit)
    .skip(skip)
    .sort(sort);
};

/**
 * Find attempts for a specific quiz
 */
quizAttemptSchema.statics.findByQuiz = function(quizId, options = {}) {
  const { limit = 50, skip = 0 } = options;
  
  return this.find({ quizId, status: 'completed' })
    .populate('userId', 'username')
    .sort({ percentage: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get user performance statistics
 */
quizAttemptSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$percentage' },
        totalPointsEarned: { $sum: '$pointsEarned' },
        averageTimeSpent: { $avg: '$timeSpent' },
        bestScore: { $max: '$percentage' },
        completionRate: {
          $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);
};

/**
 * Get leaderboard for a quiz
 */
quizAttemptSchema.statics.getQuizLeaderboard = function(quizId, limit = 10) {
  return this.aggregate([
    { $match: { quizId: new mongoose.Types.ObjectId(quizId), status: 'completed' } },
    { $sort: { percentage: -1, timeSpent: 1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'baseusers',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        username: '$user.username',
        percentage: 1,
        timeSpent: 1,
        pointsEarned: 1,
        completedAt: 1
      }
    }
  ]);
};

// ==========================================
// QUERY HELPERS
// ==========================================

quizAttemptSchema.query.completed = function() {
  return this.where({ status: 'completed' });
};

quizAttemptSchema.query.inProgress = function() {
  return this.where({ status: 'in_progress' });
};

quizAttemptSchema.query.recent = function(days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.where({ createdAt: { $gte: cutoff } });
};

// ==========================================
// EXPORT MODEL
// ==========================================

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
export { quizAttemptSchema, answerSchema, performanceAreaSchema };