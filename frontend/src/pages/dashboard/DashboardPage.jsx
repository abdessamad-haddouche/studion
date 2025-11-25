/**
 * PATH: src/pages/dashboard/DashboardPage.jsx
 */

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import ModularDashboard from '../../components/dashboard/ModularDashboard'
import { fetchUserStats } from '../../store/slices/userStatsSlice'
import { fetchUserDocuments } from '../../store/slices/documentsSlice'

const DashboardPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      console.log('📊 DashboardPage: User navigated to dashboard, refreshing data...')
      
      // Refresh user stats
      dispatch(fetchUserStats())
      
      // Refresh documents (to get latest count)
      dispatch(fetchUserDocuments({ limit: 1000 }))
    }
  }, [dispatch, isAuthenticated, location.pathname])

  useEffect(() => {
    const handleWindowFocus = () => {
      if (isAuthenticated && document.location.pathname === '/dashboard') {
        console.log('📊 DashboardPage: Window focused on dashboard, refreshing data...')
        
        // Small delay to ensure any background processing is complete
        setTimeout(() => {
          dispatch(fetchUserStats())
        }, 500)
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && document.location.pathname === '/dashboard') {
        console.log('📊 DashboardPage: Page became visible on dashboard, refreshing data...')
        
        setTimeout(() => {
          dispatch(fetchUserStats())
        }, 500)
      }
    }

    // Add event listeners
    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup event listeners
    return () => {
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'quiz_completed' && e.newValue) {
        console.log('📊 DashboardPage: Quiz completion detected via localStorage, refreshing stats...')
        
        // Clear the flag
        localStorage.removeItem('quiz_completed')
        
        // Refresh stats after quiz completion
        setTimeout(() => {
          dispatch(fetchUserStats())
        }, 1000)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [dispatch])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-700">Loading Dashboard</p>
            <p className="text-sm text-slate-500">Please wait while we prepare your learning environment...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ModularDashboard />
        </div>
      </div>
    </Layout>
  )
}

export default DashboardPage