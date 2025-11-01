/**
 * Course Model Constants Public API
 * @module constants/models/course
 * @description Central export point for all course-related constants
 */

// ==========================================
// ENUM CONSTANTS
// ==========================================
export {
  // Source & Platform
  COURSE_SOURCES,
  COURSE_LEVELS,
  COURSE_CATEGORIES,
  COURSE_STATUSES,
  
  // Localization
  CURRENCIES,
  CURRENCY_SYMBOLS,
  COURSE_LANGUAGES,
  
  // Content & Structure
  INSTRUCTOR_TYPES,
  CONTENT_TYPES,
  ACCESS_TYPES,
  COMPLETION_CRITERIA,
  
  // Rating & Feedback
  RATING_SCALE,
  RATING_CATEGORIES,
  
  // Business & Pricing
  DISCOUNT_TYPES,
  
  // Studion Integration
  QUIZ_DIFFICULTY_LEVELS,
  QUIZ_RECOMMENDATION_CATEGORIES,
  POINTS_USAGE_TYPES,
  
  // Defaults
  COURSE_DEFAULTS,
  
  // Validation Helpers
  isValidCourseSource,
  isValidCourseLevel,
  isValidCourseCategory,
  isValidCourseStatus,
  isValidCurrency,
  isValidCourseLanguage,
  isValidRating,
  getCurrencySymbol,
  mapQuizCategoryToCourseCategory
} from './enums.js';

// ==========================================
// VALIDATION CONSTANTS
// ==========================================
export {
  // Validation Rules
  COURSE_VALIDATION_RULES,
  INSTRUCTOR_VALIDATION_RULES,
  PRICING_VALIDATION_RULES,
  CONTENT_VALIDATION_RULES,
  MEDIA_VALIDATION_RULES,
  RATING_VALIDATION_RULES,
  ENROLLMENT_VALIDATION_RULES,
  ANALYTICS_VALIDATION_RULES,
  BUSINESS_VALIDATION_RULES,
  STUDION_VALIDATION_RULES,
  EXTERNAL_VALIDATION_RULES,
  
  // Validation Helper Functions
  validateCourseTitle,
  validateCourseDescription,
  validatePrice,
  validateRating,
  validateDuration,
  validateUrl,
  validateTags,
  validateLearningOutcomes,
  validateInstructorName,
  validateFileSize,
  validateImageDimensions,
  validatePointsDiscount,
  validateCompletionData,
  
  // Utility Functions
  calculateDiscountPercentage
} from './validation.js';