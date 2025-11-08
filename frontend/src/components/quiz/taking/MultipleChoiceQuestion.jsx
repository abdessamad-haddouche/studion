/**
 * PATH: src/components/quiz/taking/MultipleChoiceQuestion.jsx
 * Properly show user vs correct answers
 */

import React from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

const MultipleChoiceQuestion = ({ 
  question, 
  answer, 
  onAnswerChange, 
  showResult = false,
  isCorrect = null 
}) => {

  const handleOptionSelect = (index) => {
    if (!showResult) {
      onAnswerChange(index)
    }
  }

  const options = question.options || []
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isUserAnswer = answer === index // User selected this option
        const isCorrectAnswer = question.correctAnswerIndex === index // This is the correct option
        
        // Determine styling based on result state
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
          // Taking quiz mode
          if (isUserAnswer) {
            buttonClass += 'border-blue-300 bg-blue-50 text-blue-800'
          } else {
            buttonClass += 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
          }
        }

        return (
          <button
            key={index}
            onClick={() => handleOptionSelect(index)}
            disabled={showResult}
            className={buttonClass}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Option Letter */}
                <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-semibold ${
                  showResult 
                    ? (isUserAnswer && isCorrectAnswer) || (!isUserAnswer && isCorrectAnswer)
                      ? 'border-green-500 bg-green-500 text-white'
                      : isUserAnswer && !isCorrectAnswer
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-slate-300 text-slate-600'
                    : isUserAnswer 
                      ? 'border-blue-400 bg-blue-400 text-white'
                      : 'border-slate-300 text-slate-600'
                }`}>
                  {optionLabels[index]}
                </div>
                
                {/* Option Text */}
                <span className="font-medium flex-1">{option}</span>
              </div>

              {/* Result Indicator */}
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

export default MultipleChoiceQuestion