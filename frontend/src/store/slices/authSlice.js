/**
 * PATH: src/store/slices/authSlice.js
 * Enhanced Auth Slice with Token Management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'

// Async thunks for auth actions
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      
      // Store token in localStorage
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken)
      }
      
      return response.data
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

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('accessToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
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
    setUser: (state, action) => {
      state.user = action.payload
    },
    resetAuth: (state) => {
      state.user = null
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
        state.isLoading = false
        state.isAuthenticated = true
        state.token = action.payload.accessToken
        state.user = action.payload.user
        state.loginSuccess = true
        state.error = null
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
  }
})

export const { clearError, clearSuccess, setUser, resetAuth } = authSlice.actions

// Selectors
export const selectAuth = (state) => state.auth
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectUser = (state) => state.auth.user
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer