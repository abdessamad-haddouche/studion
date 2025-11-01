/**
 * Student User Model - FULLY COMPATIBLE VERSION
 * @module models/users/Student
 * @description Student model with complete compatibility for Transaction, Quiz, Document, Course, and Subscription models
 */

import mongoose from 'mongoose';
import BaseUser, { baseUserSchema } from './BaseUser.js';

// Import minimal student constants
import {
  ACADEMIC_LEVELS,
  SUBSCRIPTION_TIERS,
} from '#constants/models/user/index.js';

// ==========================================
// ENHANCED STUDENT SCHEMA - FULLY COMPATIBLE
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
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: [100, 'Field of study too long'],
      default: null
    }
  },

  // Core Subscription (Basic - works with Subscription model)
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
    },
    // Reference to full Subscription model
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
      index: true
    }
  },

  // 🔥 ENHANCED PROGRESS TRACKING - COMPATIBLE WITH ALL MODELS
  progress: {
    // Document Model compatibility
    documentsUploaded: {
      type: Number,
      default: 0,
      min: 0,
      index: true
    },
    
    // Quiz Model compatibility
    quizzesCompleted: {
      type: Number,
      default: 0,
      min: 0,
      index: true
    },
    quizzesGenerated: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Performance metrics
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true
    },
    bestScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    // 🎯 POINTS SYSTEM - TRANSACTION MODEL COMPATIBILITY
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
      index: true // For leaderboards and quick lookups
    },
    pointsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Course Model compatibility
    coursesViewed: {
      type: Number,
      default: 0,
      min: 0
    },
    coursesPurchased: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Study habits
    studyStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    lastStudyDate: {
      type: Date,
      default: null
    }
  },

  // 🎓 LEARNING PREFERENCES - QUIZ & DOCUMENT COMPATIBILITY
  learningPreferences: {
    preferredDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    preferredCategories: [{
      type: String,
      enum: [
        'mathematics', 'science', 'technology', 'engineering',
        'business', 'literature', 'history', 'other'
      ]
    }],
    studyGoals: {
      dailyQuizzes: {
        type: Number,
        default: 3,
        min: 1,
        max: 20
      },
      weeklyDocuments: {
        type: Number,
        default: 5,
        min: 1,
        max: 50
      }
    }
  },

  // 📊 PERFORMANCE ANALYTICS - COMPATIBLE WITH QUIZATTEMPT MODEL
  analytics: {
    // Subject performance (matches QuizAttempt strengths/weaknesses)
    subjectPerformance: [{
      subject: String,
      averageScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      attemptsCount: {
        type: Number,
        default: 0,
        min: 0
      },
      lastAttempt: {
        type: Date,
        default: null
      }
    }],
    
    // Time tracking
    totalStudyTime: {
      type: Number, // in minutes
      default: 0,
      min: 0
    },
    averageQuizTime: {
      type: Number, // in minutes
      default: 0,
      min: 0
    },
    
    // Achievement tracking - FIXED SCHEMA
    achievements: [{
      type: {
        type: String,
        required: true
      },
      achievedAt: {
        type: Date,
        default: Date.now
      },
      description: {
        type: String,
        required: true
      }
    }]
  }
});

// ==========================================
// ENHANCED INDEXES FOR PERFORMANCE
// ==========================================

studentSchema.index({ 'academic.level': 1, status: 1 });
studentSchema.index({ 'subscription.tier': 1, 'subscription.isActive': 1 });
studentSchema.index({ 'progress.totalPoints': -1 }); // Leaderboards
studentSchema.index({ 'progress.averageScore': -1 }); // Performance rankings
studentSchema.index({ 'progress.studyStreak': -1 }); // Study streaks
studentSchema.index({ 'progress.lastStudyDate': -1 }); // Recent activity

// ==========================================
// ENHANCED VIRTUAL PROPERTIES
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

/**
 * Get available points (total - used)
 */
studentSchema.virtual('availablePoints').get(function() {
  return this.progress.totalPoints - this.progress.pointsUsed;
});

/**
 * Get completion rate
 */
studentSchema.virtual('completionRate').get(function() {
  if (this.progress.quizzesGenerated === 0) return 0;
  return Math.round((this.progress.quizzesCompleted / this.progress.quizzesGenerated) * 100);
});

/**
 * Check if study streak is active (studied today or yesterday)
 */
studentSchema.virtual('hasActiveStreak').get(function() {
  if (!this.progress.lastStudyDate) return false;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return this.progress.lastStudyDate >= yesterday;
});

/**
 * Get current rank based on points
 */
studentSchema.virtual('pointsRank').get(function() {
  // This would be calculated via aggregation in practice
  return 'TBD'; // Placeholder for rank calculation
});

// ==========================================
// ENHANCED METHODS - FULL MODEL COMPATIBILITY
// ==========================================

/**
 * Record document upload - Document Model compatibility
 */
studentSchema.methods.recordDocumentUpload = function() {
  this.progress.documentsUploaded += 1;
  this.updateStudyStreak();
  return this.save();
};

/**
 * Record quiz generation - Quiz Model compatibility
 */
studentSchema.methods.recordQuizGeneration = function() {
  this.progress.quizzesGenerated += 1;
  return this.save();
};

/**
 * Record quiz completion - QuizAttempt Model compatibility
 */
studentSchema.methods.recordQuizCompletion = function(score, pointsEarned = 0, timeSpent = 0, subject = null) {
  const totalQuizzes = this.progress.quizzesCompleted;
  const currentAvg = this.progress.averageScore;
  
  // Update quiz stats
  this.progress.quizzesCompleted += 1;
  this.progress.averageScore = Math.round(((currentAvg * totalQuizzes) + score) / (totalQuizzes + 1));
  
  // Update best score
  if (score > this.progress.bestScore) {
    this.progress.bestScore = score;
  }
  
  // Add points - Transaction Model compatibility
  this.addPoints(pointsEarned);
  
  // Update time tracking
  if (timeSpent > 0) {
    this.analytics.totalStudyTime += Math.round(timeSpent / 60); // Convert to minutes
    const totalTime = this.analytics.averageQuizTime * totalQuizzes + (timeSpent / 60);
    this.analytics.averageQuizTime = Math.round(totalTime / (totalQuizzes + 1));
  }
  
  // Update subject performance if provided
  if (subject) {
    this.updateSubjectPerformance(subject, score);
  }
  
  // Update study streak
  this.updateStudyStreak();
  
  return this.save();
};

/**
 * Add points - Transaction Model compatibility
 */
studentSchema.methods.addPoints = function(points) {
  if (points <= 0) return this;
  this.progress.totalPoints += points;
  
  // Check for point-based achievements
  this.checkPointsAchievements();
  
  return this;
};

/**
 * Use points for purchases - Transaction Model compatibility
 */
studentSchema.methods.usePoints = function(points) {
  if (points <= 0) {
    throw new Error('Points must be greater than 0');
  }
  
  if (this.availablePoints < points) {
    throw new Error('Insufficient points');
  }
  
  this.progress.pointsUsed += points;
  return this.save();
};

/**
 * Check if user can afford with points - Course Model compatibility
 */
studentSchema.methods.canAfford = function(pointsCost) {
  return this.availablePoints >= pointsCost;
};

/**
 * Record course interaction - Course Model compatibility
 */
studentSchema.methods.recordCourseView = function() {
  this.progress.coursesViewed += 1;
  return this.save();
};

/**
 * Record course purchase - Course & Transaction Model compatibility
 */
studentSchema.methods.recordCoursePurchase = function() {
  this.progress.coursesPurchased += 1;
  return this.save();
};

/**
 * Update subscription - Subscription Model compatibility
 */
studentSchema.methods.updateSubscription = function(newTier, isActive = true, subscriptionId = null) {
  this.subscription.tier = newTier;
  this.subscription.isActive = isActive;
  if (subscriptionId) {
    this.subscription.subscriptionId = subscriptionId;
  }
  return this.save();
};

/**
 * Update subject performance
 */
studentSchema.methods.updateSubjectPerformance = function(subject, score) {
  let subjectPerf = this.analytics.subjectPerformance.find(s => s.subject === subject);
  
  if (!subjectPerf) {
    subjectPerf = {
      subject,
      averageScore: score,
      attemptsCount: 1,
      lastAttempt: new Date()
    };
    this.analytics.subjectPerformance.push(subjectPerf);
  } else {
    const totalAttempts = subjectPerf.attemptsCount;
    const currentAvg = subjectPerf.averageScore;
    
    subjectPerf.averageScore = Math.round(((currentAvg * totalAttempts) + score) / (totalAttempts + 1));
    subjectPerf.attemptsCount += 1;
    subjectPerf.lastAttempt = new Date();
  }
  
  return this;
};

/**
 * Update study streak
 */
studentSchema.methods.updateStudyStreak = function() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (!this.progress.lastStudyDate) {
    // First study session
    this.progress.studyStreak = 1;
    this.progress.lastStudyDate = today;
  } else {
    const lastStudy = new Date(this.progress.lastStudyDate);
    const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Same day, don't change streak
      return this;
    } else if (daysDiff === 1) {
      // Next day, increment streak
      this.progress.studyStreak += 1;
      this.progress.lastStudyDate = today;
    } else {
      // Streak broken, reset
      this.progress.studyStreak = 1;
      this.progress.lastStudyDate = today;
    }
  }
  
  // Check for streak achievements
  this.checkStreakAchievements();
  
  return this;
};

/**
 * Check for achievements based on points
 */
studentSchema.methods.checkPointsAchievements = function() {
  const points = this.progress.totalPoints;
  const achievements = [];
  
  if (points >= 100 && !this.hasAchievement('first_100_points')) {
    achievements.push({
      type: 'first_100_points',
      description: 'Earned your first 100 points!'
    });
  }
  
  if (points >= 1000 && !this.hasAchievement('points_master')) {
    achievements.push({
      type: 'points_master',
      description: 'Reached 1000 points - you\'re a points master!'
    });
  }
  
  // Add new achievements
  achievements.forEach(achievement => {
    this.analytics.achievements.push(achievement);
  });
  
  return this;
};

/**
 * Check for streak achievements
 */
studentSchema.methods.checkStreakAchievements = function() {
  const streak = this.progress.studyStreak;
  const achievements = [];
  
  if (streak >= 7 && !this.hasAchievement('week_warrior')) {
    achievements.push({
      type: 'week_warrior',
      description: '7-day study streak - you\'re on fire!'
    });
  }
  
  if (streak >= 30 && !this.hasAchievement('month_master')) {
    achievements.push({
      type: 'month_master',
      description: '30-day study streak - incredible dedication!'
    });
  }
  
  // Add new achievements
  achievements.forEach(achievement => {
    this.analytics.achievements.push(achievement);
  });
  
  return this;
};

/**
 * Check if user has specific achievement
 */
studentSchema.methods.hasAchievement = function(achievementType) {
  return this.analytics.achievements.some(a => a.type === achievementType);
};

/**
 * Get user's strengths and weaknesses - QuizAttempt compatibility
 */
studentSchema.methods.getPerformanceAnalysis = function() {
  const subjects = this.analytics.subjectPerformance;
  
  const strengths = subjects.filter(s => s.averageScore >= 80).sort((a, b) => b.averageScore - a.averageScore);
  const weaknesses = subjects.filter(s => s.averageScore < 60).sort((a, b) => a.averageScore - b.averageScore);
  
  return { strengths, weaknesses };
};

// ==========================================
// ENHANCED STATIC METHODS
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
 * Get points leaderboard - Transaction Model compatibility
 */
studentSchema.statics.getPointsLeaderboard = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'progress.totalPoints': -1 })
    .limit(limit)
    .select('name progress.totalPoints progress.averageScore');
};

/**
 * Get comprehensive student statistics
 */
studentSchema.statics.getComprehensiveStats = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$subscription.tier',
        count: { $sum: 1 },
        avgDocuments: { $avg: '$progress.documentsUploaded' },
        avgQuizzes: { $avg: '$progress.quizzesCompleted' },
        avgScore: { $avg: '$progress.averageScore' },
        avgPoints: { $avg: '$progress.totalPoints' },
        totalPoints: { $sum: '$progress.totalPoints' },
        avgStreak: { $avg: '$progress.studyStreak' }
      }
    }
  ]);
};

/**
 * Find students needing engagement (low activity)
 */
studentSchema.statics.findInactiveStudents = function(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    status: 'active',
    $or: [
      { 'progress.lastStudyDate': { $lt: cutoffDate } },
      { 'progress.lastStudyDate': null }
    ]
  });
};

// ==========================================
// ENHANCED QUERY HELPERS
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

studentSchema.query.withActiveStreak = function() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return this.where({ 'progress.lastStudyDate': { $gte: yesterday } });
};

studentSchema.query.highPerformers = function(minScore = 80) {
  return this.where({ 'progress.averageScore': { $gte: minScore } });
};

studentSchema.query.byPointsRange = function(min, max) {
  return this.where({ 
    'progress.totalPoints': { $gte: min, $lte: max } 
  });
};

// ==========================================
// CREATE DISCRIMINATOR MODEL
// ==========================================

const Student = BaseUser.discriminator('student', studentSchema);

export default Student;