/**
 * PATH: src/services/points.service.js
 * Points Service - Handle backend communication for points transactions
 * FIXED: Correct API endpoints and payload format
 */

import api from './api'

class PointsService {
  /**
   * Get user's current points balance
   */
  async getUserPoints() {
    try {
      const response = await api.get('/users/me/points')  // Fixed endpoint
      return {
        success: true,
        points: response.data.data?.totalEarned || 0,  // Fixed data path
        data: response.data.data
      }
    } catch (error) {
      console.error('Error fetching user points:', error)
      return {
        success: false,
        points: 0,
        error: error.response?.data?.message || 'Failed to fetch points'
      }
    }
  }

  /**
   * Deduct points from user's account (for course enrollment)
   * FIXED: Uses correct backend API format
   */
  async deductPoints(pointsToDeduct, courseId, transactionDetails = {}) {
    try {
      // Fixed payload format to match your backend controller
      const payload = {
        amount: pointsToDeduct,  // Backend expects 'amount', not 'points'
        reason: `Course enrollment: ${courseId} - ${transactionDetails.originalPrice ? `$${transactionDetails.originalPrice} course` : 'course purchase'}`
      }

      const response = await api.post('/users/me/points/deduct', payload)  // Fixed endpoint
      
      return {
        success: true,
        newBalance: response.data.data.newTotal,  // Fixed data path
        pointsDeducted: response.data.data.pointsDeducted,
        transactionId: response.data.data.timestamp,
        data: response.data.data
      }
    } catch (error) {
      console.error('Error deducting points:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to deduct points',
        code: error.response?.status
      }
    }
  }

  /**
   * Add points to user's account (for bonuses, rewards, etc.)
   * FIXED: Uses correct backend API format
   */
  async addPoints(pointsToAdd, reason = 'Manual credit', metadata = {}) {
    try {
      const payload = {
        amount: pointsToAdd,  // Backend expects 'amount', not 'points'
        reason: reason
      }

      const response = await api.post('/users/me/points/add', payload)  // Fixed endpoint
      
      return {
        success: true,
        newBalance: response.data.data.newTotal,
        pointsAdded: response.data.data.pointsAdded,
        transactionId: response.data.data.timestamp,
        data: response.data.data
      }
    } catch (error) {
      console.error('Error adding points:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add points'
      }
    }
  }

  /**
   * Get user's points transaction history
   */
  async getPointsHistory(page = 1, limit = 20) {
    try {
      const response = await api.get(`/users/me/points/history?page=${page}&limit=${limit}`)  // Fixed endpoint
      
      return {
        success: true,
        transactions: response.data.data?.transactions || [],
        pagination: response.data.data?.pagination || {},
        data: response.data.data
      }
    } catch (error) {
      console.error('Error fetching points history:', error)
      return {
        success: false,
        transactions: [],
        error: error.response?.data?.message || 'Failed to fetch points history'
      }
    }
  }

  /**
   * Get detailed points summary
   * NEW: Uses your backend's detailed summary endpoint
   */
  async getPointsSummary() {
    try {
      const response = await api.get('/users/me/points/summary')
      
      return {
        success: true,
        summary: response.data.data,
        points: response.data.data.points,
        statistics: response.data.data.statistics
      }
    } catch (error) {
      console.error('Error fetching points summary:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch points summary'
      }
    }
  }

  /**
   * Validate if user has enough points for a transaction
   */
  async validatePointsBalance(requiredPoints) {
    try {
      const pointsResult = await this.getUserPoints()
      
      if (!pointsResult.success) {
        return {
          valid: false,
          error: 'Could not verify points balance'
        }
      }

      const hasEnoughPoints = pointsResult.points >= requiredPoints
      
      return {
        valid: hasEnoughPoints,
        currentPoints: pointsResult.points,
        requiredPoints: requiredPoints,
        shortfall: hasEnoughPoints ? 0 : requiredPoints - pointsResult.points
      }
    } catch (error) {
      console.error('Error validating points balance:', error)
      return {
        valid: false,
        error: 'Failed to validate points balance'
      }
    }
  }

  /**
   * Calculate enrollment cost with points discount
   * Uses the percentage-based system from your enrollment modal
   */
  calculateEnrollmentCost(coursePrice, userPoints, usePointsDiscount = false) {
    if (!usePointsDiscount || userPoints < 1000) {
      return {
        originalPrice: coursePrice,
        pointsUsed: 0,
        pointsDiscount: 0,
        finalPrice: coursePrice,
        savings: 0,
        discountPercentage: 0,
        canUsePoints: false
      }
    }

    // Calculate percentage discount based on points (matching enrollment modal logic)
    let discountPercentage = 10 // Base 10% for 1000+ points
    
    if (userPoints >= 1500) {
      const extraHundreds = Math.floor((userPoints - 1000) / 500)
      discountPercentage = Math.min(10 + (extraHundreds * 5), 50) // Max 50% discount
    }
    
    const discountAmount = (coursePrice * discountPercentage) / 100
    const finalPrice = Math.max(0, coursePrice - discountAmount)
    const pointsToDeduct = Math.min(userPoints, 1000 + (discountPercentage - 10) * 100)
    
    return {
      originalPrice: coursePrice,
      pointsUsed: pointsToDeduct,
      pointsDiscount: discountAmount,
      finalPrice: finalPrice,
      savings: discountAmount,
      discountPercentage: discountPercentage,
      canUsePoints: true
    }
  }

  /**
   * Process course enrollment with points
   * FIXED: Uses correct API calls and error handling
   */
  async processCourseEnrollment(courseId, coursePrice, pointsToUse = 0) {
    try {
      // Validate points balance if using points
      if (pointsToUse > 0) {
        const validation = await this.validatePointsBalance(pointsToUse)
        if (!validation.valid) {
          return {
            success: false,
            error: `Insufficient points. You need ${validation.shortfall} more points.`,
            validation
          }
        }
      }

      // Deduct points if any are being used
      let pointsDeductionResult = { success: true, newBalance: null }
      if (pointsToUse > 0) {
        pointsDeductionResult = await this.deductPoints(
          pointsToUse, 
          courseId, 
          { originalPrice: coursePrice }
        )
        
        if (!pointsDeductionResult.success) {
          return {
            success: false,
            error: 'Failed to process points deduction',
            pointsError: pointsDeductionResult.error
          }
        }
      }

      // Return successful enrollment data
      return {
        success: true,
        enrollment: {
          courseId,
          pointsTransaction: pointsDeductionResult,
          enrolledAt: new Date().toISOString()
        },
        newPointsBalance: pointsDeductionResult.newBalance
      }
    } catch (error) {
      console.error('Error processing course enrollment:', error)
      return {
        success: false,
        error: 'Failed to process enrollment'
      }
    }
  }

  /**
   * Format points for display
   */
  formatPoints(points) {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`
    }
    return points.toLocaleString()
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }
}

// Export singleton instance
const pointsService = new PointsService()
export default pointsService