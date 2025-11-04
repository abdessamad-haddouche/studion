/**
 * Quiz Service
 * @module services/quiz
 * @description Core business logic for quiz operations
 */

import Quiz from '#models/quiz/Quiz.js';
import Document from '#models/document/Document.js';
import { HttpError } from '#exceptions/index.js';
import { generateQuizFromDocumentJSON } from '#services/ai.service.js';

/**
 * Generate a quiz from a document using AI
 * @param {string} documentId - Document ID to generate quiz from
 * @param {string} userId - User ID for ownership validation
 * @param {Object} options - Quiz generation options
 * @returns {Promise<Object>} Created quiz object
 */
export const generateQuizFromDocument = async (documentId, userId, options = {}) => {
  try {
    const {
      questionCount = 5,
      difficulty = 'medium',
      title = null,
      categories = ['general']
    } = options;

    console.log(`🎯 Generating quiz for document ${documentId} with ${questionCount} ${difficulty} questions`);

    // 1. GET AND VALIDATE DOCUMENT
    const document = await Document.findOne({
      _id: documentId,
      userId,
      deletedAt: null
    }).select('+file.storagePath');
    
    if (!document) {
      throw HttpError.notFound('Document not found or access denied', {
        code: 'DOCUMENT_NOT_FOUND',
        context: { documentId, userId }
      });
    }
    
    // Check if document is processed
    if (document.status !== 'completed') {
      throw HttpError.badRequest('Document must be processed before generating quiz', {
        code: 'DOCUMENT_NOT_PROCESSED',
        context: { status: document.status }
      });
    }

    // Check if file exists
    const filePath = document.file.storagePath;
    if (!filePath) {
      throw HttpError.notFound('Document file not found', {
        code: 'DOCUMENT_FILE_NOT_FOUND'
      });
    }

    console.log(`📄 Document validated: ${document.title}`);

    // 2. GENERATE QUIZ USING AI
    const quizResults = await generateQuizFromDocumentJSON(filePath, {
      questionCount: parseInt(questionCount),
      difficulty,
      questionTypes: ['multiple-choice']
    });

    if (!quizResults.success || quizResults.questions.length === 0) {
      throw HttpError.internalServerError('Failed to generate quiz questions', {
        code: 'QUIZ_GENERATION_FAILED',
        context: { questionsGenerated: quizResults.questions.length }
      });
    }

    console.log(`🤖 AI generated ${quizResults.questions.length} questions`);

    // 3. CREATE QUIZ OBJECT
    const quiz = new Quiz({
      documentId: documentId,
      userId: userId,
      title: title || `Quiz: ${document.title}`,
      description: `AI-generated ${difficulty} quiz with ${quizResults.questions.length} questions`,
      questions: quizResults.questions, // Store as mixed type array
      difficulty: difficulty,
      category: categories[0] || 'general',
      estimatedTime: Math.ceil(quizResults.questions.length * 1.5), // 1.5 minutes per question
      passingScore: 70, // Default passing score
      status: 'active',
      aiMetadata: {
        model: quizResults.metadata.model,
        tokensUsed: quizResults.metadata.tokensUsed,
        generationTime: quizResults.metadata.processingTime,
        confidence: 0.85 // Default confidence score
      }
    });

    // 4. SAVE QUIZ TO DATABASE
    await quiz.save();
    console.log(`💾 Quiz saved with ID: ${quiz._id}`);

    // 5. UPDATE DOCUMENT ANALYTICS
    await document.recordQuizGeneration();

    // 6. RETURN QUIZ OBJECT
    return {
      success: true,
      quiz: quiz,
      metadata: {
        questionsGenerated: quizResults.questions.length,
        aiMetadata: quizResults.metadata,
        documentTitle: document.title
      }
    };

  } catch (error) {
    console.error('❌ Quiz generation service error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Quiz generation failed: ${error.message}`, {
      code: 'QUIZ_SERVICE_ERROR',
      context: { originalError: error.message }
    });
  }
};

/**
 * Get all quizzes for a user with optional filtering
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Quizzes array
 */
export const getUserQuizzes = async (userId, options = {}) => {
  try {
    const {
      status = 'active',
      difficulty,
      category,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    console.log(`📚 Getting quizzes for user ${userId}`);

    const quizzes = await Quiz.findByUser(userId, {
      status,
      difficulty,
      category,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    });

    return {
      success: true,
      quizzes: quizzes,
      count: quizzes.length,
      page: parseInt(page),
      limit: parseInt(limit)
    };

  } catch (error) {
    console.error('❌ Get user quizzes error:', error);
    throw HttpError.internalServerError(`Failed to get quizzes: ${error.message}`);
  }
};

/**
 * Get quiz by ID with ownership validation
 * @param {string} quizId - Quiz ID
 * @param {string} userId - User ID for ownership validation
 * @returns {Promise<Object>} Quiz object
 */
export const getQuizById = async (quizId, userId) => {
  try {
    const quiz = await Quiz.findOne({
      _id: quizId,
      userId,
      deletedAt: null
    }).populate('documentId', 'title');

    if (!quiz) {
      throw HttpError.notFound('Quiz not found or access denied', {
        code: 'QUIZ_NOT_FOUND',
        context: { quizId, userId }
      });
    }

    return {
      success: true,
      quiz: quiz
    };

  } catch (error) {
    console.error('❌ Get quiz by ID error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Failed to get quiz: ${error.message}`);
  }
};

export default {
  generateQuizFromDocument,
  getUserQuizzes,
  getQuizById
};