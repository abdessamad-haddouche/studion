/**
 * Updated Course Routes - WITH VALIDATION AND COMPLETE FUNCTIONALITY
 * @module routes/course
 * @description Course listing, recommendation, and purchasing with validation
 */

import express from 'express';
import { authenticateJWT, optionalAuthenticateJWT } from '#middleware/auth.middleware.js';
import { validateObjectId } from '#middleware/validation.middleware.js';

// Import course controllers
import {
  getAllCourses,
  getCourseById,
  getRecommendedCourses,
  purchaseCourse,
  getUserPurchasedCourses,
  getCourseCatalog,
  getCoursesByCategory,
  applyCourseDiscount,
  calculateCoursePrice,
  getFeaturedCourses
} from '#controllers/course.controller.js';

// Import validation middleware
import {
  validateCoursePurchase,
  validateCourseFilters
} from '../middleware/course-validation.middleware.js';

const router = express.Router();

// ==========================================
// PUBLIC COURSE ROUTES
// ==========================================

/**
 * @route GET /api/courses/featured
 * @description Get featured courses
 * @query {number} limit - Number of courses to return (default: 6)
 * @access Public
 */
router.get('/featured', getFeaturedCourses);

/**
 * @route GET /api/courses/catalog/:source
 * @description Get course catalog by source (e.g., "udemy", "coursera")
 * @param {string} source - Course source platform
 * @access Public
 */
router.get('/catalog/:source', validateCourseFilters, getCourseCatalog);

/**
 * @route GET /api/courses/category/:category
 * @description Get courses by category
 * @param {string} category - Course category
 * @query {string} level - Filter by level
 * @query {string} isFree - Filter by free courses
 * @query {number} minPrice - Minimum price filter
 * @query {number} maxPrice - Maximum price filter
 * @query {number} minRating - Minimum rating filter
 * @query {number} page - Page number
 * @query {number} limit - Items per page
 * @query {string} sortBy - Sort field
 * @query {string} sortOrder - Sort order (asc/desc)
 * @access Public
 */
router.get('/category/:category', validateCourseFilters, getCoursesByCategory);


/**
 * @route GET /api/courses
 * @description Get all available courses with filtering & pagination
 * @query {string} category - Filter by category
 * @query {string} level - Filter by level (beginner, intermediate, advanced)
 * @query {string} source - Filter by source (internal, udemy, coursera, etc.)
 * @query {string} isFree - Filter by free courses (true/false)
 * @query {number} minPrice - Minimum price filter
 * @query {number} maxPrice - Maximum price filter
 * @query {number} minRating - Minimum rating filter
 * @query {string} search - Search in title, description, instructor name
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20, max: 100)
 * @query {string} sortBy - Sort field (title, createdAt, rating.average, etc.)
 * @query {string} sortOrder - Sort order (asc/desc, default: desc)
 * @access Public (with optional auth for personalization)
 */
router.get('/', validateCourseFilters, optionalAuthenticateJWT, getAllCourses);

// ==========================================
// PROTECTED COURSE ROUTES (Student Only)
// ==========================================

/**
 * @route GET /api/courses/recommended
 * @description Get personalized course recommendations based on quiz performance
 * @access Private (Student only)
 */
router.get('/recommended', authenticateJWT, getRecommendedCourses);

/**
 * @route GET /api/courses/:id
 * @description Get details for a specific course
 * @param {string} id - Course ID
 * @access Public (with optional auth for personalization)
 */
router.get('/:id', validateObjectId('id'), optionalAuthenticateJWT, getCourseById);

/**
 * @route GET /api/courses/purchased
 * @description Get user's purchased courses
 * @access Private (Student only)
 */
router.get('/purchased', authenticateJWT, getUserPurchasedCourses);

/**
 * @route POST /api/courses/:id/calculate-price
 * @description Calculate course price with points discount
 * @param {string} id - Course ID
 * @body {number} pointsToUse - Points to apply for discount (optional, default: 0)
 * @access Private (Student only)
 */
router.post('/:id/calculate-price', validateObjectId('id'), authenticateJWT, validateCoursePurchase, calculateCoursePrice);

/**
 * @route POST /api/courses/:id/purchase
 * @description Purchase a course using points for discount (MVP implementation)
 * @param {string} id - Course ID
 * @body {number} pointsToUse - Points to apply for discount (optional, default: 0)
 * @access Private (Student only)
 */
router.post('/:id/purchase', validateObjectId('id'), authenticateJWT, validateCoursePurchase, purchaseCourse);

/**
 * @route POST /api/courses/:id/discount
 * @description Apply points for course discount (alias for calculate-price)
 * @param {string} id - Course ID
 * @body {number} pointsToUse - Points to apply for discount
 * @access Private (Student only)
 */
router.post('/:id/discount', validateObjectId('id'), authenticateJWT, validateCoursePurchase, applyCourseDiscount);

// ==========================================
// COURSE INTERACTION ROUTES (Future Enhancement)
// ==========================================

/**
 * @route POST /api/courses/:id/rate
 * @description Rate a course (placeholder for future)
 * @access Private (Student only)
 */
router.post('/:id/rate', validateObjectId('id'), authenticateJWT, (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Course rating feature not implemented yet'
  });
});

/**
 * @route GET /api/courses/:id/reviews
 * @description Get course reviews (placeholder for future)
 * @access Public
 */
router.get('/:id/reviews', validateObjectId('id'), (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Course reviews feature not implemented yet',
    data: {
      reviews: [],
      note: 'Reviews will be implemented with Review model'
    }
  });
});

/**
 * @route POST /api/courses/:id/bookmark
 * @description Bookmark a course (placeholder for future)
 * @access Private
 */
router.post('/:id/bookmark', validateObjectId('id'), authenticateJWT, (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Course bookmarking feature not implemented yet'
  });
});

export default router;