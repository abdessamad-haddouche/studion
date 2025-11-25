/**
 * PATH: src/components/enrollment/EnrollmentModal.jsx
 */

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  X, Sparkles, CreditCard, Clock, Users, BookOpen, Check, AlertCircle, 
  ToggleLeft, ToggleRight, CheckCircle, Award
} from 'lucide-react'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import pointsService from '../../services/points.service'
import enrollmentService from '../../services/enrollment.service'
import { fetchUserPoints } from '../../store/slices/coursesSlice'
import { fetchUserStats } from '../../store/slices/authSlice'

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
        let discountPercentage = 5 // Base 5% for 1000+ points
        
        if (actualUserPoints >= 3000) {
          discountPercentage = 15 // Max 15% for 3000+ points
        } else if (actualUserPoints >= 2000) {
          discountPercentage = 10 // 10% for 2000+ points
        }
        
        const discountAmount = (coursePrice * discountPercentage) / 100
        const finalPrice = Math.max(0, coursePrice - discountAmount)
        const pointsToDeduct = Math.min(actualUserPoints, 1000 + (discountPercentage - 5) * 200) // Points used for discount
        
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

        // 🆕 FIX: Update BOTH Redux slices to ensure Header sees the change
        await Promise.all([
          dispatch(fetchUserPoints()),  // Updates coursesSlice.userPoints
          dispatch(fetchUserStats())    // Updates authSlice.userStats.totalPoints (used by Header)
        ])
        
        console.log('✅ Points updated in both Redux slices')
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

  const formatDuration = () => {
    const hours = course.content?.duration?.hours || 0
    const minutes = course.content?.duration?.minutes || 0
    
    if (hours === 0 && minutes === 0) return 'Self-paced'
    if (hours === 0) return `${minutes}m`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
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
                ({costBreakdown.pointsDiscount.toFixed(0)} MAD saved)
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
        
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Enroll in Course</h2>
                <p className="text-sm text-slate-600">Complete your enrollment to start learning</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              disabled={isEnrolling}
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          
          <div className="flex space-x-3 p-3 bg-slate-50 rounded-lg">
            <img
              src={course.media?.thumbnail || `https://picsum.photos/100/75?random=${course.id}`}
              alt={course.title}
              className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 line-clamp-2 text-sm leading-tight">{course.title}</h3>
              <p className="text-xs text-slate-600">By {course.instructor?.name}</p>
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

          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="text-center">
              <Clock className="w-4 h-4 text-slate-500 mx-auto mb-1" />
              <div className="text-xs font-semibold text-slate-900">{formatDuration()}</div>
              <div className="text-xs text-slate-600">Duration</div>
            </div>
            <div className="text-center">
              <Users className="w-4 h-4 text-slate-500 mx-auto mb-1" />
              <div className="text-xs font-semibold text-slate-900">{course.enrollment?.totalStudents?.toLocaleString() || '1,200'}</div>
              <div className="text-xs text-slate-600">Students</div>
            </div>
            <div className="text-center">
              <BookOpen className="w-4 h-4 text-slate-500 mx-auto mb-1" />
              <div className="text-xs font-semibold text-slate-900">{course.content?.totalLectures || Math.floor(Math.random() * 15) + 10}</div>
              <div className="text-xs text-slate-600">Lessons</div>
            </div>
          </div>

          {course.content?.learningOutcomes && course.content.learningOutcomes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700">What you'll learn:</h4>
              <div className="space-y-1">
                {course.content.learningOutcomes.slice(0, 3).map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-600 line-clamp-1">{outcome}</span>
                  </div>
                ))}
                {course.content.learningOutcomes.length > 3 && (
                  <span className="text-xs text-slate-500 ml-5">
                    +{course.content.learningOutcomes.length - 3} more outcomes
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Points Discount</span>
              </h4>
              <div className="text-right">
                <div className="text-sm font-bold text-purple-600">
                  {actualUserPoints.toLocaleString()} points
                </div>
                <div className="text-xs text-slate-500">Available balance</div>
              </div>
            </div>

            {actualUserPoints >= 1000 ? (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 space-y-3">
                
                <div className="flex items-center justify-between bg-white border border-purple-200 rounded-lg p-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-semibold text-slate-800">Use points for discount</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Get {costBreakdown?.discountPercentage || 5}% off with your {actualUserPoints.toLocaleString()} points
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
                        <div>• You save {costBreakdown?.savings?.toFixed(0)} MAD on this course</div>
                        <div>• {costBreakdown?.pointsUsed} points will be deducted</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <div className="text-xs space-y-1">
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
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">No discount available</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>You need at least 1,000 points for a discount</div>
                  <div>You currently have {actualUserPoints.toLocaleString()} points</div>
                  <div>Need {(1000 - actualUserPoints).toLocaleString()} more points for 5% off</div>
                </div>
              </div>
            )}
          </div>

          {costBreakdown && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Price Breakdown</span>
              </h4>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Course Price</span>
                  <span>{costBreakdown.originalPrice.toFixed(0)} MAD</span>
                </div>
                
                {usePointsDiscount && costBreakdown.canUsePoints && (
                  <>
                    <div className="flex justify-between text-purple-600">
                      <span>Points Discount ({costBreakdown.discountPercentage}%)</span>
                      <span>-{costBreakdown.pointsDiscount.toFixed(0)} MAD</span>
                    </div>
                    <hr className="border-slate-300" />
                  </>
                )}
                
                <div className="flex justify-between font-bold text-base">
                  <span>Final Price</span>
                  <span className={costBreakdown.finalPrice === 0 ? 'text-green-600' : 'text-slate-900'}>
                    {costBreakdown.finalPrice === 0 ? 'FREE' : `${costBreakdown.finalPrice.toFixed(0)} MAD`}
                  </span>
                </div>

                {usePointsDiscount && costBreakdown.savings > 0 && (
                  <div className="bg-green-100 border border-green-200 rounded p-2 mt-2">
                    <div className="text-green-800 text-xs font-medium text-center">
                      🎉 You save {costBreakdown.savings.toFixed(0)} MAD ({costBreakdown.discountPercentage}% off) with {costBreakdown.pointsUsed} points!
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-3 h-3 text-green-500" />
              <span>Lifetime access</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-3 h-3 text-green-500" />
              <span>Certificate of completion</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-3 h-3 text-green-500" />
              <span>Mobile & desktop access</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Check className="w-3 h-3 text-green-500" />
              <span>30-day money back guarantee</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
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
                  {costBreakdown?.finalPrice === 0 ? 'Enroll for Free' : `Enroll Now - ${costBreakdown?.finalPrice?.toFixed(0) || coursePrice.toFixed(0)} MAD`}
                </>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-xs text-slate-500 text-center border-t border-slate-200 pt-3">
            🔒 Secure enrollment powered by industry-standard encryption
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnrollmentModal