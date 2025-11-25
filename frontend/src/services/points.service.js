/**
 * PATH: src/services/points.service.js
 * Points discount system (1000pts = 5%, 2000pts = 10%, 3000pts = 15% max)
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

  async deductPoints(pointsToDeduct, courseId, transactionDetails = {}) {
    try {
      const payload = {
        amount: pointsToDeduct,
        reason: `Course enrollment: ${courseId} - ${transactionDetails.originalPrice ? `$${transactionDetails.originalPrice} course` : 'course purchase'}`
      }

      const response = await api.post('/users/me/points/deduct', payload)
      
      return {
        success: true,
        newBalance: response.data.data.newTotal,
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

  async addPoints(pointsToAdd, reason = 'Manual credit', metadata = {}) {
    try {
      const payload = {
        amount: pointsToAdd,
        reason: reason
      }

      const response = await api.post('/users/me/points/add', payload)
      
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
      const response = await api.get(`/users/me/points/history?page=${page}&limit=${limit}`)
      
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

  calculateEnrollmentCost(coursePrice, userPoints, usePointsDiscount = false) {
    if (!usePointsDiscount || userPoints < 1000) {
      return {
        originalPrice: coursePrice,
        pointsUsed: 0,
        pointsDiscount: 0,
        finalPrice: coursePrice,
        savings: 0,
        discountPercentage: 0,
        canUsePoints: false,
        message: 'Need at least 1000 points for discount'
      }
    }

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
    
    const discountAmount = (coursePrice * discountPercentage) / 100
    const finalPrice = Math.max(0, coursePrice - discountAmount)
    
    return {
      originalPrice: coursePrice,
      pointsUsed: pointsToUse,
      pointsDiscount: discountAmount,
      finalPrice: finalPrice,
      savings: discountAmount,
      discountPercentage: discountPercentage,
      canUsePoints: true,
      maxUsablePoints: MAX_USABLE_POINTS,
      remainingPoints: userPoints - pointsToUse,
      message: `Save ${discountPercentage}% with ${pointsToUse} points!`
    }
  }

  getPointsDiscountTiers() {
    return [
      { points: 1000, discount: 5, label: '5% Off', description: 'Basic discount' },
      { points: 2000, discount: 10, label: '10% Off', description: 'Better savings' },
      { points: 3000, discount: 15, label: '15% Off', description: 'Maximum discount' }
    ]
  }

  getQualifiedDiscountTier(userPoints) {
    const tiers = this.getPointsDiscountTiers()
    
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (userPoints >= tiers[i].points) {
        return {
          ...tiers[i],
          qualified: true,
          nextTier: i < tiers.length - 1 ? tiers[i + 1] : null
        }
      }
    }
    
    return {
      qualified: false,
      nextTier: tiers[0],
      pointsNeeded: tiers[0].points - userPoints
    }
  }

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