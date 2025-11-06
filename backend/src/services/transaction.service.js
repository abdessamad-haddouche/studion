/**
 * Transaction Service
 * @module services/transaction
 * @description Core business logic for transaction operations, points management, and transaction history
 */

import Transaction from '#models/transaction/Transaction.js';
import { Student } from '#models/users/index.js';
import { HttpError } from '#exceptions/index.js';
import mongoose from 'mongoose';
import {
  calculateQuizPoints,
  isPointsEarningTransaction,
  isPointsSpendingTransaction,
  POINTS_EARNING_RATES,
  generateTransactionReference,
  validateTransactionConsistency
} from '#constants/models/transaction/index.js';

/**
 * Create a points earning transaction (quiz completion, document upload, etc.)
 * @param {Object} transactionData - Transaction creation data
 * @returns {Promise<Object>} Created transaction and updated user points
 */
export const createPointsEarningTransaction = async (transactionData) => {
  try {
    console.log(`💰 Creating points earning transaction for user: ${transactionData.userId}`);
    
    // 1. Validate transaction data
    const {
      userId,
      type,
      pointsEarned,
      description,
      relatedId, // Quiz ID, Document ID, etc.
      metadata = {}
    } = transactionData;

    if (!userId || !type || !pointsEarned || !description) {
      throw HttpError.badRequest('Missing required transaction fields', {
        code: 'MISSING_TRANSACTION_DATA',
        required: ['userId', 'type', 'pointsEarned', 'description']
      });
    }

    if (!isPointsEarningTransaction(type)) {
      throw HttpError.badRequest('Invalid transaction type for points earning', {
        code: 'INVALID_EARNING_TRANSACTION_TYPE',
        validTypes: ['quiz_completion', 'document_upload', 'daily_login', 'referral_bonus']
      });
    }

    // 🔧 FIX: Try to find user in BaseUser collection first, then Student
    console.log(`🔍 DEBUG: Looking for user with ID: ${userId}`);
    
    let user = await Student.findById(userId);
    if (!user) {
      console.log(`⚠️ DEBUG: User not found in Student collection, trying BaseUser...`);
      // Try BaseUser collection as fallback
      const { BaseUser } = await import('#models/users/index.js');
      user = await BaseUser.findById(userId);
    }
    
    if (!user) {
      console.error(`❌ DEBUG: User not found in any collection. UserID: ${userId}`);
      // Let's check what's actually in the database
      console.log(`🔍 DEBUG: Checking database for user existence...`);
      const allUsers = await Student.find({}).limit(5);
      console.log(`🔍 DEBUG: Sample users in database:`, allUsers.map(u => ({ id: u._id, email: u.email, userType: u.userType })));
      
      throw HttpError.notFound('User not found');
    }
    
    console.log(`✅ DEBUG: User found - ID: ${user._id}, Type: ${user.userType || 'unknown'}`);

    // 3. Create transaction
    const transaction = new Transaction({
      userId,
      type,
      status: 'completed',
      description,
      amount: 0, // Points earning transactions have no monetary value
      pointsEarned,
      pointsUsed: 0,
      payment: {
        method: 'points',
        provider: 'internal'
      },
      metadata: {
        source: 'web',
        sessionId: metadata.sessionId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        originalSource: metadata.source || 'quiz_completion',
        transactionContext: metadata.transactionContext || 'quiz_completion'
      },
      completedAt: new Date()
    });

    // Add related ID based on transaction type
    if (type === 'quiz_completion' && relatedId) {
      transaction.quizId = relatedId;
    }

    await transaction.save();
    console.log(`✅ DEBUG: Transaction saved: ${transaction._id}`);

    // 4. Update user points - Try both Student and BaseUser update methods
    try {
      const pointsUpdate = {
        $inc: {
          'progress.totalPoints': pointsEarned
        },
        $set: {
          'progress.lastPointsEarned': pointsEarned,
          'progress.lastPointsEarnedAt': new Date()
        }
      };

      let updateResult;
      if (user.userType === 'student' || user.constructor.name === 'Student') {
        updateResult = await Student.findByIdAndUpdate(userId, pointsUpdate, { new: true });
      } else {
        const { BaseUser } = await import('#models/users/index.js');
        updateResult = await BaseUser.findByIdAndUpdate(userId, pointsUpdate, { new: true });
      }
      
      console.log(`✅ DEBUG: User points updated. New total: ${user.progress.totalPoints + pointsEarned}`);
      
    } catch (updateError) {
      console.error(`❌ DEBUG: User update failed:`, updateError);
      throw updateError;
    }

    console.log(`✅ Points transaction completed: +${pointsEarned} points`);

    return {
      success: true,
      transaction: transaction.toJSON(),
      pointsEarned,
      newTotalPoints: user.progress.totalPoints + pointsEarned
    };

  } catch (error) {
    console.error('❌ Create points earning transaction error:', error);
    throw error.name === 'HttpError' ? error : HttpError.internalServerError(`Failed to create points transaction: ${error.message}`);
  }
};

/**
 * Create a points spending transaction (course discounts, premium features, etc.)
 * @param {Object} transactionData - Transaction creation data
 * @returns {Promise<Object>} Created transaction and updated user points
 */
export const createPointsSpendingTransaction = async (transactionData) => {
  try {
    console.log(`💸 Creating points spending transaction for user: ${transactionData.userId}`);
    
    const {
      userId,
      type,
      pointsUsed,
      description,
      amount = 0,
      courseId = null,
      metadata = {}
    } = transactionData;

    // 1. Validate transaction data
    if (!userId || !type || !pointsUsed || !description) {
      throw HttpError.badRequest('Missing required transaction fields');
    }

    if (!isPointsSpendingTransaction(type)) {
      throw HttpError.badRequest('Invalid transaction type for points spending');
    }

    // 2. Get user and validate points balance
    const user = await Student.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found');
    }

    const availablePoints = user.progress.totalPoints - user.progress.pointsUsed;
    if (availablePoints < pointsUsed) {
      throw HttpError.badRequest('Insufficient points balance', {
        code: 'INSUFFICIENT_POINTS',
        available: availablePoints,
        required: pointsUsed
      });
    }

    // 3. Create transaction
    const transaction = new Transaction({
      userId,
      type,
      status: 'completed',
      description,
      amount,
      pointsEarned: 0,
      pointsUsed,
      courseId,
      payment: {
        method: 'points',
        provider: 'internal'
      },
      metadata: {
        source: metadata.source || 'web',
        sessionId: metadata.sessionId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      },
      completedAt: new Date()
    });

    await transaction.save();

    // 4. Update user points usage (without session)
    const pointsUpdate = {
      $inc: {
        'progress.pointsUsed': pointsUsed
      },
      $set: {
        'progress.lastPointsUsed': pointsUsed,
        'progress.lastPointsUsedAt': new Date()
      }
    };

    await Student.findByIdAndUpdate(userId, pointsUpdate);

    console.log(`✅ Points spending completed: -${pointsUsed} points`);

    return {
      success: true,
      transaction: transaction.toJSON(),
      pointsUsed,
      remainingPoints: availablePoints - pointsUsed
    };

  } catch (error) {
    console.error('❌ Create points spending transaction error:', error);
    throw error.name === 'HttpError' ? error : HttpError.internalServerError(`Failed to create points spending transaction: ${error.message}`);
  }
};

/**
 * Get user transaction history with filtering and pagination
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Transaction history with pagination
 */
export const getUserTransactionHistory = async (userId, options = {}) => {
  try {
    console.log(`📋 Getting transaction history for user: ${userId}`);

    const {
      page = 1,
      limit = 20,
      type = null,
      status = null,
      category = null,
      startDate = null,
      endDate = null
    } = options;

    const skip = (page - 1) * limit;

    // Build query
    const query = { userId };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) {
      // Filter by transaction category (points_earning, points_spending, monetary)
      const categoryTypes = {
        'points_earning': ['quiz_completion', 'document_upload', 'daily_login', 'referral_bonus', 'achievement_bonus'],
        'points_spending': ['course_discount', 'premium_feature', 'bonus_content'],
        'monetary': ['course_purchase', 'subscription_payment', 'course_refund', 'subscription_refund']
      };
      
      if (categoryTypes[category]) {
        query.type = { $in: categoryTypes[category] };
      }
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('quizId', 'title difficulty')
        .populate('courseId', 'title price')
        .lean(),
      Transaction.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    console.log(`✅ Retrieved ${transactions.length} transactions`);

    return {
      success: true,
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        status: t.status,
        description: t.description,
        amount: t.amount,
        pointsEarned: t.pointsEarned,
        pointsUsed: t.pointsUsed,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
        quiz: t.quizId ? { title: t.quizId.title, difficulty: t.quizId.difficulty } : null,
        course: t.courseId ? { title: t.courseId.title, price: t.courseId.price } : null
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
        hasNext,
        hasPrev
      }
    };

  } catch (error) {
    console.error('❌ Get transaction history error:', error);
    throw HttpError.internalServerError(`Failed to get transaction history: ${error.message}`);
  }
};

/**
 * Get user transaction statistics
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Transaction statistics
 */
export const getUserTransactionStats = async (userId, options = {}) => {
  try {
    console.log(`📊 Getting transaction stats for user: ${userId}`);

    const { period = 'all' } = options;

    // Build date filter
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      switch (period) {
        case 'week':
          dateFilter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
          break;
        case 'month':
          dateFilter.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
          break;
        case 'year':
          dateFilter.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
          break;
      }
    }

    // Get comprehensive stats
    const [
      pointsStats,
      transactionCounts,
      recentTransactions
    ] = await Promise.all([
      // Points balance calculation
      Transaction.calculatePointsBalance(userId),
      
      // Transaction counts by type and status
      Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), ...dateFilter } },
        {
          $group: {
            _id: { type: '$type', status: '$status' },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalPointsEarned: { $sum: '$pointsEarned' },
            totalPointsUsed: { $sum: '$pointsUsed' }
          }
        }
      ]),
      
      // Recent transactions
      Transaction.find({ userId, ...dateFilter })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('type pointsEarned pointsUsed amount createdAt description')
        .lean()
    ]);

    // Process results
    const pointsBalance = pointsStats[0] || { balance: 0, totalEarned: 0, totalSpent: 0 };
    
    const stats = {
      points: {
        balance: pointsBalance.balance,
        totalEarned: pointsBalance.totalEarned,
        totalSpent: pointsBalance.totalSpent
      },
      transactions: {
        total: transactionCounts.reduce((sum, item) => sum + item.count, 0),
        completed: transactionCounts.filter(item => item._id.status === 'completed').reduce((sum, item) => sum + item.count, 0),
        failed: transactionCounts.filter(item => item._id.status === 'failed').reduce((sum, item) => sum + item.count, 0)
      },
      recent: recentTransactions
    };

    console.log(`✅ Transaction stats retrieved`);
    return { success: true, stats };

  } catch (error) {
    console.error('❌ Get transaction stats error:', error);
    throw HttpError.internalServerError(`Failed to get transaction stats: ${error.message}`);
  }
};

/**
 * Award points for quiz completion
 * @param {Object} quizCompletionData - Quiz completion data
 * @returns {Promise<Object>} Transaction result
 */
export const awardQuizCompletionPoints = async (quizCompletionData) => {
  try {
    const {
      userId,
      quizId,
      score,
      difficulty,
      timeSpent,
      metadata = {}
    } = quizCompletionData;

    // Calculate performance level based on score
    let performanceLevel;
    if (score >= 90) performanceLevel = 'excellent';
    else if (score >= 80) performanceLevel = 'good';
    else if (score >= 70) performanceLevel = 'average';
    else if (score >= 60) performanceLevel = 'below_average';
    else performanceLevel = 'poor';

    // Calculate points earned
    const pointsEarned = calculateQuizPoints(difficulty, performanceLevel);

    // Create transaction
    return await createPointsEarningTransaction({
      userId,
      type: 'quiz_completion',
      pointsEarned,
      description: `Quiz completed with ${score}% score`,
      relatedId: quizId,
      metadata: {
        ...metadata,
        score,
        difficulty,
        performanceLevel,
        timeSpent
      }
    });

  } catch (error) {
    console.error('❌ Award quiz points error:', error);
    throw error;
  }
};

/**
 * Validate points spending for course discount
 * @param {string} userId - User ID
 * @param {number} pointsToUse - Points to spend
 * @param {number} coursePrice - Original course price
 * @returns {Promise<Object>} Validation result with discount calculation
 */
export const validateCourseDiscountPoints = async (userId, pointsToUse, coursePrice) => {
  try {
    console.log(`🔍 Validating course discount for user: ${userId}`);

    // Get user points balance
    const user = await Student.findById(userId).select('progress.totalPoints progress.pointsUsed');
    if (!user) {
      throw HttpError.notFound('User not found');
    }

    const availablePoints = user.progress.totalPoints - user.progress.pointsUsed;
    
    // Validate points availability
    if (availablePoints < pointsToUse) {
      return {
        success: false,
        error: 'Insufficient points',
        available: availablePoints,
        required: pointsToUse
      };
    }

    // Calculate discount (1 point = 1% discount, max 50%)
    const maxDiscountPercent = Math.min(50, Math.floor(availablePoints * 0.01 * 100)); // Convert to percentage
    const requestedDiscountPercent = Math.min(50, pointsToUse); // 1 point = 1% discount
    
    const discountAmount = (coursePrice * requestedDiscountPercent) / 100;
    const finalPrice = coursePrice - discountAmount;

    return {
      success: true,
      validation: {
        pointsAvailable: availablePoints,
        pointsToUse,
        maxDiscountPercent,
        discountPercent: requestedDiscountPercent,
        discountAmount,
        originalPrice: coursePrice,
        finalPrice
      }
    };

  } catch (error) {
    console.error('❌ Validate course discount error:', error);
    throw HttpError.internalServerError(`Failed to validate course discount: ${error.message}`);
  }
};

export default {
  createPointsEarningTransaction,
  createPointsSpendingTransaction,
  getUserTransactionHistory,
  getUserTransactionStats,
  awardQuizCompletionPoints,
  validateCourseDiscountPoints
};