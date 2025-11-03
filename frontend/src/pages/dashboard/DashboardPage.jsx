/**
 * PATH: src/pages/dashboard/DashboardPage.jsx
 * Updated Dashboard using Layout component with authenticated header
 */

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Layout from '../../components/layout/Layout'

const DashboardPage = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth)

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">🔄</div>
          <p className="text-slate-600 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.name?.first || 'Student'}! 👋
            </h2>
            <p className="text-slate-600">Ready to continue your AI learning journey?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Documents Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="font-semibold mb-1">Documents</h3>
              <p className="text-2xl font-bold text-blue-600">
                {user?.progress?.documentsUploaded || 0}
              </p>
              <p className="text-sm text-slate-500">Uploaded</p>
            </div>
            
            {/* Quizzes Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-semibold mb-1">Quizzes</h3>
              <p className="text-2xl font-bold text-green-600">
                {user?.progress?.quizzesCompleted || 0}
              </p>
              <p className="text-sm text-slate-500">Completed</p>
            </div>
            
            {/* Points Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold mb-1">Points</h3>
              <p className="text-2xl font-bold text-purple-600">
                {user?.progress?.totalPoints || 0}
              </p>
              <p className="text-sm text-slate-500">Earned</p>
            </div>
            
            {/* Score Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-1">Average Score</h3>
              <p className="text-2xl font-bold text-indigo-600">
                {user?.progress?.averageScore || 0}%
              </p>
              <p className="text-sm text-slate-500">Last 10 quizzes</p>
            </div>
          </div>

          {/* User Info Section */}
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Personal Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Name:</span> {user?.fullName || `${user?.name?.first} ${user?.name?.last}`}</p>
                  <p><span className="text-slate-500">Email:</span> {user?.email}</p>
                  <p><span className="text-slate-500">Member since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Academic Info</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Level:</span> {user?.academic?.level || 'Not specified'}</p>
                  <p><span className="text-slate-500">Institution:</span> {user?.academic?.institution || 'Not specified'}</p>
                  <p><span className="text-slate-500">Field of Study:</span> {user?.academic?.fieldOfStudy || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">📤</div>
                <h4 className="font-semibold mb-2">Upload Document</h4>
                <p className="text-slate-600 mb-4">Upload a PDF to get AI analysis and generate quizzes</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                  Upload Now
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">🎯</div>
                <h4 className="font-semibold mb-2">Take Quiz</h4>
                <p className="text-slate-600 mb-4">Practice with AI-generated quizzes from your documents</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full">
                  Start Quiz
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">🎓</div>
                <h4 className="font-semibold mb-2">Browse Courses</h4>
                <p className="text-slate-600 mb-4">Explore premium courses from top creators</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full">
                  Explore
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default DashboardPage