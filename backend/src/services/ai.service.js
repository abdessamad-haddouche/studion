/**
 * AI Service - DeepSeek Implementation with DIRECT PROMPTS
 * @module services/ai
 * @description Prompts for direct responses and multilingual support
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
  model: 'deepseek-chat',
  maxTokens: 4096,
  temperature: 0.7,
  timeout: 120000 // 2 minutes timeout
};

/**
 * EXACT FIX: File path resolution for backend/uploads/documents structure
 * @param {string} filePath - File path from database
 * @returns {string} Resolved absolute file path
 */
const resolveFilePath = (filePath) => {
  console.log(`🔍 Original file path: ${filePath}`);
  
  // If it's already an absolute path, check if it exists
  if (path.isAbsolute(filePath)) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ Absolute path exists: ${filePath}`);
      return filePath;
    }
  }
  
  // YOUR EXACT STRUCTURE: backend/uploads/documents/
  const backendDir = process.cwd();
  console.log(`📂 Backend directory: ${backendDir}`);
  
  // Extract just the filename from the stored path
  const filename = path.basename(filePath);
  console.log(`📄 Extracted filename: ${filename}`);
  
  // Build the correct path: backend/uploads/documents/filename
  const correctPath = path.join(backendDir, 'uploads', 'documents', filename);
  console.log(`🎯 Trying correct path: ${correctPath}`);
  
  if (fs.existsSync(correctPath)) {
    const stats = fs.statSync(correctPath);
    console.log(`✅ File found! Size: ${stats.size} bytes`);
    return correctPath;
  }
  
  // If still not found, try alternative paths
  const alternatives = [
    path.join(backendDir, filePath),
    filePath.includes('uploads') ? path.join(backendDir, filePath) : null,
    filePath.startsWith('./') ? path.join(backendDir, filePath.substring(2)) : null
  ].filter(Boolean);
  
  for (const altPath of alternatives) {
    console.log(`🔍 Trying alternative: ${altPath}`);
    if (fs.existsSync(altPath)) {
      console.log(`✅ Found at alternative path: ${altPath}`);
      return altPath;
    }
  }
  
  // Debug: List what's actually in uploads/documents
  const uploadsDir = path.join(backendDir, 'uploads', 'documents');
  console.error(`❌ File not found. Debug info:`);
  console.error(`   Looking for: ${filename}`);
  console.error(`   In directory: ${uploadsDir}`);
  
  try {
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.error(`   Files in directory: ${files.join(', ')}`);
      
      const similarFile = files.find(f => f.includes(filename.split('.')[0]));
      if (similarFile) {
        console.error(`   Similar file found: ${similarFile}`);
        const similarPath = path.join(uploadsDir, similarFile);
        console.log(`✅ Using similar file: ${similarPath}`);
        return similarPath;
      }
    } else {
      console.error(`   Directory doesn't exist: ${uploadsDir}`);
    }
  } catch (error) {
    console.error(`   Error listing directory: ${error.message}`);
  }
  
  throw HttpError.notFound(`File not found: ${filename}`, {
    code: 'FILE_NOT_FOUND',
    context: { 
      originalPath: filePath,
      expectedPath: correctPath,
      backendDirectory: backendDir
    }
  });
};

/**
 * Make API call to DeepSeek
 * @param {Array} messages - Chat messages
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} API response
 */
const callDeepSeekAPI = async (messages, options = {}) => {
  try {
    const {
      maxTokens = DEEPSEEK_CONFIG.maxTokens,
      temperature = DEEPSEEK_CONFIG.temperature
    } = options;

    console.log(`🤖 Calling DeepSeek API...`);
    console.log(`📝 Messages count: ${messages.length}`);
    
    const requestBody = {
      model: DEEPSEEK_CONFIG.model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature,
      stream: false
    };

    const response = await fetch(DEEPSEEK_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(DEEPSEEK_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ DeepSeek API error: ${response.status} - ${errorData}`);
      
      if (response.status === 401) {
        throw HttpError.unauthorized('Invalid DeepSeek API key', {
          code: 'INVALID_API_KEY'
        });
      }
      
      if (response.status === 429) {
        throw HttpError.badRequest('DeepSeek API rate limit exceeded', {
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }
      
      throw HttpError.internalServerError(`DeepSeek API error: ${response.status}`, {
        code: 'DEEPSEEK_API_ERROR',
        context: { status: response.status, error: errorData }
      });
    }

    const data = await response.json();
    console.log(`✅ DeepSeek API call successful`);
    
    return data;
  } catch (error) {
    console.error(`❌ DeepSeek API call failed:`, error);
    
    if (error.name === 'AbortError') {
      throw HttpError.badRequest('DeepSeek API request timeout', {
        code: 'API_TIMEOUT'
      });
    }
    
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`DeepSeek API call failed: ${error.message}`, {
      code: 'DEEPSEEK_API_ERROR',
      context: { originalError: error.message }
    });
  }
};

/**
 * Process document with AI for summarization
 */
export const processDocumentWithAI = async (filePath, options = {}) => {
  try {
    console.log(`🔍 Processing document: ${filePath}`);
    
    // Resolve the correct file path
    const resolvedPath = resolveFilePath(filePath);
    console.log(`✅ Resolved path: ${resolvedPath}`);

    // Get file info and validate
    const fileStats = await getDocumentStats(resolvedPath);
    console.log(`📊 Document stats: ${fileStats.fileName} (${fileStats.fileSizeFormatted})`);
    
    if (!fileStats.isSupported) {
      throw HttpError.badRequest(`Unsupported file type: ${fileStats.fileExtension}`, {
        code: 'UNSUPPORTED_FILE_TYPE',
        context: { fileExtension: fileStats.fileExtension }
      });
    }

    // ✅ EXTRACT TEXT FROM DOCUMENT
    console.log(`📖 Extracting text from document...`);
    const extractionResult = await extractDocumentText(resolvedPath);
    
    if (!extractionResult.success) {
      throw HttpError.internalServerError(`Text extraction failed: ${extractionResult.error}`, {
        code: 'TEXT_EXTRACTION_ERROR'
      });
    }
    
    console.log(`✅ Text extracted successfully (${extractionResult.text.length} characters, ${extractionResult.metadata.wordCount} words)`);

    // ✅ IMPROVED DIRECT PROMPT - NO INTRODUCTIONS
    const messages = [
      {
        role: 'user',
        content: `Summarize this document in 5-7 bullet points. Use the SAME LANGUAGE as the document (French, Arabic, English, etc.). DO NOT add introductions, explanations, or acknowledgments. Start directly with the bullet points.

Requirements:
- Use bullet points (• or -)
- Keep language simple and clear
- Focus on key concepts and main topics
- Maintain the original document language
- Maximum 7 bullet points
- No introductory text

Document:
${extractionResult.text}`
      }
    ];

    // Call DeepSeek API
    console.log(`🤖 Calling DeepSeek API for summarization...`);
    const startTime = Date.now();
    
    const response = await callDeepSeekAPI(messages, {
      maxTokens: 2048,
      temperature: 0.7
    });

    const endTime = Date.now();
    const summaryText = response.choices[0]?.message?.content || '';
    
    console.log(`✅ AI summarization completed (${summaryText.length} characters)`);
    console.log(`📊 Processing time: ${endTime - startTime}ms`);

    if (!summaryText || summaryText.length === 0) {
      throw HttpError.internalServerError('DeepSeek returned empty response', {
        code: 'EMPTY_AI_RESPONSE'
      });
    }

    // Parse response to extract bullet points
    const lines = summaryText.split('\n').filter(line => line.trim());
    const bulletPoints = lines.filter(line => 
      line.trim().startsWith('•') || 
      line.trim().startsWith('-') || 
      line.trim().startsWith('*') ||
      /^\d+\./.test(line.trim())
    ).map(line => line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());

    // Extract topics
    const topics = extractTopics(summaryText);

    return {
      success: true,
      summary: summaryText,
      keyPoints: bulletPoints.length > 0 ? bulletPoints : [summaryText],
      topics: topics,
      metadata: {
        model: DEEPSEEK_CONFIG.model,
        tokensUsed: response.usage?.total_tokens || 0,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        processingTime: endTime - startTime,
        documentStats: fileStats,
        extractionStats: extractionResult.metadata
      }
    };

  } catch (error) {
    console.error('❌ AI processing error:', error);
    
    // If it's already an HttpError, re-throw it
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`AI processing failed: ${error.message}`, {
      code: 'AI_PROCESSING_ERROR',
      context: { originalError: error.message }
    });
  }
};

/**
 * Generate quiz questions from document
 */
export const generateQuizFromDocument = async (filePath, options = {}) => {
  try {
    const {
      questionCount = 5,
      difficulty = 'intermediate',
      questionTypes = ['multiple-choice']
    } = options;

    console.log(`🧪 Generating ${questionCount} quiz questions from: ${filePath}`);
    
    // Resolve the correct file path
    const resolvedPath = resolveFilePath(filePath);
    console.log(`✅ Resolved path for quiz: ${resolvedPath}`);

    // ✅ EXTRACT TEXT FROM DOCUMENT
    console.log(`📖 Extracting text for quiz generation...`);
    const extractionResult = await extractDocumentText(resolvedPath);
    
    if (!extractionResult.success) {
      throw HttpError.internalServerError(`Text extraction failed: ${extractionResult.error}`, {
        code: 'TEXT_EXTRACTION_ERROR'
      });
    }
    
    console.log(`✅ Text extracted for quiz (${extractionResult.text.length} characters)`);

    // ✅ IMPROVED DIRECT QUIZ PROMPT WITH CUSTOM XML FORMAT
    const messages = [
      {
        role: 'user',
        content: `Generate ${questionCount} multiple-choice questions from this document. Use the SAME LANGUAGE as the document. Format each question exactly like this:

<q1>Question text here?</q1>
<a1>
A. Option A
B. Option B  
C. Option C
D. Option D
Correct: A
Explanation: Brief explanation
</a1>

<q2>Next question here?</q2>
<a2>
A. Option A
B. Option B
C. Option C  
D. Option D
Correct: B
Explanation: Brief explanation
</a2>

Requirements:
- Difficulty: ${difficulty}
- Use document's language (French, Arabic, English, etc.)
- Test understanding, not memorization
- 4 options per question (A, B, C, D)
- Include correct answer and brief explanation
- NO introductory text or explanations
- Start directly with <q1>

Document:
${extractionResult.text}`
      }
    ];

    // Generate quiz
    console.log(`🤖 Calling DeepSeek API for quiz generation...`);
    const startTime = Date.now();
    
    const response = await callDeepSeekAPI(messages, {
      maxTokens: 3000,
      temperature: 0.7
    });

    const endTime = Date.now();
    let quizText = response.choices[0]?.message?.content || '';

    console.log(`✅ Quiz generation completed (${quizText.length} characters)`);
    console.log(`📊 Processing time: ${endTime - startTime}ms`);

    if (!quizText || quizText.length === 0) {
      throw HttpError.internalServerError('DeepSeek returned empty quiz response', {
        code: 'EMPTY_QUIZ_RESPONSE'
      });
    }

    // ✅ PARSE CUSTOM XML FORMAT
    const questions = parseQuizXML(quizText);

    if (questions.length === 0) {
      throw HttpError.badRequest('No valid quiz questions found in AI response', {
        code: 'NO_VALID_QUESTIONS',
        context: { rawResponse: quizText.substring(0, 300) }
      });
    }

    console.log(`✅ Quiz parsing completed (${questions.length} questions)`);

    return {
      success: true,
      questions: questions,
      rawResponse: quizText, // Include raw response for frontend parsing
      metadata: {
        model: DEEPSEEK_CONFIG.model,
        questionCount: questions.length,
        difficulty: difficulty,
        tokensUsed: response.usage?.total_tokens || 0,
        processingTime: endTime - startTime,
        extractionStats: extractionResult.metadata
      }
    };

  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    
    // If it's already an HttpError, re-throw it
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Quiz generation failed: ${error.message}`, {
      code: 'QUIZ_GENERATION_ERROR',
      context: { originalError: error.message }
    });
  }
};

/**
 * Parse quiz questions from custom XML format
 * @param {string} quizText - Raw quiz text with XML tags
 * @returns {Array} Parsed questions array
 */
const parseQuizXML = (quizText) => {
  const questions = [];
  
  try {
    // Extract questions using regex
    const questionRegex = /<q(\d+)>(.*?)<\/q\1>/gs;
    const answerRegex = /<a(\d+)>(.*?)<\/a\1>/gs;
    
    let questionMatch;
    const questionMatches = [];
    
    while ((questionMatch = questionRegex.exec(quizText)) !== null) {
      questionMatches.push({
        number: questionMatch[1],
        question: questionMatch[2].trim()
      });
    }
    
    let answerMatch;
    const answerMatches = [];
    
    while ((answerMatch = answerRegex.exec(quizText)) !== null) {
      answerMatches.push({
        number: answerMatch[1],
        content: answerMatch[2].trim()
      });
    }
    
    // Combine questions and answers
    for (let i = 0; i < questionMatches.length; i++) {
      const questionData = questionMatches[i];
      const answerData = answerMatches.find(a => a.number === questionData.number);
      
      if (answerData) {
        const parsedQuestion = parseQuestionAnswer(questionData.question, answerData.content);
        if (parsedQuestion) {
          questions.push(parsedQuestion);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error parsing quiz XML:', error);
  }
  
  return questions;
};

/**
 * Parse individual question and answer content
 * @param {string} questionText - Question text
 * @param {string} answerContent - Answer content with options
 * @returns {Object|null} Parsed question object
 */
const parseQuestionAnswer = (questionText, answerContent) => {
  try {
    const lines = answerContent.split('\n').map(line => line.trim()).filter(line => line);
    
    const options = [];
    let correctAnswer = '';
    let explanation = '';
    
    for (const line of lines) {
      if (line.match(/^[A-D]\./)) {
        options.push(line.substring(2).trim());
      } else if (line.startsWith('Correct:')) {
        correctAnswer = line.replace('Correct:', '').trim();
      } else if (line.startsWith('Explanation:')) {
        explanation = line.replace('Explanation:', '').trim();
      }
    }
    
    if (options.length === 4 && correctAnswer && explanation) {
      // Convert correct letter to full answer
      const correctIndex = correctAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      const correctAnswerText = options[correctIndex] || options[0];
      
      return {
        question: questionText,
        options: options,
        correctAnswer: correctAnswerText,
        explanation: explanation
      };
    }
    
  } catch (error) {
    console.error('❌ Error parsing individual question:', error);
  }
  
  return null;
};

/**
 * Generate custom text based on document and prompt
 */
export const generateCustomText = async (filePath, customPrompt, options = {}) => {
  try {
    // Validate inputs
    if (!filePath || !customPrompt) {
      throw HttpError.badRequest('File path and custom prompt are required', {
        code: 'MISSING_REQUIRED_PARAMETERS',
        context: { hasFilePath: !!filePath, hasCustomPrompt: !!customPrompt }
      });
    }

    console.log(`📝 Generating custom analysis for: ${filePath}`);
    
    // Resolve the correct file path
    const resolvedPath = resolveFilePath(filePath);
    console.log(`✅ Resolved path for custom analysis: ${resolvedPath}`);

    // ✅ EXTRACT TEXT FROM DOCUMENT
    console.log(`📖 Extracting text for custom analysis...`);
    const extractionResult = await extractDocumentText(resolvedPath);
    
    if (!extractionResult.success) {
      throw HttpError.internalServerError(`Text extraction failed: ${extractionResult.error}`, {
        code: 'TEXT_EXTRACTION_ERROR'
      });
    }
    
    console.log(`✅ Text extracted for analysis (${extractionResult.text.length} characters)`);

    // ✅ IMPROVED DIRECT CUSTOM PROMPT
    const messages = [
      {
        role: 'user',
        content: `${customPrompt}

Use the SAME LANGUAGE as the document (French, Arabic, English, etc.). Provide a direct answer without introductions or acknowledgments.

Document:
${extractionResult.text}`
      }
    ];

    // Generate text
    console.log(`🤖 Calling DeepSeek API for custom analysis...`);
    const startTime = Date.now();
    
    const response = await callDeepSeekAPI(messages, {
      maxTokens: 2048,
      temperature: 0.7
    });

    const endTime = Date.now();
    const generatedText = response.choices[0]?.message?.content || '';
    
    console.log(`✅ Custom analysis completed (${generatedText.length} characters)`);
    console.log(`📊 Processing time: ${endTime - startTime}ms`);

    if (!generatedText || generatedText.length === 0) {
      throw HttpError.internalServerError('DeepSeek returned empty analysis response', {
        code: 'EMPTY_ANALYSIS_RESPONSE'
      });
    }

    return {
      success: true,
      generatedText: generatedText,
      metadata: {
        model: DEEPSEEK_CONFIG.model,
        tokensUsed: response.usage?.total_tokens || 0,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        processingTime: endTime - startTime,
        extractionStats: extractionResult.metadata
      }
    };

  } catch (error) {
    console.error('❌ Custom text generation error:', error);
    
    // If it's already an HttpError, re-throw it
    if (error.name === 'HttpError') {
      throw error;
    }
    
    throw HttpError.internalServerError(`Text generation failed: ${error.message}`, {
      code: 'TEXT_GENERATION_ERROR',
      context: { originalError: error.message }
    });
  }
};

/**
 * Extract topics from text
 */
const extractTopics = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);
  
  const topicWords = words
    .filter(word => word.length > 3 && !stopWords.has(word))
    .filter(word => /^[a-zA-Z]+$/.test(word));
  
  const frequency = {};
  topicWords.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
};

/**
 * Check AI service status
 */
export const checkAIServiceStatus = async () => {
  try {
    console.log(`🏥 Checking DeepSeek service status...`);
    
    const messages = [
      {
        role: 'user',
        content: "Respond only with: DeepSeek operational"
      }
    ];
    
    const response = await callDeepSeekAPI(messages, {
      maxTokens: 50,
      temperature: 0.1
    });
    
    const responseText = response.choices[0]?.message?.content || '';
    
    console.log(`✅ DeepSeek service is operational`);
    return {
      success: true,
      status: 'operational',
      response: responseText,
      model: DEEPSEEK_CONFIG.model,
      tokensUsed: response.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error(`❌ DeepSeek service check failed:`, error);
    return {
      success: false,
      status: 'error',
      error: error.message
    };
  }
};

export default {
  processDocumentWithAI,
  generateQuizFromDocument,
  generateCustomText,
  checkAIServiceStatus
};