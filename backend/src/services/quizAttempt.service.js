/**
 * Quiz Attempt Service - COMPLETE IMPLEMENTATION
 * @module services/quizAttempt
 * @description Business logic for quiz attempts, answers, and scoring
 */

import Quiz from '#models/quiz/Quiz.js';
import QuizAttempt from '#models/quiz/QuizAttempt.js';
import { HttpError } from '#exceptions/index.js';
import { calculatePointsEarned } from '#constants/models/quiz/index.js';

/**
 * Start a new quiz attempt
 * @param {string} quizId - Quiz ID to attempt
 * @param {string} userId - User ID starting the attempt
 * @param {Object} metadata - Additional metadata (device, userAgent, etc.)
 * @returns {Promise<Object>} Created quiz attempt object
 */
export const startQuizAttempt = async (quizId, userId, metadata = {}) => {
  try {
    console.log(`🎯 Starting quiz attempt for quiz ${quizId} by user ${userId}`);

    // 1. GET AND VALIDATE QUIZ
    const quiz = await Quiz.findOne({
      _id: quizId,
      userId, // Ensure user owns the quiz
      status: 'active',
      deletedAt: null
    });
    
    if (!quiz) {
      throw HttpError.notFound('Quiz not found or not available', {
        code: 'QUIZ_NOT_FOUND',
        context: { quizId, userId }
      });
    }

    // 2. CHECK FOR EXISTING IN-PROGRESS ATTEMPT
    const existingAttempt = await QuizAttempt.findOne({
      quizId: quizId,
      userId: userId,
      status: 'in_progress'
    });

    if (existingAttempt) {
      console.log(`♻️ Returning existing in-progress attempt: ${existingAttempt._id}`);
      return {
        success: true,
        attempt: existingAttempt,
        quiz: {
          id: quiz._id,
          title: quiz.title,
          questions: quiz.questions,
          difficulty: quiz.difficulty,
          estimatedTime: quiz.estimatedTime,
          passingScore: quiz.passingScore
        },
        isResuming: true
      };
    }

    // 3. CREATE NEW QUIZ ATTEMPT
    const quizAttempt = new QuizAttempt({
      userId: userId,
      quizId: quizId,
      status: 'in_progress',
      startedAt: new Date(),
      metadata: {
        userAgent: metadata.userAgent || null,
        ipAddress: metadata.ipAddress || null,
        deviceType: metadata.deviceType || 'unknown',
        pauseCount: 0,
        hintsUsed: 0
      }
    });

    await quizAttempt.save();
    console.log(`✅ Quiz attempt created: ${quizAttempt._id}`);

    return {
      success: true,
      attempt: {
        id: quizAttempt._id,
        status: quizAttempt.status,
        startedAt: quizAttempt.startedAt,
        timeSpent: quizAttempt.timeSpent,
        answers: quizAttempt.answers
      },
      quiz: {
        id: quiz._id,
        title: quiz.title,
        questions: quiz.questions, // Full questions for the attempt
        difficulty: quiz.difficulty,
        estimatedTime: quiz.estimatedTime,
        passingScore: quiz.passingScore
      },
      isResuming: false
    };

  } catch (error) {
    console.error('❌ Start quiz attempt error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Failed to start quiz attempt: ${error.message}`);
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
    const { questionIndex, userAnswer, timeSpent = 0 } = answerData;

    console.log(`📝 Submitting answer for attempt ${attemptId}, question ${questionIndex}`);

    // 1. GET QUIZ ATTEMPT
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId: userId,
      status: 'in_progress'
    }).populate('quizId');

    if (!attempt) {
      throw HttpError.notFound('Quiz attempt not found or not in progress', {
        code: 'ATTEMPT_NOT_FOUND'
      });
    }

    // 2. GET QUIZ AND VALIDATE QUESTION
    const quiz = attempt.quizId;
    if (!quiz || !quiz.questions || questionIndex >= quiz.questions.length) {
      throw HttpError.badRequest('Invalid question index', {
        code: 'INVALID_QUESTION_INDEX'
      });
    }

    const question = quiz.questions[questionIndex];
    
    // 3. EVALUATE ANSWER
    const isCorrect = evaluateAnswer(question, userAnswer);
    const pointsEarned = isCorrect ? 10 : 0; // Base points per question

    // 4. CREATE QUESTION ID (for tracking)
    const questionId = `q_${questionIndex}`; // Simple ID based on index

    // 5. SUBMIT ANSWER USING MODEL METHOD
    await attempt.submitAnswer(questionId, userAnswer, isCorrect, pointsEarned, timeSpent);

    console.log(`✅ Answer submitted: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);

    return {
      success: true,
      questionIndex: questionIndex,
      isCorrect: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      pointsEarned: pointsEarned,
      currentScore: attempt.score,
      progress: {
        answered: attempt.answers.length,
        total: quiz.questions.length,
        percentage: Math.round((attempt.answers.length / quiz.questions.length) * 100)
      }
    };

  } catch (error) {
    console.error('❌ Submit answer error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Failed to submit answer: ${error.message}`);
  }
};

/**
 * Complete a quiz attempt and calculate final score
 * @param {string} attemptId - Quiz attempt ID
 * @param {string} userId - User ID for validation
 * @returns {Promise<Object>} Completed attempt with final results
 */
export const completeQuizAttempt = async (attemptId, userId) => {
  try {
    console.log(`🏁 Completing quiz attempt ${attemptId}`);

    // 1. GET QUIZ ATTEMPT WITH QUIZ DATA
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId: userId,
      status: 'in_progress'
    }).populate('quizId');

    if (!attempt) {
      throw HttpError.notFound('Quiz attempt not found or already completed', {
        code: 'ATTEMPT_NOT_FOUND'
      });
    }

    const quiz = attempt.quizId;

    // 2. COMPLETE THE ATTEMPT (using model method)
    await attempt.complete(quiz);

    // 3. ANALYZE PERFORMANCE
    await attempt.analyzePerformance(quiz);

    // 4. GENERATE FEEDBACK
    await attempt.generateFeedback();

    // 5. UPDATE QUIZ ANALYTICS
    await quiz.updateAnalytics(attempt.percentage, attempt.timeSpent / 60000); // Convert to minutes

    console.log(`✅ Quiz attempt completed: ${attempt.percentage}% (${attempt.score}/${quiz.questions.length})`);

    return {
      success: true,
      results: {
        attemptId: attempt._id,
        score: attempt.score,
        percentage: attempt.percentage,
        pointsEarned: attempt.pointsEarned,
        timeSpent: attempt.timeSpent,
        timeSpentFormatted: attempt.timeSpentFormatted,
        performanceLevel: attempt.performanceLevel,
        hasPassed: attempt.percentage >= quiz.passingScore,
        feedback: attempt.feedback,
        strengths: attempt.strengths,
        weaknesses: attempt.weaknesses,
        completedAt: attempt.completedAt
      },
      quiz: {
        id: quiz._id,
        title: quiz.title,
        difficulty: quiz.difficulty,
        passingScore: quiz.passingScore,
        totalQuestions: quiz.questions.length
      }
    };

  } catch (error) {
    console.error('❌ Complete quiz attempt error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Failed to complete quiz attempt: ${error.message}`);
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
    console.log(`📊 Getting results for attempt ${attemptId}`);

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId: userId,
      status: 'completed'
    }).populate('quizId', 'title difficulty passingScore questions');

    if (!attempt) {
      throw HttpError.notFound('Quiz attempt results not found', {
        code: 'RESULTS_NOT_FOUND'
      });
    }

    const quiz = attempt.quizId;

    return {
      success: true,
      results: {
        attemptId: attempt._id,
        quiz: {
          id: quiz._id,
          title: quiz.title,
          difficulty: quiz.difficulty,
          passingScore: quiz.passingScore
        },
        score: attempt.score,
        percentage: attempt.percentage,
        pointsEarned: attempt.pointsEarned,
        timeSpent: attempt.timeSpent,
        timeSpentFormatted: attempt.timeSpentFormatted,
        performanceLevel: attempt.performanceLevel,
        hasPassed: attempt.percentage >= quiz.passingScore,
        answers: attempt.answers.map((answer, index) => ({
          questionIndex: index,
          userAnswer: answer.userAnswer,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          timeSpent: answer.timeSpent,
          question: quiz.questions[index]
        })),
        feedback: attempt.feedback,
        strengths: attempt.strengths,
        weaknesses: attempt.weaknesses,
        completedAt: attempt.completedAt,
        startedAt: attempt.startedAt
      }
    };

  } catch (error) {
    console.error('❌ Get quiz results error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Failed to get quiz results: ${error.message}`);
  }
};

/**
 * Evaluate if an answer is correct
 * @param {Object} question - Question object
 * @param {*} userAnswer - User's submitted answer
 * @returns {boolean} Whether the answer is correct
 */
const evaluateAnswer = (question, userAnswer) => {
  try {
    // For multiple choice questions
    if (question.options && Array.isArray(question.options)) {
      // User answer could be the option text or index
      if (typeof userAnswer === 'string') {
        return userAnswer === question.correctAnswer;
      }
      
      // If user answer is an index
      if (typeof userAnswer === 'number') {
        return question.options[userAnswer] === question.correctAnswer;
      }
    }
    
    // For other question types, do string comparison
    return String(userAnswer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim();
    
  } catch (error) {
    console.error('❌ Error evaluating answer:', error);
    return false;
  }
};

export default {
  startQuizAttempt,
  submitQuizAnswer,
  completeQuizAttempt,
  getQuizAttemptResults
};