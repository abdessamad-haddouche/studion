/**
 * AI Service - Complete Enhanced Version
 * @module services/ai
 * @description AI service with comprehensive quiz generation capabilities
 */

import fs from 'fs';
import path from 'path';
import { HttpError } from '#exceptions/index.js';
import { extractDocumentText, getDocumentStats } from '#services/documentProcessor.service.js';

// Check for API key
if (!process.env.DEEPSEEK_API_KEY) {
  throw HttpError.internalServerError('DEEPSEEK_API_KEY environment variable is required', {
    code: 'MISSING_API_KEY'
  });
}

// DeepSeek API Configuration
const DEEPSEEK_CONFIG = {
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: 'deepseek-coder',
  maxTokens: 8192,
  temperature: 0.7,
  timeout: 300000 // 5 minutes timeout for big requests
};

// 🔥 COMPREHENSIVE QUIZ GENERATION CONFIGURATION
const QUIZ_GENERATION_CONFIG = {
  difficultiesCount: {
    easy: 1,    
    medium: 1,  
    hard: 1     
  },
  questionTypes: ['true_false', 'multiple_choice', 'fill_blank'],
  questionsPerQuiz: 10,
  
  get totalQuizzesPerDifficulty() {
    return this.questionTypes.length * 3;
  },
  
  get totalQuizzes() {
    return this.totalQuizzesPerDifficulty * 3;
  },
  
  get totalQuestions() {
    return this.totalQuizzes * this.questionsPerQuiz;
  }
};

/**
 * File path resolution
 */
const resolveFilePath = (filePath) => {
  console.log(`🔍 Original file path: ${filePath}`);
  
  if (path.isAbsolute(filePath)) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ Absolute path exists: ${filePath}`);
      return filePath;
    }
  }
  
  const backendDir = process.cwd();
  const filename = path.basename(filePath);
  const correctPath = path.join(backendDir, 'uploads', 'documents', filename);
  
  if (fs.existsSync(correctPath)) {
    return correctPath;
  }
  
  throw HttpError.notFound(`File not found: ${filename}`, {
    code: 'FILE_NOT_FOUND',
    context: { originalPath: filePath, expectedPath: correctPath }
  });
};

/**
 * Make API call to DeepSeek
 */
const callDeepSeekAPI = async (messages, options = {}) => {
  try {
    const {
      maxTokens = DEEPSEEK_CONFIG.maxTokens,
      temperature = DEEPSEEK_CONFIG.temperature
    } = options;

    console.log(`🤖 Calling DeepSeek API...`);
    
    const requestBody = {
      model: DEEPSEEK_CONFIG.model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature,
      stream: false
    };

    // 🔥 ADD SHORTER TIMEOUT AND BETTER ERROR HANDLING
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(DEEPSEEK_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`🔍 DeepSeek response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ DeepSeek API error: ${response.status} - ${errorData}`);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log(`✅ DeepSeek API call successful`);
    
    return data;
  } catch (error) {
    console.error(`❌ DeepSeek API call failed:`, error);
    
    if (error.name === 'AbortError') {
      throw new Error('DeepSeek API request timeout after 60 seconds');
    }
    
    throw error;
  }
};

/**
 * 🔥 ORIGINAL FUNCTION: Process document with AI (your existing function)
 */
export const processDocumentWithAI = async (filePath, options = {}) => {
  try {
    console.log(`🤖 Processing document with AI: ${filePath}`);
    
    const resolvedPath = resolveFilePath(filePath);
    const fileStats = await getDocumentStats(resolvedPath);
    
    if (!fileStats.isSupported) {
      throw HttpError.badRequest(`Unsupported file type: ${fileStats.fileExtension}`);
    }

    const extractionResult = await extractDocumentText(resolvedPath);
    
    if (!extractionResult.success) {
      throw HttpError.internalServerError(`Text extraction failed: ${extractionResult.error}`);
    }

    const prompt = `
Please analyze this document and provide:
1. A comprehensive summary (3-4 paragraphs)
2. Key points (5-7 bullet points)
3. Main topics covered (3-5 topics)

Document content:
${extractionResult.text}

Please respond in JSON format:
{
  "summary": "comprehensive summary here",
  "keyPoints": ["point 1", "point 2", ...],
  "topics": ["topic 1", "topic 2", ...]
}`;

    const messages = [{
      role: 'user',
      content: prompt
    }];

    const response = await callDeepSeekAPI(messages);
    let content = response.choices[0]?.message?.content || '';
    
    // Parse JSON response
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}') + 1;
    
    if (startIndex === -1 || endIndex === 0) {
      throw new Error('No JSON found in AI response');
    }
    
    const jsonContent = content.substring(startIndex, endIndex);
    const parsedResult = JSON.parse(jsonContent);

    return {
      success: true,
      summary: parsedResult.summary,
      keyPoints: parsedResult.keyPoints || [],
      topics: parsedResult.topics || [],
      metadata: {
        model: DEEPSEEK_CONFIG.model,
        tokensUsed: response.usage?.total_tokens || 0,
        wordCount: extractionResult.metadata.wordCount,
        processingTime: Date.now()
      }
    };

  } catch (error) {
    console.error('❌ AI document processing error:', error);
    return {
      success: false,
      error: error.message,
      summary: null,
      keyPoints: [],
      topics: []
    };
  }
};

/**
 * 🔥 ORIGINAL FUNCTION: Generate quiz from document (your existing function)
 */
export const generateQuizFromDocument = async (filePath, options = {}) => {
  try {
    const {
      questionCount = 10,
      difficulty = 'medium',
      questionType = 'multiple_choice',
      title = 'Generated Quiz'
    } = options;

    console.log(`🧪 Generating quiz: ${questionCount} ${questionType} questions, ${difficulty} difficulty`);

    const resolvedPath = resolveFilePath(filePath);
    const fileStats = await getDocumentStats(resolvedPath);
    
    if (!fileStats.isSupported) {
      throw HttpError.badRequest(`Unsupported file type: ${fileStats.fileExtension}`);
    }

    const extractionResult = await extractDocumentText(resolvedPath);
    
    if (!extractionResult.success) {
      throw HttpError.internalServerError(`Text extraction failed: ${extractionResult.error}`);
    }

    const prompt = `Create a ${difficulty} difficulty quiz with ${questionCount} ${questionType.replace('_', ' ')} questions based on this document.

${questionType === 'multiple_choice' ? 'Each question should have 4 options with one correct answer.' :
  questionType === 'true_false' ? 'Each question should be answerable with True or False.' :
  'Each question should have a fill-in-the-blank format.'}

Document content:
${extractionResult.text}

Respond ONLY with this JSON format:
{
  "quiz": {
    "title": "${title}",
    "difficulty": "${difficulty}",
    "estimatedTime": ${Math.ceil(questionCount * 1.5)},
    "questions": [
      {
        "id": 1,
        "question": "Question text?",
        "options": ${questionType === 'multiple_choice' ? '["A", "B", "C", "D"]' : 
                   questionType === 'true_false' ? '["True", "False"]' : '[]'},
        "correctAnswer": "correct answer",
        "correctAnswerIndex": ${questionType === 'fill_blank' ? -1 : 0},
        "explanation": "explanation",
        "points": 1
      }
    ]
  }
}`;

    const messages = [{
      role: 'user',
      content: prompt
    }];

    const response = await callDeepSeekAPI(messages);
    let content = response.choices[0]?.message?.content || '';
    
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}') + 1;
    
    if (startIndex === -1 || endIndex === 0) {
      throw new Error('No JSON found in AI response');
    }
    
    const jsonContent = content.substring(startIndex, endIndex);
    const parsedResult = JSON.parse(jsonContent);

    return {
      success: true,
      quiz: parsedResult.quiz,
      metadata: {
        model: DEEPSEEK_CONFIG.model,
        tokensUsed: response.usage?.total_tokens || 0,
        generatedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    return {
      success: false,
      error: error.message,
      quiz: null
    };
  }
};

/**
 * 🔥 NEW FUNCTION: Generate comprehensive quiz collection
 */
export const generateComprehensiveQuizCollection = async (filePath, options = {}) => {
  try {
    const startTime = Date.now();
    console.log(`⏱️  TIMER START: Comprehensive quiz generation started at ${new Date().toISOString()}`);
    
    console.log(`🏭 Generating comprehensive quiz collection from: ${filePath}`);
    console.log(`📊 Target: ${QUIZ_GENERATION_CONFIG.totalQuizzes} quizzes (${QUIZ_GENERATION_CONFIG.totalQuestions} questions)`);
    
    // File Resolution Timer
    const fileResolutionStart = Date.now();
    const resolvedPath = resolveFilePath(filePath);
    const fileStats = await getDocumentStats(resolvedPath);
    const fileResolutionTime = Date.now() - fileResolutionStart;
    console.log(`⏱️  File resolution completed in ${fileResolutionTime}ms`);
    
    if (!fileStats.isSupported) {
      throw HttpError.badRequest(`Unsupported file type: ${fileStats.fileExtension}`);
    }

    // Text Extraction Timer
    const extractionStart = Date.now();
    const extractionResult = await extractDocumentText(resolvedPath);
    const extractionTime = Date.now() - extractionStart;
    console.log(`⏱️  Text extraction completed in ${extractionTime}ms`);
    
    if (!extractionResult.success) {
      throw HttpError.internalServerError(`Text extraction failed: ${extractionResult.error}`);
    }
    
    console.log(`✅ Text extracted successfully (${extractionResult.text.length} characters)`);

    // Prompt Building Timer
    const promptStart = Date.now();
    const prompt = buildComprehensiveQuizPrompt(extractionResult.text);
    const messages = [{ role: 'user', content: prompt }];
    const promptTime = Date.now() - promptStart;
    console.log(`⏱️  Prompt building completed in ${promptTime}ms`);

    console.log(`🤖 TIMER: Calling DeepSeek API for comprehensive quiz generation...`);
    
    // AI API Call Timer (THE MAIN ONE)
    const aiStartTime = Date.now();
    const response = await callDeepSeekAPI(messages, {
      maxTokens: 4096,  // Reduced for speed
      temperature: 0.3  // Lower for faster generation
    });
    const aiEndTime = Date.now();
    const aiDuration = aiEndTime - aiStartTime;
    console.log(`⚡ TIMER: DeepSeek API responded in ${aiDuration}ms (${(aiDuration/1000).toFixed(2)}s)`);

    // Response Processing Timer
    const processingStart = Date.now();
    let rawResponse = response.choices[0]?.message?.content || '';
    
    console.log(`✅ Comprehensive quiz generation completed (${rawResponse.length} characters)`);

    if (!rawResponse || rawResponse.length === 0) {
      throw HttpError.internalServerError('DeepSeek returned empty quiz response');
    }

    const quizCollection = parseComprehensiveQuizCollection(rawResponse);

    if (!quizCollection.quizzes || quizCollection.quizzes.length === 0) {
      throw HttpError.badRequest('No valid quizzes found in AI response');
    }

    const processingTime = Date.now() - processingStart;
    console.log(`⏱️  Response parsing completed in ${processingTime}ms`);
    console.log(`✅ Quiz collection parsing completed (${quizCollection.quizzes.length} quizzes generated)`);

    // Final Timing Summary
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    console.log(`✅ TIMER END: Total comprehensive processing completed in ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}s)`);
    console.log(`📊 DETAILED TIMING BREAKDOWN:`);
    console.log(`   🔍 File Resolution: ${fileResolutionTime}ms (${(fileResolutionTime/1000).toFixed(2)}s)`);
    console.log(`   📖 Text Extraction: ${extractionTime}ms (${(extractionTime/1000).toFixed(2)}s)`);
    console.log(`   📝 Prompt Building: ${promptTime}ms (${(promptTime/1000).toFixed(2)}s)`);
    console.log(`   🤖 AI API Call: ${aiDuration}ms (${(aiDuration/1000).toFixed(2)}s) ⭐ MAIN BOTTLENECK`);
    console.log(`   🔄 Response Parsing: ${processingTime}ms (${(processingTime/1000).toFixed(2)}s)`);
    console.log(`   📊 Total Time: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}s)`);
    console.log(`   🎯 AI Percentage: ${((aiDuration/totalDuration)*100).toFixed(1)}% of total time`);

    return {
      success: true,
      quizCollection: quizCollection,
      metadata: {
        model: DEEPSEEK_CONFIG.model,
        tokensUsed: response.usage?.total_tokens || 0,
        processingTime: totalDuration,
        documentStats: fileStats,
        expectedQuizzes: QUIZ_GENERATION_CONFIG.totalQuizzes,
        actualQuizzes: quizCollection.quizzes.length,
        timingBreakdown: {
          totalTime: totalDuration,
          fileResolutionTime: fileResolutionTime,
          textExtractionTime: extractionTime,
          promptBuildingTime: promptTime,
          aiApiTime: aiDuration,
          responseParsingTime: processingTime,
          aiPercentage: ((aiDuration/totalDuration)*100).toFixed(1)
        }
      },
      rawResponse: rawResponse
    };

  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ TIMER ERROR: Comprehensive quiz generation failed after ${errorTime}ms (${(errorTime/1000).toFixed(2)}s)`);
    console.error('❌ Comprehensive quiz generation error:', error);
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Comprehensive quiz generation failed: ${error.message}`);
  }
};

/**
 * Build comprehensive quiz prompt
 */
/**
 * Build SUPER FAST quiz prompt - 3 quizzes, 20 questions each, progressive difficulty
 */
const buildComprehensiveQuizPrompt = (documentText) => {
  // Use more text for better context - 1500 chars is still fast
  const truncatedText = documentText.substring(0, 1500);
  
  return `TASK: Generate EXACTLY 2 complete multiple choice quizzes. Each quiz MUST have 10 questions with 4 options each.

❌ DO NOT ask about:
- Document metadata (title, author, chapter names)
- Administrative details (semester, course codes)
- "What is the title of..." questions

✅ FOCUS ON:
- Core concepts and practical applications
- Problem-solving and analysis
- Key principles and how they work
- Real-world scenarios and decision-making

GENERATE EXACTLY THIS JSON STRUCTURE - 2 QUIZZES, 10 QUESTIONS EACH:

{
  "quizzes": [
    {
      "title": "Multiple Choice Quiz",
      "difficulty": "mixed",
      "type": "multiple_choice",
      "questions": [
        {
          "id": 1,
          "question": "Question about core concept 1?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "correctAnswerIndex": 0,
          "explanation": "Brief explanation",
          "points": 1
        },
        {
          "id": 2,
          "question": "Question about core concept 2?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option B",
          "correctAnswerIndex": 1,
          "explanation": "Brief explanation",
          "points": 1
        },
        {
          "id": 3,
          "question": "Question 3?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "correctAnswerIndex": 0,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 4,
          "question": "Question 4?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "C",
          "correctAnswerIndex": 2,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 5,
          "question": "Question 5?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "B",
          "correctAnswerIndex": 1,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 6,
          "question": "Question 6?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "D",
          "correctAnswerIndex": 3,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 7,
          "question": "Question 7?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "correctAnswerIndex": 0,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 8,
          "question": "Question 8?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "B",
          "correctAnswerIndex": 1,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 9,
          "question": "Question 9?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "C",
          "correctAnswerIndex": 2,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 10,
          "question": "Question 10?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "D",
          "correctAnswerIndex": 3,
          "explanation": "Brief",
          "points": 1
        }
      ]
    },
    {
      "title": "True False Quiz",
      "difficulty": "mixed",
      "type": "true_false",
      "questions": [
        {
          "id": 1,
          "question": "True/False statement about concept 1?",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "correctAnswerIndex": 0,
          "explanation": "Brief explanation",
          "points": 1
        },
        {
          "id": 2,
          "question": "Statement 2?",
          "options": ["True", "False"],
          "correctAnswer": "False",
          "correctAnswerIndex": 1,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 3,
          "question": "Statement 3?",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "correctAnswerIndex": 0,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 4,
          "question": "Statement 4?",
          "options": ["True", "False"],
          "correctAnswer": "False",
          "correctAnswerIndex": 1,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 5,
          "question": "Statement 5?",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "correctAnswerIndex": 0,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 6,
          "question": "Statement 6?",
          "options": ["True", "False"],
          "correctAnswer": "False",
          "correctAnswerIndex": 1,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 7,
          "question": "Statement 7?",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "correctAnswerIndex": 0,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 8,
          "question": "Statement 8?",
          "options": ["True", "False"],
          "correctAnswer": "False",
          "correctAnswerIndex": 1,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 9,
          "question": "Statement 9?",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "correctAnswerIndex": 0,
          "explanation": "Brief",
          "points": 1
        },
        {
          "id": 10,
          "question": "Statement 10?",
          "options": ["True", "False"],
          "correctAnswer": "False",
          "correctAnswerIndex": 1,
          "explanation": "Brief",
          "points": 1
        }
      ]
    }
  ]
}

CRITICAL REQUIREMENTS:
- EXACTLY 2 quizzes
- EXACTLY 10 questions per quiz
- First quiz: multiple choice with 4 options each
- Second quiz: true/false with 2 options each
- Focus on PRACTICAL KNOWLEDGE not metadata
- Complete JSON structure as shown above
- No truncation - generate ALL 20 questions

Document content:
${truncatedText}`;
};

/**
 * Parse comprehensive quiz collection
 */
const parseComprehensiveQuizCollection = (rawResponse) => {
  try {
    console.log(`🔍 Parsing comprehensive quiz collection...`);
    
    let cleanedResponse = rawResponse.trim();
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    
    cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
    const quizData = JSON.parse(cleanedResponse);
    
    if (!quizData.quizzes) {
      throw new Error('Invalid quiz structure: missing quizzes array');
    }
    
    const allQuizzes = [];
    
    for (const quiz of quizData.quizzes) {
      const validatedQuiz = validateQuiz(quiz, quiz.difficulty, quiz.type);
      if (validatedQuiz) {
        allQuizzes.push(validatedQuiz);
      }
    }
    
    console.log(`✅ Successfully parsed ${allQuizzes.length} quizzes`);
    
    return {
      quizzes: allQuizzes,
      metadata: {
        totalQuizzes: allQuizzes.length,
        totalQuestions: allQuizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0)
      }
    };
    
  } catch (error) {
    console.error('❌ JSON parsing error:', error.message);
    return {
      quizzes: [],
      metadata: { totalQuizzes: 0, totalQuestions: 0 }
    };
  }
};

/**
 * Validate individual quiz
 */
const validateQuiz = (quiz, expectedDifficulty, expectedType) => {
  try {
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Quiz missing questions array');
    }
    
    const validatedQuestions = quiz.questions
      .map((q, index) => validateQuestion(q, index + 1, expectedType))
      .filter(q => q !== null);
    
    if (validatedQuestions.length === 0) {
      throw new Error('No valid questions found in quiz');
    }
    
    // ✅ CLEAN THE TITLE - REMOVE SPECIAL CHARACTERS
    const cleanTitle = (quiz.title || `${expectedDifficulty} ${expectedType} Quiz`)
      .replace(/[^a-zA-Z0-9\s\-_.,()[\]]/g, '') // Remove invalid chars
      .trim();
    
    return {
      quizId: quiz.quizId || `${expectedDifficulty}_${expectedType}_${Date.now()}`,
      title: cleanTitle,
      difficulty: quiz.difficulty || expectedDifficulty,
      type: quiz.type || expectedType,
      estimatedTime: quiz.estimatedTime || Math.ceil(validatedQuestions.length * 1.5),
      questions: validatedQuestions,
      // ✅ ENSURE AI METADATA IS PROPERLY SET
      aiMetadata: {
        questionType: expectedType,  // ✅ THIS IS KEY FOR SEARCH
        type: expectedType,          // ✅ BACKUP FIELD
        generationType: 'bulk_generation',
        model: 'deepseek-chat',
        originalQuestionCount: validatedQuestions.length,
        generatedAt: new Date().toISOString(),
        difficulty: expectedDifficulty
      }
    };
    
  } catch (error) {
    console.error(`❌ Quiz validation error:`, error.message);
    return null;
  }
};

/**
 * Validate individual question
 */
const validateQuestion = (question, questionId, questionType) => {
  try {
    if (!question.question || typeof question.question !== 'string') {
      throw new Error(`Question ${questionId}: missing question text`);
    }
    
    if (!question.correctAnswer) {
      throw new Error(`Question ${questionId}: missing correct answer`);
    }
    
    const validatedQuestion = {
      id: questionId,
      question: question.question.trim(),
      options: question.options || [],
      correctAnswer: question.correctAnswer,
      correctAnswerIndex: question.correctAnswerIndex || 0,
      explanation: question.explanation || 'No explanation provided',
      points: question.points || 1
    };
    
    // Type-specific validation
    switch (questionType) {
      case 'multiple_choice':
        if (!Array.isArray(question.options) || question.options.length !== 4) {
          throw new Error(`Question ${questionId}: multiple choice must have exactly 4 options`);
        }
        const correctIndex = question.options.indexOf(question.correctAnswer);
        if (correctIndex === -1) {
          throw new Error(`Question ${questionId}: correct answer not found in options`);
        }
        validatedQuestion.correctAnswerIndex = correctIndex;
        break;
        
      case 'true_false':
        validatedQuestion.options = ['True', 'False'];
        if (!['True', 'False'].includes(question.correctAnswer)) {
          throw new Error(`Question ${questionId}: true/false answer must be 'True' or 'False'`);
        }
        validatedQuestion.correctAnswerIndex = question.correctAnswer === 'True' ? 0 : 1;
        break;
        
      case 'fill_blank':
        validatedQuestion.options = [];
        validatedQuestion.correctAnswerIndex = -1;
        break;
    }
    
    return validatedQuestion;
    
  } catch (error) {
    console.error(`❌ Question validation error:`, error.message);
    return null;
  }
};

/**
 * 🔥 ORIGINAL FUNCTION: Generate custom text
 */
export const generateCustomText = async (filePath, prompt, options = {}) => {
  try {
    console.log(`🎯 Generating custom text for document: ${filePath}`);
    
    const resolvedPath = resolveFilePath(filePath);
    const extractionResult = await extractDocumentText(resolvedPath);
    
    if (!extractionResult.success) {
      throw HttpError.internalServerError(`Text extraction failed: ${extractionResult.error}`);
    }

    const fullPrompt = `${prompt}

Document content:
${extractionResult.text}`;

    const messages = [{
      role: 'user',
      content: fullPrompt
    }];

    const response = await callDeepSeekAPI(messages, options);
    const generatedText = response.choices[0]?.message?.content || '';

    return {
      success: true,
      generatedText,
      metadata: {
        model: DEEPSEEK_CONFIG.model,
        tokensUsed: response.usage?.total_tokens || 0,
        prompt: prompt
      }
    };

  } catch (error) {
    console.error('❌ Custom text generation error:', error);
    return {
      success: false,
      error: error.message,
      generatedText: null
    };
  }
};

/**
 * 🔥 ORIGINAL FUNCTION: Check AI service status
 */
export const checkAIServiceStatus = async () => {
  try {
    console.log('🔍 Checking AI service status...');
    
    const testMessages = [{
      role: 'user',
      content: 'Hello, please respond with "OK" to confirm the service is working.'
    }];

    const response = await callDeepSeekAPI(testMessages, {
      maxTokens: 10,
      temperature: 0
    });

    const content = response.choices[0]?.message?.content || '';
    
    return {
      success: true,
      status: 'operational',
      model: DEEPSEEK_CONFIG.model,
      response: content,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ AI service status check failed:', error);
    return {
      success: false,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Export configuration
export { QUIZ_GENERATION_CONFIG };

// Default export
export default {
  processDocumentWithAI,
  generateQuizFromDocument,
  generateComprehensiveQuizCollection,
  generateCustomText,
  checkAIServiceStatus,
  QUIZ_GENERATION_CONFIG
};