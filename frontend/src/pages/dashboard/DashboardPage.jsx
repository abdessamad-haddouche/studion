/**
 * PATH: src/pages/dashboard/DashboardPage.jsx
 * Updated Modular Dashboard Page - Clean and simple
 */

import React from 'react'
import { useSelector } from 'react-redux'
import Layout from '../../components/layout/Layout'
import ModularDashboard from '../../components/dashboard/ModularDashboard'

const DashboardPage = () => {
  const { isAuthenticated } = useSelector(state => state.auth)

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
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