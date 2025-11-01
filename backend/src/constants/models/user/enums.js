/**
 * User Enums Constants
 * @module constants/models/user/enums
 * @description Enumerated values for user models including statuses, types, and preferences
 */

/**
 * User account statuses
 */
export const USER_STATUSES = Object.freeze([
  'active',
  'inactive', 
  'suspended',
  'deleted'
]);

/**
 * User types for discriminator pattern
 */
export const USER_TYPES = Object.freeze([
  'student',
  'admin',
]);

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = Object.freeze([
  'en',
  'fr', 
  'es',
  'de',
  'it',
  'ar'
]);

/**
 * Theme preferences
 */
export const THEME_OPTIONS = Object.freeze([
  'light',
  'dark',
  'system'
]);

/**
 * Registration sources
 */
export const REGISTRATION_SOURCES = Object.freeze([
  'web',
  'mobile',
  'api',
  'admin'
]);

/**
 * Device types for session tracking
 */
export const DEVICE_TYPES = Object.freeze([
  'desktop',
  'mobile',
  'tablet',
  'unknown'
]);

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = Object.freeze([
  'email',
  'push',
  'sms',
  'marketing'
]);

// ==========================================
// STUDENT-SPECIFIC ENUMS
// ==========================================

/**
 * Academic levels for students
 */
export const ACADEMIC_LEVELS = Object.freeze([
  'high_school',
  'undergraduate', 
  'graduate',
  'professional'
]);

/**
 * Subscription tiers (Core Business Model)
 */
export const SUBSCRIPTION_TIERS = Object.freeze([
  'free',          // Limited documents & quizzes
  'premium',       // Unlimited access
  'student'        // Discounted for students
]);

/**
 * Basic quiz types (Future Implementation)
 */
export const QUIZ_TYPES = Object.freeze([
  'multiple_choice',
  'true_false',
  'short_answer'
]);

/**
 * Learning preferences (Simple)
 */
export const LEARNING_PREFERENCES = Object.freeze([
  'visual',
  'text',
  'mixed'
]);

/**
 * User role permissions (for future use)
 */
export const USER_PERMISSIONS = Object.freeze({
  STUDENT: [
    'profile:read',
    'profile:update',
    'documents:read',
    'documents:upload', 
    'tests:take',
    'sessions:create'
  ],
  ADMIN: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'analytics:read',
    'system:manage'
  ],
});

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES = Object.freeze({
  timezone: 'UTC',
  language: 'en',
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    marketing: false
  }
});