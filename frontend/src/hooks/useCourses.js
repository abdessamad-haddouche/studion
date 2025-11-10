/**
 * PATH: src/hooks/useCourses.js
 * Custom hook for courses functionality
 */

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchCourses,
  fetchFeaturedCourses,
  fetchCourseById,
  fetchUserPoints,
  loadPurchasedCourses,
  purchaseCourse,
  calculateCoursePrice,
  setFilters,
  clearFilters,
  setPage,
  selectCourses,
  selectFeaturedCourses,
  selectCurrentCourse,
  selectCoursesLoading,
  selectCoursesError,
  selectPagination,
  selectFilters,
  selectUserPoints,
  selectPurchasedCourses,
  selectCoursesWithPurchaseStatus,
  selectPurchaseModal
} from '../store/slices/coursesSlice'

export const useCourses = (options = {}) => {
  const dispatch = useDispatch()
  
  // Selectors
  const courses = useSelector(selectCourses)
  const coursesWithPurchaseStatus = useSelector(selectCoursesWithPurchaseStatus)
  const featuredCourses = useSelector(selectFeaturedCourses)
  const currentCourse = useSelector(selectCurrentCourse)
  const isLoading = useSelector(selectCoursesLoading)
  const error = useSelector(selectCoursesError)
  const pagination = useSelector(selectPagination)
  const filters = useSelector(selectFilters)
  const userPoints = useSelector(selectUserPoints)
  const purchasedCourses = useSelector(selectPurchasedCourses)
  const purchaseModal = useSelector(selectPurchaseModal)

  // Auto-fetch on mount if requested
  useEffect(() => {
    if (options.fetchOnMount !== false) {
      dispatch(fetchCourses(options.initialFilters || {}))
      dispatch(fetchUserPoints())
      dispatch(loadPurchasedCourses())
    }

    if (options.fetchFeatured) {
      dispatch(fetchFeaturedCourses(options.featuredLimit || 6))
    }
  }, [dispatch, options.fetchOnMount, options.fetchFeatured])

  // Actions
  const actions = {
    fetchCourses: (filters) => dispatch(fetchCourses(filters)),
    fetchFeaturedCourses: (limit) => dispatch(fetchFeaturedCourses(limit)),
    fetchCourseById: (id) => dispatch(fetchCourseById(id)),
    fetchUserPoints: () => dispatch(fetchUserPoints()),
    loadPurchasedCourses: () => dispatch(loadPurchasedCourses()),
    
    // Purchase actions
    purchaseCourse: (data) => dispatch(purchaseCourse(data)),
    calculateCoursePrice: (data) => dispatch(calculateCoursePrice(data)),
    
    // Filter actions
    setFilters: (filters) => dispatch(setFilters(filters)),
    clearFilters: () => dispatch(clearFilters()),
    setPage: (page) => dispatch(setPage(page))
  }

  // Utility functions
  const utils = {
    getCourseById: (id) => courses.find(course => course.id === id),
    isPurchased: (courseId) => purchasedCourses.some(p => p.courseId === courseId),
    canAffordCourse: (course, pointsToUse = 0) => {
      if (course.pricing.isFree) return true
      
      const maxPointsUsable = course.studion?.pointsDiscount?.maxPointsUsable || 1000
      const pointsRatio = course.studion?.pointsDiscount?.pointsToDiscountRatio || 0.01
      const actualPoints = Math.min(pointsToUse, Math.min(userPoints, maxPointsUsable))
      const discount = actualPoints * pointsRatio
      const finalPrice = Math.max(0, course.pricing.currentPrice - discount)
      
      return finalPrice === 0 || userPoints >= actualPoints
    },
    calculateDiscount: (course, pointsToUse = 0) => {
      const maxPointsUsable = course.studion?.pointsDiscount?.maxPointsUsable || 1000
      const pointsRatio = course.studion?.pointsDiscount?.pointsToDiscountRatio || 0.01
      const actualPoints = Math.min(pointsToUse, Math.min(userPoints, maxPointsUsable))
      const discount = actualPoints * pointsRatio
      const finalPrice = Math.max(0, course.pricing.currentPrice - discount)
      
      return { discount, finalPrice, actualPoints }
    }
  }

  return {
    // Data
    courses,
    coursesWithPurchaseStatus,
    featuredCourses,
    currentCourse,
    userPoints,
    purchasedCourses,
    
    // State
    isLoading,
    error,
    pagination,
    filters,
    purchaseModal,
    
    // Actions
    ...actions,
    
    // Utils
    ...utils
  }
}

export const useCourseDetails = (courseId) => {
  const dispatch = useDispatch()
  const course = useSelector(selectCurrentCourse)
  const isLoading = useSelector(selectCoursesLoading)
  const error = useSelector(selectCoursesError)

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId))
    }
  }, [dispatch, courseId])

  return {
    course,
    isLoading,
    error,
    refetch: () => dispatch(fetchCourseById(courseId))
  }
}

export const usePurchaseFlow = () => {
  const dispatch = useDispatch()
  const purchaseModal = useSelector(selectPurchaseModal)
  const userPoints = useSelector(selectUserPoints)

  const startPurchase = (course) => {
    dispatch(showPurchaseModalAction({ course }))
  }

  const completePurchase = async (courseId, pointsToUse = 0) => {
    try {
      await dispatch(purchaseCourse({ courseId, pointsToUse })).unwrap()
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  const calculatePrice = async (courseId, pointsToUse = 0) => {
    try {
      const result = await dispatch(calculateCoursePrice({ courseId, pointsToUse })).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }

  return {
    purchaseModal,
    userPoints,
    startPurchase,
    completePurchase,
    calculatePrice
  }
}

export default useCourses