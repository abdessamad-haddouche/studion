/**
 * PATH: src/store/index.js
 * Updated Redux store with subscription slice
 */

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import documentsReducer from './slices/documentsSlice'
import subscriptionReducer from './slices/subscriptionSlice'
import userStatsReducer from './slices/userStatsSlice'
import coursesReducer from './slices/coursesSlice'
import pointsReducer from './slices/pointsSlice'

// Simple UI slice
import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    theme: 'light',
    notifications: []
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    }
  }
})

// Configure store
const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentsReducer,
    subscription: subscriptionReducer,
    userStats: userStatsReducer,
    courses: coursesReducer,
    points: pointsReducer,
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
export const { toggleSidebar, setTheme, addNotification, removeNotification } = uiSlice.actions

// Export store as default
export default store