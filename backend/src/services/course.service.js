/**
 * Course Service - COMPLETE IMPLEMENTATION
 * @module services/course
 * @description Course management with admin CRUD operations and user purchasing with points system
 */

import { Course } from '#models/course/index.js';
import { Student } from '#models/users/index.js';
import { HttpError } from '#exceptions/index.js';
import {
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  COURSE_STATUSES,
  COURSE_SOURCES,
  validateCourseTitle,
  validateCourseDescription,
  validatePrice
} from '#constants/models/course/index.js';

// ==========================================
// ADMIN COURSE MANAGEMENT (CRUD)
// ==========================================

/**
 * Create new course (Admin only)
 */
export const createCourse = async (courseData, adminUser) => {
  try {
    console.log('🎓 Creating new course:', courseData.title);
    
    // Validate admin permissions
    if (!adminUser || adminUser.userType !== 'admin') {
      throw HttpError.forbidden('Admin access required to create courses');
    }
    
    // Validate required fields
    if (!courseData.title || !courseData.description || !courseData.category) {
      throw HttpError.badRequest('Title, description, and category are required');
    }
    
    // Validate pricing
    if (!courseData.pricing || courseData.pricing.originalPrice == null || courseData.pricing.currentPrice == null) {
      throw HttpError.badRequest('Pricing information is required');
    }
    
    // Validate instructor info
    if (!courseData.instructor || !courseData.instructor.name) {
      throw HttpError.badRequest('Instructor information is required');
    }
    
    // Generate slug from title
    const slug = courseData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
    
    // Check if slug already exists
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      throw HttpError.conflict('Course with similar title already exists');
    }
    
    // Prepare course data
    const newCourseData = {
      title: courseData.title.trim(),
      slug,
      description: courseData.description.trim(),
      shortDescription: courseData.shortDescription?.trim() || '',
      
      category: courseData.category,
      subcategory: courseData.subcategory || null,
      level: courseData.level || 'intermediate',
      tags: courseData.tags || [],
      
      instructor: {
        name: courseData.instructor.name.trim(),
        type: courseData.instructor.type || 'internal',
        bio: courseData.instructor.bio?.trim() || '',
        avatar: courseData.instructor.avatar || null,
        userId: courseData.instructor.userId || null
      },
      
      source: courseData.source || 'internal',
      
      pricing: {
        currency: courseData.pricing.currency || 'USD',
        originalPrice: Number(courseData.pricing.originalPrice),
        currentPrice: Number(courseData.pricing.currentPrice),
        isFree: Number(courseData.pricing.currentPrice) === 0
      },
      
      content: {
        type: courseData.content?.type || 'video',
        duration: {
          hours: Number(courseData.content?.duration?.hours || 0),
          minutes: Number(courseData.content?.duration?.minutes || 0)
        },
        totalLectures: Number(courseData.content?.totalLectures || 0),
        language: courseData.content?.language || 'en',
        learningOutcomes: courseData.content?.learningOutcomes || [],
        requirements: courseData.content?.requirements || [],
        targetAudience: courseData.content?.targetAudience || []
      },
      
      media: {
        thumbnail: courseData.media?.thumbnail || 'https://via.placeholder.com/400x300',
        previewVideo: courseData.media?.previewVideo || null,
        images: courseData.media?.images || []
      },
      
      status: courseData.status || 'active',
      isActive: courseData.isActive !== false,
      isFeatured: courseData.isFeatured || false,
      
      // Business settings
      business: {
        commission: {
          percentage: Number(courseData.business?.commission?.percentage || 0),
          amount: Number(courseData.business?.commission?.amount || 0)
        }
      },
      
      // Studion integration
      studion: {
        recommendedForQuizzes: courseData.studion?.recommendedForQuizzes || [],
        pointsDiscount: {
          enabled: courseData.studion?.pointsDiscount?.enabled !== false,
          maxPointsUsable: Number(courseData.studion?.pointsDiscount?.maxPointsUsable || 1000),
          pointsToDiscountRatio: Number(courseData.studion?.pointsDiscount?.pointsToDiscountRatio || 0.01)
        }
      }
    };
    
    // Create course
    const course = new Course(newCourseData);
    await course.save();
    
    console.log('✅ Course created successfully:', course._id);
    
    return {
      success: true,
      course: course.toJSON(),
      message: 'Course created successfully'
    };
    
  } catch (error) {
    console.error('❌ Create course error:', error);
    throw error;
  }
};

/**
 * Update course (Admin only)
 */
export const updateCourse = async (courseId, updateData, adminUser) => {
  try {
    console.log('📝 Updating course:', courseId);
    
    // Validate admin permissions
    if (!adminUser || adminUser.userType !== 'admin') {
      throw HttpError.forbidden('Admin access required to update courses');
    }
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      throw HttpError.notFound('Course not found');
    }
    
    // Check if course is deleted
    if (course.deletedAt) {
      throw HttpError.badRequest('Cannot update deleted course');
    }
    
    // Prepare update data
    const allowedUpdates = [
      'title', 'description', 'shortDescription', 'category', 'subcategory', 
      'level', 'tags', 'instructor', 'pricing', 'content', 'media', 
      'status', 'isActive', 'isFeatured', 'business', 'studion'
    ];
    
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });
    
    // Update slug if title changed
    if (updateData.title && updateData.title !== course.title) {
      const newSlug = updateData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100);
      
      // Check if new slug exists
      const existingCourse = await Course.findOne({ slug: newSlug, _id: { $ne: courseId } });
      if (existingCourse) {
        throw HttpError.conflict('Course with similar title already exists');
      }
      
      updates.slug = newSlug;
    }
    
    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    console.log('✅ Course updated successfully:', courseId);
    
    return {
      success: true,
      course: updatedCourse.toJSON(),
      message: 'Course updated successfully'
    };
    
  } catch (error) {
    console.error('❌ Update course error:', error);
    throw error;
  }
};

/**
 * Delete course (Admin only)
 */
export const deleteCourse = async (courseId, adminUser, permanent = false) => {
  try {
    console.log('🗑️ Deleting course:', courseId, 'Permanent:', permanent);
    
    // Validate admin permissions
    if (!adminUser || adminUser.userType !== 'admin') {
      throw HttpError.forbidden('Admin access required to delete courses');
    }
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      throw HttpError.notFound('Course not found');
    }
    
    if (permanent) {
      // Only super admin can permanently delete
      if (adminUser.adminInfo?.role !== 'super_admin') {
        throw HttpError.forbidden('Super admin access required for permanent deletion');
      }
      
      await Course.findByIdAndDelete(courseId);
      console.log('✅ Course permanently deleted:', courseId);
      
      return {
        success: true,
        message: 'Course permanently deleted'
      };
    } else {
      // Soft delete
      course.deletedAt = new Date();
      course.isActive = false;
      course.status = 'archived';
      await course.save();
      
      console.log('✅ Course soft deleted:', courseId);
      
      return {
        success: true,
        message: 'Course deleted successfully'
      };
    }
    
  } catch (error) {
    console.error('❌ Delete course error:', error);
    throw error;
  }
};

/**
 * Restore deleted course (Admin only)
 */
export const restoreCourse = async (courseId, adminUser) => {
  try {
    console.log('🔄 Restoring course:', courseId);
    
    // Validate admin permissions
    if (!adminUser || adminUser.userType !== 'admin') {
      throw HttpError.forbidden('Admin access required to restore courses');
    }
    
    // Find deleted course
    const course = await Course.findById(courseId);
    if (!course) {
      throw HttpError.notFound('Course not found');
    }
    
    if (!course.deletedAt) {
      throw HttpError.badRequest('Course is not deleted');
    }
    
    // Restore course
    course.deletedAt = null;
    course.isActive = true;
    course.status = 'active';
    await course.save();
    
    console.log('✅ Course restored successfully:', courseId);
    
    return {
      success: true,
      course: course.toJSON(),
      message: 'Course restored successfully'
    };
    
  } catch (error) {
    console.error('❌ Restore course error:', error);
    throw error;
  }
};

