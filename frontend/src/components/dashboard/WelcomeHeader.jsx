/**
 * PATH: src/components/dashboard/WelcomeHeader.jsx
 * Welcome Header with Stats Integration
 */

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Trophy, BookOpen, Brain, TrendingUp, Loader, AlertCircle, RefreshCw } from 'lucide-react'
import { fetchUserStats as fetchUserStatsFromAuth } from '../../store/slices/authSlice'
import { fetchUserStats as fetchUserStatsFromUserStats } from '../../store/slices/userStatsSlice'

const WelcomeHeader = ({ className = '' }) => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  
  const authStats = useSelector(state => state.auth.userStats) // From authSlice
  const userStatsSliceData = useSelector(state => state.userStats) // From userStatsSlice
  const { stats: userStatsSliceStats, isLoading: userStatsLoading, error: userStatsError } = userStatsSliceData
  
  // Get document count from frontend state
  const documents = useSelector(state => state.documents?.documents) || []
  const documentsUploaded = documents.length
  
  const mergedStats = {
    // Default values
    quizzesCompleted: 0,
    totalPoints: 0,
    bestScore: 0,
    averageScore: 0,
    
    // Auth slice stats (lower priority)
    ...authStats,
    
    // UserStats slice stats (higher priority - most recent)
    ...userStatsSliceStats
  }
  
  console.log('📊 WelcomeHeader Debug:', {
    authStats,
    userStatsSliceStats,
    mergedStats,
    documentsCount: documentsUploaded
  })

  useEffect(() => {
    console.log('🔄 WelcomeHeader: Fetching stats from BOTH slices...')
    
    // Fetch from auth slice
    dispatch(fetchUserStatsFromAuth())
    
    // Fetch from userStats slice
    dispatch(fetchUserStatsFromUserStats())
  }, [dispatch])

  const handleRefreshStats = async () => {
    console.log('🔄 Manual refresh triggered...')
    try {
      await Promise.all([
        dispatch(fetchUserStatsFromAuth()),
        dispatch(fetchUserStatsFromUserStats())
      ])
      console.log('✅ Stats refreshed from both slices')
    } catch (error) {
      console.error('❌ Failed to refresh stats:', error)
    }
  }

  const statsData = [
    {
      label: 'Documents',
      value: documentsUploaded, // FROM FRONTEND
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
      description: 'Uploaded'
    },
    {
      label: 'Quizzes', 
      value: mergedStats.quizzesCompleted || 0, // FROM MERGED STATS
      icon: Brain,
      color: 'bg-green-50 text-green-600',
      description: 'Completed'
    },
    {
      label: 'Points',
      value: mergedStats.totalPoints || 0, // FROM MERGED STATS
      icon: Trophy,
      color: 'bg-purple-50 text-purple-600',
      description: 'Earned'
    },
    {
      label: 'Best Score',
      value: mergedStats.bestScore ? `${mergedStats.bestScore}%` : '0%',
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-600',
      description: 'Personal Best'
    }
  ]
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Welcome back, {user?.name?.first || 'Student'}! 👋
          </h1>
          <p className="text-slate-600">
            Ready to continue your AI learning journey?
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefreshStats}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          {/* Progress Stats */}
          <div className="flex flex-wrap gap-4 lg:gap-6">
            {userStatsLoading ? (
              <div className="flex items-center space-x-2 text-slate-500">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading stats...</span>
              </div>
            ) : (
              statsData.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {stat.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    {stat.description}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Show error if stats failed to load */}
      {userStatsError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <div className="text-red-800 font-medium">Failed to load stats</div>
            <div className="text-red-600 text-sm">{userStatsError}</div>
          </div>
          <button
            onClick={handleRefreshStats}
            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}
 
    </div>
  )
}

export default WelcomeHeader