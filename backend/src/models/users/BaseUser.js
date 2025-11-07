/**
 * Base User Model
 * @module models/BaseUser
 * @description Abstract base class for all user types using Mongoose discriminators
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Import user constants (validation & enums only)
import {
  // Validation
  USER_VALIDATION_RULES,
  validateTimezone,
  
  // Enums
  USER_STATUSES,
  SUPPORTED_LANGUAGES,
  THEME_OPTIONS,
  REGISTRATION_SOURCES
} from '#constants/models/user/index.js';

// ==========================================
// SCHEMA CONFIGURATION
// ==========================================

const SCHEMA_OPTIONS = {
  // Discriminator configuration
  discriminatorKey: 'userType',
  collection: 'users',
  
  // Mongoose options
  timestamps: true,
  versionKey: false,
  
  // JSON transformation (security)
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.password;
      delete ret.__v;
      
      // Transform _id to id for frontend consistency
      ret.id = ret._id;
      delete ret._id;
      
      return ret;
    },
    virtuals: true
  },
  
  // Object transformation (security)
  toObject: {
    transform: function(doc, ret) {
      // Remove sensitive fields from object output
      delete ret.password;
      delete ret.__v;
      
      return ret;
    },
    virtuals: true
  }
};

// ==========================================
// MINIMAL USER-ONLY CONSTANTS
// ==========================================

const USER_CONFIG = {
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000 // 15 minutes
};

const baseUserSchema = new mongoose.Schema({
  
  // ==========================================
  // AUTHENTICATION FIELDS
  // ==========================================
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [USER_VALIDATION_RULES.EMAIL.MIN_LENGTH, 'Email is too short'],
    maxlength: [USER_VALIDATION_RULES.EMAIL.MAX_LENGTH, 'Email is too long'],
    validate: {
      validator: function(email) {
        return USER_VALIDATION_RULES.EMAIL.PATTERN.test(email);
      },
      message: 'Please provide a valid email address'
    },
    index: true
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [USER_VALIDATION_RULES.PASSWORD.MIN_LENGTH, 'Password must be at least 8 characters'],
    maxlength: [USER_VALIDATION_RULES.PASSWORD.MAX_LENGTH, 'Password is too long'],
    validate: {
      validator: function(password) {
        return USER_VALIDATION_RULES.PASSWORD.PATTERN.test(password);
      },
      message: USER_VALIDATION_RULES.PASSWORD.ERROR_MESSAGE
    },
    select: false // Exclude from queries by default
  },

  // ==========================================
  // PROFILE FIELDS
  // ==========================================
  name: {
    first: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [USER_VALIDATION_RULES.NAME.MIN_LENGTH, 'First name is too short'],
      maxlength: [USER_VALIDATION_RULES.NAME.MAX_LENGTH, 'First name is too long'],
      validate: {
        validator: function(name) {
          return USER_VALIDATION_RULES.NAME.PATTERN.test(name);
        },
        message: USER_VALIDATION_RULES.NAME.ERROR_MESSAGE
      }
    },
    last: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [USER_VALIDATION_RULES.NAME.MIN_LENGTH, 'Last name is too short'],
      maxlength: [USER_VALIDATION_RULES.NAME.MAX_LENGTH, 'Last name is too long'],
      validate: {
        validator: function(name) {
          return USER_VALIDATION_RULES.NAME.PATTERN.test(name);
        },
        message: USER_VALIDATION_RULES.NAME.ERROR_MESSAGE
      }
    }
  },

  avatar: {
    url: {
      type: String,
      default: null,
      validate: {
        validator: function(url) {
          if (!url) return true;
          return USER_VALIDATION_RULES.AVATAR.URL_PATTERN.test(url);
        },
        message: USER_VALIDATION_RULES.AVATAR.ERROR_MESSAGE
      }
    },
    publicId: {
      type: String,
      default: null
    }
  },

  // ==========================================
  // PREFERENCES & SETTINGS
  // ==========================================
  preferences: {
    timezone: {
      type: String,
      default: 'UTC',
      validate: {
        validator: validateTimezone,
        message: 'Invalid timezone'
      }
    },
    language: {
      type: String,
      enum: {
        values: SUPPORTED_LANGUAGES,
        message: 'Unsupported language'
      },
      default: 'en'
    },
    theme: {
      type: String,
      enum: {
        values: THEME_OPTIONS,
        message: 'Invalid theme option'
      },
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    }
  },

  // ==========================================
  // VERIFICATION (Basic)
  // ==========================================
  verification: {
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true
    }
  },

  // ==========================================
  // BASIC SECURITY (Login Attempts Only)
  // ==========================================
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now,
    select: false
  },

  // ==========================================
  // ACTIVITY TRACKING
  // ==========================================
  lastLoginAt: {
    type: Date,
    default: null
  },

  lastActiveAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  // ==========================================
  // STATUS & METADATA
  // ==========================================
  status: {
    type: String,
    enum: {
      values: USER_STATUSES,
      message: 'Invalid user status'
    },
    default: 'active',
    index: true
  },

  metadata: {
    registrationSource: {
      type: String,
      enum: {
        values: REGISTRATION_SOURCES,
        message: 'Invalid registration source'
      },
      default: 'web'
    },
    registrationIP: {
      type: String,
      default: null
    },
    lastLoginIP: {
      type: String,
      default: null
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0
    }
  }

}, SCHEMA_OPTIONS);

// ==========================================
// PERFORMANCE INDEXES
// ==========================================

baseUserSchema.index({ email: 1, status: 1 });
baseUserSchema.index({ 'verification.isEmailVerified': 1, status: 1 });
baseUserSchema.index({ lastActiveAt: -1 });
baseUserSchema.index({ createdAt: -1 });
baseUserSchema.index({ userType: 1, status: 1 });

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

/**
 * Get user's full name
 */
baseUserSchema.virtual('fullName').get(function() {
  return `${this.name.first} ${this.name.last}`;
});

/**
 * Get user's initials
 */
baseUserSchema.virtual('initials').get(function() {
  return `${this.name.first.charAt(0)}${this.name.last.charAt(0)}`.toUpperCase();
});

/**
 * Check if account is locked
 */
baseUserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Check if user is active and not locked
 */
baseUserSchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.isLocked;
});

/**
 * Get days since registration
 */
baseUserSchema.virtual('daysSinceRegistration').get(function() {
  const diffTime = Math.abs(Date.now() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// ==========================================
// MIDDLEWARE - PRE HOOKS
// ==========================================

/**
 * Pre-save middleware for password hashing ONLY
 */
baseUserSchema.pre('save', async function(next) {
  try {
    // Hash password if modified
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, USER_CONFIG.BCRYPT_ROUNDS);
      this.passwordChangedAt = new Date(); // ✅ Fixed - removed security.
    }

    // Update lastActiveAt on login
    if (this.isModified('lastLoginAt')) {
      this.lastActiveAt = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// INSTANCE METHODS - USER DATA ONLY
// ==========================================

/**
 * Compare provided password with hashed password
 */
baseUserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || typeof candidatePassword !== 'string') {
    return false;
  }
  
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Handle failed login attempts (USER MODEL RESPONSIBILITY)
 */
baseUserSchema.methods.handleFailedLogin = async function() {
  // If lockout period has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account if max attempts exceeded
  if (this.loginAttempts + 1 >= USER_CONFIG.MAX_LOGIN_ATTEMPTS) {
    updates.$set = {
      lockUntil: Date.now() + USER_CONFIG.LOCKOUT_DURATION
    };
  }

  return this.updateOne(updates);
};
/**
 * Handle successful login (USER MODEL RESPONSIBILITY)
 */
baseUserSchema.methods.handleSuccessfulLogin = function(loginInfo = {}) {
  const updates = {
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    },
    $set: {
      lastLoginAt: new Date(),
      lastActiveAt: new Date()
    },
    $inc: {
      'metadata.loginCount': 1
    }
  };

  if (loginInfo.ip) {
    updates.$set['metadata.lastLoginIP'] = loginInfo.ip;
  }

  return this.updateOne(updates);
};

/**
 * Update last active timestamp
 */
baseUserSchema.methods.updateLastActive = function() {
  return this.updateOne({ lastActiveAt: new Date() });
};

/**
 * Update user profile
 */
baseUserSchema.methods.updateProfile = function(profileData) {
  const allowedFields = ['name', 'avatar', 'preferences'];
  const updates = {};
  
  allowedFields.forEach(field => {
    if (profileData[field]) {
      updates[field] = profileData[field];
    }
  });
  
  return this.updateOne({ $set: updates });
};

// ==========================================
// STATIC METHODS - QUERIES
// ==========================================

/**
 * Find user by email (including password for authentication)
 */
baseUserSchema.statics.findByEmail = function(email) {
  return this.findOne({ 
    email: email.toLowerCase().trim() 
  }).select('+password +security');
};

/**
 * Find active users only
 */
baseUserSchema.statics.findActive = function(conditions = {}) {
  return this.find({ 
    ...conditions, 
    status: 'active' 
  });
};

/**
 * Find users by type
 */
baseUserSchema.statics.findByType = function(userType, conditions = {}) {
  return this.find({ 
    ...conditions, 
    userType,
    status: 'active' 
  });
};

/**
 * Get user statistics
 */
baseUserSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$userType',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        verified: {
          $sum: { $cond: ['$verification.isEmailVerified', 1, 0] }
        }
      }
    }
  ]);
};

/**
 * Search users by name or email
 */
baseUserSchema.statics.search = function(searchTerm, options = {}) {
  const { limit = 20, skip = 0, status = 'active' } = options;
  
  const searchRegex = new RegExp(searchTerm, 'i');
  
  return this.find({
    status,
    $or: [
      { 'name.first': searchRegex },
      { 'name.last': searchRegex },
      { email: searchRegex }
    ]
  })
  .limit(limit)
  .skip(skip)
  .sort({ lastActiveAt: -1 });
};

// ==========================================
// QUERY HELPERS
// ==========================================

baseUserSchema.query.active = function() {
  return this.where({ status: 'active' });
};

baseUserSchema.query.verified = function() {
  return this.where({ 'verification.isEmailVerified': true });
};

baseUserSchema.query.recent = function(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.where({ createdAt: { $gte: cutoff } });
};

// ==========================================
// EXPORT MODEL
// ==========================================

const BaseUser = mongoose.model('BaseUser', baseUserSchema);

export default BaseUser;
export { baseUserSchema };
