/**
 * AI Service - Complete Enhanced Version
 * @module services/ai
 * @description AI service with comprehensive quiz generation capabilities and token management
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
  model: 'deepseek-reasoner', // 'deepseek-coder' 'deepseek-reasoner'
  maxTokens: 8192,
  temperature: 0.7,
  timeout: 300000 // 5 minutes timeout for big requests
};

// 🔥 TOKEN MANAGEMENT FUNCTIONS
/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
const estimateTokenCount = (text) => {
  return Math.ceil(text.length / 4);
};

/**
 * Smart text chunking that preserves sentence structure
 */
const chunkTextForAI = (text, maxTokens = 50000) => {
  const maxChars = maxTokens * 4; // Convert tokens to characters
  
  if (text.length <= maxChars) {
    return text;
  }
  
  console.log(`⚠️ Text too long (${text.length} chars, ~${estimateTokenCount(text)} tokens). Chunking to ${maxTokens} tokens...`);
  
  // Try to find a good breaking point (end of paragraph or sentence)
  let breakPoint = maxChars;
  
  // Look for paragraph break first (double newline)
  const paragraphBreak = text.lastIndexOf('\n\n', maxChars);
  if (paragraphBreak > maxChars * 0.7) {
    breakPoint = paragraphBreak;
  } else {
    // Look for sentence break
    const sentenceBreak = text.lastIndexOf('.', maxChars);
    if (sentenceBreak > maxChars * 0.8) {
      breakPoint = sentenceBreak + 1;
    }
  }
  
  const chunkedText = text.substring(0, breakPoint).trim();
  console.log(`✂️ Text chunked: ${text.length} → ${chunkedText.length} chars (~${estimateTokenCount(chunkedText)} tokens)`);
  
  return chunkedText;
};

// 🔥 COMPREHENSIVE QUIZ GENERATION CONFIGURATION
const QUIZ_GENERATION_CONFIG = {
  difficultiesCount: {
    easy: 1,    
    medium: 1,  
    hard: 1     
  },
  questionTypes: ['true_false', 'multiple_choice', 'fill_blank'],
  questionsPerQuiz: 10, // Keep as 10 - DO NOT CHANGE
  
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
 * 🆕 DETECT DOCUMENT LANGUAGE
 */
const detectLanguage = (text) => {
  const textSample = text.substring(0, 1000).toLowerCase();
  
  // French indicators
  const frenchWords = ['le', 'la', 'les', 'de', 'des', 'du', 'et', 'un', 'une', 'dans', 'pour', 'avec', 'sur', 'par', 'que', 'qui', 'est', 'sont', 'ont', 'à', 'au', 'aux'];
  const englishWords = ['the', 'and', 'of', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'from', 'they', 'we', 'been', 'have', 'their', 'said'];
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una'];
  
  const frenchScore = frenchWords.reduce((score, word) => {
    return score + (textSample.split(' ').filter(w => w === word).length);
  }, 0);
  
  const englishScore = englishWords.reduce((score, word) => {
    return score + (textSample.split(' ').filter(w => w === word).length);
  }, 0);
  
  const spanishScore = spanishWords.reduce((score, word) => {
    return score + (textSample.split(' ').filter(w => w === word).length);
  }, 0);
  
  console.log(`🔍 Language detection scores: French=${frenchScore}, English=${englishScore}, Spanish=${spanishScore}`);
  
  if (frenchScore > englishScore && frenchScore > spanishScore) {
    return 'fr';
  } else if (spanishScore > englishScore) {
    return 'es';
  }
  return 'en'; // Default to English
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
    const timeoutId = setTimeout(() => controller.abort(), 60000);

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
 * 🔥 UPDATED FUNCTION: Process document with AI with token management
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

    // 🆕 DETECT LANGUAGE
    const detectedLanguage = detectLanguage(extractionResult.text);
    console.log(`🌍 Detected language: ${detectedLanguage}`);

    // 🔥 CHUNK TEXT TO STAY WITHIN TOKEN LIMITS
    const chunkedText = chunkTextForAI(extractionResult.text, 100000); // Leave room for prompt + response

    const prompt = `
Please analyze this document and provide:
1. A comprehensive summary (3-4 paragraphs)
2. Key points (5-7 bullet points)
3. Main topics covered (3-5 topics)

${detectedLanguage === 'fr' ? 'Veuillez répondre en français.' : detectedLanguage === 'es' ? 'Por favor responde en español.' : 'Please respond in English.'}

Document content:
${chunkedText}

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

    // 🔥 RESTORE ORIGINAL MAX_TOKENS
    const response = await callDeepSeekAPI(messages, {
      maxTokens: 8192,
      temperature: 0.7
    });
    
    let content = response.choices[0]?.message?.content || '';
    
    // Parse JSON response
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}') + 1;
    
    if (startIndex === -1 || endIndex === 0) {
      throw new Error('No JSON found in AI response');
    }
    
    let jsonContent = content.substring(startIndex, endIndex);

    // Clean up common JSON issues
    jsonContent = jsonContent
      .replace(/[\u201C\u201D]/g, '"')  // Fix smart quotes
      .replace(/[\u2018\u2019]/g, "'")  // Fix smart apostrophes
      .replace(/,\s*}/g, '}')          // Remove trailing commas
      .replace(/,\s*]/g, ']')          // Remove trailing commas in arrays
      .replace(/\n/g, ' ')             // Remove line breaks
      .replace(/\r/g, '')              // Remove carriage returns
      .trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('❌ JSON parse failed, attempting cleanup...');
      console.error('❌ Problematic JSON:', jsonContent.substring(1100, 1300)); // Show around error position
      
      // Try more aggressive cleanup
      jsonContent = jsonContent
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')  // Add quotes to unquoted keys
        .replace(/:\s*([^",\[\]{}]+?)(\s*[,}])/g, ': "$1"$2')          // Quote unquoted values
        .replace(/: "(\d+)"([,}])/g, ': $1$2')                         // Unquote numbers
        .replace(/: "(true|false|null)"([,}])/g, ': $1$2')            // Unquote booleans/null
        
      try {
        parsedResult = JSON.parse(jsonContent);
        console.log('✅ JSON recovered after cleanup');
      } catch (secondError) {
        throw new Error(`JSON parsing failed even after cleanup: ${secondError.message}`);
      }
    }

    return {
      success: true,
      summary: parsedResult.summary,
      keyPoints: parsedResult.keyPoints || [],
      topics: parsedResult.topics || [],
      extractedText: extractionResult.text, // Return full text
      detectedLanguage: detectedLanguage, // 🆕 ADD LANGUAGE INFO
      metadata: {
        model: DEEPSEEK_CONFIG.model,
        tokensUsed: response.usage?.total_tokens || 0,
        wordCount: extractionResult.metadata.wordCount,
        pageCount: extractionResult.metadata.pageCount,
        originalTextLength: extractionResult.text.length,
        processedTextLength: chunkedText.length,
        wasChunked: chunkedText.length < extractionResult.text.length,
        detectedLanguage: detectedLanguage, // 🆕 ADD TO METADATA
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
 * 🔥 ORIGINAL FUNCTION: Generate quiz from document (with token management)
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

    // 🔥 CHUNK TEXT FOR QUIZ GENERATION
    const chunkedText = chunkTextForAI(extractionResult.text, 70000);

    const prompt = `Create a ${difficulty} difficulty quiz with ${questionCount} ${questionType.replace('_', ' ')} questions based on this document.

${questionType === 'multiple_choice' ? 'Each question should have 4 options with one correct answer.' :
  questionType === 'true_false' ? 'Each question should be answerable with True or False.' :
  'Each question should have a fill-in-the-blank format.'}

Document content:
${chunkedText}

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

    const response = await callDeepSeekAPI(messages, {
      maxTokens: 8192,
      temperature: 0.7
    });
    
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
        generatedAt: new Date().toISOString(),
        wasChunked: chunkedText.length < extractionResult.text.length
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
 * 🔥 NEW FUNCTION: Generate comprehensive quiz collection with token management
 */
export const generateComprehensiveQuizCollection = async (filePath, options = {}) => {
  const startTime = Date.now();
  
  try {
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

    // 🆕 DETECT LANGUAGE
    const detectedLanguage = detectLanguage(extractionResult.text);
    console.log(`🌍 Detected language for quizzes: ${detectedLanguage}`);

    // Prompt Building Timer
    const promptStart = Date.now();
    const prompt = buildComprehensiveQuizPrompt(extractionResult.text, detectedLanguage);
    const messages = [{ role: 'user', content: prompt }];
    const promptTime = Date.now() - promptStart;
    console.log(`⏱️  Prompt building completed in ${promptTime}ms`);

    console.log(`🤖 TIMER: Calling DeepSeek API for comprehensive quiz generation...`);
    
    // AI API Call Timer (THE MAIN ONE)
    const aiStartTime = Date.now();
    const response = await callDeepSeekAPI(messages, {
      maxTokens: 8192,  // RESTORE ORIGINAL
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

    // 🆕 IMPROVED JSON PARSING WITH RECOVERY
    const quizCollection = parseComprehensiveQuizCollection(rawResponse, detectedLanguage);

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
        detectedLanguage: detectedLanguage, // 🆕 ADD LANGUAGE INFO
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
 * 🆕 Build OPTIMIZED quiz prompt with language support
 */
const buildComprehensiveQuizPrompt = (documentText, language = 'en') => {
  // 🔥 CHUNK TEXT FOR QUIZ GENERATION
  const chunkedText = chunkTextForAI(documentText, 60000); // Smaller chunk for quiz generation
  
  // 🆕 LANGUAGE-SPECIFIC SETTINGS
  const languageSettings = {
    en: {
      instruction: 'Please respond in English.',
      trueOption: 'True',
      falseOption: 'False',
      sampleQuestion: 'What is the primary purpose of financial ratio analysis?',
      sampleOptions: ['To calculate taxes', 'To evaluate company performance and financial health', 'To determine employee salaries', 'To set product prices']
    },
    fr: {
      instruction: 'Veuillez répondre en français.',
      trueOption: 'Vrai',
      falseOption: 'Faux',
      sampleQuestion: 'Quel est l\'objectif principal de l\'analyse des ratios financiers?',
      sampleOptions: ['Calculer les impôts', 'Évaluer la performance et la santé financière de l\'entreprise', 'Déterminer les salaires des employés', 'Fixer les prix des produits']
    },
    es: {
      instruction: 'Por favor responde en español.',
      trueOption: 'Verdadero',
      falseOption: 'Falso',
      sampleQuestion: '¿Cuál es el propósito principal del análisis de ratios financieros?',
      sampleOptions: ['Calcular impuestos', 'Evaluar el rendimiento y la salud financiera de la empresa', 'Determinar los salarios de los empleados', 'Establecer precios de productos']
    }
  };

  const settings = languageSettings[language] || languageSettings.en;
  
  return `TASK: Generate EXACTLY 2 complete quizzes testing CORE CONCEPTS from this educational content.

${settings.instruction}

CRITICAL REQUIREMENTS:
1. Focus on CONCEPTS, PRINCIPLES, and KNOWLEDGE - NOT document metadata
2. Questions should test UNDERSTANDING of the subject matter
3. Avoid questions about "this document", "the author", "this chapter", etc.
4. EVERY question MUST have correctAnswer field
5. EVERY question MUST have correctAnswerIndex field
6. Each quiz must have EXACTLY 10 questions - NO MORE, NO LESS
7. EVERY question MUST have skillCategory and topicArea fields
8. EVERY question MUST have personalized strength and weakness descriptions specific to that question
9. Multiple choice: 4 options, correct answer must match one option exactly
10. True/False: options ["${settings.trueOption}", "${settings.falseOption}"], correct answer must be "${settings.trueOption}" or "${settings.falseOption}"

SKILL CATEGORIES (choose one for each question):
- factual_recall: Basic facts, definitions, and memorization
- conceptual_understanding: Understanding relationships and concepts
- analytical_thinking: Analysis, interpretation, and evaluation
- procedural_knowledge: How-to knowledge and processes
- critical_thinking: Judgment, evaluation, and decision-making

GENERATE EXACTLY THIS JSON STRUCTURE WITH 10 QUESTIONS EACH:

{
  "quizzes": [
    {
      "title": "Core Concepts Quiz",
      "difficulty": "mixed", 
      "type": "multiple_choice",
      "questions": [
        {
          "id": 1,
          "question": "${settings.sampleQuestion}",
          "options": ${JSON.stringify(settings.sampleOptions)},
          "correctAnswer": "${settings.sampleOptions[1]}",
          "correctAnswerIndex": 1,
          "explanation": "Explanation here",
          "points": 1,
          "skillCategory": "conceptual_understanding",
          "topicArea": "financial_analysis",
          "strength": "Strong understanding of financial analysis fundamentals",
          "weakness": "Should review the basic purposes of financial analysis"
        }
      ]
    },
    {
      "title": "Concept Validation Quiz",
      "difficulty": "mixed",
      "type": "true_false", 
      "questions": [
        {
          "id": 1,
          "question": "Question here?",
          "options": ["${settings.trueOption}", "${settings.falseOption}"],
          "correctAnswer": "${settings.falseOption}",
          "correctAnswerIndex": 1,
          "explanation": "Explanation here",
          "points": 1,
          "skillCategory": "conceptual_understanding",
          "topicArea": "analysis_principles",
          "strength": "Clear understanding of comprehensive analysis requirements",
          "weakness": "Should learn that analysis extends beyond just numbers"
        }
      ]
    }
  ]
}

CONTENT TO ANALYZE FOR CORE CONCEPTS:
${chunkedText}

CRITICAL: Generate EXACTLY 10 questions for each quiz. The first quiz should be multiple_choice with 4 options each. The second quiz should be true_false with ["${settings.trueOption}", "${settings.falseOption}"] options.`;
};

/**
 * 🆕 IMPROVED: Parse comprehensive quiz collection with better error handling
 */
const parseComprehensiveQuizCollection = (rawResponse, language = 'en') => {
  try {
    console.log(`🔍 Parsing comprehensive quiz collection...`);
    
    let cleanedResponse = rawResponse.trim();
    
    // Remove potential markdown formatting
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON boundaries more robustly
    let jsonStart = cleanedResponse.indexOf('{');
    let jsonEnd = -1;
    
    if (jsonStart !== -1) {
      // Find the matching closing brace
      let braceCount = 0;
      for (let i = jsonStart; i < cleanedResponse.length; i++) {
        if (cleanedResponse[i] === '{') {
          braceCount++;
        } else if (cleanedResponse[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i + 1;
            break;
          }
        }
      }
    }
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('❌ No valid JSON object found in AI response');
      console.error('❌ Raw response preview:', rawResponse.substring(0, 1000));
      throw new Error('No JSON object found in response');
    }
    
    const jsonContent = cleanedResponse.substring(jsonStart, jsonEnd);
    console.log('🔍 Attempting to parse JSON of length:', jsonContent.length);
    
    let quizData;
    try {
      quizData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.error('❌ JSON content preview:', jsonContent.substring(0, 500));
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }
    
    if (!quizData.quizzes) {
      console.error('❌ Invalid quiz structure: missing quizzes array');
      throw new Error('Invalid quiz structure: missing quizzes array');
    }
    
    const allQuizzes = [];
    
    for (let i = 0; i < quizData.quizzes.length; i++) {
      const quiz = quizData.quizzes[i];
      console.log(`🔍 Processing quiz ${i + 1}: ${quiz.title} (${quiz.type})`);
      
      // Check if quiz has questions with correct answers
      if (quiz.questions && quiz.questions.length > 0) {
        const questionsWithCorrectAnswers = quiz.questions.filter(q => q.correctAnswer);
        console.log(`📊 Quiz ${i + 1}: ${questionsWithCorrectAnswers.length}/${quiz.questions.length} questions have correctAnswer fields`);
        
        if (questionsWithCorrectAnswers.length === 0) {
          console.error(`❌ Quiz ${i + 1}: NO questions have correct answers!`);
        }
      }
      
      const validatedQuiz = validateQuiz(quiz, quiz.difficulty, quiz.type, language);
      if (validatedQuiz) {
        allQuizzes.push(validatedQuiz);
        console.log(`✅ Quiz ${i + 1} validated successfully with ${validatedQuiz.questions.length} questions`);
      } else {
        console.error(`❌ Quiz ${i + 1} validation failed`);
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
    console.error('❌ Raw response preview:', rawResponse.substring(0, 500));
    throw error; // Let it fail properly instead of returning empty
  }
};

/**
 * Validate individual quiz
 */
const validateQuiz = (quiz, expectedDifficulty, expectedType, language = 'en') => {
  try {
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Quiz missing questions array');
    }
    
    const validatedQuestions = quiz.questions
      .map((q, index) => validateQuestion(q, index + 1, expectedType, language))
      .filter(q => q !== null);
    
    if (validatedQuestions.length === 0) {
      throw new Error('No valid questions found in quiz');
    }
    
    // ✅ CLEAN THE TITLE - REMOVE SPECIAL CHARACTERS
    const cleanTitle = (quiz.title || `${expectedDifficulty} ${expectedType} Quiz`)
      .replace(/[^a-zA-Z0-9\s\-_.,()[\]À-ÿ]/g, '') // Allow accented characters
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
        questionType: expectedType, 
        type: expectedType, 
        generationType: 'bulk_generation',
        model: 'deepseek-coder',
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
const validateQuestion = (question, questionId, questionType, language = 'en') => {
  try {
    if (!question.question || typeof question.question !== 'string') {
      throw new Error(`Question ${questionId}: missing question text`);
    }
    
    // 🔧 CRITICAL FIX: Ensure correctAnswer exists and is valid
    if (!question.correctAnswer) {
      console.error(`❌ Question ${questionId}: missing correctAnswer field`);
      throw new Error(`Question ${questionId}: missing correct answer`);
    }

    // 🆕 VALIDATE SKILL CATEGORY AND TOPIC AREA
    if (!question.skillCategory) {
      console.warn(`⚠️ Question ${questionId}: missing skillCategory, using default`);
      question.skillCategory = 'factual_recall';
    }

    if (!question.topicArea) {
      console.warn(`⚠️ Question ${questionId}: missing topicArea, using default`);
      question.topicArea = 'general_knowledge';
    }

    // 🆕 VALIDATE PERSONALIZED STRENGTH/WEAKNESS
    if (!question.strength || question.strength.length < 10) {
      console.warn(`⚠️ Question ${questionId}: missing or too short strength description`);
      question.strength = `Good understanding of ${question.topicArea || 'the concept being tested'}`;
    }

    if (!question.weakness || question.weakness.length < 10) {
      console.warn(`⚠️ Question ${questionId}: missing or too short weakness description`);
      question.weakness = `Needs to review ${question.topicArea || 'the fundamental concepts'} covered in this question`;
    }
    
    const validatedQuestion = {
      id: questionId,
      question: question.question.trim(),
      options: question.options || [],
      correctAnswer: question.correctAnswer,
      correctAnswerIndex: question.correctAnswerIndex !== undefined ? question.correctAnswerIndex : 0,
      explanation: question.explanation || 'No explanation provided',
      points: question.points || 1,
      skillCategory: question.skillCategory,
      topicArea: question.topicArea,
      strength: question.strength.trim(),
      weakness: question.weakness.trim()
    };
    
    // 🆕 LANGUAGE-SPECIFIC VALIDATION
    const languageSettings = {
      en: { trueOption: 'True', falseOption: 'False' },
      fr: { trueOption: 'Vrai', falseOption: 'Faux' },
      es: { trueOption: 'Verdadero', falseOption: 'Falso' }
    };

    const settings = languageSettings[language] || languageSettings.en;
    
    switch (questionType) {
      case 'multiple_choice':
        if (!Array.isArray(question.options) || question.options.length !== 4) {
          throw new Error(`Question ${questionId}: multiple choice must have exactly 4 options`);
        }
        
        const correctIndex = question.options.indexOf(question.correctAnswer);
        if (correctIndex === -1) {
          console.error(`❌ Question ${questionId}: correctAnswer "${question.correctAnswer}" not found in options:`, question.options);
          throw new Error(`Question ${questionId}: correct answer "${question.correctAnswer}" not found in options`);
        }
        
        validatedQuestion.correctAnswerIndex = correctIndex;
        console.log(`✅ Question ${questionId}: correctAnswer="${question.correctAnswer}" at index ${correctIndex}`);
        break;
        
      case 'true_false':
        // 🆕 SET LANGUAGE-SPECIFIC OPTIONS
        validatedQuestion.options = [settings.trueOption, settings.falseOption];
        
        const normalizedAnswer = question.correctAnswer.toString();
        if (![settings.trueOption, settings.falseOption].includes(normalizedAnswer)) {
          console.error(`❌ Question ${questionId}: true/false answer must be '${settings.trueOption}' or '${settings.falseOption}', got:`, question.correctAnswer);
          throw new Error(`Question ${questionId}: true/false answer must be '${settings.trueOption}' or '${settings.falseOption}'`);
        }
        
        validatedQuestion.correctAnswer = normalizedAnswer;
        validatedQuestion.correctAnswerIndex = normalizedAnswer === settings.trueOption ? 0 : 1;
        console.log(`✅ Question ${questionId}: correctAnswer="${normalizedAnswer}" at index ${validatedQuestion.correctAnswerIndex}`);
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

    // 🔥 CHUNK TEXT FOR CUSTOM GENERATION
    const chunkedText = chunkTextForAI(extractionResult.text, 70000);

    const fullPrompt = `${prompt}

Document content:
${chunkedText}`;

    const messages = [{
      role: 'user',
      content: fullPrompt
    }];

    const response = await callDeepSeekAPI(messages, {
      maxTokens: 8192,
      ...options
    });
    
    const generatedText = response.choices[0]?.message?.content || '';

    return {
      success: true,
      generatedText,
      metadata: {
        model: DEEPSEEK_CONFIG.model,
        tokensUsed: response.usage?.total_tokens || 0,
        prompt: prompt,
        wasChunked: chunkedText.length < extractionResult.text.length
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