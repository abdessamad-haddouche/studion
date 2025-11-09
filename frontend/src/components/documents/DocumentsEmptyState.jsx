/**
 * PATH: src/components/documents/DocumentsEmptyState.jsx
 * Documents Empty State Component - FULL CODE
 * 
 * ✅ FEATURES:
 * - Engaging empty state with upload CTA
 * - Sample documents suggestions
 * - Tutorial and help links
 * - Plan-specific features preview
 * - Getting started guidance
 * - Subscription upgrade prompts
 */

import React from 'react'
import { 
  FileText, 
  Upload, 
  Play,
  BookOpen,
  Brain,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap
} from 'lucide-react'
import Button from '../ui/Button'
import { getDocumentLimits } from './DocumentsPageConfig'

const DocumentsEmptyState = ({
  currentPlan,
  onUploadClick,
  className = ''
}) => {
  const limits = getDocumentLimits(currentPlan)
  const isPaidPlan = currentPlan !== 'free'

  const sampleDocuments = [
    {
      title: 'Machine Learning Basics',
      description: 'Introduction to ML concepts and algorithms',
      type: 'Academic',
      difficulty: 'Beginner'
    },
    {
      title: 'Project Management Guide',
      description: 'Best practices for managing software projects',
      type: 'Business',
      difficulty: 'Intermediate'
    },
    {
      title: 'Data Science Tutorial',
      description: 'Comprehensive guide to data analysis',
      type: 'Research',
      difficulty: 'Advanced'
    }
  ]

  const features = [
    {
      icon: <Brain className="w-5 h-5 text-purple-600" />,
      title: 'AI Analysis',
      description: 'Get instant summaries and key insights',
      available: true
    },
    {
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      title: 'Smart Quizzes',
      description: 'Generate quizzes from your content',
      available: true
    },
    {
      icon: <BookOpen className="w-5 h-5 text-green-600" />,
      title: 'Study Materials',
      description: 'Create flashcards and study guides',
      available: isPaidPlan
    },
    {
      icon: <Zap className="w-5 h-5 text-orange-600" />,
      title: 'Advanced Search',
      description: 'Search across document content',
      available: limits.features.includes('advanced_search')
    }
  ]

  const getStartedSteps = [
    {
      step: 1,
      title: 'Upload Documents',
      description: 'Upload PDFs, Word docs, or text files',
      action: 'Start uploading'
    },
    {
      step: 2,
      title: 'AI Processing',
      description: 'Our AI analyzes and extracts key information',
      action: 'Automatic'
    },
    {
      step: 3,
      title: 'Study & Quiz',
      description: 'Generate quizzes and study materials',
      action: 'Start learning'
    }
  ]

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      
      {/* Main Empty State */}
      <div className="text-center py-16 px-8">
        
        {/* Icon and Title */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <FileText className="w-12 h-12 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Your Document Library Awaits
        </h2>
        
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Upload your first document to unlock AI-powered summaries, quizzes, and study materials. 
          Transform your learning experience with intelligent document analysis.
        </p>

        {/* Primary CTA */}
        <div className="space-y-4 mb-12">
          <Button
            onClick={onUploadClick}
            variant="premium"
            size="lg"
            className="flex items-center space-x-3"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Your First Document</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <p className="text-xs text-slate-500">
            Supports PDF, Word, and text files up to {limits.maxFileSize}MB
          </p>
        </div>

        {/* Features Preview */}
        <div className="bg-slate-50 rounded-xl p-6 mb-12">
          <h3 className="font-semibold text-slate-900 mb-4">What you'll unlock:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  feature.available 
                    ? 'bg-white border border-slate-200' 
                    : 'bg-slate-100 opacity-60'
                }`}
              >
                <div className={`flex-shrink-0 ${!feature.available && 'grayscale'}`}>
                  {feature.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-slate-900 text-sm">
                    {feature.title}
                    {!feature.available && (
                      <Crown className="w-3 h-3 text-amber-500 inline ml-1" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {currentPlan === 'free' && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-2">
                Unlock all features with a Premium plan
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = '/pricing'}
                className="flex items-center space-x-1"
              >
                <Crown className="w-3 h-3" />
                <span>View Plans</span>
              </Button>
            </div>
          )}
        </div>

        {/* Getting Started Steps */}
        <div className="text-left max-w-2xl mx-auto mb-12">
          <h3 className="font-semibold text-slate-900 mb-6 text-center">How it works:</h3>
          
          <div className="space-y-4">
            {getStartedSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 mb-1">{step.title}</h4>
                  <p className="text-sm text-slate-600 mb-2">{step.description}</p>
                  <span className="text-xs text-blue-600 font-medium">{step.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Documents */}
        <div className="text-left max-w-2xl mx-auto">
          <h3 className="font-semibold text-slate-900 mb-4 text-center">
            Or try our sample documents:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {sampleDocuments.map((doc, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors cursor-pointer">
                <h4 className="font-medium text-slate-900 text-sm mb-2">{doc.title}</h4>
                <p className="text-xs text-slate-600 mb-3">{doc.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                    {doc.type}
                  </span>
                  <span className="text-xs text-slate-500">{doc.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/samples'}
              className="text-blue-600"
            >
              Browse All Samples
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Help Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-slate-200 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h4 className="font-medium text-slate-900 mb-1">Need help getting started?</h4>
            <p className="text-sm text-slate-600">
              Check out our quick tutorial or browse documentation
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open('/help/tutorial', '_blank')}
              className="flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Watch Tutorial</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/help/docs', '_blank')}
              className="text-slate-600"
            >
              Read Docs
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentsEmptyState