/**
 * PATH: src/components/dashboard/DocumentsGrid.jsx
 * Enhanced DocumentsGrid with Premium Processing Indicators
 */

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FileText, CheckCircle, Clock, AlertCircle, BookOpen, Brain, RefreshCw, Sparkles, Zap } from 'lucide-react'
import Button from '../ui/Button'
import DocumentReviseModal from '../documents/DocumentReviseModal'
import QuizSelectionModal from '../quiz/modals/QuizSelectionModal' // ✅ NEW IMPORT
import { fetchUserDocuments } from '../../store/slices/documentsSlice'
import toast from 'react-hot-toast'

const DocumentsGrid = ({ onUploadClick, className = '' }) => {
  const dispatch = useDispatch()
  const documents = useSelector(state => state.documents?.documents)
  const isLoading = useSelector(state => state.documents?.isLoading)

  // Modal states
  const [reviseModal, setReviseModal] = useState({ isOpen: false, document: null })
  const [quizModal, setQuizModal] = useState({ isOpen: false, document: null }) // ✅ UPDATED

  const [refreshing, setRefreshing] = useState(false)
  
  // ✅ NEW: Processing time tracking
  const [processingStartTimes, setProcessingStartTimes] = useState({})

  // ✅ NEW: Track when documents start processing
  useEffect(() => {
    if (documents) {
      const newStartTimes = { ...processingStartTimes }
      let hasNewProcessing = false

      documents.forEach(doc => {
        const docId = doc.id || doc._id
        if ((doc.status === 'processing' || doc.status === 'pending') && !newStartTimes[docId]) {
          newStartTimes[docId] = Date.now()
          hasNewProcessing = true
        } else if (doc.status === 'completed' || doc.status === 'failed') {
          delete newStartTimes[docId]
        }
      })

      if (hasNewProcessing || Object.keys(newStartTimes).length !== Object.keys(processingStartTimes).length) {
        setProcessingStartTimes(newStartTimes)
      }
    }
  }, [documents])

  // Manual refresh function
  const handleManualRefresh = async () => {
    setRefreshing(true)
    try {
      await dispatch(fetchUserDocuments({ limit: 6 })).unwrap()
      toast.success('Documents refreshed!')
    } catch (error) {
      toast.error('Failed to refresh documents')
    } finally {
      setRefreshing(false)
    }
  }

  // Action handlers
  const handleRevise = (document) => {
    setReviseModal({ isOpen: true, document })
  }

  // ✅ UPDATED: Enhanced quiz handler
  const handleQuiz = (document) => {
    console.log('🎯 Quiz button clicked for document:', document.title)
    
    // Check if document is processed
    if (document.status !== 'completed') {
      toast.info('Document is still being processed. Quiz will be available once processing is complete.')
      return
    }
    
    // Open quiz selection modal
    setQuizModal({ isOpen: true, document })
  }

  // ✅ NEW: Handle quiz start from selection modal
  const handleStartQuiz = (quizData) => {
    console.log('🚀 Starting quiz:', quizData)
    setQuizModal({ isOpen: false, document: null })
    
    // Navigate to quiz interface
    window.location.href = `/quiz/${quizData.quizId}`
  }

  // ✅ NEW: Get processing time elapsed
  const getProcessingTimeElapsed = (document) => {
    const docId = document.id || document._id
    const startTime = processingStartTimes[docId]
    if (!startTime) return 0
    return Math.floor((Date.now() - startTime) / 1000)
  }

  // ✅ NEW: Get processing estimate
  const getProcessingEstimate = (document) => {
    const size = document?.file?.size || 0
    if (size < 1024 * 1024) return 120      // 2 minutes for small PDFs
    if (size < 5 * 1024 * 1024) return 180  // 3 minutes for medium PDFs  
    return 240                              // 4 minutes for large PDFs
  }

  // ✅ NEW: Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  // Keep all your existing utility functions...
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Brain className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
        <h3 className="font-semibold text-slate-900 mb-4">Your Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse border border-slate-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-slate-200 rounded-lg mb-3"></div>
              <div className="w-3/4 h-4 bg-slate-200 rounded mb-2"></div>
              <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
        <h3 className="font-semibold text-slate-900 mb-4">Your Documents</h3>
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="font-medium text-slate-700 mb-2">No documents yet</h4>
          <p className="text-slate-500 mb-4">Upload your first document to get started</p>
          <Button 
            variant="primary" 
            size="sm"
            onClick={onUploadClick}
          >
            Upload Document
          </Button>
        </div>
      </div>
    )
  }

  const hasProcessingDocs = documents.some(doc => 
    doc.status === 'processing' || doc.status === 'pending'
  )

  const displayDocuments = documents.slice(0, 6)

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Your Documents ({documents.length})</h3>
        
        <div className="flex items-center space-x-2">
          {hasProcessingDocs && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          )}
          
          {documents.length > 6 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/documents'}
            >
              View All ({documents.length})
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayDocuments.map((document, index) => {
          const elapsed = getProcessingTimeElapsed(document)
          const estimate = getProcessingEstimate(document)
          const progress = document.status === 'processing' ? Math.min((elapsed / estimate) * 100, 95) : 0
          
          return (
            <div 
              key={document.id || document._id || index} 
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs border flex items-center space-x-1 ${getStatusColor(document.status)}`}>
                  {getStatusIcon(document.status)}
                  <span className="capitalize">{document.status || 'unknown'}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="mb-4">
                <h4 className="font-medium text-slate-900 text-sm mb-1 truncate">
                  {document.title || document.name || 'Untitled'}
                </h4>
                <p className="text-xs text-slate-500 mb-2">
                  {document.createdAt ? formatDate(document.createdAt) : 'Unknown date'}
                </p>
                {document.description && (
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {document.description}
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                {document.status === 'completed' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRevise(document)}
                        className="flex items-center justify-center space-x-1 text-xs"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Study</span>
                      </Button>
                      
                      <Button
                        variant="primary" 
                        size="sm"
                        onClick={() => handleQuiz(document)}
                        className="flex items-center justify-center space-x-1 text-xs"
                      >
                        <Brain className="w-3 h-3" />
                        <span>Quiz</span>
                      </Button>
                    </div>
                    
                    <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span>Views: {document.analytics?.viewCount || 0}</span>
                        <span>Quizzes: {document.analytics?.quizGeneratedCount || 0}</span>
                      </div>
                    </div>
                  </>
                ) : document.status === 'processing' ? (
                  <div className="space-y-3">
                    {/* ✅ ENHANCED: Premium processing indicator */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                          <span className="text-xs font-medium text-slate-700">AI Processing</span>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1 text-slate-600">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          <span>Elapsed: {formatTime(elapsed)}</span>
                        </div>
                        <span className="text-slate-500">
                          ~{formatTime(Math.max(0, estimate - elapsed))} left
                        </span>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="text-xs text-blue-700">
                          <div className="flex justify-between items-center">
                            <span>📖 Text extraction</span>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>🧠 AI analysis</span>
                            {progress > 40 ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <Clock className="w-3 h-3 text-blue-500 animate-spin" />
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span>🎯 Quiz generation</span>
                            {progress > 80 ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <Clock className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : document.status === 'pending' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center space-x-2 text-xs text-yellow-700 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">Queued for Processing</span>
                    </div>
                    <p className="text-xs text-yellow-600">
                      Your document is in the queue. Processing will begin shortly.
                    </p>
                  </div>
                ) : document.status === 'failed' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center space-x-2 text-xs text-red-700 mb-1">
                      <AlertCircle className="w-3 h-3" />
                      <span className="font-medium">Processing Failed</span>
                    </div>
                    <p className="text-xs text-red-600 mb-2">
                      There was an issue processing this document.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => toast.info('Please try re-uploading the document or contact support')}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-slate-500">Document uploaded</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {documents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => window.location.href = '/documents'}
          >
            Manage All Documents
          </Button>
        </div>
      )}

      {/* Modals */}
      <DocumentReviseModal
        isOpen={reviseModal.isOpen}
        document={reviseModal.document}
        onClose={() => setReviseModal({ isOpen: false, document: null })}
      />

      {/* ✅ UPDATED: Quiz Selection Modal */}
      <QuizSelectionModal
        isOpen={quizModal.isOpen}
        document={quizModal.document}
        onClose={() => setQuizModal({ isOpen: false, document: null })}
        onStartQuiz={handleStartQuiz}
      />
    </div>
  )
}

export default DocumentsGrid