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
 * Parse AI-generated quiz collection and store as individual Quiz documents
 * @param {Object} quizCollection - Parsed quiz collection from AI
 * @param {string} documentId - Document ID the quizzes belong to
 * @param {string} userId - User ID who owns the quizzes
 * @returns {Promise<Object>} Storage result with created quiz IDs
 */
export const storeQuizCollection = async (quizCollection, documentId, userId, language = 'en') => {
  try {
    console.log(`💾 Storing quiz collection for document: ${documentId}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`📊 Quizzes to store: ${quizCollection.quizzes.length}`);
    
    if (!quizCollection || !quizCollection.quizzes || quizCollection.quizzes.length === 0) {
      throw new Error('No quizzes provided to store');
    }
    
    const storedQuizzes = [];
    const failedQuizzes = [];
    
    // Store each quiz individually
    for (let i = 0; i < quizCollection.quizzes.length; i++) {
      const quizData = quizCollection.quizzes[i];
      
      try {
        console.log(`💾 Storing quiz ${i + 1}/${quizCollection.quizzes.length}: ${quizData.title}`);
        
        const quiz = new Quiz({
          documentId: new mongoose.Types.ObjectId(documentId),
          userId: new mongoose.Types.ObjectId(userId),
          
          // Basic info
          title: quizData.title || `Generated Quiz ${i + 1}`,
          description: quizData.description || `AI-generated quiz from document`,
          
          // Questions - store as simple mixed array
          questions: quizData.questions || [],
          
          // Classification
          difficulty: quizData.difficulty || 'mixed',
          category: 'comprehension',
          
          // Settings
          estimatedTime: quizData.estimatedTime || Math.ceil((quizData.questions?.length || 10) * 1.5),
          passingScore: 70,
          
          // Status
          status: 'active',
          
          // AI metadata - CRITICAL for quiz selection
          aiMetadata: {
            model: 'deepseek-coder',
            questionType: determineQuestionType(quizData),
            type: determineQuestionType(quizData),
            language: language,
            generationType: 'comprehensive_collection',
            originalQuizId: quizData.quizId,
            generatedAt: new Date(),
            tokensUsed: 0,
            confidence: 0.85
          }
        });
        
        // Save to database
        const savedQuiz = await quiz.save();
        
        console.log(`✅ Stored quiz: ${savedQuiz._id} (${savedQuiz.questions.length} questions)`);
        
        storedQuizzes.push({
          quizId: savedQuiz._id,
          title: savedQuiz.title,
          questionCount: savedQuiz.questions.length,
          difficulty: savedQuiz.difficulty,
          type: quizData.type
        });
        
      } catch (error) {
        console.error(`❌ Failed to store quiz ${i + 1}:`, error.message);
        
        failedQuizzes.push({
          quizData: quizData.title || `Quiz ${i + 1}`,
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
        totalAttempted: quizCollection.quizzes.length,
        successfullyStored: storedQuizzes.length,
        failed: failedQuizzes.length
      }
    };
    
  } catch (error) {
    console.error(`❌ Quiz collection storage failed:`, error);
    
    return {
      success: false,
      error: error.message,
      storedQuizzes: [],
      failedQuizzes: [],
      summary: {
        totalAttempted: 0,
        successfullyStored: 0,
        failed: 0
      }
    };
  }
};

/**
 * Determine question type from quiz data
 */
const determineQuestionType = (quizData) => {
  const title = (quizData.title || '').toLowerCase();
  
  if (title.includes('multiple choice') || title.includes('multiple-choice')) {
    return 'multiple_choice';
  }
  
  if (title.includes('true false') || title.includes('true/false') || title.includes('true-false')) {
    return 'true_false';
  }
  
  if (title.includes('fill') || title.includes('blank')) {
    return 'fill_blank';
  }
  
  // Fallback: check quiz type or default
  return quizData.type || 'multiple_choice';
};

/**
 * 🎯 GET AVAILABLE QUIZZES FOR USER
 * Get quizzes by difficulty and type with optional filtering
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Available quizzes
 */
export const getAvailableQuizzes = async (documentId, userId, options = {}) => {
  try {
    const {
      difficulty,
      questionType,
      excludeUsed = false,
      limit = 20
    } = options;
    
    console.log(`🔍 Getting available quizzes for document: ${documentId}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`🎯 Filters:`, JSON.stringify({
      difficulty,
      questionType,
      excludeUsed,
      limit
    }, null, 2));
    
    // Build query - FIXED user ID usage
    const query = {
      documentId: new mongoose.Types.ObjectId(documentId),
      userId: new mongoose.Types.ObjectId(userId), // ✅ USE EXACT USER ID
      status: 'active',
      deletedAt: null
    };
    
    // Add difficulty filter
    if (difficulty && difficulty !== 'mixed') {
      query.difficulty = difficulty;
    }
    
    // Add question type filter - check multiple fields
    if (questionType) {
      query.$or = [
        { 'aiMetadata.questionType': questionType },
        { 'aiMetadata.type': questionType },
        { 'type': questionType }
      ];
    }
    
    console.log(`🔍 DEBUG MongoDB Query:`, JSON.stringify(query, null, 2));
    
    // Execute query
    const quizzes = await Quiz.find(query)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Found ${quizzes.length} available quizzes`);
    
    // Transform to simple format
    const availableQuizzes = quizzes.map(quiz => ({
      quizId: quiz._id,
      title: quiz.title,
      difficulty: quiz.difficulty,
      questionType: quiz.aiMetadata?.questionType || quiz.aiMetadata?.type || 'mixed',
      questionCount: quiz.questions?.length || 0,
      estimatedTime: quiz.estimatedTime,
      createdAt: quiz.createdAt
    }));
    
    return availableQuizzes;
    
  } catch (error) {
    console.error(`❌ Error getting available quizzes:`, error);
    throw error;
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
export const selectRandomQuiz = async (documentId, userId, options = {}) => {
  try {
    console.log(`🎲 Selecting random quiz for document: ${documentId}`);
    console.log(`🎯 Criteria:`, options);
    
    // Get available quizzes
    const availableQuizzes = await getAvailableQuizzes(documentId, userId, {
      ...options,
      limit: 100
    });
    
    if (availableQuizzes.length === 0) {
      throw HttpError.notFound('No available quizzes found matching criteria', {
        code: 'NO_AVAILABLE_QUIZZES',
        context: { criteria: options }
      });
    }
    
    // Select random quiz
    const randomIndex = Math.floor(Math.random() * availableQuizzes.length);
    const selectedQuizInfo = availableQuizzes[randomIndex];
    
    // Get full quiz data
    const fullQuiz = await Quiz.findById(selectedQuizInfo.quizId);
    
    if (!fullQuiz) {
      throw HttpError.notFound('Selected quiz not found');
    }
    
    console.log(`✅ Selected quiz: ${fullQuiz.title} (${fullQuiz.questions.length} questions)`);
    
    return fullQuiz;
    
  } catch (error) {
    console.error(`❌ Error selecting random quiz:`, error);
    throw error;
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
    console.log(`👤 User ID: ${userId}`);
    
    const stats = await Quiz.aggregate([
      {
        $match: {
          documentId: new mongoose.Types.ObjectId(documentId),
          userId: new mongoose.Types.ObjectId(userId), // ✅ USE EXACT USER ID
          deletedAt: null
        }
      },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalQuestions: { $sum: { $size: '$questions' } },
          difficulties: { $addToSet: '$difficulty' },
          questionTypes: { $addToSet: '$aiMetadata.questionType' },
          avgEstimatedTime: { $avg: '$estimatedTime' }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalQuizzes: 0,
      totalQuestions: 0,
      difficulties: [],
      questionTypes: [],
      avgEstimatedTime: 0
    };
    
    console.log(`📊 Stats result:`, result);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Error getting quiz collection stats:`, error);
    throw error;
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