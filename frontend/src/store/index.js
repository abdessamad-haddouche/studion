/**
 * PATH: src/store/index.js
 * Updated Redux store with enhanced auth
 */

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'

// Simple UI slice
import { createSlice } from '@reduxjs/toolkit'

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

// Configure store
const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiSlice.reducer
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
})

// Export UI actions
export const { toggleSidebar, setTheme } = uiSlice.actions

// Export store as default
export default store