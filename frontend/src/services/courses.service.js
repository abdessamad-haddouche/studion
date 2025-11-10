/**
 * PATH: src/services/courses.service.js
 * Courses Service - API integration for course marketplace
 * Follows existing studion API patterns
 */

import { coursesAPI } from './api'

class CoursesService {
  /**
   * Get all courses with filtering and pagination
   * @param {Object} options - Filter options
   * @returns {Promise} Course list response
   */
  async getAllCourses(options = {}) {
    try {
      console.log('📚 Fetching courses with options:', options)
      
      const queryParams = {
        page: options.page || 1,
        limit: options.limit || 20,
        sortBy: options.sortBy || 'rating.average',
        sortOrder: options.sortOrder || 'desc'
      }
      
      // Add filters
      if (options.category) queryParams.category = options.category
      if (options.level) queryParams.level = options.level
      if (options.source) queryParams.source = options.source
      if (options.search) queryParams.search = options.search
      if (options.isFree !== undefined) queryParams.isFree = options.isFree
      if (options.minPrice !== undefined) queryParams.minPrice = options.minPrice
      if (options.maxPrice !== undefined) queryParams.maxPrice = options.maxPrice
      if (options.minRating !== undefined) queryParams.minRating = options.minRating
      
      const response = await coursesAPI.getAll(queryParams)
      
      console.log('✅ Courses fetched successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching courses:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch courses')
    }
  }

  /**
   * Get course by ID
   * @param {string} courseId - Course ID
   * @returns {Promise} Course details
   */
  async getCourseById(courseId) {
    try {
      console.log('📚 Fetching course:', courseId)
      const response = await coursesAPI.getById(courseId)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching course:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch course')
    }
  }

  /**
   * Get featured courses
   * @param {number} limit - Number of courses to fetch
   * @returns {Promise} Featured courses
   */
  async getFeaturedCourses(limit = 6) {
    try {
      console.log('⭐ Fetching featured courses')
      const response = await coursesAPI.getFeatured(limit)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching featured courses:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch featured courses')
    }
  }

  /**
   * Get courses by category
   * @param {string} category - Course category
   * @param {Object} filters - Additional filters
   * @returns {Promise} Courses in category
   */
  async getCoursesByCategory(category, filters = {}) {
    try {
      console.log('📂 Fetching courses for category:', category)
      const response = await coursesAPI.getByCategory(category, filters)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching courses by category:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch courses')
    }
  }

  /**
   * Calculate course price with points discount
   * @param {string} courseId - Course ID
   * @param {number} pointsToUse - Points to apply for discount
   * @returns {Promise} Price calculation
   */
  async calculateCoursePrice(courseId, pointsToUse = 0) {
    try {
      console.log('💰 Calculating price for course:', courseId, 'with points:', pointsToUse)
      const response = await coursesAPI.calculatePrice(courseId, { pointsToUse })
      return response.data
    } catch (error) {
      console.error('❌ Error calculating price:', error)
      throw new Error(error.response?.data?.message || 'Failed to calculate price')
    }
  }

  /**
   * Purchase course with points discount
   * @param {string} courseId - Course ID
   * @param {number} pointsToUse - Points to apply for discount
   * @returns {Promise} Purchase result
   */
  async purchaseCourse(courseId, pointsToUse = 0) {
    try {
      console.log('🛒 Purchasing course:', courseId, 'with points:', pointsToUse)
      const response = await coursesAPI.purchase(courseId, { pointsToUse })
      return response.data
    } catch (error) {
      console.error('❌ Error purchasing course:', error)
      throw new Error(error.response?.data?.message || 'Failed to purchase course')
    }
  }

  /**
   * Get user's purchased courses
   * @returns {Promise} Purchased courses
   */
  async getUserPurchasedCourses() {
    try {
      console.log('📖 Fetching purchased courses')
      const response = await coursesAPI.getPurchased()
      return response.data
    } catch (error) {
      console.error('❌ Error fetching purchased courses:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch purchased courses')
    }
  }

  /**
   * Get recommended courses based on quiz performance
   * @returns {Promise} Recommended courses
   */
  async getRecommendedCourses() {
    try {
      console.log('🎯 Fetching recommended courses')
      const response = await coursesAPI.getRecommended()
      return response.data
    } catch (error) {
      console.error('❌ Error fetching recommendations:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch recommendations')
    }
  }

  // ==========================================
  // LOCAL STORAGE HELPERS (FOR MVP)
  // ==========================================

  /**
   * Get purchased courses from localStorage (MVP implementation)
   * @returns {Array} Purchased courses
   */
  getPurchasedCoursesLocal() {
    try {
      const purchased = localStorage.getItem('studion_purchased_courses')
      return purchased ? JSON.parse(purchased) : []
    } catch (error) {
      console.error('❌ Error reading purchased courses from localStorage:', error)
      return []
    }
  }

  /**
   * Save purchased course to localStorage (MVP implementation)
   * @param {Object} course - Course to save
   * @param {Object} purchaseInfo - Purchase details
   */
  savePurchasedCourseLocal(course, purchaseInfo) {
    try {
      const purchased = this.getPurchasedCoursesLocal()
      
      const purchaseEntry = {
        courseId: course.id,
        course: course,
        purchaseDate: new Date().toISOString(),
        pointsUsed: purchaseInfo.pointsUsed || 0,
        finalPrice: purchaseInfo.finalPrice || course.pricing.currentPrice,
        discount: purchaseInfo.discount || 0,
        method: 'points_discount' // MVP method
      }
      
      // Avoid duplicates
      const existingIndex = purchased.findIndex(p => p.courseId === course.id)
      if (existingIndex !== -1) {
        purchased[existingIndex] = purchaseEntry
      } else {
        purchased.push(purchaseEntry)
      }
      
      localStorage.setItem('studion_purchased_courses', JSON.stringify(purchased))
      console.log('✅ Course saved to localStorage:', purchaseEntry)
      
      return purchaseEntry
    } catch (error) {
      console.error('❌ Error saving purchased course:', error)
      throw error
    }
  }

  /**
   * Check if user has purchased a course (localStorage check)
   * @param {string} courseId - Course ID
   * @returns {boolean} Whether course is purchased
   */
  hasPurchasedCourseLocal(courseId) {
    const purchased = this.getPurchasedCoursesLocal()
    return purchased.some(p => p.courseId === courseId)
  }

  /**
   * Clear purchased courses (for testing)
   */
  clearPurchasedCoursesLocal() {
    localStorage.removeItem('studion_purchased_courses')
    console.log('🗑️ Cleared purchased courses from localStorage')
  }
}

// Export singleton instance
const coursesService = new CoursesService()
export default coursesService