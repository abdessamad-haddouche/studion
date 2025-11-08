/**
 * PATH: src/store/slices/authSlice.js
 * FIXED Auth Slice with Proper Backend Response Parsing - FULL CODE
 * 
 * ✅ PROBLEM: Backend returns nested structure but authSlice wasn't parsing it correctly
 * ✅ SOLUTION: Parse the { data: { progress: {...}, overall: {...} } } structure properly
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI, userAPI } from '../../services/api'

// Async thunks for auth actions
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      
      // ✅ FIXED: Store token from correct path
      if (response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken)
        console.log('🔥 TOKEN SAVED TO LOCALSTORAGE:', response.data.data.accessToken.substring(0, 20) + '...')
      }
      
      return response.data // This goes to action.payload
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      return rejectWithValue(message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      return rejectWithValue(message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout()
      localStorage.removeItem('accessToken')
      return true
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('accessToken')
      return true
    }
  }
)

// Check if user is already logged in (from localStorage)
export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        return rejectWithValue('No token found')
      }
      
      // Verify token with backend (you'll need this endpoint)
      // const response = await authAPI.verifyToken()
      // return response.data
      
      // For now, just return that we have a token
      return { token, user: null }
    } catch (error) {
      localStorage.removeItem('accessToken')
      return rejectWithValue('Token invalid')
    }
  }
)

// ✅ FIXED: Fetch user stats with proper parsing
export const fetchUserStats = createAsyncThunk(
  'auth/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 AuthSlice: Fetching user statistics...')
      const response = await userAPI.getStats()
      console.log('📊 AuthSlice: RAW Backend Response:', response.data)
      
      // ✅ FIXED: Parse the correct structure from your backend
      const backendData = response.data
      
      // Your backend returns: { success: true, message: "...", data: { progress: {...}, overall: {...} } }
      const progressData = backendData.data?.progress || {}
      const overallData = backendData.data?.overall || {}
      
      console.log('📊 AuthSlice: Progress Data:', progressData)
      console.log('📊 AuthSlice: Overall Data:', overallData)
      
      // ✅ FIXED: Map backend fields to frontend structure
      const mappedStats = {
        quizzesCompleted: progressData.quizzesCompleted || 0,
        totalPoints: overallData.totalPoints || progressData.totalPoints || 0,
        bestScore: progressData.bestScore || 0,
        averageScore: progressData.averageScore || 0,
        documentsProcessed: progressData.documentsUploaded || 0,
        timeSpentLearning: 0,
        streakDays: overallData.currentStreak || 0,
        achievements: overallData.achievements || []
      }
      
      console.log('✅ AuthSlice: Mapped Stats for Frontend:', mappedStats)
      
      return {
        data: mappedStats,
        rawBackendData: backendData
      }
      
    } catch (error) {
      console.error('❌ AuthSlice: Error fetching user stats:', error)
      const message = error.response?.data?.message || 'Failed to fetch user stats'
      return rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    userStats: null, // ✅ Store parsed user stats here
    rawStatsData: null, // ✅ Store raw backend data for debugging
    token: localStorage.getItem('accessToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    isLoadingStats: false,
    error: null,
    loginSuccess: false,
    registerSuccess: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.loginSuccess = false
      state.registerSuccess = false
    },
    clearUserStats: (state) => {
      state.userStats = null
      state.rawStatsData = null
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
    resetAuth: (state) => {
      state.user = null
      state.userStats = null
      state.rawStatsData = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.loginSuccess = false
      state.registerSuccess = false
      localStorage.removeItem('accessToken')
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('🔥 LOGIN RESPONSE:', action.payload) // Debug
        
        state.isLoading = false
        state.isAuthenticated = true
        
        // ✅ FIXED: Access token from correct path
        state.token = action.payload.data.accessToken  // ← Changed this line
        state.user = action.payload.data.user           // ← Changed this line
        
        state.loginSuccess = true
        state.error = null
        
        console.log('🔥 TOKEN STORED:', state.token) // Debug
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.token = null
        state.user = null
        state.error = action.payload
        state.loginSuccess = false
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.registerSuccess = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.registerSuccess = false
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.userStats = null
        state.rawStatsData = null
        state.token = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
      
      // Check auth state cases
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(checkAuthState.rejected, (state) => {
        state.token = null
        state.user = null
        state.isAuthenticated = false
      })

      // ✅ FIXED: User stats cases with proper parsing
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoadingStats = true
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoadingStats = false
        
        // ✅ FIXED: Use the properly mapped stats
        const { data: mappedStats, rawBackendData } = action.payload
        
        state.userStats = mappedStats
        state.rawStatsData = rawBackendData
        
        // Merge stats into user object for Welcome Header compatibility
        if (state.user && mappedStats) {
          state.user.progress = mappedStats
          state.user.analytics = mappedStats
        }
        
        console.log('✅ AuthSlice: User stats updated:', state.userStats)
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoadingStats = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearSuccess, setUser, resetAuth, clearUserStats } = authSlice.actions

// Selectors
export const selectAuth = (state) => state.auth
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectUser = (state) => state.auth.user
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error

// ✅ FIXED: User stats selectors
export const selectUserStats = (state) => state.auth.userStats
export const selectStatsLoading = (state) => state.auth.isLoadingStats
export const selectRawStatsData = (state) => state.auth.rawStatsData // ✅ NEW: Debug selector

export default authSlice.reducer