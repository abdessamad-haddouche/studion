/**
 * Course Controller - WORKING VERSION
 * @module controllers/course
 * @description Course management with admin CRUD operations and user purchasing
 */

import { HttpError } from '#exceptions/index.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';
import courseService from '../services/course.service.js';

// ==========================================
// ADMIN COURSE MANAGEMENT (CRUD)
// ==========================================

/**
 * Create new course (Admin only)
 * @route POST /api/admin/courses
 * @access Private (Admin only)
 */
export const createCourse = async (req, res, next) => {
  try {
    const admin = req.user;
    const courseData = req.body;
    
    console.log('🎓 Admin creating course:', courseData.title);
    
    const result = await courseService.createCourse(courseData, admin);
    
    res.status(HTTP_STATUS_CODES.CREATED).json({
      success: true,
      message: result.message,
      data: {
        course: result.course
      }
    });
    
  } catch (error) {
    console.error('❌ Create course controller error:', error);
    next(error);
  }
};

/**
 * Update course (Admin only)
 * @route PUT /api/admin/courses/:id
 * @access Private (Admin only)
 */
export const updateCourse = async (req, res, next) => {
  try {
    const admin = req.user;
    const { id: courseId } = req.params;
    const updateData = req.body;
    
    console.log('📝 Admin updating course:', courseId);
    
    const result = await courseService.updateCourse(courseId, updateData, admin);
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: result.message,
      data: {
        course: result.course
      }
    });
    
  } catch (error) {
    console.error('❌ Update course controller error:', error);
    next(error);
  }
};

/**
 * Delete course (Admin only)
 * @route DELETE /api/admin/courses/:id
 * @access Private (Admin only)
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const admin = req.user;
    const { id: courseId } = req.params;
    const { permanent = false } = req.query;
    
    console.log('🗑️ Admin deleting course:', courseId, 'Permanent:', permanent);
    
    const result = await courseService.deleteCourse(courseId, admin, permanent === 'true');
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    console.error('❌ Delete course controller error:', error);
    next(error);
  }
};

/**
 * Restore deleted course (Admin only)
 * @route POST /api/admin/courses/:id/restore
 * @access Private (Admin only)
 */
export const restoreCourse = async (req, res, next) => {
  try {
    const admin = req.user;
    const { id: courseId } = req.params;
    
    console.log('🔄 Admin restoring course:', courseId);
    
    const result = await courseService.restoreCourse(courseId, admin);
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: result.message,
      data: {
        course: result.course
      }
    });
    
  } catch (error) {
    console.error('❌ Restore course controller error:', error);
    next(error);
  }
};

/**
 * Get course analytics (Admin only)
 * @route GET /api/admin/courses/analytics
 * @access Private (Admin only)
 */
export const getCourseAnalytics = async (req, res, next) => {
  try {
    const admin = req.user;
    
    console.log('📊 Admin getting course analytics');
    
    const result = await courseService.getCourseAnalytics(admin);
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Course analytics retrieved successfully',
      data: result.analytics
    });
    
  } catch (error) {
    console.error('❌ Get course analytics controller error:', error);
    next(error);
  }
};

// ==========================================
// PUBLIC COURSE BROWSING
// ==========================================

/**
 * Get all courses with filtering
 * @route GET /api/courses
 * @access Public (with optional auth)
 */
export const getAllCourses = async (req, res, next) => {
  try {
    const user = req.user; // Optional user from auth middleware
    const filters = req.query;
    
    console.log('📚 Getting all courses with filters:', filters);
    
    const result = await courseService.getAllCourses(filters, user);
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Courses retrieved successfully',
      data: {
        courses: result.courses,
        pagination: result.pagination
      }
    });
    
  } catch (error) {
    console.error('❌ Get all courses controller error:', error);
    next(error);
  }
};

/**
 * Get course by ID
 * @route GET /api/courses/:id
 * @access Public (with optional auth)
 */
export const getCourseById = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const user = req.user; // Optional user from auth middleware
    
    console.log('🔍 Getting course by ID:', courseId);
    
    const result = await courseService.getCourseById(courseId, user);
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Course retrieved successfully',
      data: result.course
    });
    
  } catch (error) {
    console.error('❌ Get course by ID controller error:', error);
    next(error);
  }
};

/**
 * Get courses by category
 * @route GET /api/courses/category/:category
 * @access Public
 */
