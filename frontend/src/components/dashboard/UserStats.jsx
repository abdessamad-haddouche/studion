/**
 * PATH: src/components/dashboard/UserStats.jsx
 * Compact User Statistics Component
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react'

const UserStats = ({ className = '' }) => {
  const stats = useSelector(state => state.documents?.stats)
  const isLoading = useSelector(state => state.documents?.isLoading)

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-8 h-8 bg-slate-200 rounded-lg mx-auto mb-2"></div>
                <div className="w-12 h-6 bg-slate-200 rounded mx-auto mb-1"></div>
                <div className="w-16 h-4 bg-slate-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statItems = [
    {
      label: 'Total Documents',
      value: stats?.total || 0,
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      color: 'blue'
    },
    {
      label: 'Processed',
      value: stats?.processed || 0,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      color: 'green'
    },
    {
      label: 'Processing',
      value: stats?.processing || 0,
      icon: <Clock className="w-5 h-5 text-yellow-500" />,
      color: 'yellow'
    },
    {
      label: 'This Week',
      value: stats?.recentUploads || 0,
      icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
      color: 'purple'
    }
  ]

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      <h3 className="font-semibold text-slate-900 mb-4 text-sm">Document Overview</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
              stat.color === 'blue' ? 'bg-blue-50' :
              stat.color === 'green' ? 'bg-green-50' :
              stat.color === 'yellow' ? 'bg-yellow-50' :
              'bg-purple-50'
            }`}>
              {stat.icon}
            </div>
            
            <div className="text-xl font-bold text-slate-900 mb-1">
              {stat.value}
            </div>
            
            <div className="text-xs text-slate-600">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Processing Rate */}
      {stats?.total > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs text-slate-600 mb-2">
            <span>Completion Rate</span>
            <span>{Math.round((stats.processed / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((stats.processed / stats.total) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserStats