/**
 * PATH: src/components/quiz/taking/QuestionCard.jsx
 * Individual question display with different question types
 */

import React from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'
import TrueFalseQuestion from './TrueFalseQuestion'
import MultipleChoiceQuestion from './MultipleChoiceQuestion'

const QuestionCard = ({ 
  question, 
  questionNumber, 
  questionType, 
  answer, 
  onAnswerChange, 
  showExplanations = false,
  showResult = false,
  isCorrect = null 
}) => {

  const renderQuestion = () => {
    const commonProps = {
      question,
      answer,
      onAnswerChange,
      showResult,
      isCorrect
    }

    switch (questionType) {
      case 'true_false':
        return <TrueFalseQuestion {...commonProps} />
      case 'multiple_choice':
        return <MultipleChoiceQuestion {...commonProps} />
      default:
        return <MultipleChoiceQuestion {...commonProps} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-start space-x-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 font-semibold text-sm">{questionNumber}</span>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-slate-900 leading-relaxed">
            {question.question}
          </h3>
          
          {/* Question Type Badge */}
          <div className="mt-2 inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
            {questionType === 'true_false' ? 'True / False' : 'Multiple Choice'}
          </div>
        </div>

        {/* Result Indicator (for results view) */}
        {showResult && isCorrect !== null && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isCorrect ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
        )}
      </div>

      {/* Question Content */}
      <div className="ml-12">
        {renderQuestion()}
      </div>

      {/* Explanation (for results or premium users) */}
      {showExplanations && question.explanation && (showResult || answer) && (
        <div className="ml-12 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Answer feedback (shown after answering in quiz) */}
      {answer && !showResult && isCorrect !== null && (
        <div className={`ml-12 p-3 rounded-lg ${
          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {isCorrect ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              isCorrect ? 'text-green-800' : 'text-red-800'
            }`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionCard