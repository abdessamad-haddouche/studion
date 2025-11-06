/**
 * Quiz Attempt Controller - PROPERLY USING SERVICE LAYER
 * @module controllers/quizAttempt
 * @description Handles quiz attempt operations - start, submit answers, complete attempts
 */

import QuizAttempt from '#models/quizAttempt/QuizAttempt.js';
import Quiz from '#models/quiz/Quiz.js';
import { HttpError } from '#exceptions/index.js';
import { getQuizCollectionStats } from '#services/quizCollection.service.js';
import quizAttemptService from '#services/quizAttempt.service.js';

/**
 * @desc Start a new quiz attempt
 * @route POST /api/quizzes/:id/attempt
 * @access Private
 */
export const startQuizAttempt = async (req, res, next) => {
  try {
    const { id: quizId } = req.params;
    const userId = req.user.userId;
    const sessionInfo = {
      userAgent: req.get('User-Agent') || 'unknown',
      ipAddress: req.ip || 'unknown',
      deviceType: detectDeviceType(req.get('User-Agent'))
    };

    // 🎯 CALL SERVICE LAYER
    const result = await quizAttemptService.startQuizAttempt(quizId, userId, sessionInfo);

    if (result.isExisting) {
      return res.status(200).json({
        success: true,
        message: 'Existing attempt found',
        attempt: result.attempt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quiz attempt started successfully',
      attempt: result.attempt,
      quiz: result.quiz
    });

  } catch (error) {
    console.error('❌ Start quiz attempt controller error:', error);
    next(error);
  }
};

/**
 * @desc Submit answer for a quiz question
 * @route PUT /api/quizzes/:id/attempt/:attemptId
 * @access Private
 */
export const submitQuizAnswer = async (req, res, next) => {
  try {
    const { id: quizId, attemptId } = req.params;
    const { questionId, answer, timeSpent = 0 } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!questionId || answer === undefined) {
      throw HttpError.badRequest('Question ID and answer are required');
    }

    // 🎯 CALL SERVICE LAYER
    const result = await quizAttemptService.submitQuizAnswer(attemptId, userId, {
      questionId,
      answer,
      timeSpent
    });

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      result: result.result
    });

  } catch (error) {
    console.error('❌ Submit quiz answer controller error:', error);
    next(error);
  }
};

/**
 * @desc Complete a quiz attempt
 * @route POST /api/quizzes/:id/attempt/:attemptId/complete
 * @access Private
 */
export const completeQuizAttempt = async (req, res, next) => {
  try {
    const { id: quizId, attemptId } = req.params;
    const userId = req.user.userId;

    // 🎯 CALL SERVICE LAYER WITH METADATA
    const result = await quizAttemptService.completeQuizAttempt(attemptId, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      source: 'web'
    });

    res.status(200).json({
      success: true,
      message: 'Quiz attempt completed successfully',
      results: result.results
    });

  } catch (error) {
    console.error('❌ Complete quiz attempt controller error:', error);
    next(error);
  }
};

/**
 * @desc Get detailed results for a completed quiz attempt
 * @route GET /api/quizzes/:id/attempt/:attemptId/results
 * @access Private
 */
export const getQuizAttemptResults = async (req, res, next) => {
  try {
    const { id: quizId, attemptId } = req.params;
    const userId = req.user.userId;

    // 🎯 CALL SERVICE LAYER
    const result = await quizAttemptService.getQuizAttemptResults(attemptId, userId);

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Get quiz results controller error:', error);
    next(error);
  }
};

/**
 * @desc Get user's quiz performance statistics
 * @route GET /api/quizzes/stats
 * @access Private
 */
export const getUserQuizStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    console.log(`📈 Getting quiz stats for user: ${userId}`);

    // Get attempt statistics
    const attemptStats = await QuizAttempt.getUserStats(userId);
    
    // Get quiz creation statistics
    const quizStats = await Quiz.getUserStats(userId);

    const stats = {
      attempts: attemptStats[0] || {
        totalAttempts: 0,
        averageScore: 0,
        totalPointsEarned: 0,
        passRate: 0,
        averageTimeMinutes: 0
      },
      quizzes: quizStats[0] || {
        totalQuizzes: 0,
        activeQuizzes: 0,
        totalAttempts: 0,
        avgDifficulty: 0,
        categoriesUsed: []
      }
    };

    res.status(200).json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Get user quiz stats error:', error);
    next(error);
  }
};

/**
 * @desc Get user's quiz attempt history
 * @route GET /api/quizzes/history
 * @access Private
 */
export const getQuizAttemptHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { 
      page = 1, 
      limit = 20, 
      status,
      documentId 
    } = req.query;

    console.log(`📋 Getting quiz history for user: ${userId}`);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attempts = await QuizAttempt.findByUser(userId, {
      status,
      documentId,
      limit: parseInt(limit),
      skip: skip,
      sort: { startedAt: -1 }
    });

    // Get total count for pagination
    const totalQuery = { userId, deletedAt: null };
    if (status) totalQuery.status = status;
    if (documentId) totalQuery.documentId = documentId;
    
    const total = await QuizAttempt.countDocuments(totalQuery);

    res.status(200).json({
      success: true,
      attempts: attempts.map(attempt => ({
        id: attempt._id,
        quiz: {
          id: attempt.quizId?._id,
          title: attempt.quizId?.title || attempt.quizSnapshot.title,
          difficulty: attempt.quizSnapshot.difficulty
        },
        document: {
          id: attempt.documentId?._id,
          title: attempt.documentId?.title
        },
        status: attempt.status,
        score: attempt.score,
        percentage: attempt.percentage,
        pointsEarned: attempt.pointsEarned,
        passed: attempt.passed,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        durationMinutes: attempt.durationMinutes
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('❌ Get quiz history error:', error);
    next(error);
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Detect device type from User-Agent
 */
const detectDeviceType = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  
  if (ua.includes('desktop') || ua.includes('windows') || ua.includes('mac')) {
    return 'desktop';
  }
  
  return 'unknown';
};

export default {
  startQuizAttempt,
  submitQuizAnswer,
  completeQuizAttempt,
  getQuizAttemptResults,
  getUserQuizStats,
  getQuizAttemptHistory
};