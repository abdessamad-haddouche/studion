/**
 * Quiz Controller - COMPLETE WITH QUIZ ATTEMPT FUNCTIONALITY
 * @module controllers/quiz
 * @description Handles quiz generation, attempts, and results
 */

import { HttpError } from '#exceptions/index.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

// Quiz Services
import {
  generateQuizFromDocument as generateQuizService,
  getUserQuizzes,
  getQuizById as getQuizByIdService
} from '#services/quiz.service.js';

// Quiz Attempt Services
import {
  startQuizAttempt as startQuizAttemptService,
  submitQuizAnswer as submitQuizAnswerService,
  completeQuizAttempt as completeQuizAttemptService,
  getQuizAttemptResults as getQuizAttemptResultsService
} from '#services/quizAttempt.service.js';

// ==========================================
// QUIZ MANAGEMENT CONTROLLERS
// ==========================================

/**
 * @route POST /api/quizzes/generate
 * @description Generate a quiz from a document using AI
 */
export const generateQuiz = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      documentId,
      questionCount = 5,
      difficulty = 'medium',
      title = null,
      categories = ['general']
    } = req.body;

    // Validate required fields
    if (!documentId) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Document ID is required',
        code: 'MISSING_DOCUMENT_ID'
      });
    }

    // Validate question count
    const validCounts = [5, 10, 15, 20];
    if (!validCounts.includes(parseInt(questionCount))) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Question count must be 5, 10, 15, or 20',
        code: 'INVALID_QUESTION_COUNT'
      });
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Difficulty must be easy, medium, or hard',
        code: 'INVALID_DIFFICULTY'
      });
    }

    console.log(`🎯 Generating ${difficulty} quiz with ${questionCount} questions for document ${documentId}`);

    // Generate quiz using service
    const result = await generateQuizService(documentId, userId, {
      questionCount: parseInt(questionCount),
      difficulty,
      title,
      categories
    });

    res.status(HTTP_STATUS_CODES.CREATED).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz: {
        id: result.quiz._id,
        title: result.quiz.title,
        description: result.quiz.description,
        questions: result.quiz.questions,
        difficulty: result.quiz.difficulty,
        category: result.quiz.category,
        estimatedTime: result.quiz.estimatedTime,
        passingScore: result.quiz.passingScore,
        status: result.quiz.status,
        createdAt: result.quiz.createdAt
      },
      metadata: {
        questionsGenerated: result.metadata.questionsGenerated,
        documentTitle: result.metadata.documentTitle,
        aiModel: result.metadata.aiMetadata.model,
        tokensUsed: result.metadata.aiMetadata.tokensUsed,
        processingTime: result.metadata.aiMetadata.processingTime
      }
    });

  } catch (error) {
    console.error('❌ Generate quiz controller error:', error);
    next(error);
  }
};

/**
 * @route GET /api/quizzes
 * @description Get all user quizzes with optional filtering
 */
export const getAllQuizzes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      status = 'active',
      difficulty,
      category,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log(`📚 Getting quizzes for user ${userId}`);

    const result = await getUserQuizzes(userId, {
      status,
      difficulty,
      category,
      page,
      limit,
      sortBy,
      sortOrder
    });

    // Calculate total count for pagination (simplified)
    const totalQuizzes = result.quizzes.length;

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      count: result.count,
      total: totalQuizzes,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(totalQuizzes / result.limit),
      quizzes: result.quizzes.map(quiz => ({
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        category: quiz.category,
        questionCount: quiz.questions.length,
        estimatedTime: quiz.estimatedTime,
        status: quiz.status,
        analytics: quiz.analytics,
        createdAt: quiz.createdAt,
        document: quiz.documentId ? {
          id: quiz.documentId._id,
          title: quiz.documentId.title
        } : null
      }))
    });

  } catch (error) {
    console.error('❌ Get all quizzes controller error:', error);
    next(error);
  }
};

/**
 * @route GET /api/quizzes/:id
 * @description Get a specific quiz by ID
 */
export const getQuizById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const quizId = req.params.id;

    console.log(`🔍 Getting quiz ${quizId} for user ${userId}`);

    const result = await getQuizByIdService(quizId, userId);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      quiz: {
        id: result.quiz._id,
        title: result.quiz.title,
        description: result.quiz.description,
        questions: result.quiz.questions,
        difficulty: result.quiz.difficulty,
        category: result.quiz.category,
        estimatedTime: result.quiz.estimatedTime,
        passingScore: result.quiz.passingScore,
        status: result.quiz.status,
        analytics: result.quiz.analytics,
        aiMetadata: result.quiz.aiMetadata,
        createdAt: result.quiz.createdAt,
        document: result.quiz.documentId ? {
          id: result.quiz.documentId._id,
          title: result.quiz.documentId.title
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Get quiz by ID controller error:', error);
    next(error);
  }
};

