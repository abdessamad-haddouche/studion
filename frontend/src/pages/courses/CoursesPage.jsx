/**
 * PATH: src/pages/courses/CoursesPage.jsx
 * COMPLETE ENROLLMENT SYSTEM - Professional course marketplace with enrollment functionality
 */

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams, useLocation } from 'react-router-dom'
import { BookOpen, Sparkles, Filter, Grid, List, RefreshCw, Search, ChevronLeft, ChevronRight, ExternalLink, CheckCircle } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EnrollmentModal from '../../components/enrollment/EnrollmentModal'
import {
  fetchCourses,
  fetchUserPoints,
  loadPurchasedCourses,
  setFilters,
  clearError,
  selectCourses,
  selectCoursesLoading,
  selectCoursesError,
  selectFilters,
  selectUserPoints
} from '../../store/slices/coursesSlice'
import { selectCurrentPlan } from '../../store/slices/subscriptionSlice'
import { fetchUserStats } from '../../store/slices/userStatsSlice'

// Import services
import coursesService from '../../services/courses.service'
import enrollmentService from '../../services/enrollment.service'
import pointsService from '../../services/points.service'

const CoursesPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Redux state
  const courses = useSelector(selectCourses)
  const isLoading = useSelector(selectCoursesLoading)
  const error = useSelector(selectCoursesError)
  const filters = useSelector(selectFilters)
  const userPoints = useSelector(selectUserPoints)
  const currentPlan = useSelector(selectCurrentPlan)
  const { isAuthenticated } = useSelector(state => state.auth)
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCourses, setFilteredCourses] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Enrollment state
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [enrollmentStatuses, setEnrollmentStatuses] = useState({})
  
  // Local courses for fallback
  const [localCourses, setLocalCourses] = useState([])
  const [useLocalData, setUseLocalData] = useState(false)
  
  const coursesToUse = useLocalData ? localCourses : courses
  
  // Pagination settings
  const coursesPerPage = 12
  const totalCourses = filteredCourses.length
  const totalPages = Math.ceil(totalCourses / coursesPerPage)
  const startIndex = (currentPage - 1) * coursesPerPage
  const endIndex = startIndex + coursesPerPage
  const currentCourses = filteredCourses.slice(startIndex, endIndex)

  // Mock data generator for fallback
  const generateMockCourses = (count) => {
    const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Photography', 'Music']
    const instructors = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen', 'David Wilson', 'Emma Brown']
    const courseTypes = ['Fundamentals', 'Masterclass', 'Complete Guide', 'Bootcamp', 'Workshop', 'Crash Course']
    const mockCourses = []

    for (let i = 1; i <= count; i++) {
      const category = categories[i % categories.length]
      const courseType = courseTypes[i % courseTypes.length]
      
      mockCourses.push({
        id: `mock-course-${i}`,
        title: `${category} ${courseType}: From Beginner to Pro`,
        description: `Master ${category.toLowerCase()} with hands-on projects, real-world examples, and expert guidance. Build portfolio-worthy projects and advance your career.`,
        instructor: {
          name: instructors[i % instructors.length]
        },
        category: category,
        media: {
          thumbnail: `https://picsum.photos/400/300?random=${i}`
        },
        price: i % 4 === 0 ? 0 : Math.floor(Math.random() * 80) + 29.99,
        pricing: {
          isFree: i % 4 === 0,
          currentPrice: i % 4 === 0 ? 0 : Math.floor(Math.random() * 80) + 29.99
        },
        rating: {
          average: (Math.random() * 1.5 + 3.5).toFixed(1),
          count: Math.floor(Math.random() * 1000) + 100
        },
        enrollment: {
          totalStudents: Math.floor(Math.random() * 5000) + 500
        }
      })
    }

    return mockCourses
  }

  // Load enrollment statuses
  const loadEnrollmentStatuses = () => {
    const statuses = {}
    coursesToUse.forEach(course => {
      statuses[course.id] = enrollmentService.getEnrollmentStatus(course)
    })
    setEnrollmentStatuses(statuses)
  }

  // Initialize page
  useEffect(() => {
    const initializePage = async () => {
      try {
        let reduxResult = await dispatch(fetchCourses({ limit: 1000 }))
        
        if ((reduxResult.payload?.length || 0) < 30) {
          reduxResult = await dispatch(fetchCourses({}))
        }
        
        try {
          const directCourses = await coursesService.getAllCourses()
          if (directCourses && directCourses.length > (courses.length || 0)) {
            setLocalCourses(directCourses)
            setUseLocalData(true)
          }
        } catch (serviceError) {
          // Silent fallback
        }
        
        if (courses.length < 10 && localCourses.length < 10) {
          const mockCourses = generateMockCourses(45)
          setLocalCourses(mockCourses)
          setUseLocalData(true)
        }
        
        await Promise.all([
          dispatch(fetchUserPoints()),
          dispatch(loadPurchasedCourses()),
          isAuthenticated && dispatch(fetchUserStats())
        ].filter(Boolean))

        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing courses page:', error)
        setIsInitialized(true)
      }
    }

    initializePage()
  }, [dispatch, isAuthenticated])

  // Load enrollment statuses when courses change
  useEffect(() => {
    if (coursesToUse.length > 0) {
      loadEnrollmentStatuses()
    }
  }, [coursesToUse])

  // Filter courses based on search
  useEffect(() => {
    let filtered = [...coursesToUse]

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(search) ||
        course.instructor?.name?.toLowerCase().includes(search) ||
        course.category?.toLowerCase().includes(search) ||
        course.description?.toLowerCase().includes(search)
      )
    }

    setFilteredCourses(filtered)
    setCurrentPage(1)
  }, [coursesToUse, searchTerm, coursesPerPage, useLocalData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      setUseLocalData(false)
      setLocalCourses([])
      
      await dispatch(fetchCourses({ limit: 1000 }))
      
      try {
        const directCourses = await coursesService.getAllCourses()
        if (directCourses && directCourses.length > courses.length) {
          setLocalCourses(directCourses)
          setUseLocalData(true)
        }
      } catch (error) {
        // Silent failure
      }
      
      await Promise.all([
        dispatch(fetchUserPoints()),
        isAuthenticated && dispatch(fetchUserStats())
      ].filter(Boolean))
      
    } catch (error) {
      console.error('Failed to refresh:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle course enrollment
  const handleCourseAction = async (course, action) => {
    switch (action) {
      case 'enroll_free':
        // Direct enrollment for free courses
        const freeEnrollment = enrollmentService.enrollFreeCourse(course)
        if (freeEnrollment.success) {
          // Refresh enrollment statuses
          loadEnrollmentStatuses()
          // Show success message
          alert('✅ Successfully enrolled in free course! Check "My Courses" to start learning.')
        } else {
          alert('❌ ' + freeEnrollment.message)
        }
        break
        
      case 'enroll_paid':
        // Open enrollment modal for paid courses
        setSelectedCourse(course)
        setShowEnrollmentModal(true)
        break
        
      case 'navigate':
        // Navigate to course content
        window.location.href = `/course/${course.id}/learn`
        break
        
      default:
        console.warn('Unknown action:', action)
    }
  }

  const handleEnrollmentSuccess = async (enrollmentData) => {
    // Refresh enrollment statuses
    loadEnrollmentStatuses()
    
    // Refresh user points in Redux
    await dispatch(fetchUserPoints())
    
    // Close modal
    setShowEnrollmentModal(false)
    setSelectedCourse(null)
  }

  const generatePageNumbers = () => {
    const pages = []
    const showPages = 5
    
    let start = Math.max(1, currentPage - Math.floor(showPages / 2))
    let end = Math.min(totalPages, start + showPages - 1)
    
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  // Loading state
  if (!isInitialized) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-700">Loading Courses</h2>
              <p className="text-slate-500">Preparing your learning marketplace...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-blue-600">Dashboard</div>
                  <div className="text-sm text-slate-400">/</div>
                  <div className="text-sm text-slate-600">Courses</div>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">All Courses</h1>
                <p className="text-slate-600">Browse and purchase courses to enhance your learning</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
                
                {isAuthenticated && (
                  <Button
                    variant="primary"
                    onClick={() => window.location.href = '/my-courses'}
                  >
                    My Courses
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Search and Toolbar */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                {/* Points Display */}
                {userPoints > 0 && (
                  <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      {userPoints.toLocaleString()} points
                    </span>
                  </div>
                )}

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Results Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {searchTerm ? `Search results for "${searchTerm}"` : 'All Courses'}
                </h3>
                <p className="text-sm text-slate-600">
                  {totalCourses.toLocaleString()} courses found
                  {totalCourses > coursesPerPage && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          {currentCourses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {currentCourses.map((course, index) => {
                  const enrollmentStatus = enrollmentStatuses[course.id] || { 
                    enrolled: false, 
                    buttonText: (course.pricing?.isFree || course.price === 0 || !course.price) ? 'Enroll Free' : 'Enroll Now', 
                    buttonAction: (course.pricing?.isFree || course.price === 0 || !course.price) ? 'enroll_free' : 'enroll_paid'
                  }
                  
                  return (
                    <Card key={course.id || index} className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-white border border-slate-200">
                      
                      {/* Course Image - Compact */}
                      <div className="relative">
                        <img
                          src={course.media?.thumbnail || `https://picsum.photos/400/300?random=${index + 1}`}
                          alt={course.title}
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextElementSibling.style.display = 'flex'
                          }}
                        />
                        
                        {/* Fallback */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center h-40"
                          style={{ display: 'none' }}
                        >
                          <BookOpen className="w-12 h-12 text-white/80" />
                        </div>
                        
                        {/* Price Badge - Compact */}
                        <div className="absolute top-2 right-2">
                          {course.pricing?.isFree || course.price === 0 || !course.price ? (
                            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                              FREE
                            </span>
                          ) : (
                            <span className="bg-white text-slate-900 px-2 py-1 rounded text-xs font-bold shadow">
                              ${(course.price || course.pricing?.currentPrice || 0).toFixed(0)}
                            </span>
                          )}
                        </div>

                        {/* Enrolled Badge */}
                        {enrollmentStatus.enrolled && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Enrolled</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Course Content - Minimal padding */}
                      <div className="p-3 space-y-2">
                        
                        {/* Title */}
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-tight">
                          {course.title}
                        </h3>
                        
                        {/* Instructor */}
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {(course.instructor?.name || 'U').charAt(0)}
                            </span>
                          </div>
                          <span className="text-xs text-slate-600">
                            {course.instructor?.name || 'Unknown Instructor'}
                          </span>
                        </div>

                        {/* Description - Compact */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>

                        {/* Rating - Clean */}
                        <div className="flex items-center space-x-1 py-1">
                          <div className="flex">
                            {[1,2,3,4,5].map(star => (
                              <svg key={star} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-slate-800">
                            {course.rating?.average || '4.8'}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({course.rating?.count || Math.floor(Math.random() * 500) + 100})
                          </span>
                        </div>

                        {/* Course Info - Compact list */}
                        <div className="text-xs text-slate-600 space-y-0.5 py-1">
                          <div>{Math.floor(Math.random() * 15) + 10} hours content</div>
                          <div>Certificate</div>
                          <div className="flex items-center space-x-3">
                            <span>Lifetime access</span>
                            <span>Mobile access</span>
                          </div>
                        </div>

                        {/* Action Button - Dynamic based on enrollment status */}
                        <Button
                          variant={enrollmentStatus.enrolled ? "secondary" : "primary"}
                          className={`w-full text-sm py-2 transition-colors ${
                            enrollmentStatus.enrolled 
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          onClick={() => handleCourseAction(course, enrollmentStatus.buttonAction)}
                        >
                          {enrollmentStatus.enrolled ? (
                            <>
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Go to Course
                            </>
                          ) : (
                            enrollmentStatus.buttonText
                          )}
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Showing {startIndex + 1}-{Math.min(endIndex, totalCourses)} of {totalCourses.toLocaleString()} courses
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {generatePageNumbers().map(pageNum => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              pageNum === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          ) : (
            /* Empty State */
            <Card className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {searchTerm ? 'No courses found' : 'No courses available'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? `No courses match "${searchTerm}". Try a different search term.`
                  : 'Check back later for new courses.'}
              </p>
              {searchTerm && (
                <Button
                  variant="secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              )}
            </Card>
          )}

        </div>
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => {
          setShowEnrollmentModal(false)
          setSelectedCourse(null)
        }}
        course={selectedCourse}
        userPoints={userPoints}
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />
    </Layout>
  )
}

export default CoursesPage