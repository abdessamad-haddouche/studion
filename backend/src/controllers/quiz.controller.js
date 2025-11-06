/**
 * Enhanced Quiz Controller - Uses Pre-generated Quiz Collection
 * @module controllers/quiz-enhanced
 * @description Quiz controller that selects from comprehensive pre-generated quiz collection
 */
import mongoose from 'mongoose';
import Quiz from '#models/quiz/Quiz.js';
import QuizAttempt from '#models/quiz/QuizAttempt.js';
import Document from '#models/document/Document.js';
import { HttpError } from '#exceptions/index.js';
import { 
  getAvailableQuizzes, 
  selectRandomQuiz, 
  getQuizCollectionStats
} from '#services/quizCollection.service.js';
import quizAttemptService from '#services/quizAttempt.service.js';


// ==========================================
// ENHANCED QUIZ GENERATION (FROM PRE-GENERATED COLLECTION)
// ==========================================

/**
 * 🎯 Generate quiz from pre-generated collection
 * Select a quiz from the comprehensive collection based on criteria
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const generateQuiz = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      documentId,
      difficulty = 'medium',
      questionType,
      questionCount,
      title
    } = req.body;
    
    console.log(`🎯 Quiz generation request from user: ${userId}`);
    console.log(`📊 Criteria:`, { documentId, difficulty, questionType, questionCount });
    
    // Validate required fields
    if (!documentId) {
      return next(HttpError.badRequest('Document ID is required'));
    }
    
    // Verify document exists and belongs to user
    const document = await Document.findOne({
      _id: documentId,
      userId,  // This should work with userId from JWT
      deletedAt: null
    });
    
    if (!document) {
      return next(HttpError.notFound('Document not found'));
    }
    
    // Check if document has been processed
    if (document.status !== 'completed') {
      return next(HttpError.badRequest('Document must be processed before generating quizzes', {
        code: 'DOCUMENT_NOT_PROCESSED',
        context: { currentStatus: document.status }
      }));
    }
    
    // If questionCount is specified, we need to create a custom quiz
    if (questionCount && questionCount !== 20) {
      return await generateCustomQuiz(req, res, next);
    }
    
    // Select random quiz from pre-generated collection
    const selectedQuiz = await selectRandomQuiz(documentId, userId, {
      difficulty,
      questionType,
      excludeUsed: true
    });
    
    console.log(`✅ Selected quiz: ${selectedQuiz.title} (${selectedQuiz.questions.length} questions)`);
    
    // Update quiz title if custom title provided
    if (title && title !== selectedQuiz.title) {
      selectedQuiz.title = title;
      await selectedQuiz.save();
    }
    
    // Return quiz for user to take
    res.status(200).json({
      success: true,
      message: 'Quiz selected successfully',
      quiz: {
        id: selectedQuiz._id,
        title: selectedQuiz.title,
        description: selectedQuiz.description,
        difficulty: selectedQuiz.difficulty,
        questionType: selectedQuiz.aiMetadata?.questionType,
        questionCount: selectedQuiz.questions.length,
        estimatedTime: selectedQuiz.estimatedTime,
        questions: selectedQuiz.questions.map((q, index) => ({
          id: q.id || index + 1,
          question: q.question,
          options: q.options,
          type: selectedQuiz.aiMetadata?.questionType || 'multiple_choice'
          // Note: Don't include correctAnswer or correctAnswerIndex in response
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    next(error);
  }
};

/**
 * 🎲 Generate custom quiz with specific question count
 * For cases where user wants different number of questions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const generateCustomQuiz = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      documentId,
      difficulty = 'medium',
      questionType,
      questionCount,
      title = 'Custom Quiz'
    } = req.body;
    
    console.log(`🎲 Custom quiz generation request: ${questionCount} questions`);
    
    if (questionCount < 1 || questionCount > 20) {
      return next(HttpError.badRequest('Question count must be between 1 and 20'));
    }
    
    // Get available quizzes of the requested type
    const availableQuizzes = await getAvailableQuizzes(documentId, userId, {
      difficulty,
      questionType,
      excludeUsed: false, // Allow used quizzes for question pool
      limit: 10
    });
    
    if (availableQuizzes.length === 0) {
      return next(HttpError.notFound('No quizzes available for the specified criteria'));
    }
    
    // Collect questions from available quizzes
    const allQuestions = [];
    for (const quizInfo of availableQuizzes) {
      const quiz = await Quiz.findById(quizInfo.quizId);
      if (quiz && quiz.questions) {
        allQuestions.push(...quiz.questions.map(q => ({
          ...q,
          sourceQuizId: quiz._id
        })));
      }
    }
    
    if (allQuestions.length < questionCount) {
      return next(HttpError.badRequest(`Not enough questions available. Found ${allQuestions.length}, requested ${questionCount}`));
    }
    
    // Randomly select questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, questionCount);
    
    // Create new custom quiz
    const customQuiz = new Quiz({
      documentId,
      userId,
      title,
      description: `Custom ${difficulty} quiz with ${questionCount} questions`,
      questions: selectedQuestions.map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
        points: q.points || 1
      })),
      difficulty,
      category: 'comprehension',
      estimatedTime: Math.ceil(questionCount * 1.5),
      status: 'active',
      aiMetadata: {
        model: 'custom-selection',
        generationType: 'custom_question_selection',
        originalQuestionCount: questionCount,
        sourceQuizzes: [...new Set(selectedQuestions.map(q => q.sourceQuizId))],
        generatedAt: new Date()
      }
    });
    
    await customQuiz.save();
    
    console.log(`✅ Custom quiz created: ${customQuiz._id} (${questionCount} questions)`);
    
    res.status(201).json({
      success: true,
      message: 'Custom quiz created successfully',
      quiz: {
        id: customQuiz._id,
        title: customQuiz.title,
        description: customQuiz.description,
        difficulty: customQuiz.difficulty,
        questionCount: customQuiz.questions.length,
        estimatedTime: customQuiz.estimatedTime,
        questions: customQuiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          type: questionType || 'multiple_choice'
          // Note: Don't include correctAnswer in response
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Custom quiz generation error:', error);
    next(error);
  }
};

// ==========================================
// QUIZ LISTING AND MANAGEMENT
// ==========================================

/**
 * Get all quizzes for user with enhanced filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getAllQuizzes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      status = 'active',
      difficulty,
      category,
      documentId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeAttempts = false
    } = req.query;
    
    console.log(`📋 Getting quizzes for user: ${userId}`);
    
    // Build query
    const query = {
      userId,
      status,
      deletedAt: null
    };
    
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (documentId) query.documentId = documentId;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const quizzes = await Quiz.find(query)
      .populate('documentId', 'title')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const totalCount = await Quiz.countDocuments(query);
    
    // Include attempt information if requested
    let enhancedQuizzes = quizzes;
    if (includeAttempts === 'true') {
      enhancedQuizzes = await Promise.all(
        quizzes.map(async (quiz) => {
          const attemptCount = await QuizAttempt.countDocuments({
            quizId: quiz._id,
            userId
          });
          
          const bestAttempt = await QuizAttempt.findOne({
            quizId: quiz._id,
            userId,
            status: 'completed'
          }).sort({ percentage: -1 }).lean();
          
          return {
            ...quiz,
            attemptInfo: {
              attemptCount,
              bestScore: bestAttempt?.percentage || null,
              lastAttempt: bestAttempt?.createdAt || null
            }
          };
        })
      );
    }
    
    res.status(200).json({
      success: true,
      quizzes: enhancedQuizzes.map(quiz => ({
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        category: quiz.category,
        questionCount: quiz.questions?.length || 0,
        estimatedTime: quiz.estimatedTime,
        questionType: quiz.aiMetadata?.questionType,
        document: quiz.documentId ? {
          id: quiz.documentId._id || quiz.documentId,
          title: quiz.documentId.title || 'Unknown Document'
        } : null,
        createdAt: quiz.createdAt,
        attemptInfo: quiz.attemptInfo
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Get all quizzes error:', error);
    next(error);
  }
};

/**
 * Get quiz by ID with questions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getQuizById = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.userId;
    
    console.log(`🔍 Getting quiz: ${quizId} for user: ${userId}`);
    
    const quiz = await Quiz.findOne({
      _id: quizId,
      userId,
      deletedAt: null
    }).populate('documentId', 'title');
    
    if (!quiz) {
      return next(HttpError.notFound('Quiz not found'));
    }
    
    // Get user's attempt history for this quiz
    const attempts = await QuizAttempt.find({
      quizId,
      userId
    }).sort({ createdAt: -1 }).limit(5).lean();
    
    res.status(200).json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        category: quiz.category,
        questionCount: quiz.questions.length,
        estimatedTime: quiz.estimatedTime,
        questionType: quiz.aiMetadata?.questionType,
        document: quiz.documentId ? {
          id: quiz.documentId._id,
          title: quiz.documentId.title
        } : null,
        questions: quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          type: quiz.aiMetadata?.questionType || 'multiple_choice'
          // Note: Don't include answers in response
        })),
        attemptHistory: attempts.map(attempt => ({
          id: attempt._id,
          score: attempt.score,
          percentage: attempt.percentage,
          timeSpent: attempt.timeSpent,
          status: attempt.status,
          completedAt: attempt.completedAt,
          createdAt: attempt.createdAt
        })),
        createdAt: quiz.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Get quiz by ID error:', error);
    next(error);
  }
};

// ==========================================
// QUIZ ATTEMPT MANAGEMENT
// ==========================================

/**
 * Start a new quiz attempt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const startQuizAttempt = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.userId;
    
    console.log(`🚀 Starting quiz attempt: ${quizId} for user: ${userId}`);
    
    // Verify quiz exists and belongs to user
    const quiz = await Quiz.findOne({
      _id: quizId,
      userId,
      status: 'active',
      deletedAt: null
    });
    
    if (!quiz) {
      return next(HttpError.notFound('Quiz not found'));
    }
    
    // Create new quiz attempt
    const attempt = new QuizAttempt({
      userId,
      quizId,
      status: 'in_progress',
      startedAt: new Date(),
      answers: [],
      metadata: {
        userAgent: req.get('User-Agent'),
        deviceType: getDeviceType(req.get('User-Agent'))
      }
    });
    
    await attempt.save();
    
    console.log(`✅ Quiz attempt started: ${attempt._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Quiz attempt started',
      attempt: {
        id: attempt._id,
        quizId: quiz._id,
        startedAt: attempt.startedAt,
        status: attempt.status,
        timeLimit: quiz.estimatedTime * 60 * 1000 // Convert to milliseconds
      }
    });
    
  } catch (error) {
    console.error('❌ Start quiz attempt error:', error);
    next(error);
  }
};

/**
 * Submit answer for a quiz question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const submitQuizAnswer = async (req, res, next) => {
  try {
    const { id: quizId, attemptId } = req.params;
    const userId = req.user.userId;
    const { questionId, answer, timeSpent = 0 } = req.body;
    
    console.log(`📝 Submitting answer: Attempt=${attemptId}, Question=${questionId}, Answer=${answer}`);
    
    // 1. Get quiz attempt
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId,
      quizId,
      status: 'in_progress'
    });
    
    if (!attempt) {
      return next(HttpError.notFound('Quiz attempt not found or already completed'));
    }
    
    // 2. Get quiz to check correct answer
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return next(HttpError.notFound('Quiz not found'));
    }
    
    // 3. Find the question in the quiz
    const question = quiz.questions.find(q => q.id.toString() === questionId.toString());
    if (!question) {
      return next(HttpError.notFound('Question not found'));
    }
    
    console.log(`🔍 Question validation:`, {
      questionId: question.id,
      userAnswer: answer,
      correctAnswer: question.correctAnswer,
      correctAnswerIndex: question.correctAnswerIndex,
      questionType: quiz.aiMetadata?.questionType
    });
    
    // 4. ✅ FIXED ANSWER VALIDATION (handles both formats)
    const isCorrect = validateAnswerCorrectly(question, answer, quiz.aiMetadata?.questionType);
    const pointsEarned = isCorrect ? (question.points || 1) : 0;
    
    console.log(`✅ Answer validation result: isCorrect=${isCorrect}, pointsEarned=${pointsEarned}`);
    
    // 5. Create answer data
    const answerData = {
      questionId: questionId,
      userAnswer: answer,
      isCorrect: isCorrect,
      pointsEarned: pointsEarned,
      timeSpent: timeSpent,
      submittedAt: new Date()
    };
    
    // 6. Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(
      existingAnswer => existingAnswer.questionId.toString() === questionId.toString()
    );
    
    if (existingAnswerIndex !== -1) {
      attempt.answers[existingAnswerIndex] = answerData;
      console.log(`🔄 Updated existing answer for question ${questionId}`);
    } else {
      attempt.answers.push(answerData);
      console.log(`➕ Added new answer for question ${questionId}`);
    }
    
    // 7. 🔧 FIX: Properly calculate and save points
    const totalQuestions = quiz.questions.length;
    const answeredQuestions = attempt.answers.length;
    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    const totalPointsEarned = attempt.answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    const currentPercentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Update attempt with proper values
    attempt.score = correctAnswers;
    attempt.percentage = currentPercentage;
    attempt.pointsEarned = totalPointsEarned;
    attempt.lastAnsweredAt = new Date();
    
    console.log(`📊 Score calculation:`, {
      correctAnswers,
      totalQuestions,
      percentage: currentPercentage,
      totalPointsEarned
    });
    
    // 8. Check if quiz is complete
    const isComplete = answeredQuestions >= totalQuestions;
    
    if (isComplete) {
      attempt.status = 'completed';
      attempt.completedAt = new Date();
      console.log(`🎯 Quiz completed! Final score: ${correctAnswers}/${totalQuestions} (${currentPercentage}%) - ${totalPointsEarned} points`);
      
      // 🎯 ADD USER PROGRESS UPDATE HERE:
      try {
        console.log(`📊 Quiz auto-completed, calling service for progress update...`);
        
        const serviceResult = await quizAttemptService.completeQuizAttempt(attemptId, userId, {
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });
        
        console.log(`✅ Service completed successfully:`, serviceResult);
        
      } catch (serviceError) {
        console.error(`⚠️ Service error during auto-completion:`, serviceError);
      }
    }
    
    // 9. Save the updated attempt
    await attempt.save();
    
    console.log(`💾 Attempt saved with pointsEarned: ${attempt.pointsEarned}`);
    
    // 10. Send response
    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      result: {
        questionId,
        isCorrect,
        pointsEarned,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        currentScore: attempt.score,
        answeredQuestions: attempt.answers.length,
        totalQuestions: totalQuestions,
        totalPointsEarned: attempt.pointsEarned,
        isQuizComplete: isComplete,
        percentage: attempt.percentage
      }
    });
    
  } catch (error) {
    console.error('❌ Submit quiz answer error:', error);
    next(error);
  }
};

/**
 * 🔧 ADD THIS NEW HELPER FUNCTION TO YOUR CONTROLLER:
 * Properly validate if the user's answer is correct
 */
const validateAnswerCorrectly = (question, userAnswer, questionType = 'multiple_choice') => {
  try {
    console.log(`\n🔍 ===== VALIDATION DEBUG START =====`);
    console.log(`🔍 Question ID: ${question.id}`);
    console.log(`🔍 Question Type: ${questionType}`);
    console.log(`🔍 User Answer: "${userAnswer}" (type: ${typeof userAnswer})`);
    
    // 🔍 DEBUG: Check what correctAnswerIndex actually contains
    console.log(`🔍 question.correctAnswerIndex: ${question.correctAnswerIndex}`);
    console.log(`🔍 typeof question.correctAnswerIndex: ${typeof question.correctAnswerIndex}`);
    console.log(`🔍 question.correctAnswerIndex === undefined: ${question.correctAnswerIndex === undefined}`);
    console.log(`🔍 question.correctAnswerIndex === null: ${question.correctAnswerIndex === null}`);
    
    // 🔍 DEBUG: Show the full question object structure
    console.log(`🔍 Full question object keys:`, Object.keys(question));
    console.log(`🔍 Full question object:`, JSON.stringify(question, null, 2));
    
    const correctIndex = question.correctAnswerIndex;
    
    if (correctIndex === undefined || correctIndex === null) {
      console.error(`❌ MISSING correctAnswerIndex for question ${question.id}`);
      console.error(`❌ Question object:`, question);
      return false;
    }
    
    // Convert user answer to integer
    let userIndex;
    
    if (questionType === 'true_false') {
      console.log(`🔍 Processing TRUE/FALSE question`);
      if (typeof userAnswer === 'string') {
        const lower = userAnswer.toLowerCase().trim();
        if (lower === 'true') {
          userIndex = 0;
          console.log(`🔍 Converted "true" to index 0`);
        } else if (lower === 'false') {
          userIndex = 1;
          console.log(`🔍 Converted "false" to index 1`);
        } else {
          userIndex = parseInt(userAnswer);
          console.log(`🔍 Parsed string "${userAnswer}" to integer ${userIndex}`);
        }
      } else {
        userIndex = parseInt(userAnswer);
        console.log(`🔍 Parsed non-string userAnswer to integer ${userIndex}`);
      }
      
      // Validate range for true/false
      if (userIndex < 0 || userIndex > 1) {
        console.error(`❌ True/False index out of range: ${userIndex}`);
        return false;
      }
      
    } else {
      console.log(`🔍 Processing MULTIPLE CHOICE question`);
      userIndex = parseInt(userAnswer);
      console.log(`🔍 Parsed userAnswer "${userAnswer}" to integer ${userIndex}`);
      
      if (isNaN(userIndex)) {
        console.error(`❌ Could not parse userAnswer to valid number: "${userAnswer}"`);
        return false;
      }
      
      // Validate range for multiple choice
      if (userIndex < 0 || userIndex > 3) {
        console.error(`❌ Multiple choice index out of range: ${userIndex}`);
        return false;
      }
    }
    
    // 🔍 DEBUG: Show the comparison values
    console.log(`🔍 Final comparison:`);
    console.log(`🔍   userIndex: ${userIndex} (type: ${typeof userIndex})`);
    console.log(`🔍   correctIndex: ${correctIndex} (type: ${typeof correctIndex})`);
    console.log(`🔍   userIndex === correctIndex: ${userIndex === correctIndex}`);
    console.log(`🔍   userIndex == correctIndex: ${userIndex == correctIndex}`);
    
    // THE ACTUAL COMPARISON
    const isCorrect = userIndex === correctIndex;
    
    console.log(`🎯 VALIDATION RESULT: ${isCorrect}`);
    
    if (question.options && question.options.length > 0) {
      console.log(`🔍 User selected option: "${question.options[userIndex] || 'INVALID INDEX'}"`);
      console.log(`🔍 Correct option: "${question.options[correctIndex] || 'INVALID INDEX'}"`);
    }
    
    console.log(`🔍 ===== VALIDATION DEBUG END =====\n`);
    
    return isCorrect;
    
  } catch (error) {
    console.error(`❌ VALIDATION ERROR:`, error);
    console.error(`❌ Error stack:`, error.stack);
    return false;
  }
};

/**
 * Get all quizzes for a specific document
 */
export const getAllQuizzesForDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;
    const { difficulty, questionType, excludeUsed = false, limit = 20 } = req.query;
    
    const quizzes = await getAvailableQuizzes(documentId, userId, {
      difficulty,
      questionType,
      excludeUsed: excludeUsed === 'true',
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      success: true,
      quizzes,
      total: quizzes.length
    });
    
  } catch (error) {
    console.error('❌ Get document quizzes error:', error);
    next(error);
  }
};

/**
 * Get quiz statistics for a document
 */
export const getDocumentQuizStats = async (req, res, next) => {
  try {

    const { documentId } = req.params;
    const userId = req.user.userId;
    
    const stats = await getQuizCollectionStats(documentId, userId);
    
    res.status(200).json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Get document quiz stats error:', error);
    next(error);
  }
};

/**
 * Select a random quiz for the user
 */
export const selectQuizForDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;
    const { difficulty, questionType } = req.body;
    
    const selectedQuiz = await selectRandomQuiz(documentId, userId, {
      difficulty,
      questionType,
      excludeUsed: true
    });
    
    res.status(200).json({
      success: true,
      quiz: {
        id: selectedQuiz._id,
        title: selectedQuiz.title,
        difficulty: selectedQuiz.difficulty,
        questionType: selectedQuiz.aiMetadata?.questionType,
        questionCount: selectedQuiz.questions.length,
        estimatedTime: selectedQuiz.estimatedTime,
        questions: selectedQuiz.questions.map((q, index) => ({
          id: q.id || index + 1,
          question: q.question,
          options: q.options,
          type: selectedQuiz.aiMetadata?.questionType || 'multiple_choice'
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Select quiz error:', error);
    next(error);
  }
};

/**
 * Complete a quiz attempt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const completeQuizAttempt = async (req, res, next) => {
  try {
    const { id: quizId, attemptId } = req.params;
    const userId = req.user.userId;
    
    console.log(`🏁 Completing quiz attempt: ${attemptId}`);
    console.log(`🔍 DEBUG: userId=${userId}, quizId=${quizId}`);
    
    // Get quiz attempt
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId,
      quizId,
      status: 'in_progress'
    });
    
    if (!attempt) {
      console.log(`🚨 DEBUG: Quiz attempt not found or completed`);
      return next(HttpError.notFound('Quiz attempt not found or already completed'));
    }

    console.log(`✅ DEBUG: Found attempt, calling service...`);
    
    // Get quiz for completion processing
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return next(HttpError.notFound('Quiz not found'));
    }
    
    // 🎯 ADD THIS TRY/CATCH BLOCK:
    try {
      // Complete the attempt
      const result = await quizAttemptService.completeQuizAttempt(attemptId, userId, {
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      
      console.log(`🎯 DEBUG: SERVICE RESULT:`, result); // ADD THIS
      
    } catch (serviceError) {
      console.error(`🚨 DEBUG: SERVICE ERROR:`, serviceError); // ADD THIS
      throw serviceError;
    }
    
    // Update quiz analytics
    await quiz.updateAnalytics(attempt.percentage, attempt.timeSpent / (1000 * 60));
    
    console.log(`✅ Quiz attempt completed: ${attempt._id} (${attempt.percentage}%)`);
    
    res.status(200).json({
      success: true,
      message: 'Quiz completed successfully',
      result: {
        attemptId: attempt._id,
        score: attempt.score,
        percentage: attempt.percentage,
        pointsEarned: attempt.pointsEarned,
        timeSpent: attempt.timeSpent,
        performanceLevel: attempt.performanceLevel,
        completedAt: attempt.completedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Complete quiz attempt error:', error);
    next(error);
  }
};

/**
 * Get results for a completed quiz attempt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getQuizAttemptResults = async (req, res, next) => {
  try {
    const { id: quizId, attemptId } = req.params;
    const userId = req.user.userId;
    
    console.log(`📊 Getting results for attempt: ${attemptId}`);
    
    // Get completed quiz attempt
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId,
      quizId,
      status: 'completed'
    }).populate('quizId', 'title questions');
    
    if (!attempt) {
      return next(HttpError.notFound('Quiz attempt not found or not completed'));
    }
    
    // Build detailed results
    const quiz = attempt.quizId;
    const detailedResults = attempt.answers.map(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      return {
        questionId: answer.questionId,
        question: question?.question || 'Question not found',
        userAnswer: answer.userAnswer,
        correctAnswer: question?.correctAnswer || 'Unknown',
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        explanation: question?.explanation || 'No explanation available',
        timeSpent: answer.timeSpent
      };
    });
    
    res.status(200).json({
      success: true,
      results: {
        attemptId: attempt._id,
        quiz: {
          id: quiz._id,
          title: quiz.title
        },
        score: attempt.score,
        percentage: attempt.percentage,
        pointsEarned: attempt.pointsEarned,
        timeSpent: attempt.timeSpent,
        timeSpentFormatted: attempt.timeSpentFormatted,
        performanceLevel: attempt.performanceLevel,
        completedAt: attempt.completedAt,
        feedback: attempt.feedback,
        strengths: attempt.strengths,
        weaknesses: attempt.weaknesses,
        detailedResults,
        summary: {
          totalQuestions: quiz.questions.length,
          correctAnswers: attempt.score,
          incorrectAnswers: quiz.questions.length - attempt.score,
          accuracy: attempt.accuracy,
          hasPassed: attempt.hasPassed
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Get quiz attempt results error:', error);
    next(error);
  }
};

// ==========================================
// QUIZ ANALYTICS AND STATISTICS
// ==========================================

/**
 * Get user's quiz performance statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getUserQuizStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    console.log(`📈 Getting quiz stats for user: ${userId}`);
    
    // Get quiz statistics
    const quizStats = await Quiz.getUserStats(userId);
    
    // Get quiz attempt statistics
    const attemptStats = await QuizAttempt.getUserStats(userId);
    
    // Get recent performance
    const recentAttempts = await QuizAttempt.find({
      userId,
      status: 'completed'
    })
    .sort({ completedAt: -1 })
    .limit(10)
    .populate('quizId', 'title difficulty')
    .lean();
    
    res.status(200).json({
      success: true,
      stats: {
        quizzes: quizStats[0] || {
          totalQuizzes: 0,
          activeQuizzes: 0,
          totalAttempts: 0,
          categoriesUsed: []
        },
        attempts: attemptStats[0] || {
          totalAttempts: 0,
          averageScore: 0,
          totalPointsEarned: 0,
          averageTimeSpent: 0,
          bestScore: 0,
          completionRate: 0
        },
        recentPerformance: recentAttempts.map(attempt => ({
          attemptId: attempt._id,
          quiz: {
            id: attempt.quizId._id,
            title: attempt.quizId.title,
            difficulty: attempt.quizId.difficulty
          },
          percentage: attempt.percentage,
          pointsEarned: attempt.pointsEarned,
          completedAt: attempt.completedAt
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Get user quiz stats error:', error);
    next(error);
  }
};

/**
 * Get user's quiz attempt history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getQuizAttemptHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'completedAt',
      sortOrder = 'desc'
    } = req.query;
    
    console.log(`📋 Getting quiz attempt history for user: ${userId}`);
    
    // Build query
    const query = { userId };
    if (status) query.status = status;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const attempts = await QuizAttempt.find(query)
      .populate('quizId', 'title difficulty estimatedTime')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count
    const totalCount = await QuizAttempt.countDocuments(query);
    
    res.status(200).json({
      success: true,
      attempts: attempts.map(attempt => ({
        id: attempt._id,
        quiz: attempt.quizId ? {
          id: attempt.quizId._id,
          title: attempt.quizId.title,
          difficulty: attempt.quizId.difficulty,
          estimatedTime: attempt.quizId.estimatedTime
        } : null,
        score: attempt.score,
        percentage: attempt.percentage,
        pointsEarned: attempt.pointsEarned,
        timeSpent: attempt.timeSpent,
        timeSpentFormatted: attempt.timeSpentFormatted,
        performanceLevel: attempt.performanceLevel,
        status: attempt.status,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Get quiz attempt history error:', error);
    next(error);
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Check if user's answer is correct
 * @param {Object} question - Question object
 * @param {string} userAnswer - User's answer
 * @returns {boolean} Whether answer is correct
 */
const checkAnswer = (question, userAnswer) => {
  try {
    // For multiple choice, check against correctAnswer or correctAnswerIndex
    if (question.options && question.options.length > 0) {
      // Check direct answer match
      if (question.correctAnswer === userAnswer) {
        return true;
      }
      
      // Check index-based answer
      if (typeof question.correctAnswerIndex === 'number') {
        const correctOption = question.options[question.correctAnswerIndex];
        return correctOption === userAnswer;
      }
      
      return false;
    }
    
    // For fill-in-the-blank and short answer, do case-insensitive comparison
    if (typeof userAnswer === 'string' && typeof question.correctAnswer === 'string') {
      return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    }
    
    // Direct comparison
    return userAnswer === question.correctAnswer;
    
  } catch (error) {
    console.error('❌ Error checking answer:', error);
    return false;
  }
};

/**
 * Determine device type from user agent
 * @param {string} userAgent - User agent string
 * @returns {string} Device type
 */
const getDeviceType = (userAgent) => {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  
  return 'desktop';
};

export default {
  generateQuiz,
  getAllQuizzes,
  getQuizById,
  getAllQuizzesForDocument,
  getDocumentQuizStats,
  selectQuizForDocument,
  startQuizAttempt,
  submitQuizAnswer,
  completeQuizAttempt,
  getQuizAttemptResults,
  getUserQuizStats,
  getQuizAttemptHistory
};