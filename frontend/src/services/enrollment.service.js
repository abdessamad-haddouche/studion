/**
 * PATH: src/services/enrollment.service.js
 * Enrollment Service - Handle course enrollments and localStorage management
 */

class EnrollmentService {
  constructor() {
    this.STORAGE_KEY = 'enrolled_courses'
    this.POINTS_KEY = 'user_points'
  }

  /**
   * Get all enrolled courses from localStorage
   */
  getEnrolledCourses() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error getting enrolled courses:', error)
      return []
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
        completed: false
      }

      enrolledCourses.push(enrollment)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrolledCourses))

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
        payment: {
          originalPrice: paymentDetails.originalPrice,
          pointsUsed: paymentDetails.pointsUsed,
          pointsDiscount: paymentDetails.pointsDiscount,
          finalPrice: paymentDetails.finalPrice,
          paidAt: new Date().toISOString()
        }
      }

      enrolledCourses.push(enrollment)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrolledCourses))

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
   * Clear all enrollments (for testing)
   */
  clearEnrollments() {
    localStorage.removeItem(this.STORAGE_KEY)
    return { success: true, message: 'All enrollments cleared' }
  }

  /**
   * Export enrollments (for backup)
   */
  exportEnrollments() {
    const enrollments = this.getEnrolledCourses()
    return {
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
      totalCourses: enrollments.length,
      freeCourses: freeCourses.length,
      paidCourses: paidCourses.length,
      totalSpent: paidCourses.reduce((sum, course) => sum + (course.payment?.finalPrice || 0), 0),
      totalSaved: paidCourses.reduce((sum, course) => sum + (course.payment?.pointsDiscount || 0), 0)
    }
  }
}

// Export singleton instance
const enrollmentService = new EnrollmentService()
export default enrollmentService