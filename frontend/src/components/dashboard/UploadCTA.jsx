/**
 * PATH: src/components/dashboard/UploadCTA.jsx
 * Upload Call-to-Action Component
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { Upload, FileText, Sparkles, ArrowRight } from 'lucide-react'
import Button from '../ui/Button'

const UploadCTA = ({ onUploadClick, className = '' }) => {
  const hasDocuments = useSelector(state => state.documents?.hasDocuments)
  const documents = useSelector(state => state.documents?.documents)
  
  const actuallyHasDocuments = documents && documents.length > 0
  
  console.log('🎯 UploadCTA Debug:', { hasDocuments, documentsLength: documents?.length, actuallyHasDocuments })

  if (!actuallyHasDocuments) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Upload Your First Document
          </h3>
          
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Start your AI learning journey! Upload a PDF, Word doc, or text file to get instant summaries and generate smart quizzes.
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="premium" 
              onClick={onUploadClick}
              className="flex items-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Document</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI analysis included</span>
            </div>
          </div>
        </div>
        
        {/* Benefits */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-sm font-medium text-slate-700 mb-1">📄 Smart Analysis</div>
            <div className="text-xs text-slate-600">Instant summaries & key points</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-sm font-medium text-slate-700 mb-1">🧠 Quiz Generation</div>
            <div className="text-xs text-slate-600">Auto-generated questions</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-sm font-medium text-slate-700 mb-1">🏆 Earn Points</div>
            <div className="text-xs text-slate-600">Progress tracking & rewards</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Add New Document</h3>
            <p className="text-sm text-slate-600">Upload another file to analyze</p>
          </div>
        </div>
        
        <Button 
          variant="primary" 
          size="sm"
          onClick={onUploadClick}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload</span>
        </Button>
      </div>
      
      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">
            {documents?.length || 0} document{documents?.length !== 1 ? 's' : ''} uploaded
          </span>
          <div className="flex items-center space-x-1 text-purple-600">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs">AI-powered</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadCTA