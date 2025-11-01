/**
 * Student User Model
 * @module models/users/Student
 */

import BaseUser, { baseUserSchema } from '../BaseUser.js';

// Import minimal student constants
import {
  ACADEMIC_LEVELS,
  SUBSCRIPTION_TIERS,
} from '#constants/models/user/index.js';

// ==========================================
// MINIMAL STUDENT SCHEMA
// ==========================================

const studentSchema = new baseUserSchema.constructor({
  // Essential Academic Info
  academic: {
    level: {
      type: String,
      enum: {
        values: ACADEMIC_LEVELS,
        message: 'Invalid academic level'
      },
      default: 'undergraduate',
      index: true
    },
    institution: {
      type: String,
      trim: true,
      maxlength: [100, 'Institution name too long'],
      default: null
    }
  },

  // Core Subscription
  subscription: {
    tier: {
      type: String,
      enum: {
        values: SUBSCRIPTION_TIERS,
        message: 'Invalid subscription tier'
      },
      default: 'free',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    startDate: {
      type: Date,
      default: Date.now
    }
  },

  // Basic Progress Tracking
  progress: {
    documentsUploaded: {
      type: Number,
      default: 0,
      min: 0
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
});

// ==========================================
// ESSENTIAL INDEXES
// ==========================================

studentSchema.index({ 'academic.level': 1, status: 1 });
studentSchema.index({ 'subscription.tier': 1, 'subscription.isActive': 1 });

// ==========================================
// CORE VIRTUAL PROPERTIES
// ==========================================

/**
 * Check if user has active subscription
 */
studentSchema.virtual('hasActiveSubscription').get(function() {
  return this.subscription.isActive;
});

/**
 * Check if user is premium subscriber
 */
studentSchema.virtual('isPremium').get(function() {
  return this.subscription.tier !== 'free' && this.subscription.isActive;
});

// ==========================================
// ESSENTIAL METHODS
// ==========================================

/**
 * Record document upload
 */
studentSchema.methods.recordDocumentUpload = function() {
  this.progress.documentsUploaded += 1;
  return this.save();
};

/**
 * Record quiz completion
 */
studentSchema.methods.recordQuizCompletion = function(score) {
  const totalQuizzes = this.progress.quizzesCompleted;
  const currentAvg = this.progress.averageScore;
  
  this.progress.quizzesCompleted += 1;
  this.progress.averageScore = Math.round(((currentAvg * totalQuizzes) + score) / (totalQuizzes + 1));
  
  return this.save();
};

/**
 * Update subscription tier
 */
studentSchema.methods.updateSubscription = function(newTier, isActive = true) {
  this.subscription.tier = newTier;
  this.subscription.isActive = isActive;
  return this.save();
};

// ==========================================
// BASIC STATIC METHODS
// ==========================================

/**
 * Find students by academic level
 */
studentSchema.statics.findByLevel = function(level) {
  return this.find({
    'academic.level': level,
    status: 'active'
  });
};

/**
 * Find active premium subscribers
 */
studentSchema.statics.findPremiumSubscribers = function() {
  return this.find({
    'subscription.tier': { $ne: 'free' },
    'subscription.isActive': true,
    status: 'active'
  });
};

/**
 * Get basic student statistics
 */
studentSchema.statics.getBasicStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$subscription.tier',
        count: { $sum: 1 },
        avgDocuments: { $avg: '$progress.documentsUploaded' },
        avgQuizzes: { $avg: '$progress.quizzesCompleted' },
        avgScore: { $avg: '$progress.averageScore' }
      }
    }
  ]);
};

// ==========================================
// SIMPLE QUERY HELPERS
// ==========================================

studentSchema.query.active = function() {
  return this.where({ status: 'active' });
};

studentSchema.query.premium = function() {
  return this.where({ 
    'subscription.tier': { $ne: 'free' },
    'subscription.isActive': true 
  });
};

studentSchema.query.byTier = function(tier) {
  return this.where({ 'subscription.tier': tier });
};

// ==========================================
// CREATE DISCRIMINATOR MODEL
// ==========================================

const Student = BaseUser.discriminator('Student', studentSchema);

export default Student;