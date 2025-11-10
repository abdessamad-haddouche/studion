/**
 * PATH: src/pages/courses/MyCourses.jsx
 * My Courses Page - User's purchased courses
 */

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BookOpen, PlayCircle, CheckCircle } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import { loadPurchasedCourses, selectPurchasedCourses } from '../../store/slices/coursesSlice'
import coursesService from '../../services/courses.service'

const MyCourses = () => {
  const dispatch = useDispatch()
  const purchasedCourses = useSelector(selectPurchasedCourses)

  useEffect(() => {
    dispatch(loadPurchasedCourses())
  }, [dispatch])

  // Get purchased courses from localStorage
  const localPurchased = coursesService.getPurchasedCoursesLocal()

  const coursesToShow = localPurchased.length > 0 ? localPurchased : purchasedCourses

  if (coursesToShow.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-slate-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">No Courses Yet</h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                You haven't purchased any courses yet. Browse our marketplace to find courses and use your quiz points for discounts!
              </p>
              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => window.location.href = '/courses'}
                  className="mr-4"
                >
                  Browse Courses
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Take Quizzes to Earn Points
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Courses</h1>
            <p className="text-slate-600">
              Continue learning with your purchased courses
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{coursesToShow.length}</div>
                  <div className="text-slate-600">Total Courses</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">0</div>
                  <div className="text-slate-600">Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{coursesToShow.length}</div>
                  <div className="text-slate-600">In Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesToShow.map((purchase, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                
                {/* Course Image */}
                <div className="relative">
                  <img
                    src={purchase.course?.media?.thumbnail || '/api/placeholder/400/225'}
                    alt={purchase.course?.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Purchase Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Purchased</span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </button>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">
                      {purchase.course?.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      By {purchase.course?.instructor?.name}
                    </p>
                  </div>

                  {/* Purchase Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Purchased:</span>
                      <span className="text-slate-900">
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {purchase.pointsUsed > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Points Used:</span>
                        <span className="text-purple-600 font-semibold">
                          {purchase.pointsUsed.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Final Price:</span>
                      <span className="text-slate-900 font-semibold">
                        ${purchase.finalPrice?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      className="w-full flex items-center justify-center space-x-2"
                      onClick={() => alert('Course player coming soon!')}
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Continue Learning</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => window.location.href = `/courses/${purchase.course?.id}`}
                    >
                      View Course Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MyCourses