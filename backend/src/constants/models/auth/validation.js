/**
 * Auth Model Validation Constants
 * @module constants/models/auth/validation
 * @description Validation rules and patterns for authentication models
 */

// ==========================================
// SESSION VALIDATION RULES
// ==========================================

/**
 * Session validation rules
 */
export const SESSION_VALIDATION_RULES = Object.freeze({
  SESSION_ID: {
    MIN_LENGTH: 16,
    MAX_LENGTH: 64,
    PATTERN: /^[a-zA-Z0-9_\-]+$/,
    ERROR_MESSAGE: 'Session ID can only contain letters, numbers, hyphens, and underscores'
  },

  TOKEN_ID: {
    MIN_LENGTH: 16,
    MAX_LENGTH: 64,
    PATTERN: /^[a-zA-Z0-9_\-]+$/,
    ERROR_MESSAGE: 'Token ID can only contain letters, numbers, hyphens, and underscores'
  },

  SESSION_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-_.,()]+$/,
    ERROR_MESSAGE: 'Session name can only contain letters, numbers, spaces, and common punctuation'
  },

  NOTES: {
    MAX_LENGTH: 500,
    ERROR_MESSAGE: 'Notes cannot exceed 500 characters'
  }
});

// ==========================================
// DEVICE VALIDATION RULES
// ==========================================

/**
 * Device information validation rules
 */
export const DEVICE_VALIDATION_RULES = Object.freeze({
  USER_AGENT: {
    MAX_LENGTH: 1000,
    ERROR_MESSAGE: 'User agent string cannot exceed 1000 characters'
  },

  BROWSER_NAME: {
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\s\-_.]+$/,
    ERROR_MESSAGE: 'Browser name contains invalid characters'
  },

  BROWSER_VERSION: {
    MAX_LENGTH: 20,
    PATTERN: /^[0-9\-.]+$/,
    ERROR_MESSAGE: 'Browser version can only contain numbers, dots, and hyphens'
  },

  OS_NAME: {
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\s\-_.]+$/,
    ERROR_MESSAGE: 'OS name contains invalid characters'
  },

  OS_VERSION: {
    MAX_LENGTH: 20,
    PATTERN: /^[0-9\-.]+$/,
    ERROR_MESSAGE: 'OS version can only contain numbers, dots, and hyphens'
  },

  FINGERPRINT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 128,
    PATTERN: /^[a-fA-F0-9]+$/,
    ERROR_MESSAGE: 'Device fingerprint must be a valid hexadecimal string'
  }
});

// ==========================================
// NETWORK VALIDATION RULES
// ==========================================

/**
 * Network and location validation rules
 */
export const NETWORK_VALIDATION_RULES = Object.freeze({
  IP_ADDRESS: {
    PATTERN: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
    ERROR_MESSAGE: 'Invalid IP address format'
  },

  COUNTRY_CODE: {
    LENGTH: 2,
    PATTERN: /^[A-Z]{2}$/,
    ERROR_MESSAGE: 'Country code must be 2 uppercase letters'
  },

  REGION: {
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-_.,()]+$/,
    ERROR_MESSAGE: 'Region name contains invalid characters'
  },

  CITY: {
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-_.,()]+$/,
    ERROR_MESSAGE: 'City name contains invalid characters'
  },

  TIMEZONE: {
    PATTERN: /^[A-Za-z]+\/[A-Za-z_]+$/,
    ERROR_MESSAGE: 'Timezone must be in format: Continent/City'
  }
});

// ==========================================
// SECURITY VALIDATION RULES
// ==========================================

/**
 * Security-related validation rules
 */
export const SECURITY_VALIDATION_RULES = Object.freeze({
  LOGIN_ATTEMPTS: {
    MIN: 0,
    MAX: 100,
    ERROR_MESSAGE: 'Login attempts must be between 0 and 100'
  },

  SECURITY_FINGERPRINT: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 256,
    PATTERN: /^[a-fA-F0-9]+$/,
    ERROR_MESSAGE: 'Security fingerprint must be a valid hexadecimal string'
  },

  SUSPICIOUS_REASONS: {
    MAX_COUNT: 10,
    ERROR_MESSAGE: 'Cannot have more than 10 suspicious reasons'
  }
});

