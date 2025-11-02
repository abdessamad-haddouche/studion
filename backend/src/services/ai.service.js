/**
 * AI Service - Gemini Integration (FIXED MODEL NAME)
 * @module services/ai
 * @description AI processing service using Google Gemini for document analysis and text generation
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure model settings - FIXED MODEL NAME
const MODEL_CONFIG = {
  model: "gemini-2.5-flash", // Updated model name
  generationConfig: {
    temperature: 0.7, // Balanced creativity
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
};

/**
 * Resolve file path correctly regardless of working directory
 * @param {string} filePath - Original file path from database
 * @returns {string} Resolved absolute file path
 */
const resolveFilePath = (filePath) => {
  // If already absolute, use as-is
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  
  // Try multiple possible locations
  const possiblePaths = [
    // 1. Direct path from current working directory
    path.resolve(filePath),
    // 2. Path relative to current working directory
    path.resolve(process.cwd(), filePath),
    // 3. Path assuming we're in project root and files are in uploads/documents
    path.resolve(process.cwd(), 'uploads', 'documents', path.basename(filePath)),
    // 4. Path assuming we're in backend/ and files are in uploads/documents
    path.resolve(process.cwd(), '..', 'uploads', 'documents', path.basename(filePath)),
    // 5. Path for when running from project root with backend structure
    path.resolve(process.cwd(), 'backend', filePath.replace(/^\.\//, ''))
  ];
  
  // Try each path until we find one that exists
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      console.log(`✅ Found file at: ${testPath}`);
      return testPath;
    }
  }
  
  // If none found, log the attempts and throw error
  console.error(`❌ File not found. Tried paths:`);
  possiblePaths.forEach((p, i) => console.error(`   ${i + 1}. ${p}`));
  throw new Error(`File not found: ${filePath}`);
};

/**
 * Process document with AI for summarization
 * @param {string} filePath - Path to the document file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} AI processing results
 */
export const processDocumentWithAI = async (filePath, options = {}) => {
  try {
    console.log(`🔍 Processing document: ${filePath}`);
    
    // Resolve the correct file path
    const resolvedPath = resolveFilePath(filePath);
    console.log(`✅ Resolved path: ${resolvedPath}`);

    // Get file info
    const fileExtension = path.extname(resolvedPath).toLowerCase();
    const supportedTypes = ['.pdf', '.docx', '.txt'];
    
    if (!supportedTypes.includes(fileExtension)) {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    // Determine MIME type
    const mimeTypeMap = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    
    const mimeType = mimeTypeMap[fileExtension];

    // Read file
    console.log(`📖 Reading file: ${resolvedPath}`);
    const fileBuffer = fs.readFileSync(resolvedPath);
    const fileBase64 = fileBuffer.toString('base64');
    console.log(`✅ File read successfully (${fileBuffer.length} bytes)`);

    // Initialize model with fixed name
    const model = genAI.getGenerativeModel(MODEL_CONFIG);

    // Create prompt for summarization
    const summaryPrompt = `You are an expert at summarizing educational content.

Task: Analyze the following document and provide:
1. A concise summary in 5-7 bullet points
2. Key concepts and important information
3. Main topics covered

Requirements:
- Each bullet point should be clear and student-friendly
- Focus on the most important information
- Keep language simple and accessible
- Highlight key learning objectives

Document to analyze:`;

    // Generate summary
    console.log(`🤖 Calling Gemini API for summarization...`);
    const result = await model.generateContent([
      summaryPrompt,
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      }
    ]);

    const response = result.response;
    const summaryText = response.text();
    console.log(`✅ AI summarization completed (${summaryText.length} characters)`);

    // Parse response to extract bullet points
    const lines = summaryText.split('\n').filter(line => line.trim());
    const bulletPoints = lines.filter(line => 
      line.trim().startsWith('•') || 
      line.trim().startsWith('-') || 
      line.trim().startsWith('*') ||
      /^\d+\./.test(line.trim())
    ).map(line => line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());

    // Extract topics (simple keyword extraction from summary)
    const topics = extractTopics(summaryText);

    return {
      success: true,
      summary: summaryText,
      keyPoints: bulletPoints.length > 0 ? bulletPoints : [summaryText],
      topics: topics,
      metadata: {
        model: MODEL_CONFIG.model,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
        processingTime: Date.now()
      }
    };

  } catch (error) {
    console.error('❌ AI processing error:', error);
    
    // Handle specific Gemini API errors
    if (error.message.includes('quota')) {
      throw new Error('AI service quota exceeded. Please try again later.');
    }
    
    if (error.message.includes('safety')) {
      throw new Error('Content flagged by safety filters. Please try a different document.');
    }
    
    throw new Error(`AI processing failed: ${error.message}`);
  }
};

/**
 * Generate quiz questions from document
 * @param {string} filePath - Path to the document file
 * @param {Object} options - Quiz generation options
 * @returns {Promise<Object>} Generated quiz questions
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

    // Read file
    const fileBuffer = fs.readFileSync(resolvedPath);
    const fileExtension = path.extname(resolvedPath).toLowerCase();
    const mimeTypeMap = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    
    const mimeType = mimeTypeMap[fileExtension];
    const fileBase64 = fileBuffer.toString('base64');

    // Initialize model with fixed name
    const model = genAI.getGenerativeModel(MODEL_CONFIG);

    // Create quiz generation prompt
    const quizPrompt = `You are an expert educator creating multiple-choice questions.

Task: Generate ${questionCount} multiple-choice questions from this document.

Requirements:
- Difficulty level: ${difficulty}
- Each question should test understanding, not just memorization
- Provide 4 options (A, B, C, D) for each question
- Indicate the correct answer
- Provide a brief explanation for the correct answer

IMPORTANT: Respond ONLY with valid JSON in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation why this is correct"
  }
]

Document to analyze:`;

    // Generate quiz
    console.log(`🤖 Calling Gemini API for quiz generation...`);
    const result = await model.generateContent([
      quizPrompt,
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      }
    ]);

    const response = result.response;
    let quizText = response.text();

    // Clean and parse JSON response
    quizText = quizText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let questions;
    try {
      questions = JSON.parse(quizText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Raw response:', quizText);
      throw new Error('Failed to parse quiz questions from AI response');
    }

    // Validate questions format
    if (!Array.isArray(questions)) {
      throw new Error('Invalid quiz format: expected array of questions');
    }

    // Validate each question
    questions.forEach((q, index) => {
      if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
        throw new Error(`Invalid question format at index ${index}`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${index + 1} must have exactly 4 options`);
      }
    });

    console.log(`✅ Quiz generation completed (${questions.length} questions)`);

    return {
      success: true,
      questions: questions,
      metadata: {
        model: MODEL_CONFIG.model,
        questionCount: questions.length,
        difficulty: difficulty,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0
      }
    };

  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    throw new Error(`Quiz generation failed: ${error.message}`);
  }
};

/**
 * Generate custom text based on document and prompt
 * @param {string} filePath - Path to the document file
 * @param {string} customPrompt - Custom prompt for text generation
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated text
 */
export const generateCustomText = async (filePath, customPrompt, options = {}) => {
  try {
    // Validate inputs
    if (!filePath || !customPrompt) {
      throw new Error('File path and custom prompt are required');
    }

    console.log(`📝 Generating custom analysis for: ${filePath}`);
    console.log(`📋 Prompt: ${customPrompt.substring(0, 100)}...`);
    
    // Resolve the correct file path
    const resolvedPath = resolveFilePath(filePath);

    // Read file
    const fileBuffer = fs.readFileSync(resolvedPath);
    const fileExtension = path.extname(resolvedPath).toLowerCase();
    const mimeTypeMap = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    
    const mimeType = mimeTypeMap[fileExtension];
    const fileBase64 = fileBuffer.toString('base64');

    // Initialize model with fixed name
    const model = genAI.getGenerativeModel(MODEL_CONFIG);

    // Combine custom prompt with document
    const fullPrompt = `${customPrompt}

Document to analyze:`;

    // Generate text
    console.log(`🤖 Calling Gemini API for custom analysis...`);
    const result = await model.generateContent([
      fullPrompt,
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      }
    ]);

    const response = result.response;
    const generatedText = response.text();
    console.log(`✅ Custom analysis completed (${generatedText.length} characters)`);

    return {
      success: true,
      generatedText: generatedText,
      metadata: {
        model: MODEL_CONFIG.model,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      }
    };

  } catch (error) {
    console.error('❌ Custom text generation error:', error);
    throw new Error(`Text generation failed: ${error.message}`);
  }
};

/**
 * Extract topics from text (simple keyword extraction)
 * @param {string} text - Text to analyze
 * @returns {Array<string>} Extracted topics
 */
const extractTopics = (text) => {
  // Simple topic extraction - you can enhance this
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);
  
  const topicWords = words
    .filter(word => word.length > 3 && !stopWords.has(word))
    .filter(word => /^[a-zA-Z]+$/.test(word)); // Only alphabetic words
  
  // Count word frequency
  const frequency = {};
  topicWords.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Get top 5 most frequent words as topics
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
};

/**
 * Check API quota and status
 * @returns {Promise<Object>} API status
 */
export const checkAIServiceStatus = async () => {
  try {
    console.log(`🏥 Checking AI service status...`);
    // Use the fixed model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Simple test request
    const result = await model.generateContent("Hello, respond with 'API is working'");
    
    console.log(`✅ AI service is operational`);
    return {
      success: true,
      status: 'operational',
      response: result.response.text(),
      model: 'gemini-1.5-flash-latest'
    };
  } catch (error) {
    console.error(`❌ AI service check failed:`, error);
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