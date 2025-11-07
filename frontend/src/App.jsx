/**
 * PATH: src/App.jsx
 * Complete App with Redux Provider and auth routes
 */

import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'

// Store
import store from './store'
import { checkAuthState } from './store/slices/authSlice'

// Pages
import HomePage from './pages/HomePage'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import Terms from './pages/documents/Terms'
import Points from './pages/profile/PointsPage'
import ForgotPassword from './pages/auth/ForgotPasswordPage'
import PrivacyPolicy from './pages/documents/Privacy'

// Auth checker component
const AuthChecker = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Check if user is already logged in on app start
    dispatch(checkAuthState())
  }, [dispatch])

  return children
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthChecker>
          <div className="App min-h-screen">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
            
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path='/terms' element={<Terms />} /> 
              <Route path='/points' element={<Points />} /> 
              <Route path='/privacy' element={<PrivacyPolicy />} /> 

            </Routes>
          </div>
        </AuthChecker>
      </Router>
    </Provider>
  )
}

export default App