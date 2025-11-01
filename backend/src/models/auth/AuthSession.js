/**
 * AuthSession Model - FIXED VERSION
 * @module models/AuthSession
 * @description Professional authentication session management for JWT tokens - MVP focused
 */

import mongoose from 'mongoose';
import crypto from 'crypto';

// Import auth constants
import {
  // Enums
  SESSION_STATUSES,
  DEVICE_TYPES,
  LOGIN_METHODS,
  SECURITY_RISK_LEVELS,
  SUSPICIOUS_REASONS,
  SESSION_CONFIG,
  SESSION_DEFAULTS,
  
  // Validation Rules
  SESSION_VALIDATION_RULES,
  DEVICE_VALIDATION_RULES,
  NETWORK_VALIDATION_RULES,
  SECURITY_VALIDATION_RULES,
  TOKEN_VALIDATION_RULES,
  
  // Validation Helpers
  isValidSessionStatus,
  isValidDeviceType,
  isValidLoginMethod,
  validateIpAddress,
  validateUserAgent,
  generateSessionName
} from '#constants/models/auth/index.js';

// ==========================================
// SCHEMA CONFIGURATION
// ==========================================

const SCHEMA_OPTIONS = {
  collection: 'auth_sessions',
  timestamps: true,
  versionKey: false,
  
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      
      // Remove sensitive data from client responses
      delete ret.refreshTokenHash;
      delete ret.network;
      delete ret.security.fingerprint;
      
      return ret;
    },
    virtuals: true
  },
  
  toObject: {
    virtuals: true
  }
};

// ==========================================
// AUTH SESSION SCHEMA
// ==========================================

