/**
 * PATH: src/store/slices/coursesSlice.js
 * Courses Redux Slice - Complete marketplace state management
 * Follows studion architecture patterns with localStorage integration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import coursesService from '../../services/courses.service'
import { userAPI } from '../../services/api'

// ==========================================
// ASYNC THUNKS
// ==========================================

/**
 * Fetch all courses with filters
 */
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (options = {}, { rejectWithValue }) => {
    try {
      const response = await coursesService.getAllCourses(options)
      return {
        ...response,
        filters: options // Store applied filters
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/**
 * Fetch featured courses
 */
export const fetchFeaturedCourses = createAsyncThunk(
  'courses/fetchFeaturedCourses',
  async (limit = 6, { rejectWithValue }) => {
    try {
      const response = await coursesService.getFeaturedCourses(limit)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/**
 * Fetch course by ID
 */
export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await coursesService.getCourseById(courseId)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/**
 * Fetch courses by category
 */
export const fetchCoursesByCategory = createAsyncThunk(
  'courses/fetchCoursesByCategory',
  async ({ category, filters }, { rejectWithValue }) => {
    try {
      const response = await coursesService.getCoursesByCategory(category, filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/**
 * Calculate course price with points discount
 */
export const calculateCoursePrice = createAsyncThunk(
  'courses/calculateCoursePrice',
  async ({ courseId, pointsToUse }, { rejectWithValue }) => {
    try {
      const response = await coursesService.calculateCoursePrice(courseId, pointsToUse)
      return { courseId, ...response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/**
 * Purchase course (MVP implementation with localStorage)
 */
export const purchaseCourse = createAsyncThunk(
  'courses/purchaseCourse',
  async ({ courseId, pointsToUse = 0 }, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const course = state.courses.courses.find(c => c.id === courseId) || 
                   state.courses.currentCourse
      
      if (!course) {
        throw new Error('Course not found')
      }

      // Calculate final price (simulate backend calculation)
      const maxPointsUsable = course.studion?.pointsDiscount?.maxPointsUsable || 1000
      const pointsRatio = course.studion?.pointsDiscount?.pointsToDiscountRatio || 0.01
      const actualPointsUsed = Math.min(pointsToUse, maxPointsUsable)
      const discount = actualPointsUsed * pointsRatio
      const finalPrice = Math.max(0, course.pricing.currentPrice - discount)

      const purchaseInfo = {
        courseId,
        pointsUsed: actualPointsUsed,
        discount,
        finalPrice,
        originalPrice: course.pricing.currentPrice,
        purchaseDate: new Date().toISOString()
      }

      // Save to localStorage (MVP implementation)
      coursesService.savePurchasedCourseLocal(course, purchaseInfo)

      console.log('🛒 Course purchased successfully:', purchaseInfo)
      return purchaseInfo
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/**
 * Load purchased courses from localStorage
 */
export const loadPurchasedCourses = createAsyncThunk(
  'courses/loadPurchasedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const purchased = coursesService.getPurchasedCoursesLocal()
      return purchased
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/**
 * Fetch user points balance
 */
export const fetchUserPoints = createAsyncThunk(
  'courses/fetchUserPoints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getPointsBalance()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// ==========================================
// COURSES SLICE
// ==========================================

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    // Course data
    courses: [],
    featuredCourses: [],
    currentCourse: null,
    
    // Pagination & filtering
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    },
    
    filters: {
      category: null,
      level: null,
      source: null,
      search: '',
      isFree: null,
      minPrice: null,
      maxPrice: null,
      minRating: null,
      sortBy: 'rating.average',
      sortOrder: 'desc'
    },
    
    // User data
    userPoints: 0,
    purchasedCourses: [],
    
    // UI state
    isLoading: false,
    isLoadingFeatured: false,
    isLoadingCourse: false,
    isPurchasing: false,
    isCalculatingPrice: false,
    
    // Modals & UI
    showPurchaseModal: false,
    selectedCourseForPurchase: null,
    priceCalculation: null,
    
    // Error handling
    error: null,
    purchaseError: null,
    
    // Meta
    lastFetched: null,
    categories: [
      'programming', 'design', 'business', 'marketing', 
      'data_science', 'ai_ml', 'cybersecurity', 'web_development',
      'mobile_development', 'game_development', 'other'
    ],
    levels: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  
  reducers: {
    // ==========================================
    // FILTER MANAGEMENT
    // ==========================================
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      console.log('🔍 Filters updated:', state.filters)
    },
    
    clearFilters: (state) => {
      state.filters = {
        category: null,
        level: null,
        source: null,
        search: '',
        isFree: null,
        minPrice: null,
        maxPrice: null,
        minRating: null,
        sortBy: 'rating.average',
        sortOrder: 'desc'
      }
      console.log('🔄 Filters cleared')
    },
    
    setSearchTerm: (state, action) => {
      state.filters.search = action.payload
    },
    
    setSortOptions: (state, action) => {
      state.filters.sortBy = action.payload.sortBy || state.filters.sortBy
      state.filters.sortOrder = action.payload.sortOrder || state.filters.sortOrder
    },
    
    // ==========================================
    // PAGINATION
    // ==========================================
    
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    
    setPageSize: (state, action) => {
      state.pagination.limit = action.payload
      state.pagination.page = 1 // Reset to first page
    },
    
    // ==========================================
    // COURSE MANAGEMENT
    // ==========================================
    
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload
    },
    
    clearCurrentCourse: (state) => {
      state.currentCourse = null
    },
    
    // ==========================================
    // PURCHASE MODAL
    // ==========================================
    
    showPurchaseModal: (state, action) => {
      state.showPurchaseModal = true
      state.selectedCourseForPurchase = action.payload.course
      state.priceCalculation = null
      state.purchaseError = null
    },
    
    hidePurchaseModal: (state) => {
      state.showPurchaseModal = false
      state.selectedCourseForPurchase = null
      state.priceCalculation = null
      state.purchaseError = null
    },
    
    // ==========================================
    // ERROR HANDLING
    // ==========================================
    
    clearError: (state) => {
      state.error = null
      state.purchaseError = null
    },
    
    clearPurchaseError: (state) => {
      state.purchaseError = null
    },
    
    // ==========================================
    // POINTS MANAGEMENT
    // ==========================================
    
    updateUserPoints: (state, action) => {
      state.userPoints = action.payload
    },
    
    deductPoints: (state, action) => {
      const pointsToDeduct = action.payload
      state.userPoints = Math.max(0, state.userPoints - pointsToDeduct)
      console.log(`💰 Points deducted: ${pointsToDeduct}, remaining: ${state.userPoints}`)
    }
  },
  
  extraReducers: (builder) => {
    builder
      // ==========================================
      // FETCH COURSES
      // ==========================================
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false
        
        const { data, filters } = action.payload
        state.courses = data.courses || data.data || []
        state.pagination = {
          page: data.page || 1,
          limit: data.limit || 20,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }
        
        state.lastFetched = Date.now()
        console.log('✅ Courses loaded:', state.courses.length)
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // ==========================================
      // FETCH FEATURED COURSES
      // ==========================================
      .addCase(fetchFeaturedCourses.pending, (state) => {
        state.isLoadingFeatured = true
      })
      .addCase(fetchFeaturedCourses.fulfilled, (state, action) => {
        state.isLoadingFeatured = false
        state.featuredCourses = action.payload.data || action.payload
        console.log('⭐ Featured courses loaded:', state.featuredCourses.length)
      })
      .addCase(fetchFeaturedCourses.rejected, (state, action) => {
        state.isLoadingFeatured = false
        state.error = action.payload
      })
      
      // ==========================================
      // FETCH COURSE BY ID
      // ==========================================
      .addCase(fetchCourseById.pending, (state) => {
        state.isLoadingCourse = true
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.isLoadingCourse = false
        state.currentCourse = action.payload.data || action.payload
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.isLoadingCourse = false
        state.error = action.payload
      })
      
      // ==========================================
      // CALCULATE PRICE
      // ==========================================
      .addCase(calculateCoursePrice.pending, (state) => {
        state.isCalculatingPrice = true
      })
      .addCase(calculateCoursePrice.fulfilled, (state, action) => {
        state.isCalculatingPrice = false
        state.priceCalculation = action.payload
      })
      .addCase(calculateCoursePrice.rejected, (state, action) => {
        state.isCalculatingPrice = false
        state.purchaseError = action.payload
      })
      
      // ==========================================
      // PURCHASE COURSE
      // ==========================================
      .addCase(purchaseCourse.pending, (state) => {
        state.isPurchasing = true
        state.purchaseError = null
      })
      .addCase(purchaseCourse.fulfilled, (state, action) => {
        state.isPurchasing = false
        
        const purchaseInfo = action.payload
        
        // Add to purchased courses
        const existingIndex = state.purchasedCourses.findIndex(
          p => p.courseId === purchaseInfo.courseId
        )
        
        if (existingIndex !== -1) {
          state.purchasedCourses[existingIndex] = purchaseInfo
        } else {
          state.purchasedCourses.push(purchaseInfo)
        }
        
        // Deduct points
        state.userPoints = Math.max(0, state.userPoints - purchaseInfo.pointsUsed)
        
        // Hide modal
        state.showPurchaseModal = false
        state.selectedCourseForPurchase = null
        
        console.log('🎉 Purchase completed successfully')
      })
      .addCase(purchaseCourse.rejected, (state, action) => {
        state.isPurchasing = false
        state.purchaseError = action.payload
      })
      
      // ==========================================
      // LOAD PURCHASED COURSES
      // ==========================================
      .addCase(loadPurchasedCourses.fulfilled, (state, action) => {
        state.purchasedCourses = action.payload
        console.log('📚 Purchased courses loaded:', state.purchasedCourses.length)
      })
      
      // ==========================================
      // FETCH USER POINTS
      // ==========================================
      .addCase(fetchUserPoints.fulfilled, (state, action) => {
        state.userPoints = action.payload.balance || action.payload.points || 0
        console.log('💰 User points updated:', state.userPoints)
      })
  }
})

// ==========================================
// ACTIONS EXPORT
// ==========================================

export const {
  setFilters,
  clearFilters,
  setSearchTerm,
  setSortOptions,
  setPage,
  setPageSize,
  setCurrentCourse,
  clearCurrentCourse,
  showPurchaseModal: showPurchaseModalAction,
  hidePurchaseModal,
  clearError,
  clearPurchaseError,
  updateUserPoints,
  deductPoints
} = coursesSlice.actions

// ==========================================
// SELECTORS
// ==========================================

export const selectCourses = (state) => state.courses.courses
export const selectFeaturedCourses = (state) => state.courses.featuredCourses
export const selectCurrentCourse = (state) => state.courses.currentCourse
export const selectCoursesLoading = (state) => state.courses.isLoading
export const selectCoursesError = (state) => state.courses.error
export const selectPagination = (state) => state.courses.pagination
export const selectFilters = (state) => state.courses.filters
export const selectUserPoints = (state) => state.courses.userPoints
export const selectPurchasedCourses = (state) => state.courses.purchasedCourses
export const selectPurchaseModal = (state) => ({
  isOpen: state.courses.showPurchaseModal,
  course: state.courses.selectedCourseForPurchase,
  priceCalculation: state.courses.priceCalculation,
  isPurchasing: state.courses.isPurchasing,
  error: state.courses.purchaseError
})

// Advanced selectors
export const selectCoursesWithPurchaseStatus = (state) => {
  const courses = state.courses.courses
  const purchased = state.courses.purchasedCourses
  
  return courses.map(course => ({
    ...course,
    isPurchased: purchased.some(p => p.courseId === course.id),
    purchaseInfo: purchased.find(p => p.courseId === course.id) || null
  }))
}

export const selectCoursesByCategory = (category) => (state) => {
  return state.courses.courses.filter(course => 
    course.category === category
  )
}

export const selectFreeCourses = (state) => {
  return state.courses.courses.filter(course => 
    course.pricing.isFree || course.pricing.currentPrice === 0
  )
}

export const selectCoursesAvailableForPoints = (state) => {
  return state.courses.courses.filter(course =>
    course.studion?.pointsDiscount?.enabled && 
    !course.pricing.isFree &&
    course.pricing.currentPrice > 0
  )
}

export default coursesSlice.reducer