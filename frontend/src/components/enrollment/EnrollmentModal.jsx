/**
 * PATH: src/components/enrollment/EnrollmentModal.jsx
 * FINAL FIXED: Professional Enrollment Modal with percentage-based discount system
 * 1000+ points = 10% off, 1500+ points = 15% off, etc. (max 50% off)
 * Points are properly deducted from Redux store
 */

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { X, Sparkles, CreditCard, Clock, Users, Award, Check, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import pointsService from '../../services/points.service'
import enrollmentService from '../../services/enrollment.service'
import { fetchUserPoints } from '../../store/slices/coursesSlice'

const EnrollmentModal = ({ 
  isOpen, 
  onClose, 
  course, 
  userPoints = 0, 
  onEnrollmentSuccess 
}) => {
  const dispatch = useDispatch()
  
  // Get points from Redux as backup
  const reduxPoints = useSelector(state => state.auth?.userStats?.totalPoints || state.coursesSlice?.userPoints || 0)
  const actualUserPoints = userPoints || reduxPoints || 0
  
  const [pointsToUse, setPointsToUse] = useState(0)
  const [usePointsDiscount, setUsePointsDiscount] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [costBreakdown, setCostBreakdown] = useState(null)

  // Calculate cost breakdown with percentage-based discounts
  useEffect(() => {
    if (course?.price && isOpen) {
      const coursePrice = course.price || course.pricing?.currentPrice || 0
      
      let calculation = {
        originalPrice: coursePrice,
        pointsUsed: 0,
        pointsDiscount: 0,
        finalPrice: coursePrice,
        savings: 0,
        discountPercentage: 0,
        userTotalPoints: actualUserPoints,
        eligibleForDiscount: actualUserPoints >= 1000,
        canUsePoints: actualUserPoints >= 1000 && usePointsDiscount
      }
      
      if (usePointsDiscount && actualUserPoints >= 1000) {
        // Calculate percentage discount based on points
        let discountPercentage = 10 // Base 10% for 1000+ points
        
        if (actualUserPoints >= 1500) {
          // Additional discount for more points: 1500+ = 15%, 2000+ = 20%, etc.
          const extraHundreds = Math.floor((actualUserPoints - 1000) / 500)
          discountPercentage = Math.min(10 + (extraHundreds * 5), 50) // Max 50% discount
        }
        
        const discountAmount = (coursePrice * discountPercentage) / 100
        const finalPrice = Math.max(0, coursePrice - discountAmount)
        const pointsToDeduct = Math.min(actualUserPoints, 1000 + (discountPercentage - 10) * 100) // Points used for discount
        
        calculation = {
          originalPrice: coursePrice,
          pointsUsed: pointsToDeduct,
          pointsDiscount: discountAmount,
          finalPrice: finalPrice,
          savings: discountAmount,
          discountPercentage: discountPercentage,
          userTotalPoints: actualUserPoints,
          eligibleForDiscount: true,
          canUsePoints: true
        }
      }
      
      setCostBreakdown(calculation)
    }
  }, [course, isOpen, actualUserPoints, usePointsDiscount])

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setPointsToUse(0)
      setUsePointsDiscount(false)
      setError('')
      setShowSuccess(false)
      setIsEnrolling(false)
    }
  }, [isOpen])

  if (!isOpen || !course) return null

  const coursePrice = course.price || course.pricing?.currentPrice || 0

  const handleEnrollment = async () => {
    setIsEnrolling(true)
    setError('')

    try {
      // Validate points usage
      if (usePointsDiscount && actualUserPoints < 1000) {
        setError('Minimum 1,000 points required for discount')
        return
      }

      // Prepare enrollment data
      const pointsToDeduct = usePointsDiscount ? costBreakdown.pointsUsed : 0
      const finalPrice = usePointsDiscount ? costBreakdown.finalPrice : costBreakdown.originalPrice

      // Process points deduction if using points
      if (usePointsDiscount && pointsToDeduct > 0) {
        const pointsResult = await pointsService.deductPoints(
          pointsToDeduct,
          course.id,
          {
            originalPrice: costBreakdown.originalPrice,
            finalPrice: finalPrice,
            discountAmount: costBreakdown.pointsDiscount,
            discountPercentage: costBreakdown.discountPercentage
          }
        )

        if (!pointsResult.success) {
          setError('Failed to process points deduction: ' + pointsResult.error)
          return
        }

        // Update Redux with new points balance
        dispatch(fetchUserPoints())
      }

      // Save enrollment to localStorage
      const localEnrollment = enrollmentService.enrollPaidCourse(course, {
        originalPrice: costBreakdown.originalPrice,
        pointsUsed: pointsToDeduct,
        pointsDiscount: costBreakdown.pointsDiscount,
        finalPrice: finalPrice,
        discountPercentage: usePointsDiscount ? costBreakdown.discountPercentage : 0
      })

      if (!localEnrollment.success) {
        setError('Failed to save enrollment locally')
        return
      }

      // Show success
      setShowSuccess(true)
      
      // Notify parent component
      if (onEnrollmentSuccess) {
        onEnrollmentSuccess({
          enrollment: localEnrollment.enrollment,
          newPointsBalance: actualUserPoints - pointsToDeduct,
          pointsUsed: pointsToDeduct,
          discountApplied: costBreakdown.pointsDiscount
        })
      }

      // Auto close after success message
      setTimeout(() => {
        onClose()
      }, 3000)

    } catch (error) {
      console.error('Enrollment error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsEnrolling(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Enrollment Successful! 🎉
          </h2>
          <p className="text-slate-600 mb-4">
            You've successfully enrolled in <strong>{course.title}</strong>
          </p>
          {costBreakdown?.pointsUsed > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-purple-700">
                <strong>{costBreakdown.pointsUsed.toLocaleString()} points</strong> used for 
                <strong> {costBreakdown.discountPercentage}% discount</strong> 
                (${costBreakdown.pointsDiscount.toFixed(2)} saved)
              </p>
            </div>
          )}
          <p className="text-sm text-blue-600 font-medium">
            Check "My Courses" to start learning!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Enroll in Course</h2>
            <p className="text-slate-600">Complete your enrollment to start learning</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={isEnrolling}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Course Summary */}
          <div className="flex space-x-4 p-4 bg-slate-50 rounded-lg">
            <img
              src={course.media?.thumbnail || `https://picsum.photos/120/80?random=${course.id}`}
              alt={course.title}
              className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-slate-600">By {course.instructor?.name}</p>
              <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{Math.floor(Math.random() * 10) + 15} hours</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>1.2K students</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>Certificate</span>
                </span>
              </div>
            </div>
          </div>

          {/* Points Section - Enhanced with toggle and percentage-based discounts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Points Discount</span>
              </h4>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">
                  {actualUserPoints.toLocaleString()} points
                </div>
                <div className="text-xs text-slate-500">
                  Available balance
                </div>
              </div>
            </div>

            {actualUserPoints >= 1000 ? (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-4">
                
                {/* Toggle to Enable Points Discount */}
                <div className="flex items-center justify-between bg-white border border-purple-200 rounded-lg p-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-slate-800">Use points for discount</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Get {costBreakdown?.discountPercentage || 10}% off with your {actualUserPoints.toLocaleString()} points
                    </div>
                  </div>
                  <button
                    onClick={() => setUsePointsDiscount(!usePointsDiscount)}
                    className="flex items-center"
                  >
                    {usePointsDiscount ? (
                      <ToggleRight className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>

                {usePointsDiscount && (
                  <>
                    {/* Discount Info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-800">
                          {costBreakdown?.discountPercentage}% Discount Applied!
                        </span>
                      </div>
                      <div className="text-xs text-green-700 space-y-1">
                        <div>• {actualUserPoints.toLocaleString()} points = {costBreakdown?.discountPercentage}% discount</div>
                        <div>• You save ${costBreakdown?.savings?.toFixed(2)} on this course</div>
                        <div>• {costBreakdown?.pointsUsed} points will be deducted</div>
                      </div>
                    </div>

                    {/* Discount Breakdown */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>Your Points:</span>
                          <span className="font-semibold">{actualUserPoints.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount Level:</span>
                          <span className="font-semibold text-blue-600">{costBreakdown?.discountPercentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Points Used:</span>
                          <span className="font-semibold text-purple-600">{costBreakdown?.pointsUsed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining Points:</span>
                          <span className="font-semibold">{(actualUserPoints - (costBreakdown?.pointsUsed || 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">No discount available</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>You need at least 1,000 points for a discount</div>
                  <div>You currently have {actualUserPoints.toLocaleString()} points</div>
                  <div>Need {(1000 - actualUserPoints).toLocaleString()} more points for 10% off</div>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          {costBreakdown && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Price Breakdown</span>
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Course Price</span>
                  <span>${costBreakdown.originalPrice.toFixed(2)}</span>
                </div>
                
                {usePointsDiscount && costBreakdown.canUsePoints && (
                  <>
                    <div className="flex justify-between text-purple-600">
                      <span>Points Discount ({costBreakdown.discountPercentage}%)</span>
                      <span>-${costBreakdown.pointsDiscount.toFixed(2)}</span>
                    </div>
                    <hr className="border-slate-300" />
                  </>
                )}
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Final Price</span>
                  <span className={costBreakdown.finalPrice === 0 ? 'text-green-600' : 'text-slate-900'}>
                    {costBreakdown.finalPrice === 0 ? 'FREE' : `$${costBreakdown.finalPrice.toFixed(2)}`}
                  </span>
                </div>

                {usePointsDiscount && costBreakdown.savings > 0 && (
                  <div className="bg-green-100 border border-green-200 rounded p-2 mt-3">
                    <div className="text-green-800 text-sm font-medium text-center">
                      🎉 You save ${costBreakdown.savings.toFixed(2)} ({costBreakdown.discountPercentage}% off) with {costBreakdown.pointsUsed} points!
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Course Features */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Lifetime access</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Certificate of completion</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Mobile & desktop access</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>30-day money back guarantee</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isEnrolling}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEnrollment}
              disabled={isEnrolling}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isEnrolling ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {costBreakdown?.finalPrice === 0 ? 'Enroll for Free' : `Enroll Now - $${costBreakdown?.finalPrice?.toFixed(2) || coursePrice.toFixed(2)}`}
                </>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-xs text-slate-500 text-center border-t border-slate-200 pt-4">
            🔒 Secure enrollment powered by industry-standard encryption
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnrollmentModal