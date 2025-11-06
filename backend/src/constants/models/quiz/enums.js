/**
 * Quiz Model Enums
 * @module constants/models/quiz/enums
 * @description Enumerated values for quiz model fields
 */

// ==========================================
// QUIZ STATUS ENUMS
// ==========================================

/**
 * Quiz generation and availability status
 */
export const QUIZ_STATUSES = Object.freeze([
  'generating',    // AI is creating the quiz
  'active',        // Quiz is ready and available
  'archived',      // Quiz is archived but attempts remain
  'failed'         // Quiz generation failed
]);

/**
 * Quiz attempt status values
 */
export const QUIZ_ATTEMPT_STATUSES = Object.freeze([
  'in_progress',   // User started but hasn't finished
  'completed',     // User completed the quiz
  'abandoned'      // User started but didn't finish (timeout)
]);

// ==========================================
// QUESTION TYPES
// ==========================================

/**
 * Supported question types for quiz generation
 */
export const QUESTION_TYPES = Object.freeze([
  'multiple_choice',    // Multiple choice with 4 options
  'true_false',         // True/False questions
  'fill_in_blank',      // Fill in the blank
  'short_answer',       // Short text answer
  'mixed'
]);

// ==========================================
// DIFFICULTY & CATEGORIZATION
// ==========================================

/**
 * Quiz difficulty levels based on document analysis
 */
export const QUIZ_DIFFICULTY_LEVELS = Object.freeze([
  'easy',          // Basic comprehension
  'medium',        // Application and analysis
  'hard',           // Synthesis and evaluation
  'mixed',
]);

/**
 * Quiz categories for organization
 */
export const QUIZ_CATEGORIES = Object.freeze([
  'comprehension',     // Understanding main concepts
  'analysis',          // Analyzing relationships
  'application',       // Applying concepts
  'synthesis',         // Combining ideas
  'evaluation'         // Critical thinking
]);

// ==========================================
// PERFORMANCE METRICS
// ==========================================

/**
 * Performance levels for quiz attempts
 */
export const PERFORMANCE_LEVELS = Object.freeze([
  'poor',          // 0-40%
  'below_average', // 41-60%
  'average',       // 61-75%
  'good',          // 76-85%
  'excellent'      // 86-100%
]);

/**
 * Subject areas for strength/weakness analysis
 */
export const SUBJECT_AREAS = Object.freeze([
  'factual_recall',        // Remembering facts
  'conceptual_understanding', // Understanding concepts
  'procedural_knowledge',     // Knowing how to do things
  'analytical_thinking',      // Breaking down information
  'critical_evaluation',       // Making judgments
  'critical_thinking',
]);

// ==========================================
// QUIZ DEFAULTS
// ==========================================

/**
 * Default values for quiz fields
 */
export const QUIZ_DEFAULTS = Object.freeze({
  STATUS: 'generating',
  DIFFICULTY: 'medium',
  CATEGORY: 'comprehension',
  QUESTIONS_COUNT: 10,
  TIME_LIMIT: 15, // minutes
  PASSING_SCORE: 70 // percentage
});

/**
 * Default values for quiz attempt fields
 */
export const QUIZ_ATTEMPT_DEFAULTS = Object.freeze({
  STATUS: 'in_progress',
  SCORE: 0,
  PERCENTAGE: 0,
  TIME_SPENT: 0,
  POINTS_EARNED: 0
});

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Check if value is valid quiz status
 */
export const isValidQuizStatus = (status) => {
  return QUIZ_STATUSES.includes(status);
};

/**
 * Check if value is valid question type
 */
export const isValidQuestionType = (type) => {
  return QUESTION_TYPES.includes(type);
};

/**
 * Check if value is valid quiz difficulty
 */
export const isValidQuizDifficulty = (difficulty) => {
  return QUIZ_DIFFICULTY_LEVELS.includes(difficulty);
};

/**
 * Check if value is valid attempt status
 */
export const isValidAttemptStatus = (status) => {
  return QUIZ_ATTEMPT_STATUSES.includes(status);
};

/**
 * Get performance level based on percentage
 */
export const getPerformanceLevel = (percentage) => {
  if (percentage >= 86) return 'excellent';
  if (percentage >= 76) return 'good';
  if (percentage >= 61) return 'average';
  if (percentage >= 41) return 'below_average';
  return 'poor';
};