/**
 * Quiz Attempt Controller
 * @module controllers/quizAttempt
 * @description Handles quiz attempt operations - start, submit answers, complete attempts
 */

import QuizAttempt from '#models/quizAttempt/QuizAttempt.js';
import Quiz from '#models/quiz/Quiz.js';
import { HttpError } from '#exceptions/index.js';
import { getQuizCollectionStats } from '#services/quizCollection.service.js';

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

    console.log(`🚀 Starting quiz attempt for user: ${userId}, quiz: ${quizId}`);

    // Check if quiz exists and user has access
    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: userId,
      status: 'active',
      deletedAt: null
    });

    if (!quiz) {
      throw HttpError.notFound('Quiz not found or not accessible');
    }

    // Check for existing active attempt
    const existingAttempt = await QuizAttempt.findOne({
      quizId: quizId,
      userId: userId,
      status: 'in_progress',
      deletedAt: null
    });

    if (existingAttempt) {
      console.log(`📋 Returning existing active attempt: ${existingAttempt._id}`);
      return res.status(200).json({
        success: true,
        message: 'Existing attempt found',
        attempt: {
          id: existingAttempt._id,
          quizId: existingAttempt.quizId,
          status: existingAttempt.status,
          startedAt: existingAttempt.startedAt,
          currentQuestionIndex: existingAttempt.currentQuestionIndex,
          progress: existingAttempt.progressPercentage,
          timeSpent: existingAttempt.timeSpent
        }
      });
    }

    // Create quiz snapshot for consistency
    const quizSnapshot = {
      title: quiz.title,
      difficulty: quiz.difficulty,
      questionType: quiz.aiMetadata?.questionType || 'multiple_choice',
      totalQuestions: quiz.questions.length,
      estimatedTime: quiz.estimatedTime
    };

    // Create new attempt
    const attempt = new QuizAttempt({
      quizId: quizId,
      userId: userId,
      documentId: quiz.documentId,
      quizSnapshot: quizSnapshot,
      sessionInfo: sessionInfo,
      startedAt: new Date()
    });

    const savedAttempt = await attempt.save();

    console.log(`✅ Quiz attempt created: ${savedAttempt._id}`);

    res.status(201).json({
      success: true,
      message: 'Quiz attempt started successfully',
      attempt: {
        id: savedAttempt._id,
        quizId: savedAttempt.quizId,
        status: savedAttempt.status,
        startedAt: savedAttempt.startedAt,
        quizSnapshot: savedAttempt.quizSnapshot,
        currentQuestionIndex: savedAttempt.currentQuestionIndex,
        progress: 0,
        timeSpent: 0
      },
      quiz: {
        id: quiz._id,
        title: quiz.title,
        difficulty: quiz.difficulty,
        questionType: quiz.aiMetadata?.questionType,
        totalQuestions: quiz.questions.length,
        estimatedTime: quiz.estimatedTime,
        questions: quiz.questions.map((q, index) => ({
          id: index + 1,
          question: q.question,
          options: q.options,
          points: q.points || 1
          // Note: Don't send correctAnswer or explanation during attempt
        }))
      }
    });

  } catch (error) {
    console.error('❌ Start quiz attempt error:', error);
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

    console.log(`📝 Submitting answer for attempt: ${attemptId}, question: ${questionId}`);

    // Validate required fields
    if (!questionId || !answer) {
      throw HttpError.badRequest('Question ID and answer are required');
    }

    // Find the attempt
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      quizId: quizId,
      userId: userId,
      status: 'in_progress',
      deletedAt: null
    });

    if (!attempt) {
      throw HttpError.notFound('Active quiz attempt not found');
    }

    // Get the quiz to find the correct answer
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw HttpError.notFound('Quiz not found');
    }

    // Find the question
    const question = quiz.questions.find(q => (q.id || quiz.questions.indexOf(q) + 1) === parseInt(questionId));
    if (!question) {
      throw HttpError.notFound('Question not found');
    }

    // Get correct answer
    const correctAnswer = question.correctAnswer;

    // Submit the answer
    await attempt.submitAnswer(parseInt(questionId), answer, correctAnswer, parseInt(timeSpent));

    console.log(`✅ Answer submitted for question ${questionId}`);

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      result: {
        questionId: questionId,
        isCorrect: attempt.validateAnswer(answer, correctAnswer),
        currentProgress: attempt.progressPercentage,
        questionsAnswered: attempt.answers.length,
        totalQuestions: attempt.quizSnapshot.totalQuestions,
        timeSpent: attempt.timeSpent
      }
    });

  } catch (error) {
    console.error('❌ Submit quiz answer error:', error);
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

    console.log(`🏁 Completing quiz attempt: ${attemptId}`);

    // Find the attempt
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      quizId: quizId,
      userId: userId,
      status: 'in_progress',
      deletedAt: null
    });

    if (!attempt) {
      throw HttpError.notFound('Active quiz attempt not found');
    }

    // Complete the attempt (calculates scores)
    await attempt.complete();

    // Update quiz analytics
    const quiz = await Quiz.findById(quizId);
    if (quiz) {
      await quiz.updateAnalytics(attempt.percentage, attempt.durationMinutes);
    }

    console.log(`✅ Quiz attempt completed with ${attempt.percentage}% score`);

    // Get detailed results
    const results = attempt.getResults();

    res.status(200).json({
      success: true,
      message: 'Quiz attempt completed successfully',
      results: results
    });

  } catch (error) {
    console.error('❌ Complete quiz attempt error:', error);
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

    console.log(`📊 Getting results for attempt: ${attemptId}`);

    // Find the completed attempt
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      quizId: quizId,
      userId: userId,
      status: 'completed',
      deletedAt: null
    }).populate('quizId', 'title difficulty questions');

    if (!attempt) {
      throw HttpError.notFound('Completed quiz attempt not found');
    }

    // Get detailed results with question explanations
    const quiz = await Quiz.findById(quizId);
    const results = attempt.getResults();

    // Add question details and explanations
    if (quiz && quiz.questions) {
      results.questionDetails = attempt.answers.map(answer => {
        const question = quiz.questions.find(q => 
          (q.id || quiz.questions.indexOf(q) + 1) === answer.questionId
        );
        
        return {
          questionId: answer.questionId,
          question: question?.question || 'Question not found',
          userAnswer: answer.userAnswer,
          correctAnswer: answer.correctAnswer,
          isCorrect: answer.isCorrect,
          explanation: question?.explanation || 'No explanation available',
          pointsEarned: answer.pointsEarned,
          timeSpent: answer.timeSpent
        };
      });
    }

    res.status(200).json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('❌ Get quiz results error:', error);
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