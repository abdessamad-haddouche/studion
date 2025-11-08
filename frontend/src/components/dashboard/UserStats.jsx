/**
 * PATH: src/components/dashboard/UserStats.jsx
 * Enhanced User Stats with Auto-Refresh - FULL CODE
 * 
 * ✅ ADDED:
 * - Auto-refresh when component mounts
 * - Real-time stats updates after quiz completion
 * - Proper error handling and loading states
 * - Manual refresh button for users
 */

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  fetchUserStats, 
  selectUserStats, 
  selectStatsLoading,
  updateStatsLocally 
} from '../../store/slices/userStatsSlice'
import { 
  selectDocuments,
  selectDocumentStats 
} from '../../store/slices/documentsSlice'
import Card from '../ui/Card'
import { RefreshCw, FileText, Brain, Trophy, Target } from 'lucide-react'

const UserStats = () => {
  const dispatch = useDispatch()
  const { stats, error } = useSelector(selectUserStats)
  const isLoading = useSelector(selectStatsLoading)
  const documents = useSelector(selectDocuments)
  const documentStats = useSelector(selectDocumentStats)
  
  // ✅ ADDED: Local refresh state
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  // ✅ ADDED: Auto-refresh on component mount
  useEffect(() => {
    console.log('📊 UserStats: Component mounted, fetching stats...')
    handleRefreshStats()
  }, [])

  // ✅ ADDED: Listen for route changes (when user returns from quiz)
  useEffect(() => {
    const handleFocus = () => {
      console.log('📊 UserStats: Window focused, refreshing stats...')
      handleRefreshStats()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📊 UserStats: Page visible again, refreshing stats...')
        handleRefreshStats()
      }
    }

    // Add event listeners for when user returns to dashboard
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // ✅ ADDED: Manual refresh function
  const handleRefreshStats = async () => {
    try {
      setIsRefreshing(true)
      console.log('🔄 UserStats: Manually refreshing stats...')
      
      await dispatch(fetchUserStats()).unwrap()
      setLastRefresh(new Date())
      
      console.log('✅ UserStats: Stats refreshed successfully')
    } catch (error) {
      console.error('❌ UserStats: Failed to refresh stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // ✅ ADDED: Calculate document count from Redux store
  const documentCount = documents?.length || documentStats?.total || 0

  // ✅ ADDED: Format stats with fallbacks
  const formattedStats = {
    documentsUploaded: documentCount,
    quizzesCompleted: stats?.quizzesCompleted || 0,
    totalPoints: stats?.totalPoints || 0,
    bestScore: stats?.bestScore || 0,
    averageScore: stats?.averageScore || 0
  }

  // ✅ ADDED: Loading state
  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-8 bg-slate-200 rounded w-12"></div>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ✅ ADDED: Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Progress</h2>
          <p className="text-sm text-slate-600">
            Track your learning journey and achievements
          </p>
        </div>
        
        <button
          onClick={handleRefreshStats}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ✅ ADDED: Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-red-600 text-sm">
              ⚠️ Failed to load stats: {error}
            </div>
            <button
              onClick={handleRefreshStats}
              className="text-red-600 hover:text-red-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ✅ ENHANCED: Stats cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Documents Uploaded */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Documents</p>
              <p className="text-sm text-slate-500">Uploaded</p>
              <p className="text-2xl font-bold text-slate-900">
                {formattedStats.documentsUploaded}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Quizzes Completed */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Quizzes</p>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900">
                {formattedStats.quizzesCompleted}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Points Earned */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Points</p>
              <p className="text-sm text-slate-500">Earned</p>
              <p className="text-2xl font-bold text-slate-900">
                {formattedStats.totalPoints}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Best Score */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Best Score</p>
              <p className="text-sm text-slate-500">Personal Best</p>
              <p className="text-2xl font-bold text-slate-900">
                {formattedStats.bestScore}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* ✅ ADDED: Last refresh indicator */}
      {lastRefresh && (
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default UserStats