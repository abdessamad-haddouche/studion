/**
 * Subscription Model
 * @module models/Subscription
 * @description User subscription management model for BASIC, PREMIUM, etc plans
 */

import mongoose from 'mongoose';

// Import subscription constants
import {
  // Enums
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  BILLING_CYCLES,
  PAYMENT_PROVIDERS,
  SUBSCRIPTION_FEATURES,
  PLAN_LIMITS,
  PLAN_PRICING,
  SUBSCRIPTION_DEFAULTS,
  
  // Validation Rules
  SUBSCRIPTION_VALIDATION_RULES,
  DATE_VALIDATION_RULES,
  PAYMENT_VALIDATION_RULES,
  FEATURE_VALIDATION_RULES,
  METADATA_VALIDATION_RULES,
  
  // Validation Helpers
  isValidSubscriptionPlan,
  isValidSubscriptionStatus,
  isValidBillingCycle,
  hasFeatureAccess,
  getPlanLimits,
  getPlanPrice,
  isPaidPlan,
  validateSubscriptionDates,
  validatePaymentAmount,
  validateCurrency,
  validateCustomLimits,
  calculateEndDate
} from '#constants/models/subscription/index.js';

// ==========================================
// SCHEMA CONFIGURATION
// ==========================================

const SCHEMA_OPTIONS = {
  collection: 'subscriptions',
  timestamps: true,
  versionKey: false,
  
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      
      // Remove sensitive payment data from client responses
      if (ret.payment && ret.payment.paymentMethodId) {
        delete ret.payment.paymentMethodId;
      }
      
      return ret;
    },
    virtuals: true
  },
  
  toObject: {
    virtuals: true
  }
};

// ==========================================
// MAIN SUBSCRIPTION SCHEMA
// ==========================================

