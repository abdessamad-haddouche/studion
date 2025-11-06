/**
 * Quiz Attempt Service - COMPLETE IMPLEMENTATION
 * @module services/quizAttempt
 * @description Business logic for quiz attempts, answers, and scoring
 */

import Quiz from '#models/quiz/Quiz.js';
import QuizAttempt from '#models/quiz/QuizAttempt.js';
import { HttpError } from '#exceptions/index.js';
import { calculatePointsEarned } from '#constants/models/quiz/index.js';
import transactionService from '#services/transaction.service.js';
import userProgressService from '#services/userProgress.service.js';


/**
 * Start a new quiz attempt
 * @param {string} quizId - Quiz ID to attempt
 * @param {string} userId - User ID starting the attempt
 * @param {Object} sessionInfo - Session information (userAgent, IP, etc.)
 * @returns {Promise<Object>} Created quiz attempt object
 */
export const startQuizAttempt = async (quizId, userId, sessionInfo = {}) => {
  try {
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
      return {
        success: true,
        attempt: {
          id: existingAttempt._id,
          quizId: existingAttempt.quizId,
          status: existingAttempt.status,
          startedAt: existingAttempt.startedAt,
          currentQuestionIndex: existingAttempt.currentQuestionIndex,
          progress: existingAttempt.progressPercentage,
          timeSpent: existingAttempt.timeSpent
        },
        isExisting: true
      };
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

    return {
      success: true,
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
        }))
      },
      isExisting: false
    };

  } catch (error) {
    console.error('❌ Start quiz attempt error:', error);
    throw error.name === 'HttpError' ? error : HttpError.internalServerError(`Failed to start quiz attempt: ${error.message}`);
  }
};

/**
 * Submit an answer for a question
 * @param {string} attemptId - Quiz attempt ID
 * @param {string} userId - User ID for validation
 * @param {Object} answerData - Answer submission data
 * @returns {Promise<Object>} Updated attempt with feedback
 */
export const submitQuizAnswer = async (attemptId, userId, answerData) => {
  try {
    const { questionId, answer, timeSpent = 0 } = answerData;

    console.log(`📝 Submitting answer for attempt: ${attemptId}, question: ${questionId}`);

    // Find the attempt
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId: userId,
      status: 'in_progress',
      deletedAt: null
    });

    if (!attempt) {
      throw HttpError.notFound('Active quiz attempt not found');
    }

    // Get the quiz to find the correct answer
    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      throw HttpError.notFound('Quiz not found');
    }

    // Find the question
    const question = quiz.questions.find(q => (q.id || quiz.questions.indexOf(q) + 1) === parseInt(questionId));
    if (!question) {
      throw HttpError.notFound('Question not found');
    }

    // 🎯 CRITICAL: Submit the answer using MODEL METHOD
    await attempt.submitAnswer(parseInt(questionId), answer, question.correctAnswer, parseInt(timeSpent));

    console.log(`✅ Answer submitted for question ${questionId} - Answers count: ${attempt.answers.length}`);

    return {
      success: true,
      result: {
        questionId: questionId,
        isCorrect: attempt.validateAnswer(answer, question.correctAnswer),
        currentProgress: attempt.progressPercentage,
        questionsAnswered: attempt.answers.length,
        totalQuestions: attempt.quizSnapshot.totalQuestions,
        timeSpent: attempt.timeSpent
      }
    };

  } catch (error) {
    console.error('❌ Submit quiz answer service error:', error);
    throw error.name === 'HttpError' ? error : HttpError.internalServerError(`Failed to submit answer: ${error.message}`);
  }
};

/**
 * Complete a quiz attempt and calculate final score WITH POINTS
 * @param {string} attemptId - Quiz attempt ID
 * @param {string} userId - User ID for validation
 * @param {Object} metadata - Request metadata (IP, userAgent, etc.)
 * @returns {Promise<Object>} Completed attempt with final results AND points
 */
