/**
 * PATH: src/pages/analytics/AnalyticsPage.jsx
 * Analytics/Performance Page - Coming Soon Placeholder
 */

import React from 'react'
import Layout from '../../components/layout/Layout'
import { BarChart3, TrendingUp, Target, Award, ArrowLeft, Crown, Sparkles } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const AnalyticsPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Analytics</h1>
            <p className="text-slate-600">Track your learning progress and quiz performance</p>
          </div>

          {/* Coming Soon Banner */}
          <Card className="p-8 text-center mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              🚀 Performance Analytics Coming Soon!
            </h2>
            
            <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
              We're working on detailed analytics to help you track your learning journey. 
              This feature will show quiz performance, progress tracking, and personalized insights.
            </p>

            <div className="flex items-center justify-center space-x-2 text-purple-600 mb-6">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">Premium Feature</span>
            </div>
          </Card>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 opacity-60">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Progress Tracking</h3>
              <p className="text-sm text-slate-600">
                Visual charts showing your quiz scores over time and learning progress across different topics.
              </p>
              <div className="mt-4 text-xs text-green-600 font-medium">Coming Soon</div>
            </Card>

            <Card className="p-6 opacity-60">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Performance Insights</h3>
              <p className="text-sm text-slate-600">
                Detailed analysis of your strengths and areas for improvement with personalized recommendations.
              </p>
              <div className="mt-4 text-xs text-purple-600 font-medium">Coming Soon</div>
            </Card>

            <Card className="p-6 opacity-60">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Achievement System</h3>
              <p className="text-sm text-slate-600">
                Unlock badges and achievements as you reach learning milestones and complete challenges.
              </p>
              <div className="mt-4 text-xs text-orange-600 font-medium">Coming Soon</div>
            </Card>
          </div>

          {/* Current Stats Preview */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Current Performance (Basic View)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 mb-1">-</div>
                <div className="text-sm text-slate-600">Quizzes Completed</div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 mb-1">-%</div>
                <div className="text-sm text-slate-600">Average Score</div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 mb-1">-</div>
                <div className="text-sm text-slate-600">Points Earned</div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 mb-1">-%</div>
                <div className="text-sm text-slate-600">Best Score</div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm text-slate-500">
              📊 Detailed analytics will be available with the upcoming premium features
            </div>
          </Card>

          {/* CTA Section */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg px-6 py-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-purple-900 font-medium">
                Want early access? Upgrade to Premium to get notified when analytics launch!
              </span>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}

export default AnalyticsPage