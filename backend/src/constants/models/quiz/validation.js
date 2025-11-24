/**
 * Quiz Model Validation Constants
 * @module constants/models/quiz/validation
 * @description Validation rules and patterns for quiz models
 */

// ==========================================
// QUIZ VALIDATION RULES
// ==========================================

/**
 * Quiz validation rules
 */
export const QUIZ_VALIDATION_RULES = Object.freeze({
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 150,
    PATTERN: /^[\p{L}\p{N}\p{P}\p{S}\p{Z}]+$/u,
    ERROR_MESSAGE: 'Title can only contain letters, numbers, spaces, and common punctuation'
  },

  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
    ERROR_MESSAGE: 'Description must be between 10 and 500 characters'
  },

  QUESTIONS_COUNT: {
    MIN: 3,
    MAX: 50,
    DEFAULT: 10,
    ERROR_MESSAGE: 'Quiz must have between 3 and 50 questions'
  },

  ESTIMATED_TIME: {
    MIN: 1, // 1 minute
    MAX: 180, // 3 hours
    DEFAULT: 15,
    ERROR_MESSAGE: 'Estimated time must be between 1 and 180 minutes'
  },

  PASSING_SCORE: {
    MIN: 0,
    MAX: 100,
    DEFAULT: 70,
    ERROR_MESSAGE: 'Passing score must be between 0 and 100'
  }
});

// ==========================================
// QUESTION VALIDATION RULES
// ==========================================

/**
 * Question validation rules
 */
export const QUESTION_VALIDATION_RULES = Object.freeze({
  QUESTION_TEXT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
    ERROR_MESSAGE: 'Question text must be between 10 and 500 characters'
  },

  OPTION_TEXT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
    ERROR_MESSAGE: 'Option text must be between 1 and 200 characters'
  },

  OPTIONS_COUNT: {
    MULTIPLE_CHOICE: { MIN: 2, MAX: 6, DEFAULT: 4 },
    TRUE_FALSE: { MIN: 2, MAX: 2, DEFAULT: 2 },
    FILL_IN_BLANK: { MIN: 0, MAX: 0, DEFAULT: 0 },
    SHORT_ANSWER: { MIN: 0, MAX: 0, DEFAULT: 0 }
  },

  EXPLANATION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 300,
    ERROR_MESSAGE: 'Explanation must be between 10 and 300 characters'
  },

  CORRECT_ANSWER: {
    MULTIPLE_CHOICE: {
      PATTERN: /^[0-3]$/, // Index 0-3 for 4 options
      ERROR_MESSAGE: 'Correct answer must be option index (0-3)'
    },
    TRUE_FALSE: {
      PATTERN: /^(0|1)$/, // 0 for false, 1 for true
      ERROR_MESSAGE: 'Correct answer must be 0 (false) or 1 (true)'
    },
    FILL_IN_BLANK: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
      ERROR_MESSAGE: 'Fill in blank answer must be 1-100 characters'
    },
    SHORT_ANSWER: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 200,
      ERROR_MESSAGE: 'Short answer must be 1-200 characters'
    }
  }
});

// ==========================================
// QUIZ ATTEMPT VALIDATION RULES
// ==========================================

/**
 * Quiz attempt validation rules
 */
export const QUIZ_ATTEMPT_VALIDATION_RULES = Object.freeze({
  SCORE: {
    MIN: 0,
    MAX: null, // Will be set based on question count
    ERROR_MESSAGE: 'Score cannot be negative'
  },

  PERCENTAGE: {
    MIN: 0,
    MAX: 100,
    ERROR_MESSAGE: 'Percentage must be between 0 and 100'
  },

  TIME_SPENT: {
    MIN: 0,
    MAX: 24 * 60 * 60 * 1000, // 24 hours max
    ERROR_MESSAGE: 'Time spent cannot exceed 24 hours'
  },

  POINTS_EARNED: {
    MIN: 0,
    MAX: 1000, // Maximum points per quiz
    ERROR_MESSAGE: 'Points earned must be between 0 and 1000'
  },

  FEEDBACK: {
    MAX_LENGTH: 1000,
    ERROR_MESSAGE: 'Feedback cannot exceed 1000 characters'
  }
});

// ==========================================
// ANSWER VALIDATION
// ==========================================

/**
 * Answer validation rules
 */
export const ANSWER_VALIDATION = Object.freeze({
  MULTIPLE_CHOICE: {
    PATTERN: /^[0-9]$/, // Single digit for option index
    ERROR_MESSAGE: 'Multiple choice answer must be option index'
  },

  TRUE_FALSE: {
    PATTERN: /^(true|false|0|1)$/i,
    ERROR_MESSAGE: 'True/false answer must be true, false, 0, or 1'
  },

  FILL_IN_BLANK: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-_.,()!?]+$/,
    ERROR_MESSAGE: 'Fill in blank answer must be 1-100 characters'
  },

  SHORT_ANSWER: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
    ERROR_MESSAGE: 'Short answer must be 1-500 characters'
  }
});

// ==========================================
// PERFORMANCE THRESHOLDS
// ==========================================

/**
 * Performance calculation thresholds
 */
export const PERFORMANCE_THRESHOLDS = Object.freeze({
  POINTS_CALCULATION: {
    BASE_POINTS: 10,        // Base points per question
    DIFFICULTY_MULTIPLIER: {
      easy: 1,
      medium: 1.5,
      hard: 2
    },
    PERFORMANCE_BONUS: {
      excellent: 1.5,
      good: 1.2,
      average: 1,
      below_average: 0.8,
      poor: 0.5
    }
  },

  TIME_BONUS: {
    FAST_COMPLETION: 1.1,    // 10% bonus for quick completion
    NORMAL_COMPLETION: 1,    // No bonus
    SLOW_COMPLETION: 0.9     // 10% penalty for slow completion
  }
});

// ==========================================
// VALIDATION HELPER FUNCTIONS
// ==========================================

/**
 * Validate question based on type
 */
export const validateQuestionByType = (question, type) => {
  const rules = QUESTION_VALIDATION_RULES;
  
  // Validate question text
  if (!question.question || 
      question.question.length < rules.QUESTION_TEXT.MIN_LENGTH ||
      question.question.length > rules.QUESTION_TEXT.MAX_LENGTH) {
    return false;
  }
  
  // Validate options based on type
  const expectedOptions = rules.OPTIONS_COUNT[type.toUpperCase()];
  if (expectedOptions && question.options) {
    if (question.options.length < expectedOptions.MIN || 
        question.options.length > expectedOptions.MAX) {
      return false;
    }
  }
  
  return true;
};

/**
 * Calculate points earned based on performance
 */
export const calculatePointsEarned = (score, totalQuestions, difficulty, timeSpent, estimatedTime) => {
  const basePoints = PERFORMANCE_THRESHOLDS.POINTS_CALCULATION.BASE_POINTS * score;
  const difficultyMultiplier = PERFORMANCE_THRESHOLDS.POINTS_CALCULATION.DIFFICULTY_MULTIPLIER[difficulty] || 1;
  const percentage = (score / totalQuestions) * 100;
  
  // Get performance level
  let performanceLevel;
  if (percentage >= 86) performanceLevel = 'excellent';
  else if (percentage >= 76) performanceLevel = 'good';
  else if (percentage >= 61) performanceLevel = 'average';
  else if (percentage >= 41) performanceLevel = 'below_average';
  else performanceLevel = 'poor';
  
  const performanceMultiplier = PERFORMANCE_THRESHOLDS.POINTS_CALCULATION.PERFORMANCE_BONUS[performanceLevel];
  
  // Calculate time bonus/penalty
  let timeMultiplier = PERFORMANCE_THRESHOLDS.TIME_BONUS.NORMAL_COMPLETION;
  if (timeSpent < estimatedTime * 0.75) {
    timeMultiplier = PERFORMANCE_THRESHOLDS.TIME_BONUS.FAST_COMPLETION;
  } else if (timeSpent > estimatedTime * 1.5) {
    timeMultiplier = PERFORMANCE_THRESHOLDS.TIME_BONUS.SLOW_COMPLETION;
  }
  
  const finalPoints = Math.round(basePoints * difficultyMultiplier * performanceMultiplier * timeMultiplier);
  return Math.max(0, Math.min(finalPoints, QUIZ_ATTEMPT_VALIDATION_RULES.POINTS_EARNED.MAX));
};