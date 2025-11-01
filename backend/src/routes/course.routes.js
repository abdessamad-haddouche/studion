/**
 * Course Routes
 * @module routes/course
 * @description Course listing, recommendation, and purchasing
 */

import express from 'express';
import { authenticateJWT, optionalAuthenticateJWT } from '#middleware/auth.middleware.js';

import {
  getAllCourses,
  getCourseById,
  getRecommendedCourses,
  purchaseCourse,
  getUserPurchasedCourses,
  getCourseCatalog,
  getCoursesByCategory,
  applyCourseDiscount
} from '#controllers/index.js';

const router = express.Router();

// ==========================================
// PUBLIC COURSE ROUTES
// ==========================================

/**
 * @route GET /api/courses
 * @description Get all available courses with filtering & pagination
 * @access Public (with optional auth for personalization)
 */
router.get('/', optionalAuthenticateJWT, getAllCourses);

/**
 * @route GET /api/courses/:id
 * @description Get details for a specific course
 * @access Public (with optional auth for personalization)
 */
router.get('/:id', optionalAuthenticateJWT, getCourseById);

/**
 * @route GET /api/courses/catalog/:source
 * @description Get course catalog by source (e.g., "udemy", "coursera")
 * @access Public
 */
router.get('/catalog/:source', getCourseCatalog);

/**
 * @route GET /api/courses/category/:category
 * @description Get courses by category
 * @access Public
 */
router.get('/category/:category', getCoursesByCategory);

// ==========================================
// PROTECTED COURSE ROUTES
// ==========================================

/**
 * @route GET /api/courses/recommended
 * @description Get personalized course recommendations based on quiz performance
 * @access Private
 */
router.get('/recommended', authenticateJWT, getRecommendedCourses);

/**
 * @route POST /api/courses/:id/purchase
 * @description Purchase a course using points
 * @access Private
 */
router.post('/:id/purchase', authenticateJWT, purchaseCourse);

/**
 * @route GET /api/courses/purchased
 * @description Get user's purchased courses
 * @access Private
 */
router.get('/purchased', authenticateJWT, getUserPurchasedCourses);

/**
 * @route POST /api/courses/:id/discount
 * @description Apply points for course discount
 * @access Private
 */
router.post('/:id/discount', authenticateJWT, applyCourseDiscount);

export default router;