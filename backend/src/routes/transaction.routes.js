/**
 * Transaction Routes
 * @module routes/transaction
 * @description HTTP routes for transaction operations and points management
 */

import { Router } from 'express';
import {
  getUserTransactionHistory,
  getUserTransactionStats,
  validateCourseDiscount,
  createPointsSpendingTransaction,
  getTransactionById,
  getPointsBalance
} from '#controllers/transaction.controller.js';

const router = Router();

// ==========================================
// TRANSACTION HISTORY & INFORMATION
// ==========================================

/**
 * @route   GET /api/transactions/history
 * @desc    Get user's transaction history with filtering and pagination
 * @access  Private
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 20, max: 100)
 * @query   {string} type - Filter by transaction type
 * @query   {string} status - Filter by transaction status
 * @query   {string} category - Filter by category (points_earning, points_spending, monetary)
 * @query   {string} startDate - Filter from date (ISO string)
 * @query   {string} endDate - Filter to date (ISO string)
 */
router.get('/history', getUserTransactionHistory);

/**
 * @route   GET /api/transactions/stats
 * @desc    Get user's transaction statistics
 * @access  Private
 * @query   {string} period - Time period (all, week, month, year)
 */
router.get('/stats', getUserTransactionStats);

/**
 * @route   GET /api/transactions/:transactionId
 * @desc    Get specific transaction details
 * @access  Private
 * @param   {string} transactionId - Transaction ID
 */
router.get('/:transactionId', getTransactionById);

// ==========================================
// POINTS SYSTEM
// ==========================================

/**
 * @route   GET /api/transactions/points/balance
 * @desc    Get user's detailed points balance with recent earnings
 * @access  Private
 */
router.get('/points/balance', getPointsBalance);

/**
 * @route   POST /api/transactions/validate-course-discount
 * @desc    Validate points spending for course discount
 * @access  Private
 * @body    {number} pointsToUse - Points to spend
 * @body    {number} coursePrice - Original course price
 */
router.post('/validate-course-discount', validateCourseDiscount);

/**
 * @route   POST /api/transactions/spend-points
 * @desc    Create a points spending transaction
 * @access  Private
 * @body    {string} type - Transaction type (course_discount, premium_feature, etc.)
 * @body    {number} pointsUsed - Points to spend
 * @body    {string} description - Transaction description
 * @body    {number} amount - Optional monetary amount
 * @body    {string} courseId - Optional course ID
 * @body    {object} metadata - Optional metadata
 */
router.post('/spend-points', createPointsSpendingTransaction);

// ==========================================
// EXPORT ROUTER
// ==========================================

export default router;