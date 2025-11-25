/**
 * PATH: src/store/slices/pointsSlice.js
 * Redux slice for managing user points state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import pointsService from '../../services/points.service'

// Async thunk for fetching user points
export const fetchUserPoints = createAsyncThunk(
  'points/fetchUserPoints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pointsService.getUserPoints()
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addUserPoints = createAsyncThunk(
  'points/addUserPoints',
  async ({ amount, reason = 'Testing points' }, { rejectWithValue }) => {
    try {
      const response = await pointsService.addPoints(amount, reason)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk for deducting points
export const deductUserPoints = createAsyncThunk(
  'points/deductUserPoints',
  async ({ amount, reason }, { rejectWithValue }) => {
    try {
      const response = await pointsService.deductPoints(amount, reason)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const pointsSlice = createSlice({
  name: 'points',
  initialState: {
    balance: 0,
    totalEarned: 0,
    totalUsed: 0,
    loading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    clearPointsError: (state) => {
      state.error = null
    },
    updatePointsBalance: (state, action) => {
      state.balance = action.payload
      state.lastUpdated = new Date().toISOString()
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user points
      .addCase(fetchUserPoints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserPoints.fulfilled, (state, action) => {
        state.loading = false
        state.balance = action.payload?.available || 0
        state.totalEarned = action.payload?.totalEarned || 0
        state.totalUsed = action.payload?.totalUsed || 0
        state.lastUpdated = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchUserPoints.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Deduct points
      .addCase(deductUserPoints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deductUserPoints.fulfilled, (state, action) => {
        state.loading = false
        state.balance = action.payload?.newTotal || state.balance
        state.totalUsed = (state.totalUsed || 0) + (action.payload?.pointsDeducted || 0)
        state.lastUpdated = new Date().toISOString()
        state.error = null
      })
      .addCase(deductUserPoints.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add to extraReducers:
      .addCase(addUserPoints.fulfilled, (state, action) => {
        state.loading = false
        state.balance = action.payload?.newTotal || state.balance
        state.totalEarned = (state.totalEarned || 0) + (action.payload?.pointsAdded || 0)
        state.lastUpdated = new Date().toISOString()
        state.error = null
      })
  }
})

export const { clearPointsError, updatePointsBalance } = pointsSlice.actions
export default pointsSlice.reducer