/**
 * PATH: src/components/courses/CourseList.jsx
 * Course List Component
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { ChevronLeft, ChevronRight, AlertCircle, BookOpen, Sparkles } from 'lucide-react'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'

const CourseList = ({ className = '', featuredFirst = false }) => {
  const courses = useSelector(state => state.courses?.courses || [])
  const isLoading = useSelector(state => state.courses?.isLoading || false)
  const error = useSelector(state => state.courses?.error || null)
  const userPoints = useSelector(state => state.courses?.userPoints || 0)

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-slate-200 animate-pulse">
              <div className="h-48 bg-slate-200 rounded-t-2xl"></div>
              <div className="p-5 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-10 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Failed to load courses</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!courses || courses.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
          <p className="text-slate-600 mb-6">
            Try adjusting your filters or check back later for new courses
          </p>
          
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Suggestions:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="ghost" size="sm">Programming Courses</Button>
              <Button variant="ghost" size="sm">Free Courses</Button>
              <Button variant="ghost" size="sm">Featured Courses</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Simple course grid
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {courses.length.toLocaleString()} courses found
          </h3>
          <p className="text-sm text-slate-600">
            Showing all available courses
          </p>
        </div>
        
        {/* Quick Stats */}
        {userPoints > 0 && (
          <div className="hidden md:flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>{userPoints.toLocaleString()} points available</span>
            </div>
          </div>
        )}
      </div>

      {/* Simple Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course, index) => (
          <div 
            key={course.id || index}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Course Image */}
            <div className="relative">
              <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-slate-400" />
              </div>
              
              {/* Price Badge */}
              <div className="absolute bottom-3 right-3">
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  course.pricing?.isFree 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-slate-900'
                }`}>
                  {course.pricing?.isFree ? 'Free' : `$${course.pricing?.currentPrice?.toFixed(2) || '0.00'}`}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Title & Instructor */}
              <div>
                <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">
                  {course.title || 'Course Title'}
                </h3>
                <p className="text-sm text-slate-600">
                  By {course.instructor?.name || 'Unknown Instructor'}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 line-clamp-2">
                {course.shortDescription || course.description || 'Course description not available.'}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <span>★ {course.rating?.average?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{course.enrollment?.totalStudents?.toLocaleString() || '0'} students</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => alert('Course details coming soon!')}
                >
                  {course.pricing?.isFree ? 'Enroll Free' : 'View Course'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple pagination placeholder */}
      {courses.length > 20 && (
        <div className="flex items-center justify-center space-x-2 pt-8">
          <Button variant="ghost" size="sm" disabled>
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</span>
          
          <Button variant="ghost" size="sm" disabled>
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default CourseList