// ==========================================
// PUBLIC COURSE BROWSING
// ==========================================

/**
 * Get all active courses with filtering
 */
export const getAllCourses = async (filters = {}, user = null) => {
  try {
    console.log('📚 Getting all courses with filters:', filters);
    
    const {
      page = 1,
      limit = 20,
      category,
      level,
      source,
      isFree,
      minPrice,
      maxPrice,
      minRating,
      search,
      sortBy = 'rating.average',
      sortOrder = 'desc'
    } = filters;
    
    // Build query
    const query = {
      isActive: true,
      deletedAt: null,
      status: 'active'
    };
    
    // Apply filters
    if (category) query.category = category;
    if (level) query.level = level;
    if (source) query.source = source;
    if (isFree !== undefined) query['pricing.isFree'] = isFree === 'true';
    if (minRating) query['rating.average'] = { $gte: Number(minRating) };
    
    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.currentPrice'] = {};
      if (minPrice) query['pricing.currentPrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.currentPrice'].$lte = Number(maxPrice);
    }
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const [courses, totalCourses] = await Promise.all([
      Course.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Course.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(totalCourses / Number(limit));
    
    console.log(`✅ Found ${courses.length} courses`);
    
    return {
      success: true,
      courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCourses,
        totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1
      }
    };
    
  } catch (error) {
    console.error('❌ Get all courses error:', error);
    throw error;
  }
};

/**
 * Get course by ID with details
 */
export const getCourseById = async (courseId, user = null) => {
  try {
    console.log('🔍 Getting course by ID:', courseId);
    
    // Find course
    const course = await Course.findOne({
      _id: courseId,
      isActive: true,
      deletedAt: null
    });
    
    if (!course) {
      throw HttpError.notFound('Course not found');
    }
    
    // Record view if user is logged in
    if (user) {
      await course.recordView();
      
      // Update user's course views if student
      if (user.userType === 'student') {
        await Student.findByIdAndUpdate(
          user.userId,
          { $inc: { 'progress.coursesViewed': 1 } }
        );
      }
    }
    
    console.log('✅ Course found:', course.title);
    
    return {
      success: true,
      course: course.toJSON()
    };
    
  } catch (error) {
    console.error('❌ Get course by ID error:', error);
    throw error;
  }
};

/**
 * Get courses by category
 */
export const getCoursesByCategory = async (category, filters = {}) => {
  try {
    console.log('🏷️ Getting courses by category:', category);
    
    // Validate category
    if (!COURSE_CATEGORIES.includes(category)) {
      throw HttpError.badRequest('Invalid course category');
    }
    
    return await getAllCourses({ ...filters, category });
    
  } catch (error) {
    console.error('❌ Get courses by category error:', error);
    throw error;
  }
};

// ==========================================
// COURSE PURCHASING WITH POINTS SYSTEM
// ==========================================

/**
 * Calculate course price with points discount
 */