export const getCoursesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const filters = req.query;
    
    console.log('🏷️ Getting courses by category:', category);
    
    const result = await courseService.getCoursesByCategory(category, filters);
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: `Courses in ${category} retrieved successfully`,
      data: {
        category,
        courses: result.courses,
        pagination: result.pagination
      }
    });
    
  } catch (error) {
    console.error('❌ Get courses by category controller error:', error);
    next(error);
  }
};

/**
 * Get featured courses
 * @route GET /api/courses/featured
 * @access Public
 */
export const getFeaturedCourses = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    
    console.log('⭐ Getting featured courses');
    
    const result = await courseService.getFeaturedCourses(Number(limit));
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Featured courses retrieved successfully',
      data: {
        courses: result.featuredCourses
      }
    });
    
  } catch (error) {
    console.error('❌ Get featured courses controller error:', error);
    next(error);
  }
};

/**
 * Get course catalog (placeholder for external platforms)
 * @route GET /api/courses/catalog/:source
 * @access Public
 */
export const getCourseCatalog = async (req, res, next) => {
  try {
    const { source } = req.params;
    
    console.log('📖 Getting course catalog for source:', source);
    
    // For MVP: return filtered courses by source
    const result = await courseService.getAllCourses({ source, limit: 50 });
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: `${source} catalog retrieved successfully`,
      data: {
        source,
        courses: result.courses,
        pagination: result.pagination
      }
    });
    
  } catch (error) {
    console.error('❌ Get course catalog controller error:', error);
    next(error);
  }
};

// ==========================================
// USER COURSE INTERACTIONS
// ==========================================

/**
 * Get recommended courses for user
 * @route GET /api/courses/recommended
 * @access Private
 */
export const getRecommendedCourses = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || user.userType !== 'student') {
      throw HttpError.forbidden('Student access required');
    }
    
    console.log('🎯 Getting recommended courses for user:', user.userId);
    
    const result = await courseService.getRecommendedCourses(user.userId);
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Recommended courses retrieved successfully',
      data: {
        recommendations: result.recommendations,
        basedOn: result.basedOn
      }
    });
    
  } catch (error) {
    console.error('❌ Get recommended courses controller error:', error);
    next(error);
  }
};

/**
 * Calculate course price with points discount
 * @route POST /api/courses/:id/calculate-price
 * @access Private
 */
export const calculateCoursePrice = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const { pointsToUse = 0 } = req.body;
    const user = req.user;
    
    if (!user || user.userType !== 'student') {
      throw HttpError.forbidden('Student access required');
    }
    
    console.log('💰 Calculating course price:', courseId, 'Points:', pointsToUse);
    
    const result = await courseService.calculateCoursePrice(courseId, pointsToUse, user.userId);
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Course price calculated successfully',
      data: {
        courseId,
        pricing: result.pricing
      }
    });
    
  } catch (error) {
    console.error('❌ Calculate course price controller error:', error);
    next(error);
  }
};

/**
 * Purchase course with points
 * @route POST /api/courses/:id/purchase
 * @access Private
 */
export const purchaseCourse = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const { pointsToUse = 0 } = req.body;
    const user = req.user;
    
    if (!user || user.userType !== 'student') {
      throw HttpError.forbidden('Student access required');
    }
    
    console.log('🛒 User purchasing course:', courseId, 'Points:', pointsToUse);
    
    const result = await courseService.purchaseCourse(courseId, pointsToUse, user.userId);
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: result.message,
      data: {
        purchase: result.purchase
      }
    });
    
  } catch (error) {
    console.error('❌ Purchase course controller error:', error);
    next(error);
  }
};

/**
 * Apply course discount (alias for calculate price)
 * @route POST /api/courses/:id/discount
 * @access Private
 */
export const applyCourseDiscount = async (req, res, next) => {
  try {
    console.log('💸 Applying course discount');
    return await calculateCoursePrice(req, res, next);
  } catch (error) {
    console.error('❌ Apply course discount controller error:', error);
    next(error);
  }
};

/**
 * Get user's purchased courses (placeholder for MVP)
 * @route GET /api/courses/purchased
 * @access Private
 */
export const getUserPurchasedCourses = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || user.userType !== 'student') {
      throw HttpError.forbidden('Student access required');
    }
    
    console.log('📚 Getting user purchased courses');
    
    // For MVP: return empty array since we're not storing purchases yet
    // In production: implement Transaction/Purchase model to track this
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Purchased courses retrieved successfully',
      data: {
        purchases: [],
        note: 'Purchase tracking will be implemented with Transaction model'
      }
    });
    
  } catch (error) {
    console.error('❌ Get user purchased courses controller error:', error);
    next(error);
  }
};