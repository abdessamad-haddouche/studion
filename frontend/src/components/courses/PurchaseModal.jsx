/**
 * PATH: src/components/courses/PurchaseModal.jsx
 * Course Purchase Modal
 */

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  X, Crown, Sparkles, Calculator, CheckCircle, AlertCircle,
  Star, Clock, Users, BookOpen, CreditCard, Gift
} from 'lucide-react'
import Button from '../ui/Button'
import {
  selectPurchaseModal,
  hidePurchaseModal,
  purchaseCourse,
  selectUserPoints,
  calculateCoursePrice
} from '../../store/slices/coursesSlice'
import toast from 'react-hot-toast'

const PurchaseModal = () => {
  const dispatch = useDispatch()
  const { isOpen, course, priceCalculation, isPurchasing, error } = useSelector(selectPurchaseModal)
  const userPoints = useSelector(selectUserPoints)
  
  const [pointsToUse, setPointsToUse] = useState(0)
  const [finalPrice, setFinalPrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && course) {
      setPointsToUse(0)
      setFinalPrice(course.pricing.currentPrice)
      setDiscount(0)
    }
  }, [isOpen, course])

  // Calculate price when points change
  useEffect(() => {
    if (course && pointsToUse >= 0) {
      calculatePriceLocally(pointsToUse)
    }
  }, [pointsToUse, course])

  const calculatePriceLocally = (points) => {
    if (!course) return

    const maxPointsUsable = course.studion?.pointsDiscount?.maxPointsUsable || 1000
    const pointsRatio = course.studion?.pointsDiscount?.pointsToDiscountRatio || 0.01
    
    const actualPointsUsed = Math.min(Math.max(0, points), Math.min(userPoints, maxPointsUsable))
    const calculatedDiscount = actualPointsUsed * pointsRatio
    const calculatedFinalPrice = Math.max(0, course.pricing.currentPrice - calculatedDiscount)
    
    setDiscount(calculatedDiscount)
    setFinalPrice(calculatedFinalPrice)
  }

  const handlePointsChange = (e) => {
    const value = parseInt(e.target.value) || 0
    setPointsToUse(value)
  }

  const handleUseMaxPoints = () => {
    if (!course) return
    
    const maxUsable = Math.min(
      userPoints,
      course.studion?.pointsDiscount?.maxPointsUsable || 1000
    )
    setPointsToUse(maxUsable)
  }

  const handlePurchase = async () => {
    if (!course) return

    try {
      await dispatch(purchaseCourse({
        courseId: course.id,
        pointsToUse
      })).unwrap()

      toast.success(`🎉 Successfully purchased "${course.title}"!`)
      dispatch(hidePurchaseModal())
    } catch (error) {
      toast.error(`❌ Purchase failed: ${error}`)
    }
  }

  const handleClose = () => {
    dispatch(hidePurchaseModal())
  }

  if (!isOpen || !course) return null

  const maxPointsUsable = Math.min(
    userPoints,
    course.studion?.pointsDiscount?.maxPointsUsable || 1000
  )

  const formatDuration = () => {
    const hours = course.content?.duration?.hours || 0
    const minutes = course.content?.duration?.minutes || 0
    
    if (hours === 0 && minutes === 0) return 'Self-paced'
    if (hours === 0) return `${minutes}m`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <img
                src={course.media?.thumbnail || '/api/placeholder/120/68'}
                alt={course.title}
                className="w-20 h-12 object-cover rounded-lg"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{course.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span>By {course.instructor?.name}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span>{course.rating?.average?.toFixed(1) || '0.0'} ({course.rating?.count || 0})</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              disabled={isPurchasing}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Course Details */}
        <div className="p-6 space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="text-center">
              <Clock className="w-5 h-5 text-slate-500 mx-auto mb-1" />
              <div className="text-sm font-semibold text-slate-900">{formatDuration()}</div>
              <div className="text-xs text-slate-600">Duration</div>
            </div>
            <div className="text-center">
              <Users className="w-5 h-5 text-slate-500 mx-auto mb-1" />
              <div className="text-sm font-semibold text-slate-900">{course.enrollment?.totalStudents?.toLocaleString() || '0'}</div>
              <div className="text-xs text-slate-600">Students</div>
            </div>
            <div className="text-center">
              <BookOpen className="w-5 h-5 text-slate-500 mx-auto mb-1" />
              <div className="text-sm font-semibold text-slate-900">{course.content?.totalLectures || 0}</div>
              <div className="text-xs text-slate-600">Lessons</div>
            </div>
          </div>

          {/* What You'll Learn */}
          {course.content?.learningOutcomes && course.content.learningOutcomes.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">What you'll learn:</h3>
              <div className="space-y-2">
                {course.content.learningOutcomes.slice(0, 4).map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>Purchase Details</span>
            </h3>

            {/* Original Price */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Course Price:</span>
                <span className="text-lg font-semibold text-slate-900">
                  ${course.pricing.currentPrice.toFixed(2)}
                </span>
              </div>

              {/* Points Discount Section */}
              {userPoints > 0 && course.studion?.pointsDiscount?.enabled && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">Use Your Points for Discount</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Available Points:</span>
                      <span className="font-semibold text-purple-700">{userPoints.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Max Usable for this course:</span>
                      <span className="font-semibold text-purple-700">{maxPointsUsable.toLocaleString()}</span>
                    </div>

                    {/* Points Input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-purple-900">
                        Points to use (1 point = $0.01 discount):
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          min="0"
                          max={maxPointsUsable}
                          value={pointsToUse}
                          onChange={handlePointsChange}
                          className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter points"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleUseMaxPoints}
                          disabled={maxPointsUsable === 0}
                        >
                          Use Max
                        </Button>
                      </div>
                    </div>

                    {/* Discount Preview */}
                    {pointsToUse > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-purple-700">Discount ({pointsToUse} points):</span>
                        <span className="font-semibold text-green-600">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Total Calculation */}
              <div className="border-t border-blue-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-700">
                    {discount > 0 ? 'Subtotal:' : 'Total:'}
                  </span>
                  <span className={`text-lg font-bold ${discount > 0 ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    ${course.pricing.currentPrice.toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-700">Points Discount:</span>
                      <span className="text-lg font-semibold text-green-600">-${discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-slate-900">Final Total:</span>
                      <span className="text-2xl font-bold text-blue-600">${finalPrice.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {finalPrice === 0 && (
                  <div className="mt-2 p-3 bg-green-100 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">This course is FREE with your points!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Purchase Failed</span>
              </div>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="text-xs text-slate-600 space-y-2">
            <p>By purchasing this course, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Studion's Terms of Service and Privacy Policy</li>
              <li>The course is for personal use only</li>
              <li>No refunds after purchase (MVP implementation)</li>
              <li>Points used cannot be refunded</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 space-y-4">
          
          {/* Payment Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-900">Total: ${finalPrice.toFixed(2)}</div>
                {pointsToUse > 0 && (
                  <div className="text-sm text-slate-600">
                    Using {pointsToUse} points (${discount.toFixed(2)} discount)
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Points after purchase:</div>
                <div className="font-semibold text-slate-900">{(userPoints - pointsToUse).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={isPurchasing}
            >
              Cancel
            </Button>
            
            <Button
              variant="premium"
              className="flex-1 flex items-center justify-center space-x-2"
              onClick={handlePurchase}
              disabled={isPurchasing}
              loading={isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>{finalPrice === 0 ? 'Get Free with Points' : `Purchase for $${finalPrice.toFixed(2)}`}</span>
                </>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-slate-500">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Secure purchase • Instant access • No hidden fees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseModal