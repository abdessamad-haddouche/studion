/**
 * PATH: src/pages/rewards/RewardsPage.jsx
 * Rewards Page - Coming Soon Placeholder
 */

import React from 'react'
import { useSelector } from 'react-redux'
import Layout from '../../components/layout/Layout'
import { Trophy, Gift, Star, ArrowLeft, Crown, Sparkles, Target, Award } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const RewardsPage = () => {
  const user = useSelector(state => state.auth?.user)
  const userPoints = user?.progress?.totalPoints || 0

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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Rewards & Achievements</h1>
            <p className="text-slate-600">Earn points and unlock rewards as you learn</p>
          </div>

          {/* Current Points */}
          <Card className="p-6 mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Your Points Balance</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl font-bold text-purple-700">
                    {userPoints.toLocaleString()}
                  </div>
                  <div className="text-purple-600">points</div>
                </div>
                <p className="text-sm text-purple-600 mt-1">
                  Earn points by completing quizzes and use them for course discounts!
                </p>
              </div>
              
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Coming Soon Banner */}
          <Card className="p-8 text-center mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Gift className="w-10 h-10 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              🎁 Enhanced Rewards System Coming Soon!
            </h2>
            
            <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
              We're building an exciting rewards system with achievements, badges, 
              course discounts, and exclusive premium content unlocks.
            </p>

            <div className="flex items-center justify-center space-x-2 text-purple-600 mb-6">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">Premium Feature</span>
            </div>
          </Card>

          {/* Current Basic Rewards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Points for Course Discounts */}
            <Card className="p-6 border-green-200 bg-green-50">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Course Discounts</h3>
              <p className="text-sm text-slate-600 mb-3">
                Use your {userPoints} points to get discounts on premium courses in our marketplace.
              </p>
              <div className="text-sm text-green-700 font-medium">✅ Available Now</div>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => window.location.href = '/courses'}
              >
                Browse Courses
              </Button>
            </Card>

            {/* Quiz Points */}
            <Card className="p-6 border-blue-200 bg-blue-50">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Quiz Rewards</h3>
              <p className="text-sm text-slate-600 mb-3">
                Earn points for every quiz you complete. Higher scores = more points!
              </p>
              <div className="text-sm text-blue-700 font-medium">✅ Available Now</div>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => window.location.href = '/dashboard'}
              >
                Take Quiz
              </Button>
            </Card>
          </div>

          {/* Coming Soon Features */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
              🚀 Coming Soon Features
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 opacity-60">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Achievement Badges</h4>
                <p className="text-sm text-slate-600">
                  Unlock special badges for completing learning milestones and challenges.
                </p>
                <div className="mt-4 text-xs text-orange-600 font-medium">Coming Soon</div>
              </Card>

              <Card className="p-6 opacity-60">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Exclusive Rewards</h4>
                <p className="text-sm text-slate-600">
                  Redeem points for premium features, bonus content, and special perks.
                </p>
                <div className="mt-4 text-xs text-green-600 font-medium">Coming Soon</div>
              </Card>

              <Card className="p-6 opacity-60">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Leaderboards</h4>
                <p className="text-sm text-slate-600">
                  Compete with other learners and climb the global learning leaderboard.
                </p>
                <div className="mt-4 text-xs text-purple-600 font-medium">Coming Soon</div>
              </Card>
            </div>
          </div>

          {/* How to Earn Points */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">How to Earn Points</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">+</span>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Complete Quiz</div>
                  <div className="text-sm text-slate-600">Earn 10-50 points per quiz based on score</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">+</span>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Perfect Score</div>
                  <div className="text-sm text-slate-600">Bonus points for 100% quiz scores</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg opacity-60">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">+</span>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Daily Streak</div>
                  <div className="text-sm text-slate-600">Coming Soon: Bonus for consecutive days</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg opacity-60">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold">+</span>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Course Completion</div>
                  <div className="text-sm text-slate-600">Coming Soon: Major points for finishing courses</div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg px-6 py-4">
              <Trophy className="w-5 h-5 text-purple-600" />
              <span className="text-purple-900 font-medium">
                Keep completing quizzes to earn more points and unlock future rewards!
              </span>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}

export default RewardsPage