/**
 * PATH: src/services/enrollment.service.js
 * FIXED - User-specific enrollment tracking
 * 
 * ✅ CHANGES:
 * - Enrollments are now stored per user ID
 * - Uses Redux auth state to get current user
 * - Fallback to 'guest' if no user logged in
 */

class EnrollmentService {
  constructor() {
    // No longer using global keys - will be user-specific
    this.STORAGE_KEY_PREFIX = 'enrolled_courses_'
    this.POINTS_KEY_PREFIX = 'user_points_'
  }

  /**
   * ✅ NEW: Get current user ID from Redux store
   */
  getCurrentUserId() {
    try {
      // Get user from Redux store in localStorage
      const authState = localStorage.getItem('persist:auth')
      if (authState) {
        const parsed = JSON.parse(authState)
        const user = parsed.user ? JSON.parse(parsed.user) : null
        if (user && user.id) {
          return user.id
        }
      }

      // Fallback: Try to get user from direct auth storage
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        // Decode JWT to get user ID (simple base64 decode)
        try {
          const payload = accessToken.split('.')[1]
          const decoded = JSON.parse(atob(payload))
          if (decoded.userId || decoded.id) {
            return decoded.userId || decoded.id
          }
        } catch (e) {
          console.warn('Could not decode token for user ID')
        }
      }

      // If no user logged in, use 'guest' (for demo purposes)
      console.warn('⚠️ No user ID found - using guest mode')
      return 'guest'
    } catch (error) {
      console.error('Error getting user ID:', error)
      return 'guest'
    }
  }

  /**
   * ✅ NEW: Get user-specific storage key
   */
  getStorageKey() {
    const userId = this.getCurrentUserId()
    return `${this.STORAGE_KEY_PREFIX}${userId}`
  }

  /**
   * Get all enrolled courses from localStorage (user-specific)
   */
  getEnrolledCourses() {
    try {
      const storageKey = this.getStorageKey()
      const stored = localStorage.getItem(storageKey)
      const courses = stored ? JSON.parse(stored) : []
      
      console.log(`📚 Loaded ${courses.length} courses for user:`, this.getCurrentUserId())
      return courses
    } catch (error) {
      console.error('Error getting enrolled courses:', error)
      return []
    }
  }

  /**
   * ✅ FIXED: Save courses to user-specific key
   */
  saveEnrolledCourses(courses) {
    try {
      const storageKey = this.getStorageKey()
      localStorage.setItem(storageKey, JSON.stringify(courses))
      console.log(`✅ Saved ${courses.length} courses for user:`, this.getCurrentUserId())
      return true
    } catch (error) {
      console.error('Error saving enrolled courses:', error)
      return false
    }
  }

  /**
   * Check if user is enrolled in a specific course
   */
  isEnrolled(courseId) {
    const enrolledCourses = this.getEnrolledCourses()
    return enrolledCourses.some(course => course.id === courseId)
  }

  /**
   * Get enrollment details for a specific course
   */
  getEnrollmentDetails(courseId) {
    const enrolledCourses = this.getEnrolledCourses()
    return enrolledCourses.find(course => course.id === courseId) || null
  }

  /**
   * Enroll user in a free course
   */
  enrollFreeCourse(course) {
    try {
      const enrolledCourses = this.getEnrolledCourses()
      
      // Check if already enrolled
      if (this.isEnrolled(course.id)) {
        return { success: false, message: 'Already enrolled in this course' }
      }

      const enrollment = {
        id: course.id,
        title: course.title,
        instructor: course.instructor,
        category: course.category,
        media: course.media,
        enrollmentType: 'free',
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completed: false,
        userId: this.getCurrentUserId() // ✅ Track which user enrolled
      }

      enrolledCourses.push(enrollment)
      this.saveEnrolledCourses(enrolledCourses) // ✅ Use new save method

      console.log('✅ User enrolled in free course:', course.title)
      return { 
        success: true, 
        message: 'Successfully enrolled in free course!',
        enrollment 
      }
    } catch (error) {
      console.error('Error enrolling in free course:', error)
      return { success: false, message: 'Failed to enroll in course' }
    }
  }

  /**
   * Enroll user in a paid course (after payment)
   */
  enrollPaidCourse(course, paymentDetails) {
    try {
      const enrolledCourses = this.getEnrolledCourses()
      
      // Check if already enrolled
      if (this.isEnrolled(course.id)) {
        return { success: false, message: 'Already enrolled in this course' }
      }

      const enrollment = {
        id: course.id,
        title: course.title,
        instructor: course.instructor,
        category: course.category,
        media: course.media,
        enrollmentType: 'paid',
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completed: false,
        userId: this.getCurrentUserId(), // ✅ Track which user enrolled
        payment: {
          originalPrice: paymentDetails.originalPrice,
          pointsUsed: paymentDetails.pointsUsed,
          pointsDiscount: paymentDetails.pointsDiscount,
          finalPrice: paymentDetails.finalPrice,
          paidAt: new Date().toISOString()
        }
      }

      enrolledCourses.push(enrollment)
      this.saveEnrolledCourses(enrolledCourses) // ✅ Use new save method

      console.log('✅ User enrolled in paid course:', course.title)
      return { 
        success: true, 
        message: 'Successfully enrolled in course!',
        enrollment 
      }
    } catch (error) {
      console.error('Error enrolling in paid course:', error)
      return { success: false, message: 'Failed to enroll in course' }
    }
  }

  /**
   * Get user's course enrollment status for display
   */
  getEnrollmentStatus(course) {
    if (this.isEnrolled(course.id)) {
      const details = this.getEnrollmentDetails(course.id)
      return {
        enrolled: true,
        type: details.enrollmentType,
        enrolledAt: details.enrolledAt,
        buttonText: 'Go to Course',
        buttonAction: 'navigate'
      }
    }

    const isFree = course.pricing?.isFree || course.price === 0 || !course.price
    return {
      enrolled: false,
      type: null,
      enrolledAt: null,
      buttonText: isFree ? 'Enroll Free' : 'Enroll Now',
      buttonAction: isFree ? 'enroll_free' : 'enroll_paid'
    }
  }

  /**
   * Calculate points discount for a course
   */
  calculatePointsDiscount(points, maxPoints = null) {
    // 1000 points = $10 off
    const POINTS_PER_DOLLAR = 100 // 100 points = $1
    
    if (maxPoints !== null) {
      points = Math.min(points, maxPoints)
    }
    
    return {
      pointsUsed: points,
      discountAmount: Math.floor(points / POINTS_PER_DOLLAR),
      remainingPoints: maxPoints ? maxPoints - points : null
    }
  }

  /**
   * Calculate final price with points discount
   */
  calculateFinalPrice(originalPrice, pointsToUse, userPoints) {
    const maxDiscount = Math.floor(originalPrice) // Can't discount more than the price
    const discount = this.calculatePointsDiscount(pointsToUse)
    
    // Ensure user has enough points
    if (pointsToUse > userPoints) {
      throw new Error('Insufficient points')
    }
    
    // Ensure discount doesn't exceed price
    const finalDiscountAmount = Math.min(discount.discountAmount, maxDiscount)
    const actualPointsUsed = finalDiscountAmount * 100 // Convert back to points
    
    return {
      originalPrice: originalPrice,
      pointsUsed: actualPointsUsed,
      pointsDiscount: finalDiscountAmount,
      finalPrice: Math.max(0, originalPrice - finalDiscountAmount),
      savings: finalDiscountAmount
    }
  }

  /**
   * Get maximum points that can be used for a course
   */
  getMaxUsablePoints(coursePrice, userPoints) {
    const maxPointsForPrice = Math.floor(coursePrice) * 100 // Can use points up to course price
    return Math.min(maxPointsForPrice, userPoints)
  }

  /**
   * Clear all enrollments for current user (for testing)
   */
  clearEnrollments() {
    const storageKey = this.getStorageKey()
    localStorage.removeItem(storageKey)
    console.log('🗑️ Cleared enrollments for user:', this.getCurrentUserId())
    return { success: true, message: 'All enrollments cleared' }
  }

  /**
   * ✅ NEW: Clear ALL enrollments across all users (admin/testing)
   */
  clearAllEnrollments() {
    // Find all enrollment keys in localStorage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`🗑️ Cleared ${keysToRemove.length} user enrollment records`)
    return { success: true, message: `Cleared ${keysToRemove.length} user enrollments` }
  }

  /**
   * Export enrollments (for backup)
   */
  exportEnrollments() {
    const enrollments = this.getEnrolledCourses()
    return {
      userId: this.getCurrentUserId(),
      exportedAt: new Date().toISOString(),
      totalCourses: enrollments.length,
      courses: enrollments
    }
  }

  /**
   * Get enrollment statistics
   */
  getStats() {
    const enrollments = this.getEnrolledCourses()
    const freeCourses = enrollments.filter(e => e.enrollmentType === 'free')
    const paidCourses = enrollments.filter(e => e.enrollmentType === 'paid')
    
    return {
      userId: this.getCurrentUserId(),
      totalCourses: enrollments.length,
      freeCourses: freeCourses.length,
      paidCourses: paidCourses.length,
      totalSpent: paidCourses.reduce((sum, course) => sum + (course.payment?.finalPrice || 0), 0),
      totalSaved: paidCourses.reduce((sum, course) => sum + (course.payment?.pointsDiscount || 0), 0)
    }
  }

  /**
   * ✅ NEW: Migrate old global enrollments to user-specific (run once)
   */
  migrateOldEnrollments() {
    try {
      const oldKey = 'enrolled_courses'
      const oldData = localStorage.getItem(oldKey)
      
      if (oldData) {
        const oldCourses = JSON.parse(oldData)
        const currentUserId = this.getCurrentUserId()
        
        console.log(`🔄 Migrating ${oldCourses.length} courses to user:`, currentUserId)
        
        // Save to user-specific key
        this.saveEnrolledCourses(oldCourses)
        
        // Remove old global key
        localStorage.removeItem(oldKey)
        
        return { 
          success: true, 
          message: `Migrated ${oldCourses.length} courses`,
          coursesMigrated: oldCourses.length
        }
      }
      
      return { success: false, message: 'No old enrollments to migrate' }
    } catch (error) {
      console.error('Error migrating enrollments:', error)
      return { success: false, message: 'Migration failed' }
    }
  }
}

// Export singleton instance
const enrollmentService = new EnrollmentService()
export default enrollmentService