/**
 * User Constants Public API
 * @module constants/models/user
 * @description Central export point for all user-related constants
 */

// Validation constants
export {
  EMAIL_VALIDATION,
  PASSWORD_VALIDATION,
  NAME_VALIDATION,
  AVATAR_VALIDATION,
  USER_VALIDATION_RULES,
  validateTimezone
} from './validation.js';

// Enum constants
export {
  USER_STATUSES,
  USER_TYPES,
  SUPPORTED_LANGUAGES,
  THEME_OPTIONS,
  REGISTRATION_SOURCES,
  DEVICE_TYPES,
  NOTIFICATION_TYPES,
  USER_PERMISSIONS,
  DEFAULT_USER_PREFERENCES
} from './enums.js';

export {
  SUBSCRIPTION_TIERS,
  QUIZ_TYPES,
  LEARNING_PREFERENCES,
} from './student.js'