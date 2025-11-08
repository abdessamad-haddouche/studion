/**
 * PATH: src/components/quiz/taking/QuizProgress.jsx
 * Quiz progress indicator
 */

import React from 'react'
import { CheckCircle, Circle } from 'lucide-react'

const QuizProgress = ({ current, total, answered, className = '' }) => {
  const progress = (current / total) * 100
  const answeredProgress = (answered / total) * 100

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-slate-200 rounded-full h-2">
          {/* Answered Questions Progress */}
          <div 
            className="bg-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${answeredProgress}%` }}
          ></div>
          
          {/* Current Position Indicator */}
          <div 
            className="absolute top-0 h-2 w-1 bg-blue-600 transition-all duration-300"
            style={{ left: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Progress Details */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-blue-600">
            <Circle className="w-4 h-4" />
            <span>Question {current} of {total}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>{answered} answered</span>
          </div>
        </div>

        <div className="text-slate-600">
          {Math.round(answeredProgress)}% complete
        </div>
      </div>

      {/* Question Dots */}
      <div className="flex items-center justify-center space-x-2 pt-2">
        {Array.from({ length: total }, (_, index) => {
          const questionNumber = index + 1
          const isCurrent = questionNumber === current
          const isAnswered = index < answered
          
          return (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                isCurrent
                  ? 'bg-blue-600 ring-2 ring-blue-200'
                  : isAnswered
                  ? 'bg-green-500'
                  : 'bg-slate-300'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}

export default QuizProgress