/**
 * PATH: src/pages/dashboard/DashboardPage.jsx
 * Dashboard Page
 */

import React from 'react'

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🧠 Studion
            </h1>
            <nav className="flex space-x-6">
              <a href="/dashboard" className="text-slate-600 hover:text-slate-900 font-medium">Dashboard</a>
              <a href="/documents" className="text-slate-600 hover:text-slate-900 font-medium">Documents</a>
              <a href="/quizzes" className="text-slate-600 hover:text-slate-900 font-medium">Quizzes</a>
              <a href="/courses" className="text-slate-600 hover:text-slate-900 font-medium">Courses</a>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
          <p className="text-slate-600">Welcome to your AI learning dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Documents Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-semibold mb-1">Documents</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-sm text-slate-500">Uploaded</p>
          </div>
          
          {/* Quizzes Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold mb-1">Quizzes</h3>
            <p className="text-2xl font-bold text-green-600">24</p>
            <p className="text-sm text-slate-500">Generated</p>
          </div>
          
          {/* Points Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-semibold mb-1">Points</h3>
            <p className="text-2xl font-bold text-purple-600">1,250</p>
            <p className="text-sm text-slate-500">Earned</p>
          </div>
          
          {/* Score Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-1">Average Score</h3>
            <p className="text-2xl font-bold text-indigo-600">87%</p>
            <p className="text-sm text-slate-500">Last 10 quizzes</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="text-3xl mb-4">📤</div>
              <h4 className="font-semibold mb-2">Upload Document</h4>
              <p className="text-slate-600 mb-4">Upload a PDF to get AI analysis and generate quizzes</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Upload Now
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="text-3xl mb-4">🎯</div>
              <h4 className="font-semibold mb-2">Take Quiz</h4>
              <p className="text-slate-600 mb-4">Practice with AI-generated quizzes from your documents</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Start Quiz
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="text-3xl mb-4">🎓</div>
              <h4 className="font-semibold mb-2">Browse Courses</h4>
              <p className="text-slate-600 mb-4">Explore premium courses from top creators</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Explore
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage