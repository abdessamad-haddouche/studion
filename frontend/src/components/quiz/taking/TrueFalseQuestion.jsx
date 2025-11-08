/**
 * PATH: src/components/quiz/taking/TrueFalseQuestion.jsx
 * Fixed to use neutral colors during quiz taking
 */

import React from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

const TrueFalseQuestion = ({ 
  question, 
  answer, 
  onAnswerChange, 
  showResult = false,
  isCorrect = null 
}) => {

  const handleOptionSelect = (value) => {
    if (!showResult) {
      onAnswerChange(value)
    }
  }

  const options = [
    { value: 0, label: 'True', icon: CheckCircle },
    { value: 1, label: 'False', icon: XCircle }
  ]

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isUserAnswer = answer === option.value
        const isCorrectAnswer = question.correctAnswerIndex === option.value
        
        let buttonClass = 'w-full p-4 border-2 rounded-xl text-left transition-all '
        let labelText = ''
        let showIndicator = false
        
        if (showResult) {
          if (isUserAnswer && isCorrectAnswer) {
            // ✅ User selected correct answer - GREEN
            buttonClass += 'border-green-500 bg-green-100 text-green-800'
            labelText = 'Your Answer (Correct)'
            showIndicator = true
          } else if (isUserAnswer && !isCorrectAnswer) {
            // ❌ User selected wrong answer - RED
            buttonClass += 'border-red-500 bg-red-100 text-red-800'
            labelText = 'Your Answer (Incorrect)'
            showIndicator = true
          } else if (!isUserAnswer && isCorrectAnswer) {
            // ✅ This is correct answer but user didn't select it - GREEN (lighter)
            buttonClass += 'border-green-400 bg-green-50 text-green-700'
            labelText = 'Correct Answer'
            showIndicator = true
          } else {
            // Other options - GRAY
            buttonClass += 'border-slate-200 bg-slate-50 text-slate-600'
          }
        } else {
          // ✅ FIXED: Quiz taking mode - NEUTRAL COLORS ONLY
          if (isUserAnswer) {
            buttonClass += 'border-blue-400 bg-blue-50 text-blue-800' // Selected = blue
          } else {
            buttonClass += 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700' // Unselected = gray
          }
        }

        return (
          <button
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
            disabled={showResult}
            className={buttonClass}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Radio Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  showResult 
                    ? (isUserAnswer && isCorrectAnswer) || (!isUserAnswer && isCorrectAnswer)
                      ? 'border-green-500 bg-green-500'
                      : isUserAnswer && !isCorrectAnswer
                      ? 'border-red-500 bg-red-500'
                      : 'border-slate-300'
                    : isUserAnswer 
                      ? 'border-blue-400 bg-blue-400' // ✅ FIXED: Blue instead of color-based
                      : 'border-slate-300'
                }`}>
                  {((showResult && (isUserAnswer || isCorrectAnswer)) || (!showResult && isUserAnswer)) && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                
                {/* Option Content */}
                <div className="flex items-center space-x-3">
                  <option.icon className="w-5 h-5 text-slate-600" /> {/* ✅ FIXED: Neutral color */}
                  <span className="font-medium text-lg">{option.label}</span>
                </div>
              </div>

              {/* Result Indicator - ONLY in results mode */}
              {showResult && showIndicator && (
                <div className="flex items-center space-x-2">
                  {isUserAnswer && isCorrectAnswer ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{labelText}</span>
                    </div>
                  ) : isUserAnswer && !isCorrectAnswer ? (
                    <div className="flex items-center space-x-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{labelText}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{labelText}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default TrueFalseQuestion