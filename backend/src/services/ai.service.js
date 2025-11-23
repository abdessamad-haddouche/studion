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
  model: 'deepseek-coder',
  maxTokens: 4096, // Reduced from 8192
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
const chunkTextForAI = (text, maxTokens = 80000) => {
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

    // 🔥 CHUNK TEXT TO STAY WITHIN TOKEN LIMITS
    const chunkedText = chunkTextForAI(extractionResult.text, 80000); // Leave room for prompt + response

    const prompt = `
Please analyze this document and provide:
1. A comprehensive summary (3-4 paragraphs)
2. Key points (5-7 bullet points)
3. Main topics covered (3-5 topics)

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

    // 🔥 REDUCE MAX_TOKENS TO STAY WITHIN LIMIT
    const response = await callDeepSeekAPI(messages, {
      maxTokens: 4096, // Reduced from 8192
      temperature: 0.7
    });
    
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
      extractedText: extractionResult.text, // Return full text
      metadata: {
        model: DEEPSEEK_CONFIG.model,
        tokensUsed: response.usage?.total_tokens || 0,
        wordCount: extractionResult.metadata.wordCount,
        pageCount: extractionResult.metadata.pageCount,
        originalTextLength: extractionResult.text.length,
        processedTextLength: chunkedText.length,
        wasChunked: chunkedText.length < extractionResult.text.length,
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
      maxTokens: 4096, // Reduced
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
      maxTokens: 4096,  // Reduced for token management
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
 * Build OPTIMIZED quiz prompt with token management
 */
const buildComprehensiveQuizPrompt = (documentText) => {
  // 🔥 CHUNK TEXT FOR QUIZ GENERATION
  const chunkedText = chunkTextForAI(documentText, 60000); // Smaller chunk for quiz generation
  
  return `TASK: Generate EXACTLY 2 complete quizzes testing CORE CONCEPTS from this educational content.

CRITICAL REQUIREMENTS:
1. Focus on CONCEPTS, PRINCIPLES, and KNOWLEDGE - NOT document metadata
2. Questions should test UNDERSTANDING of the subject matter
3. Avoid questions about "this document", "the author", "this chapter", etc.
4. EVERY question MUST have correctAnswer field
5. EVERY question MUST have correctAnswerIndex field
6. 🆕 EVERY question MUST have skillCategory and topicArea fields
7. 🆕 EVERY question MUST have personalized strength and weakness descriptions specific to that question
8. Multiple choice: 4 options, correct answer must match one option exactly
9. True/False: options ["True", "False"], correct answer must be "True" or "False"

🆕 SKILL CATEGORIES (choose one for each question):
- factual_recall: Basic facts, definitions, and memorization
- conceptual_understanding: Understanding relationships and concepts
- analytical_thinking: Analysis, interpretation, and evaluation
- procedural_knowledge: How-to knowledge and processes
- critical_thinking: Judgment, evaluation, and decision-making

🆕 TOPIC AREAS: Extract the main subject/topic from the document content (e.g., "financial_analysis", "project_management", "data_structures")

🆕 PERSONALIZED STRENGTH/WEAKNESS DESCRIPTIONS:
- strength: Write a specific, encouraging message about what the user demonstrates they understand well if they answer correctly. Be specific to the question content, not generic.
- weakness: Write a specific, helpful message about what the user should review or study more if they answer incorrectly. Be specific to the question content, not generic.

EXAMPLES:
❌ Generic (BAD): "strength": "analytical_thinking", "weakness": "conceptual_understanding"
✅ Specific (GOOD): "strength": "Excellent understanding of financial ratio purposes and their role in business performance evaluation", "weakness": "Should review the fundamental purposes of financial analysis and why ratios are essential for evaluating company health"

GENERATE EXACTLY THIS JSON STRUCTURE:

{
  "quizzes": [
    {
      "title": "Core Concepts Quiz",
      "difficulty": "mixed", 
      "type": "multiple_choice",
      "questions": [
        {
          "id": 1,
          "question": "What is the primary purpose of financial ratio analysis?",
          "options": ["To calculate taxes", "To evaluate company performance and financial health", "To determine employee salaries", "To set product prices"],
          "correctAnswer": "To evaluate company performance and financial health",
          "correctAnswerIndex": 1,
          "explanation": "Financial ratio analysis helps assess a company's financial performance and health",
          "points": 1,
          "skillCategory": "conceptual_understanding",
          "topicArea": "financial_analysis",
          "strength": "Strong understanding of financial analysis fundamentals and the role of ratios in performance evaluation",
          "weakness": "Should review the basic purposes of financial analysis and why ratios are crucial for business assessment"
        },
        {
          "id": 2,
          "question": "Which financial statement primarily shows profitability over a period?",
          "options": ["Balance Sheet", "Income Statement", "Statement of Cash Flows", "Statement of Equity"],
          "correctAnswer": "Income Statement",
          "correctAnswerIndex": 1,
          "explanation": "The Income Statement shows revenues, expenses, and profit over a specific period",
          "points": 1,
          "skillCategory": "factual_recall",
          "topicArea": "financial_statements",
          "strength": "Good knowledge of financial statement purposes and can distinguish between different statement types effectively",
          "weakness": "Needs to study the specific functions of each financial statement, particularly income statement vs balance sheet differences"
        },
        {
          "id": 3,
          "question": "What does a current ratio below 1.0 typically suggest?",
          "options": ["Strong financial position", "Potential liquidity problems", "High profitability", "Low debt levels"],
          "correctAnswer": "Potential liquidity problems",
          "correctAnswerIndex": 1,
          "explanation": "A current ratio below 1.0 indicates current liabilities exceed current assets",
          "points": 1,
          "skillCategory": "analytical_thinking",
          "topicArea": "liquidity_analysis",
          "strength": "Excellent grasp of liquidity ratios and ability to interpret financial health indicators accurately",
          "weakness": "Should review liquidity ratio calculations and what different ratio values indicate about company financial health"
        },
        {
          "id": 4,
          "question": "Which ratio measures a company's ability to pay short-term obligations?",
          "options": ["Debt-to-equity ratio", "Quick ratio", "Return on assets", "Gross profit margin"],
          "correctAnswer": "Quick ratio",
          "correctAnswerIndex": 1,
          "explanation": "The quick ratio measures immediate liquidity and ability to pay short-term debts",
          "points": 1,
          "skillCategory": "factual_recall",
          "topicArea": "liquidity_ratios",
          "strength": "Solid knowledge of different financial ratios and their specific purposes in financial analysis",
          "weakness": "Needs to memorize and understand the different types of financial ratios and what each one measures specifically"
        },
        {
          "id": 5,
          "question": "What does a declining gross profit margin indicate?",
          "options": ["Improving efficiency", "Rising costs or pricing pressure", "Increased sales volume", "Better inventory management"],
          "correctAnswer": "Rising costs or pricing pressure",
          "correctAnswerIndex": 1,
          "explanation": "Declining gross margins suggest costs are rising faster than prices",
          "points": 1,
          "skillCategory": "analytical_thinking",
          "topicArea": "profitability_analysis",
          "strength": "Strong analytical skills in interpreting profitability trends and understanding cost-price relationships",
          "weakness": "Should study how gross profit margins work and what causes them to increase or decrease over time"
        },
        {
          "id": 6,
          "question": "What is the main focus of liquidity analysis?",
          "options": ["Long-term profitability", "Short-term payment ability", "Market share growth", "Employee productivity"],
          "correctAnswer": "Short-term payment ability",
          "correctAnswerIndex": 1,
          "explanation": "Liquidity analysis focuses on a company's ability to meet short-term obligations",
          "points": 1,
          "skillCategory": "conceptual_understanding",
          "topicArea": "liquidity_analysis",
          "strength": "Clear understanding of liquidity concepts and why short-term payment ability matters for businesses",
          "weakness": "Needs to review what liquidity means in business context and why it's important for company operations"
        },
        {
          "id": 7,
          "question": "Which type of analysis compares financial data across multiple periods?",
          "options": ["Vertical analysis", "Horizontal analysis", "Ratio analysis", "Variance analysis"],
          "correctAnswer": "Horizontal analysis",
          "correctAnswerIndex": 1,
          "explanation": "Horizontal analysis examines trends by comparing data across time periods",
          "points": 1,
          "skillCategory": "procedural_knowledge",
          "topicArea": "financial_analysis_methods",
          "strength": "Good understanding of different financial analysis techniques and when to use horizontal vs vertical analysis",
          "weakness": "Should review the various financial analysis methods and understand when each technique is most appropriate to use"
        },
        {
          "id": 8,
          "question": "What does return on equity (ROE) measure?",
          "options": ["Asset efficiency", "Debt management", "Profitability relative to shareholders' equity", "Liquidity position"],
          "correctAnswer": "Profitability relative to shareholders' equity",
          "correctAnswerIndex": 2,
          "explanation": "ROE measures how effectively a company generates profit from shareholders' investments",
          "points": 1,
          "skillCategory": "conceptual_understanding",
          "topicArea": "profitability_ratios",
          "strength": "Excellent understanding of return on equity and how it measures management's effectiveness in using shareholder investments",
          "weakness": "Needs to study profitability ratios, particularly how ROE relates shareholder equity to company earnings"
        },
        {
          "id": 9,
          "question": "Which factor is most important for comprehensive financial analysis?",
          "options": ["Only quantitative ratios", "Both quantitative and qualitative factors", "Only historical data", "Only industry comparisons"],
          "correctAnswer": "Both quantitative and qualitative factors",
          "correctAnswerIndex": 1,
          "explanation": "Effective analysis requires both numerical data and qualitative insights",
          "points": 1,
          "skillCategory": "critical_thinking",
          "topicArea": "comprehensive_analysis",
          "strength": "Advanced understanding that effective financial analysis requires both numbers and contextual business insights",
          "weakness": "Should learn that financial analysis isn't just about calculations but also requires considering qualitative business factors"
        },
        {
          "id": 10,
          "question": "What is the purpose of benchmarking in financial analysis?",
          "options": ["To reduce costs", "To compare performance against standards or competitors", "To increase revenue", "To hire employees"],
          "correctAnswer": "To compare performance against standards or competitors",
          "correctAnswerIndex": 1,
          "explanation": "Benchmarking provides context by comparing performance to relevant standards",
          "points": 1,
          "skillCategory": "procedural_knowledge",
          "topicArea": "benchmarking",
          "strength": "Good grasp of benchmarking concepts and why comparative analysis is essential for meaningful financial evaluation",
          "weakness": "Should study benchmarking techniques and understand why comparing to industry standards provides valuable business insights"
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
          "question": "Financial analysis only considers quantitative data and ignores qualitative factors.",
          "options": ["True", "False"],
          "correctAnswer": "False",
          "correctAnswerIndex": 1,
          "explanation": "Effective financial analysis incorporates both quantitative and qualitative factors",
          "points": 1,
          "skillCategory": "conceptual_understanding",
          "topicArea": "financial_analysis_principles",
          "strength": "Clear understanding that comprehensive financial analysis requires both numerical data and qualitative business insights",
          "weakness": "Should learn that financial analysis extends beyond just numbers and must include qualitative business factors for complete evaluation"
        },
        {
          "id": 2,
          "question": "The balance sheet provides a snapshot of financial position at a specific point in time.",
          "options": ["True", "False"],
          "correctAnswer": "True", 
          "correctAnswerIndex": 0,
          "explanation": "The balance sheet shows assets, liabilities, and equity at a specific date",
          "points": 1,
          "skillCategory": "factual_recall",
          "topicArea": "balance_sheet",
          "strength": "Solid knowledge of balance sheet timing and understands it represents financial position at a specific moment",
          "weakness": "Needs to review balance sheet fundamentals and understand that it shows financial position at one point in time, not over a period"
        },
        {
          "id": 3,
          "question": "A high inventory turnover ratio always indicates excellent inventory management.",
          "options": ["True", "False"],
          "correctAnswer": "False",
          "correctAnswerIndex": 1,
          "explanation": "Very high turnover might indicate stockouts or inadequate inventory levels",
          "points": 1,
          "skillCategory": "analytical_thinking",
          "topicArea": "inventory_management",
          "strength": "Advanced analytical thinking - understands that high ratios aren't always positive and can indicate inventory shortages",
          "weakness": "Should study inventory management ratios more deeply and learn that extremely high turnover can signal inadequate stock levels"
        },
        {
          "id": 4,
          "question": "Liquidity ratios measure a company's ability to meet short-term obligations.",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "correctAnswerIndex": 0,
          "explanation": "Liquidity ratios assess the ability to pay short-term debts and obligations",
          "points": 1,
          "skillCategory": "factual_recall",
          "topicArea": "liquidity_ratios",
          "strength": "Good foundational knowledge of what liquidity ratios measure and their importance for short-term financial health",
          "weakness": "Needs to review liquidity ratio concepts and understand how they measure a company's ability to pay immediate obligations"
        },
        {
          "id": 5,
          "question": "Profitability and cash flow always move in the same direction.",
          "options": ["True", "False"],
          "correctAnswer": "False",
          "correctAnswerIndex": 1,
          "explanation": "Companies can be profitable but have cash flow problems due to timing differences",
          "points": 1,
          "skillCategory": "conceptual_understanding",
          "topicArea": "profitability_vs_cashflow",
          "strength": "Sophisticated understanding of the difference between accounting profits and actual cash movements in business operations",
          "weakness": "Should study the relationship between profitability and cash flow and learn why they can differ due to accounting timing"
        },
        {
          "id": 6,
          "question": "Vertical analysis expresses each line item as a percentage of a base amount.",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "correctAnswerIndex": 0,
          "explanation": "Vertical analysis shows proportional relationships using percentages",
          "points": 1,
          "skillCategory": "procedural_knowledge",
          "topicArea": "vertical_analysis",
          "strength": "Good understanding of vertical analysis technique and how it uses percentages to show proportional financial relationships",
          "weakness": "Needs to review vertical analysis methodology and understand how it expresses financial statement items as percentages"
        },
        {
          "id": 7,
          "question": "Industry comparison is unnecessary when analyzing financial ratios.",
          "options": ["True", "False"],
          "correctAnswer": "False",
          "correctAnswerIndex": 1,
          "explanation": "Industry benchmarks provide essential context for ratio interpretation",
          "points": 1,
          "skillCategory": "critical_thinking",
          "topicArea": "industry_comparison",
          "strength": "Excellent critical thinking - recognizes that financial ratios need industry context to be meaningful and actionable",
          "weakness": "Should learn that financial ratios must be compared to industry standards to provide meaningful insights about company performance"
        },
        {
          "id": 8,
          "question": "Working capital represents the difference between current assets and current liabilities.",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "correctAnswerIndex": 0,
          "explanation": "Working capital = Current Assets - Current Liabilities",
          "points": 1,
          "skillCategory": "factual_recall",
          "topicArea": "working_capital",
          "strength": "Accurate knowledge of working capital calculation and understanding of this fundamental liquidity measure",
          "weakness": "Needs to memorize working capital formula and understand what current assets minus current liabilities represents"
        },
        {
          "id": 9,
          "question": "Financial leverage always improves return on equity.",
          "options": ["True", "False"],
          "correctAnswer": "False",
          "correctAnswerIndex": 1,
          "explanation": "Leverage can increase ROE but also increases financial risk",
          "points": 1,
          "skillCategory": "analytical_thinking",
          "topicArea": "financial_leverage",
          "strength": "Strong analytical understanding that financial leverage involves trade-offs between returns and risk",
          "weakness": "Should study financial leverage concepts and learn that debt can amplify both gains and losses, affecting risk levels"
        },
        {
          "id": 10,
          "question": "Trend analysis helps identify patterns in financial performance over time.",
          "options": ["True", "False"],
          "correctAnswer": "True",
          "correctAnswerIndex": 0,
          "explanation": "Trend analysis reveals performance patterns across multiple periods",
          "points": 1,
          "skillCategory": "procedural_knowledge",
          "topicArea": "trend_analysis",
          "strength": "Good understanding of trend analysis purpose and how it reveals patterns in financial performance over multiple time periods",
          "weakness": "Should review trend analysis techniques and understand how they help identify patterns in financial data over time"
        }
      ]
    }
  ]
}

CONTENT TO ANALYZE FOR CORE CONCEPTS:
${chunkedText}

IMPORTANT REMINDERS:
1. Make strength descriptions encouraging and specific about what knowledge the user demonstrates
2. Make weakness descriptions helpful and specific about what the user should study or review
3. Each strength/weakness should be unique to that specific question - no generic responses
4. Focus descriptions on the actual concept being tested, not just the skill category
5. Keep descriptions between 15-50 words for readability
6. Use positive, learning-focused language that helps students improve

Remember: Generate questions that test understanding of the CONCEPTS and PRINCIPLES discussed in the content, with personalized strength/weakness feedback for each question that relates directly to what that specific question tests.`;
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
      console.error('❌ No JSON object found in AI response');
      throw new Error('No JSON object found in response');
    }
    
    cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
    const quizData = JSON.parse(cleanedResponse);
    
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
      
      const validatedQuiz = validateQuiz(quiz, quiz.difficulty, quiz.type);
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
    
    // Rest of your existing validation logic remains the same...
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
        validatedQuestion.options = ['True', 'False'];
        
        const normalizedAnswer = question.correctAnswer.toString();
        if (!['True', 'False'].includes(normalizedAnswer)) {
          console.error(`❌ Question ${questionId}: true/false answer must be 'True' or 'False', got:`, question.correctAnswer);
          throw new Error(`Question ${questionId}: true/false answer must be 'True' or 'False'`);
        }
        
        validatedQuestion.correctAnswer = normalizedAnswer;
        validatedQuestion.correctAnswerIndex = normalizedAnswer === 'True' ? 0 : 1;
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
      maxTokens: 4096, // Reduced
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