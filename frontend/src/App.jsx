/**
 * PATH: src/App.jsx
 * UPDATED App Component with Courses Routes
 * 
 * ✅ ADDED:
 * - Courses marketplace routes
 * - Course details routes
 * - My courses page
 * - Public courses browsing
 */

import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { useDispatch, useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'

// Store
import store from './store'
import { checkAuthState, selectIsAuthenticated } from './store/slices/authSlice'

// Pages
import HomePage from './pages/HomePage'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import DocumentsPage from './pages/documents/DocumentsPage'
import PlansPage from './pages/subscription/PlansPage'
import Terms from './pages/documents/Terms'
import Points from './pages/profile/PointsPage'
import ForgotPassword from './pages/auth/ForgotPasswordPage'

// ✅ ADD COURSES PAGES
import CoursesPage from './pages/courses/CoursesPage'
import CourseDetailsPage from './pages/courses/CourseDetailsPage'
import MyCourses from './pages/courses/MyCourses'

// Quiz components
import QuizInterface from './components/quiz/taking/QuizInterface'
import QuizResults from './components/quiz/results/QuizResults'

// ✅ KEEP YOUR PROTECTED ROUTE LOGIC (better security)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Auth checker component
const AuthChecker = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(checkAuthState())
  }, [dispatch])

  return children
}

// Main App Component
const AppContent = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    console.log('🚀 App initialized, authentication status:', isAuthenticated)
  }, [isAuthenticated])

  return (
    <div className="App min-h-screen">
      <Routes>
        {/* ✅ PUBLIC ROUTES */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />

        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />

        {/* ✅ PUBLIC PAGES (accessible to all) */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/pricing" element={<PlansPage />} />
        <Route path="/plans" element={<PlansPage />} />

        {/* ✅ NEW: PUBLIC COURSES ROUTES */}
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/courses/featured" element={<CoursesPage />} />
        <Route path="/courses/category/:category" element={<CoursesPage />} />

        {/* ✅ PROTECTED ROUTES */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        {/* ✅ DOCUMENTS PAGE */}
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          } 
        />

        {/* ✅ NEW: PROTECTED COURSES ROUTES */}
        <Route 
          path="/my-courses" 
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/my-courses/:id" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900 mb-4">Course Player Coming Soon</h1>
                  <p className="text-slate-600">Course viewing interface is under development.</p>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* ✅ QUIZ ROUTES */}
        <Route 
          path="/quiz/:quizId" 
          element={
            <ProtectedRoute>
              <QuizInterface />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/quiz/:quizId/results/:attemptId" 
          element={
            <ProtectedRoute>
              <QuizResults />
            </ProtectedRoute>
          } 
        />

        {/* ✅ OTHER PROTECTED ROUTES */}
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute>
              <PlansPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/points" 
          element={
            <ProtectedRoute>
              <Points />
            </ProtectedRoute>
          } 
        />

        {/* ✅ FUTURE ROUTES */}
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900 mb-4">Analytics Coming Soon</h1>
                  <p className="text-slate-600">Advanced analytics dashboard is under development.</p>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/help/*" 
          element={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Help Center</h1>
                <p className="text-slate-600">Documentation and tutorials coming soon.</p>
              </div>
            </div>
          } 
        />

        {/* ✅ 404 CATCH-ALL */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">404 - Page Not Found</h1>
                <p className="text-slate-600 mb-4">The page you're looking for doesn't exist.</p>
                <button
                  onClick={() => window.history.back()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  )
}

// ✅ MAIN APP WITH PROVIDER
function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthChecker>
          <AppContent />
          
          {/* ✅ TOAST NOTIFICATIONS */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
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
        </AuthChecker>
      </Router>
    </Provider>
  )
}

export default App