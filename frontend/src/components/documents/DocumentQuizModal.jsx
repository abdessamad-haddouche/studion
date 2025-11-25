/**
 * PATH: src/components/documents/DocumentQuizModal.jsx
 * Document Quiz Modal - Quiz generation with difficulty selection
 */

import React, { useState } from 'react'
import { X, Brain, Smile, Meh, Frown, Settings, Play, Clock, Target } from 'lucide-react'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { 
  quizConfig, 
  getEnabledQuizDifficulties,
  QUIZ_DIFFICULTIES 
} from './DocumentActionsConfig'

const DocumentQuizModal = ({ isOpen, document, onClose, onStartQuiz }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(QUIZ_DIFFICULTIES.MEDIUM)
  const [isGenerating, setIsGenerating] = useState(false)
  const [customQuestions, setCustomQuestions] = useState(null)

  // Icon mapping for difficulties
  const difficultyIcons = {
    Smile: <Smile className="w-6 h-6" />,
    Meh: <Meh className="w-6 h-6" />,
    Frown: <Frown className="w-6 h-6" />
  }

  // Color mapping
  const colorMap = {
    green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
    red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
  }

  const selectedColorMap = {
    green: 'bg-green-100 border-green-300 text-green-800 ring-2 ring-green-200',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800 ring-2 ring-yellow-200',
    red: 'bg-red-100 border-red-300 text-red-800 ring-2 ring-red-200'
  }

  const handleGenerateQuiz = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate API call to generate quiz
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const quizData = {
        documentId: document.id,
        difficulty: selectedDifficulty,
        questionsCount: quizConfig[selectedDifficulty].questionsCount,
        questions: generateMockQuestions(selectedDifficulty)
      }
      
      // Call parent handler to start the quiz
      onStartQuiz(quizData)
      
    } catch (error) {
      console.error('Quiz generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockQuestions = (difficulty) => {
    const questionCount = quizConfig[difficulty].questionsCount
    const questions = []
    
    for (let i = 0; i < questionCount; i++) {
      questions.push({
        id: i + 1,
        type: 'multiple-choice',
        question: `Sample question ${i + 1} for ${difficulty} difficulty`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0
      })
    }
    
    return questions
  }

  const getEnabledDifficulties = getEnabledQuizDifficulties()

  if (!isOpen || !document) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Generate Quiz</h2>
              <p className="text-sm text-slate-600">{document.title}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
            disabled={isGenerating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isGenerating ? (
            // Generating State
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Generating Your Quiz...
              </h3>
              <p className="text-slate-600 mb-4">
                AI is creating {quizConfig[selectedDifficulty].questionsCount} {selectedDifficulty} questions from your document
              </p>
              <div className="text-sm text-slate-500">
                This usually takes 10-20 seconds
              </div>
            </div>
          ) : (
            // Configuration State
            <div className="space-y-6">
              {/* Document Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Document Ready</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Pages:</span>
                    <span className="ml-2 font-medium">{document.file?.metadata?.pageCount || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Words:</span>
                    <span className="ml-2 font-medium">{document.file?.metadata?.wordCount || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Complexity:</span>
                    <span className="ml-2 font-medium capitalize">{document.file?.metadata?.complexity || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Quality:</span>
                    <span className="ml-2 font-medium capitalize">{document.file?.metadata?.quality || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Choose Difficulty</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getEnabledDifficulties.map(difficulty => {
                    const config = quizConfig[difficulty]
                    const isSelected = selectedDifficulty === difficulty
                    
                    return (
                      <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected 
                            ? selectedColorMap[config.color]
                            : `${colorMap[config.color]} border-opacity-50`
                        }`}
                      >
                        <div className="text-center">
                          <div className="flex justify-center mb-3">
                            {difficultyIcons[config.icon]}
                          </div>
                          
                          <h4 className="font-semibold text-lg mb-1">
                            {config.label}
                          </h4>
                          
                          <p className="text-sm opacity-75 mb-3">
                            {config.description}
                          </p>
                          
                          <div className="flex items-center justify-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <Settings className="w-3 h-3" />
                              <span>{config.questionsCount} questions</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>~{config.questionsCount * 1.5} min</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quiz Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Quiz Preview</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>{quizConfig[selectedDifficulty].questionsCount} questions</strong> will be generated</p>
                  <p>• Estimated time: <strong>~{quizConfig[selectedDifficulty].questionsCount * 1.5} minutes</strong></p>
                  <p>• Difficulty: <strong className="capitalize">{selectedDifficulty}</strong></p>
                  <p>• Based on: <strong>Document content and AI analysis</strong></p>
                </div>
              </div>

              {/* Custom Options */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Custom Options</span>
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={customQuestions || quizConfig[selectedDifficulty].questionsCount}
                      onChange={(e) => setCustomQuestions(parseInt(e.target.value))}
                      className="w-20 px-3 py-1 border border-slate-300 rounded-lg text-sm"
                    />
                    <span className="text-sm text-slate-700">Number of questions</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-slate-700">Multiple choice</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-slate-700">True/False</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-slate-700">Fill in blanks</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-slate-700">Short answer</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isGenerating && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                <span>Ready to test your knowledge?</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="premium"
                  onClick={handleGenerateQuiz}
                  className="flex items-center space-x-2"
                  icon={<Play className="w-4 h-4" />}
                >
                  Generate Quiz
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentQuizModal