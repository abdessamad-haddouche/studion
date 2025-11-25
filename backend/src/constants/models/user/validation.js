/**
 * User Validation Constants
 * @module constants/models/user/validation
 * @description Validation rules, patterns, and constraints for user models
 */

/**
 * Email validation configuration
 */
export const EMAIL_VALIDATION = Object.freeze({
  PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  MAX_LENGTH: 320,
  MIN_LENGTH: 5
});

/**
 * Password validation configuration
 */
/*
export const PASSWORD_VALIDATION = Object.freeze({
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  ERROR_MESSAGE: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
});
*/

export const PASSWORD_VALIDATION = Object.freeze({
  MIN_LENGTH: 6,
  MAX_LENGTH: 128,
  PATTERN: /^.{8,128}$/,
  ERROR_MESSAGE: 'Password must be between 8 and 128 characters'
});

/**
 * Name validation configuration
 */
export const NAME_VALIDATION = Object.freeze({
  MIN_LENGTH: 2,
  MAX_LENGTH: 100,
  PATTERN: /^[a-zA-Z\s'-]+$/,
  ERROR_MESSAGE: 'Name can only contain letters, spaces, hyphens, and apostrophes'
});

/**
 * Avatar URL validation
 */
export const AVATAR_VALIDATION = Object.freeze({
  URL_PATTERN: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
  ERROR_MESSAGE: 'Avatar must be a valid image URL'
});

/**
 * Timezone validation function
 */
export const validateTimezone = (tz) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/**
 * Combined validation rules object
 */
export const USER_VALIDATION_RULES = Object.freeze({
  EMAIL: EMAIL_VALIDATION,
  PASSWORD: PASSWORD_VALIDATION,
  NAME: NAME_VALIDATION,
  AVATAR: AVATAR_VALIDATION
});