const subscriptionSchema = new mongoose.Schema({
  
  // ==========================================
  // USER RELATIONSHIP
  // ==========================================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'Subscription must belong to a user'],
    index: true
  },
  
  // ==========================================
  // SUBSCRIPTION PLAN DETAILS
  // ==========================================
  planType: {
    type: String,
    enum: {
      values: SUBSCRIPTION_PLANS,
      message: 'Invalid subscription plan'
    },
    required: [true, 'Plan type is required'],
    default: SUBSCRIPTION_DEFAULTS.PLAN,
    index: true
  },
  
  status: {
    type: String,
    enum: {
      values: SUBSCRIPTION_STATUSES,
      message: 'Invalid subscription status'
    },
    required: [true, 'Subscription status is required'],
    default: SUBSCRIPTION_DEFAULTS.STATUS,
    index: true
  },
  
  // ==========================================
  // SUBSCRIPTION DATES
  // ==========================================
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(endDate) {
        return validateSubscriptionDates(this.startDate, endDate);
      },
      message: 'Invalid subscription date range'
    }
  },
  
  trialStartDate: {
    type: Date,
    default: null
  },
  
  trialEndDate: {
    type: Date,
    default: null
  },
  
  // ==========================================
  // BILLING INFORMATION
  // ==========================================
  billing: {
    cycle: {
      type: String,
      enum: {
        values: BILLING_CYCLES,
        message: 'Invalid billing cycle'
      },
      default: SUBSCRIPTION_DEFAULTS.BILLING_CYCLE
    },
    
    amount: {
      type: Number,
      required: [true, 'Billing amount is required'],
      min: [PAYMENT_VALIDATION_RULES.AMOUNT.MIN, PAYMENT_VALIDATION_RULES.AMOUNT.ERROR_MESSAGE],
      max: [PAYMENT_VALIDATION_RULES.AMOUNT.MAX, PAYMENT_VALIDATION_RULES.AMOUNT.ERROR_MESSAGE],
      validate: {
        validator: validatePaymentAmount,
        message: PAYMENT_VALIDATION_RULES.AMOUNT.ERROR_MESSAGE
      }
    },
    
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      validate: {
        validator: validateCurrency,
        message: PAYMENT_VALIDATION_RULES.CURRENCY.ERROR_MESSAGE
      },
      default: PAYMENT_VALIDATION_RULES.CURRENCY.DEFAULT
    },
    
    nextBillingDate: {
      type: Date,
      default: null
    }
  },
  
  // ==========================================
  // PAYMENT INFORMATION
  // ==========================================
  payment: {
    provider: {
      type: String,
      enum: {
        values: PAYMENT_PROVIDERS,
        message: 'Invalid payment provider'
      },
      default: 'free'
    },
    
    paymentMethodId: {
      type: String,
      validate: {
        validator: function(id) {
          if (!id) return true; // Optional field
          return SUBSCRIPTION_VALIDATION_RULES.PAYMENT_ID.PATTERN.test(id);
        },
        message: SUBSCRIPTION_VALIDATION_RULES.PAYMENT_ID.ERROR_MESSAGE
      },
      select: false // Hide from client queries for security
    },
    
    lastPaymentDate: {
      type: Date,
      default: null
    },
    
    lastPaymentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    failedPaymentAttempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  
  // ==========================================
  // SUBSCRIPTION FEATURES & LIMITS
  // ==========================================
  features: {
    enabled: [{
      type: String,
      enum: {
        values: SUBSCRIPTION_FEATURES,
        message: 'Invalid subscription feature'
      }
    }],
    
    customLimits: {
      documentsPerMonth: {
        type: Number,
        min: -1, // -1 means unlimited
        default: null
      },
      
      quizzesPerMonth: {
        type: Number,
        min: -1, // -1 means unlimited
        default: null
      },
      
      storageGB: {
        type: Number,
        min: 0,
        default: null
      },
      
      pointsMultiplier: {
        type: Number,
        min: FEATURE_VALIDATION_RULES.CUSTOM_LIMITS.POINTS_MULTIPLIER.MIN,
        max: FEATURE_VALIDATION_RULES.CUSTOM_LIMITS.POINTS_MULTIPLIER.MAX,
        default: null
      },
      
      courseDiscountMax: {
        type: Number,
        min: FEATURE_VALIDATION_RULES.CUSTOM_LIMITS.COURSE_DISCOUNT_MAX.MIN,
        max: FEATURE_VALIDATION_RULES.CUSTOM_LIMITS.COURSE_DISCOUNT_MAX.MAX,
        default: null
      }
    }
  },
  
  // ==========================================
  // SUBSCRIPTION SETTINGS
  // ==========================================
  settings: {
    autoRenew: {
      type: Boolean,
      default: SUBSCRIPTION_DEFAULTS.AUTO_RENEW
    },
    
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    
    pauseCollection: {
      type: Boolean,
      default: false
    }
  },
  
  // ==========================================
  // USAGE TRACKING
  // ==========================================
  usage: {
    currentPeriod: {
      documentsUploaded: {
        type: Number,
        default: 0,
        min: 0
      },
      
      quizzesGenerated: {
        type: Number,
        default: 0,
        min: 0
      },
      
      storageUsedGB: {
        type: Number,
        default: 0,
        min: 0
      },
      
      periodStart: {
        type: Date,
        default: Date.now
      },
      
      periodEnd: {
        type: Date,
        default: null
      }
    }
  },
  
  // ==========================================
  // METADATA & TRACKING
  // ==========================================
  metadata: {
    promocode: {
      type: String,
      validate: {
        validator: function(code) {
          if (!code) return true; // Optional field
          return METADATA_VALIDATION_RULES.PROMO_CODE.PATTERN.test(code);
        },
        message: METADATA_VALIDATION_RULES.PROMO_CODE.ERROR_MESSAGE
      },
      default: null
    },
    
    referralSource: {
      type: String,
      maxlength: 100,
      default: null
    },
    
    cancelReason: {
      type: String,
      maxlength: [METADATA_VALIDATION_RULES.CANCEL_REASON.MAX_LENGTH, METADATA_VALIDATION_RULES.CANCEL_REASON.ERROR_MESSAGE],
      default: null
    },
    
    notes: {
      type: String,
      maxlength: [METADATA_VALIDATION_RULES.NOTES.MAX_LENGTH, METADATA_VALIDATION_RULES.NOTES.ERROR_MESSAGE],
      default: ''
    }
  },
  
  // ==========================================
  // SOFT DELETE
  // ==========================================
  deletedAt: {
    type: Date,
    default: null,
    index: true
  }
  
}, SCHEMA_OPTIONS);

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

// Core indexes
subscriptionSchema.index({ userId: 1, status: 1, deletedAt: 1 });
subscriptionSchema.index({ planType: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 }); // For expiration checks
subscriptionSchema.index({ 'billing.nextBillingDate': 1, status: 1 }); // For billing jobs
subscriptionSchema.index({ 'payment.provider': 1, status: 1 });

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

subscriptionSchema.pre('validate', function(next) {
  // Only set defaults if we have a valid planType, otherwise let validation fail
  if (this.planType && this.isModified('planType') && !this.features.enabled.length) {
    const planLimits = getPlanLimits(this.planType);
    this.features.enabled = planLimits.features || [];
  }
  
  // Only set billing amount if planType and cycle exist, and amount is missing or 0
  if (this.planType && this.billing?.cycle && 
      (this.isModified('planType') || this.isModified('billing.cycle'))) {
    if (!this.billing.amount || this.billing.amount === 0) {
      this.billing.amount = getPlanPrice(this.planType, this.billing.cycle) || 0;
    }
  }
  
  next();
});

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================

subscriptionSchema.pre('save', function(next) {
  try {
    // Calculate end date only if not explicitly set
    if (this.isModified('startDate') || this.isModified('billing.cycle')) {
      // Only auto-calculate if endDate is not explicitly provided or if billing cycle changed
      if (!this.endDate || (this.isModified('billing.cycle') && !this.isModified('endDate'))) {
        this.endDate = calculateEndDate(this.startDate, this.billing.cycle);
      }
    }
    
    // Set next billing date
    if (this.settings.autoRenew && this.status === 'active') {
      this.billing.nextBillingDate = this.endDate;
    }
    
    // Set usage period dates
    if (this.isNew || this.isModified('startDate')) {
      this.usage.currentPeriod.periodStart = this.startDate;
      this.usage.currentPeriod.periodEnd = this.endDate;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

/**
 * Check if subscription is currently active
 */
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && 
         this.endDate > new Date() && 
         !this.deletedAt;
});

/**
 * Check if subscription is expired
 */
subscriptionSchema.virtual('isExpired').get(function() {
  return this.endDate <= new Date();
});

/**
 * Check if subscription is in trial period
 */
subscriptionSchema.virtual('isInTrial').get(function() {
  if (!this.trialStartDate || !this.trialEndDate) return false;
  const now = new Date();
  return now >= this.trialStartDate && now <= this.trialEndDate;
});

/**
 * Get days remaining in subscription
 */
subscriptionSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  if (this.endDate <= now) return 0;
  return Math.ceil((this.endDate - now) / (1000 * 60 * 60 * 24));
});

/**
 * Check if subscription needs renewal soon (within 7 days)
 */
subscriptionSchema.virtual('needsRenewal').get(function() {
  return this.daysRemaining <= 7 && this.daysRemaining > 0;
});

/**
 * Get effective plan limits (custom or default)
 */
subscriptionSchema.virtual('effectiveLimits').get(function() {
  const defaultLimits = getPlanLimits(this.planType);
  const customLimits = this.features.customLimits || {};
  
  return {
    documentsPerMonth: customLimits.documentsPerMonth ?? defaultLimits.documentsPerMonth,
    quizzesPerMonth: customLimits.quizzesPerMonth ?? defaultLimits.quizzesPerMonth,
    storageGB: customLimits.storageGB ?? defaultLimits.storageGB,
    pointsMultiplier: customLimits.pointsMultiplier ?? defaultLimits.pointsMultiplier,
    courseDiscountMax: customLimits.courseDiscountMax ?? defaultLimits.courseDiscountMax,
    features: this.features.enabled
  };
});

// ==========================================
// INSTANCE METHODS
// ==========================================

/**
 * Check if user has access to a specific feature
 */
subscriptionSchema.methods.hasFeature = function(feature) {
  return hasFeatureAccess(this.planType, feature) || 
         this.features.enabled.includes(feature);
};

/**
 * Check if user has reached usage limits
 */
subscriptionSchema.methods.checkUsageLimits = function() {
  const limits = this.effectiveLimits;
  const usage = this.usage.currentPeriod;
  
  return {
    documents: {
      used: usage.documentsUploaded,
      limit: limits.documentsPerMonth,
      hasReached: limits.documentsPerMonth !== -1 && usage.documentsUploaded >= limits.documentsPerMonth,
      percentage: limits.documentsPerMonth === -1 ? 0 : (usage.documentsUploaded / limits.documentsPerMonth) * 100
    },
    quizzes: {
      used: usage.quizzesGenerated,
      limit: limits.quizzesPerMonth,
      hasReached: limits.quizzesPerMonth !== -1 && usage.quizzesGenerated >= limits.quizzesPerMonth,
      percentage: limits.quizzesPerMonth === -1 ? 0 : (usage.quizzesGenerated / limits.quizzesPerMonth) * 100
    },
    storage: {
      used: usage.storageUsedGB,
      limit: limits.storageGB,
      hasReached: usage.storageUsedGB >= limits.storageGB,
      percentage: (usage.storageUsedGB / limits.storageGB) * 100
    }
  };
};

/**
 * Increment usage counters
 */
subscriptionSchema.methods.incrementUsage = function(type, amount = 1) {
  const validTypes = ['documentsUploaded', 'quizzesGenerated', 'storageUsedGB'];
  
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid usage type: ${type}`);
  }
  
  this.usage.currentPeriod[type] += amount;
  return this.save();
};

/**
 * Reset usage counters for new period
 */
subscriptionSchema.methods.resetUsagePeriod = function() {
  this.usage.currentPeriod = {
    documentsUploaded: 0,
    quizzesGenerated: 0,
    storageUsedGB: 0,
    periodStart: new Date(),
    periodEnd: this.endDate
  };
  
  // Don't save here - let the caller save
  return this;
};

/**
 * Cancel subscription
 */
subscriptionSchema.methods.cancel = function(reason = null, cancelAtPeriodEnd = true) {
  if (cancelAtPeriodEnd) {
    this.settings.cancelAtPeriodEnd = true;
    this.settings.autoRenew = false;
  } else {
    this.status = 'cancelled';
    // Set endDate to now, but ensure it's at least 1 second after startDate to pass validation
    const now = new Date();
    const minEndDate = new Date(this.startDate.getTime() + 1000); // 1 second after start
    this.endDate = now > minEndDate ? now : minEndDate;
  }
  
  if (reason) {
    this.metadata.cancelReason = reason;
  }
  
  return this.save();
};

/**
 * Renew subscription
 */
subscriptionSchema.methods.renew = function(newEndDate = null) {
  if (!newEndDate) {
    newEndDate = calculateEndDate(this.endDate, this.billing.cycle);
  }
  
  this.startDate = this.endDate;
  this.endDate = newEndDate;
  this.status = 'active';
  this.settings.cancelAtPeriodEnd = false;
  this.billing.nextBillingDate = newEndDate;
  
  // Reset usage for new period
  this.resetUsagePeriod();
  
  return this.save();
};

/**
 * Upgrade subscription plan
 */
subscriptionSchema.methods.upgrade = function(newPlan) {
  if (!isValidSubscriptionPlan(newPlan)) {
    throw new Error('Invalid subscription plan');
  }
  
  const oldPlan = this.planType;
  this.planType = newPlan;
  
  // Update features and limits
  const planLimits = getPlanLimits(newPlan);
  this.features.enabled = planLimits.features;
  this.billing.amount = getPlanPrice(newPlan, this.billing.cycle);
  
  return this.save();
};

/**
 * Soft delete subscription
 */
subscriptionSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.status = 'cancelled';
  return this.save();
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Find active subscription for user
 */
subscriptionSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({
    userId,
    status: 'active',
    endDate: { $gt: new Date() },
    deletedAt: null
  });
};

/**
 * Find subscriptions needing renewal
 */
subscriptionSchema.statics.findNeedingRenewal = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'active',
    'settings.autoRenew': true,
    endDate: { $lte: futureDate, $gt: new Date() },
    deletedAt: null
  });
};

/**
 * Find expired subscriptions
 */
subscriptionSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    endDate: { $lte: new Date() },
    deletedAt: null
  });
};

/**
 * Get subscription statistics
 */
subscriptionSchema.statics.getStats = function() {
  return this.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$planType',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        averageRevenue: { $avg: '$billing.amount' },
        totalRevenue: { $sum: '$billing.amount' }
      }
    }
  ]);
};

// ==========================================
// QUERY HELPERS
// ==========================================

subscriptionSchema.query.active = function() {
  return this.where({ 
    status: 'active', 
    endDate: { $gt: new Date() }, 
    deletedAt: null 
  });
};

subscriptionSchema.query.byPlan = function(plan) {
  return this.where({ planType: plan });
};

subscriptionSchema.query.paid = function() {
  return this.where({ planType: { $ne: 'free' } });
};

subscriptionSchema.query.expiringSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.where({
    endDate: { $lte: futureDate, $gt: new Date() }
  });
};

// ==========================================
// EXPORT MODEL
// ==========================================

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
export { subscriptionSchema };