// ==========================================
// QUIZ ATTEMPT CONTROLLERS
// ==========================================

/**
 * @route POST /api/quizzes/:id/attempt
 * @description Start a new quiz attempt
 * @body {string} deviceType - Device type (mobile, tablet, desktop) (optional)
 */
export const startQuizAttempt = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const quizId = req.params.id;
    const { deviceType = 'unknown' } = req.body;

    console.log(`🎯 Starting quiz attempt for quiz ${quizId} by user ${userId}`);

    // Prepare metadata
    const metadata = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceType: deviceType
    };

    const result = await startQuizAttemptService(quizId, userId, metadata);

    res.status(HTTP_STATUS_CODES.CREATED).json({
      success: true,
      message: result.isResuming ? 'Resumed existing quiz attempt' : 'Quiz attempt started successfully',
      attempt: result.attempt,
      quiz: {
        id: result.quiz.id,
        title: result.quiz.title,
        difficulty: result.quiz.difficulty,
        estimatedTime: result.quiz.estimatedTime,
        passingScore: result.quiz.passingScore,
        totalQuestions: result.quiz.questions.length,
        // Don't send all questions at once for security - send them one by one
        currentQuestion: result.quiz.questions[0] || null
      },
      isResuming: result.isResuming
    });

  } catch (error) {
    console.error('❌ Start quiz attempt controller error:', error);
    next(error);
  }
};

/**
 * @route PUT /api/quizzes/:id/attempt/:attemptId
 * @description Submit answer for a quiz question
 * @body {number} questionIndex - Index of the question being answered (required)
 * @body {*} userAnswer - User's answer (string for multiple choice, boolean for true/false, etc.)
 * @body {number} timeSpent - Time spent on this question in milliseconds (optional)
 */
export const submitQuizAnswer = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id: quizId, attemptId } = req.params;
    const { questionIndex, userAnswer, timeSpent = 0 } = req.body;

    // Validate required fields
    if (questionIndex === undefined || userAnswer === undefined) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Question index and user answer are required',
        code: 'MISSING_ANSWER_DATA'
      });
    }

    console.log(`📝 Submitting answer for attempt ${attemptId}, question ${questionIndex}`);

    const result = await submitQuizAnswerService(attemptId, userId, {
      questionIndex: parseInt(questionIndex),
      userAnswer,
      timeSpent: parseInt(timeSpent) || 0
    });

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Answer submitted successfully',
      result: {
        questionIndex: result.questionIndex,
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
        pointsEarned: result.pointsEarned,
        currentScore: result.currentScore,
        progress: result.progress
      }
    });

  } catch (error) {
    console.error('❌ Submit quiz answer controller error:', error);
    next(error);
  }
};

/**
 * @route POST /api/quizzes/:id/attempt/:attemptId/complete
 * @description Complete a quiz attempt and get final results
 */
export const completeQuizAttempt = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { attemptId } = req.params;

    console.log(`🏁 Completing quiz attempt ${attemptId}`);

    const result = await completeQuizAttemptService(attemptId, userId);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Quiz completed successfully',
      results: result.results,
      quiz: result.quiz
    });

  } catch (error) {
    console.error('❌ Complete quiz attempt controller error:', error);
    next(error);
  }
};

/**
 * @route GET /api/quizzes/:id/attempt/:attemptId/results
 * @description Get results for a completed quiz attempt
 */
export const getQuizAttemptResults = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { attemptId } = req.params;

    console.log(`📊 Getting results for attempt ${attemptId}`);

    const result = await getQuizAttemptResultsService(attemptId, userId);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      results: result.results
    });

  } catch (error) {
    console.error('❌ Get quiz attempt results controller error:', error);
    next(error);
  }
};

// ==========================================
// ANALYTICS CONTROLLERS (PLACEHOLDER)
// ==========================================

export const getUserQuizStats = async (req, res, next) => {
  try {
    res.status(HTTP_STATUS_CODES.NOT_IMPLEMENTED).json({
      success: false,
      message: 'Quiz statistics functionality coming soon',
      feature: 'getUserQuizStats'
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizAttemptHistory = async (req, res, next) => {
  try {
    res.status(HTTP_STATUS_CODES.NOT_IMPLEMENTED).json({
      success: false,
      message: 'Quiz history functionality coming soon',
      feature: 'getQuizAttemptHistory'
    });
  } catch (error) {
    next(error);
  }
};