const authSessionSchema = new mongoose.Schema({
  
  // ==========================================
  // USER RELATIONSHIP
  // ==========================================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'Session must belong to a user'],
    index: true
  },
  
  // ==========================================
  // SESSION IDENTIFIERS
  // ==========================================
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true,
    index: true
  },
  
  // JWT Token ID (jti claim)
  accessTokenId: {
    type: String,
    required: [true, 'Access token ID is required'],
    unique: true,
    index: true
  },
  
  // Hashed refresh token for security
  refreshTokenHash: {
    type: String,
    required: [true, 'Refresh token hash is required'],
    select: false // Hide from queries
  },
  
  // ==========================================
  // SESSION STATUS & TIMING
  // ==========================================
  status: {
    type: String,
    enum: {
      values: SESSION_STATUSES,
      message: 'Invalid session status'
    },
    default: SESSION_DEFAULTS.STATUS,
    index: true
  },
  
  accessTokenExpiresAt: {
    type: Date,
    required: [true, 'Access token expiry is required'],
    index: true
  },
  
  refreshTokenExpiresAt: {
    type: Date,
    required: [true, 'Refresh token expiry is required'],
    index: true
  },
  
  lastAccessedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  revokedAt: {
    type: Date,
    default: null
  },
  
  // ==========================================
  // DEVICE INFORMATION
  // ==========================================
  device: {
    type: {
      type: String,
      enum: {
        values: DEVICE_TYPES,
        message: 'Invalid device type'
      },
      default: SESSION_DEFAULTS.DEVICE_TYPE
    },
    
    userAgent: {
      type: String,
      maxlength: [DEVICE_VALIDATION_RULES.USER_AGENT.MAX_LENGTH, DEVICE_VALIDATION_RULES.USER_AGENT.ERROR_MESSAGE],
      default: null
    },
    
    name: {
      type: String,
      maxlength: [SESSION_VALIDATION_RULES.SESSION_NAME.MAX_LENGTH, SESSION_VALIDATION_RULES.SESSION_NAME.ERROR_MESSAGE],
      default: null
    },
    
    browser: {
      name: { 
        type: String, 
        maxlength: [DEVICE_VALIDATION_RULES.BROWSER_NAME.MAX_LENGTH, DEVICE_VALIDATION_RULES.BROWSER_NAME.ERROR_MESSAGE],
        default: null 
      },
      version: { 
        type: String, 
        maxlength: [DEVICE_VALIDATION_RULES.BROWSER_VERSION.MAX_LENGTH, DEVICE_VALIDATION_RULES.BROWSER_VERSION.ERROR_MESSAGE],
        default: null 
      }
    },
    
    os: {
      name: { 
        type: String, 
        maxlength: [DEVICE_VALIDATION_RULES.OS_NAME.MAX_LENGTH, DEVICE_VALIDATION_RULES.OS_NAME.ERROR_MESSAGE],
        default: null 
      },
      version: { 
        type: String, 
        maxlength: [DEVICE_VALIDATION_RULES.OS_VERSION.MAX_LENGTH, DEVICE_VALIDATION_RULES.OS_VERSION.ERROR_MESSAGE],
        default: null 
      }
    }
  },
  
  // ==========================================
  // NETWORK & LOCATION (SIMPLIFIED FOR MVP)
  // ==========================================
  network: {
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      validate: {
        validator: validateIpAddress,
        message: NETWORK_VALIDATION_RULES.IP_ADDRESS.ERROR_MESSAGE
      },
      select: false // Hide for privacy
    },
    
    country: {
      type: String,
      maxlength: [100, 'Country name too long'],
      default: null
    },
    
    city: {
      type: String,
      maxlength: [100, 'City name too long'],
      default: null
    }
  },
  
  // ==========================================
  // SECURITY (SIMPLIFIED FOR MVP)
  // ==========================================
  security: {
    riskLevel: {
      type: String,
      enum: {
        values: SECURITY_RISK_LEVELS,
        message: 'Invalid security risk level'
      },
      default: SESSION_DEFAULTS.SECURITY_RISK,
      index: true
    },
    
    isSuspicious: {
      type: Boolean,
      default: false,
      index: true
    },
    
    suspiciousReasons: [{
      type: String,
      enum: {
        values: SUSPICIOUS_REASONS,
        message: 'Invalid suspicious reason'
      }
    }],
    
    loginAttempts: {
      type: Number,
      min: [SECURITY_VALIDATION_RULES.LOGIN_ATTEMPTS.MIN, SECURITY_VALIDATION_RULES.LOGIN_ATTEMPTS.ERROR_MESSAGE],
      max: [SECURITY_VALIDATION_RULES.LOGIN_ATTEMPTS.MAX, SECURITY_VALIDATION_RULES.LOGIN_ATTEMPTS.ERROR_MESSAGE],
      default: SESSION_DEFAULTS.LOGIN_ATTEMPTS
    },
    
    // Simple fingerprint for device recognition
    fingerprint: {
      type: String,
      default: null,
      select: false
    }
  },
  
  // ==========================================
  // METADATA (MINIMAL FOR MVP)
  // ==========================================
  metadata: {
    loginMethod: {
      type: String,
      enum: {
        values: LOGIN_METHODS,
        message: 'Invalid login method'
      },
      default: SESSION_DEFAULTS.LOGIN_METHOD
    },
    
    notes: {
      type: String,
      maxlength: [SESSION_VALIDATION_RULES.NOTES.MAX_LENGTH, SESSION_VALIDATION_RULES.NOTES.ERROR_MESSAGE],
      default: ''
    }
  }
  
}, SCHEMA_OPTIONS);

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

// Core session indexes
authSessionSchema.index({ userId: 1, status: 1 });
authSessionSchema.index({ sessionId: 1, status: 1 });
authSessionSchema.index({ accessTokenId: 1, status: 1 });
authSessionSchema.index({ userId: 1, lastAccessedAt: -1 });

// Token expiry indexes for cleanup
authSessionSchema.index({ refreshTokenExpiresAt: 1, status: 1 });
authSessionSchema.index({ accessTokenExpiresAt: 1, status: 1 });

// Security indexes
authSessionSchema.index({ 'security.isSuspicious': 1, status: 1 });

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

/**
 * Check if access token is expired
 */
authSessionSchema.virtual('isAccessTokenExpired').get(function() {
  return this.accessTokenExpiresAt < new Date();
});

/**
 * Check if refresh token is expired
 */
authSessionSchema.virtual('isRefreshTokenExpired').get(function() {
  return this.refreshTokenExpiresAt < new Date();
});

/**
 * Check if session is valid and active
 */
authSessionSchema.virtual('isValid').get(function() {
  return this.status === 'active' && 
         !this.isRefreshTokenExpired &&
         !this.revokedAt;
});

/**
 * Check if session needs refresh (access token expired but refresh valid)
 */
authSessionSchema.virtual('needsRefresh').get(function() {
  return this.isAccessTokenExpired && 
         !this.isRefreshTokenExpired && 
         this.status === 'active';
});

/**
 * Get session duration in minutes
 */
authSessionSchema.virtual('sessionDurationMinutes').get(function() {
  const duration = this.lastAccessedAt - this.createdAt;
  return Math.max(0, Math.floor(duration / (1000 * 60)));
});

/**
 * Get device display name
 */
authSessionSchema.virtual('deviceDisplayName').get(function() {
  return this.device.name || generateSessionName(this.device.userAgent);
});

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================

authSessionSchema.pre('save', function(next) {
  try {
    // Generate sessionId if not exists
    if (!this.sessionId) {
      this.sessionId = crypto.randomBytes(16).toString('hex');
    }
    
    // Generate accessTokenId if not exists
    if (!this.accessTokenId) {
      this.accessTokenId = crypto.randomBytes(16).toString('hex');
    }
    
    // Auto-generate device name if not provided
    if (!this.device.name && this.device.userAgent) {
      this.device.name = generateSessionName(this.device.userAgent);
    }
    
    // Update lastAccessedAt when status changes to active
    if (this.isModified('status') && this.status === 'active') {
      this.lastAccessedAt = new Date();
    }
    
    // Set revokedAt when status changes to revoked
    if (this.isModified('status') && this.status === 'revoked' && !this.revokedAt) {
      this.revokedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// INSTANCE METHODS
// ==========================================

/**
 * Create hashed refresh token
 */
authSessionSchema.methods.setRefreshToken = function(refreshToken) {
  this.refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  return this;
};

/**
 * Verify refresh token
 */
authSessionSchema.methods.verifyRefreshToken = function(refreshToken) {
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  return this.refreshTokenHash === hash;
};

/**
 * Update last accessed timestamp
 */
authSessionSchema.methods.updateAccess = function() {
  this.lastAccessedAt = new Date();
  return this.save();
};

/**
 * Revoke the session (logout)
 */
authSessionSchema.methods.revoke = function(reason = null) {
  this.status = 'revoked';
  this.revokedAt = new Date();
  if (reason) {
    this.metadata.notes = reason;
  }
  return this.save();
};

/**
 * Mark session as suspicious
 */
authSessionSchema.methods.markSuspicious = function(reasons = []) {
  this.security.isSuspicious = true;
  this.security.riskLevel = 'high';
  this.security.suspiciousReasons = [...new Set([...this.security.suspiciousReasons, ...reasons])];
  return this.save();
};

/**
 * Increment login attempts
 */
authSessionSchema.methods.incrementLoginAttempts = function() {
  this.security.loginAttempts += 1;
  
  // Mark as suspicious if too many attempts (without saving)
  if (this.security.loginAttempts >= 3) { // Using hardcoded value instead of SESSION_CONFIG
    this.security.isSuspicious = true;
    this.security.riskLevel = 'high';
    if (!this.security.suspiciousReasons.includes('failed_attempts')) {
      this.security.suspiciousReasons.push('failed_attempts');
    }
  }
  
  return this.save();
};

/**
 * Reset login attempts on successful auth
 */
authSessionSchema.methods.resetLoginAttempts = function() {
  this.security.loginAttempts = 0;
  if (this.security.isSuspicious && this.security.suspiciousReasons.includes('failed_attempts')) {
    this.security.suspiciousReasons = this.security.suspiciousReasons.filter(r => r !== 'failed_attempts');
    if (this.security.suspiciousReasons.length === 0) {
      this.security.isSuspicious = false;
      this.security.riskLevel = 'low';
    }
  }
  return this.save();
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Create new session with tokens
 */
authSessionSchema.statics.createSession = async function(userId, sessionData) {
  const {
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    ipAddress,
    userAgent,
    deviceInfo = {}
  } = sessionData;
  
  const session = new this({
    userId,
    // Generate IDs upfront to avoid validation errors
    sessionId: crypto.randomBytes(16).toString('hex'),
    accessTokenId: crypto.randomBytes(16).toString('hex'),
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    device: {
      type: deviceInfo.type || 'unknown',
      userAgent,
      name: deviceInfo.name,
      browser: deviceInfo.browser || {},
      os: deviceInfo.os || {}
    },
    network: {
      ipAddress,
      country: deviceInfo.country,
      city: deviceInfo.city
    },
    metadata: {
      loginMethod: deviceInfo.loginMethod || 'password'
    }
  });
  
  session.setRefreshToken(refreshToken);
  return session.save();
};

/**
 * Find active session by access token ID
 */
authSessionSchema.statics.findByAccessToken = function(accessTokenId) {
  return this.findOne({
    accessTokenId,
    status: 'active',
    accessTokenExpiresAt: { $gt: new Date() }
  }).populate('userId');
};

/**
 * Find session by refresh token
 */
authSessionSchema.statics.findByRefreshToken = function(refreshToken) {
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  return this.findOne({
    refreshTokenHash: hash,
    status: 'active',
    refreshTokenExpiresAt: { $gt: new Date() }
  }).select('+refreshTokenHash').populate('userId');
};

/**
 * Get user's active sessions
 */
authSessionSchema.statics.getUserActiveSessions = function(userId, limit = 10) {
  return this.find({
    userId,
    status: 'active',
    refreshTokenExpiresAt: { $gt: new Date() }
  })
  .sort({ lastAccessedAt: -1 })
  .limit(limit);
};

/**
 * Revoke all user sessions (logout from all devices)
 */
authSessionSchema.statics.revokeAllUserSessions = function(userId, except = null) {
  const query = {
    userId,
    status: 'active'
  };
  
  if (except) {
    query.sessionId = { $ne: except };
  }
  
  return this.updateMany(query, {
    $set: {
      status: 'revoked',
      revokedAt: new Date()
    }
  });
};

/**
 * Cleanup expired sessions
 */
authSessionSchema.statics.cleanupExpired = function() {
  const now = new Date();
  return this.updateMany({
    $or: [
      { refreshTokenExpiresAt: { $lte: now } },
      { accessTokenExpiresAt: { $lte: now }, status: 'active' }
    ]
  }, {
    $set: { status: 'expired' }
  });
};

/**
 * Get session statistics
 */
authSessionSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: { $subtract: ['$lastAccessedAt', '$createdAt'] } }
      }
    }
  ]);
};

// ==========================================
// QUERY HELPERS
// ==========================================

authSessionSchema.query.active = function() {
  return this.where({ 
    status: 'active',
    refreshTokenExpiresAt: { $gt: new Date() }
  });
};

authSessionSchema.query.expired = function() {
  return this.where({
    $or: [
      { status: 'expired' },
      { refreshTokenExpiresAt: { $lte: new Date() } }
    ]
  });
};

authSessionSchema.query.suspicious = function() {
  return this.where({ 'security.isSuspicious': true });
};

authSessionSchema.query.recent = function(hours = 24) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);
  return this.where({ createdAt: { $gte: cutoff } });
};

// ==========================================
// EXPORT MODEL
// ==========================================

const AuthSession = mongoose.model('AuthSession', authSessionSchema);

export default AuthSession;
export { authSessionSchema };