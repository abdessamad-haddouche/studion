/**
 * PATH: src/components/dashboard/WelcomeHeader.jsx
 * Simple Welcome Header Component
 */

import React from 'react'
import { useSelector } from 'react-redux'

const WelcomeHeader = ({ className = '' }) => {
  const { user } = useSelector(state => state.auth)
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Welcome back, {user?.name?.first || 'Student'}! 👋
          </h1>
          <p className="text-slate-600">
            Ready to continue your AI learning journey?
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex space-x-4">
          <div className="text-center bg-blue-50 rounded-lg px-3 py-2">
            <div className="text-lg font-bold text-blue-600">
              {user?.progress?.documentsUploaded || 0}
            </div>
            <div className="text-xs text-blue-700 font-medium">Documents</div>
          </div>
          
          <div className="text-center bg-green-50 rounded-lg px-3 py-2">
            <div className="text-lg font-bold text-green-600">
              {user?.progress?.quizzesCompleted || 0}
            </div>
            <div className="text-xs text-green-700 font-medium">Quizzes</div>
          </div>
          
          <div className="text-center bg-purple-50 rounded-lg px-3 py-2">
            <div className="text-lg font-bold text-purple-600">
              {user?.progress?.totalPoints || 0}
            </div>
            <div className="text-xs text-purple-700 font-medium">Points</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeHeader