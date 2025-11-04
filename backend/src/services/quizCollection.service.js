/**
 * Quiz Collection Service
 * @module services/quizCollection
 * @description Service for parsing, storing, and managing comprehensive quiz collections
 */
import mongoose from 'mongoose';
import Quiz from '#models/quiz/Quiz.js';
import { HttpError } from '#exceptions/index.js';
import { QUIZ_GENERATION_CONFIG } from './ai.service.js';

/**
 * 🔥 STORE COMPREHENSIVE QUIZ COLLECTION
 * Parse AI-generated quiz collection and store as individual Quiz documents
 * @param {Object} quizCollection - Parsed quiz collection from AI
 * @param {string} documentId - Document ID the quizzes belong to
 * @param {string} userId - User ID who owns the quizzes
 * @returns {Promise<Object>} Storage result with created quiz IDs
 */
export const storeQuizCollection = async (quizCollection, documentId, userId) => {
  try {
    console.log(`💾 Storing quiz collection for document: ${documentId}`);
    console.log(`📊 Quizzes to store: ${quizCollection.quizzes.length}`);
    
    if (!quizCollection.quizzes || quizCollection.quizzes.length === 0) {
      throw HttpError.badRequest('No quizzes found in collection', {
        code: 'EMPTY_QUIZ_COLLECTION'
      });
    }
    
    const storedQuizzes = [];
    const failedQuizzes = [];
    
    // Store each quiz as an individual Quiz document
    for (const [index, quizData] of quizCollection.quizzes.entries()) {
      try {
        console.log(`💾 Storing quiz ${index + 1}/${quizCollection.quizzes.length}: ${quizData.title}`);
        
        // Create Quiz document
        const quiz = new Quiz({
          documentId,
          userId,
          title: quizData.title,
          description: `Auto-generated ${quizData.difficulty} ${quizData.type.replace('_', ' ')} quiz`,
          questions: quizData.questions,
          difficulty: quizData.difficulty,
          category: 'comprehension', // Default category
          estimatedTime: quizData.estimatedTime || Math.ceil(quizData.questions.length * 1.5),
          status: 'active',
          
          // Add metadata for tracking
          aiMetadata: {
            model: 'deepseek-chat',
            generationType: 'comprehensive_collection',
            originalQuizId: quizData.quizId,
            questionType: quizData.type,
            generatedAt: new Date()
          }
        });
        
        // Save to database
        const savedQuiz = await quiz.save();
        storedQuizzes.push({
          quizId: savedQuiz._id,
          originalQuizId: quizData.quizId,
          title: quizData.title,
          difficulty: quizData.difficulty,
          type: quizData.type,
          questionCount: quizData.questions.length
        });
        
        console.log(`✅ Stored quiz: ${savedQuiz._id} (${quizData.questions.length} questions)`);
        
      } catch (error) {
        console.error(`❌ Failed to store quiz ${index + 1}:`, error.message);
        failedQuizzes.push({
          originalQuizId: quizData.quizId || `quiz_${index + 1}`,
          title: quizData.title || 'Unknown Quiz',
          error: error.message
        });
      }
    }
    
    console.log(`✅ Quiz collection storage completed`);
    console.log(`📊 Successfully stored: ${storedQuizzes.length} quizzes`);
    console.log(`❌ Failed to store: ${failedQuizzes.length} quizzes`);
    
    return {
      success: true,
      storedQuizzes,
      failedQuizzes,
      summary: {
        totalQuizzes: quizCollection.quizzes.length,
        successfullyStored: storedQuizzes.length,
        failed: failedQuizzes.length,
        successRate: Math.round((storedQuizzes.length / quizCollection.quizzes.length) * 100)
      }
    };
    
  } catch (error) {
    console.error('❌ Quiz collection storage error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Failed to store quiz collection: ${error.message}`, {
      code: 'QUIZ_COLLECTION_STORAGE_ERROR',
      context: { originalError: error.message }
    });
  }
};

/**
 * 🎯 GET AVAILABLE QUIZZES FOR USER
 * Get quizzes by difficulty and type with optional filtering
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Available quizzes
 */
export const getAvailableQuizzes = async (documentId, userId, filters = {}) => {
  try {
    const {
      difficulty,
      questionType,
      excludeUsed = true,
      limit = 10
    } = filters;
    
    console.log(`🔍 Getting available quizzes for document: ${documentId}`);
    console.log(`🎯 Filters:`, { difficulty, questionType, excludeUsed, limit });
    
    // Build query
    const query = {
      documentId,
      userId,
      status: 'active',
      deletedAt: null
    };
    
    // Add difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Add question type filter (stored in aiMetadata)
    if (questionType) {
      query['aiMetadata.questionType'] = questionType;
    }
    
    // Exclude used quizzes if requested
    if (excludeUsed) {
      query['analytics.attemptCount'] = { $eq: 0 };
    }
    
    // Execute query
    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title difficulty estimatedTime analytics.attemptCount aiMetadata.questionType questions');
    
    console.log(`✅ Found ${quizzes.length} available quizzes`);
    
    // Transform for frontend
    const transformedQuizzes = quizzes.map(quiz => ({
      quizId: quiz._id,
      title: quiz.title,
      difficulty: quiz.difficulty,
      questionType: quiz.aiMetadata?.questionType || 'unknown',
      questionCount: quiz.questions.length,
      estimatedTime: quiz.estimatedTime,
      attemptCount: quiz.analytics?.attemptCount || 0,
      isUsed: (quiz.analytics?.attemptCount || 0) > 0
    }));
    
    return transformedQuizzes;
    
  } catch (error) {
    console.error('❌ Error getting available quizzes:', error);
    throw HttpError.internalServerError(`Failed to get available quizzes: ${error.message}`, {
      code: 'GET_QUIZZES_ERROR'
    });
  }
};

/**
 * 🎲 SELECT RANDOM QUIZ FOR USER
 * Select a random unused quiz matching the specified criteria
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @param {Object} criteria - Selection criteria
 * @returns {Promise<Object>} Selected quiz
 */
export const selectRandomQuiz = async (documentId, userId, criteria = {}) => {
  try {
    const {
      difficulty = 'medium',
      questionType,
      excludeUsed = true
    } = criteria;
    
    console.log(`🎲 Selecting random quiz for document: ${documentId}`);
    console.log(`🎯 Criteria:`, { difficulty, questionType, excludeUsed });
    
    // Get available quizzes
    const availableQuizzes = await getAvailableQuizzes(documentId, userId, {
      difficulty,
      questionType,
      excludeUsed,
      limit: 100 // Get more options for better randomization
    });
    
    if (availableQuizzes.length === 0) {
      throw HttpError.notFound('No available quizzes found matching criteria', {
        code: 'NO_AVAILABLE_QUIZZES',
        context: { criteria }
      });
    }
    
    // Select random quiz
    const randomIndex = Math.floor(Math.random() * availableQuizzes.length);
    const selectedQuizInfo = availableQuizzes[randomIndex];
    
    // Get full quiz data
    const fullQuiz = await Quiz.findById(selectedQuizInfo.quizId);
    
    if (!fullQuiz) {
      throw HttpError.notFound('Selected quiz not found', {
        code: 'QUIZ_NOT_FOUND'
      });
    }
    
    console.log(`✅ Selected random quiz: ${fullQuiz.title} (${fullQuiz.questions.length} questions)`);
    
    return fullQuiz;
    
  } catch (error) {
    console.error('❌ Error selecting random quiz:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Failed to select random quiz: ${error.message}`, {
      code: 'SELECT_QUIZ_ERROR'
    });
  }
};

/**
 * 📊 GET QUIZ COLLECTION STATISTICS
 * Get statistics about stored quizzes for a document
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Quiz collection statistics
 */
export const getQuizCollectionStats = async (documentId, userId) => {
  try {
    console.log(`📊 Getting quiz collection stats for document: ${documentId}`);
    
    const stats = await Quiz.aggregate([
      {
        $match: {
          documentId: new mongoose.Types.ObjectId(documentId),
          userId: new mongoose.Types.ObjectId(userId),
          status: 'active',
          deletedAt: null
        }
      },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalQuestions: { $sum: { $size: '$questions' } },
          byDifficulty: {
            $push: {
              difficulty: '$difficulty',
              questionType: '$aiMetadata.questionType',
              attemptCount: { $ifNull: ['$analytics.attemptCount', 0] }
            }
          },
          averageEstimatedTime: { $avg: '$estimatedTime' },
          totalAttempts: { $sum: { $ifNull: ['$analytics.attemptCount', 0] } }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return {
        totalQuizzes: 0,
        totalQuestions: 0,
        breakdown: {},
        averageEstimatedTime: 0,
        totalAttempts: 0,
        usageRate: 0
      };
    }
    
    const result = stats[0];
    
    // Calculate breakdown by difficulty and type
    const breakdown = {};
    for (const item of result.byDifficulty) {
      if (!breakdown[item.difficulty]) {
        breakdown[item.difficulty] = {};
      }
      
      const type = item.questionType || 'unknown';
      if (!breakdown[item.difficulty][type]) {
        breakdown[item.difficulty][type] = {
          count: 0,
          attempts: 0
        };
      }
      
      breakdown[item.difficulty][type].count++;
      breakdown[item.difficulty][type].attempts += item.attemptCount;
    }
    
    // Calculate usage rate
    const usedQuizzes = result.byDifficulty.filter(item => item.attemptCount > 0).length;
    const usageRate = result.totalQuizzes > 0 ? Math.round((usedQuizzes / result.totalQuizzes) * 100) : 0;
    
    console.log(`✅ Quiz collection stats calculated: ${result.totalQuizzes} quizzes, ${usageRate}% usage rate`);
    
    return {
      totalQuizzes: result.totalQuizzes,
      totalQuestions: result.totalQuestions,
      breakdown,
      averageEstimatedTime: Math.round(result.averageEstimatedTime || 0),
      totalAttempts: result.totalAttempts,
      usageRate
    };
    
  } catch (error) {
    console.error('❌ Error getting quiz collection stats:', error);
    throw HttpError.internalServerError(`Failed to get quiz collection stats: ${error.message}`, {
      code: 'QUIZ_STATS_ERROR'
    });
  }
};

/**
 * 🗑️ CLEANUP UNUSED QUIZZES
 * Remove quizzes that haven't been used for a certain period
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @param {Object} options - Cleanup options
 * @returns {Promise<Object>} Cleanup result
 */
export const cleanupUnusedQuizzes = async (documentId, userId, options = {}) => {
  try {
    const {
      maxUnusedAge = 30, // days
      keepMinimumPerType = 1 // Keep at least 1 quiz per type
    } = options;
    
    console.log(`🗑️ Cleaning up unused quizzes for document: ${documentId}`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxUnusedAge);
    
    // Find unused quizzes older than cutoff
    const unusedQuizzes = await Quiz.find({
      documentId,
      userId,
      status: 'active',
      'analytics.attemptCount': { $eq: 0 },
      createdAt: { $lt: cutoffDate },
      deletedAt: null
    });
    
    console.log(`🔍 Found ${unusedQuizzes.length} unused quizzes older than ${maxUnusedAge} days`);
    
    if (unusedQuizzes.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        message: 'No unused quizzes found for cleanup'
      };
    }
    
    // Group by difficulty and type to ensure we keep minimum per type
    const groupedQuizzes = {};
    for (const quiz of unusedQuizzes) {
      const key = `${quiz.difficulty}_${quiz.aiMetadata?.questionType || 'unknown'}`;
      if (!groupedQuizzes[key]) {
        groupedQuizzes[key] = [];
      }
      groupedQuizzes[key].push(quiz);
    }
    
    // Select quizzes to delete (keeping minimum per type)
    const quizzesToDelete = [];
    for (const [key, quizzes] of Object.entries(groupedQuizzes)) {
      if (quizzes.length > keepMinimumPerType) {
        // Sort by creation date and keep the newest ones
        quizzes.sort((a, b) => b.createdAt - a.createdAt);
        const toDelete = quizzes.slice(keepMinimumPerType);
        quizzesToDelete.push(...toDelete);
      }
    }
    
    if (quizzesToDelete.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        message: 'All unused quizzes are within minimum retention requirements'
      };
    }
    
    // Soft delete the selected quizzes
    const deletePromises = quizzesToDelete.map(quiz => quiz.softDelete());
    await Promise.all(deletePromises);
    
    console.log(`✅ Cleanup completed: ${quizzesToDelete.length} quizzes deleted`);
    
    return {
      success: true,
      deletedCount: quizzesToDelete.length,
      message: `Successfully cleaned up ${quizzesToDelete.length} unused quizzes`
    };
    
  } catch (error) {
    console.error('❌ Error cleaning up unused quizzes:', error);
    throw HttpError.internalServerError(`Failed to cleanup unused quizzes: ${error.message}`, {
      code: 'QUIZ_CLEANUP_ERROR'
    });
  }
};

export default {
  storeQuizCollection,
  getAvailableQuizzes,
  selectRandomQuiz,
  getQuizCollectionStats,
  cleanupUnusedQuizzes
};