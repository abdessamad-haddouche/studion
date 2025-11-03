/**
 * PATH: src/components/documents/DocumentActionCard.jsx
 * Document Action Card - Shows available actions for a document
 */

import React from 'react'
import { 
  BookOpen, 
  Brain, 
  Download, 
  Share2, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText 
} from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { 
  documentActionsConfig, 
  getAvailableActions,
  DOCUMENT_ACTIONS 
} from './DocumentActionsConfig'

const DocumentActionCard = ({ 
  document, 
  onRevise, 
  onQuiz, 
  onDownload, 
  onShare, 
  onDelete,
  className = '' 
}) => {
  
  // Icon mapping
  const iconMap = {
    BookOpen: <BookOpen className="w-5 h-5" />,
    Brain: <Brain className="w-5 h-5" />,
    Download: <Download className="w-5 h-5" />,
    Share2: <Share2 className="w-5 h-5" />,
    Trash2: <Trash2 className="w-5 h-5" />
  }

  // Action handlers mapping
  const actionHandlers = {
    [DOCUMENT_ACTIONS.REVISE]: onRevise,
    [DOCUMENT_ACTIONS.QUIZ]: onQuiz,
    [DOCUMENT_ACTIONS.DOWNLOAD]: onDownload,
    [DOCUMENT_ACTIONS.SHARE]: onShare,
    [DOCUMENT_ACTIONS.DELETE]: onDelete
  }

  // Get available actions for this document
  const availableActions = getAvailableActions(document.status)

  // Get status info
  const getStatusInfo = () => {
    switch (document.status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          text: 'Ready for study',
          color: 'text-green-600'
        }
      case 'processing':
        return {
          icon: <Clock className="w-4 h-4 text-blue-500 animate-spin" />,
          text: 'Processing...',
          color: 'text-blue-600'
        }
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4 text-yellow-500" />,
          text: 'Pending processing',
          color: 'text-yellow-600'
        }
      case 'failed':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          text: 'Processing failed',
          color: 'text-red-600'
        }
      default:
        return {
          icon: <FileText className="w-4 h-4 text-slate-400" />,
          text: 'Unknown status',
          color: 'text-slate-600'
        }
    }
  }

  const statusInfo = getStatusInfo()
  const isProcessed = document.status === 'completed'

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      {/* Document Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">
            {document.title}
          </h3>
          
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
            {statusInfo.icon}
            <span className={statusInfo.color}>{statusInfo.text}</span>
          </div>
          
          {document.description && (
            <p className="text-xs text-slate-600 mb-2 line-clamp-2">
              {document.description}
            </p>
          )}
          
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span>{new Date(document.createdAt).toLocaleDateString()}</span>
            {document.file?.size && (
              <span>{(document.file.size / 1024 / 1024).toFixed(1)} MB</span>
            )}
            {document.classification?.category && (
              <span className="capitalize">{document.classification.category}</span>
            )}
          </div>
        </div>
        
        {/* Document Icon */}
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Primary Actions (Revise & Quiz) */}
        {isProcessed && (
          <div className="grid grid-cols-2 gap-2">
            {availableActions.includes(DOCUMENT_ACTIONS.REVISE) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onRevise?.(document)}
                className="flex items-center justify-center space-x-2"
              >
                {iconMap[documentActionsConfig[DOCUMENT_ACTIONS.REVISE].icon]}
                <span>{documentActionsConfig[DOCUMENT_ACTIONS.REVISE].label}</span>
              </Button>
            )}
            
            {availableActions.includes(DOCUMENT_ACTIONS.QUIZ) && (
              <Button
                variant="premium"
                size="sm"
                onClick={() => onQuiz?.(document)}
                className="flex items-center justify-center space-x-2"
              >
                {iconMap[documentActionsConfig[DOCUMENT_ACTIONS.QUIZ].icon]}
                <span>{documentActionsConfig[DOCUMENT_ACTIONS.QUIZ].label}</span>
              </Button>
            )}
          </div>
        )}
        
        {/* Processing State */}
        {document.status === 'processing' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-blue-700 font-medium">AI is analyzing your document...</p>
            <p className="text-xs text-blue-600 mt-1">This usually takes 10-30 seconds</p>
          </div>
        )}
        
        {/* Pending State */}
        {document.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-yellow-700 font-medium">Waiting for processing</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {/* trigger processing */}}
              className="mt-2"
            >
              Start Processing
            </Button>
          </div>
        )}
        
        {/* Failed State */}
        {document.status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-700 font-medium">Processing failed</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {/* retry processing */}}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
        
        {/* Secondary Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            {availableActions.includes(DOCUMENT_ACTIONS.DOWNLOAD) && (
              <button
                onClick={() => onDownload?.(document)}
                className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                title={documentActionsConfig[DOCUMENT_ACTIONS.DOWNLOAD].description}
              >
                {iconMap[documentActionsConfig[DOCUMENT_ACTIONS.DOWNLOAD].icon]}
              </button>
            )}
            
            {availableActions.includes(DOCUMENT_ACTIONS.SHARE) && (
              <button
                onClick={() => onShare?.(document)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                title={documentActionsConfig[DOCUMENT_ACTIONS.SHARE].description}
              >
                {iconMap[documentActionsConfig[DOCUMENT_ACTIONS.SHARE].icon]}
              </button>
            )}
          </div>
          
          {/* Delete Action */}
          {availableActions.includes(DOCUMENT_ACTIONS.DELETE) && (
            <button
              onClick={() => onDelete?.(document)}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title={documentActionsConfig[DOCUMENT_ACTIONS.DELETE].description}
            >
              {iconMap[documentActionsConfig[DOCUMENT_ACTIONS.DELETE].icon]}
            </button>
          )}
        </div>
      </div>

      {/* Processing Progress (if available) */}
      {document.status === 'processing' && (
        <div className="mt-3">
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: '60%' }} // This would be dynamic in real implementation
            ></div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default DocumentActionCard