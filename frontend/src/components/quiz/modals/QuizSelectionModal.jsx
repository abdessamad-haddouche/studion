/**
 * PATH: src/components/quiz/modals/QuizSelectionModal.jsx
 * Quiz type selection modal with subscription-based features
 */

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { X, Brain, CheckCircle, XCircle, Crown, Clock, Target } from 'lucide-react'
import Button from '../../ui/Button'
import LoadingSpinner from '../../ui/LoadingSpinner'
import { selectCurrentPlan, selectPlanFeatures } from '../../../store/slices/subscriptionSlice'
import { getAvailableQuizTypes } from '../../subscription/SubscriptionConfig'
import { quizAPI } from '../../../services/quizAPI'
import toast from 'react-hot-toast'

const QuizSelectionModal = ({ isOpen, document, onClose, onStartQuiz }) => {
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)
  const [loading, setLoading] = useState(false)
  const [quizStats, setQuizStats] = useState(null)
  const [selectedType, setSelectedType] = useState(null)

  // Get available quiz types based on subscription
  const availableQuizTypes = getAvailableQuizTypes(currentPlan)

  // Load quiz statistics when modal opens
  useEffect(() => {
    if (isOpen && document) {
      loadQuizStats()
    }
  }, [isOpen, document])

  const loadQuizStats = async () => {
    try {
      setLoading(true)
      const stats = await quizAPI.getDocumentQuizStats(document.id || document._id)
      setQuizStats(stats.stats)
    } catch (error) {
      console.error('Error loading quiz stats:', error)
      toast.error('Failed to load quiz information')
    } finally {
      setLoading(false)
    }
  }

  const handleQuizTypeSelect = async (quizType) => {
    if (!availableQuizTypes.includes(quizType)) {
      // Show upgrade modal
      toast.error(`${quizType.replace('_', ' ')} quizzes require ${quizType === 'multiple_choice' ? 'Basic' : 'Premium'} plan or higher`)
      return
    }

    try {
      setLoading(true)
      setSelectedType(quizType)

      console.log(`🎯 Selecting ${quizType} quiz for document:`, document.id)

      // Select quiz from backend
      const result = await quizAPI.selectQuiz(document.id || document._id, {
        questionType: quizType,
        difficulty: 'mixed' // Default difficulty
      })

      if (result.success && result.quiz) {
        console.log('✅ Quiz selected:', result.quiz)
        onStartQuiz({
          quizId: result.quiz.id,
          quizType: quizType,
          document: document,
          quiz: result.quiz
        })
      } else {
        throw new Error(result.message || 'Failed to select quiz')
      }

    } catch (error) {
      console.error('Error selecting quiz:', error)
      toast.error(error.response?.data?.message || 'Failed to start quiz. Please try again.')
    } finally {
      setLoading(false)
      setSelectedType(null)
    }
  }

  const quizTypeConfigs = {
    true_false: {
      title: 'True / False',
      description: 'Quick understanding check with true or false questions',
      icon: <CheckCircle className="w-6 h-6" />,
      estimatedTime: '3-5 minutes',
      difficulty: 'Easy',
      color: 'blue',
      available: availableQuizTypes.includes('true_false')
    },
    multiple_choice: {
      title: 'Multiple Choice',
      description: 'Comprehensive assessment with multiple choice questions',
      icon: <Target className="w-6 h-6" />,
      estimatedTime: '8-12 minutes',
      difficulty: 'mixed',
      color: 'purple',
      available: availableQuizTypes.includes('multiple_choice')
    }
  }

  if (!isOpen || !document) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Choose Quiz Type</h2>
                <p className="text-slate-600">{document.title}</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Plan Badge */}
          <div className="mt-4 inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
            <span className="font-medium capitalize">{currentPlan}</span>
            <span>Plan</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && !selectedType ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-slate-600">Loading quiz options...</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Quiz Stats */}
              {quizStats && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Available Quizzes</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">True/False:</span>
                      <span className="ml-2 font-medium">{quizStats.trueFalseCount || 0} quiz</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Multiple Choice:</span>
                      <span className="ml-2 font-medium">{quizStats.multipleChoiceCount || 0} quiz</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Type Options */}
              <div className="space-y-4">
                {Object.entries(quizTypeConfigs).map(([type, config]) => (
                  <div 
                    key={type}
                    className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      config.available 
                        ? 'border-slate-200 hover:border-blue-300 hover:bg-blue-50' 
                        : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => config.available && handleQuizTypeSelect(type)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          config.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {config.icon}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{config.title}</h3>
                          <p className="text-slate-600 text-sm mb-3">{config.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{config.estimatedTime}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="w-3 h-3" />
                              <span>{config.difficulty}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {config.available ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Available</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-slate-400">
                            <Crown className="w-4 h-4" />
                            <span className="text-xs font-medium">Upgrade Required</span>
                          </div>
                        )}
                        
                        {loading && selectedType === type && (
                          <LoadingSpinner size="sm" />
                        )}
                      </div>
                    </div>

                    {/* Upgrade Notice */}
                    {!config.available && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-600">
                            Upgrade to <strong>Basic</strong> or higher to access this quiz type
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = '/pricing'
                            }}
                          >
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Plan Features Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-blue-900 mb-2">Your Plan Features</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Quiz Types: {availableQuizTypes.map(t => t.replace('_', ' ')).join(', ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {planFeatures.showExplanations ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>Answer Explanations: {planFeatures.showExplanations ? 'Included' : 'Not Available'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {planFeatures.showStrengthsWeaknesses ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>Strengths & Weaknesses: {planFeatures.showStrengthsWeaknesses ? 'Included' : 'Not Available'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span>Ready to test your knowledge?</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              
              {availableQuizTypes.length === 0 && (
                <Button
                  variant="premium"
                  onClick={() => window.location.href = '/pricing'}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizSelectionModal