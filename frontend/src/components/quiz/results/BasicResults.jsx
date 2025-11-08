/**
 * PATH: src/components/quiz/results/BasicResults.jsx
 * Basic results for free plan - only correct/incorrect
 */

import React from 'react'
import { CheckCircle, XCircle, Crown } from 'lucide-react'
import Button from '../../ui/Button'

const BasicResults = ({ results }) => {
  if (!results) return null

  return (
    <div className="space-y-6">
      
      {/* Question Results - Simple */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Question Results</h3>
        
        <div className="space-y-3">
          {results.detailedResults.map((result, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 ${
                result.isCorrect 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-medium text-slate-600">
                      Question {index + 1}
                    </span>
                    {result.isCorrect ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Correct</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Incorrect</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-slate-700 text-sm mb-2">{result.question}</p>
                  
                  <div className="text-xs text-slate-600">
                    Points earned: {result.pointsEarned || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {results.summary.correctAnswers}
            </div>
            <div className="text-sm text-green-700">Correct</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {results.summary.incorrectAnswers}
            </div>
            <div className="text-sm text-red-700">Incorrect</div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center">
        <Crown className="w-12 h-12 mx-auto mb-4 opacity-90" />
        <h3 className="text-xl font-bold mb-2">Want Detailed Explanations?</h3>
        <p className="mb-4 opacity-90">
          Upgrade to Basic plan to see answer explanations and improve your learning
        </p>
        <Button
          variant="secondary"
          onClick={() => window.location.href = '/pricing'}
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          Upgrade to Basic - $9.99/month
        </Button>
      </div>
    </div>
  )
}

export default BasicResults