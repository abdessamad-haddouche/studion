/**
 * PATH: src/components/quiz/results/EnhancedResults.jsx
 */

import React from 'react'
import { CheckCircle, XCircle, Info, Crown, Target, BookOpen} from 'lucide-react'
import Button from '../../ui/Button'
import QuestionCard from '../taking/QuestionCard'

const EnhancedResults = ({ results }) => {
  if (!results) return null

  return (
    <div className="space-y-6">
      
      {/* Detailed Question Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Question Analysis</h3>
        
        <div className="space-y-6">
          {results.detailedResults && results.detailedResults.map((result, index) => {
            const hasOptions = result.options && Array.isArray(result.options)
            const isMultipleChoice = hasOptions && result.options.length > 2
            const questionType = isMultipleChoice ? 'multiple_choice' : 'true_false'
            
            const questionOptions = hasOptions ? result.options : ['True', 'False']
            
            console.log(`🔍 Question ${index + 1} Detection:`, {
              hasOptions,
              optionsLength: result.options?.length,
              questionType,
              options: questionOptions
            })
            
            return (
              <div key={index} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                <QuestionCard
                  question={{
                    id: result.questionId,
                    question: result.question,
                    options: questionOptions,
                    explanation: result.explanation,
                    correctAnswer: result.correctAnswer,
                    correctAnswerIndex: result.correctAnswerIndex
                  }}
                  questionNumber={index + 1}
                  questionType={questionType}
                  answer={result.userAnswer}
                  showExplanations={true}
                  showResult={true}
                  isCorrect={result.isCorrect}
                />
                
                {/* Points breakdown */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-600">
                      Time spent: {Math.round((result.timeSpent || 0) / 1000)}s
                    </span>
                    <span className={`font-medium ${
                      result.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Points: {result.pointsEarned || (result.isCorrect ? 1 : 0)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Performance Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {((results.score || 0) / (results.summary?.totalQuestions || 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700">Accuracy Rate</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600 mb-1">
              {results.summary?.correctAnswers || results.score || 0}
            </div>
            <div className="text-sm text-green-700">Correct Answers</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {results.summary?.totalQuestions || 0}
            </div>
            <div className="text-sm text-purple-700">Total Questions</div>
          </div>
        </div>
      </div>

      {/* Study Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Study Recommendations</h3>
        
        <div className="space-y-3">
          {results.feedback && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Overall Feedback</h4>
                  <p className="text-blue-800 text-sm">
                    {typeof results.feedback === 'string' 
                      ? results.feedback 
                      : results.feedback.overall || 'Great job completing the quiz!'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Basic improvement suggestions */}
          {(results.summary?.incorrectAnswers || 0) > 0 && (
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Areas for Improvement</h4>
              <p className="text-amber-800 text-sm">
                Review the {results.summary.incorrectAnswers} questions you missed and their explanations. 
                Consider retaking the quiz after studying the material again.
              </p>
            </div>
          )}

          {/* Show perfect score message */}
          {(results.summary?.incorrectAnswers || 0) === 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Perfect Score! 🎉</h4>
              <p className="text-green-800 text-sm">
                Excellent work! You answered all questions correctly. You have a strong understanding of this material.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Premium Upgrade CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white text-center">
        <Crown className="w-12 h-12 mx-auto mb-4 opacity-90" />
        <h3 className="text-xl font-bold mb-2">Unlock Advanced Analytics</h3>
        <p className="mb-4 opacity-90">
          Upgrade to Premium to get detailed strengths & weaknesses analysis and personalized study plans
        </p>
        <Button
          variant="secondary"
          onClick={() => window.location.href = '/pricing'}
          className="bg-white text-purple-600 hover:bg-purple-50"
        >
          Upgrade to Premium - $19.99/month
        </Button>
      </div>
    </div>
  )
}

export default EnhancedResults