/**
 * Quiz Constants Module Exports
 * @module constants/models/quiz
 * @description Central export point for quiz-related constants
 */

// ==========================================
// ENUMS & STATUS VALUES
// ==========================================
export {
  QUIZ_STATUSES,
  QUIZ_ATTEMPT_STATUSES,
  QUESTION_TYPES,
  QUIZ_DIFFICULTY_LEVELS,
  QUIZ_CATEGORIES,
  PERFORMANCE_LEVELS,
  SUBJECT_AREAS,
  QUIZ_DEFAULTS,
  QUIZ_ATTEMPT_DEFAULTS,
  isValidQuizStatus,
  isValidQuestionType,
  isValidQuizDifficulty,
  isValidAttemptStatus,
  getPerformanceLevel
} from './enums.js';

// ==========================================
// VALIDATION RULES & HELPERS
// ==========================================
export {
  QUIZ_VALIDATION_RULES,
  QUESTION_VALIDATION_RULES,
  QUIZ_ATTEMPT_VALIDATION_RULES,
  ANSWER_VALIDATION,
  PERFORMANCE_THRESHOLDS,
  validateQuestionByType,
  calculatePointsEarned
} from './validation.js';