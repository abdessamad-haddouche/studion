/**
 * PATH: src/services/enrollment.service.js
 */

class EnrollmentService {
  constructor() {
    // No longer using global keys - will be user-specific
    this.STORAGE_KEY_PREFIX = 'enrolled_courses_'
    this.POINTS_KEY_PREFIX = 'user_points_'
  }

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
        userId: this.getCurrentUserId()
      }

      enrolledCourses.push(enrollment)
      this.saveEnrolledCourses(enrolledCourses)

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
        userId: this.getCurrentUserId(),
        payment: {
          originalPrice: paymentDetails.originalPrice,
          pointsUsed: paymentDetails.pointsUsed,
          pointsDiscount: paymentDetails.pointsDiscount,
          finalPrice: paymentDetails.finalPrice,
          paidAt: new Date().toISOString()
        }
      }

      enrolledCourses.push(enrollment)
      this.saveEnrolledCourses(enrolledCourses)

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

  calculatePointsDiscount(userPoints, originalPrice) {
    const MAX_USABLE_POINTS = 3000
    const actualPoints = Math.min(userPoints, MAX_USABLE_POINTS)
    
    let discountPercentage = 0
    let pointsToUse = 0
    
    if (actualPoints >= 3000) {
      discountPercentage = 15 // Max 15%
      pointsToUse = 3000
    } else if (actualPoints >= 2000) {
      discountPercentage = 10 // 10% for 2000+ points
      pointsToUse = 2000
    } else if (actualPoints >= 1000) {
      discountPercentage = 5 // 5% for 1000+ points
      pointsToUse = 1000
    }
    
    const discountAmount = (originalPrice * discountPercentage) / 100
    
    return {
      pointsUsed: pointsToUse,
      discountPercentage,
      discountAmount,
      maxUsablePoints: MAX_USABLE_POINTS,
      canUsePoints: actualPoints >= 1000,
      remainingPoints: userPoints - pointsToUse
    }
  }

  calculateFinalPrice(originalPrice, userPoints) {
    if (userPoints < 1000) {
      return {
        originalPrice: originalPrice,
        pointsUsed: 0,
        pointsDiscount: 0,
        discountPercentage: 0,
        finalPrice: originalPrice,
        savings: 0,
        canUsePoints: false,
        message: 'Need at least 1000 points for discount'
      }
    }

    const discount = this.calculatePointsDiscount(userPoints, originalPrice)
    const finalPrice = Math.max(0, originalPrice - discount.discountAmount)
    
    return {
      originalPrice: originalPrice,
      pointsUsed: discount.pointsUsed,
      pointsDiscount: discount.discountAmount,
      discountPercentage: discount.discountPercentage,
      finalPrice: finalPrice,
      savings: discount.discountAmount,
      canUsePoints: true,
      maxUsablePoints: discount.maxUsablePoints,
      remainingPoints: discount.remainingPoints,
      message: `Save ${discount.discountPercentage}% with ${discount.pointsUsed} points!`
    }
  }

  getMaxUsablePoints(coursePrice, userPoints) {
    return Math.min(3000, userPoints) // Max 3000 points can be used
  }

  getPointsDiscountTiers() {
    return [
      { points: 1000, discount: 5, label: '5% Off' },
      { points: 2000, discount: 10, label: '10% Off' },
      { points: 3000, discount: 15, label: '15% Off (Max)' }
    ]
  }

  clearEnrollments() {
    const storageKey = this.getStorageKey()
    localStorage.removeItem(storageKey)
    console.log('🗑️ Cleared enrollments for user:', this.getCurrentUserId())
    return { success: true, message: 'All enrollments cleared' }
  }

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