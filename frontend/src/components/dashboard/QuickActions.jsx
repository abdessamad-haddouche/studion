/**
 * PATH: src/components/dashboard/QuickActions.jsx
 * Quick Actions Component - Common dashboard shortcuts
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { Upload, BookOpen, Trophy, Settings, HelpCircle, BarChart3 } from 'lucide-react'
import Button from '../ui/Button'

const QuickActions = ({ onUploadClick, className = '' }) => {
  const hasDocuments = useSelector(state => state.documents?.hasDocuments)
  const user = useSelector(state => state.auth?.user)

  // Different actions based on user state
  const getActions = () => {
    if (hasDocuments === false) {
      // New user actions
      return [
        {
          title: "Upload Document",
          description: "Start with your first document",
          icon: <Upload className="w-5 h-5" />,
          action: onUploadClick,
          color: "blue",
          primary: true
        },
        {
          title: "View Tutorial",
          description: "Learn how to use Studion",
          icon: <HelpCircle className="w-5 h-5" />,
          action: () => window.open('/help/getting-started', '_blank'),
          color: "green",
          primary: false
        },
        {
          title: "Explore Samples",
          description: "Try pre-loaded examples",
          icon: <BookOpen className="w-5 h-5" />,
          action: () => window.location.href = '/samples',
          color: "purple",
          primary: false
        }
      ]
    } else {
      // Existing user actions
      return [
        {
          title: "Upload Document",
          description: "Add new material to analyze",
          icon: <Upload className="w-5 h-5" />,
          action: onUploadClick,
          color: "blue",
          primary: true
        },
        {
          title: "View Analytics",
          description: "Track your progress",
          icon: <BarChart3 className="w-5 h-5" />,
          action: () => window.location.href = '/analytics',
          color: "green",
          primary: false
        },
        {
          title: "Browse Courses",
          description: "Explore premium content",
          icon: <BookOpen className="w-5 h-5" />,
          action: () => window.location.href = '/courses',
          color: "purple",
          primary: false
        },
        {
          title: "View Rewards",
          description: `${user?.progress?.totalPoints || 0} points earned`,
          icon: <Trophy className="w-5 h-5" />,
          action: () => window.location.href = '/rewards',
          color: "yellow",
          primary: false
        }
      ]
    }
  }

  const actions = getActions()

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      <h3 className="font-semibold text-slate-900 mb-4 text-sm">Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`p-4 rounded-lg border transition-all text-left hover:shadow-md ${
              action.primary 
                ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
              action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              action.color === 'green' ? 'bg-green-100 text-green-600' :
              action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
              action.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
              'bg-slate-100 text-slate-600'
            }`}>
              {action.icon}
            </div>
            
            <h4 className="font-medium text-slate-900 text-sm mb-1">
              {action.title}
            </h4>
            
            <p className="text-xs text-slate-600">
              {action.description}
            </p>
          </button>
        ))}
      </div>
      
      {/* Settings Link */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <button 
          onClick={() => window.location.href = '/settings'}
          className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>
    </div>
  )
}

export default QuickActions