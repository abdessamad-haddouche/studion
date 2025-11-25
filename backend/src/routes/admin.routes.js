/**
 * Updated Admin Routes
 * @module routes/admin
 * @description Admin management and dashboard routes including course CRUD operations
 */

import express from 'express';
import { validateObjectId } from '#middleware/validation.middleware.js';
import {
  requireAdmin,
  requireSuperAdmin,
  requireUserManagement,
  requireUserDeletion,
  requireAnalytics
} from '#middleware/admin.middleware.js';

// Import admin controllers
import {
  getAdminDashboard,
  getAllUsersAdmin,
  getUserByIdAdmin,
  updateUserStatusAdmin,
  deleteUserAdmin,
  getUserStatsAdmin,
  getSystemAnalyticsAdmin,
  createAdminUser,
  getAllAdmins,
  updateAdminUser
} from '#controllers/admin.controller.js';

// Import course controllers
import {
  createCourse,
  updateCourse,
  deleteCourse,
  restoreCourse,
  getCourseAnalytics,
  getAllCourses,
  getCourseById
} from '#controllers/course.controller.js';

// Import course validation middleware
import {
  validateCourseCreation,
  validateCourseUpdate,
  validateCourseFilters
} from '../middleware/course-validation.middleware.js';

const router = express.Router();

// Apply base admin middleware to all routes
router.use(requireAdmin);

// ==========================================
// DASHBOARD ROUTES
// ==========================================

/**
 * @route GET /api/admin/dashboard
 * @description Get admin dashboard data
 * @access Private (Admin only)
 */
router.get('/dashboard', getAdminDashboard);

// ==========================================
// COURSE MANAGEMENT ROUTES
// ==========================================

/**
 * @route GET /api/admin/courses/analytics
 * @description Get comprehensive course analytics and statistics
 * @access Private (Admin only)
 */
router.get('/courses/analytics', getCourseAnalytics);

/**
 * @route GET /api/admin/courses
 * @description Get all courses with admin view (including deleted)
 * @access Private (Admin only)
 */
router.get('/courses', validateCourseFilters, getAllCourses);

/**
 * @route POST /api/admin/courses
 * @description Create a new course
 * @access Private (Admin only)
 */
router.post('/courses', validateCourseCreation, createCourse);

/**
 * @route GET /api/admin/courses/:id
 * @description Get specific course by ID with all details
 * @access Private (Admin only)
 */
router.get('/courses/:id', validateObjectId('id'), getCourseById);

/**
 * @route PUT /api/admin/courses/:id
 * @description Update course information
 * @access Private (Admin only)
 */
router.put('/courses/:id', validateObjectId('id'), validateCourseUpdate, updateCourse);

/**
 * @route DELETE /api/admin/courses/:id
 * @description Delete course (soft delete by default)
 * @access Private (Admin only, permanent deletion requires super admin)
 */
router.delete('/courses/:id', validateObjectId('id'), deleteCourse);

/**
 * @route POST /api/admin/courses/:id/restore
 * @description Restore a soft-deleted course
 * @access Private (Admin only)
 */
router.post('/courses/:id/restore', validateObjectId('id'), restoreCourse);

// ==========================================
// ADMIN MANAGEMENT ROUTES (Super Admin Only)
// ==========================================

/**
 * @route POST /api/admin/admins
 * @description Create new admin user
 * @access Private (Super Admin only)
 */
router.post('/admins', requireSuperAdmin, createAdminUser);

/**
 * @route GET /api/admin/admins
 * @description Get all admin users
 * @access Private (Super Admin only)
 */
router.get('/admins', requireSuperAdmin, getAllAdmins);

/**
 * @route PUT /api/admin/admins/:adminId
 * @description Update admin role/permissions
 * @access Private (Super Admin only)
 */
router.put('/admins/:adminId', requireSuperAdmin, validateObjectId('adminId'), updateAdminUser);

// ==========================================
// USER MANAGEMENT ROUTES
// ==========================================

/**
 * @route GET /api/admin/users
 * @description Get all users with pagination and filtering
 * @access Private (Admin with users:read permission)
 */
router.get('/users', getAllUsersAdmin);

/**
 * @route GET /api/admin/users/:userId
 * @description Get specific user by ID
 * @access Private (Admin with users:read permission)
 */
router.get('/users/:userId', validateObjectId('userId'), getUserByIdAdmin);

/**
 * @route PUT /api/admin/users/:userId/status
 * @description Update user status (active/inactive/suspended)
 * @access Private (Admin with users:update permission)
 */
router.put('/users/:userId/status', requireUserManagement, validateObjectId('userId'), updateUserStatusAdmin);

/**
 * @route DELETE /api/admin/users/:userId
 * @description Delete user
 * @access Private (Admin with users:delete permission)
 */
router.delete('/users/:userId', requireUserDeletion, validateObjectId('userId'), deleteUserAdmin);

// ==========================================
// ANALYTICS & REPORTS ROUTES
// ==========================================

/**
 * @route GET /api/admin/stats/users
 * @description Get user statistics
 * @access Private (Admin with analytics:read permission)
 */
router.get('/stats/users', requireAnalytics, getUserStatsAdmin);

/**
 * @route GET /api/admin/analytics
 * @description Get system analytics
 * @access Private (Admin with analytics:read permission)
 */
router.get('/analytics', requireAnalytics, getSystemAnalyticsAdmin);

export default router;