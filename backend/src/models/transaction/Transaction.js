/**
 * Transaction Model
 * @module models/Transaction
 * @description Transaction model for points, purchases, and financial transactions
 */

import mongoose from 'mongoose';

// Import transaction constants
import {
  // Enums
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  PAYMENT_METHODS,
  DISCOUNT_TYPES,
  TRANSACTION_CURRENCIES,
  POINTS_EARNING_RATES,
  POINTS_SPENDING_RATES,
  TRANSACTION_DEFAULTS,
  TRANSACTION_LIMITS,
  
  // Validation Rules
  TRANSACTION_VALIDATION_RULES,
  DISCOUNT_VALIDATION_RULES,
  PAYMENT_VALIDATION_RULES,
  POINTS_VALIDATION_RULES,
  METADATA_VALIDATION_RULES,
  
  // Validation Helpers
  isValidTransactionType,
  isValidTransactionStatus,
  isValidPaymentMethod,
  isValidDiscountType,
  isValidCurrency,
  isPointsEarningTransaction,
  isPointsSpendingTransaction,
  isMonetaryTransaction,
  validateTransactionAmount,
  validatePointsAmount,
  validateDiscountPercentage,
  validateTransactionConsistency,
  generateTransactionReference,
  getTransactionCategory
} from '#constants/models/transaction/index.js';

// ==========================================
// SCHEMA CONFIGURATION
// ==========================================

const SCHEMA_OPTIONS = {
  collection: 'transactions',
  timestamps: true,
  versionKey: false,
  
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      
      // Remove sensitive data from client responses
      if (ret.payment && ret.payment.gatewayResponse) {
        delete ret.payment.gatewayResponse;
      }
      
      if (ret.metadata && ret.metadata.ipAddress) {
        delete ret.metadata.ipAddress;
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
// MAIN TRANSACTION SCHEMA
// ==========================================

const transactionSchema = new mongoose.Schema({
  
  // ==========================================
  // RELATIONSHIPS
  // ==========================================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'Transaction must belong to a user'],
    index: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null,
    index: true
  },
  
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null,
    index: true
  },
  
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null,
    index: true
  },
  
  // ==========================================
  // TRANSACTION DETAILS
  // ==========================================
  type: {
    type: String,
    enum: {
      values: TRANSACTION_TYPES,
      message: 'Invalid transaction type'
    },
    required: [true, 'Transaction type is required'],
    index: true
  },
  
  status: {
    type: String,
    enum: {
      values: TRANSACTION_STATUSES,
      message: 'Invalid transaction status'
    },
    default: TRANSACTION_DEFAULTS.STATUS,
    index: true
  },
  
  referenceId: {
    type: String,
    required: [true, 'Reference ID is required'],
    unique: true
  },
  
  description: {
    type: String,
    required: [true, 'Transaction description is required'],
    trim: true,
    minlength: [TRANSACTION_VALIDATION_RULES.DESCRIPTION.MIN_LENGTH, TRANSACTION_VALIDATION_RULES.DESCRIPTION.ERROR_MESSAGE],
    maxlength: [TRANSACTION_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH, TRANSACTION_VALIDATION_RULES.DESCRIPTION.ERROR_MESSAGE]
  },
  
  // ==========================================
  // FINANCIAL DETAILS
  // ==========================================
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [TRANSACTION_VALIDATION_RULES.AMOUNT.MIN, TRANSACTION_VALIDATION_RULES.AMOUNT.ERROR_MESSAGE],
    max: [TRANSACTION_VALIDATION_RULES.AMOUNT.MAX, TRANSACTION_VALIDATION_RULES.AMOUNT.ERROR_MESSAGE],
    validate: {
      validator: validateTransactionAmount,
      message: TRANSACTION_VALIDATION_RULES.AMOUNT.ERROR_MESSAGE
    }
  },
  
  currency: {
    type: String,
    enum: {
      values: TRANSACTION_CURRENCIES,
      message: 'Invalid currency'
    },
    default: TRANSACTION_DEFAULTS.CURRENCY
  },
  
  // ==========================================
  // POINTS SYSTEM
  // ==========================================
  pointsEarned: {
    type: Number,
    min: [TRANSACTION_VALIDATION_RULES.POINTS_EARNED.MIN, TRANSACTION_VALIDATION_RULES.POINTS_EARNED.ERROR_MESSAGE],
    max: [TRANSACTION_VALIDATION_RULES.POINTS_EARNED.MAX, TRANSACTION_VALIDATION_RULES.POINTS_EARNED.ERROR_MESSAGE],
    default: 0,
    validate: {
      validator: function(points) {
        return validatePointsAmount(points, 'earned');
      },
      message: TRANSACTION_VALIDATION_RULES.POINTS_EARNED.ERROR_MESSAGE
    }
  },
  
  pointsUsed: {
    type: Number,
    min: [TRANSACTION_VALIDATION_RULES.POINTS_USED.MIN, TRANSACTION_VALIDATION_RULES.POINTS_USED.ERROR_MESSAGE],
    max: [TRANSACTION_VALIDATION_RULES.POINTS_USED.MAX, TRANSACTION_VALIDATION_RULES.POINTS_USED.ERROR_MESSAGE],
    default: TRANSACTION_DEFAULTS.POINTS_USED,
    validate: {
      validator: function(points) {
        return validatePointsAmount(points, 'used');
      },
      message: TRANSACTION_VALIDATION_RULES.POINTS_USED.ERROR_MESSAGE
    }
  },
  
  // ==========================================
  // DISCOUNT INFORMATION
  // ==========================================
  discountUsed: {
    type: {
      type: String,
      enum: {
        values: DISCOUNT_TYPES,
        message: 'Invalid discount type'
      },
      default: null
    },
    
    code: {
      type: String,
      validate: {
        validator: function(code) {
          if (!code) return true;
          return DISCOUNT_VALIDATION_RULES.CODE.PATTERN.test(code);
        },
        message: DISCOUNT_VALIDATION_RULES.CODE.ERROR_MESSAGE
      },
      default: null
    },
    
    percentage: {
      type: Number,
      min: [DISCOUNT_VALIDATION_RULES.PERCENTAGE.MIN, DISCOUNT_VALIDATION_RULES.PERCENTAGE.ERROR_MESSAGE],
      max: [DISCOUNT_VALIDATION_RULES.PERCENTAGE.MAX, DISCOUNT_VALIDATION_RULES.PERCENTAGE.ERROR_MESSAGE],
      validate: {
        validator: function(percentage) {
          return !percentage || validateDiscountPercentage(percentage);
        },
        message: DISCOUNT_VALIDATION_RULES.PERCENTAGE.ERROR_MESSAGE
      },
      default: 0
    },
    
    amount: {
      type: Number,
      min: [DISCOUNT_VALIDATION_RULES.AMOUNT.MIN, DISCOUNT_VALIDATION_RULES.AMOUNT.ERROR_MESSAGE],
      max: [DISCOUNT_VALIDATION_RULES.AMOUNT.MAX, DISCOUNT_VALIDATION_RULES.AMOUNT.ERROR_MESSAGE],
      default: 0
    }
  },
  
  // ==========================================
  // PAYMENT INFORMATION
  // ==========================================
  payment: {
    method: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: 'Invalid payment method'
      },
      default: TRANSACTION_DEFAULTS.PAYMENT_METHOD
    },
    
    provider: {
      type: String,
      default: null
    },
    
    gatewayTransactionId: {
      type: String,
      validate: {
        validator: function(id) {
          if (!id) return true;
          return PAYMENT_VALIDATION_RULES.PAYMENT_ID.PATTERN.test(id);
        },
        message: PAYMENT_VALIDATION_RULES.PAYMENT_ID.ERROR_MESSAGE
      },
      default: null
    },
    
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false // Hide from client queries
    },
    
    processingFee: {
      type: Number,
      min: [PAYMENT_VALIDATION_RULES.TRANSACTION_FEE.MIN, PAYMENT_VALIDATION_RULES.TRANSACTION_FEE.ERROR_MESSAGE],
      max: [PAYMENT_VALIDATION_RULES.TRANSACTION_FEE.MAX, PAYMENT_VALIDATION_RULES.TRANSACTION_FEE.ERROR_MESSAGE],
      default: 0
    },
    
    netAmount: {
      type: Number,
      default: 0
    }
  },
  
  // ==========================================
  // TRANSACTION DATES
  // ==========================================
  processedAt: {
    type: Date,
    default: null
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  failedAt: {
    type: Date,
    default: null
  },
  
  // ==========================================
  // ERROR HANDLING
  // ==========================================
  error: {
    code: {
      type: String,
      default: null
    },
    
    message: {
      type: String,
      maxlength: 500,
      default: null
    },
    
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false // Hide from client queries
    }
  },
  
  // ==========================================
  // METADATA & TRACKING
  // ==========================================
  metadata: {
    ipAddress: {
      type: String,
      validate: {
        validator: function(ip) {
          if (!ip) return true;
          return METADATA_VALIDATION_RULES.IP_ADDRESS.PATTERN.test(ip);
        },
        message: METADATA_VALIDATION_RULES.IP_ADDRESS.ERROR_MESSAGE
      },
      default: null,
      select: false // Hide for privacy
    },
    
    userAgent: {
      type: String,
      maxlength: [METADATA_VALIDATION_RULES.USER_AGENT.MAX_LENGTH, METADATA_VALIDATION_RULES.USER_AGENT.ERROR_MESSAGE],
      default: null
    },
    
    deviceInfo: {
      type: String,
      maxlength: [METADATA_VALIDATION_RULES.DEVICE_INFO.MAX_LENGTH, METADATA_VALIDATION_RULES.DEVICE_INFO.ERROR_MESSAGE],
      default: null
    },
    
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'admin'],
      default: 'web'
    },
    
    sessionId: {
      type: String,
      default: null
    }
  },
  
  // ==========================================
  // ADDITIONAL NOTES
  // ==========================================
  notes: {
    type: String,
    maxlength: [TRANSACTION_VALIDATION_RULES.NOTES.MAX_LENGTH, TRANSACTION_VALIDATION_RULES.NOTES.ERROR_MESSAGE],
    default: ''
  },
  
  // Admin-only internal notes
  internalNotes: {
    type: String,
    maxlength: 1000,
    default: '',
    select: false // Hide from client queries
  }
  
}, SCHEMA_OPTIONS);

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

// Core indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, type: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
// referenceId already has unique: true, no need for separate index

// Relationship indexes
transactionSchema.index({ courseId: 1, status: 1 });
transactionSchema.index({ subscriptionId: 1, status: 1 });
transactionSchema.index({ quizId: 1, status: 1 });

// Financial indexes
transactionSchema.index({ amount: -1, status: 1 });
transactionSchema.index({ pointsEarned: -1 });
transactionSchema.index({ pointsUsed: -1 });

// Payment indexes
transactionSchema.index({ 'payment.method': 1, status: 1 });
transactionSchema.index({ 'payment.gatewayTransactionId': 1 });

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

transactionSchema.pre('validate', function(next) {
  // Generate reference ID if not exists and we have the required fields
  if (!this.referenceId && this.type && this.userId) {
    this.referenceId = generateTransactionReference(this.type, this.userId);
  }
  
  next();
});

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================

transactionSchema.pre('save', function(next) {
  try {
    // Run consistency validation only for complete transactions (after Mongoose validation passes)
    if (this.type && this.userId && this.description && this.amount !== undefined) {
      if (!validateTransactionConsistency(this)) {
        return next(new Error('Transaction data is inconsistent'));
      }
    }
    
    // Calculate net amount (handle undefined processingFee)
    const processingFee = this.payment?.processingFee || 0;
    this.payment.netAmount = (this.amount || 0) - processingFee;
    
    // Update timestamps based on status
    if (this.isModified('status')) {
      switch (this.status) {
        case 'completed':
          if (!this.completedAt) {
            this.completedAt = new Date();
          }
          break;
        case 'failed':
          if (!this.failedAt) {
            this.failedAt = new Date();
          }
          break;
      }
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
 * Check if transaction is completed
 */
transactionSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' && !!this.completedAt;
});

/**
 * Check if transaction is pending
 */
transactionSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

/**
 * Check if transaction failed
 */
transactionSchema.virtual('hasFailed').get(function() {
  return this.status === 'failed';
});

/**
 * Get transaction category
 */
transactionSchema.virtual('category').get(function() {
  return getTransactionCategory(this.type);
});

/**
 * Get final amount after discount
 */
transactionSchema.virtual('finalAmount').get(function() {
  return this.amount - (this.discountUsed.amount || 0);
});

/**
 * Get processing time in milliseconds
 */
transactionSchema.virtual('processingTime').get(function() {
  if (!this.createdAt || !this.completedAt) return null;
  return this.completedAt.getTime() - this.createdAt.getTime();
});

// ==========================================
// INSTANCE METHODS
// ==========================================

/**
 * Mark transaction as processed
 */
transactionSchema.methods.markAsProcessed = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  return this.save();
};

/**
 * Complete the transaction
 */
transactionSchema.methods.complete = function(gatewayData = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  
  if (gatewayData) {
    this.payment.gatewayTransactionId = gatewayData.id;
    this.payment.gatewayResponse = gatewayData.response;
  }
  
  return this.save();
};

/**
 * Fail the transaction
 */
transactionSchema.methods.fail = function(errorCode, errorMessage, errorDetails = null) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.error.code = errorCode;
  this.error.message = errorMessage;
  this.error.details = errorDetails;
  
  return this.save();
};

/**
 * Cancel the transaction
 */
transactionSchema.methods.cancel = function(reason = null) {
  this.status = 'cancelled';
  if (reason) {
    this.notes = reason;
  }
  return this.save();
};

/**
 * Refund the transaction
 */
transactionSchema.methods.refund = function(refundAmount = null, reason = null) {
  // Create a refund transaction
  const RefundTransaction = this.constructor;
  
  const actualRefundAmount = refundAmount || this.amount;
  
  const refundData = {
    userId: this.userId,
    type: this.type.includes('course') ? 'course_refund' : 'subscription_refund',
    status: 'completed',
    description: `Refund for ${this.description}`,
    amount: actualRefundAmount, // Keep positive for validation, handle as refund in business logic
    currency: this.currency,
    payment: {
      method: this.payment.method,
      provider: this.payment.provider
    },
    notes: reason || 'Transaction refunded'
  };
  
  if (this.courseId) refundData.courseId = this.courseId;
  if (this.subscriptionId) refundData.subscriptionId = this.subscriptionId;
  
  return RefundTransaction.create(refundData);
};

/**
 * Check if transaction can be refunded
 */
transactionSchema.methods.canRefund = function() {
  const refundableTypes = ['course_purchase', 'subscription_payment'];
  const refundableStatuses = ['completed'];
  
  return refundableTypes.includes(this.type) && 
         refundableStatuses.includes(this.status) &&
         this.amount > 0;
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Find transactions by user with filters
 */
transactionSchema.statics.findByUser = function(userId, options = {}) {
  const {
    type,
    status,
    category,
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;
  
  const query = { userId };
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (category) {
    const categoryTypes = TRANSACTION_TYPES.filter(t => getTransactionCategory(t) === category);
    query.type = { $in: categoryTypes };
  }
  
  return this.find(query)
    .limit(limit)
    .skip(skip)
    .sort(sort);
};

/**
 * Calculate user points balance
 */
transactionSchema.statics.calculatePointsBalance = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: null,
        totalEarned: { $sum: '$pointsEarned' },
        totalSpent: { $sum: '$pointsUsed' }
      }
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ['$totalEarned', '$totalSpent'] },
        totalEarned: 1,
        totalSpent: 1
      }
    }
  ]);
};

/**
 * Get user transaction statistics
 */
transactionSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalPoints: { $sum: '$pointsEarned' }
      }
    }
  ]);
};

/**
 * Get revenue statistics
 */
transactionSchema.statics.getRevenueStats = function(startDate = null, endDate = null) {
  const matchQuery = { 
    status: 'completed',
    type: { $in: ['course_purchase', 'subscription_payment'] }
  };
  
  if (startDate && endDate) {
    matchQuery.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

/**
 * Find pending transactions older than specified time
 */
transactionSchema.statics.findStaleTransactions = function(hoursOld = 24) {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hoursOld);
  
  return this.find({
    status: 'pending',
    createdAt: { $lte: cutoffDate }
  });
};

// ==========================================
// QUERY HELPERS
// ==========================================

transactionSchema.query.completed = function() {
  return this.where({ status: 'completed' });
};

transactionSchema.query.pending = function() {
  return this.where({ status: 'pending' });
};

transactionSchema.query.pointsEarning = function() {
  const earningTypes = TRANSACTION_TYPES.filter(isPointsEarningTransaction);
  return this.where({ type: { $in: earningTypes } });
};

transactionSchema.query.pointsSpending = function() {
  const spendingTypes = TRANSACTION_TYPES.filter(isPointsSpendingTransaction);
  return this.where({ type: { $in: spendingTypes } });
};

transactionSchema.query.monetary = function() {
  const monetaryTypes = TRANSACTION_TYPES.filter(isMonetaryTransaction);
  return this.where({ type: { $in: monetaryTypes } });
};

transactionSchema.query.recent = function(days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.where({ createdAt: { $gte: cutoff } });
};

// ==========================================
// EXPORT MODEL
// ==========================================

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
export { transactionSchema };