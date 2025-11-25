/**
 * PATH: src/components/quiz/results/AdvancedResults.jsx
 * Quiz Results
 */

import React, { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target,
  BarChart3,
  BookOpen,
  Clock
} from 'lucide-react'
import Button from '../../ui/Button'
import QuestionCard from '../taking/QuestionCard'

const AdvancedResults = ({ results }) => {
  const [activeTab, setActiveTab] = useState('questions')

  if (!results) return null

  const tabs = [
    { id: 'questions', label: 'Question Analysis', icon: BookOpen },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: Brain }
  ]

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'questions' && (
            <QuestionsTab results={results} />
          )}
          
          {activeTab === 'overview' && (
            <OverviewTab results={results} />
          )}
          
          {activeTab === 'performance' && (
            <PerformanceTab results={results} />
          )}
        </div>
      </div>

      {/* Advanced Analytics Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-8 h-8" />
          <h3 className="text-xl font-bold">AI-Powered Analysis</h3>
        </div>
        <p className="opacity-90">
          This advanced analysis uses AI to identify your learning patterns and provide personalized recommendations.
        </p>
      </div>
    </div>
  )
}

const QuestionsTab = ({ results }) => (
  <div className="space-y-6">
    {results.detailedResults.map((result, index) => (
      <div key={index} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
        <QuestionCard
          question={{
            id: result.questionId,
            question: result.question,
            options: result.options || [],
            explanation: result.explanation,
            correctAnswer: result.correctAnswer,
            correctAnswerIndex: result.correctAnswerIndex
          }}
          questionNumber={index + 1}
          questionType="multiple_choice"
          answer={result.userAnswer}
          showExplanations={true}
          showResult={true}
          isCorrect={result.isCorrect}
        />
        
        {/* Enhanced feedback with personalized insights */}
        {result.personalizedFeedback && (
          <div className={`mt-4 p-4 rounded-lg ${
            result.personalizedFeedback.type === 'strength' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <h5 className={`font-medium mb-2 ${
              result.personalizedFeedback.type === 'strength' ? 'text-green-900' : 'text-amber-900'
            }`}>
              {result.personalizedFeedback.type === 'strength' ? '💪 Strength Identified' : '🎯 Improvement Area'}
            </h5>
            <p className={`text-sm ${
              result.personalizedFeedback.type === 'strength' ? 'text-green-800' : 'text-amber-800'
            }`}>
              {result.personalizedFeedback.message}
            </p>
            {result.personalizedFeedback.skillCategory && (
              <div className="mt-2 text-xs text-slate-600">
                Skill: {result.personalizedFeedback.skillCategory} | 
                Topic: {result.personalizedFeedback.topicArea}
              </div>
            )}
          </div>
        )}
      </div>
    ))}
  </div>
)

// Overview Tab Component - NOW SECOND
const OverviewTab = ({ results }) => (
  <div className="space-y-6">
    
    {/* Strengths & Weaknesses */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Strengths */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>Your Strengths</span>
        </h4>
        
        {results.strengths && results.strengths.length > 0 ? (
          <div className="space-y-3">
            {results.strengths.map((strength, index) => (
              <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-green-900 capitalize">
                    {strength.area.replace('_', ' ')}
                  </h5>
                  <span className="text-green-700 font-semibold">
                    {strength.score.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${strength.score}%` }}
                  ></div>
                </div>
                <p className="text-green-800 text-sm mt-2">
                  {strength.correctAnswers} out of {strength.totalQuestions} questions correct
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <p className="text-slate-600">No specific strengths identified in this quiz.</p>
          </div>
        )}
      </div>

      {/* Weaknesses */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <TrendingDown className="w-5 h-5 text-red-600" />
          <span>Areas for Improvement</span>
        </h4>
        
        {results.weaknesses && results.weaknesses.length > 0 ? (
          <div className="space-y-3">
            {results.weaknesses.map((weakness, index) => (
              <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-red-900 capitalize">
                    {weakness.area.replace('_', ' ')}
                  </h5>
                  <span className="text-red-700 font-semibold">
                    {weakness.score.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${weakness.score}%` }}
                  ></div>
                </div>
                <p className="text-red-800 text-sm mt-2">
                  {weakness.correctAnswers} out of {weakness.totalQuestions} questions correct
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">Great job! No major weaknesses found.</p>
          </div>
        )}
      </div>
    </div>

    {/* Performance Metrics */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-blue-600 mb-1">
          {results.accuracy.toFixed(1)}%
        </div>
        <div className="text-sm text-blue-700">Accuracy</div>
      </div>
      
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-green-600 mb-1">
          {results.pointsEarned}
        </div>
        <div className="text-sm text-green-700">Points</div>
      </div>
      
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-purple-600 mb-1">
          {results.durationMinutes}m
        </div>
        <div className="text-sm text-purple-700">Duration</div>
      </div>
      
      <div className="text-center p-4 bg-indigo-50 rounded-lg">
        <Brain className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-indigo-600 mb-1">
          {results.performanceLevel || 'Good'}
        </div>
        <div className="text-sm text-indigo-700">Level</div>
      </div>
    </div>
  </div>
)

const PerformanceTab = ({ results }) => (
  <div className="space-y-6">
    
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
        <Brain className="w-10 h-10 text-purple-600" />
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        🚀 Advanced Performance Analytics Coming Soon!
      </h3>
      
      <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
        We're working on detailed performance analytics including learning patterns, 
        skill progression tracking, and AI-powered insights to enhance your study experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4 opacity-75">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-900 mb-2">Learning Curve Analysis</h4>
          <p className="text-sm text-slate-600">Track your improvement over time with detailed progress charts</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg p-4 opacity-75">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-900 mb-2">Skill Mapping</h4>
          <p className="text-sm text-slate-600">Visualize your knowledge gaps and strengths across topics</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg p-4 opacity-75">
          <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-900 mb-2">Predictive Insights</h4>
          <p className="text-sm text-slate-600">AI recommendations for optimal study paths and timing</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 max-w-2xl mx-auto">
        <h4 className="font-semibold text-purple-900 mb-3">What's Currently Available:</h4>
        <div className="text-left space-y-2 text-sm text-purple-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Basic score and accuracy tracking</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Strengths and weaknesses analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Personalized study recommendations</span>
          </div>
          <div className="flex items-center space-x-2 opacity-60">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Advanced analytics and predictions (Coming Soon)</span>
          </div>
        </div>
      </div>
    </div>

    {/* Current Basic Performance Data */}
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
      <h4 className="font-semibold text-slate-900 mb-4">Current Quiz Performance</h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {results.accuracy?.toFixed(1) || '0'}%
          </div>
          <div className="text-sm text-slate-600">Accuracy</div>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {results.pointsEarned || 0}
          </div>
          <div className="text-sm text-slate-600">Points</div>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {results.durationMinutes || 0}m
          </div>
          <div className="text-sm text-slate-600">Time</div>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg">
          <div className="text-2xl font-bold text-indigo-600 mb-1">
            {results.performanceLevel || 'Good'}
          </div>
          <div className="text-sm text-slate-600">Level</div>
        </div>
      </div>
    </div>
  </div>
)

export default AdvancedResults