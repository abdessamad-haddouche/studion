/**
 * Placeholder Redux Slices
 * @description Minimal slices to get the store working
 */

import { createSlice } from '@reduxjs/toolkit'

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    }
  }
})

// Documents Slice
const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    loading: false,
    error: null
  },
  reducers: {
    setDocuments: (state, action) => {
      state.documents = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  }
})

// Quizzes Slice
const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState: {
    quizzes: [],
    loading: false,
    error: null
  },
  reducers: {
    setQuizzes: (state, action) => {
      state.quizzes = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  }
})

// UI Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    theme: 'light'
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    }
  }
})

export { authSlice, documentsSlice, quizzesSlice, uiSlice }
export default authSlice.reducer