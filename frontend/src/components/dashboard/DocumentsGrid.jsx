/**
 * PATH: src/components/dashboard/DocumentsGrid.jsx
 * Remove the annoying auto-polling
 */

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FileText, CheckCircle, Clock, AlertCircle, BookOpen, Brain, RefreshCw } from 'lucide-react'
import Button from '../ui/Button'
import DocumentReviseModal from '../documents/DocumentReviseModal'
import DocumentQuizModal from '../documents/DocumentQuizModal'
import { fetchUserDocuments } from '../../store/slices/documentsSlice'

const DocumentsGrid = ({ onUploadClick, className = '' }) => {
  const dispatch = useDispatch()
  const documents = useSelector(state => state.documents?.documents)
  const isLoading = useSelector(state => state.documents?.isLoading)

  // Modal states
  const [reviseModal, setReviseModal] = useState({ isOpen: false, document: null })
  const [quizModal, setQuizModal] = useState({ isOpen: false, document: null })
  const [refreshing, setRefreshing] = useState(false) // ✅ ADD: Manual refresh state

  // ✅ REMOVE: The annoying auto-polling useEffect
  // We'll replace it with manual refresh

  // ✅ ADD: Manual refresh function
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

  const handleQuiz = (document) => {
    setQuizModal({ isOpen: true, document })
  }

  const handleStartQuiz = (quizData) => {
    setQuizModal({ isOpen: false, document: null })
    console.log('Starting quiz:', quizData)
  }

  // Keep your existing utility functions...
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
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

  // ✅ CHANGE: Update the render condition
  if (!documents || documents.length === 0) {
    console.log('📄 DocumentsGrid - No documents detected')
    console.log('📄 Documents array:', documents)
    console.log('📄 Documents length:', documents?.length)
    
    // ✅ ONLY return null if we're sure there are no documents AND not loading
    if (!isLoading && (!documents || documents.length === 0)) {
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
    
    // ✅ If loading or uncertain state, show loading
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
        <h3 className="font-semibold text-slate-900 mb-4">Your Documents</h3>
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-500 text-sm">Loading documents...</p>
        </div>
      </div>
    )
  }

  // Check if any documents are processing
  const hasProcessingDocs = documents.some(doc => 
    doc.status === 'processing' || doc.status === 'pending'
  )

  const displayDocuments = documents.slice(0, 6)

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Your Documents ({documents.length})</h3>
        
        <div className="flex items-center space-x-2">
          {/* ✅ ADD: Manual refresh button */}
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

      {/* ✅ ADD: Processing notification */}
      {hasProcessingDocs && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-800">
              Documents are being processed by AI. Refresh to see updates.
            </span>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            Refresh Now
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayDocuments.map((document, index) => (
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
                <div className="text-center py-2">
                  <div className="flex items-center justify-center space-x-2 text-xs text-blue-600 mb-2">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>AI Processing...</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-slate-500">Document uploaded</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
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

      <DocumentQuizModal
        isOpen={quizModal.isOpen}
        document={quizModal.document}
        onClose={() => setQuizModal({ isOpen: false, document: null })}
        onStartQuiz={handleStartQuiz}
      />
    </div>
  )
}

export default DocumentsGrid