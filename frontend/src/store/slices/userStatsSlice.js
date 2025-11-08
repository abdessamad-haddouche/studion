/**
 * PATH: src/store/slices/userStatsSlice.js
 * FIXED User Statistics Redux Slice - PROPERLY PARSE BACKEND RESPONSE
 * 
 * ✅ PROBLEM: Backend returns { data: { progress: { quizzesCompleted: 4, bestScore: 90, totalPoints: 76 } } }
 * ✅ SOLUTION: Parse the nested structure correctly
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userAPI } from '../../services/api'

// Fetch user statistics from backend
export const fetchUserStats = createAsyncThunk(
  'userStats/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching user statistics from /users/me/stats...')
      const response = await userAPI.getStats()
      console.log('📊 RAW Backend Response:', response.data)
      
      // ✅ FIXED: Parse the correct structure from your backend
      const backendData = response.data
      
      // Your backend returns: { success: true, message: "...", data: { progress: {...}, overall: {...} } }
      const progressData = backendData.data?.progress || {}
      const overallData = backendData.data?.overall || {}
      
      console.log('📊 Progress Data:', progressData)
      console.log('📊 Overall Data:', overallData)
      
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
      
      console.log('✅ Mapped Stats for Frontend:', mappedStats)
      
      return {
        stats: mappedStats,
        rawBackendData: backendData // Keep original for debugging
      }
      
    } catch (error) {
      console.error('❌ Error fetching user stats:', error)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user stats')
    }
  }
)

export const fetchUserQuizStats = createAsyncThunk(
  'userStats/fetchUserQuizStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching detailed quiz stats...')
      const response = await userAPI.getQuizStats()
      console.log('📊 Quiz stats response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching quiz stats:', error)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz stats')
    }
  }
)

// ✅ FIXED: Update stats after quiz completion with better mapping
export const updateStatsAfterQuiz = createAsyncThunk(
  'userStats/updateStatsAfterQuiz',
  async (quizResult, { getState, dispatch }) => {
    console.log('🎯 Updating stats after quiz:', quizResult)
    
    // Calculate new stats based on quiz result
    const currentStats = getState().userStats.stats
    const newStats = {
      quizzesCompleted: currentStats.quizzesCompleted + 1,
      totalPoints: currentStats.totalPoints + (quizResult.pointsEarned || 0),
      bestScore: Math.max(currentStats.bestScore, quizResult.percentage || 0),
      averageScore: Math.round(
        ((currentStats.averageScore * currentStats.quizzesCompleted) + (quizResult.percentage || 0)) 
        / (currentStats.quizzesCompleted + 1)
      )
    }
    
    console.log('📊 New calculated stats:', newStats)
    return newStats
  }
)

// Refresh stats after quiz completion (fetches from backend)
export const refreshStatsAfterQuiz = createAsyncThunk(
  'userStats/refreshStatsAfterQuiz',
  async (quizResult, { dispatch, rejectWithValue }) => {
    try {
      console.log('🔄 Refreshing stats after quiz completion')
      
      // Wait a moment for backend to process the quiz result
      await new Promise(resolve => setTimeout(resolve, 2000)) // Increased delay
      
      // Fetch fresh stats from backend
      await dispatch(fetchUserStats())
      
      return quizResult
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const userStatsSlice = createSlice({
  name: 'userStats',
  initialState: {
    stats: {
      quizzesCompleted: 0,
      totalPoints: 0,
      bestScore: 0,
      averageScore: 0,
      documentsProcessed: 0,
      timeSpentLearning: 0,
      streakDays: 0,
      achievements: []
    },
    quizStats: null,
    rawBackendData: null, // ✅ ADDED: Store raw backend response for debugging
    isLoading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    updateStatsLocally: (state, action) => {
      console.log('🔄 Updating stats locally:', action.payload)
      const updates = action.payload
      state.stats = { ...state.stats, ...updates }
      state.lastUpdated = Date.now()
    },
    
    clearStatsError: (state) => {
      state.error = null
    },
    
    resetStats: (state) => {
      state.stats = {
        quizzesCompleted: 0,
        totalPoints: 0,
        bestScore: 0,
        averageScore: 0,
        documentsProcessed: 0,
        timeSpentLearning: 0,
        streakDays: 0,
        achievements: []
      }
      state.rawBackendData = null
      state.lastUpdated = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user stats
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoading = false
        
        // ✅ FIXED: Use the properly mapped stats
        const { stats, rawBackendData } = action.payload
        
        state.stats = { ...state.stats, ...stats }
        state.rawBackendData = rawBackendData
        state.lastUpdated = Date.now()
        
        console.log('✅ User stats updated in Redux:', state.stats)
        console.log('📊 Raw backend data stored:', state.rawBackendData)
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Handle quiz stats
      .addCase(fetchUserQuizStats.fulfilled, (state, action) => {
        state.quizStats = action.payload
        console.log('✅ Quiz stats updated:', state.quizStats)
      })
      
      // Handle updateStatsAfterQuiz
      .addCase(updateStatsAfterQuiz.pending, (state) => {
        console.log('🔄 Updating stats after quiz...')
      })
      .addCase(updateStatsAfterQuiz.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...action.payload }
        state.lastUpdated = Date.now()
        console.log('✅ Stats updated after quiz:', state.stats)
      })
      .addCase(updateStatsAfterQuiz.rejected, (state, action) => {
        console.error('❌ Failed to update stats after quiz:', action.error)
      })
      
      // Handle refresh after quiz
      .addCase(refreshStatsAfterQuiz.fulfilled, (state) => {
        console.log('✅ Stats refreshed after quiz completion')
      })
  }
})

export const { updateStatsLocally, clearStatsError, resetStats } = userStatsSlice.actions

// Selectors
export const selectUserStats = (state) => state.userStats
export const selectStats = (state) => state.userStats.stats
export const selectStatsLoading = (state) => state.userStats.isLoading
export const selectRawBackendData = (state) => state.userStats.rawBackendData // ✅ NEW: Debug selector

export default userStatsSlice.reducer