export const calculateCoursePrice = async (courseId, pointsToUse = 0, userId) => {
  try {
    console.log('💰 Calculating course price:', courseId, 'Points:', pointsToUse);
    
    // Find course
    const course = await Course.findOne({
      _id: courseId,
      isActive: true,
      deletedAt: null
    });
    
    if (!course) {
      throw HttpError.notFound('Course not found');
    }
    
    // Get user's available points
    const user = await Student.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found');
    }
    
    const availablePoints = user.availablePoints;
    const originalPrice = course.pricing.currentPrice;
    
    // Check if course supports points discount
    if (!course.studion.pointsDiscount.enabled || course.pricing.isFree) {
      return {
        success: true,
        pricing: {
          originalPrice,
          pointsUsed: 0,
          pointsDiscount: 0,
          finalPrice: originalPrice,
          availablePoints,
          maxPointsUsable: 0
        }
      };
    }
    
    // Calculate discount
    const maxPointsUsable = Math.min(
      availablePoints,
      course.studion.pointsDiscount.maxPointsUsable,
      pointsToUse
    );
    
    const pointsDiscount = maxPointsUsable * course.studion.pointsDiscount.pointsToDiscountRatio;
    const finalPrice = Math.max(0, originalPrice - pointsDiscount);
    
    console.log('✅ Price calculated:', {
      originalPrice,
      pointsDiscount,
      finalPrice
    });
    
    return {
      success: true,
      pricing: {
        originalPrice,
        pointsUsed: maxPointsUsable,
        pointsDiscount: Number(pointsDiscount.toFixed(2)),
        finalPrice: Number(finalPrice.toFixed(2)),
        availablePoints,
        maxPointsUsable: course.studion.pointsDiscount.maxPointsUsable,
        pointsToDiscountRatio: course.studion.pointsDiscount.pointsToDiscountRatio
      }
    };
    
  } catch (error) {
    console.error('❌ Calculate course price error:', error);
    throw error;
  }
};

/**
 * Purchase course with points (MVP Implementation)
 */
export const purchaseCourse = async (courseId, pointsToUse = 0, userId) => {
  try {
    console.log('🛒 Purchasing course:', courseId, 'User:', userId, 'Points:', pointsToUse);
    
    // Get course and pricing
    const pricingResult = await calculateCoursePrice(courseId, pointsToUse, userId);
    const { pricing } = pricingResult;
    
    // Find user
    const user = await Student.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found');
    }
    
    // Check if user has enough points
    if (pricing.pointsUsed > user.availablePoints) {
      throw HttpError.badRequest('Insufficient points');
    }
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      throw HttpError.notFound('Course not found');
    }
    
    // For MVP: Just simulate purchase (no real payment processing)
    // In production: integrate with payment gateway here
    
    // Use points if any
    if (pricing.pointsUsed > 0) {
      await user.usePoints(pricing.pointsUsed);
    }
    
    // Record purchase in user progress
    await user.recordCoursePurchase();
    
    // Record conversion in course analytics
    await course.recordConversion(pricing.finalPrice);
    
    // Record click for analytics
    await course.recordClick();
    
    console.log('✅ Course purchased successfully');
    
    return {
      success: true,
      purchase: {
        courseId,
        courseTitle: course.title,
        pricing,
        purchasedAt: new Date(),
        status: 'completed',
        transactionId: `mock_tx_${Date.now()}` // Mock transaction ID for MVP
      },
      message: 'Course purchased successfully'
    };
    
  } catch (error) {
    console.error('❌ Purchase course error:', error);
    throw error;
  }
};

// ==========================================
// RECOMMENDATIONS & DISCOVERY
// ==========================================

/**
 * Get recommended courses based on user's quiz performance
 */
