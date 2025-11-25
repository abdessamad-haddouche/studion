/**
 * PATH: src/components/quiz/results/QuizResults.jsx
 * Quiz Results with Dashboard Refresh Trigger
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Trophy, Clock, Target, ArrowLeft, RotateCcw, Share2 } from 'lucide-react'
import Button from '../../ui/Button'
import LoadingSpinner from '../../ui/LoadingSpinner'
import AdvancedResults from './AdvancedResults'
import { selectCurrentPlan, selectPlanFeatures } from '../../../store/slices/subscriptionSlice'
import { updateStatsAfterQuiz, fetchUserStats } from '../../../store/slices/userStatsSlice'
import { quizAPI } from '../../../services/quizAPI'
import toast from 'react-hot-toast'

const QuizResults = () => {
  const { quizId, attemptId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statsUpdated, setStatsUpdated] = useState(false)

  useEffect(() => {
    if (quizId && attemptId) {
      loadResults()
    }
  }, [quizId, attemptId])

  const loadResults = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`📊 LOADING RESULTS:`, {
        quizId,
        attemptId,
        url: `/quiz/${quizId}/results/${attemptId}`
      })
      
      const response = await quizAPI.getResults(quizId, attemptId)
      
      console.log('🔍 RAW API RESPONSE:', response)
      
      if (response.success && response.results) {
        // Try to get the original quiz to get question types
        try {
          const originalQuizResponse = await quizAPI.getQuizById(quizId)
          const originalQuiz = originalQuizResponse.quiz
          
          // Map the options from original quiz to results
          const enhancedDetailedResults = response.results.detailedResults?.map((result, index) => {
            const originalQuestion = originalQuiz.questions?.[index]
            return {
              ...result,
              options: originalQuestion?.options || result.options || ['True', 'False']
            }
          })
          
          response.results.detailedResults = enhancedDetailedResults
          console.log('✅ Enhanced results with original options:', enhancedDetailedResults)
          
        } catch (error) {
          console.log('⚠️ Could not enhance with original quiz data:', error)
        }

        // Calculate accuracy and validate results
        const totalQuestions = response.results.summary?.totalQuestions || response.results.detailedResults?.length || 0
        const correctAnswers = response.results.score || response.results.summary?.correctAnswers || 0
        const calculatedAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
        
        const validatedResults = {
          ...response.results,
          percentage: response.results.percentage || calculatedAccuracy,
          score: correctAnswers,
          pointsEarned: response.results.pointsEarned || 0,
          durationMinutes: response.results.durationMinutes || 0,
          accuracy: calculatedAccuracy,
          summary: {
            totalQuestions,
            correctAnswers,
            incorrectAnswers: totalQuestions - correctAnswers,
            ...response.results.summary
          },
          detailedResults: response.results.detailedResults || [],
          quiz: response.results.quiz || { title: 'Unknown Quiz' }
        }
        
        setResults(validatedResults)
        console.log('✅ FINAL VALIDATED RESULTS:', validatedResults)

        if (!statsUpdated) {
          await updateUserStats(validatedResults)
          setStatsUpdated(true)
        }
        
      } else {
        throw new Error(response.message || 'Invalid response format')
      }
    } catch (error) {
      console.error('❌ Error loading results:', error)
      setError(error.message || 'Failed to load quiz results')
      toast.error('Failed to load quiz results')
    } finally {
      setLoading(false)
    }
  }

  const updateUserStats = async (quizResults) => {
    try {
      console.log('📊 QuizResults: Updating user stats after quiz completion...')
      
      // Calculate points earned (you can customize this logic)
      const pointsEarned = Math.round(quizResults.percentage * 0.1) // 1 point per 10%
      
      const quizResult = {
        percentage: quizResults.percentage,
        pointsEarned: pointsEarned,
        isCompleted: true
      }
      
      // Update stats in Redux
      await dispatch(updateStatsAfterQuiz(quizResult))
      
      localStorage.setItem('quiz_completed', JSON.stringify({
        quizId,
        attemptId,
        percentage: quizResults.percentage,
        pointsEarned,
        timestamp: Date.now()
      }))
      
      setTimeout(() => {
        dispatch(fetchUserStats())
      }, 1000)
      
      console.log('✅ QuizResults: Stats updated successfully')
      
    } catch (error) {
      console.error('❌ QuizResults: Failed to update stats:', error)
    }
  }

  const handleRetakeQuiz = () => {
    navigate(`/quiz/${quizId}`)
  }

  const handleBackToDashboard = async () => {
    console.log('🏠 QuizResults: Navigating back to dashboard...')
    
    // Update stats when going back to dashboard
    if (results) {
      try {
        await dispatch(updateStatsAfterQuiz({
          percentage: results.percentage || 0,
          pointsEarned: results.pointsEarned || 0,
          score: results.score || 0
        }))
        console.log('✅ Stats updated after quiz completion')
      } catch (error) {
        console.error('⚠️ Could not update stats:', error)
      }
    }
    
    // Set a flag that dashboard should refresh
    localStorage.setItem('dashboard_should_refresh', 'true')
    
    navigate('/dashboard')
  }

  const handleShareResults = () => {
    if (!results) return
    
    const shareText = `I just scored ${results.percentage}% on "${results.quiz.title}"! 🎉`
    
    if (navigator.share) {
      navigator.share({
        title: 'Quiz Results',
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`)
      toast.success('Results copied to clipboard!')
    }
  }

  const renderResults = () => {
    if (!results) return null
    
    return <AdvancedResults results={results} />
  }

  const getPerformanceColor = (percentage = 0) => {
    if (percentage >= 90) return 'green'
    if (percentage >= 80) return 'blue'
    if (percentage >= 70) return 'yellow'
    return 'red'
  }

  const getPerformanceMessage = (percentage = 0) => {
    if (percentage >= 90) return 'Outstanding! 🌟'
    if (percentage >= 80) return 'Great job! 🎉'
    if (percentage >= 70) return 'Well done! 👏'
    if (percentage >= 60) return 'Good effort! 💪'
    return 'Keep practicing! 📚'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-slate-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <div className="space-x-4">
            <Button onClick={loadResults} variant="primary">Try Again</Button>
            <Button onClick={handleBackToDashboard} variant="secondary">Back to Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No results found</p>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const performanceColor = getPerformanceColor(results.percentage)

  const formatTimeDisplay = (results) => {
    // Try multiple time sources from the results
    const timeInMs = results.timeSpent || 0 // milliseconds
    const timeInMinutes = results.durationMinutes || 0 // minutes
    const timeSpentFormatted = results.timeSpentFormatted // formatted string
    
    console.log('🕐 Time Debug:', { timeInMs, timeInMinutes, timeSpentFormatted })
    
    // If we have a formatted string, use it
    if (timeSpentFormatted && timeSpentFormatted !== '0m 0s') {
      return timeSpentFormatted
    }
    
    // Calculate from milliseconds if available
    if (timeInMs > 0) {
      const totalSeconds = Math.floor(timeInMs / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`
      } else {
        return `${seconds}s`
      }
    }
    
    // Calculate from minutes if available
    if (timeInMinutes > 0) {
      if (timeInMinutes < 1) {
        // If less than 1 minute, show in seconds
        const seconds = Math.round(timeInMinutes * 60)
        return `${seconds}s`
      } else {
        return `${Math.round(timeInMinutes)}m`
      }
    }
    
    // Fallback
    return 'Less than 1m'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Quiz Results</h1>
                <p className="text-slate-600">{results.quiz?.title || 'Quiz'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={handleShareResults}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
              
              <Button
                variant="primary"
                onClick={handleRetakeQuiz}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Score Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="text-center">
            
            {/* Score Circle */}
            <div className={`w-32 h-32 mx-auto mb-6 rounded-full border-8 flex items-center justify-center ${
              performanceColor === 'green' ? 'border-green-200 bg-green-50' :
              performanceColor === 'blue' ? 'border-blue-200 bg-blue-50' :
              performanceColor === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
              'border-red-200 bg-red-50'
            }`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  performanceColor === 'green' ? 'text-green-600' :
                  performanceColor === 'blue' ? 'text-blue-600' :
                  performanceColor === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {Math.round(results.percentage || 0)}%
                </div>
                <div className="text-sm text-slate-600">Score</div>
              </div>
            </div>

            {/* Performance Message */}
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {getPerformanceMessage(results.percentage)}
            </h2>
            <p className="text-slate-600 mb-6">
              You scored {results.score || 0} out of {results.summary?.totalQuestions || 0} questions correctly
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{(results.accuracy || 0).toFixed(1)}%</div>
                <div className="text-sm text-slate-600">Accuracy</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatTimeDisplay(results)}
                </div>
                <div className="text-sm text-slate-600">Time</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                onClick={handleBackToDashboard}
                variant="secondary"
                size="lg"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Button>
              
              <Button
                onClick={handleRetakeQuiz}
                variant="primary"
                size="lg"
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Retake Quiz</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Results - Show AdvancedResults for ALL users */}
        {renderResults()}
      </div>
    </div>
  )
}

export default QuizResults