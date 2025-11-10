/**
 * PATH: src/components/courses/CourseCard.jsx
 * Premium Course Card - Matches studion design system
 */

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Star, Clock, Users, BookOpen, Crown, Sparkles, 
  ExternalLink, CheckCircle, ArrowRight, Award
} from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { showPurchaseModalAction as showPurchaseModal, selectUserPoints } from '../../store/slices/coursesSlice'
import coursesService from '../../services/courses.service'

const CourseCard = ({ course, featured = false, className = '' }) => {
  const dispatch = useDispatch()
  const userPoints = useSelector(selectUserPoints)
  const [isHovered, setIsHovered] = useState(false)

  // Check if course is purchased (localStorage)
  const isPurchased = coursesService.hasPurchasedCourseLocal(course.id)

  // Calculate potential discount
  const maxPointsUsable = course.studion?.pointsDiscount?.maxPointsUsable || 1000
  const pointsRatio = course.studion?.pointsDiscount?.pointsToDiscountRatio || 0.01
  const maxDiscount = Math.min(userPoints, maxPointsUsable) * pointsRatio
  const discountedPrice = Math.max(0, course.pricing.currentPrice - maxDiscount)

  const handlePurchaseClick = () => {
    if (isPurchased || course.pricing.isFree) return
    
    dispatch(showPurchaseModal({ course }))
  }

  const handleExternalClick = () => {
    if (course.external?.affiliateUrl) {
      window.open(course.external.affiliateUrl, '_blank')
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

  const formatPrice = () => {
    if (course.pricing.isFree) return 'Free'
    return `$${course.pricing.currentPrice.toFixed(2)}`
  }

  const getLevelColor = () => {
    switch (course.level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getSourceIcon = () => {
    if (course.source === 'internal') return <Crown className="w-4 h-4 text-purple-600" />
    return <ExternalLink className="w-4 h-4 text-slate-500" />
  }

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className} ${featured ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variant={featured ? "premium" : "default"}
    >
      <div className="relative overflow-hidden">
        {/* Course Thumbnail */}
        <div className="relative">
          <img
            src={course.media?.thumbnail || '/api/placeholder/400/225'}
            alt={course.title}
            className="w-full h-48 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                <Crown className="w-3 h-3" />
                <span>Featured</span>
              </div>
            </div>
          )}
          
          {/* Source Badge */}
          <div className="absolute top-3 right-3">
            <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
              {getSourceIcon()}
              <span className="capitalize">{course.source}</span>
            </div>
          </div>
          
          {/* Price Badge */}
          <div className="absolute bottom-3 right-3">
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              course.pricing.isFree 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-slate-900'
            }`}>
              {formatPrice()}
            </div>
          </div>
          
          {/* Purchased Overlay */}
          {isPurchased && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="bg-green-500 text-white p-2 rounded-full">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor()}`}>
                {course.level}
              </span>
              
              {/* Rating */}
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                <span className="text-sm font-medium text-slate-700">
                  {course.rating?.average?.toFixed(1) || '0.0'}
                </span>
                <span className="text-xs text-slate-500">
                  ({course.rating?.count || 0})
                </span>
              </div>
            </div>
            
            <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            
            {/* Instructor */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {course.instructor?.name?.charAt(0) || 'I'}
                </span>
              </div>
              <span className="text-sm text-slate-600 truncate">
                {course.instructor?.name || 'Unknown Instructor'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2">
            {course.shortDescription || course.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration()}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{course.enrollment?.totalStudents?.toLocaleString() || '0'}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.content?.totalLectures || 0} lessons</span>
            </div>
          </div>

          {/* Learning Outcomes Preview */}
          {course.content?.learningOutcomes && course.content.learningOutcomes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700">You'll learn:</h4>
              <div className="space-y-1">
                {course.content.learningOutcomes.slice(0, 2).map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-600 line-clamp-1">{outcome}</span>
                  </div>
                ))}
                {course.content.learningOutcomes.length > 2 && (
                  <span className="text-xs text-slate-500">
                    +{course.content.learningOutcomes.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Points Discount Preview */}
          {!course.pricing.isFree && !isPurchased && userPoints > 0 && maxDiscount > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">Points Discount Available</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Original Price:</span>
                  <span className="line-through text-slate-500">${course.pricing.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-purple-700">With {Math.min(userPoints, maxPointsUsable)} points:</span>
                  <span className="text-purple-700">${discountedPrice.toFixed(2)}</span>
                </div>
                <div className="text-xs text-purple-600">
                  Save ${maxDiscount.toFixed(2)} with your points!
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2">
            {isPurchased ? (
              <Button
                variant="success"
                className="flex-1 flex items-center justify-center space-x-2"
                onClick={() => window.location.href = `/my-courses/${course.id}`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Access Course</span>
              </Button>
            ) : course.pricing.isFree ? (
              <Button
                variant="primary"
                className="flex-1 flex items-center justify-center space-x-2"
                onClick={handlePurchaseClick}
              >
                <BookOpen className="w-4 h-4" />
                <span>Enroll Free</span>
              </Button>
            ) : course.source === 'internal' ? (
              <Button
                variant="premium"
                className="flex-1 flex items-center justify-center space-x-2"
                onClick={handlePurchaseClick}
              >
                <Crown className="w-4 h-4" />
                <span>Purchase</span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="flex-1 flex items-center justify-center space-x-2"
                onClick={handleExternalClick}
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Course</span>
              </Button>
            )}
            
            {/* Details Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = `/courses/${course.id}`}
              className="px-3"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        )}
      </div>
    </Card>
  )
}

export default CourseCard