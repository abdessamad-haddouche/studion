/**
 * PATH: src/components/documents/DocumentsGrid.jsx
 * ENHANCED - Added ProcessingNotification + Auto-refresh polling + localStorage persistence
 */

import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Brain, 
  Download,
  Trash2,
  Edit3,
  Check,
  X,
  MoreHorizontal,
  Calendar,
  HardDrive,
  Search,
  Sparkles,
  Zap
} from 'lucide-react'
import Button from '../ui/Button'
import DocumentReviseModal from './DocumentReviseModal'
import QuizSelectionModal from '../quiz/modals/QuizSelectionModal'
import { canAccessFeature } from './DocumentsPageConfig'
import { documentsAPI } from '../../services/api'
import { fetchUserDocuments } from '../../store/slices/documentsSlice'
import ProcessingNotification from '../dashboard/ProcessingNotification' // ✅ IMPORT FROM DASHBOARD
import toast from 'react-hot-toast'

const DocumentsGrid = ({
  documents = [],
  selectedDocuments = [],
  onDocumentSelect,
  onDocumentUpdate,
  onDocumentDelete,
  onUploadClick,
  searchState = {},
  filters = {},
  currentSearchTerm = '',
  onClearSearch,
  onClearFilters,
  totalDocumentsCount = 0,
  className = ''
}) => {
  const dispatch = useDispatch()
  
  // Modal states
  const [reviseModal, setReviseModal] = useState({ isOpen: false, document: null })
  const [quizModal, setQuizModal] = useState({ isOpen: false, document: null })
  
  // Edit/Delete states
  const [editingDocument, setEditingDocument] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ✅ ENHANCED: Processing tracking with localStorage persistence
  const [processingStartTimes, setProcessingStartTimes] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('documents_processing_times')
    return saved ? JSON.parse(saved) : {}
  })

  // ✅ NEW: Processing notification state (SAME AS DASHBOARD)
  const [processingDocuments, setProcessingDocuments] = useState([])
  const [showProcessingNotification, setShowProcessingNotification] = useState(false)

  // ✅ ENHANCED: Auto-refresh polling for processing documents
  useEffect(() => {
    const hasProcessingDocs = documents && documents.some(doc => 
      doc.status === 'processing' || doc.status === 'pending'
    )

    if (!hasProcessingDocs) return

    console.log('🔄 Starting auto-refresh polling for processing documents')

    const pollInterval = setInterval(async () => {
      try {
        console.log('📡 Polling for document status updates...')
        await dispatch(fetchUserDocuments({ limit: 1000 }))
      } catch (error) {
        console.error('❌ Polling error:', error)
      }
    }, 15000) // Poll every 15 seconds

    return () => {
      console.log('🛑 Stopping auto-refresh polling')
      clearInterval(pollInterval)
    }
  }, [documents, dispatch])

  // ✅ ENHANCED: Track processing documents + save to localStorage
  useEffect(() => {
    if (documents) {
      const newStartTimes = { ...processingStartTimes }
      let hasNewProcessing = false
      let completedDocuments = []

      documents.forEach(doc => {
        const docId = doc.id || doc._id
        
        if ((doc.status === 'processing' || doc.status === 'pending') && !newStartTimes[docId]) {
          // New processing document
          newStartTimes[docId] = Date.now()
          hasNewProcessing = true
          console.log('▶️ Started tracking processing for:', doc.title)
        } else if (doc.status === 'completed' && newStartTimes[docId]) {
          // Document completed processing
          completedDocuments.push(doc)
          delete newStartTimes[docId]
          console.log('✅ Document processing completed:', doc.title)
        } else if (doc.status === 'failed' && newStartTimes[docId]) {
          // Document failed processing
          delete newStartTimes[docId]
          console.log('❌ Document processing failed:', doc.title)
        }
      })

      // Show completion toasts
      completedDocuments.forEach(doc => {
        toast.success(`🎉 "${doc.title}" processing completed! Ready for quizzes.`, {
          duration: 5000,
          icon: '✅'
        })
      })

      if (hasNewProcessing || Object.keys(newStartTimes).length !== Object.keys(processingStartTimes).length) {
        setProcessingStartTimes(newStartTimes)
        
        // ✅ Save to localStorage
        localStorage.setItem('documents_processing_times', JSON.stringify(newStartTimes))
      }

      // ✅ Update processing notification state (SAME AS DASHBOARD)
      const processing = documents.filter(doc => 
        doc.status === 'processing' || doc.status === 'pending'
      )
      
      setProcessingDocuments(processing)
      setShowProcessingNotification(processing.length > 0)
    }
  }, [documents])

  // ✅ ENHANCED: Get processing time elapsed with localStorage persistence
  const getProcessingTimeElapsed = (document) => {
    const docId = document.id || document._id
    const startTime = processingStartTimes[docId]
    if (!startTime) return 0
    return Math.floor((Date.now() - startTime) / 1000)
  }

  // ✅ Get processing estimate (SAME AS DASHBOARD)
  const getProcessingEstimate = (document) => {
    const size = document?.file?.size || 0
    if (size < 1024 * 1024) return 120      // 2 minutes for small PDFs
    if (size < 5 * 1024 * 1024) return 180  // 3 minutes for medium PDFs  
    return 240                              // 4 minutes for large PDFs
  }

  // ✅ Format time (SAME AS DASHBOARD)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  // ✅ NEW: Handle processing notification refresh (SAME AS DASHBOARD)
  const handleProcessingRefresh = async () => {
    try {
      console.log('🔄 Manual refresh triggered from processing notification')
      await dispatch(fetchUserDocuments({ limit: 1000 }))
      
      const stillProcessing = documents?.filter(doc => 
        doc.status === 'processing' || doc.status === 'pending'
      ) || []
      
      if (stillProcessing.length < processingDocuments.length) {
        toast.success('✅ Some documents have finished processing!')
      }
    } catch (error) {
      console.error('❌ Error refreshing from processing notification:', error)
      toast.error('Failed to refresh document status')
    }
  }

  // Get status info for a document
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          text: 'Completed',
          color: 'bg-green-50 text-green-700 border-green-200'
        }
      case 'processing':
        return {
          icon: <Clock className="w-4 h-4 text-blue-500 animate-spin" />,
          text: 'Processing',
          color: 'bg-blue-50 text-blue-700 border-blue-200'
        }
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4 text-yellow-500" />,
          text: 'Pending',
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }
      case 'failed':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          text: 'Failed',
          color: 'bg-red-50 text-red-700 border-red-200'
        }
      default:
        return {
          icon: <FileText className="w-4 h-4 text-slate-400" />,
          text: 'Unknown',
          color: 'bg-slate-50 text-slate-700 border-slate-200'
        }
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Format date
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

  // ✅ ALL YOUR EXISTING FUNCTIONS REMAIN THE SAME
  const startEditing = (document) => {
    setEditingDocument(document.id)
    setEditTitle(document.title || '')
  }

  const cancelEditing = () => {
    setEditingDocument(null)
    setEditTitle('')
  }

  const saveTitle = async (document) => {
    const trimmedTitle = editTitle.trim()
    
    if (!trimmedTitle) {
      toast.error('Title cannot be empty')
      return
    }

    if (trimmedTitle === document.title) {
      cancelEditing()
      return
    }

    setIsUpdating(true)
    
    try {
      const response = await documentsAPI.update(document.id, {
        title: trimmedTitle
      })

      if (response.data.success) {
        toast.success('Document title updated!')
        
        const updatedDocument = {
          ...document,
          title: trimmedTitle
        }
        onDocumentUpdate(updatedDocument)
        
        cancelEditing()
      } else {
        throw new Error(response.data.message || 'Update failed')
      }
    } catch (error) {
      console.error('Failed to update document title:', error)
      toast.error(error.response?.data?.message || 'Failed to update title')
    } finally {
      setIsUpdating(false)
    }
  }

  const startDelete = (document) => {
    setDeleteConfirm(document.id)
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  const confirmDelete = async (document) => {
    setIsDeleting(true)
    
    try {
      const response = await documentsAPI.delete(document.id, { permanent: false })
      
      if (response.data.success) {
        toast.success('Document deleted successfully!')
        onDocumentDelete(document.id)
        setDeleteConfirm(null)
      } else {
        throw new Error(response.data.message || 'Delete failed')
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
      toast.error(error.response?.data?.message || 'Failed to delete document')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRevise = (document) => {
    setReviseModal({ isOpen: true, document })
  }

  const handleQuiz = (document) => {
    if (document.status !== 'completed') {
      toast.info('Document is still being processed. Quiz will be available once processing is complete.')
      return
    }
    setQuizModal({ isOpen: true, document })
  }

  const handleStartQuiz = (quizData) => {
    setQuizModal({ isOpen: false, document: null })
    window.location.href = `/quiz/${quizData.quizId}`
  }

  const handleDownload = (document) => {
    window.open(`/api/documents/${document.id}/download`, '_blank')
  }

  const handleDocumentCheckboxChange = (document, isChecked) => {
    onDocumentSelect(document.id, isChecked)
  }

  const isDocumentSelected = (documentId) => {
    return selectedDocuments.includes(documentId)
  }

  // ✅ EMPTY STATE LOGIC (SAME AS BEFORE)
  if (!documents || documents.length === 0) {
    const hasSearch = currentSearchTerm && currentSearchTerm.trim()
    const hasFilters = filters && Object.keys(filters).some(key => 
      key !== 'search' && filters[key] && filters[key] !== null && filters[key] !== ''
    )
    
    const userHasDocuments = totalDocumentsCount > 0
    
    if (hasSearch || hasFilters) {
      return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center ${className}`}>
          <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No documents found</h3>
          <p className="text-slate-500 mb-6">
            {hasSearch && hasFilters 
              ? `No documents match your search "${currentSearchTerm}" and selected filters.`
              : hasSearch 
              ? `No documents match your search "${currentSearchTerm}".`
              : 'No documents match your selected filters.'
            }
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 mb-3">
              💡 <strong>Search Tips:</strong>
            </p>
            <ul className="text-sm text-blue-600 text-left space-y-1">
              <li>• Try different keywords or shorter terms</li>
              <li>• Check your spelling</li>
              <li>• Remove some filters to broaden results</li>
              <li>• Search by document category or status</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {hasSearch && onClearSearch && (
                <Button 
                  variant="secondary" 
                  onClick={onClearSearch}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Clear search</span>
                </Button>
              )}
              {hasFilters && onClearFilters && (
                <Button 
                  variant="secondary" 
                  onClick={onClearFilters}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Clear filters</span>
                </Button>
              )}
              <Button 
                variant="primary" 
                onClick={onUploadClick}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Upload Another Document</span>
              </Button>
            </div>
          </div>
        </div>
      )
    } else if (!userHasDocuments) {
      return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center ${className}`}>
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Your Document Library Awaits</h3>
          <p className="text-slate-500 mb-6">
            Upload your first document to unlock AI-powered summaries, quizzes, and study materials. Transform your learning experience with intelligent document analysis.
          </p>
          <Button 
            variant="primary" 
            onClick={onUploadClick}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Your First Document</span>
          </Button>
        </div>
      )
    } else {
      return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center ${className}`}>
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No documents to display</h3>
          <p className="text-slate-500 mb-6">
            Something went wrong loading your documents. Try refreshing the page.
          </p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2"
          >
            <span>Refresh Page</span>
          </Button>
        </div>
      )
    }
  }

  return (
    <div className={className}>
      {/* ✅ NEW: Processing Notification (SAME AS DASHBOARD) */}
      {showProcessingNotification && processingDocuments.length > 0 && (
        <ProcessingNotification
          processingDocuments={processingDocuments}
          onRefresh={handleProcessingRefresh}
          className="mb-6"
        />
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {documents.map((document) => {
          const statusInfo = getStatusInfo(document.status)
          const isSelected = isDocumentSelected(document.id)
          const isProcessed = document.status === 'completed'
          const isEditing = editingDocument === document.id
          const isShowingDeleteConfirm = deleteConfirm === document.id
          
          // ✅ ENHANCED: Processing calculations with localStorage persistence
          const elapsed = getProcessingTimeElapsed(document)
          const estimate = getProcessingEstimate(document)
          const progress = document.status === 'processing' ? Math.min((elapsed / estimate) * 100, 95) : 0
          
          return (
            <div 
              key={document.id}
              className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Document Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  {/* Checkbox and Icon */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleDocumentCheckboxChange(document, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`px-2 py-1 rounded-full text-xs border flex items-center space-x-1 ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                  </div>
                </div>

                {/* Document Title with Inline Editing */}
                <div className="mb-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Document title"
                        disabled={isUpdating}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle(document)
                          if (e.key === 'Escape') cancelEditing()
                        }}
                        autoFocus
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => saveTitle(document)}
                          disabled={isUpdating}
                          className="flex items-center space-x-1 text-xs"
                        >
                          {isUpdating ? (
                            <Clock className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          <span>Save</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                          disabled={isUpdating}
                          className="flex items-center space-x-1 text-xs"
                        >
                          <X className="w-3 h-3" />
                          <span>Cancel</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 flex-1">
                        {document.title || 'Untitled Document'}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(document)}
                        className="p-1 ml-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100"
                        title="Edit title"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="space-y-1 text-xs text-slate-500 mt-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(document.createdAt)}</span>
                    </div>
                    
                    {document.file?.size && (
                      <div className="flex items-center space-x-1">
                        <HardDrive className="w-3 h-3" />
                        <span>{formatFileSize(document.file.size)}</span>
                      </div>
                    )}
                    
                    {document.classification?.category && (
                      <div className="inline-block">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs">
                          {document.classification.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="px-4 pb-4">
                {isShowingDeleteConfirm ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-3">
                    <p className="text-sm text-red-700 font-medium">
                      Delete "{document.title}"?
                    </p>
                    <p className="text-xs text-red-600">
                      This action cannot be undone.
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => confirmDelete(document)}
                        disabled={isDeleting}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isDeleting ? (
                          <>
                            <Clock className="w-3 h-3 animate-spin mr-1.5" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3 mr-1.5" />
                            Delete
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelDelete}
                        disabled={isDeleting}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Study/Quiz buttons for completed documents */}
                    {isProcessed && (
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
                    )}

                    {/* ✅ ENHANCED: Processing state with auto-refresh */}
                    {document.status === 'processing' && (
                      <div className="space-y-3">
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
                    )}

                    {/* Pending state */}
                    {document.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center space-x-2 text-xs text-yellow-700 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">Queued for Processing</span>
                        </div>
                        <p className="text-xs text-yellow-600">
                          Your document is in the queue. Processing will begin shortly.
                        </p>
                      </div>
                    )}

                    {/* Failed state */}
                    {document.status === 'failed' && (
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
                    )}

                    {/* Edit/delete buttons for ALL documents */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEditing(document)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit title"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => startDelete(document)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
      <DocumentReviseModal
        isOpen={reviseModal.isOpen}
        document={reviseModal.document}
        onClose={() => setReviseModal({ isOpen: false, document: null })}
      />

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