/**
 * Auth Model Constants Public API
 * @module constants/models/auth
 * @description Central export point for all authentication-related constants
 */

// ==========================================
// ENUM CONSTANTS
// ==========================================
export {
  // Session & Token Types
  SESSION_STATUSES,
  TOKEN_TYPES,
  DEVICE_TYPES,
  LOGIN_METHODS,
  
  // Security
  SECURITY_RISK_LEVELS,
  SUSPICIOUS_REASONS,
  
  // Configuration
  SESSION_CONFIG,
  SESSION_DEFAULTS,
  
  // Validation Helpers
  isValidSessionStatus,
  isValidTokenType,
  isValidDeviceType,
  isValidLoginMethod,
  isValidSecurityRisk,
  getTokenExpiryMs,
  generateSessionName
} from './enums.js';

// ==========================================
// VALIDATION CONSTANTS
// ==========================================
export {
  // Validation Rules
  SESSION_VALIDATION_RULES,
  DEVICE_VALIDATION_RULES,
  NETWORK_VALIDATION_RULES,
  SECURITY_VALIDATION_RULES,
  TOKEN_VALIDATION_RULES,
  TIMING_VALIDATION_RULES,
  
  // Validation Helper Functions
  validateSessionId,
  validateTokenId,
  validateIpAddress,
  validateUserAgent,
  validateTimezone,
  validateTokenExpiry,
  validateSessionDuration,
  validateDeviceFingerprint
} from './validation.js';