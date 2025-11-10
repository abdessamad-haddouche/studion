/**
 * PATH: src/services/points.service.js
 * Points Service - Handle backend communication for points transactions
 */

import api from './api'

class PointsService {
  /**
   * Get user's current points balance
   */
  async getUserPoints() {
    try {
      const response = await api.get('/user/points')
      return {
        success: true,
        points: response.data.points || 0,
        data: response.data
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
   */
  async deductPoints(pointsToDeduct, courseId, transactionDetails = {}) {
    try {
      const payload = {
        points: pointsToDeduct,
        courseId: courseId,
        transactionType: 'course_enrollment',
        metadata: {
          originalPrice: transactionDetails.originalPrice,
          finalPrice: transactionDetails.finalPrice,
          discountAmount: transactionDetails.pointsDiscount,
          enrolledAt: new Date().toISOString(),
          ...transactionDetails
        }
      }

      const response = await api.post('/user/points/deduct', payload)
      
      return {
        success: true,
        newBalance: response.data.newBalance,
        transactionId: response.data.transactionId,
        data: response.data
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
   */
  async addPoints(pointsToAdd, reason = 'manual_credit', metadata = {}) {
    try {
      const payload = {
        points: pointsToAdd,
        reason: reason,
        metadata: {
          creditedAt: new Date().toISOString(),
          ...metadata
        }
      }

      const response = await api.post('/user/points/add', payload)
      
      return {
        success: true,
        newBalance: response.data.newBalance,
        transactionId: response.data.transactionId,
        data: response.data
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
      const response = await api.get(`/user/points/history?page=${page}&limit=${limit}`)
      
      return {
        success: true,
        transactions: response.data.transactions || [],
        pagination: response.data.pagination || {},
        data: response.data
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
   * NEW SYSTEM: 1000 points = $10 discount, max 5000 points = $50 discount
   */
  calculateEnrollmentCost(coursePrice, pointsToUse) {
    const POINTS_PER_10_DOLLARS = 1000 // 1000 points = $10 discount
    const MAX_POINTS_USABLE = 5000     // Maximum 5000 points can be used
    
    // Maximum discount cannot exceed course price
    const maxDiscountDollars = Math.floor(coursePrice)
    const maxDiscountPoints = Math.min(MAX_POINTS_USABLE, maxDiscountDollars * 100) // Convert back to old system for compatibility
    
    // Actual points to use (cannot exceed max or available)
    const actualPointsToUse = Math.min(pointsToUse, MAX_POINTS_USABLE)
    
    // Calculate discount: every 1000 points = $10
    const discountDollars = Math.floor(actualPointsToUse / POINTS_PER_10_DOLLARS) * 10
    const maxPossibleDiscount = Math.min(discountDollars, maxDiscountDollars)
    const finalPrice = Math.max(0, coursePrice - maxPossibleDiscount)
    
    return {
      originalPrice: coursePrice,
      pointsUsed: actualPointsToUse,
      pointsDiscount: maxPossibleDiscount,
      finalPrice: finalPrice,
      savings: maxPossibleDiscount,
      maxPointsUsable: MAX_POINTS_USABLE
    }
  }

  /**
   * Process course enrollment with points
   */
  async processCourseEnrollment(courseId, coursePrice, pointsToUse = 0) {
    try {
      // Calculate the cost breakdown
      const costCalculation = this.calculateEnrollmentCost(coursePrice, pointsToUse)
      
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
          costCalculation.pointsUsed, 
          courseId, 
          costCalculation
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
          costBreakdown: costCalculation,
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
   * Get points earning opportunities
   */
  async getPointsEarningOpportunities() {
    try {
      const response = await api.get('/user/points/earning-opportunities')
      
      return {
        success: true,
        opportunities: response.data.opportunities || [],
        data: response.data
      }
    } catch (error) {
      console.error('Error fetching earning opportunities:', error)
      return {
        success: false,
        opportunities: [],
        error: error.response?.data?.message || 'Failed to fetch opportunities'
      }
    }
  }

  /**
   * Estimate points needed for full course discount
   */
  getFullDiscountPoints(coursePrice) {
    const POINTS_PER_DOLLAR = 100
    const maxDiscountDollars = Math.floor(coursePrice)
    return maxDiscountDollars * POINTS_PER_DOLLAR
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