export const completeQuizAttempt = async (attemptId, userId, metadata = {}) => {
  try {
    console.log(`🏁 Completing quiz attempt: ${attemptId}`);

    // Find the attempt
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId: userId,
      status: 'in_progress',
      deletedAt: null
    });

    if (!attempt) {
      throw HttpError.notFound('Active quiz attempt not found');
    }

    // 🎯 CRITICAL: Complete the attempt using MODEL METHOD
    await attempt.complete();

    // Update quiz analytics
    const quiz = await Quiz.findById(attempt.quizId);
    if (quiz && typeof quiz.updateAnalytics === 'function') {
      await quiz.updateAnalytics(attempt.percentage, attempt.durationMinutes);
    }

    console.log(`✅ Quiz attempt completed with ${attempt.percentage}% score`);

    // Get detailed results
    const results = attempt.getResults();

    // 🎯 AWARD POINTS AUTOMATICALLY
    let pointsEarned = 0;
    let pointsTransaction = null;
    
    try {
      console.log(`💰 Awarding points for quiz completion...`);
      
      pointsTransaction = await transactionService.awardQuizCompletionPoints({
        userId: userId,
        quizId: attempt.quizId,
        score: attempt.percentage,
        difficulty: quiz?.difficulty || 'medium',
        timeSpent: attempt.timeSpent || 0,
        metadata: {
          attemptId: attempt._id,
          source: 'quiz_completion',
          ...metadata
        }
      });
      
      pointsEarned = pointsTransaction.pointsEarned;
      console.log(`🎉 Points awarded: ${pointsEarned} points!`);
      
    } catch (pointsError) {
      console.error(`⚠️ Points award failed (non-critical):`, pointsError);
      // Don't fail the quiz completion if points fail
    }

    // 🎯 ADD THIS SECTION RIGHT HERE:
    try {
      console.log(`📊 Updating user progress...`);
      
      await userProgressService.updateQuizProgress(userId, {
        score: attempt.score,
        percentage: attempt.percentage,
        pointsEarned: pointsEarned,
        timeSpent: attempt.timeSpent
      });
      
      console.log(`✅ User progress updated successfully`);
      
    } catch (progressError) {
      console.error(`⚠️ User progress update failed (non-critical):`, progressError);
    }

    // Add points to results
    results.pointsEarned = pointsEarned;
    results.transaction = pointsTransaction ? {
      id: pointsTransaction.transaction.id,
      pointsEarned: pointsTransaction.pointsEarned,
      newTotalPoints: pointsTransaction.newTotalPoints
    } : null;

    return {
      success: true,
      results: results
    };

  } catch (error) {
    console.error('❌ Complete quiz attempt service error:', error);
    throw error.name === 'HttpError' ? error : HttpError.internalServerError(`Failed to complete quiz attempt: ${error.message}`);
  }
};

/**
 * Get quiz attempt results
 * @param {string} attemptId - Quiz attempt ID
 * @param {string} userId - User ID for validation
 * @returns {Promise<Object>} Quiz attempt results
 */
export const getQuizAttemptResults = async (attemptId, userId) => {
  try {
    console.log(`📊 Getting results for attempt: ${attemptId}`);

    // Find the completed attempt
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId: userId,
      status: 'completed',
      deletedAt: null
    }).populate('quizId', 'title difficulty questions');

    if (!attempt) {
      throw HttpError.notFound('Completed quiz attempt not found');
    }

    // Get detailed results with question explanations
    const quiz = await Quiz.findById(attempt.quizId);
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

    return {
      success: true,
      results: results
    };

  } catch (error) {
    console.error('❌ Get quiz results service error:', error);
    throw error.name === 'HttpError' ? error : HttpError.internalServerError(`Failed to get quiz results: ${error.message}`);
  }
};

export default {
  startQuizAttempt,
  submitQuizAnswer,
  completeQuizAttempt,
  getQuizAttemptResults
};