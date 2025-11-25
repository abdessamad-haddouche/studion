/**
 * PATH: src/components/dashboard/DocumentsGridWithActions.jsx
 * Uses new DocumentActionCard with Revise/Quiz actions
 */

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { FileText, Plus } from 'lucide-react'
import Button from '../ui/Button'
import DocumentActionCard from '../documents/DocumentActionCard'
import DocumentReviseModal from '../documents/DocumentReviseModal'
import DocumentQuizModal from '../documents/DocumentQuizModal'

const DocumentsGridWithActions = ({ onUploadClick, className = '' }) => {
  const documents = useSelector(state => state.documents?.documents)
  const isLoading = useSelector(state => state.documents?.isLoading)

  // Modal states
  const [reviseModal, setReviseModal] = useState({ isOpen: false, document: null })
  const [quizModal, setQuizModal] = useState({ isOpen: false, document: null })

  // Action handlers
  const handleRevise = (document) => {
    setReviseModal({ isOpen: true, document })
  }

  const handleQuiz = (document) => {
    setQuizModal({ isOpen: true, document })
  }

  const handleDownload = (document) => {
    // Implement download functionality
    window.open(`/api/documents/${document.id}/download`, '_blank')
  }

  const handleShare = (document) => {
    // Implement share functionality
    console.log('Share document:', document.id)
  }

  const handleDelete = async (document) => {
    if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      console.log('Delete document:', document.id)
    }
  }

  const handleStartQuiz = (quizData) => {
    // Close the quiz modal and navigate to quiz page
    setQuizModal({ isOpen: false, document: null })
    
    console.log('Starting quiz with data:', quizData)
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
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center ${className}`}>
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-medium text-slate-700 mb-2">No documents yet</h3>
        <p className="text-slate-500 mb-4">Upload your first document to get started</p>
        <Button 
          variant="primary" 
          onClick={onUploadClick}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </Button>
      </div>
    )
  }

  // Show first 6 documents
  const displayDocuments = documents.slice(0, 6)

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Your Documents</h3>
        <div className="flex items-center space-x-2">
          {documents.length > 6 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/documents'}
            >
              View All ({documents.length})
            </Button>
          )}
          <Button 
            variant="primary" 
            size="sm"
            onClick={onUploadClick}
            className="flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Upload</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayDocuments.map((document) => (
          <DocumentActionCard
            key={document.id}
            document={document}
            onRevise={handleRevise}
            onQuiz={handleQuiz}
            onDownload={handleDownload}
            onShare={handleShare}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      {/* View All Button */}
      {documents.length > 6 && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <Button 
            variant="secondary" 
            onClick={() => window.location.href = '/documents'}
          >
            View All Documents ({documents.length})
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

export default DocumentsGridWithActions