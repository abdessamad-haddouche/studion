/**
 * PATH: src/pages/courses/MyCourses.jsx
 * FIXED - Properly loads user stats so header shows correct points balance
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BookOpen, PlayCircle, CheckCircle } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import { loadPurchasedCourses, selectPurchasedCourses, fetchUserPoints } from '../../store/slices/coursesSlice'
import { fetchUserStats } from '../../store/slices/userStatsSlice'
import enrollmentService from '../../services/enrollment.service'

const MyCourses = () => {
  const dispatch = useDispatch()
  const purchasedCourses = useSelector(selectPurchasedCourses)
  const [enrolledCourses, setEnrolledCourses] = useState([])

  useEffect(() => {
    // ✅ FIXED: Load all required data including user stats for header
    const initializePage = async () => {
      try {
        // Load purchased courses from Redux
        await dispatch(loadPurchasedCourses())
        
        // ✅ FIXED: Fetch user points for header
        await dispatch(fetchUserPoints())
        
        // ✅ FIXED: Fetch user stats for header display
        await dispatch(fetchUserStats())
        
        // Load enrolled courses from localStorage
        const courses = enrollmentService.getEnrolledCourses()
        console.log('📚 Loaded enrolled courses:', courses)
        setEnrolledCourses(courses)
      } catch (error) {
        console.error('Error initializing My Courses page:', error)
      }
    }

    initializePage()
  }, [dispatch])

  // Combine all courses (enrolled + purchased from Redux)
  const allUserCourses = [...enrolledCourses, ...purchasedCourses]

  console.log('📚 Total user courses:', allUserCourses.length)

  if (allUserCourses.length === 0) {
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
                You haven't enrolled in any courses yet. Browse our marketplace to find courses and use your quiz points for discounts!
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
              Continue learning with your enrolled courses ({allUserCourses.length} total)
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
                  <div className="text-2xl font-bold text-slate-900">{allUserCourses.length}</div>
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
                  <div className="text-2xl font-bold text-slate-900">
                    {allUserCourses.filter(course => course.completed).length}
                  </div>
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
                  <div className="text-2xl font-bold text-slate-900">
                    {allUserCourses.filter(course => !course.completed).length}
                  </div>
                  <div className="text-slate-600">In Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allUserCourses.map((course, index) => {
              // Handle the enrolled course data structure
              const enrollmentDate = course.enrolledAt || course.purchaseDate || new Date().toISOString()
              const finalPrice = course.payment?.finalPrice || course.finalPrice || 0
              const pointsUsed = course.payment?.pointsUsed || course.pointsUsed || 0
              const enrollmentType = course.enrollmentType || 'purchased'
              
              return (
                <div key={course.id || index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                  
                  {/* Course Image */}
                  <div className="relative">
                    <img
                      src={course.media?.thumbnail || course.thumbnail || `https://picsum.photos/400/225?random=${index + 1}`}
                      alt={course.title || 'Course'}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Enrollment Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                        enrollmentType === 'free' 
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        <CheckCircle className="w-3 h-3" />
                        <span>{enrollmentType === 'free' ? 'Free' : 'Enrolled'}</span>
                      </div>
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        onClick={() => alert('Course player coming soon!')}
                      >
                        <PlayCircle className="w-8 h-8 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">
                        {course.title || 'Untitled Course'}
                      </h3>
                      <p className="text-sm text-slate-600">
                        By {course.instructor?.name || 'Unknown Instructor'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium text-slate-900">{course.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Enrollment Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Enrolled:</span>
                        <span className="text-slate-900">
                          {new Date(enrollmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {pointsUsed > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Points Used:</span>
                          <span className="text-purple-600 font-semibold">
                            {pointsUsed.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-slate-600">Price Paid:</span>
                        <span className="text-slate-900 font-semibold">
                          {finalPrice === 0 ? 'FREE' : `${finalPrice.toFixed(2)} MAD`}
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
                        onClick={() => window.location.href = `/courses/${course.id}`}
                      >
                        View Course Details
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MyCourses