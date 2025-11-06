/**
 * User Service
 * @module services/user
 * @description Core business logic for user operations, profile management, and statistics
 */

import { Student } from '#models/users/index.js';
import Document from '#models/document/Document.js';
import Quiz from '#models/quiz/Quiz.js';
import QuizAttempt from '#models/quiz/QuizAttempt.js';
import { HttpError } from '#exceptions/index.js';

/**
 * Get user profile information
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    console.log(`👤 Getting profile for user: ${userId}`);

    // Use findById with specific field selection to avoid security conflicts
    const user = await Student.findById(userId, {
      email: 1,
      name: 1,
      avatar: 1,
      preferences: 1,
      verification: 1,
      lastLoginAt: 1,
      lastActiveAt: 1,
      status: 1,
      metadata: 1,
      academic: 1,
      subscription: 1,
      progress: 1,
      learningPreferences: 1,
      analytics: 1,
      createdAt: 1,
      updatedAt: 1,
      userType: 1
    }).lean();

    if (!user) {
      throw HttpError.notFound('User not found', {
        code: 'USER_NOT_FOUND',
        context: { userId }
      });
    }

    // Calculate derived fields
    const profileData = {
      ...user,
      availablePoints: (user.progress?.totalPoints || 0) - (user.progress?.pointsUsed || 0),
      completionRate: (user.progress?.quizzesGenerated || 0) > 0 
        ? Math.round(((user.progress?.quizzesCompleted || 0) / user.progress.quizzesGenerated) * 100) 
        : 0,
      hasActiveStreak: checkActiveStreak(user.progress?.lastStudyDate),
      memberSince: user.createdAt,
      isPremium: (user.subscription?.tier || 'free') !== 'free' && (user.subscription?.isActive || false),
      fullName: `${user.name?.first || ''} ${user.name?.last || ''}`.trim()
    };

    console.log(`✅ Profile retrieved successfully`);
    return {
      success: true,
      profile: profileData
    };

  } catch (error) {
    console.error('❌ Get user profile error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Failed to get user profile: ${error.message}`);
  }
};

/**
 * Update user profile information
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  try {
    console.log(`📝 Updating profile for user: ${userId}`);

    const user = await Student.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found');
    }

    // Define allowed fields for profile updates
    const allowedUpdates = {
      'name.first': true,
      'name.last': true,
      'avatar.url': true
    };

    const updates = {};
    
    // Process updates safely
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates[key]) {
        if (key.includes('.')) {
          // Handle nested fields
          const [parent, child] = key.split('.');
          if (!updates[parent]) updates[parent] = {};
          updates[parent][child] = updateData[key];
        } else {
          updates[key] = updateData[key];
        }
      }
    });

    // Apply updates
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        // Handle nested objects
        Object.assign(user[key], updates[key]);
      } else {
        user[key] = updates[key];
      }
    });

    await user.save();

    console.log(`✅ Profile updated successfully`);
    return {
      success: true,
      profile: user.toJSON()
    };

  } catch (error) {
    console.error('❌ Update user profile error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Failed to update profile: ${error.message}`);
  }
};

/**
 * Update user preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - Preferences to update
 * @returns {Promise<Object>} Updated preferences
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    console.log(`⚙️ Updating preferences for user: ${userId}`);

    const user = await Student.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found');
    }

    // Update preferences safely
    if (preferences.timezone) user.preferences.timezone = preferences.timezone;
    if (preferences.language) user.preferences.language = preferences.language;
    if (preferences.theme) user.preferences.theme = preferences.theme;
    
    if (preferences.notifications) {
      Object.assign(user.preferences.notifications, preferences.notifications);
    }

    if (preferences.learningPreferences) {
      Object.assign(user.learningPreferences, preferences.learningPreferences);
    }

    await user.save();

    console.log(`✅ Preferences updated successfully`);
    return {
      success: true,
      preferences: {
        ...user.preferences.toJSON(),
        learningPreferences: user.learningPreferences.toJSON()
      }
    };

  } catch (error) {
    console.error('❌ Update preferences error:', error);
    throw HttpError.internalServerError(`Failed to update preferences: ${error.message}`);
  }
};

/**
 * Update academic information
 * @param {string} userId - User ID
 * @param {Object} academicData - Academic information to update
 * @returns {Promise<Object>} Updated academic info
 */
export const updateAcademicInfo = async (userId, academicData) => {
  try {
    console.log(`🎓 Updating academic info for user: ${userId}`);

    const user = await Student.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found');
    }

    // Update academic information
    if (academicData.level) user.academic.level = academicData.level;
    if (academicData.institution) user.academic.institution = academicData.institution;
    if (academicData.fieldOfStudy) user.academic.fieldOfStudy = academicData.fieldOfStudy;

    await user.save();

    console.log(`✅ Academic info updated successfully`);
    return {
      success: true,
      academic: user.academic.toJSON()
    };

  } catch (error) {
    console.error('❌ Update academic info error:', error);
    throw HttpError.internalServerError(`Failed to update academic info: ${error.message}`);
  }
};

/**
 * Get comprehensive user statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
export const getUserStatistics = async (userId) => {
  try {
    console.log(`📊 Getting statistics for user: ${userId}`);

    // Get user data
    const user = await Student.findById(userId).lean();
    if (!user) {
      throw HttpError.notFound('User not found');
    }

    // Get document stats
    const documentStats = await getDocumentStatistics(userId);
    
    // Get quiz stats  
    const quizStats = await getQuizStatistics(userId);

    // Calculate overall stats
    const overallStats = {
      totalStudyTime: user.analytics.totalStudyTime,
      currentStreak: user.progress.studyStreak,
      longestStreak: user.progress.studyStreak, // You can track this separately
      totalPoints: user.progress.totalPoints,
      availablePoints: user.progress.totalPoints - user.progress.pointsUsed,
      memberSince: user.createdAt,
      lastActive: user.lastActiveAt,
      achievements: user.analytics.achievements,
      performanceLevel: calculateOverallPerformance(user.progress.averageScore)
    };

    // Combine all stats
    const comprehensiveStats = {
      overall: overallStats,
      documents: documentStats,
      quizzes: quizStats,
      progress: user.progress,
      academic: user.academic,
      subscription: {
        tier: user.subscription.tier,
        isActive: user.subscription.isActive,
        isPremium: user.subscription.tier !== 'free' && user.subscription.isActive
      }
    };

    console.log(`✅ Statistics retrieved successfully`);
    return {
      success: true,
      stats: comprehensiveStats
    };

  } catch (error) {
    console.error('❌ Get user statistics error:', error);
    throw HttpError.internalServerError(`Failed to get user statistics: ${error.message}`);
  }
};

/**
 * Get user points balance and information
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Points balance data
 */
export const getUserPointsBalance = async (userId) => {
  try {
    console.log(`💰 Getting points balance for user: ${userId}`);

    const user = await Student.findById(userId, {
      'progress.totalPoints': 1,
      'progress.pointsUsed': 1,
      'progress.quizzesCompleted': 1
    }).lean();

    if (!user) {
      throw HttpError.notFound('User not found');
    }

    const totalPoints = user.progress?.totalPoints || 0;
    const usedPoints = user.progress?.pointsUsed || 0;
    const availablePoints = totalPoints - usedPoints;
    const quizzesCompleted = user.progress?.quizzesCompleted || 0;
    
    const pointsData = {
      totalEarned: totalPoints,
      totalUsed: usedPoints,
      available: availablePoints,
      // Calculate earning rate (points per quiz)
      averageEarningRate: quizzesCompleted > 0 
        ? Math.round(totalPoints / quizzesCompleted)
        : 0
    };

    console.log(`✅ Points balance retrieved: ${availablePoints} available`);
    return {
      success: true,
      points: pointsData
    };

  } catch (error) {
    console.error('❌ Get points balance error:', error);
    throw HttpError.internalServerError(`Failed to get points balance: ${error.message}`);
  }
};

/**
 * Get document statistics for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Document statistics
 */
export const getDocumentStatistics = async (userId) => {
  try {
    const stats = await Document.getUserStats(userId);
    const recentDocuments = await Document.findByUser(userId, { 
      limit: 5, 
      sort: { createdAt: -1 } 
    });

    return {
      total: stats[0]?.totalDocuments || 0,
      processed: stats[0]?.processedDocuments || 0,
      failed: stats[0]?.failedDocuments || 0,
      totalViews: stats[0]?.totalViews || 0,
      totalQuizzesGenerated: stats[0]?.totalQuizzes || 0,
      categoriesUsed: stats[0]?.categoriesUsed || [],
      recent: recentDocuments.map(doc => ({
        id: doc._id,
        title: doc.title,
        status: doc.status,
        createdAt: doc.createdAt
      }))
    };

  } catch (error) {
    console.error('❌ Get document statistics error:', error);
    return {
      total: 0,
      processed: 0,
      failed: 0,
      totalViews: 0,
      totalQuizzesGenerated: 0,
      categoriesUsed: [],
      recent: []
    };
  }
};

/**
 * Get quiz statistics for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Quiz statistics
 */
export const getQuizStatistics = async (userId) => {
  try {
    // Get quiz stats
    const quizStats = await Quiz.getUserStats(userId);
    
    // Get quiz attempt stats
    const attemptStats = await QuizAttempt.getUserStats(userId);
    
    // Get recent attempts
    const recentAttempts = await QuizAttempt.findByUser(userId, { 
      limit: 5,
      includeAbandoned: false 
    });

    return {
      totalQuizzes: quizStats[0]?.totalQuizzes || 0,
      totalAttempts: attemptStats[0]?.totalAttempts || 0,
      averageScore: attemptStats[0]?.averageScore || 0,
      bestScore: attemptStats[0]?.bestScore || 0,
      totalPointsEarned: attemptStats[0]?.totalPointsEarned || 0,
      averageTime: attemptStats[0]?.averageTimeSpent || 0,
      completionRate: attemptStats[0]?.completionRate || 0,
      recent: recentAttempts.map(attempt => ({
        id: attempt._id,
        quizTitle: attempt.quizId?.title || 'Unknown Quiz',
        score: attempt.percentage,
        pointsEarned: attempt.pointsEarned,
        completedAt: attempt.completedAt
      }))
    };

  } catch (error) {
    console.error('❌ Get quiz statistics error:', error);
    return {
      totalQuizzes: 0,
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      totalPointsEarned: 0,
      averageTime: 0,
      completionRate: 0,
      recent: []
    };
  }
};

/**
 * Manage focus timer session
 * @param {string} userId - User ID
 * @param {Object} timerData - Timer action and data
 * @returns {Promise<Object>} Timer session result
 */
export const manageFocusTimer = async (userId, timerData) => {
  try {
    console.log(`⏱️ Managing focus timer for user: ${userId}`);

    const { action, duration, sessionId } = timerData;

    const user = await Student.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found');
    }

    let result = {};

    switch (action) {
      case 'start':
        // Start new focus session
        const newSessionId = `session_${Date.now()}`;
        result = {
          action: 'started',
          sessionId: newSessionId,
          duration: duration || 1500000, // Default 25 minutes in milliseconds
          startTime: new Date(),
          endTime: new Date(Date.now() + (duration || 1500000))
        };
        break;

      case 'complete':
        // Complete focus session and award points
        const focusPoints = Math.floor((duration || 1500000) / 60000); // 1 point per minute
        user.progress.totalPoints += focusPoints;
        user.analytics.totalStudyTime += Math.floor((duration || 1500000) / 60000);
        user.updateStudyStreak();
        
        await user.save();
        
        result = {
          action: 'completed',
          sessionId: sessionId,
          duration: duration,
          pointsEarned: focusPoints,
          totalStudyTime: user.analytics.totalStudyTime
        };
        break;

      case 'cancel':
        result = {
          action: 'cancelled',
          sessionId: sessionId
        };
        break;

      default:
        throw HttpError.badRequest('Invalid timer action');
    }

    console.log(`✅ Focus timer ${action} successful`);
    return {
      success: true,
      timer: result
    };

  } catch (error) {
    console.error('❌ Focus timer error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Failed to manage focus timer: ${error.message}`);
  }
};

/**
 * Helper: Check if user has active study streak
 * @param {Date} lastStudyDate - Last study date
 * @returns {boolean} Whether streak is active
 */
const checkActiveStreak = (lastStudyDate) => {
  if (!lastStudyDate) return false;
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return lastStudyDate >= yesterday;
};

/**
 * Helper: Calculate overall performance level
 * @param {number} averageScore - Average quiz score
 * @returns {string} Performance level
 */
const calculateOverallPerformance = (averageScore) => {
  if (averageScore >= 90) return 'excellent';
  if (averageScore >= 80) return 'good';
  if (averageScore >= 70) return 'average';
  if (averageScore >= 60) return 'below_average';
  return 'needs_improvement';
};

// Default export
export default {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  updateAcademicInfo,
  getUserStatistics,
  getUserPointsBalance,
  getDocumentStatistics,
  getQuizStatistics,
  manageFocusTimer
};