export const getRecommendedCourses = async (userId) => {
  try {
    console.log('🎯 Getting recommended courses for user:', userId);
    
    // Find user with performance data
    const user = await Student.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found');
    }
    
    // Get user's subject performance
    const { weaknesses, strengths } = user.getPerformanceAnalysis();
    
    // Build recommendation query
    const recommendationQuery = {
      isActive: true,
      deletedAt: null,
      status: 'active'
    };
    
    // Prioritize courses for weak subjects
    const weakSubjects = weaknesses.map(w => w.subject);
    if (weakSubjects.length > 0) {
      recommendationQuery.$or = [
        {
          'studion.recommendedForQuizzes': {
            $elemMatch: {
              quizCategory: { $in: weakSubjects }
            }
          }
        },
        {
          category: { $in: weakSubjects.map(s => s.replace('_', ' ')) }
        }
      ];
    }
    
    // Get recommended courses
    const recommendedCourses = await Course.find(recommendationQuery)
      .sort({ 'rating.average': -1, 'enrollment.totalStudents': -1 })
      .limit(10)
      .lean();
    
    // If no specific recommendations, get popular courses in user's preferred categories
    let fallbackCourses = [];
    if (recommendedCourses.length < 5) {
      const preferredCategories = user.learningPreferences?.preferredCategories || [];
      
      if (preferredCategories.length > 0) {
        fallbackCourses = await Course.find({
          isActive: true,
          deletedAt: null,
          status: 'active',
          category: { $in: preferredCategories },
          _id: { $nin: recommendedCourses.map(c => c._id) }
        })
        .sort({ 'rating.average': -1 })
        .limit(5)
        .lean();
      }
    }
    
    const allRecommendations = [...recommendedCourses, ...fallbackCourses];
    
    console.log(`✅ Found ${allRecommendations.length} recommended courses`);
    
    return {
      success: true,
      recommendations: allRecommendations,
      basedOn: {
        weaknesses: weakSubjects,
        preferences: user.learningPreferences?.preferredCategories || []
      }
    };
    
  } catch (error) {
    console.error('❌ Get recommended courses error:', error);
    throw error;
  }
};

/**
 * Get featured courses
 */
export const getFeaturedCourses = async (limit = 6) => {
  try {
    console.log('⭐ Getting featured courses');
    
    const featuredCourses = await Course.find({
      isFeatured: true,
      isActive: true,
      deletedAt: null,
      status: 'active'
    })
    .sort({ 'rating.average': -1, 'enrollment.totalStudents': -1 })
    .limit(Number(limit))
    .lean();
    
    console.log(`✅ Found ${featuredCourses.length} featured courses`);
    
    return {
      success: true,
      featuredCourses
    };
    
  } catch (error) {
    console.error('❌ Get featured courses error:', error);
    throw error;
  }
};

// ==========================================
// ADMIN ANALYTICS
// ==========================================

/**
 * Get course analytics (Admin only)
 */
export const getCourseAnalytics = async (adminUser) => {
  try {
    console.log('📊 Getting course analytics');
    
    // Validate admin permissions
    if (!adminUser || adminUser.userType !== 'admin') {
      throw HttpError.forbidden('Admin access required');
    }
    
    const analytics = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          activeCourses: {
            $sum: { $cond: [{ $and: ['$isActive', { $eq: ['$deletedAt', null] }] }, 1, 0] }
          },
          totalStudents: { $sum: '$enrollment.totalStudents' },
          totalRevenue: { $sum: '$business.revenue' },
          averageRating: { $avg: '$rating.average' },
          totalViews: { $sum: '$analytics.views' },
          totalClicks: { $sum: '$analytics.clicks' },
          totalConversions: { $sum: '$analytics.conversions' }
        }
      }
    ]);
    
    // Get category breakdown
    const categoryStats = await Course.aggregate([
      { $match: { isActive: true, deletedAt: null } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating.average' },
          totalStudents: { $sum: '$enrollment.totalStudents' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const stats = analytics[0] || {
      totalCourses: 0,
      activeCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0
    };
    
    console.log('✅ Course analytics generated');
    
    return {
      success: true,
      analytics: {
        overview: stats,
        categoryBreakdown: categoryStats,
        conversionRate: stats.totalClicks > 0 ? 
          ((stats.totalConversions / stats.totalClicks) * 100).toFixed(2) : 0
      }
    };
    
  } catch (error) {
    console.error('❌ Get course analytics error:', error);
    throw error;
  }
};

// ==========================================
// DEFAULT EXPORT
// ==========================================

// Default export for easier importing
const courseService = {
  createCourse,
  updateCourse,
  deleteCourse,
  restoreCourse,
  getAllCourses,
  getCourseById,
  getCoursesByCategory,
  calculateCoursePrice,
  purchaseCourse,
  getRecommendedCourses,
  getFeaturedCourses,
  getCourseAnalytics
};

export default courseService;