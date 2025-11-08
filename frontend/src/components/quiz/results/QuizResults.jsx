/**
 * PATH: src/components/quiz/results/QuizResults.jsx
 * Add proper error handling for undefined results
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Trophy, Clock, Target, ArrowLeft, RotateCcw, Share2 } from 'lucide-react'
import Button from '../../ui/Button'
import LoadingSpinner from '../../ui/LoadingSpinner'
import BasicResults from './BasicResults'
import EnhancedResults from './EnhancedResults'
import AdvancedResults from './AdvancedResults'
import { selectCurrentPlan, selectPlanFeatures } from '../../../store/slices/subscriptionSlice'
import { quizAPI } from '../../../services/quizAPI'
import toast from 'react-hot-toast'

const QuizResults = () => {
  const { quizId, attemptId } = useParams()
  const navigate = useNavigate()
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // ✅ ADD ERROR STATE

  useEffect(() => {
    if (quizId && attemptId) {
      loadResults()
    }
  }, [quizId, attemptId])

  const loadResults = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // ✅ ADD DEBUGGING
      console.log(`📊 LOADING RESULTS:`, {
        quizId,
        attemptId,
        url: `/quiz/${quizId}/results/${attemptId}`
      })
      
      const response = await quizAPI.getResults(quizId, attemptId)
      
      // ✅ MORE DEBUGGING
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

  const handleRetakeQuiz = () => {
    navigate(`/quiz/${quizId}`)
  }

  const handleBackToDashboard = () => {
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
    
    switch (currentPlan) {
      case 'free':
        return <BasicResults results={results} />
      case 'basic':
        return <EnhancedResults results={results} />
      case 'premium':
      case 'pro':
      case 'enterprise':
        return <AdvancedResults results={results} />
      default:
        return <BasicResults results={results} />
    }
  }

  const getPerformanceColor = (percentage = 0) => { // ✅ DEFAULT VALUE
    if (percentage >= 90) return 'green'
    if (percentage >= 80) return 'blue'
    if (percentage >= 70) return 'yellow'
    return 'red'
  }

  const getPerformanceMessage = (percentage = 0) => { // ✅ DEFAULT VALUE
    if (percentage >= 90) return 'Outstanding! 🌟'
    if (percentage >= 80) return 'Great job! 🎉'
    if (percentage >= 70) return 'Well done! 👏'
    if (percentage >= 60) return 'Good effort! 💪'
    return 'Keep practicing! 📚'
  }

  // ✅ LOADING STATE
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

  // ✅ ERROR STATE
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

  // ✅ NO RESULTS STATE
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
              <div className="mt-8">
              {/* ✅ NEW: Dashboard Button */}
                <Button
                  onClick={handleBackToDashboard}
                  variant="secondary"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
            </div>
          </div>
        </div>

        {/* Subscription-Based Results */}
        {renderResults()}

        {/* Plan Upgrade CTA (if applicable) */}
        {currentPlan === 'free' && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white mt-8">
            <h3 className="text-xl font-bold mb-2">Unlock Detailed Analysis</h3>
            <p className="mb-4 opacity-90">
              Upgrade to Basic or higher to see answer explanations and detailed feedback
            </p>
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/pricing'}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizResults