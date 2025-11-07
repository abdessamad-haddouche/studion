/**
 * Transaction Controller
 * @module controllers/transaction
 * @description Handles transaction-related HTTP requests for points and payment transactions
 */

import '#docs/swagger/transaction-routes-docs.js';

import { HttpError } from '#exceptions/index.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';
import transactionService from '#services/transaction.service.js';
import { 
  isValidTransactionType, 
  TRANSACTION_TYPES 
} from '#constants/models/transaction/index.js';

/**
 * Get user transaction history
 * @route GET /api/transactions/history
 * @access Private
 */
export const getUserTransactionHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Extract query parameters
    const {
      page = 1,
      limit = 20,
      type,
      status,
      category,
      startDate,
      endDate
    } = req.query;

    // Validate query parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page

    if (type && !isValidTransactionType(type)) {
      throw HttpError.badRequest('Invalid transaction type', {
        code: 'INVALID_TRANSACTION_TYPE',
        validTypes: TRANSACTION_TYPES
      });
    }

    const options = {
      page: pageNum,
      limit: limitNum,
      type,
      status,
      category,
      startDate,
      endDate
    };

    const result = await transactionService.getUserTransactionHistory(userId, options);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: result.transactions,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('❌ Get transaction history controller error:', error);
    next(error);
  }
};

/**
 * Get user transaction statistics
 * @route GET /api/transactions/stats
 * @access Private
 */
export const getUserTransactionStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { period = 'all' } = req.query;

    // Validate period parameter
    const validPeriods = ['all', 'week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      throw HttpError.badRequest('Invalid period parameter', {
        code: 'INVALID_PERIOD',
        validPeriods
      });
    }

    const result = await transactionService.getUserTransactionStats(userId, { period });

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Transaction statistics retrieved successfully',
      data: result.stats
    });

  } catch (error) {
    console.error('❌ Get transaction stats controller error:', error);
    next(error);
  }
};

/**
 * Validate course discount with points
 * @route POST /api/transactions/validate-course-discount
 * @access Private
 */
export const validateCourseDiscount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { pointsToUse, coursePrice } = req.body;

    // Validate input
    if (!pointsToUse || !coursePrice) {
      throw HttpError.badRequest('Points to use and course price are required', {
        code: 'MISSING_DISCOUNT_DATA'
      });
    }

    if (typeof pointsToUse !== 'number' || pointsToUse <= 0) {
      throw HttpError.badRequest('Points to use must be a positive number');
    }

    if (typeof coursePrice !== 'number' || coursePrice <= 0) {
      throw HttpError.badRequest('Course price must be a positive number');
    }

    const result = await transactionService.validateCourseDiscountPoints(userId, pointsToUse, coursePrice);

    const statusCode = result.success ? HTTP_STATUS_CODES.OK : HTTP_STATUS_CODES.BAD_REQUEST;
    
    res.status(statusCode).json({
      success: result.success,
      message: result.success 
        ? 'Course discount validation successful' 
        : 'Course discount validation failed',
      data: result.success ? result.validation : { error: result.error },
      ...(result.error && { error: result.error })
    });

  } catch (error) {
    console.error('❌ Validate course discount controller error:', error);
    next(error);
  }
};

/**
 * Create a points spending transaction (for course discounts, premium features, etc.)
 * @route POST /api/transactions/spend-points
 * @access Private
 */
export const createPointsSpendingTransaction = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      type,
      pointsUsed,
      description,
      amount = 0,
      courseId,
      metadata = {}
    } = req.body;

    // Validate input
    if (!type || !pointsUsed || !description) {
      throw HttpError.badRequest('Transaction type, points used, and description are required', {
        code: 'MISSING_TRANSACTION_DATA'
      });
    }

    if (!isValidTransactionType(type)) {
      throw HttpError.badRequest('Invalid transaction type');
    }

    const transactionData = {
      userId,
      type,
      pointsUsed,
      description,
      amount,
      courseId,
      metadata: {
        ...metadata,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'web'
      }
    };

    const result = await transactionService.createPointsSpendingTransaction(transactionData);

    res.status(HTTP_STATUS_CODES.CREATED).json({
      success: true,
      message: 'Points spending transaction created successfully',
      data: {
        transaction: result.transaction,
        pointsUsed: result.pointsUsed,
        remainingPoints: result.remainingPoints
      }
    });

  } catch (error) {
    console.error('❌ Create points spending transaction controller error:', error);
    next(error);
  }
};

/**
 * Get transaction by ID (for user's own transactions only)
 * @route GET /api/transactions/:transactionId
 * @access Private
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { transactionId } = req.params;

    if (!transactionId) {
      throw HttpError.badRequest('Transaction ID is required');
    }

    // Import Transaction model to find by ID
    const Transaction = (await import('#models/transaction/Transaction.js')).default;
    
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: userId // Ensure user can only see their own transactions
    })
    .populate('quizId', 'title difficulty')
    .populate('courseId', 'title price')
    .lean();

    if (!transaction) {
      throw HttpError.notFound('Transaction not found');
    }

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: {
        id: transaction._id,
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        amount: transaction.amount,
        pointsEarned: transaction.pointsEarned,
        pointsUsed: transaction.pointsUsed,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
        quiz: transaction.quizId,
        course: transaction.courseId,
        metadata: transaction.metadata
      }
    });

  } catch (error) {
    console.error('❌ Get transaction by ID controller error:', error);
    next(error);
  }
};

/**
 * Get points balance summary (enhanced version)
 * @route GET /api/transactions/points/balance
 * @access Private
 */
export const getPointsBalance = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Import Transaction model for balance calculation
    const Transaction = (await import('#models/transaction/Transaction.js')).default;
    
    const pointsBalance = await Transaction.calculatePointsBalance(userId);
    const balance = pointsBalance[0] || { balance: 0, totalEarned: 0, totalSpent: 0 };

    // Get recent earning transactions
    const recentEarnings = await Transaction.find({
      userId,
      pointsEarned: { $gt: 0 },
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('type pointsEarned createdAt description')
    .lean();

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Points balance retrieved successfully',
      data: {
        balance: balance.balance,
        totalEarned: balance.totalEarned,
        totalSpent: balance.totalSpent,
        recentEarnings: recentEarnings.map(t => ({
          type: t.type,
          points: t.pointsEarned,
          description: t.description,
          earnedAt: t.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('❌ Get points balance controller error:', error);
    next(error);
  }
};