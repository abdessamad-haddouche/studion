/**
 * Auth Model Enums
 * @module constants/models/auth/enums
 * @description Enumerated values for authentication model fields
 */

// ==========================================
// SESSION STATUS ENUMS
// ==========================================

/**
 * Authentication session status values
 */
export const SESSION_STATUSES = Object.freeze([
  'active',        // Session is currently active
  'expired',       // Session has expired naturally
  'revoked',       // Session was manually revoked/logged out
  'suspended'      // Session was suspended for security reasons
]);

// ==========================================
// TOKEN TYPE ENUMS
// ==========================================

/**
 * Token types for different authentication purposes
 */
export const TOKEN_TYPES = Object.freeze([
  'access',        // Short-lived access token
  'refresh',       // Long-lived refresh token
  'reset',         // Password reset token
  'verification'   // Email verification token
]);

// ==========================================
// DEVICE TYPE ENUMS
// ==========================================

/**
 * Device types for session tracking
 */
export const DEVICE_TYPES = Object.freeze([
  'mobile',        // Mobile phones
  'tablet',        // Tablets and iPads
  'desktop',       // Desktop computers
  'unknown'        // Unidentified devices
]);

// ==========================================
// LOGIN METHOD ENUMS
// ==========================================

/**
 * Authentication methods used for login
 */
export const LOGIN_METHODS = Object.freeze([
  'password',      // Email/password login
  'refresh_token', // Login via refresh token
  'oauth_google',  // Google OAuth (future)
  'oauth_facebook',// Facebook OAuth (future)
  'magic_link'     // Magic link login (future)
]);

// ==========================================
// SECURITY RISK LEVELS
// ==========================================

/**
 * Security risk assessment levels
 */
export const SECURITY_RISK_LEVELS = Object.freeze([
  'low',           // Normal, trusted session
  'medium',        // Slightly suspicious activity
  'high',          // Suspicious, needs attention
  'critical'       // Highly suspicious, auto-revoke
]);

// ==========================================
// SUSPICIOUS ACTIVITY REASONS
// ==========================================

/**
 * Reasons for marking session as suspicious
 */
export const SUSPICIOUS_REASONS = Object.freeze([
  'location_change',    // Login from new location
  'device_change',      // Login from new device
  'concurrent_login',   // Multiple simultaneous logins
  'unusual_timing',     // Login at unusual hours
  'failed_attempts',    // Multiple failed attempts before success
  'ip_reputation'       // Known malicious IP
]);

// ==========================================
// SESSION CONFIGURATION
// ==========================================

/**
 * Session timing and limits configuration
 */
export const SESSION_CONFIG = Object.freeze({
  ACCESS_TOKEN_EXPIRY: '15m',      // 15 minutes
  REFRESH_TOKEN_EXPIRY: '7d',      // 7 days
  MAX_SESSIONS_PER_USER: 5,        // Max concurrent sessions
  TOKEN_ID_LENGTH: 32,             // Random token ID length
  CLEANUP_INTERVAL_HOURS: 24,      // Cleanup expired sessions every 24h
  INACTIVITY_TIMEOUT_HOURS: 2,     // Mark inactive after 2h
  SUSPICIOUS_LOGIN_THRESHOLD: 3    // Failed attempts before suspicious
});

// ==========================================
// DEFAULT VALUES
// ==========================================

/**
 * Default values for session fields
 */
export const SESSION_DEFAULTS = Object.freeze({
  STATUS: 'active',
  DEVICE_TYPE: 'unknown',
  LOGIN_METHOD: 'password',
  SECURITY_RISK: 'low',
  LOGIN_ATTEMPTS: 0
});

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Check if value is valid session status
 */
export const isValidSessionStatus = (status) => {
  return SESSION_STATUSES.includes(status);
};

/**
 * Check if value is valid token type
 */
export const isValidTokenType = (type) => {
  return TOKEN_TYPES.includes(type);
};

/**
 * Check if value is valid device type
 */
export const isValidDeviceType = (type) => {
  return DEVICE_TYPES.includes(type);
};

/**
 * Check if value is valid login method
 */
export const isValidLoginMethod = (method) => {
  return LOGIN_METHODS.includes(method);
};

/**
 * Check if value is valid security risk level
 */
export const isValidSecurityRisk = (risk) => {
  return SECURITY_RISK_LEVELS.includes(risk);
};

/**
 * Get token expiry time in milliseconds
 */
export const getTokenExpiryMs = (tokenType) => {
  switch (tokenType) {
    case 'access':
      return 15 * 60 * 1000; // 15 minutes
    case 'refresh':
      return 7 * 24 * 60 * 60 * 1000; // 7 days
    case 'reset':
      return 60 * 60 * 1000; // 1 hour
    case 'verification':
      return 24 * 60 * 60 * 1000; // 24 hours
    default:
      return 15 * 60 * 1000; // Default 15 minutes
  }
};

/**
 * Generate session name based on device info
 */
export const generateSessionName = (userAgent) => {
  if (!userAgent) return 'Unknown Device';
  
  if (userAgent.includes('Mobile')) return 'Mobile Device';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Chrome')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari')) return 'Safari Browser';
  if (userAgent.includes('Edge')) return 'Edge Browser';
  
  return 'Desktop Browser';
};