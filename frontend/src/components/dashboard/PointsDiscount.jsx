/**
 * PATH: src/components/dashboard/PointsDiscount.jsx
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { Trophy, ArrowRight, Sparkles, Brain } from 'lucide-react'

const PointsDiscount = ({ className = '' }) => {
  const user = useSelector(state => state.auth?.user)
  const currentPoints = user?.progress?.totalPoints || 0
  
  const discountTiers = [
    { points: 1000, discount: '5%' },
    { points: 2000, discount: '10%' },
    { points: 3000, discount: '15%' }
  ]
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
      <h3 className="font-semibold text-slate-900 mb-3 text-sm text-center">Points & Discounts</h3>
      
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <p className="text-xs text-slate-600">
            Study smart, save money
          </p>
        </div>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Solve quizzes to earn points • Use points for course discounts • 1 point per correct answer
        </p>
      </div>
      
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Current Points */}
          <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 text-center">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-medium text-slate-900 text-sm mb-1">
              {currentPoints} Points
            </h4>
            <p className="text-xs text-slate-600">
              Current Balance
            </p>
          </div>

          {/* Discount Tiers */}
          {discountTiers.map((tier, index) => {
            const isUnlocked = currentPoints >= tier.points
            return (
              <div 
                key={index}
                className={`p-4 rounded-lg border text-center transition-all ${
                  isUnlocked 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 mx-auto ${
                  isUnlocked 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className={`font-medium text-sm mb-1 ${
                  isUnlocked ? 'text-green-900' : 'text-slate-600'
                }`}>
                  {tier.discount} OFF
                </h4>
                <p className="text-xs text-slate-500">
                  {tier.points} points
                </p>
                {isUnlocked && (
                  <div className="mt-1 text-xs text-green-600 font-medium">
                    ✓ Unlocked
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Centered browse button */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
        <button 
          onClick={() => window.location.href = '/courses'}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl text-sm"
        >
          <span>Browse Courses</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default PointsDiscount