// ==========================================
// TOKEN VALIDATION RULES
// ==========================================

/**
 * Token-related validation rules
 */
export const TOKEN_VALIDATION_RULES = Object.freeze({
  REFRESH_TOKEN: {
    MIN_LENGTH: 32,
    MAX_LENGTH: 512,
    PATTERN: /^[a-zA-Z0-9_\-+/=]+$/,
    ERROR_MESSAGE: 'Refresh token contains invalid characters'
  },

  TOKEN_HASH: {
    LENGTH: 64, // SHA-256 hash length
    PATTERN: /^[a-fA-F0-9]{64}$/,
    ERROR_MESSAGE: 'Token hash must be a valid SHA-256 hash'
  }
});

// ==========================================
// TIMING VALIDATION RULES
// ==========================================

/**
 * Date and timing validation rules
 */
export const TIMING_VALIDATION_RULES = Object.freeze({
  TOKEN_EXPIRY: {
    MIN_MINUTES: 1,
    MAX_DAYS: 365,
    ERROR_MESSAGE: 'Token expiry must be between 1 minute and 365 days'
  },

  SESSION_DURATION: {
    MIN_MINUTES: 1,
    MAX_HOURS: 24 * 7, // 1 week max
    ERROR_MESSAGE: 'Session duration must be between 1 minute and 1 week'
  }
});

// ==========================================
// VALIDATION HELPER FUNCTIONS
// ==========================================

/**
 * Validate session ID format
 */
export const validateSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  
  const rules = SESSION_VALIDATION_RULES.SESSION_ID;
  return sessionId.length >= rules.MIN_LENGTH && 
         sessionId.length <= rules.MAX_LENGTH && 
         rules.PATTERN.test(sessionId);
};

/**
 * Validate token ID format
 */
export const validateTokenId = (tokenId) => {
  if (!tokenId || typeof tokenId !== 'string') {
    return false;
  }
  
  const rules = SESSION_VALIDATION_RULES.TOKEN_ID;
  return tokenId.length >= rules.MIN_LENGTH && 
         tokenId.length <= rules.MAX_LENGTH && 
         rules.PATTERN.test(tokenId);
};

/**
 * Validate IP address format
 */
export const validateIpAddress = (ip) => {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  return NETWORK_VALIDATION_RULES.IP_ADDRESS.PATTERN.test(ip);
};

/**
 * Validate user agent string
 */
export const validateUserAgent = (userAgent) => {
  if (!userAgent || typeof userAgent !== 'string') {
    return false;
  }
  
  return userAgent.length <= DEVICE_VALIDATION_RULES.USER_AGENT.MAX_LENGTH;
};

/**
 * Validate timezone format
 */
export const validateTimezone = (timezone) => {
  if (!timezone || typeof timezone !== 'string') {
    return false;
  }
  
  return NETWORK_VALIDATION_RULES.TIMEZONE.PATTERN.test(timezone);
};

/**
 * Validate token expiry date
 */
export const validateTokenExpiry = (expiryDate) => {
  if (!expiryDate || !(expiryDate instanceof Date)) {
    return false;
  }
  
  const now = new Date();
  const maxExpiry = new Date();
  maxExpiry.setDate(maxExpiry.getDate() + TIMING_VALIDATION_RULES.TOKEN_EXPIRY.MAX_DAYS);
  
  return expiryDate > now && expiryDate <= maxExpiry;
};

/**
 * Validate session duration
 */
export const validateSessionDuration = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return false;
  }
  
  const duration = endDate - startDate;
  const minDuration = TIMING_VALIDATION_RULES.SESSION_DURATION.MIN_MINUTES * 60 * 1000;
  const maxDuration = TIMING_VALIDATION_RULES.SESSION_DURATION.MAX_HOURS * 60 * 60 * 1000;
  
  return duration >= minDuration && duration <= maxDuration;
};

/**
 * Validate device fingerprint
 */
export const validateDeviceFingerprint = (fingerprint) => {
  if (!fingerprint || typeof fingerprint !== 'string') {
    return false;
  }
  
  const rules = DEVICE_VALIDATION_RULES.FINGERPRINT;
  return fingerprint.length >= rules.MIN_LENGTH && 
         fingerprint.length <= rules.MAX_LENGTH && 
         rules.PATTERN.test(fingerprint);
};