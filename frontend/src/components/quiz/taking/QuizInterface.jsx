/**
 * PATH: src/components/quiz/taking/QuizInterface.jsx
 * COMPLETE Enhanced Quiz Interface with Completion Tracking - FULL CODE
 * 
 * ✅ ADDED:
 * - Proper completion handling and navigation
 * - Set completion flags for dashboard refresh
 * - Better error handling and loading states
 * - Auto-navigation to results
 * 
 * ✅ PRESERVED: All original functionality, subscription logic, timer, progress tracking, question navigation
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Clock, Brain, ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import Button from '../../ui/Button'
import LoadingSpinner from '../../ui/LoadingSpinner'
import QuestionCard from './QuestionCard'
import QuizProgress from './QuizProgress'
import { selectCurrentPlan, selectPlanFeatures } from '../../../store/slices/subscriptionSlice'
import { quizAPI } from '../../../services/quizAPI'
import toast from 'react-hot-toast'
import { refreshStatsAfterQuiz, updateStatsAfterQuiz } from '../../../store/slices/userStatsSlice'

const QuizInterface = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)

  // Quiz state
  const [quiz, setQuiz] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Initialize quiz
  useEffect(() => {
    if (quizId) {
      initializeQuiz()
    }
  }, [quizId])

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const initializeQuiz = async () => {
    try {
      setLoading(true)
      
      // Get quiz details
      const quizResponse = await quizAPI.getQuizById(quizId)
      if (!quizResponse.success) {
        throw new Error('Quiz not found')
      }

      setQuiz(quizResponse.quiz)

      // Start quiz attempt
      const attemptResponse = await quizAPI.startAttempt(quizId)
      if (!attemptResponse.success) {
        throw new Error('Failed to start quiz attempt')
      }

      setAttempt(attemptResponse.attempt)
      setQuestionStartTime(Date.now())

      console.log('✅ Quiz initialized:', quizResponse.quiz.title)

    } catch (error) {
      console.error('Error initializing quiz:', error)
      toast.error('Failed to load quiz. Redirecting to dashboard...')
      setTimeout(() => navigate('/dashboard'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async (questionId, answer) => {
    try {
      const questionTimeSpent = Date.now() - questionStartTime

      // Store answer locally
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }))

      // Submit to backend
      const result = await quizAPI.submitAnswer(quiz.id, attempt.id, {
        questionId,
        answer,
        timeSpent: questionTimeSpent
      })

      if (result.success) {
        console.log('✅ Answer submitted:', result.result)
      }

    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to submit answer')
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setQuestionStartTime(Date.now())
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
      setQuestionStartTime(Date.now())
    }
  }

  const handleCompleteQuiz = async () => {
    try {
      setSubmitting(true)

      // ✅ ADD DEBUGGING
      console.log('🏁 COMPLETING QUIZ:', {
        quizId: quiz.id,
        attemptId: attempt.id,
        quizTitle: quiz.title,
        quizType: quiz.questionType,
        answersCount: Object.keys(answers).length,
        totalQuestions: quiz.questions.length
      })

      // Check if all questions answered
      const unansweredCount = quiz.questions.length - Object.keys(answers).length
      if (unansweredCount > 0) {
        const confirm = window.confirm(
          `You have ${unansweredCount} unanswered questions. Are you sure you want to complete the quiz?`
        )
        if (!confirm) {
          setSubmitting(false)
          return
        }
      }

      // Complete quiz attempt
      const result = await quizAPI.completeQuiz(quiz.id, attempt.id)
      
      if (result.success) {
        console.log('✅ Quiz completed successfully:', result)
        toast.success('Quiz completed! 🎉')

        // ✅ ADDED: Set completion flag for dashboard
        localStorage.setItem('quiz_completed', JSON.stringify({
          quizId: quiz.id,
          attemptId: attempt.id,
          timestamp: Date.now(),
          answersCount: Object.keys(answers).length
        }))

        // ✅ ADDED: Update stats immediately (optimistic update)
        const estimatedScore = (Object.keys(answers).length / quiz.questions.length) * 100
        dispatch(updateStatsAfterQuiz({
          percentage: estimatedScore,
          pointsEarned: Math.round(estimatedScore * 0.1),
          isCompleted: true
        }))

        // ✅ ADD: Refresh user stats
        try {
          await dispatch(refreshStatsAfterQuiz(result))
        } catch (error) {
          console.error('⚠️ Could not refresh stats:', error)
        }
        
        // ✅ ADD MORE DEBUGGING
        console.log('🔄 Navigating to results:', `/quiz/${quiz.id}/results/${attempt.id}`)
        
        // Navigate to results
        navigate(`/quiz/${quiz.id}/results/${attempt.id}`)
      } else {
        throw new Error(result.message || 'Failed to complete quiz')
      }

    } catch (error) {
      console.error('❌ Error completing quiz:', error)
      toast.error('Failed to complete quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz || !attempt) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Quiz not found</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const currentQuestionData = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Quiz Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-slate-400 hover:text-slate-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{quiz.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Brain className="w-4 h-4" />
                    <span className="capitalize">{quiz.questionType?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(timeSpent)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                {currentQuestion + 1} of {quiz.questions.length}
              </div>
              <Button
                variant="premium"
                onClick={handleCompleteQuiz}
                disabled={submitting}
                loading={submitting}
                className="flex items-center space-x-2"
              >
                <Flag className="w-4 h-4" />
                <span>Complete Quiz</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <QuizProgress 
            current={currentQuestion + 1}
            total={quiz.questions.length}
            answered={answeredCount}
            className="mt-4"
          />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          
          {/* Question */}
          <QuestionCard
            question={currentQuestionData}
            questionNumber={currentQuestion + 1}
            questionType={quiz.questionType}
            answer={answers[currentQuestionData.id]}
            onAnswerChange={(answer) => handleAnswerSubmit(currentQuestionData.id, answer)}
            showExplanations={planFeatures.showExplanations}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="secondary"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="text-sm text-slate-600">
              {answeredCount} of {quiz.questions.length} answered
            </div>

            <Button
              variant="primary"
              onClick={handleNextQuestion}
              disabled={currentQuestion === quiz.questions.length - 1}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizInterface